import { Module } from '@nestjs/common';
import { ConfiguracionAseoService } from './configuracion-aseo.service';
import { ConfiguracionAseoController } from './configuracion-aseo.controller';

@Module({
  controllers: [ConfiguracionAseoController],
  providers: [ConfiguracionAseoService],
})
export class ConfiguracionAseoModule {}
