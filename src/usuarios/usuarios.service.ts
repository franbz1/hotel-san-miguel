import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from 'src/usuarios/prisma/prisma.service';

/**
 * Service CRUD para manejar usuarios
 */
@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Método para crear un usuario
   * @param createUsuarioDto
   * @returns Usuario
   */
  create(createUsuarioDto: CreateUsuarioDto) {
    return this.prisma.usuario.create({
      data: createUsuarioDto,
    });
  }

  findAll() {
    return `This action returns all usuarios`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usuario`;
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }
}
