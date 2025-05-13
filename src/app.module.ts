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
import { CreateDocModule } from './common/create-doc/create-doc.module';
import { CreateDocService } from './common/create-doc/create-doc.service';
import { FormulariosModule } from './formularios/formularios.module';
import { EliminarBookingModule } from './eliminar-booking/eliminar-booking.module';
import { SseModule } from './sse/sse.module';
import { HabitacionSseService } from './sse/habitacionSse.service';
import { CronModule } from './cron/cron.module';

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
    CreateDocModule,
    FormulariosModule,
    EliminarBookingModule,
    SseModule,
    CronModule,
  ],
  controllers: [],
  providers: [CreateDocService, HabitacionSseService],
})
export class AppModule {}
