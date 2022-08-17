import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class ScraperService {
  async onModuleInit() {
    this.logger.log('Starting Browser');
    this.browser = await puppeteer.launch({
      defaultViewport: { width: 1920, height: 1080 },
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async onModuleDestroy() {
    console.log('Closing Broser');
    await this.browser.close();
  }

  private readonly logger = new Logger(ScraperService.name);
  public browser: Browser;
}
