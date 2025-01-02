import { IsString } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  public nombre: string;
  @IsString()
  public rol: string;
}
