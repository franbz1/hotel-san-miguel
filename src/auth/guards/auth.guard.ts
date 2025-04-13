import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { envs } from 'src/config/envs';
import { BlacklistService } from '../blacklist.service';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly blacklistService: BlacklistService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);

      if (!token) {
        throw new UnauthorizedException('Token no proporcionado');
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

        // Verificar que el usuario existe y no está eliminado
        const usuario = await this.prisma.usuario.findFirst({
          where: { 
            id: payload.id,
            deleted: false
          },
          select: {
            id: true,
            nombre: true,
            rol: true
          }
        });

        if (!usuario) {
          throw new UnauthorizedException('Usuario no encontrado');
        }

        request['usuario'] = usuario;
        return true;
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        throw new UnauthorizedException('Token inválido o expirado');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Error al procesar la autenticación');
    }
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' && token ? token : undefined;
  }
}
