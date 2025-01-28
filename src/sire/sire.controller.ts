import { Body, Controller, Post } from '@nestjs/common';
import { SireService } from './sire.service';
import { huespedesSireDto } from './dtos/HuespedSireDto';

@Controller('sire')
export class SireController {
  constructor(private readonly sireService: SireService) {}

  @Post('test')
  test(@Body() data: huespedesSireDto) {
    return this.sireService.uploadOneToSire(data);
  }
}
