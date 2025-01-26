import { CreateRegistroFormularioDto } from 'src/registro-formulario/dto/createRegistroFormularioDto';
import { DtoFactoryInterface } from '../dtoFactoryInterface';
import { CreateFacturaDto } from 'src/facturas/dto/create-factura.dto';

export class FacturaTraDtoFactory
  implements DtoFactoryInterface<CreateRegistroFormularioDto, CreateFacturaDto>
{
  create(
    inputDto: CreateRegistroFormularioDto,
    huespedId: number,
  ): CreateFacturaDto {
    const { costo } = inputDto;

    return {
      total: costo,
      huespedId: huespedId,
      fecha_factura: new Date(),
    };
  }
}
