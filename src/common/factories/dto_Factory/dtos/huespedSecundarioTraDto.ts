import { CreateHuespedPrincipalTraDto } from 'src/TRA/dto/huespedPrincipalTraDto';
import { DtoFactoryInterface } from '../dtoFactoryInterface';
import { HuespedSecundario } from '@prisma/client';

export class HuespedSecundarioTraFactoryDto
  implements
    DtoFactoryInterface<HuespedSecundario, CreateHuespedPrincipalTraDto>
{
  create(
    inputDto: HuespedSecundario,
    ...args: any[]
  ): CreateHuespedPrincipalTraDto {
    const {
      numero_documento,
      tipo_documento,
      nombres,
      primer_apellido,
      segundo_apellido,
      ciudad_residencia,
      ciudad_procedencia,
    } = inputDto;
  }
}
