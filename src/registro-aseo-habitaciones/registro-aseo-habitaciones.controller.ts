import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RegistroAseoHabitacionesService } from './registro-aseo-habitaciones.service';
import { CreateRegistroAseoHabitacioneDto } from './dto/create-registro-aseo-habitacione.dto';
import { UpdateRegistroAseoHabitacioneDto } from './dto/update-registro-aseo-habitacione.dto';

@Controller('registro-aseo-habitaciones')
export class RegistroAseoHabitacionesController {
  constructor(private readonly registroAseoHabitacionesService: RegistroAseoHabitacionesService) {}

  @Post()
  create(@Body() createRegistroAseoHabitacioneDto: CreateRegistroAseoHabitacioneDto) {
    return this.registroAseoHabitacionesService.create(createRegistroAseoHabitacioneDto);
  }

  @Get()
  findAll() {
    return this.registroAseoHabitacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registroAseoHabitacionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegistroAseoHabitacioneDto: UpdateRegistroAseoHabitacioneDto) {
    return this.registroAseoHabitacionesService.update(+id, updateRegistroAseoHabitacioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registroAseoHabitacionesService.remove(+id);
  }
}
