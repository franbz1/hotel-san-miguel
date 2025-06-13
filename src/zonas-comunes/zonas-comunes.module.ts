import { Module } from '@nestjs/common';
import { ZonasComunesService } from './zonas-comunes.service';
import { ZonasComunesController } from './zonas-comunes.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ZonasComunesController],
  providers: [ZonasComunesService],
  exports: [ZonasComunesService],
})
export class ZonasComunesModule {}
