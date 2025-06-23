import { Module } from '@nestjs/common';
import { ConfiguracionAseoService } from './configuracion-aseo.service';
import { ConfiguracionAseoController } from './configuracion-aseo.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ConfiguracionAseoController],
  imports: [PrismaModule, AuthModule],
  providers: [ConfiguracionAseoService],
  exports: [ConfiguracionAseoService],
})
export class ConfiguracionAseoModule {}
