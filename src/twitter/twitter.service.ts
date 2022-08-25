import { OnQueueDrained, OnQueueError, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { BullBuffer, twitterJob } from './twitterJob';
import Twitter from 'twitter';
import _ from 'lodash';
import { MediaResponse } from './mediaResponse';
import { StateService } from './state/state.service';

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

  constructor(private readonly stateService: StateService) {}

  @Process()
  async processTweet(job: Job<twitterJob<BullBuffer>>) {
    this.logger.debug(`Processing job ${job.id}`);
    const media_ids = await this.uploadPhotos(job.data);
    const tweet = await this.sendTweet(job.data, media_ids);
    return tweet;
  }

  async uploadPhotos(job: twitterJob<BullBuffer>): Promise<MediaResponse[]> {
    const buffers: Promise<MediaResponse>[] = job.images.map(async (image) => {
      const imageBuffer: Buffer = Buffer.from(image.buffer.data);
      return new Promise((resolve, reject) => {
        this.twitterClient.post(
          'media/upload',
          { media: imageBuffer },
          (e, media) => {
            if (e) {
              this.logger.error(e);
              reject(e);
            } else if (media) {
              resolve(media as MediaResponse);
            }
          },
        );
      });
    });

    try {
      const mediaIds = await Promise.all(buffers);
      this.logger.debug(`Successfully uploaded media`);
      return mediaIds;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async sendTweet(job: twitterJob<BullBuffer>, mediaIds: MediaResponse[]) {
    const media_chunks = _.chunk(
      mediaIds.map((media) => media.media_id_string),
      4,
    );

    this.logger.verbose(`Posting to twitter`);
    await Promise.all(
      media_chunks.map(async (media_ids, i) => {
        const status: any = { status: '' };
        const { report } = job;
        status.media_ids = media_ids.toString();
        const isMultiPart = media_chunks.length > 1 ? true : false;

        if (isMultiPart) {
          status.status = `[${i + 1}/${media_chunks.length}]\n`;
        }

        const state = this.stateService.getStateFromCode(report.office);

        status.status += `
        ${report.body}
        ${report.name}
        ${report.date}
        Office: #${report.office}
        Filing Type: ${report.type}
        ${state ? '#' + state : ''}
        #usa #congress #financialdisclosure`;

        return new Promise((resolve, reject) => {
          this.twitterClient.post('statuses/update', status, (e, data) => {
            if (e) {
              reject(e);
            } else if (data) {
              resolve(data);
            }
          });
        });
      }),
    );
  }

  @OnQueueDrained()
  QueueComplete() {
    this.logger.log('No More jobs to process');
  }

  @OnQueueError()
  QueueError(job: Job, e: Error) {
    this.logger.error(`Job ${job.id} failed with error ${e}`);
  }
}
