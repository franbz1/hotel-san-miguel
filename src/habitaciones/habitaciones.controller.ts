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
import { HabitacionesService } from './habitaciones.service';
import { CreateHabitacionDto } from './dto/create-habitacion.dto';
import { UpdateHabitacionDto } from './dto/update-habitacion.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';

@Controller('habitaciones')
export class HabitacionesController {
  constructor(private readonly habitacionesService: HabitacionesService) {}

  @Post()
  create(@Body() createHabitacionDto: CreateHabitacionDto) {
    return this.habitacionesService.create(createHabitacionDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.habitacionesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.habitacionesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHabitacionDto: UpdateHabitacionDto,
  ) {
    return this.habitacionesService.update(id, updateHabitacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.habitacionesService.remove(+id);
  }
}
