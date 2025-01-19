import { Injectable, Logger } from '@nestjs/common';
import { CreateHuespedPrincipalTraDto } from './dto/huespedPrincipalDto';
import { HttpService } from '@nestjs/axios';
import { TRA_CREDENCIALES } from 'src/common/constants/TraCredenciales';
import { PostHuespedPrincipalDto } from './dto/postHuespedPrincipal';
import { CreateRegistroFormularioDto } from 'src/registro-formulario/dto/createRegistroFormularioDto';
import { HabitacionesService } from 'src/habitaciones/habitaciones.service';
import { firstValueFrom } from 'rxjs';
import { MotivosViajes } from 'src/common/enums/motivosViajes.enum';

/**
 * Servicio para conectarse a la API de TRA
 */
@Injectable()
export class TraService {
  constructor(
    private readonly httpService: HttpService,
    private readonly habitacionesService: HabitacionesService,
  ) {}

  private readonly logger = new Logger(TraService.name);

  async postTraHuespedPrincipalFromForm(
    registroFormularioDto: CreateRegistroFormularioDto,
  ) {
    const huespedPrincipalDto = await this.traHuespedPrincipalAdapter(
      registroFormularioDto,
    );

    const payload: PostHuespedPrincipalDto = {
      ...huespedPrincipalDto,
      nombre_establecimiento: TRA_CREDENCIALES.NOMBRE_ESTABLECIMIENTO,
      rnt_establecimiento: TRA_CREDENCIALES.RNT_ESTABLECIMIENTO,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `token ${TRA_CREDENCIALES.TOKEN_ESTABLECIMIENTO}`,
    };

    const endpoint = TRA_CREDENCIALES.ENDPOINT_TRA_PRINCIPAL;

    try {
      //const { data } = await firstValueFrom(
        //this.httpService.post(endpoint, payload, {
          //headers,
        //}),
      //);

      this.logger.debug(payload);
      this.logger.debug(headers);
      this.logger.debug(endpoint);

      //return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private async traHuespedPrincipalAdapter(
    registroFormularioDto: CreateRegistroFormularioDto,
  ): Promise<CreateHuespedPrincipalTraDto> {
    const {
      tipo_documento,
      numero_documento,
      primer_apellido,
      segundo_apellido,
      nombres,
      motivo_viaje,
      habitacionId,
      ciudad_residencia,
      fecha_inicio,
      fecha_fin,
      costo,
      numero_acompaniantes,
    } = registroFormularioDto;

    const habitacion = await this.habitacionesService.findOne(habitacionId);

    if (!habitacion) throw new Error('no se encontró la habitación');

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
      tipo_acomodacion: 'Ninguna',
      numero_habitacion: habitacion.id.toString(),
    };
  }
}
