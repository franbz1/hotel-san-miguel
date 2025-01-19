import { Module } from '@nestjs/common';
import { RegistroFormularioController } from './registro-formulario.controller';
import { RegistroFormularioService } from './registro-formulario.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { TraModule } from 'src/TRA/tra.module';

@Module({
  controllers: [RegistroFormularioController],
  providers: [RegistroFormularioService],
  imports: [PrismaModule, TraModule],
})
export class RegistroFormularioModule {}
