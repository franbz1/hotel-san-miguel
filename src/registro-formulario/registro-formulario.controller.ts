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
    summary: 'Crear un registro de formulario',
    description:
      'Crea un nuevo formulario sin subir automáticamente a TRA. El formulario puede ser subido a TRA posteriormente usando el endpoint específico.',
  })
  @ApiParam({
    name: 'token',
    description: 'Token del formulario',
    type: String,
  })
  @ApiBody({ type: CreateRegistroFormularioDto })
  @ApiResponse({
    status: 201,
    description:
      'Formulario creado exitosamente. No se ha subido a TRA automáticamente.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Formulario registrado exitosamente',
        },
        data: {
          type: 'object',
          properties: {
            formulario: {
              type: 'object',
              description: 'Datos del formulario creado',
            },
            reserva: {
              type: 'object',
              description: 'Datos de la reserva creada',
            },
            huesped: { type: 'object', description: 'Datos del huésped' },
          },
        },
        traStatus: {
          type: 'string',
          example: 'NOT_UPLOADED',
          description:
            'Estado de TRA: NOT_UPLOADED indica que no se ha subido a TRA',
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
  async create(
    @Body() createRegistroFormularioDto: CreateRegistroFormularioDto,
    @Req() req: RequestReturnJWT,
  ) {
    const result = await this.registroFormularioService.create(
      createRegistroFormularioDto,
      req.usuario.id,
    );

    return {
      message: 'Formulario registrado exitosamente',
      data: {
        formulario: result.result.formulario,
        reserva: result.result.reservaCreated,
        huesped: result.result.huesped,
      },
      traStatus: 'NOT_UPLOADED',
      notice:
        'El formulario ha sido creado pero no se ha subido a TRA. Use el endpoint POST /registro-formulario/tra/formulario/{id} para subirlo cuando sea necesario.',
    };
  }

  @Post('tra/formulario/:id')
  @Auth(Role.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Subir un formulario existente a TRA',
    description:
      'Sube un formulario previamente creado al sistema TRA. Solo puede ser usado en formularios que no han sido subidos anteriormente a TRA.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del formulario a registrar en TRA',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Formulario subido exitosamente a TRA',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Formulario subido exitosamente a TRA',
        },
        data: {
          type: 'object',
          properties: {
            formulario: {
              type: 'object',
              description: 'Datos del formulario actualizado',
            },
            traData: {
              type: 'object',
              description: 'Respuesta del sistema TRA',
              properties: {
                huespedPrincipal: { type: 'object' },
                huespedesSecundarios: { type: 'array' },
              },
            },
          },
        },
        traStatus: {
          type: 'string',
          example: 'UPLOADED',
          description: 'Estado de TRA confirmando la subida exitosa',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Error al subir a TRA o formulario ya subido',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: {
          type: 'string',
          example: 'El formulario ya fue subido a TRA anteriormente',
        },
        error: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Formulario no encontrado',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: {
          type: 'string',
          example: 'Formulario no encontrado',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Fallo en la comunicación con TRA',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: {
          type: 'string',
          example: 'Error en la comunicación con el sistema TRA',
        },
        error: { type: 'string' },
      },
    },
  })
  @ApiBearerAuth()
  async subirFormularioATra(@Param('id', ParseIntPipe) id: number) {
    try {
      const result =
        await this.registroFormularioService.subirFormularioATra(id);

      return {
        success: true,
        message: 'Formulario subido exitosamente a TRA',
        data: {
          formulario: result.formulario,
          traData: result.traData,
        },
        traStatus: 'UPLOADED',
      };
    } catch (error) {
      // Retornar respuesta estructurada para errores
      return {
        success: false,
        message: error.message || 'Error al subir formulario a TRA',
        error: error.message,
        traStatus: 'FAILED',
      };
    }
  }
}
