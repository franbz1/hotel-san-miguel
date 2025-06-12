import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ZonasComunesService } from './zonas-comunes.service';
import { CreateZonasComuneDto } from './dto/create-zonas-comune.dto';
import { UpdateZonasComuneDto } from './dto/update-zonas-comune.dto';

@Controller('zonas-comunes')
export class ZonasComunesController {
  constructor(private readonly zonasComunesService: ZonasComunesService) {}

  @Post()
  create(@Body() createZonasComuneDto: CreateZonasComuneDto) {
    return this.zonasComunesService.create(createZonasComuneDto);
  }

  @Get()
  findAll() {
    return this.zonasComunesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zonasComunesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateZonasComuneDto: UpdateZonasComuneDto) {
    return this.zonasComunesService.update(+id, updateZonasComuneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zonasComunesService.remove(+id);
  }
}
