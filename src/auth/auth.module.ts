import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config/envs';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    UsuariosModule,
    JwtModule.register({
      global: true,
      secret: envs.jwtSecret,
    }),
  ],
})
export class AuthModule {}
