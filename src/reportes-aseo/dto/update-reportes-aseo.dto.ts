import { PartialType } from '@nestjs/swagger';
import { CreateReportesAseoDto } from './create-reportes-aseo.dto';

export class UpdateReportesAseoDto extends PartialType(CreateReportesAseoDto) {}
