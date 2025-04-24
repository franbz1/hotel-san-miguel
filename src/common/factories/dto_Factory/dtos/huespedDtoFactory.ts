import { CreateRegistroFormularioDto } from 'src/registro-formulario/dto/createRegistroFormularioDto';
import { DtoFactoryInterface } from '../dtoFactoryInterface';
import { CreateHuespedDto } from 'src/huespedes/dto/create-huesped.dto';

export class HuespedTraDtoFactory
  implements DtoFactoryInterface<CreateRegistroFormularioDto, CreateHuespedDto>
{
  create(inputDto: CreateRegistroFormularioDto): CreateHuespedDto {
    const {
      tipo_documento,
      numero_documento,
      primer_apellido,
      segundo_apellido,
      nombres,
      pais_residencia,
      ciudad_residencia,
      pais_procedencia,
      ciudad_procedencia,
      fecha_nacimiento,
      nacionalidad,
      ocupacion,
      genero,
      telefono,
      correo,
    } = inputDto;

    return {
      tipo_documento,
      numero_documento,
      primer_apellido,
      segundo_apellido,
      nombres,
      pais_residencia,
      ciudad_residencia,
      pais_procedencia,
      ciudad_procedencia,
      fecha_nacimiento,
      nacionalidad,
      ocupacion,
      genero,
      telefono,
      correo,
      lugar_nacimiento: nacionalidad,
    };
  }
}
