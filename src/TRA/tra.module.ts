import { Module } from '@nestjs/common';
import { TraService } from './tra.service';
import { HttpModule } from '@nestjs/axios';
import { HabitacionesModule } from 'src/habitaciones/habitaciones.module';
import { TraController } from './tra.controller';

@Module({
  imports: [HttpModule, HabitacionesModule],
  providers: [TraService],
  exports: [TraService],
  controllers: [TraController],
})
export class TraModule {}
