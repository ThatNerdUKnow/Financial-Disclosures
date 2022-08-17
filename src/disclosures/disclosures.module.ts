import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { HouseService } from './house/house.service';
import { SenateService } from './senate/senate.service';
import { ScraperService } from './scraper/scraper.service';

@Module({
  providers: [HouseService, SenateService, ScraperService],
  imports: [DatabaseModule],
})
export class DisclosuresModule {}
