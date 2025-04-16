import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FormulariosService } from './formularios.service';
import { UpdateFormularioDto } from './dto/update-formulario.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/usuarios/entities/rol.enum';

@ApiTags('formularios')
@Auth(Role.CAJERO, Role.ADMINISTRADOR)
@Controller('formularios')
export class FormulariosController {
  constructor(private readonly formulariosService: FormulariosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los formularios' })
  @ApiResponse({ status: 200, description: 'Lista de formularios' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.formulariosService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formulariosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFormularioDto: UpdateFormularioDto,
  ) {
    return this.formulariosService.update(+id, updateFormularioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formulariosService.remove(+id);
  }
}
