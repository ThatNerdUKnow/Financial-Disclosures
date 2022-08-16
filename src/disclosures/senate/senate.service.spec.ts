import { Test, TestingModule } from '@nestjs/testing';
import { SenateService } from './senate.service';

describe('SenateService', () => {
  let service: SenateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SenateService],
    }).compile();

    service = module.get<SenateService>(SenateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
