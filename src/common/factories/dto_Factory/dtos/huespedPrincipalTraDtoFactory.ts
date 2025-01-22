import { CreateRegistroFormularioDto } from 'src/registro-formulario/dto/createRegistroFormularioDto';
import { DtoFactoryInterface } from '../dtoFactoryInterface';
import { CreateHuespedPrincipalTraDto } from 'src/TRA/dto/huespedPrincipalTraDto';
import { MotivosViajes } from 'src/common/enums/motivosViajes.enum';
import { Habitacion } from '@prisma/client';

export class HuespedPrincipalTraDtoFactory
  implements
    DtoFactoryInterface<
      CreateRegistroFormularioDto,
      CreateHuespedPrincipalTraDto
    >
{
  create(
    inputDto: CreateRegistroFormularioDto,
    habitacion: Habitacion,
  ): CreateHuespedPrincipalTraDto {
    const {
      tipo_documento,
      numero_documento,
      primer_apellido,
      segundo_apellido,
      nombres,
      motivo_viaje,
      ciudad_residencia,
      fecha_inicio,
      fecha_fin,
      costo,
      numero_acompaniantes,
    } = inputDto;

    const motivoViajeText = () => {
      switch (motivo_viaje) {
        case MotivosViajes.NEGOCIOS_Y_MOTIVOS_PROFESIONALES:
          return 'Negocios y motivos profesionales';
        case MotivosViajes.VACACIONES_RECREO_Y_OCIO:
          return 'Vacaciones, recreo y ocio';
        case MotivosViajes.VISITAS_A_FAMILIARES_Y_AMIGOS:
          return 'Visitas a familiares y amigos';
        case MotivosViajes.EDUCACION_Y_FORMACION:
          return 'Educación y formación';
        case MotivosViajes.SALUD_Y_ATENCION_MEDICA:
          return 'Salud y atención medica';
        case MotivosViajes.RELIGION_Y_PEREGRINACIONES:
          return 'Religion y peregrinaciones';
        case MotivosViajes.COMPRAS:
          return 'Compras';
        case MotivosViajes.TRANSITO:
          return 'Transito';
        case MotivosViajes.OTROS_MOTIVOS:
          return 'Otros motivos';
        default:
          return 'Otros motivos';
      }
    };

    return {
      numero_identificacion: numero_documento,
      tipo_identificacion: tipo_documento,
      nombres,
      apellidos: `${primer_apellido} ${segundo_apellido}`,
      motivo: motivoViajeText().toString(),
      cuidad_residencia: ciudad_residencia,
      cuidad_procedencia: ciudad_residencia,
      check_in: fecha_inicio,
      check_out: fecha_fin,
      costo: costo.toString(),
      numero_acompanantes: numero_acompaniantes.toString(),
      tipo_acomodacion: habitacion.tipo.toString(),
      numero_habitacion: habitacion.id.toString(),
    };
  }
}
