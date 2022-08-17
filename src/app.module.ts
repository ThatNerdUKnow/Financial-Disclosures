import { Module } from '@nestjs/common';
import { TwitterModule } from './twitter/twitter.module';
import { ImagemagickModule } from './imagemagick/imagemagick.module';
import { DisclosuresModule } from './disclosures/disclosures.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TwitterModule,
    ImagemagickModule,
    DisclosuresModule,
    DatabaseModule,
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_URL,
        port: 6379,
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
