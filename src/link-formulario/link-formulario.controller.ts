import { Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { LinkFormularioService } from './link-formulario.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

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
  createLinkTemporal() {
    return this.linkFormularioService.createLinkTemporal();
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
}
