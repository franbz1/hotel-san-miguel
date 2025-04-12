import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config/envs';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { BlacklistService } from './blacklist.service';

@Module({
  providers: [AuthService, BlacklistService],
  controllers: [AuthController],
  imports: [
    UsuariosModule,
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: envs.jwtSecret,
    }),
  ],
  exports: [BlacklistService],
})
export class AuthModule {}
