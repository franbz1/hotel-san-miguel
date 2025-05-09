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
} from '@nestjs/swagger';
import { CreateLinkFormularioDto } from './dto/CreateLinkFormularioDto';
import { LinkFormularioGuard } from 'src/auth/guards/linkFormulario.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('link-formulario')
@Controller('link-formulario')
@ApiBearerAuth()
export class LinkFormularioController {
  constructor(private readonly linkFormularioService: LinkFormularioService) {}

  /**
   * Crea un link temporal para el formulario de reserva
   * @returns Link temporal
   */
  @Post()
  @Auth(Role.ADMINISTRADOR, Role.CAJERO)
  @ApiOperation({ summary: 'Crear enlace temporal para formulario' })
  @ApiResponse({
    status: 201,
    description: 'Enlace temporal creado exitosamente',
    type: String,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  createLinkTemporal(@Body() createLinkFormularioDto: CreateLinkFormularioDto) {
    return this.linkFormularioService.createLinkTemporal(
      createLinkFormularioDto,
    );
  }

  /**
   * Obtiene un link por su ID
   * @param id ID del link
   * @returns Link encontrado
   */
  @Get(':id')
  @Auth(Role.ADMINISTRADOR, Role.CAJERO)
  @ApiOperation({ summary: 'Obtener link por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del link',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Link encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Link no encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.linkFormularioService.findOne(+id);
  }

  /**
   * Elimina un link por su ID
   * @param id ID del link
   * @returns Link eliminado
   */
  @Delete(':id')
  @Auth(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar link por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del link',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Link eliminado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Link no encontrado',
  })
  remove(@Param('id') id: string) {
    return this.linkFormularioService.remove(+id);
  }

  /**
   * Obtiene todos los links de formulario con paginación.
   * @param paginationDto Datos de paginación.
   * @returns Lista de links con metadatos de paginación.
   */
  @Get()
  @Auth(Role.ADMINISTRADOR, Role.CAJERO)
  @ApiOperation({ summary: 'Obtener todos los links de formulario' })
  @ApiQuery({
    name: 'page',
    required: true,
    type: Number,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'limit',
    required: true,
    type: Number,
    description: 'Límite de elementos por página',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de links obtenida exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.linkFormularioService.findAll(paginationDto);
  }

  /**
   * Regenera un link temporal para el formulario de reserva
   * @param id ID del link
   * @returns Link temporal
   */
  @Post(':id/regenerate')
  @Auth(Role.ADMINISTRADOR, Role.CAJERO)
  @ApiOperation({ summary: 'Regenerar link temporal para formulario' })
  @ApiParam({
    name: 'id',
    description: 'ID del link',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Link regenerado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Link no encontrado',
  })
  regenerateLink(@Param('id') id: string) {
    return this.linkFormularioService.regenerateLink(+id);
  }

  /**
   * Valida el token de un formulario y devuelve su payload
   * @param token Token JWT del formulario
   * @returns Payload del token si es válido
   */
  @Get('validate-token/:token')
  @Roles(Role.REGISTRO_FORMULARIO)
  @UseGuards(LinkFormularioGuard, RolesGuard)
  @ApiOperation({ summary: 'Validar token' })
  @ApiParam({
    name: 'token',
    description: 'Token',
    type: String,
  })
  @ApiBearerAuth()
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

  /**
   * Obtiene todos los links de formulario para una habitación específica con paginación.
   * @param numeroHabitacion Número de habitación
   * @param paginationDto Datos de paginación
   * @returns Lista de links con metadatos de paginación
   */
  @Get('habitacion/:numeroHabitacion')
  @Auth(Role.ADMINISTRADOR, Role.CAJERO)
  @ApiOperation({
    summary: 'Obtener links de formulario por número de habitación',
  })
  @ApiParam({
    name: 'numeroHabitacion',
    description: 'Número de habitación',
    type: Number,
  })
  @ApiQuery({
    name: 'page',
    required: true,
    type: Number,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'limit',
    required: true,
    type: Number,
    description: 'Límite de elementos por página',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de links obtenida exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  findAllByHabitacion(
    @Param('numeroHabitacion') numeroHabitacion: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.linkFormularioService.findAllByHabitacion(
      +numeroHabitacion,
      paginationDto,
    );
  }
}
