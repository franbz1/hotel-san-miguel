import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateDocumentoDto } from './create-documento.dto';

/**
 * Representa los datos necesarios para actualizar un documento
 */
export class UpdateDocumentoDto extends PartialType(
  OmitType(CreateDocumentoDto, ['huespedId'] as const),
) {}
