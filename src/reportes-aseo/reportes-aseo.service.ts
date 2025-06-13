import { Injectable } from '@nestjs/common';
import { CreateReportesAseoDto } from './dto/create-reportes-aseo.dto';
import { UpdateReportesAseoDto } from './dto/update-reportes-aseo.dto';

@Injectable()
export class ReportesAseoService {
  create(createReportesAseoDto: CreateReportesAseoDto) {
    return 'This action adds a new reportesAseo';
  }

  findAll() {
    return `This action returns all reportesAseo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reportesAseo`;
  }

  update(id: number, updateReportesAseoDto: UpdateReportesAseoDto) {
    return `This action updates a #${id} reportesAseo`;
  }

  remove(id: number) {
    return `This action removes a #${id} reportesAseo`;
  }
}
