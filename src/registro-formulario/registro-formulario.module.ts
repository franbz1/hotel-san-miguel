import { Module } from '@nestjs/common';
import { RegistroFormularioController } from './registro-formulario.controller';
import { RegistroFormularioService } from './registro-formulario.service';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { TraModule } from 'src/TRA/tra.module';
import { HuespedesModule } from 'src/huespedes/huespedes.module';
import { DtoFactoryModule } from 'src/common/factories/dto_Factory/dtoFactoryModule.module';
import { ReservasModule } from 'src/reservas/reservas.module';
import { FacturasModule } from 'src/facturas/facturas.module';
import { HuespedesSecundariosModule } from 'src/huespedes-secundarios/huespedes-secundarios.module';
import { FormularioService } from './formulario/formulario.service';
import { HabitacionesModule } from 'src/habitaciones/habitaciones.module';
import { SireModule } from 'src/sire/sire.module';
import { AuthModule } from 'src/auth/auth.module';
import { LinkFormularioModule } from 'src/link-formulario/link-formulario.module';
import { FormulariosModule } from 'src/formularios/formularios.module';

@Module({
  controllers: [RegistroFormularioController],
  providers: [RegistroFormularioService, FormularioService],
  imports: [
    PrismaModule,
    TraModule,
    HuespedesModule,
    DtoFactoryModule,
    ReservasModule,
    FacturasModule,
    HuespedesSecundariosModule,
    HabitacionesModule,
    SireModule,
    AuthModule,
    LinkFormularioModule,
    FormulariosModule,
  ],
})
export class RegistroFormularioModule {}
