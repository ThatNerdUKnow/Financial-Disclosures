import { InjectQueue, OnQueueDrained, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { pdfJob } from './pdfJob';
import im from 'imagemagick';
import { promises as fs } from 'fs';

@Injectable()
@Processor('pdf')
export class ImagemagickService {
  constructor(@InjectQueue('pdf') private readonly pdfQueue: Queue) {}

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
    await new Promise((resolve, reject) => {
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

            const output = { pdf: pdfPath, files };

            resolve(output);
          }
        },
      );

      //return images;
    });
  }

  @OnQueueDrained()
  pdfQueueComplete() {
    this.logger.log('All pdfs Have been Converted');
  }
}
