import { Module } from '@nestjs/common';
import { UsuariosModule } from './usuarios/usuarios.module';
import { HuespedesModule } from './huespedes/huespedes.module';

@Module({
  imports: [UsuariosModule, HuespedesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
