import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { EliminarBookingService } from './eliminar-booking.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RemoveBookingResponse } from './eliminar-booking.service';

/**
 * Controller para manejar la eliminación de reservas
 */
@ApiTags('eliminar-booking') // Agrupa las rutas bajo el tag "eliminar-booking"
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
    summary: 'Eliminar un booking (el link del formulario y la reserva) por ID',
  })
  @ApiParam({ name: 'id', description: 'ID del booking', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Booking eliminado',
    type: RemoveBookingResponse,
  })
  @ApiResponse({ status: 404, description: 'Booking no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarBookingService.remove(id);
  }
}
