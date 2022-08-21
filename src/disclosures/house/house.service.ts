import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Page } from 'puppeteer';
import { ScraperService } from '../scraper/scraper.service';
import { Report } from '@prisma/client';
import { InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';

@Injectable()
export class HouseService {
  private readonly SEARCH_LINK_SELECTOR = 'li > a[href="#Search"]';
  private readonly SUBMIT_BUTTON_SELECTOR = 'button[type="submit"]';
  private readonly SEARCH_TABLE_SELECTOR = '#search-result table';
  private readonly PAGINATOR_SELECTOR = '#DataTables_Table_0_paginate';

  private readonly logger = new Logger(HouseService.name);
  constructor(
    private readonly scraper: ScraperService,
    @InjectQueue('download') private readonly reportQueue: Queue,
  ) {}

  async onApplicationBootstrap() {
    this.getReports();
  }

  /**
   * @Description Scrapes the public financial disclosures at clerk.house.gov 
   * and queues them for downloading/further processing
   * This is the entry point of the scraper
   */
  @Cron('0 * * * *')
  async getReports() {
    this.logger.log('Retrieving House Disclosures');
    await this.init();
    const records: Array<Report> = await this.paginateAndScrape();
    this.logger.log('Queueing Records for Processing');
    const jobs = records.map(async (record) => {
      return this.reportQueue
        .add(record, {
          jobId: record.url,
        })
        .then((job: Job) => {
          this.logger.verbose(`Queued ${job.opts.jobId}`);
        })
        .catch((e) => {
          this.logger.error(e);
        });
    });
    await Promise.all(jobs);
    this.logger.log(`Queued ${jobs.length} reports for Processing`);
  }

  /**
   * @Description Initializes page context for scraping
   */
  async init() {
    this.logger.log('Getting page context');
    this.page = await this.scraper.browser.newPage();

    this.logger.debug('Navigating to House Disclosure Site');

    await this.page.goto(process.env.HOUSE_URL, { waitUntil: 'networkidle2' });

    this.logger.debug('Getting to disclosure list');
    await this.page.click(this.SEARCH_LINK_SELECTOR);

    this.logger.debug('Waiting for search form');
    await this.page.waitForSelector(this.SUBMIT_BUTTON_SELECTOR);

    await this.page.click(this.SUBMIT_BUTTON_SELECTOR);

    this.logger.debug('Waiting for render');

    await this.page.waitForSelector(this.SEARCH_TABLE_SELECTOR, {
      visible: true,
      timeout: 0,
    });
    this.logger.debug('Disclosure list populated');
  }

  /**
   * @Description Combines every record on all pages into a single array
   * @returns An array of every disclosure on the site
   */
  async paginateAndScrape(): Promise<Array<Report>> {
    this.logger.log('Scraping House Disclosures');

    await this.page.waitForSelector(this.PAGINATOR_SELECTOR);

    let currentPage = 1;
    const lastPage = await this.getLastPage();

    let records: Array<Report> = [];

    while (currentPage <= lastPage) {
      this.logger.verbose(`Scraping page #${currentPage} of ${lastPage}`);
      const pageRecords = await this.getEveryRecordOnPage();
      records = records.concat(pageRecords);
      await this.advancePage();
      currentPage += 1;
    }
    this.page.close();
    this.logger.log('Finished Scraping House Disclosures');
    return records;
  }

  /**
   * @Description We need to work around pagination on the reporting site
   * This function gets us the number of pages available so we know when to stop
   * @returns a number representing how many pages we need to scrape
   */
  async getLastPage(): Promise<number> {
    const lastSelector = this.PAGINATOR_SELECTOR + ' span a';
    const last = await this.page.evaluate((selector) => {
      return document.querySelectorAll(selector)[5].innerHTML;
    }, lastSelector);

    try {
      return Number.parseInt(last);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * @Description Only a handful of records show up per page, this function downloads
   * every record on the current page
   * @returns An array containing every report on the current page
   */
  async getEveryRecordOnPage(): Promise<Array<Report>> {
    const recordsOnPage = await this.page.evaluate((SEARCH_TABLE_SELECTOR) => {
      const records: Array<Report> = [];
      const recordsPage = document.querySelectorAll(
        SEARCH_TABLE_SELECTOR + ' tr.odd,.even',
      );

      recordsPage.forEach((record) => {
        const fields = record.querySelectorAll('td');

        const name = fields[0].innerText;
        const office = fields[1].innerText;
        const year = fields[2].innerText;
        const type = fields[3].innerText;
        const url = fields[0].querySelector('a').href;

        records.push({
          name,
          office,
          date: year,
          type,
          url,
          body: 'House',
        });
      });
      return records;
    }, this.SEARCH_TABLE_SELECTOR);
    return recordsOnPage;
  }

  /**
   * @Description Only a handful of reports show up per page
   * This function is called to advance to the next page so that
   * scraping can continue
   */
  async advancePage(): Promise<void> {
    const nextSelector = this.PAGINATOR_SELECTOR + ' a.next';

    await this.page.evaluate((selector) => {
      const btn = document.querySelector(selector) as HTMLElement;
      btn.click();
    }, nextSelector);
  }

  private page: Page;
}
