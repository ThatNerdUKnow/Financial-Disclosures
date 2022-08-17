import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Page } from 'puppeteer';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { ScraperService } from '../scraper/scraper.service';
import { Report } from '@prisma/client';

@Injectable()
export class HouseService {
  private readonly SEARCH_LINK_SELECTOR = 'li > a[href="#Search"]';
  private readonly SUBMIT_BUTTON_SELECTOR = 'button[type="submit"]';
  private readonly SEARCH_TABLE_SELECTOR = '#search-result table';
  private readonly PAGINATOR_SELECTOR = '#DataTables_Table_0_paginate';

  private readonly logger = new Logger(HouseService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly scraper: ScraperService,
  ) {}

  async onApplicationBootstrap() {
    this.getReports();
  }

  @Cron('0 * * * * *')
  async getReports() {
    this.logger.log('Retrieving House Disclosures');
    await this.init();
    const records = await this.paginateAndScrape();
    records.forEach(async (record) => {
      try {
        const data = await this.prisma.report.create({
          data: record,
        });
        console.debug(`Recorded report ${record.url}`);
      } catch (e) {
        this.logger.warn(e.message);
      }
    });
  }

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

  async paginateAndScrape() {
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
    return records;
  }

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
  0;
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

  async advancePage(): Promise<void> {
    const nextSelector = this.PAGINATOR_SELECTOR + ' a.next';

    await this.page.evaluate((selector) => {
      const btn = document.querySelector(selector) as HTMLElement;
      btn.click();
    }, nextSelector);
  }

  private page: Page;
}
