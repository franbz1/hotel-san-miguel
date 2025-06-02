import { Module } from '@nestjs/common';
import { SireService } from './sire.service';
import { SireController } from './sire.controller';
import { CreateDocModule } from 'src/common/create-doc/create-doc.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';
@Module({
  providers: [SireService],
  controllers: [SireController],
  imports: [CreateDocModule, AuthModule, PrismaModule],
  exports: [SireService],
})
export class SireModule {}
