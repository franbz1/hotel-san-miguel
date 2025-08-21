import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class JwtCookieGuardGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const raw = req.headers['cookie'] as string;
    const cookies = parseCookies(raw);

    if (!cookies?.__Host_auth_token) {
      throw new UnauthorizedException();
    }

    req.headers['authorization'] = `Bearer ${cookies.__Host_auth_token}`;

    return true;
  }
}

function parseCookies(cookieHeader: string) {
  return Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, v] = c.trim().split('=');
      return [k, decodeURIComponent(v)];
    }),
  );
}
