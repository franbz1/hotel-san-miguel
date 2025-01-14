import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [UsuariosModule],
})
export class AuthModule {}
