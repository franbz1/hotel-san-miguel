import { Module } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ReservasController],
  providers: [ReservasService],
  imports: [PrismaModule, AuthModule],
  exports: [ReservasService],
})
export class ReservasModule {}
