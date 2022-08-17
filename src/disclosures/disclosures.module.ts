import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { HouseService } from './house/house.service';
import { SenateService } from './senate/senate.service';
import { ScraperService } from './scraper/scraper.service';
import { BullModule } from '@nestjs/bull';

@Module({
  providers: [HouseService, SenateService, ScraperService],
  imports: [DatabaseModule, BullModule.registerQueue({ name: 'report' })],
})
export class DisclosuresModule {}
