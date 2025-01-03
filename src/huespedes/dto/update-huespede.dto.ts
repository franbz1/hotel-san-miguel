import { PartialType } from '@nestjs/mapped-types';
import { CreateHuespedeDto } from './create-huespede.dto';

export class UpdateHuespedeDto extends PartialType(CreateHuespedeDto) {}
