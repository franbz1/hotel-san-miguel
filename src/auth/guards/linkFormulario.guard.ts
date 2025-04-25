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
import { LinkFormulario } from '@prisma/client';

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

    // First extract ID from token without validation to check if form is completed
    const decodedToken = this.decodeToken(token);

    // Get form and check completion status first (highest priority)
    const formulario = await this.getFormulario(decodedToken.id);
    if (formulario.completado) {
      throw new UnauthorizedException('Formulario ya completado');
    }

    // Now validate token (this will throw for expired tokens)
    const payload = await this.validateToken(token);

    if (formulario.expirado) {
      throw new UnauthorizedException('Link expirado');
    }

    // Check if token is in blacklist
    const isBlacklisted = await this.blacklistService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Link invalido');
    }

    // Attach payload to request for RolesGuard
    request['usuario'] = payload;

    return true;
  }

  private getRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest<Request>();
  }

  private extractTokenFromParam(request: Request): string {
    const token = request.params.token;

    if (!token) {
      throw new UnauthorizedException('Link invalido');
    }

    return token;
  }

  private decodeToken(token: string): any {
    try {
      // Just decode without verification to get the ID
      return this.jwtService.decode(token);
    } catch {
      throw new UnauthorizedException('Link invalido');
    }
  }

  private async validateToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: envs.jwtSecret,
      });

      return payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return this.handleExpiredToken(token);
      }
      throw new UnauthorizedException('Link invalido');
    }
  }

  private async handleExpiredToken(token: string): Promise<void> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: envs.jwtSecret,
      ignoreExpiration: true,
    });

    if (payload?.id) {
      await this.linkFormularioService.update(payload.id, {
        expirado: true,
      });
    }
    throw new UnauthorizedException('Link expirado');
  }

  private async getFormulario(id: number): Promise<LinkFormulario> {
    try {
      return await this.linkFormularioService.findOne(id);
    } catch {
      throw new UnauthorizedException('Link invalido');
    }
  }
}
