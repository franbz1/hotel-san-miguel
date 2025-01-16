import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';

import { envs } from 'src/config/envs';
import { RegistroFormularioService } from 'src/registro-formulario/registro-formulario.service';

@Injectable()
export class LinkFormularioGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly registroFormularioService: RegistroFormularioService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromParam(request);

    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: envs.jwtSecret,
      });

      const formulario = await this.registroFormularioService.findOne(
        payload.id,
      );

      if (!formulario || formulario.expirado || formulario.completado) {
        throw new UnauthorizedException();
      }

      request['usuario'] = payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: envs.jwtSecret,
          ignoreExpiration: true,
        });

        if (payload?.id) {
          await this.registroFormularioService.update(payload.id, {
            expirado: true,
          });
        }

        throw new UnauthorizedException('Token expirado');
      }
      throw new UnauthorizedException();
    }
    return Promise.resolve(true);
  }

  extractTokenFromParam(request: Request): string | undefined {
    const token = request.params.token;
    return token ? token : undefined;
  }
}

/* import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { envs } from 'src/config/envs';
import { RegistroFormularioService } from 'src/registro-formulario/registro-formulario.service';

@Injectable()
export class LinkFormularioGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly registroFormularioService: RegistroFormularioService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    const token = this.extractTokenFromParam(request);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const payload = await this.validateToken(token);
    await this.validateFormulario(payload.id);

    request['usuario'] = payload; // Agregamos usuario a la request
    return true;
  }

  private getRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest<Request>();
  }

  private extractTokenFromParam(request: Request): string | undefined {
    return request.params.token;
  }

  private async validateToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: envs.jwtSecret,
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return this.handleExpiredToken(token);
      }
      throw new UnauthorizedException('Token inválido');
    }
  }

  private async handleExpiredToken(token: string): Promise<never> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: envs.jwtSecret,
      ignoreExpiration: true,
    });

    if (payload?.id) {
      await this.registroFormularioService.update(payload.id, { expirado: true });
    }

    throw new UnauthorizedException('Token expirado');
  }

  private async validateFormulario(id: string): Promise<void> {
    const formulario = await this.registroFormularioService.findOne(id);

    if (!formulario) {
      throw new UnauthorizedException('Formulario no encontrado');
    }

    if (formulario.expirado || formulario.completado) {
      throw new UnauthorizedException('Formulario inválido');
    }
  }
}
 */
