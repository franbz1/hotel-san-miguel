import { ApiProperty } from '@nestjs/swagger';
import { EstadoHabitacion } from '../../common/enums/estadosHbaitacion.enum';
import { TipoHabitacion } from '../../common/enums/tipoHabitacion.enum';

export class Habitacion {
  @ApiProperty({
    description: 'Identificador único de la habitación',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Número de la habitación',
    example: 101,
  })
  numero_habitacion: number;

  @ApiProperty({
    description: 'Tipo de habitación',
    enum: TipoHabitacion,
    example: TipoHabitacion.SENCILLA, // Ajusta el ejemplo según los valores definidos en el enum
  })
  tipo: TipoHabitacion;

  @ApiProperty({
    description: 'Estado de la habitación',
    enum: EstadoHabitacion,
    example: EstadoHabitacion.LIBRE, // Ajusta el ejemplo según los valores definidos en el enum
  })
  estado: EstadoHabitacion;

  @ApiProperty({
    description: 'Precio por noche de la habitación',
    example: 150.5,
  })
  precio_por_noche: number;
}
