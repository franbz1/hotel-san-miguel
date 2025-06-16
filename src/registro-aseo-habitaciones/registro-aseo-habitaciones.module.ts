import { Module } from '@nestjs/common';
import { RegistroAseoHabitacionesService } from './registro-aseo-habitaciones.service';
import { RegistroAseoHabitacionesController } from './registro-aseo-habitaciones.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfiguracionAseoModule } from 'src/configuracion-aseo/configuracion-aseo.module';

@Module({
  controllers: [RegistroAseoHabitacionesController],
  imports: [PrismaModule, AuthModule, ConfiguracionAseoModule],
  providers: [RegistroAseoHabitacionesService],
})
export class RegistroAseoHabitacionesModule {}
