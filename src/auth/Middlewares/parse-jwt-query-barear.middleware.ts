import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request } from 'express';

@Injectable()
export class ParseJwtQueryBarearMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.query.token && !req.headers['authorization']) {
      req.headers['authorization'] = `Bearer ${req.query.token}`;
    }
    next();
  }
}
