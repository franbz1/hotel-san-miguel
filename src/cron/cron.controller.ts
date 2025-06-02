import { Controller, Get, UseGuards } from '@nestjs/common';
import { CronService } from './cron.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('cron')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Roles(Role.ADMINISTRADOR)
  @UseGuards(AuthGuard)
  @Get('marcar-estados-habitaciones')
  @ApiOperation({
    summary: 'Ejecutar manualmente la actualización de estados de habitaciones',
    description:
      'Ejecuta el proceso que normalmente corre cada minuto para actualizar los estados de las habitaciones según sus reservas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen de habitaciones actualizadas por estado',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticación inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos suficientes - Solo administradores',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno durante la actualización de estados',
  })
  manualMarcarEstados() {
    return this.cronService.marcarEstadosCronConTransaccion();
  }
}
