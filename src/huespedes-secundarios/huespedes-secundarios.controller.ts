import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { HuespedesSecundariosService } from './huespedes-secundarios.service';
import { CreateHuespedSecundarioDto } from './dto/create-huesped-secundario.dto';
import { UpdateHuespedSecundarioDto } from './dto/update-huesped-secundario.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { HuespedSecundario } from './entities/huesped-secundario.entity'; // Importa la entidad

@ApiTags('huespedes-secundarios') // Agrupa las rutas
@Auth(Role.ADMINISTRADOR, Role.CAJERO) // Roles autorizados
@Controller('huespedes-secundarios')
export class HuespedesSecundariosController {
  constructor(
    private readonly huespedesSecundariosService: HuespedesSecundariosService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un huésped secundario' })
  @ApiBody({ type: CreateHuespedSecundarioDto })
  @ApiResponse({
    status: 201,
    description: 'Huésped secundario creado',
    type: HuespedSecundario,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() CreateHuespedSecundarioDto: CreateHuespedSecundarioDto) {
    return this.huespedesSecundariosService.create(CreateHuespedSecundarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los huéspedes secundarios' })
  @ApiQuery({
    name: 'page',
    description: 'Número de página',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Límite de resultados por página',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de huéspedes secundarios',
    type: [HuespedSecundario],
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.huespedesSecundariosService.findAll(paginationDto);
  }

  @Get('huespedId/:huespedId')
  @ApiOperation({
    summary: 'Listar huéspedes secundarios por ID de huésped principal',
  })
  @ApiParam({
    name: 'huespedId',
    description: 'ID del huésped principal',
    type: Number,
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página',
    required: false,
    type: Number,
  }) // Query para paginación
  @ApiQuery({
    name: 'limit',
    description: 'Límite de resultados por página',
    required: false,
    type: Number,
  }) // Query para paginación
  @ApiResponse({
    status: 200,
    description: 'Lista de huéspedes secundarios',
    type: [HuespedSecundario],
  })
  findAllByHuespedId(
    @Param('huespedId', ParseIntPipe) huespedId: number,
    @Query() paginationDto: PaginationDto, // Usamos @Query para paginationDto
  ) {
    return this.huespedesSecundariosService.findAllHuespedesSecundariosByHuespedId(
      huespedId,
      paginationDto,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un huésped secundario por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del huésped secundario',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Huésped secundario encontrado',
    type: HuespedSecundario,
  })
  @ApiResponse({ status: 404, description: 'Huésped secundario no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.huespedesSecundariosService.findOne(id);
  }

  @Get('numeroDocumento/:numeroDocumento')
  @ApiOperation({
    summary: 'Obtener un huésped secundario por número de documento',
  })
  @ApiParam({
    name: 'numeroDocumento',
    description: 'Número de documento',
    type: String,
  }) // Tipo String
  @ApiResponse({
    status: 200,
    description: 'Huésped secundario encontrado',
    type: HuespedSecundario,
  })
  @ApiResponse({ status: 404, description: 'Huésped secundario no encontrado' })
  findByNumeroDocumento(@Param('numeroDocumento') numeroDocumento: string) {
    return this.huespedesSecundariosService.findByNumeroDocumento(
      numeroDocumento,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un huésped secundario por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del huésped secundario',
    type: Number,
  })
  @ApiBody({ type: UpdateHuespedSecundarioDto })
  @ApiResponse({
    status: 200,
    description: 'Huésped secundario actualizado',
    type: HuespedSecundario,
  })
  @ApiResponse({ status: 404, description: 'Huésped secundario no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() UpdateHuespedSecundarioDto: UpdateHuespedSecundarioDto,
  ) {
    return this.huespedesSecundariosService.update(
      id,
      UpdateHuespedSecundarioDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un huésped secundario por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del huésped secundario',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Huésped secundario eliminado',
    type: HuespedSecundario,
  })
  @ApiResponse({ status: 404, description: 'Huésped secundario no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.huespedesSecundariosService.remove(id);
  }
}
