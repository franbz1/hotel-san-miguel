import { CreateRegistroFormularioDto } from 'src/registro-formulario/dto/createRegistroFormularioDto';
import { DtoFactoryInterface } from '../dtoFactoryInterface';
import { CreateReservaDto } from 'src/reservas/dto/create-reserva.dto';
import { EstadosReserva } from 'src/common/enums/estadosReserva.enum';

export class ReservaTraDtoFactory
  implements DtoFactoryInterface<CreateRegistroFormularioDto, CreateReservaDto>
{
  create(
    inputDto: CreateRegistroFormularioDto,
    huespedId: number,
    habitacionId: number,
  ): CreateReservaDto {
    const {
      fecha_inicio,
      fecha_fin,
      pais_residencia,
      ciudad_residencia,
      motivo_viaje,
      costo,
      numero_acompaniantes,
    } = inputDto;

    return {
      fecha_inicio,
      fecha_fin,
      estado: EstadosReserva.RESERVADO,
      pais_procedencia: pais_residencia,
      ciudad_procedencia: ciudad_residencia,
      pais_destino: pais_residencia,
      motivo_viaje,
      check_in: fecha_inicio,
      check_out: fecha_fin,
      costo,
      numero_acompaniantes,
      habitacionId,
      huespedId: huespedId,
    };
  }
}
