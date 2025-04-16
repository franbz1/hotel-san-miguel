import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateFormularioDto {
  @IsNotEmpty()
  @IsNumber()
  huespedId: number;

  @IsNotEmpty()
  @IsNumber()
  reservaId: number;

  @IsNotEmpty()
  @IsBoolean()
  SubidoATra: boolean;

  @IsOptional()
  @IsNumber()
  traId?: number;

  @IsNotEmpty()
  @IsBoolean()
  SubidoASire: boolean;
}
