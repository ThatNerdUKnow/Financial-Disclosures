import { Module } from '@nestjs/common';
import { HouseService } from './house.service';

@Module({
  providers: [HouseService]
})
export class HouseModule {}
