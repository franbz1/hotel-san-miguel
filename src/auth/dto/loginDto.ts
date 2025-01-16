import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  nombre: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;
}
