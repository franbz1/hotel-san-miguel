import { Module } from '@nestjs/common';
import { FormulariosService } from './formularios.service';
import { FormulariosController } from './formularios.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  controllers: [FormulariosController],
  providers: [FormulariosService],
  imports: [PrismaModule, AuthModule],
  exports: [FormulariosService],
})
export class FormulariosModule {}
