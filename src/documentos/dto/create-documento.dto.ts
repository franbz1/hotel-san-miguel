import { Type } from 'class-transformer';
import { IsNumber, IsString, IsUrl } from 'class-validator';

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
  @Type(() => Number)
  huespedId: number;
}
