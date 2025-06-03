import { Controller, Get, UseGuards } from '@nestjs/common';
import { CronService } from './cron.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Role } from 'src/usuarios/entities/rol.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  AUTH_INVALID_RESPONSE,
  PERMISSIONS_RESPONSE,
} from 'src/common/swagger/pagination-responses';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('cron')
@ApiBearerAuth()
@Auth(Role.ADMINISTRADOR)
@UseGuards(AuthGuard)
@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  // ================================================================
  // MANUAL - Ejecutar actualización manual de estados de habitaciones
  // ================================================================
  @Get('marcar-estados-habitaciones')
  @ApiOperation({
    summary: 'Ejecutar manualmente la actualización de estados de habitaciones',
    description:
      'Ejecuta el proceso que normalmente corre cada minuto para actualizar los estados de las habitaciones según sus reservas y marca como finalizadas las reservas vencidas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen de habitaciones y reservas actualizadas por estado',
    schema: {
      type: 'object',
      properties: {
        habitaciones: {
          type: 'object',
          properties: {
            near: {
              type: 'number',
              description: 'Cantidad de habitaciones marcadas como RESERVADAS',
            },
            occupied: {
              type: 'number',
              description: 'Cantidad de habitaciones marcadas como OCUPADAS',
            },
            free: {
              type: 'number',
              description: 'Cantidad de habitaciones marcadas como LIBRES',
            },
          },
        },
        reservas: {
          type: 'object',
          properties: {
            finalizadas: {
              type: 'number',
              description: 'Cantidad de reservas marcadas como FINALIZADAS',
            },
          },
        },
      },
    },
  })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  @ApiResponse({
    status: 500,
    description: 'Error interno durante la actualización de estados',
  })
  manualMarcarEstados() {
    return this.cronService.marcarEstadosCronConTransaccion();
  }
}
