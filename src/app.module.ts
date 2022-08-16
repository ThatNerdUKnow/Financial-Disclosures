import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TwitterModule } from './twitter/twitter.module';
import { HouseModule } from './disclosures/house/house.module';
import { SenateModule } from './disclosures/senate/senate.module';
import { ImagemagickModule } from './imagemagick/imagemagick.module';
import { House.Service.TsService } from './disclosures/house.service.ts/house.service.ts.service';

@Module({
  imports: [TwitterModule, HouseModule, SenateModule, ImagemagickModule],
  controllers: [AppController],
  providers: [AppService, House.Service.TsService],
})
export class AppModule {}
