import { Body, Controller, Post } from '@nestjs/common';
import { CreateRegistroFormularioDto } from 'src/registro-formulario/dto/createRegistroFormularioDto';
import { TraService } from './tra.service';

@Controller('tra')
export class TraController {
  constructor(private readonly traService: TraService) {}

  @Post('test')
  test(@Body() createRegistroFormularioDto: CreateRegistroFormularioDto) {
    return this.traService.postTraHuespedPrincipalFromForm(
      createRegistroFormularioDto,
    );
  }
}
