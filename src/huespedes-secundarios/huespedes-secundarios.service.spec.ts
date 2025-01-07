import { Test, TestingModule } from '@nestjs/testing';
import { HuespedesSecundariosService } from './huespedes-secundarios.service';

describe('HuespedesSecundariosService', () => {
  let service: HuespedesSecundariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HuespedesSecundariosService],
    }).compile();

    service = module.get<HuespedesSecundariosService>(HuespedesSecundariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
