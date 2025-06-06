import { AgrupamientoStrategy } from './agrupamiento.interface';
import { DiaAgrupamientoStrategy } from './dia-agrupamiento.strategy';
import { SemanaAgrupamientoStrategy } from './semana-agrupamiento.strategy';
import { MesAgrupamientoStrategy } from './mes-agrupamiento.strategy';
import { AñoAgrupamientoStrategy } from './año-agrupamiento.strategy';

/**
 * Factory para crear estrategias de agrupamiento según el tipo de período
 */
export class AgrupamientoFactory {
  /**
   * Crea la estrategia apropiada según el tipo de agrupamiento
   * @param agruparPor Tipo de agrupamiento temporal
   * @returns Instancia de la estrategia correspondiente
   */
  static create(
    agruparPor: 'día' | 'semana' | 'mes' | 'año',
  ): AgrupamientoStrategy {
    switch (agruparPor) {
      case 'día':
        return new DiaAgrupamientoStrategy();
      case 'semana':
        return new SemanaAgrupamientoStrategy();
      case 'mes':
        return new MesAgrupamientoStrategy();
      case 'año':
        return new AñoAgrupamientoStrategy();
      default:
        throw new Error(`Tipo de agrupamiento no soportado: ${agruparPor}`);
    }
  }
}
