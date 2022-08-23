import { InjectQueue, OnQueueDrained, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { pdfJob } from './pdfJob';
import im from 'imagemagick';
import { promises as fs } from 'fs';
import { twitterJob, Image } from 'src/twitter/twitterJob';
import path from 'path';
import _ from 'lodash';

@Injectable()
@Processor('pdf')
export class ImagemagickService {
  constructor(
    @InjectQueue('twitter') private readonly twitterQueue: Queue<twitterJob>,
  ) {}

  private readonly logger = new Logger(ImagemagickService.name);

  /**
   * @Description Converts downloaded pdf into individual jpeg files
   */
  @Process()
  async processPDF(job: Job<pdfJob>) {
    const IMAGE_DIR = `src/../config/img/`;
    const { pdfPath, baseName } = job.data;
    const outputPath = `${IMAGE_DIR}${baseName}.jpg`;

    this.logger.debug(`Converting ${job.data.pdfPath}`);

    // Promisify the callback of im.convert()
    const data = await new Promise<twitterJob>((resolve, reject) => {
      // Take PDF file and generate individual JPG files
      im.convert(
        [
          '-alpha',
          'remove',
          '-density',
          300,
          '-quality',
          80,
          pdfPath,
          outputPath,
        ],
        async (err) => {
          if (err) {
            console.log(err);
            reject(err);
            throw `Couldn't Process ${pdfPath}`;
          } else {
            // Get every file in Temporary Image Directory
            let files = await fs.readdir(IMAGE_DIR);

            // Append directory into filenames
            files = files.map((file) => {
              return IMAGE_DIR + file;
            });

            // We only want the files that match the source pdf's name
            files = files.filter((file) => {
              return file.includes(baseName);
            });

            const output: twitterJob = {
              report: job.data.report,
              pdfPath: pdfPath,
              images: await this.readImageBuffers(files),
            };

            resolve(output);
          }
        },
      );

      //return images;
    });
    this.logger.verbose(`Cleaning up side effects`);
    data.images.map((path) => {
      fs.rm(path.path);
    });

    this.twitterQueue.add(data, { removeOnComplete: true, removeOnFail: true });
  }

  async readImageBuffers(paths: string[]): Promise<Image[]> {
    // For each file, read and return the buffer data along with the path
    let images = await Promise.all(
      paths.map(async (file) => {
        this.logger.verbose(`Reading ${file} buffer data`);
        const contents: Buffer = await fs.readFile(file);
        return { path: file, buffer: contents };
      }),
    );

    // Since we read the files asynchronously, Reorder the files
    images = _.orderBy(images, (image) => {
      const regex = /\d*.jpg/;
      let res = image.path.match(regex)[0];
      res = path.basename(res, '.jpg');
      return res;
    });

    return images;
  }

  @OnQueueDrained()
  pdfQueueComplete() {
    this.logger.log('All pdfs Have been Converted');
  }
}
