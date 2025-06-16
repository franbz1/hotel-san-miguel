import { Module } from '@nestjs/common';
import { RegistroAseoZonasComunesService } from './registro-aseo-zonas-comunes.service';
import { RegistroAseoZonasComunesController } from './registro-aseo-zonas-comunes.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfiguracionAseoModule } from 'src/configuracion-aseo/configuracion-aseo.module';

@Module({
  controllers: [RegistroAseoZonasComunesController],
  imports: [PrismaModule, AuthModule, ConfiguracionAseoModule],
  providers: [RegistroAseoZonasComunesService],
})
export class RegistroAseoZonasComunesModule {}
