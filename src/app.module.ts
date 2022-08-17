import { Module } from '@nestjs/common';
import { TwitterModule } from './twitter/twitter.module';
import { ImagemagickModule } from './imagemagick/imagemagick.module';
import { DisclosuresModule } from './disclosures/disclosures.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TwitterModule,
    ImagemagickModule,
    DisclosuresModule,
    DatabaseModule,
    ConfigModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
