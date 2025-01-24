import { Injectable, Logger } from '@nestjs/common';
import { CreateHuespedPrincipalTraDto } from './dto/huespedPrincipalTraDto';
import { HttpService } from '@nestjs/axios';
import { TRA_CREDENCIALES } from 'src/common/constants/TraCredenciales';
import { PostHuespedPrincipalDto } from './dto/postHuespedPrincipal';
import { CreateRegistroFormularioDto } from 'src/registro-formulario/dto/createRegistroFormularioDto';
import { HabitacionesService } from 'src/habitaciones/habitaciones.service';
//import { firstValueFrom } from 'rxjs';
import { DtoFactoryService } from 'src/common/factories/dto_Factory/dtoFactoryService.service';
import { Huesped } from '@prisma/client';
import { CreateHuespedSecundarioTraDto } from './dto/huespedSecundarioTraDto';

/**
 * Servicio para conectarse a la API de TRA
 */
@Injectable()
export class TraService {
  constructor(
    private readonly httpService: HttpService,
    private readonly habitacionesService: HabitacionesService,
    private readonly dtoFactoryService: DtoFactoryService,
  ) {}

  private readonly logger = new Logger(TraService.name);

  async postTraHuespedPrincipalFromForm(
    registroFormularioDto: CreateRegistroFormularioDto,
  ) {
    const { habitacionId } = registroFormularioDto;

    const habitacion = await this.habitacionesService.findOne(habitacionId);

    if (!habitacion) throw new Error('no se encontró la habitación');

    const huespedPrincipalDto = this.dtoFactoryService
      .getFactory<
        CreateRegistroFormularioDto,
        CreateHuespedPrincipalTraDto
      >('huespedPrincipal')
      .create(registroFormularioDto, habitacion);

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

      //mock de la respuesta
      const data = {
        code: 1222,
      };

      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async postTraHuespedesSecundariosFromForm(
    huespedesSecundarios: Huesped[],
    padreId: number,
    numero_habitacion: number,
    check_in: Date,
    check_out: Date,
  ) {
    const huespedesSecundariosTraDto = huespedesSecundarios.map((huesped) =>
      this.dtoFactoryService
        .getFactory<Huesped, CreateHuespedSecundarioTraDto>('huespedSecundario')
        .create(huesped, numero_habitacion, padreId, check_in, check_out),
    );

    for (const huesped of huespedesSecundariosTraDto) {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `token ${TRA_CREDENCIALES.TOKEN_ESTABLECIMIENTO}`,
      };
      const endpoint = TRA_CREDENCIALES.ENDPOINT_TRA_SECUNDARIO;

      try {
        /*const { data } = await firstValueFrom(
          this.httpService.post(endpoint, huesped, {
            headers,
          }),
        ); */

        //mock de la respuesta
        const data = {
          code: 1222,
        };

        return data;
      } catch (error) {
        throw error;
      }
    }
  }
}
