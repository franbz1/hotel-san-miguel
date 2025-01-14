import { Injectable } from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class AuthService {
  constructor(private readonly usuariosService: UsuariosService) {}
  async login() {
    return 'login';
  }

  async logout() {
    return 'logout';
  }
}
