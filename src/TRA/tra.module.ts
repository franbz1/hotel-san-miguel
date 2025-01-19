import { Module } from '@nestjs/common';
import { TraService } from './tra.service';
import { HttpModule } from '@nestjs/axios';
import { HabitacionesModule } from 'src/habitaciones/habitaciones.module';

@Module({
  imports: [HttpModule, HabitacionesModule],
  providers: [TraService],
  exports: [TraService],
})
export class TraModule {}
