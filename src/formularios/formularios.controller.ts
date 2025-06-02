import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FormulariosService } from './formularios.service';
import { UpdateFormularioDto } from './dto/update-formulario.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Role } from 'src/usuarios/entities/rol.enum';
import { Formulario } from './entities/formulario.entity';

@ApiTags('formularios')
@ApiBearerAuth()
@Auth(Role.CAJERO, Role.ADMINISTRADOR)
@Controller('formularios')
export class FormulariosController {
  constructor(private readonly formulariosService: FormulariosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los formularios con paginación' })
  @ApiQuery({
    name: 'page',
    description: 'Número de página (por defecto: 1)',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Límite de resultados por página (por defecto: 10)',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de formularios obtenida exitosamente',
    type: [Formulario],
  })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.formulariosService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un formulario por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del formulario',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Formulario encontrado',
    type: Formulario,
  })
  @ApiResponse({ status: 404, description: 'Formulario no encontrado' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.formulariosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un formulario por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del formulario',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateFormularioDto })
  @ApiResponse({
    status: 200,
    description: 'Formulario actualizado exitosamente',
    type: Formulario,
  })
  @ApiResponse({ status: 404, description: 'Formulario no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFormularioDto: UpdateFormularioDto,
  ) {
    return this.formulariosService.update(id, updateFormularioDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un formulario por ID (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'ID del formulario',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Formulario eliminado exitosamente',
    type: Formulario,
  })
  @ApiResponse({ status: 404, description: 'Formulario no encontrado' })
  @ApiResponse({ status: 401, description: 'Token de autenticación inválido' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.formulariosService.remove(id);
  }
}
