import { Injectable } from '@nestjs/common';
import { Disclosure } from 'src/common/disclosure.interface';

@Injectable()
export class HouseService {
  async getDisclosures(): Promise<Array<Disclosure>> {
    return [];
  }
}
