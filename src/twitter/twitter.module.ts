import { Module } from '@nestjs/common';
import { TwitterService } from './twitter.service';
import { StateService } from './state/state.service';

@Module({
  providers: [TwitterService, StateService],
})
export class TwitterModule {}
