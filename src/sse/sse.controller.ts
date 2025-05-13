import {
  Controller,
  Param,
  ParseIntPipe,
  Sse,
  UseGuards,
} from '@nestjs/common';
import {
  HabitacionesCambio,
  HabitacionSseService,
} from './habitacionSse.service';
import { map, Observable } from 'rxjs';
import { JwtCookieGuardGuard } from 'src/auth/guards/jwt-cookie-guard.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReservaCambio, ReservaSseService } from './reservasSse.service';

@ApiTags('SSE')
@ApiBearerAuth()
@Controller('sse')
@UseGuards(JwtCookieGuardGuard)
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
  @ApiOperation({ summary: 'Stream de cambios de estado de habitaciones' })
  @ApiResponse({
    status: 200,
    description:
      'Stream SSE con actualizaciones de estado de habitaciones en tiempo real',
  })
  @Sse('habitaciones-cambios')
  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @UseGuards(AuthGuard)
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
  @UseGuards(JwtCookieGuardGuard, AuthGuard)
  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  streamReservas(
    @Param('id', ParseIntPipe) habitacionId: number,
  ): Observable<{ data: ReservaCambio }> {
    return this.reservaSseService
      .getStream(habitacionId)
      .pipe(map((cambio) => ({ data: cambio })));
  }
}
