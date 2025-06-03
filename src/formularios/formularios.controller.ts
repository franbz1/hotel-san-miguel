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
  ApiExtraModels,
} from '@nestjs/swagger';
import { Role } from 'src/usuarios/entities/rol.enum';
import { Formulario } from './entities/formulario.entity';
import {
  createPaginatedApiResponse,
  PAGE_QUERY,
  LIMIT_QUERY,
  AUTH_INVALID_RESPONSE,
  PERMISSIONS_RESPONSE,
} from 'src/common/swagger/pagination-responses';

@ApiTags('formularios')
@ApiBearerAuth()
@Auth(Role.CAJERO, Role.ADMINISTRADOR)
@ApiExtraModels(Formulario)
@Controller('formularios')
export class FormulariosController {
  constructor(private readonly formulariosService: FormulariosService) {}

  // ================================================================
  // READ - Listar todos los formularios con paginación
  // ================================================================
  @Get()
  @ApiOperation({ summary: 'Listar todos los formularios con paginación' })
  @ApiQuery(PAGE_QUERY)
  @ApiQuery(LIMIT_QUERY)
  @ApiResponse(createPaginatedApiResponse(Formulario, 'totalFormularios'))
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.formulariosService.findAll(paginationDto);
  }

  // ================================================================
  // READ - Obtener un formulario por ID
  // ================================================================
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
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.formulariosService.findOne(id);
  }

  // ================================================================
  // UPDATE - Actualizar un formulario por ID
  // ================================================================
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
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Formulario no encontrado' })
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFormularioDto: UpdateFormularioDto,
  ) {
    return this.formulariosService.update(id, updateFormularioDto);
  }

  // ================================================================
  // DELETE - Eliminar un formulario por ID
  // ================================================================
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
  @ApiResponse(AUTH_INVALID_RESPONSE)
  @ApiResponse(PERMISSIONS_RESPONSE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.formulariosService.remove(id);
  }
}
