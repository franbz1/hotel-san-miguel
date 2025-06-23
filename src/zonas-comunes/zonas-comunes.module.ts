import { Module } from '@nestjs/common';
import { ZonasComunesService } from './zonas-comunes.service';
import { ZonasComunesController } from './zonas-comunes.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfiguracionAseoModule } from 'src/configuracion-aseo/configuracion-aseo.module';

@Module({
  imports: [PrismaModule, AuthModule, ConfiguracionAseoModule],
  controllers: [ZonasComunesController],
  providers: [ZonasComunesService],
  exports: [ZonasComunesService],
})
export class ZonasComunesModule {}
