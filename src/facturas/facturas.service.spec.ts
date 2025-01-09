import { Test, TestingModule } from '@nestjs/testing';
import { FacturasService } from './facturas.service';

describe('FacturasService', () => {
  let service: FacturasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacturasService],
    }).compile();

    service = module.get<FacturasService>(FacturasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
