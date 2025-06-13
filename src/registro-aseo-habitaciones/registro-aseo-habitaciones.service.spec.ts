import { Test, TestingModule } from '@nestjs/testing';
import { RegistroAseoHabitacionesService } from './registro-aseo-habitaciones.service';

describe('RegistroAseoHabitacionesService', () => {
  let service: RegistroAseoHabitacionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistroAseoHabitacionesService],
    }).compile();

    service = module.get<RegistroAseoHabitacionesService>(RegistroAseoHabitacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
