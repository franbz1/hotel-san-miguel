import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { RegistroFormularioService } from './registro-formulario.service';
import { CreateRegistroFormularioDto } from './dto/createRegistroFormularioDto';
import { LinkFormularioGuard } from 'src/auth/guards/linkFormulario.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import RequestReturnJWT from 'src/auth/interfaces/requestReturnJWT';

@Controller('registro-formulario')
export class RegistroFormularioController {
  constructor(
    private readonly registroFormularioService: RegistroFormularioService,
  ) {}

  @Post(':token')
  @Roles(Role.REGISTRO_FORMULARIO)
  @UseGuards(LinkFormularioGuard, RolesGuard)
  create(
    @Body() createRegistroFormularioDto: CreateRegistroFormularioDto,
    @Req() req: RequestReturnJWT,
  ) {
    return this.registroFormularioService.create(
      createRegistroFormularioDto,
      req.usuario.id,
    );
  }

  //@Auth(Role.ADMINISTRADOR, Role.CAJERO)
  @Get()
  createLinkTemporal() {
    return this.registroFormularioService.createLinkTemporal();
  }
}
