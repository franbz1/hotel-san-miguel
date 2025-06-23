import { PartialType } from '@nestjs/swagger';
import { CreateZonaComunDto } from './create-zona-comun.dto';

export class UpdateZonaComunDto extends PartialType(CreateZonaComunDto) {}
