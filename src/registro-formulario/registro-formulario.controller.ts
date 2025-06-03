import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  HttpStatus,
  Param,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
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
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('registro-formulario')
@Controller('registro-formulario')
export class RegistroFormularioController {
  constructor(
    private readonly registroFormularioService: RegistroFormularioService,
  ) {}

  @Post(':token')
  @Roles(Role.REGISTRO_FORMULARIO)
  @UseGuards(LinkFormularioGuard, RolesGuard)
  @ApiOperation({
    summary: 'Crear un registro de formulario sin integración TRA',
  })
  @ApiParam({
    name: 'token',
    description: 'Token del formulario',
    type: String,
  })
  @ApiBody({ type: CreateRegistroFormularioDto })
  @ApiResponse({
    status: 201,
    description: 'Registro de formulario creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Error en los datos proporcionados',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Habitación o recurso no encontrado',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - Ya existe un formulario completado para este token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Error durante el procesamiento',
  })
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
      message: result.message || 'Formulario registrado exitosamente',
      data: {
        formulario: result.result.formulario,
        reserva: result.result.reservaCreated,
        huesped: result.result.huesped,
      },
    };
  }

  @Post('tra/:token')
  @Roles(Role.REGISTRO_FORMULARIO)
  @UseGuards(LinkFormularioGuard, RolesGuard)
  @ApiOperation({
    summary: 'Crear un registro de formulario con integración TRA',
  })
  @ApiParam({
    name: 'token',
    description: 'Token del formulario',
    type: String,
  })
  @ApiBody({ type: CreateRegistroFormularioDto })
  @ApiResponse({
    status: 201,
    description: 'Registro de formulario creado exitosamente',
  })
  @ApiResponse({
    status: 207,
    description: 'Formulario creado pero falló integración TRA',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 207 },
        message: {
          type: 'string',
          example:
            'Formulario registrado exitosamente pero falló el registro en TRA',
        },
        data: {
          type: 'object',
          properties: {
            formulario: { type: 'object' },
            reserva: { type: 'object' },
            huesped: { type: 'object' },
            traError: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Error en los datos proporcionados',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Habitación o recurso no encontrado',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - Ya existe un formulario completado para este token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Error durante el procesamiento',
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
    if (
      result.success &&
      result.traRegistration &&
      !result.traRegistration.success
    ) {
      // Para status 207, usamos HttpCode decorator en un método separado o manejamos aquí
      const response = {
        statusCode: 207, // Multi-Status mantiene compatibilidad con cliente
        message: result.message,
        data: {
          formulario: result.result.formulario,
          reserva: result.result.reservaCreated,
          huesped: result.result.huesped,
          traError: result.traRegistration.error,
        },
      };

      // Configurar status code de respuesta manualmente para caso especial 207
      return response;
    }

    // Éxito completo - NestJS manejará automáticamente el status 201
    return {
      message: result.message || 'Formulario registrado exitosamente',
      data: {
        formulario: result.result.formulario,
        reserva: result.result.reservaCreated,
        huesped: result.result.huesped,
        traFormulario: result.traFormulario,
      },
    };
  }

  @Post('tra/formulario/:id')
  @Auth(Role.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar un formulario existente en TRA' })
  @ApiParam({
    name: 'id',
    description: 'ID del formulario a registrar en TRA',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Formulario registrado exitosamente en TRA',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Error al registrar en TRA',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Formulario no encontrado',
  })
  @ApiBearerAuth()
  async registerFormularioInTra(@Param('id', ParseIntPipe) id: number) {
    const result =
      await this.registroFormularioService.registerFormularioInTra(id);

    return {
      message: result.message,
      data: {
        formulario: result.formulario,
        traData: result.traData,
      },
    };
  }
}
