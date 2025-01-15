import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { LoginDto } from './dto/loginDto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Autentica un usuario.
   * @param loginDto Datos del usuario a autenticar.
   * @returns Token de autenticación.
   * @throws UnauthorizedException si el usuario no existe o la contraseña es incorrecta.
   */
  async login(loginDto: LoginDto) {
    try {
      const usuario = await this.usuariosService.findByNombre(loginDto.nombre);
      const passwordMatch = await bcrypt.compare(
        loginDto.password,
        usuario.password,
      );

      if (!passwordMatch) throw new UnauthorizedException();

      const payload = { id: usuario.id, rol: usuario.rol };

      return {
        token: await this.jwtService.signAsync(payload),
        usuarioId: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
      };
    } catch (error) {
      throw new UnauthorizedException(error.code);
    }
  }

  async logout() {
    return 'logout';
  }
}
