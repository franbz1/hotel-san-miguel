import { Module } from '@nestjs/common';
import { UsuariosModule } from './usuarios/usuarios.module';
import { HuespedesModule } from './huespedes/huespedes.module';
import { DocumentosModule } from './documentos/documentos.module';
import { HabitacionesModule } from './habitaciones/habitaciones.module';
import { HuespedesSecundariosModule } from './huespedes-secundarios/huespedes-secundarios.module';
import { FacturasModule } from './facturas/facturas.module';
import { ReservasModule } from './reservas/reservas.module';
import { RegistroFormularioModule } from './registro-formulario/registro-formulario.module';
import { AuthModule } from './auth/auth.module';
import { TraModule } from './TRA/tra.module';
import { SireModule } from './sire/sire.module';

@Module({
  imports: [
    UsuariosModule,
    HuespedesModule,
    DocumentosModule,
    HabitacionesModule,
    HuespedesSecundariosModule,
    FacturasModule,
    ReservasModule,
    RegistroFormularioModule,
    AuthModule,
    TraModule,
    SireModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
