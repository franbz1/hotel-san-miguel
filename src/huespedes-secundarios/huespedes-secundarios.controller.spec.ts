import { Test, TestingModule } from '@nestjs/testing';
import { HuespedesSecundariosController } from './huespedes-secundarios.controller';
import { HuespedesSecundariosService } from './huespedes-secundarios.service';

describe('HuespedesSecundariosController', () => {
  let controller: HuespedesSecundariosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HuespedesSecundariosController],
      providers: [HuespedesSecundariosService],
    }).compile();

    controller = module.get<HuespedesSecundariosController>(HuespedesSecundariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
