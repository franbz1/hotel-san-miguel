import { CreateHuespedPrincipalTraDto } from 'src/TRA/dto/huespedPrincipalTraDto';
import { DtoFactoryInterface } from '../dtoFactoryInterface';
import { HuespedSecundario } from '@prisma/client';

export class CreateHuespedSecundarioTraFactoryDto
  implements DtoFactoryInterface<HuespedSecundario, CreateHuespedPrincipalTraDto>
{
  create(inputDto: HuespedSecundario, ...args: any[]): CreateHuespedPrincipalTraDto {
    const {
      numero_documento,
      tipo_documento,
      nombres,
      primer_apellido,
      segundo_apellido,
      ciudad_residencia,
      //TODO: agregar ciudad procedencia en prisma ademas cambiar en HuespedSecundarioDto y servicio
    } = inputDto;
  }
}
