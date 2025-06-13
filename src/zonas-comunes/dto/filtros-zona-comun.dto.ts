import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TiposAseo } from '../entities/tipos-aseo.enum';
import { PaginationDto } from 'src/common/dtos/paginationDto';

export class FiltrosZonaComunDto extends PaginationDto {
  @ApiProperty({
    description: 'Filtrar por número de piso',
    example: 1,
    required: false,
  })
  @IsNumber(
    {},
    {
      message: 'El piso debe ser un número',
    },
  )
  @Min(0, {
    message: 'El piso debe ser mayor o igual a 0',
  })
  @Max(50, {
    message: 'El piso no puede ser mayor a 50',
  })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  public piso?: number;

  @ApiProperty({
    description: 'Filtrar por zonas que requieren aseo hoy',
    example: true,
    required: false,
  })
  @IsBoolean({
    message: 'Requerido aseo hoy debe ser verdadero o falso',
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsOptional()
  public requerido_aseo_hoy?: boolean;

  @ApiProperty({
    description: 'Filtrar por tipo del último aseo realizado',
    enum: TiposAseo,
    example: TiposAseo.LIMPIEZA,
    required: false,
  })
  @IsEnum(TiposAseo, {
    message: `El tipo de aseo debe ser uno de los siguientes: ${Object.values(
      TiposAseo,
    ).join(', ')}`,
  })
  @IsOptional()
  public ultimo_aseo_tipo?: TiposAseo;
}
