import { Request } from 'express';
import { Role } from 'src/usuarios/entities/rol.enum';

export default interface RequestReturnJWT extends Request {
  usuario: {
    id: number;
    rol: Role;
  };
}
