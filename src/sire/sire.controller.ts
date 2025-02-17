import { Body, Controller, Post } from '@nestjs/common';
import { SireService } from './sire.service';
import { HuespedesSireDto } from './dtos/HuespedSireDto';

@Controller('sire')
export class SireController {
  constructor(private readonly sireService: SireService) {}

  @Post('test')
  test(@Body() data: HuespedesSireDto) {
    return this.sireService.uploadOneToSire(data);
  }
}
