import { Module } from '@nestjs/common';
import { TraService } from './tra.service';
import { HttpModule } from '@nestjs/axios';
import { HabitacionesModule } from 'src/habitaciones/habitaciones.module';
import { TraController } from './tra.controller';
import { DtoFactoryModule } from 'src/common/factories/dto_Factory/dtoFactoryModule.module';

@Module({
  imports: [HttpModule, HabitacionesModule, DtoFactoryModule],
  providers: [TraService],
  exports: [TraService],
  controllers: [TraController],
})
export class TraModule {}
