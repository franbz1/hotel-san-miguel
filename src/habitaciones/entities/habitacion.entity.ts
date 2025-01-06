import { EstadoHabitacion } from './estadosHbaitacion.enum';
import { TipoHabitacion } from './tipoHabitacion.enum';

export class Habitacion {
  id: number;
  numero_habitacion: number;
  tipo: TipoHabitacion;
  estado: EstadoHabitacion;
  precio_por_noche: number;
}
