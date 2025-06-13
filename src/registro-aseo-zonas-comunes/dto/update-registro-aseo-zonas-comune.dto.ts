import { PartialType } from '@nestjs/swagger';
import { CreateRegistroAseoZonaComunDto } from './create-registro-aseo-zonas-comune.dto';

export class UpdateRegistroAseoZonaComunDto extends PartialType(
  CreateRegistroAseoZonaComunDto,
) {}
