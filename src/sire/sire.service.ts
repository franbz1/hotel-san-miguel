import { Injectable, Logger } from '@nestjs/common';
import { huespedesSireDto } from './dtos/HuespedSireDto';
import { TxtIndentFile } from 'src/common/create-doc/factory/TxtIndentFile';

@Injectable()
export class SireService {
  constructor() {}

  private readonly logger = new Logger(SireService.name);

  async uploadToSire(huespedesSireDto: huespedesSireDto[]) {
    
  }

  async uploadOneToSire(huespedeSireDto: huespedesSireDto) {
    this.logger.debug(huespedeSireDto);

    const test = new TxtIndentFile();
    const data = await test.generate([huespedeSireDto]);
    this.logger.debug(data);
  }
}
