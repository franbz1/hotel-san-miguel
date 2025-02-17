import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CreateRegistroFormularioDto } from 'src/registro-formulario/dto/createRegistroFormularioDto';
import { TraService } from './tra.service';

/**
 * Controlador para las operaciones relacionadas con 'tra'.
 */
@ApiTags('tra')
@Controller('tra')
export class TraController {
  constructor(private readonly traService: TraService) {}

  /**
   * Endpoint de prueba para el servicio 'tra'.
   * `POST /tra/test`
   *
   * @param createRegistroFormularioDto - DTO con los datos del formulario a registrar.
   * @returns Resultado de la operación de registro realizada por el servicio TraService.
   */
  @Post('test')
  @ApiOperation({ summary: 'Ejecuta el endpoint de prueba para tra' })
  @ApiBody({ type: CreateRegistroFormularioDto })
  @ApiResponse({
    status: 201,
    description: 'Formulario registrado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  test(@Body() createRegistroFormularioDto: CreateRegistroFormularioDto) {
    return this.traService.postTra(createRegistroFormularioDto);
  }
}
