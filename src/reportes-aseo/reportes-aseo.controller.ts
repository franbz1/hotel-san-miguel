import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportesAseoService } from './reportes-aseo.service';
import { CreateReportesAseoDto } from './dto/create-reportes-aseo.dto';
import { UpdateReportesAseoDto } from './dto/update-reportes-aseo.dto';

@Controller('reportes-aseo')
export class ReportesAseoController {
  constructor(private readonly reportesAseoService: ReportesAseoService) {}

  @Post()
  create(@Body() createReportesAseoDto: CreateReportesAseoDto) {
    return this.reportesAseoService.create(createReportesAseoDto);
  }

  @Get()
  findAll() {
    return this.reportesAseoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportesAseoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportesAseoDto: UpdateReportesAseoDto) {
    return this.reportesAseoService.update(+id, updateReportesAseoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportesAseoService.remove(+id);
  }
}
