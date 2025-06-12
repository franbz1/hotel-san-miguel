import { Module } from '@nestjs/common';
import { ZonasComunesService } from './zonas-comunes.service';
import { ZonasComunesController } from './zonas-comunes.controller';

@Module({
  controllers: [ZonasComunesController],
  providers: [ZonasComunesService],
})
export class ZonasComunesModule {}
