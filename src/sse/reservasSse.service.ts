import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { EstadosReserva } from '@prisma/client';
import { Subject, Observable } from 'rxjs';

export interface ReservaCambio {
  reservaId: number;
  nuevoEstado: EstadosReserva;
}

@Injectable()
export class ReservaSseService implements OnModuleDestroy {
  // Map de habitacionId → Subject de cambios de reserva
  private streams = new Map<number, Subject<ReservaCambio>>();

  /** Devuelve el Observable de cambios para una habitación */
  getStream(habitacionId: number): Observable<ReservaCambio> {
    if (!this.streams.has(habitacionId)) {
      this.streams.set(habitacionId, new Subject<ReservaCambio>());
    }
    return this.streams.get(habitacionId).asObservable();
  }

  /** Emite un cambio de reserva en el stream de la habitación */
  emitirCambio(habitacionId: number, cambio: ReservaCambio) {
    const subject = this.streams.get(habitacionId);
    if (subject) {
      subject.next(cambio);
    }
  }

  onModuleDestroy() {
    // Completa todos los subjects para liberar recursos
    for (const subj of this.streams.values()) {
      subj.complete();
    }
  }
}
