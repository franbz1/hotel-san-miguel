import { Body, Controller, Post, Req, UseGuards, HttpStatus } from '@nestjs/common';
import { RegistroFormularioService } from './registro-formulario.service';
import { CreateRegistroFormularioDto } from './dto/createRegistroFormularioDto';
import { LinkFormularioGuard } from 'src/auth/guards/linkFormulario.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';
import RequestReturnJWT from 'src/auth/interfaces/requestReturnJWT';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('registro-formulario')
@Controller('registro-formulario')
export class RegistroFormularioController {
  constructor(
    private readonly registroFormularioService: RegistroFormularioService,
  ) {}

  @Post(':token')
  @Roles(Role.REGISTRO_FORMULARIO)
  @UseGuards(LinkFormularioGuard, RolesGuard)
  @ApiOperation({ summary: 'Crear un registro de formulario sin integración TRA' })
  @ApiParam({
    name: 'token',
    description: 'Token del formulario',
    type: String,
  })
  @ApiBody({ type: CreateRegistroFormularioDto })
  @ApiResponse({ status: 201, description: 'Registro de formulario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Bad Request - Error en los datos proporcionados' })
  @ApiResponse({ status: 404, description: 'Not Found - Habitación o recurso no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflict - Ya existe un formulario completado para este token' })
  @ApiResponse({ status: 500, description: 'Internal Server Error - Error durante el procesamiento' })
  @ApiBearerAuth()
  async create(
    @Body() createRegistroFormularioDto: CreateRegistroFormularioDto,
    @Req() req: RequestReturnJWT,
  ) {
    const result = await this.registroFormularioService.create(
      createRegistroFormularioDto,
      req.usuario.id,
    );
    
    return {
      statusCode: HttpStatus.CREATED,
      message: result.message || 'Formulario registrado exitosamente',
      data: {
        formulario: result.result.formulario,
        reserva: result.result.reservaCreated,
        huesped: result.result.huesped
      }
    };
  }

  @Post('tra/:token')
  @Roles(Role.REGISTRO_FORMULARIO)
  @UseGuards(LinkFormularioGuard, RolesGuard)
  @ApiOperation({ summary: 'Crear un registro de formulario con integración TRA' })
  @ApiParam({
    name: 'token',
    description: 'Token del formulario',
    type: String,
  })
  @ApiBody({ type: CreateRegistroFormularioDto })
  @ApiResponse({ status: 201, description: 'Registro de formulario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Bad Request - Error en los datos proporcionados' })
  @ApiResponse({ status: 404, description: 'Not Found - Habitación o recurso no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflict - Ya existe un formulario completado para este token' })
  @ApiResponse({ status: 500, description: 'Internal Server Error - Error durante el procesamiento' })
  @ApiResponse({ 
    status: 207, 
    description: 'Multi-Status - Formulario registrado pero falló integración con TRA' 
  })
  @ApiBearerAuth()
  async createWithTra(
    @Body() createRegistroFormularioDto: CreateRegistroFormularioDto,
    @Req() req: RequestReturnJWT,
  ) {
    const result = await this.registroFormularioService.createWithTra(
      createRegistroFormularioDto,
      req.usuario.id,
    );
    
    // Si hay un error en la integración TRA pero el formulario se registró correctamente
    if (result.success && result.traRegistration && !result.traRegistration.success) {
      return {
        statusCode: 207, // Multi-Status HTTP code
        message: result.message,
        data: {
          formulario: result.result.formulario,
          reserva: result.result.reservaCreated,
          huesped: result.result.huesped,
          traError: result.traRegistration.error
        }
      };
    }
    
    // Éxito completo
    return {
      statusCode: HttpStatus.CREATED,
      message: result.message || 'Formulario registrado exitosamente',
      data: {
        formulario: result.result.formulario,
        reserva: result.result.reservaCreated,
        huesped: result.result.huesped,
        traFormulario: result.traFormulario
      }
    };
  }
}
