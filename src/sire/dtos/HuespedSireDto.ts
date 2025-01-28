import { IsInt, IsString } from 'class-validator';

export class huespedesSireDto {
  @IsInt()
  tipoDeDocumento: number;
  @IsString()
  numeroDeIdentificacion: string;
  @IsInt()
  codigoNacionalidad: number;
  @IsString()
  primerApellido: string;
  @IsString()
  segundoApellido: string;
  @IsString()
  nombreDelExtrangero: string;
  @IsString()
  tipoDeMovimiento: string;
  @IsString()
  fechaDeMovimiento: Date;
  @IsInt()
  lugarDeProcedencia: number;
  @IsInt()
  lugarDeDestino: number;
  @IsString()
  fechaDeNacimiento: Date;
}
