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
  @IsString()
  @IsUrl()
  url: string;

  @IsString()
  nombre: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  huespedId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  huespedSecundarioId?: number;

  @Validate(IsValidDocumentoDto)
  get validate() {
    return {
      huespedId: this.huespedId,
      huespedSecundarioId: this.huespedSecundarioId,
    };
  }
}
