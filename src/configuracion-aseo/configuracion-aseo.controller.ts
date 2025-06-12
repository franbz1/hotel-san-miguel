import { Controller, Get, Put, Body } from '@nestjs/common';
import { ConfiguracionAseoService } from './configuracion-aseo.service';
import { UpdateConfiguracionAseoDto } from './dto/update-configuracion-aseo.dto';
import { Role } from '../usuarios/entities/rol.enum';
import { Auth } from '../auth/decorators/auth.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { ConfiguracionAseo } from './entities/configuracion-aseo.entity';
import {
  AUTH_INVALID_RESPONSE,
  PERMISSIONS_RESPONSE,
} from '../common/swagger/pagination-responses';

/**
 * Controller para manejar la configuración del módulo de aseo
 */
@ApiTags('configuracion-aseo')
@ApiBearerAuth()
@Auth() // Requiere autenticación para todos los endpoints
@ApiExtraModels(ConfiguracionAseo)
@Controller('configuracion-aseo')
export class ConfiguracionAseoController {
  constructor(
    private readonly configuracionAseoService: ConfiguracionAseoService,
  ) {}

  // ================================================================
  // READ - Obtener la configuración actual de aseo
  // ================================================================
  @Get()
  @ApiOperation({
    summary: 'Obtener la configuración actual de aseo',
    description:
      'Obtiene la configuración de aseo actual. Si no existe, crea una configuración por defecto.',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración de aseo obtenida exitosamente',
    type: ConfiguracionAseo,
  })
  @ApiResponse({
    status: 400,
    description: 'Error al obtener configuración de aseo',
  })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  obtenerConfiguracion() {
    return this.configuracionAseoService.obtenerConfiguracion();
  }

  // ================================================================
  // UPDATE - Actualizar la configuración de aseo
  // ================================================================
  @Put()
  @Auth(Role.ADMINISTRADOR) // Solo administradores pueden actualizar
  @ApiOperation({
    summary: 'Actualizar la configuración de aseo',
    description:
      'Actualiza la configuración de aseo. Solo usuarios con rol ADMINISTRADOR pueden realizar esta acción.',
  })
  @ApiBody({ type: UpdateConfiguracionAseoDto })
  @ApiResponse({
    status: 200,
    description: 'Configuración de aseo actualizada exitosamente',
    type: ConfiguracionAseo,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de configuración inválidos o error al actualizar',
  })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  actualizarConfiguracion(
    @Body() updateConfiguracionAseoDto: UpdateConfiguracionAseoDto,
  ) {
    return this.configuracionAseoService.actualizarConfiguracion(
      updateConfiguracionAseoDto,
    );
  }
}
