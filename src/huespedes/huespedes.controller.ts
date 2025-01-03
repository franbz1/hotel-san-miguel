import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HuespedesService } from './huespedes.service';
import { CreateHuespedeDto } from './dto/create-huespede.dto';
import { UpdateHuespedeDto } from './dto/update-huespede.dto';

@Controller('huespedes')
export class HuespedesController {
  constructor(private readonly huespedesService: HuespedesService) {}

  @Post()
  create(@Body() createHuespedeDto: CreateHuespedeDto) {
    return this.huespedesService.create(createHuespedeDto);
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
  update(@Param('id') id: string, @Body() updateHuespedeDto: UpdateHuespedeDto) {
    return this.huespedesService.update(+id, updateHuespedeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.huespedesService.remove(+id);
  }
}
