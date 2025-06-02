import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { LinkFormularioService } from './link-formulario.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
  ApiExtraModels,
} from '@nestjs/swagger';
import { CreateLinkFormularioDto } from './dto/CreateLinkFormularioDto';
import { LinkFormularioGuard } from 'src/auth/guards/linkFormulario.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LinkFormulario } from './entities/link-formulario.entity';
import {
  createPaginatedApiResponse,
  PAGE_QUERY,
  LIMIT_QUERY,
  AUTH_INVALID_RESPONSE,
  PERMISSIONS_RESPONSE,
} from 'src/common/swagger/pagination-responses';

@ApiTags('link-formulario')
@Controller('link-formulario')
@ApiBearerAuth()
@ApiExtraModels(LinkFormulario)
export class LinkFormularioController {
  constructor(private readonly linkFormularioService: LinkFormularioService) {}

  // ================================================================
  // CREATE - Crear enlace temporal para formulario
  // ================================================================
  @Post()
  @Auth(Role.ADMINISTRADOR, Role.CAJERO)
  @ApiOperation({ summary: 'Crear enlace temporal para formulario' })
  @ApiResponse({
    status: 201,
    description: 'Enlace temporal creado exitosamente',
    type: String,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Habitación no encontrada' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  createLinkTemporal(@Body() createLinkFormularioDto: CreateLinkFormularioDto) {
    return this.linkFormularioService.createLinkTemporal(
      createLinkFormularioDto,
    );
  }

  // ================================================================
  // READ - Obtener todos los links con paginación
  // ================================================================
  @Get()
  @Auth(Role.ADMINISTRADOR, Role.CAJERO)
  @ApiOperation({ summary: 'Obtener todos los links de formulario' })
  @ApiQuery(PAGE_QUERY)
  @ApiQuery(LIMIT_QUERY)
  @ApiResponse(createPaginatedApiResponse(LinkFormulario, 'totalLinks'))
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.linkFormularioService.findAll(paginationDto);
  }

  // ================================================================
  // READ - Obtener links por habitación con paginación
  // ================================================================
  @Get('habitacion/:numeroHabitacion')
  @Auth(Role.ADMINISTRADOR, Role.CAJERO)
  @ApiOperation({
    summary: 'Obtener links de formulario por número de habitación',
  })
  @ApiParam({
    name: 'numeroHabitacion',
    description: 'Número de habitación',
    type: Number,
    example: 101,
  })
  @ApiQuery(PAGE_QUERY)
  @ApiQuery(LIMIT_QUERY)
  @ApiResponse(
    createPaginatedApiResponse(
      LinkFormulario,
      'totalLinks',
      'Lista paginada de links de formulario por habitación con metadatos',
    ),
  )
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findAllByHabitacion(
    @Param('numeroHabitacion') numeroHabitacion: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.linkFormularioService.findAllByHabitacion(
      +numeroHabitacion,
      paginationDto,
    );
  }

  // ================================================================
  // BUSINESS LOGIC - Validar token de formulario
  // ================================================================
  @Get('validate-token/:token')
  @Roles(Role.REGISTRO_FORMULARIO)
  @UseGuards(LinkFormularioGuard, RolesGuard)
  @ApiOperation({ summary: 'Validar token' })
  @ApiParam({
    name: 'token',
    description: 'Token',
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
  })
  @ApiResponse({
    status: 401,
    description:
      'No autorizado - Token inválido, expirado, en lista negra o formulario ya completado',
  })
  validateToken(@Param('token') token: string) {
    return this.linkFormularioService.validateToken(token);
  }

  // ================================================================
  // READ - Obtener link por ID
  // ================================================================
  @Get(':id')
  @Auth(Role.ADMINISTRADOR, Role.CAJERO)
  @ApiOperation({ summary: 'Obtener link por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del link',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Link encontrado',
    type: LinkFormulario,
  })
  @ApiResponse({ status: 404, description: 'Link no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findOne(@Param('id') id: string) {
    return this.linkFormularioService.findOne(+id);
  }

  // ================================================================
  // UPDATE - Regenerar link temporal
  // ================================================================
  @Post(':id/regenerate')
  @Auth(Role.ADMINISTRADOR, Role.CAJERO)
  @ApiOperation({ summary: 'Regenerar link temporal para formulario' })
  @ApiParam({
    name: 'id',
    description: 'ID del link',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Link regenerado exitosamente',
    type: LinkFormulario,
  })
  @ApiResponse({ status: 400, description: 'El link ya ha sido completado' })
  @ApiResponse({ status: 404, description: 'Link no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  regenerateLink(@Param('id') id: string) {
    return this.linkFormularioService.regenerateLink(+id);
  }

  // ================================================================
  // DELETE - Eliminar link por ID
  // ================================================================
  @Delete(':id')
  @Auth(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar link por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del link',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Link eliminado exitosamente',
    type: LinkFormulario,
  })
  @ApiResponse({ status: 404, description: 'Link no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  remove(@Param('id') id: string) {
    return this.linkFormularioService.remove(+id);
  }
}
