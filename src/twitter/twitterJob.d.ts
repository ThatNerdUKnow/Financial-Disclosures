import { Report } from '@prisma/client';

export type TwitterJobType = Buffer | BullBuffer;

export type twitterJob<TwitterJobType> = {
  report: Report;
  pdfPath: string;
  images: Image<TwitterJobType>[];
};

export type Image<TwitterJobType> = {
  path: string;
  buffer: TwitterJobType;
};

export type BullBuffer = {
  type: 'Buffer';
  data: number[];
};
