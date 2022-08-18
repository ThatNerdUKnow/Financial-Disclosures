import { InjectQueue, OnQueueDrained, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Report } from '@prisma/client';
import { Job, Queue } from 'bull';
import { PrismaService } from 'src/database/prisma/prisma.service';
import axios, { AxiosResponse } from 'axios';
import { promises as fs } from 'fs';
import { pdfJob } from 'src/imagemagick/pdfJob';

@Injectable()
@Processor('report')
export class ProcessorService {
  constructor(
    private readonly db: PrismaService,
    @InjectQueue('pdf') private readonly pdfQueue: Queue,
  ) {}
  private readonly logger = new Logger(ProcessorService.name);
  @Process()
  async process(job: Job<Report>) {
    this.logger.verbose(`Processing ${job.id}`);

    const found = await this.db.report.findUnique({
      where: { url: job.data.url },
    });
    if (!found) {
      this.logger.verbose(`${job.id} does not already exist`);
      await this.db.report.create({ data: job.data });
      const {data} = (await axios
        .get<any>(job.data.url, {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/pdf',
          },
        })
        .catch((e) => {
          this.logger.error(`Couldn't download ${job.data.url}`, e);
        })) as AxiosResponse;
      const id =
        'src/../config/pdf/' +
        Buffer.from(job.data.url).toString('base64') +
        '.pdf';
      this.logger.verbose(`Writing ${id} to filesystem`);
      await fs.writeFile(id, data);
      this.logger.verbose(`Queueing pdf Job`);
      const pdfJob: pdfJob = { report: job.data, pdfPath: id };
      this.pdfQueue
        .add(pdfJob, { jobId: job.data.url })
        .then((job: Job) => {
          this.logger.verbose(`Queued ${job.opts.jobId}`);
        })
        .catch((e) => {
          this.logger.error(e);
        });
    }
    return {};
  }

  @OnQueueDrained()
  reportQueueComplete() {
    this.logger.debug('All Reports Have been Processed');
  }
}
