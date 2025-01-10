import { EstadoHabitacion } from '../../common/enums/estadosHbaitacion.enum';
import { TipoHabitacion } from '../../common/enums/tipoHabitacion.enum';

export class Habitacion {
  id: number;
  numero_habitacion: number;
  tipo: TipoHabitacion;
  estado: EstadoHabitacion;
  precio_por_noche: number;
}
