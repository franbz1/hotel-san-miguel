import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';

@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Post()
  create(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturasService.create(createFacturaDto);
  }

  @Get()
  findAll() {
    return this.facturasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facturasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFacturaDto: UpdateFacturaDto) {
    return this.facturasService.update(+id, updateFacturaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facturasService.remove(+id);
  }
}
