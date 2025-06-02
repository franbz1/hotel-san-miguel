import { Module } from '@nestjs/common';
import { TraService } from './tra.service';
import { HttpModule } from '@nestjs/axios';
import { TraController } from './tra.controller';
import { FormulariosModule } from 'src/formularios/formularios.module';
import { HabitacionesModule } from 'src/habitaciones/habitaciones.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  imports: [
    HttpModule,
    FormulariosModule,
    HabitacionesModule,
    AuthModule,
    PrismaModule,
  ],
  providers: [TraService],
  exports: [TraService],
  controllers: [TraController],
})
export class TraModule {}
