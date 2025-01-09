import { Module } from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { FacturasController } from './facturas.controller';

@Module({
  controllers: [FacturasController],
  providers: [FacturasService],
})
export class FacturasModule {}
