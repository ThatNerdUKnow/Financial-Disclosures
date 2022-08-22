import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ImagemagickService } from './imagemagick.service';

@Module({
  providers: [ImagemagickService],
  imports: [
    BullModule.registerQueue({ name: 'pdf' }),
    BullModule.registerQueue({ name: 'twitter' }),
  ],
})
export class ImagemagickModule {}
