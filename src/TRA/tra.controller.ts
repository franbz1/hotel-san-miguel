import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateRegistroFormularioDto } from 'src/registro-formulario/dto/createRegistroFormularioDto';
import { TraService } from './tra.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';

/**
 * Controlador para las operaciones relacionadas con TRA (Turismo Responsable Argentina).
 */
@ApiTags('tra')
@ApiBearerAuth()
@Auth(Role.ADMINISTRADOR)
@Controller('tra')
export class TraController {
  constructor(private readonly traService: TraService) {}

  /**
   * Endpoint de prueba para el servicio TRA.
   * `POST /tra/test`
   *
   * @param createRegistroFormularioDto - DTO con los datos del formulario a registrar.
   * @returns Resultado de la operación de registro realizada por el servicio TraService.
   */
  @Post('test')
  @ApiOperation({
    summary: 'Probar integración con TRA',
    description:
      'Endpoint de prueba para verificar la integración con el sistema TRA',
  })
  @ApiBody({
    type: CreateRegistroFormularioDto,
    description: 'Datos del formulario para registrar en TRA',
  })
  @ApiResponse({
    status: 201,
    description: 'Formulario registrado exitosamente en TRA',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticación inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos suficientes',
  })
  @ApiResponse({
    status: 500,
    description: 'Error en la integración con TRA',
  })
  test(@Body() createRegistroFormularioDto: CreateRegistroFormularioDto) {
    return {
      message: 'aun no implementado',
      createRegistroFormularioDto,
    };
  }
}
