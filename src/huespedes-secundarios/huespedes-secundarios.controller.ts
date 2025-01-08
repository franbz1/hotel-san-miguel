import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { HuespedesSecundariosService } from './huespedes-secundarios.service';
import { CreateHuespedSecundarioDto } from './dto/create-huesped-secundario.dto';
import { UpdateHuespedSecundarioDto } from './dto/update-huesped-secundario.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';

@Controller('huespedes-secundarios')
export class HuespedesSecundariosController {
  constructor(
    private readonly huespedesSecundariosService: HuespedesSecundariosService,
  ) {}

  @Post()
  create(@Body() CreateHuespedSecundarioDto: CreateHuespedSecundarioDto) {
    return this.huespedesSecundariosService.create(CreateHuespedSecundarioDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.huespedesSecundariosService.findAll(paginationDto);
  }

  @Get('huespedId/:huespedId')
  findAllByHuespedId(
    @Param('huespedId', ParseIntPipe) huespedId: number,
    @Body() paginationDto: PaginationDto,
  ) {
    return this.huespedesSecundariosService.findAllHuespedesSecundariosByHuespedId(
      huespedId,
      paginationDto,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.huespedesSecundariosService.findOne(id);
  }

  @Get('numeroDocumento/:numeroDocumento')
  findByNumeroDocumento(@Param('numeroDocumento') numeroDocumento: string) {
    return this.huespedesSecundariosService.findByNumeroDocumento(
      numeroDocumento,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() UpdateHuespedSecundarioDto: UpdateHuespedSecundarioDto,
  ) {
    return this.huespedesSecundariosService.update(
      +id,
      UpdateHuespedSecundarioDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.huespedesSecundariosService.remove(+id);
  }
}
