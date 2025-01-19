import { Module } from '@nestjs/common';
import { TraService } from './tra.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [TraService],
  exports: [TraService],
})
export class TraModule {}
