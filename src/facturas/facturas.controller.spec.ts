import { Test, TestingModule } from '@nestjs/testing';
import { FacturasController } from './facturas.controller';
import { FacturasService } from './facturas.service';

describe('FacturasController', () => {
  let controller: FacturasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacturasController],
      providers: [FacturasService],
    }).compile();

    controller = module.get<FacturasController>(FacturasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
