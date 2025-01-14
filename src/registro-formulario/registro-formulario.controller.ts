import { Body, Controller, Post } from '@nestjs/common';
import { RegistroFormularioService } from './registro-formulario.service';
import { CreateRegistroFormularioDto } from './dto/createRegistroFormularioDto';

@Controller('registro-formulario')
export class RegistroFormularioController {
  constructor(
    private readonly registroFormularioService: RegistroFormularioService,
  ) {}

  @Post()
  create(@Body() createRegistroFormularioDto: CreateRegistroFormularioDto) {
    return this.registroFormularioService.create(createRegistroFormularioDto);
  }
}
