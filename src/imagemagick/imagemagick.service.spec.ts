import { Test, TestingModule } from '@nestjs/testing';
import { ImagemagickService } from './imagemagick.service';

describe('ImagemagickService', () => {
  let service: ImagemagickService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImagemagickService],
    }).compile();

    service = module.get<ImagemagickService>(ImagemagickService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
