import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { RegistroFormularioService } from './registro-formulario.service';
import { CreateRegistroFormularioDto } from './dto/createRegistroFormularioDto';
import { LinkFormularioGuard } from 'src/auth/guards/linkFormulario.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import RequestReturnJWT from 'src/auth/interfaces/requestReturnJWT';
import { LinkFormularioService } from './link-formulario/linkFormulario.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger'; // Importa solo lo necesario

@ApiTags('registro-formulario')
@Controller('registro-formulario')
export class RegistroFormularioController {
  constructor(
    private readonly registroFormularioService: RegistroFormularioService,
    private readonly linkFormularioService: LinkFormularioService,
  ) {}

  @Post(':token')
  @Roles(Role.REGISTRO_FORMULARIO)
  @UseGuards(LinkFormularioGuard, RolesGuard)
  @ApiOperation({ summary: 'Crear un registro de formulario' })
  @ApiParam({
    name: 'token',
    description: 'Token del formulario',
    type: String,
  })
  @ApiBody({ type: CreateRegistroFormularioDto })
  @ApiResponse({ status: 201, description: 'Registro de formulario creado' }) // No se especifica el tipo porque no se importa la entidad
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBearerAuth()
  create(
    @Body() createRegistroFormularioDto: CreateRegistroFormularioDto,
    @Req() req: RequestReturnJWT,
  ) {
    return this.registroFormularioService.create(
      createRegistroFormularioDto,
      req.usuario.id,
    );
  }

  @Get()
  //@Auth(Role.ADMINISTRADOR, Role.CAJERO)
  @ApiOperation({ summary: 'Crear enlace temporal para formulario' })
  @ApiResponse({
    status: 200,
    description: 'Enlace temporal creado',
    type: String,
  })
  createLinkTemporal() {
    return this.linkFormularioService.createLinkTemporal();
  }
}
