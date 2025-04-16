import { PartialType } from '@nestjs/swagger';
import { CreateFormularioDto } from './create-formulario.dto';

export class UpdateFormularioDto extends PartialType(CreateFormularioDto) {}
