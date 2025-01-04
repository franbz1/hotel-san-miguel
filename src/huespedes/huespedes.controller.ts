import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { HuespedesService } from './huespedes.service';
import { CreateHuespedDto } from './dto/create-huesped.dto';
import { UpdateHuespedeDto } from './dto/update-huespede.dto';

@Controller('huespedes')
export class HuespedesController {
  constructor(private readonly huespedesService: HuespedesService) {}

  @Post()
  create(@Body() CreateHuespedDto: CreateHuespedDto) {
    return this.huespedesService.create(CreateHuespedDto);
  }

  @Get()
  findAll() {
    return this.huespedesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.huespedesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHuespedeDto: UpdateHuespedeDto,
  ) {
    return this.huespedesService.update(+id, updateHuespedeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.huespedesService.remove(id);
  }
}
