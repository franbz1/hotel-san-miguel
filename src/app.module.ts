import { Module } from '@nestjs/common';
import { UsuariosModule } from './usuarios/usuarios.module';
import { HuespedesModule } from './huespedes/huespedes.module';
import { DocumentosModule } from './documentos/documentos.module';
import { HabitacionesModule } from './habitaciones/habitaciones.module';
import { HuespedesSecundariosModule } from './huespedes-secundarios/huespedes-secundarios.module';

@Module({
  imports: [
    UsuariosModule,
    HuespedesModule,
    DocumentosModule,
    HabitacionesModule,
    HuespedesSecundariosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
