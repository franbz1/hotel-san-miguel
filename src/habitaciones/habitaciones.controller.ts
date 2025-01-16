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
  UseGuards,
} from '@nestjs/common';
import { HabitacionesService } from './habitaciones.service';
import { CreateHabitacionDto } from './dto/create-habitacion.dto';
import { UpdateHabitacionDto } from './dto/update-habitacion.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthGuard)
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

  @Get('numero_habitacion/:numeroHabitacion')
  findByNumeroHabitacion(
    @Param('numeroHabitacion', ParseIntPipe) numeroHabitacion: number,
  ) {
    return this.habitacionesService.findByNumeroHabitacion(numeroHabitacion);
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.habitacionesService.remove(id);
  }
}
