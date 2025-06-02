import { Transform } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    description: 'Número de página',
    default: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Límite de elementos por página',
    default: 10,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsPositive()
  @Min(1)
  limit?: number = 10;
}

export class PaginationMeta {
  @ApiProperty({ description: 'Página actual' })
  page: number;

  @ApiProperty({ description: 'Límite de elementos por página' })
  limit: number;

  @ApiProperty({ description: 'Total de elementos' })
  total: number;

  @ApiProperty({ description: 'Última página disponible' })
  lastPage: number;
}

export class PaginatedResponse<T> {
  @ApiProperty({ description: 'Array de elementos paginados', isArray: true })
  data: T[];

  @ApiProperty({ description: 'Metadatos de paginación', type: PaginationMeta })
  meta: PaginationMeta;
}
