import { Module } from '@nestjs/common';
import { ImagemagickService } from './imagemagick.service';

@Module({
  providers: [ImagemagickService]
})
export class ImagemagickModule {}
