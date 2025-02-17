import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Validate,
} from 'class-validator';
import { IsValidDocumentoDto } from 'src/common/validators/IsValidDocumentoDto';

/**
 * Representa los datos necesarios para crear un documento
 */
export class CreateDocumentoDto {
  @ApiProperty({
    description: 'URL del documento',
    example: 'https://example.com/archivo.pdf',
  })
  @IsString()
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'Nombre del documento',
    example: 'Contrato.pdf',
  })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({
    description: 'Identificador del huésped asociado al documento',
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  huespedId?: number;

  @ApiPropertyOptional({
    description: 'Identificador del huésped secundario asociado al documento',
    example: 20,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  huespedSecundarioId?: number;

  /**
   * Este getter permite validar la combinación de identificadores del documento.
   */
  @Validate(IsValidDocumentoDto)
  get validate() {
    return {
      huespedId: this.huespedId,
      huespedSecundarioId: this.huespedSecundarioId,
    };
  }
}
