import { Module } from '@nestjs/common';
import { EliminarBookingService } from './eliminar-booking.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { EliminarBookingController } from './eliminar-booking.controller';
import { LinkFormularioModule } from 'src/link-formulario/link-formulario.module';
import { ReservasModule } from 'src/reservas/reservas.module';
import { FormulariosModule } from 'src/formularios/formularios.module';
import { FacturasModule } from 'src/facturas/facturas.module';
import { HuespedesModule } from 'src/huespedes/huespedes.module';
import { HuespedesSecundariosModule } from 'src/huespedes-secundarios/huespedes-secundarios.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    LinkFormularioModule,
    ReservasModule,
    FormulariosModule,
    FacturasModule,
    HuespedesModule,
    HuespedesSecundariosModule,
    AuthModule,
  ],
  controllers: [EliminarBookingController],
  providers: [EliminarBookingService],
})
export class EliminarBookingModule {}
