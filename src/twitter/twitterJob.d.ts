import { Report } from '@prisma/client';

export type twitterJob = {
  report: Report;
  pdfPath: string;
  images: string[];
};
