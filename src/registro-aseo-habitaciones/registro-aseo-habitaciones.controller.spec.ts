import { Test, TestingModule } from '@nestjs/testing';
import { RegistroAseoHabitacionesController } from './registro-aseo-habitaciones.controller';
import { RegistroAseoHabitacionesService } from './registro-aseo-habitaciones.service';

describe('RegistroAseoHabitacionesController', () => {
  let controller: RegistroAseoHabitacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistroAseoHabitacionesController],
      providers: [RegistroAseoHabitacionesService],
    }).compile();

    controller = module.get<RegistroAseoHabitacionesController>(RegistroAseoHabitacionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
