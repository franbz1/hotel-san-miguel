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
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';

@UseGuards(AuthGuard)
@Controller('habitaciones')
export class HabitacionesController {
  constructor(private readonly habitacionesService: HabitacionesService) {}

  @Roles(Role.ADMINISTRADOR)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createHabitacionDto: CreateHabitacionDto) {
    return this.habitacionesService.create(createHabitacionDto);
  }

  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.habitacionesService.findAll(paginationDto);
  }

  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @UseGuards(AuthGuard)
  @Get('numero_habitacion/:numeroHabitacion')
  findByNumeroHabitacion(
    @Param('numeroHabitacion', ParseIntPipe) numeroHabitacion: number,
  ) {
    return this.habitacionesService.findByNumeroHabitacion(numeroHabitacion);
  }

  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.habitacionesService.findOne(id);
  }

  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHabitacionDto: UpdateHabitacionDto,
  ) {
    return this.habitacionesService.update(id, updateHabitacionDto);
  }

  @Roles(Role.ADMINISTRADOR)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.habitacionesService.remove(id);
  }
}
