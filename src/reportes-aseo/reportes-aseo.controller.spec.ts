import { Test, TestingModule } from '@nestjs/testing';
import { ReportesAseoController } from './reportes-aseo.controller';
import { ReportesAseoService } from './reportes-aseo.service';

describe('ReportesAseoController', () => {
  let controller: ReportesAseoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportesAseoController],
      providers: [ReportesAseoService],
    }).compile();

    controller = module.get<ReportesAseoController>(ReportesAseoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
