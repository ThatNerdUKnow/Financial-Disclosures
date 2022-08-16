import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class HouseService {
  private readonly logger = new Logger(HouseService.name);
  constructor(db: PrismaService, http: HttpService) {
    this.logger.log('Ready');
    http.axiosRef.defaults.baseURL = process.env.HOUSE_URL;
  }

  async getReports() {}
}
