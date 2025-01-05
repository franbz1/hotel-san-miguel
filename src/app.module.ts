import { Module } from '@nestjs/common';
import { UsuariosModule } from './usuarios/usuarios.module';
import { HuespedesModule } from './huespedes/huespedes.module';
import { DocumentosModule } from './documentos/documentos.module';
import { FacturasModule } from './facturas/facturas.module';

@Module({
  imports: [UsuariosModule, HuespedesModule, DocumentosModule, FacturasModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
