import { Injectable } from '@nestjs/common';
import { CreateHuespedPrincipalTraDto } from './dto/huespedPrincipalDto';
import { HttpService } from '@nestjs/axios';
import { TRA_CREDENCIALES } from 'src/common/constants/TraCredenciales';
import { PostHuespedPrincipalDto } from './dto/postHuespedPrincipal';
import { CreateRegistroFormularioDto } from 'src/registro-formulario/dto/createRegistroFormularioDto';
import { HabitacionesService } from 'src/habitaciones/habitaciones.service';
import { firstValueFrom } from 'rxjs';
import { Genero } from 'src/common/enums/generos.enum';
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

  async postTraHuespedPrincipalFromForm(
    registroFormularioDto: CreateRegistroFormularioDto,
  ) {
    const huespedPrincipalDto = await this.traHuespedPrincipalAdapter(
      registroFormularioDto,
    );

    const payload: PostHuespedPrincipalDto = {
      ...huespedPrincipalDto,
      nombre_establecimiento: TRA_CREDENCIALES.NOMBRE_ESTABLECIMIENTO,
      nit_establecimiento: TRA_CREDENCIALES.NIT_ESTABLECIMIENTO,
      rnt_establecimiento: TRA_CREDENCIALES.RNT_ESTABLECIMIENTO,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `token ${TRA_CREDENCIALES.TOKEN_ESTABLECIMIENTO}`,
    };

    const endpoint = TRA_CREDENCIALES.ENDPOINT_TRA_PRINCIPAL;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(endpoint, payload, {
          headers,
        }),
      );

      console.log(data);
      return data;
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
      nacionalidad,
      fecha_nacimiento,
      genero,
      motivo_viaje,
      ocupacion,
      habitacionId,
      pais_residencia,
      departamento_residencia,
      ciudad_residencia,
      fecha_inicio,
      fecha_fin,
      costo,
      numero_acompaniantes,
    } = registroFormularioDto;

    const habitacion = await this.habitacionesService.findOne(habitacionId);

    if (!habitacion) throw new Error('no se encontró la habitación');

    const generoSigla = () => {
      switch (genero) {
        case Genero.MASCULINO:
          return 'M';
        case Genero.FEMENINO:
          return 'F';
        case Genero.OTRO:
          return 'OTRO';
        default:
          return 'OTRO';
      }
    };

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
      lugar_nacimiento: nacionalidad,
      fecha_nacimiento: fecha_nacimiento,
      genero: generoSigla().toString(),
      nacionalidad,
      n_habitaciones: TRA_CREDENCIALES.NUMERO_HABITACIONES,
      motivo: motivoViajeText().toString(),
      ocupacion,
      pais_residencia,
      departamento_residencia,
      cuidad_residencia: ciudad_residencia,
      pais_procedencia: pais_residencia,
      departamento_procedencia: departamento_residencia,
      cuidad_procedencia: ciudad_residencia,
      check_in: fecha_inicio,
      check_out: fecha_fin,
      costo: costo.toString(),
      numero_acompanantes: numero_acompaniantes.toString(),
      medio_pago: TRA_CREDENCIALES.MEDIO_PAGO,
      medio_reserva: TRA_CREDENCIALES.MEDIO_RESERVA,
      tipo_acomodacion: 'Ninguna',
      numero_habitacion: habitacion.id.toString(),
    };
  }
}
