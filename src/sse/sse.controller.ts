import { Controller, Param, ParseIntPipe, Sse } from '@nestjs/common';
import {
  HabitacionesCambio,
  HabitacionSseService,
} from './habitacionSse.service';
import { map, Observable } from 'rxjs';
import { Role } from 'src/usuarios/entities/rol.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ReservaCambio, ReservaSseService } from './reservasSse.service';
import { SkipThrottle } from '@nestjs/throttler';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('sse')
@ApiQuery({ name: 'token', type: String, required: true })
@Controller('sse')
@Auth(Role.ADMINISTRADOR, Role.CAJERO)
export class SseController {
  constructor(
    private readonly habitacionesSseService: HabitacionSseService,
    private readonly reservaSseService: ReservaSseService,
  ) {}

  /**
   * Endpoint de Server-Sent Events que emite cambios de estado de habitaciones en tiempo real.
   * Los clientes pueden suscribirse a este endpoint para recibir actualizaciones automáticas
   * cuando cambia el estado de las habitaciones.
   *
   * @returns Un stream observable de eventos con los cambios de estado de habitaciones
   */
  @SkipThrottle()
  @Sse('habitaciones-cambios')
  @ApiOperation({
    summary: 'Stream de cambios de estado de habitaciones en tiempo real',
    description:
      'Endpoint SSE que emite eventos cuando cambia el estado de las habitaciones. Los clientes se conectan y reciben actualizaciones automáticas.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Stream SSE con actualizaciones de estado de habitaciones en tiempo real',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticación inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos suficientes',
  })
  cambios(): Observable<{ data: HabitacionesCambio[] }> {
    return this.habitacionesSseService.cambiosStream.pipe(
      map((cambios) => ({ data: cambios })),
    );
  }

  /**
   * SSE endpoint para cambios de reservas de una habitación concreta.
   * Clientes se suscriben a /sse/habitaciones/:id/reservas
   */
  @Sse(':id/reservas')
  @ApiOperation({
    summary: 'Stream de cambios de reservas por habitación',
    description:
      'Endpoint SSE que emite eventos cuando cambian las reservas de una habitación específica.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la habitación',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description:
      'Stream SSE con actualizaciones de reservas de la habitación especificada',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticación inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos suficientes',
  })
  streamReservas(
    @Param('id', ParseIntPipe) habitacionId: number,
  ): Observable<{ data: ReservaCambio }> {
    return this.reservaSseService
      .getStream(habitacionId)
      .pipe(map((cambio) => ({ data: cambio })));
  }
}
