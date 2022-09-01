import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Report } from '@prisma/client';
import { Queue } from 'bull';
import { filter } from 'lodash';
import { Page } from 'puppeteer';
import { sleep } from 'src/functions/sleep';
import { ScraperService } from '../scraper/scraper.service';

@Injectable()
export class SenateService {
  private readonly logger = new Logger(SenateService.name);
  private readonly AGREE_SELECTOR = '#agree_statement';
  private readonly ALL_CHECKBOX_SELECTOR = 'input[type="checkbox"]';
  private readonly SEARCH_BUTTON_SELECTOR = 'button[type="submit"]';
  private readonly TABLE_SELECTOR = '#filedReports';
  private readonly LAST_PAGE_SELECTOR = '.paginate_button[data-dt-idx="6"]';
  private readonly PAGINATE_NEXT_SELECTOR = '.next';
  constructor(
    private readonly scraperService: ScraperService,
    @InjectQueue('download') private readonly downloadQueue: Queue<Report>,
  ) {}

  private page: Page;

  async onApplicationBootstrap() {
    this.getReports();
  }

  @Cron(`0 * * * *`)
  async getReports() {
    try {
      await this.init();
      await this.getAllReports();
    } catch (e) {
      this.logger.error(e);
    }
    //this.page.close();
  }

  async init() {
    this.logger.log('Getting page context');
    this.page = await this.scraperService.browser.newPage();

    this.logger.debug('Navigating to senate disclosure site');

    await this.page.goto(process.env.SENATE_URL, { waitUntil: 'networkidle0' });

    this.logger.verbose('Accepting TOS');

    await this.page.click(this.AGREE_SELECTOR);

    this.logger.verbose('Waiting for navigation');

    try {
      await this.page.waitForNavigation();
    } catch (e) {
      this.logger.error(e);
      if (await this.page.$(this.SEARCH_BUTTON_SELECTOR)) {
        this.logger.warn(`Continuing`);
      } else {
        this.logger.error(`Starting Over`);
        await this.page.close();
        this.getReports();
        return;
      }
    }

    this.logger.verbose('Selecting all report types');
    await this.page.$$eval(this.ALL_CHECKBOX_SELECTOR, (checkBoxes) =>
      checkBoxes.forEach(
        (checkBox: Element) => ((checkBox as HTMLInputElement).checked = true),
      ),
    );

    await this.page.click(this.SEARCH_BUTTON_SELECTOR);

    await this.page.waitForSelector(this.TABLE_SELECTOR, { visible: true });
    await this.page.waitForSelector(this.LAST_PAGE_SELECTOR, { visible: true });
  }

  async getAllReports() {
    const NUM_PAGES = await this.getPages();

    const reports: Report[] = [];
    for (let currentPage = 1; currentPage <= NUM_PAGES; currentPage++) {
      this.logger.verbose(`Scraping page ${currentPage} of ${NUM_PAGES}`);
      reports.concat(await this.getEveryRecordOnPage());
      await this.advancePage();
    }
  }

  async getPages(): Promise<number> {
    const last = await this.page.evaluate((selector) => {
      return document.querySelector(selector).innerHTML;
    }, this.LAST_PAGE_SELECTOR);

    try {
      return Number.parseInt(last);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async getEveryRecordOnPage(): Promise<Array<Report>> {
    const recordsOnPage = await this.page.evaluate(() => {
      const records: Array<Report> = [];
      const recordsPage = document.querySelectorAll(`.odd,.even`);

      recordsPage.forEach((record) => {
        const fields = record.querySelectorAll('td');

        const firstName = fields[0].innerText;
        const lastName = fields[1].innerText;
        const office = fields[2].innerText;
        const type = fields[3].innerText;
        const url = fields[3].querySelector('a').href;
        const date = fields[4].innerText;

        records.push({
          name: `${firstName} ${lastName}`,
          office: office,
          type: type,
          url: url,
          body: 'Senate',
          date: date,
        });
      });
      return records;
    });
    return recordsOnPage;
  }

  async advancePage() {
    await this.page.click(this.PAGINATE_NEXT_SELECTOR);
    await this.delay(1000);
  }

  public readonly delay = (ms: number) =>
    new Promise((res) => setTimeout(res, ms));
}
