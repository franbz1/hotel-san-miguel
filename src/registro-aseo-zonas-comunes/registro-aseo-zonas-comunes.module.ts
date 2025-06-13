import { Module } from '@nestjs/common';
import { RegistroAseoZonasComunesService } from './registro-aseo-zonas-comunes.service';
import { RegistroAseoZonasComunesController } from './registro-aseo-zonas-comunes.controller';

@Module({
  controllers: [RegistroAseoZonasComunesController],
  providers: [RegistroAseoZonasComunesService],
})
export class RegistroAseoZonasComunesModule {}
