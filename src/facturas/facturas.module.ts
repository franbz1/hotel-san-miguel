import { Module } from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { FacturasController } from './facturas.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  controllers: [FacturasController],
  providers: [FacturasService],
  imports: [PrismaModule],
})
export class FacturasModule {}
