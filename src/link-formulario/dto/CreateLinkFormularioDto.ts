import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsNumber } from 'class-validator';
import { IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLinkFormularioDto {
  @ApiProperty({
    description: 'Numero de habitacion',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  numeroHabitacion: number;

  @ApiProperty({
    description: 'Fecha de inicio',
    required: true,
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  fechaInicio: Date;

  @ApiProperty({
    description: 'Fecha de fin',
    required: true,
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  fechaFin: Date;

  @ApiProperty({
    description: 'Costo',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  costo: number;
}
