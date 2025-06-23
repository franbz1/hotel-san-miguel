import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TiposAseo } from '@prisma/client';
import { PaginationDto } from 'src/common/dtos/paginationDto';

export class FiltrosAseoHabitacionDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar habitaciones que requieren aseo hoy',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  requerido_aseo_hoy?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar habitaciones que requieren desinfección hoy',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  requerido_desinfeccion_hoy?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar habitaciones que requieren rotación de colchones',
    type: Boolean,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  requerido_rotacion_colchones?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar habitaciones por tipo de último aseo realizado',
    enum: TiposAseo,
    example: TiposAseo.LIMPIEZA,
  })
  @IsOptional()
  @IsEnum(TiposAseo)
  ultimo_aseo_tipo?: TiposAseo;
}
