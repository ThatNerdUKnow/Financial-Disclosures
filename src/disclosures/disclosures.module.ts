import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { HouseService } from './house/house.service';
import { SenateService } from './senate/senate.service';

@Module({
  providers: [HouseService, SenateService],
  imports: [DatabaseModule, HttpModule],
})
export class DisclosuresModule {}
