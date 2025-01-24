import { DtoFactoryInterface } from '../dtoFactoryInterface';
import { CreateHuespedSecundarioWithoutIdDto } from 'src/registro-formulario/dto/CreateHuespedSecundarioWithoutIdDto';
import { CreateHuespedSecundarioTraDto } from 'src/TRA/dto/huespedSecundarioTraDto';

export class HuespedSecundarioTraFactoryDto
  implements
    DtoFactoryInterface<
      CreateHuespedSecundarioWithoutIdDto,
      CreateHuespedSecundarioTraDto
    >
{
  create(
    inputDto: CreateHuespedSecundarioWithoutIdDto,
    numero_habitacion: number,
    padreId: number,
    check_in: Date,
    check_out: Date,
  ): CreateHuespedSecundarioTraDto {
    const {
      numero_documento,
      tipo_documento,
      nombres,
      primer_apellido,
      segundo_apellido,
      ciudad_residencia,
      ciudad_procedencia,
    } = inputDto;

    return {
      tipo_identificacion: tipo_documento,
      numero_identificacion: numero_documento,
      nombres,
      apellidos: `${primer_apellido} ${segundo_apellido}`,
      cuidad_residencia: ciudad_residencia,
      cuidad_procedencia: ciudad_procedencia,
      numero_habitacion: numero_habitacion.toString(),
      check_in,
      check_out,
      padre: padreId.toString(),
    };
  }
}
