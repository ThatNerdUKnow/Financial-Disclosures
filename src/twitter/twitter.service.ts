import { OnQueueDrained, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { twitterJob } from './twitterJob';
import Twitter from 'twitter';

@Injectable()
@Processor('twitter')
export class TwitterService {
  private readonly logger = new Logger(TwitterService.name);
  private readonly twitterClient: Twitter = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  });

  @Process()
  async processTweet(job: Job<twitterJob>) {}

  async postDisclosure() {}

  @OnQueueDrained()
  QueueComplete() {
    this.logger.log('All Tweets have been sent');
  }
}
