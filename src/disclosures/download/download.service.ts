import { InjectQueue, OnQueueDrained, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Report } from '@prisma/client';
import { Job, Queue } from 'bull';
import { PrismaService } from 'src/database/prisma/prisma.service';
import axios, { AxiosResponse } from 'axios';
import { promises as fs } from 'fs';
import { pdfJob } from 'src/imagemagick/pdfJob';

@Injectable()
@Processor('download')
export class DownloadService {
  constructor(
    private readonly db: PrismaService,
    @InjectQueue('pdf') private readonly pdfQueue: Queue<pdfJob>,
    private readonly dbService: PrismaService,
  ) {}

  private readonly logger = new Logger(DownloadService.name);

  /**
   * @description Downloads PDF Files from disclosure reports and then queues them for conversion to jpg files
   * @returns
   */
  @Process()
  async process(job: Job<Report>) {
    this.logger.debug(`Processing ${job.id}`);
    const found = await this.db.report.findUnique({
      where: { url: job.data.url },
    });

    if (found) {
      this.logger.warn(`${job.id} already exists`);
      return;
    }
    this.logger.debug(`Downloading ${job.data.url}`);

    if (!found) {
      this.logger.verbose(`${job.id} does not already exist`);

      // Get Buffer of PDF document
      const { data } = (await axios
        .get<Buffer>(job.data.url, {
          responseType: 'arraybuffer',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/pdf',
          },
        })
        .catch((e) => {
          this.logger.error(`Couldn't download ${job.data.url}`, e);
        })) as AxiosResponse;

      // Write PDF to filesystem. PDF Name is base64 encoded from the url, making the name deterministic
      const basename = Buffer.from(job.data.url).toString('base64');
      const id = 'src/../config/pdf/' + basename + '.pdf';

      this.logger.verbose(`Writing ${id} to filesystem`);

      await fs.writeFile(id, data);

      this.logger.verbose(`Queueing pdf Job`);

      // Generate Job data
      const pdfJob: pdfJob = {
        report: job.data,
        pdfPath: id,
        baseName: basename,
      };

      await this.dbService.report.create({ data: job.data });
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
    this.logger.log('All Reports Have been Downloaded');
  }
}
