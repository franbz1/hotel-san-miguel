import { Test, TestingModule } from '@nestjs/testing';
import { HuespedesController } from './huespedes.controller';
import { HuespedesService } from './huespedes.service';

describe('HuespedesController', () => {
  let controller: HuespedesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HuespedesController],
      providers: [HuespedesService],
    }).compile();

    controller = module.get<HuespedesController>(HuespedesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
