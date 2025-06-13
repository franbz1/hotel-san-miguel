import { Module } from '@nestjs/common';
import { ReportesAseoService } from './reportes-aseo.service';
import { ReportesAseoController } from './reportes-aseo.controller';

@Module({
  controllers: [ReportesAseoController],
  providers: [ReportesAseoService],
})
export class ReportesAseoModule {}
