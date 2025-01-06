import { Test, TestingModule } from '@nestjs/testing';
import { HabitacionesController } from './habitaciones.controller';
import { HabitacionesService } from './habitaciones.service';

describe('HabitacionesController', () => {
  let controller: HabitacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HabitacionesController],
      providers: [HabitacionesService],
    }).compile();

    controller = module.get<HabitacionesController>(HabitacionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
