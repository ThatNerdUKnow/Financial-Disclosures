import { Report } from '@prisma/client';

export type pdfJob = {
  report: Report;
  pdfPath: string;
};
