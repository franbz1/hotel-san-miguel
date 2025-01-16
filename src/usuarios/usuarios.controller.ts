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
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

/**
 * Controller CRUD para manejar usuarios
 */
@UseGuards(AuthGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * Método para crear un usuario
   * `POST /usuarios`
   * @param createUsuarioDto
   * @returns Usuario
   */
  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  /**
   * Método para obtener todos los usuarios con paginación
   * `GET /usuarios`
   * @param paginationDto
   * @returns Objeto con los usuarios y metadatos de paginación
   */
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usuariosService.findAll(paginationDto);
  }

  /**
   * Busca un usuario por id
   * `GET /usuarios/:id`
   * @param id
   * @returns Usuario
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  /**
   * Actualiza un usuario por id
   * `PATCH /usuarios/:id`
   * @param id
   * @param updateUsuarioDto
   * @returns Usuario actualizado
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  /**
   * Elimina un usuario por id
   * `DELETE /usuarios/:id`
   * @param id
   * @returns Usuario eliminado
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}
