import { Test, TestingModule } from '@nestjs/testing';
import { ReportesAseoService } from './reportes-aseo.service';

describe('ReportesAseoService', () => {
  let service: ReportesAseoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportesAseoService],
    }).compile();

    service = module.get<ReportesAseoService>(ReportesAseoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
