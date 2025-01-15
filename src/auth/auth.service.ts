import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { LoginDto } from './dto/loginDto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly usuariosService: UsuariosService) {}

  async login(loginDto: LoginDto) {
    try {
      const usuario = await this.usuariosService.findByNombre(loginDto.nombre);
      const passwordMatch = await bcrypt.compare(
        loginDto.password,
        usuario.password,
      );

      if (!passwordMatch) throw new UnauthorizedException();

      return { usuarioId: usuario.id, token: 'token' };
    } catch (error) {
      throw new UnauthorizedException(error.code);
    }
  }

  async logout() {
    return 'logout';
  }
}
