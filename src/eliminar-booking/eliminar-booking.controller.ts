import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import {
  EliminarBookingService,
  RemoveBookingResponse,
} from './eliminar-booking.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';

/**
 * Controller para manejar la eliminación de reservas y links de formularios
 */
@ApiTags('eliminar-booking')
@ApiBearerAuth()
@Auth(Role.ADMINISTRADOR)
@ApiExtraModels(RemoveBookingResponse)
@Controller('eliminar-booking')
export class EliminarBookingController {
  constructor(
    private readonly eliminarBookingService: EliminarBookingService,
  ) {}

  /**
   * Elimina un booking completo (link de formulario, formulario, reserva, factura y huéspedes) por ID.
   *
   * **Proceso de eliminación:**
   * 1. Si el formulario NO está completado: Solo elimina el link de formulario
   * 2. Si el formulario está completado: Elimina todos los componentes relacionados:
   *    - Link de formulario
   *    - Formulario
   *    - Reserva
   *    - Factura (si existe)
   *    - Huéspedes principal y secundarios (solo si no tienen otras reservas activas)
   *
   * **Verificación de huéspedes:**
   * - El sistema verifica si los huéspedes (principal y secundarios) tienen otras reservas activas
   * - Solo elimina aquellos huéspedes que no tienen otras reservas
   * - Retorna información sobre qué huéspedes fueron eliminados
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un booking completo por ID',
    description: `
    Elimina un booking completo incluyendo todas sus entidades relacionadas.
    
    **Casos de uso:**
    - **Formulario no completado**: Solo elimina el link de formulario
    - **Formulario completado**: Elimina link, formulario, reserva, factura y huéspedes sin otras reservas
    
    **Eliminación inteligente de huéspedes:**
    - Verifica si huéspedes tienen otras reservas activas
    - Solo elimina huéspedes sin reservas adicionales
    - Proporciona información detallada sobre huéspedes eliminados
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'ID del booking (link de formulario) a eliminar',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: `
    Booking eliminado exitosamente. La respuesta varía según el estado del formulario:
    
    **Si formulario no completado:**
    Retorna el LinkFormulario eliminado
    
    **Si formulario completado:**
    Retorna objeto con:
    - message: Mensaje de confirmación
    - data:
      - linkFormularioId: ID del link eliminado
      - formularioId: ID del formulario eliminado  
      - reservaId: ID de la reserva eliminada
      - facturaId: ID de la factura eliminada (null si no existe)
      - huespedPrincipalEliminado: boolean - Si el huésped principal fue eliminado
      - huespedesSecundariosEliminados: number[] - IDs de huéspedes secundarios eliminados
    `,
    type: RemoveBookingResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Booking no encontrado - El ID proporcionado no existe',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticación inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description:
      'Sin permisos suficientes - Solo administradores pueden eliminar bookings',
  })
  @ApiResponse({
    status: 500,
    description: `
    Error interno durante la eliminación del booking. 
    Todas las operaciones se ejecutan en una transacción para garantizar integridad de datos.
    `,
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarBookingService.remove(id);
  }
}
