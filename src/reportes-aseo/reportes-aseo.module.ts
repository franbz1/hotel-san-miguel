import { Module } from '@nestjs/common';
import { ReportesAseoService } from './reportes-aseo.service';
import { ReportesAseoController } from './reportes-aseo.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ReportesAseoController],
  imports: [PrismaModule, AuthModule],
  providers: [ReportesAseoService],
})
export class ReportesAseoModule {}
