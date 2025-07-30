import { Module } from '@nestjs/common';
import { ReportesAseoService } from './reportes-aseo.service';
import { ReportesAseoController } from './reportes-aseo.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfiguracionAseoModule } from 'src/configuracion-aseo/configuracion-aseo.module';

@Module({
  controllers: [ReportesAseoController],
  imports: [PrismaModule, AuthModule, ConfiguracionAseoModule],
  providers: [ReportesAseoService],
})
export class ReportesAseoModule {}
