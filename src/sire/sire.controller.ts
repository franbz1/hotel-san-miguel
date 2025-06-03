import { Body, Controller, Post } from '@nestjs/common';
import { SireService } from './sire.service';
import { HuespedesSireDto } from './dtos/HuespedSireDto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('sire')
@ApiBearerAuth()
@Auth(Role.ADMINISTRADOR)
@Controller('sire')
export class SireController {
  constructor(private readonly sireService: SireService) {}

  @Post('test')
  @ApiOperation({
    summary: 'Probar carga de huésped a SIRE',
    description:
      'Endpoint de prueba para cargar información de un huésped al sistema SIRE',
  })
  @ApiBody({
    type: HuespedesSireDto,
    description: 'Datos del huésped para cargar en SIRE',
  })
  @ApiResponse({
    status: 200,
    description: 'Huésped cargado exitosamente en SIRE',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticación inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos suficientes',
  })
  @ApiResponse({
    status: 500,
    description: 'Error en la integración con SIRE',
  })
  test(@Body() data: HuespedesSireDto) {
    return this.sireService.uploadOneToSire(data);
  }
}
