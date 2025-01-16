import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { envs } from 'src/config/envs';

@Injectable()
export class LinkFormularioGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromParam(request);

    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: envs.jwtSecret,
      });
      request['usuario'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return Promise.resolve(true);
  }

  extractTokenFromParam(request: Request): string | undefined {
    const token = request.params.token;
    return token ? token : undefined;
  }
}
