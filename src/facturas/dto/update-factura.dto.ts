import { PartialType } from '@nestjs/swagger';
import { CreateFacturaDto } from './create-factura.dto';

export class UpdateFacturaDto extends PartialType(CreateFacturaDto) {}
