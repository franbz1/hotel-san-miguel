import { Test, TestingModule } from '@nestjs/testing';
import { ReservasService } from './reservas.service';

describe('ReservasService', () => {
  let service: ReservasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReservasService],
    }).compile();

    service = module.get<ReservasService>(ReservasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
