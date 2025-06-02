import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { EliminarBookingService } from './eliminar-booking.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RemoveBookingResponse } from './eliminar-booking.service';

/**
 * Controller para manejar la eliminación de reservas y links de formularios
 */
@ApiTags('eliminar-booking')
@ApiBearerAuth()
@Auth(Role.ADMINISTRADOR)
@Controller('eliminar-booking')
export class EliminarBookingController {
  constructor(
    private readonly eliminarBookingService: EliminarBookingService,
  ) {}

  /**
   * Elimina un booking (el link del formulario y la reserva) por id
   * `DELETE /eliminar-booking/:id`
   * @param id
   * @returns Booking eliminado
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un booking completo por ID',
    description:
      'Elimina tanto el link del formulario como la reserva asociada por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del booking a eliminar',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Booking eliminado exitosamente',
    type: RemoveBookingResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Booking no encontrado',
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
    description: 'Error interno durante la eliminación del booking',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarBookingService.remove(id);
  }
}
