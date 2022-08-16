import { Module } from '@nestjs/common';
import { SenateService } from './senate.service';

@Module({
  providers: [SenateService]
})
export class SenateModule {}
