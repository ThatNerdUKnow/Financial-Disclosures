import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { HouseService } from './house/house.service';
import { SenateService } from './senate/senate.service';
import { ScraperService } from './scraper/scraper.service';
import { BullModule } from '@nestjs/bull';
import { DownloadService } from './download/download.service';

@Module({
  providers: [HouseService, SenateService, ScraperService, DownloadService],
  imports: [
    DatabaseModule,
    BullModule.registerQueue({ name: 'download' }),
    BullModule.registerQueue({ name: 'pdf' }),
  ],
})
export class DisclosuresModule {}
