import { PartialType } from '@nestjs/swagger';
import { CreateConfiguracionAseoDto } from './create-configuracion-aseo.dto';

export class UpdateConfiguracionAseoDto extends PartialType(
  CreateConfiguracionAseoDto,
) {}
