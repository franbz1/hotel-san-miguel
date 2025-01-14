import { Module } from '@nestjs/common';
import { RegistroFormularioController } from './registro-formulario.controller';
import { RegistroFormularioService } from './registro-formulario.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  controllers: [RegistroFormularioController],
  providers: [RegistroFormularioService],
  imports: [PrismaModule],
})
export class RegistroFormularioModule {}
