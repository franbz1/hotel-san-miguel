import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { EstadoHabitacion } from 'src/common/enums/estadosHbaitacion.enum';

/**
 * Interfaz que define la estructura de los cambios de estado de las habitaciones
 * que serán emitidos a través del stream SSE.
 */
export interface HabitacionesCambio {
  habitacionId: number;
  nuevoEstado: EstadoHabitacion;
}

/**
 * Servicio que maneja los eventos Server-Sent Events (SSE) para notificar
 * cambios en tiempo real sobre el estado de las habitaciones.
 *
 * Este servicio implementa OnModuleDestroy para gestionar adecuadamente
 * los recursos cuando se cierra la aplicación.
 */
@Injectable()
export class HabitacionSseService implements OnModuleDestroy {
  /**
   * Subject RxJS que maneja el flujo de datos de los cambios en las habitaciones.
   * Este subject es privado para que solo pueda ser modificado internamente.
   */
  private cambios$ = new Subject<HabitacionesCambio[]>();

  /**
   * Observable público que permite a los clientes suscribirse a los cambios
   * de estado de las habitaciones sin poder modificar el flujo de datos.
   *
   * @returns Observable que emite arrays de cambios de estado de habitaciones
   */
  get cambiosStream(): Observable<HabitacionesCambio[]> {
    return this.cambios$.asObservable();
  }

  /**
   * Emite cambios de estado de habitaciones a todos los clientes suscritos.
   *
   * @param cambios Array con los cambios de estado de las habitaciones a emitir
   */
  emitirCambios(cambios: HabitacionesCambio[]) {
    this.cambios$.next(cambios);
  }

  /**
   * Método ejecutado al destruir el módulo.
   * Completa el subject para liberar recursos y evitar memory leaks.
   */
  onModuleDestroy() {
    this.cambios$.complete();
  }
}
