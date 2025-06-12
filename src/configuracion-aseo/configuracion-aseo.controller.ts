import { Controller } from '@nestjs/common';
import { ConfiguracionAseoService } from './configuracion-aseo.service';

@Controller('configuracion-aseo')
export class ConfiguracionAseoController {
  constructor(private readonly configuracionAseoService: ConfiguracionAseoService) {}
}
