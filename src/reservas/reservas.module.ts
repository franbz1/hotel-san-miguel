import { Module } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  controllers: [ReservasController],
  providers: [ReservasService],
  imports: [PrismaModule],
})
export class ReservasModule {}
