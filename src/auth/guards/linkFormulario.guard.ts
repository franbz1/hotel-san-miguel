import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';

import { envs } from 'src/config/envs';
import { LinkFormularioService } from 'src/link-formulario/link-formulario.service';
import { BlacklistService } from '../blacklist.service';

@Injectable()
export class LinkFormularioGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly linkFormularioService: LinkFormularioService,
    private readonly blacklistService: BlacklistService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    const token = this.extractTokenFromParam(request);

    // Verificar si el token está en la lista negra
    const isBlacklisted = await this.blacklistService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token ha sido invalidado');
    }

    const payload = await this.validateToken(token);
    await this.validateFormulario(payload.id);

    request['usuario'] = payload;

    return true;
  }

  private getRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest<Request>();
  }

  private extractTokenFromParam(request: Request): string {
    const token = request.params.token;

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    return token;
  }

  private async validateToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: envs.jwtSecret,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return this.handleExpiredToken(token);
      }
      throw new UnauthorizedException();
    }
  }

  private async handleExpiredToken(token: string): Promise<never> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: envs.jwtSecret,
      ignoreExpiration: true,
    });

    if (payload?.id) {
      await this.linkFormularioService.update(payload.id, {
        expirado: true,
      });
    }

    throw new UnauthorizedException('Token expirado');
  }

  private async validateFormulario(id: number): Promise<void> {
    const formulario = await this.linkFormularioService.findOne(id);
    if (!formulario) {
      throw new UnauthorizedException('Formulario no encontrado');
    }

    if (formulario.expirado) {
      throw new UnauthorizedException('Formulario expirado');
    }

    if (formulario.completado) {
      throw new UnauthorizedException('Formulario ya completado');
    }
  }
}
