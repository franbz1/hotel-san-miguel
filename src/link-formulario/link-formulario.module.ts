import { Module } from '@nestjs/common';
import { LinkFormularioController } from './link-formulario.controller';
import { LinkFormularioService } from './link-formulario.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [LinkFormularioController],
  providers: [LinkFormularioService],
  imports: [PrismaModule, AuthModule],
  exports: [LinkFormularioService],
})
export class LinkFormularioModule {}
