import { Report } from '@prisma/client';

export type twitterJob = {
  report: Report;
  pdfPath: string;
  images: Image[];
};

export type Image = {
  path: string;
  buffer: Buffer;
};
