import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { LoginDto } from './dto/loginDto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { envs } from 'src/config/envs';
import { BlacklistService } from './blacklist.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly blacklistService: BlacklistService,
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
        token: await this.jwtService.signAsync(payload, { expiresIn: '1d' }),
        usuarioId: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
      };
    } catch {
      throw new UnauthorizedException();
    }
  }

  /**
   * Invalida un token JWT agregándolo a la lista negra.
   * @param authHeader - Header de autorización con el token Bearer
   * @returns Mensaje de éxito
   * @throws UnauthorizedException si el token es inválido o ya está en la lista negra
   */
  async logout(authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido');
    }

    try {
      // Verificar que el token sea válido antes de invalidarlo
      await this.jwtService.verifyAsync(token, {
        secret: envs.jwtSecret,
      });

      // Verificar si el token ya está en la lista negra
      const isBlacklisted =
        await this.blacklistService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token ya ha sido invalidado');
      }

      // Agregar el token a la lista negra
      await this.blacklistService.addToBlacklist(token);

      return { message: 'Sesión cerrada exitosamente' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Valida un token JWT.
   * @param authHeader - Header de autorización con el token Bearer
   * @returns Objeto con el estado de validación del token y la información del usuario.
   * @throws UnauthorizedException si el token es inválido o ha expirado.
   */
  async validateToken(authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido');
    }

    // Verificar si el token está en la lista negra
    const isBlacklisted = await this.blacklistService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token ha sido invalidado');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: envs.jwtSecret,
      });

      const usuario = await this.usuariosService.findOne(payload.id);

      return {
        isValid: true,
        usuarioId: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
      };
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
