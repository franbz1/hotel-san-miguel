import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { TRA_CREDENCIALES } from 'src/common/constants/TraCredenciales';
import { CreateRegistroFormularioDto } from 'src/registro-formulario/dto/createRegistroFormularioDto';
import { HabitacionesService } from 'src/habitaciones/habitaciones.service';
import { DtoFactoryService } from 'src/common/factories/dto_Factory/dtoFactoryService.service';
import { Habitacion } from '@prisma/client';
import { CreateHuespedSecundarioWithoutIdDto } from 'src/registro-formulario/dto/CreateHuespedSecundarioWithoutIdDto';
import { CreateHuespedPrincipalTraDto } from './dto/huespedPrincipalTraDto';
import { CreateHuespedSecundarioTraDto } from './dto/huespedSecundarioTraDto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TraService {
  private readonly logger = new Logger(TraService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly habitacionesService: HabitacionesService,
    private readonly dtoFactoryService: DtoFactoryService,
  ) {}

  /**
   * Procesa el registro en TRA para el huésped principal y secundarios.
   */
  async postTra(registroFormularioDto: CreateRegistroFormularioDto, habitacionId: number) {
    const { huespedes_secundarios, fecha_inicio, fecha_fin } =
      registroFormularioDto;

    const habitacion = await this.habitacionesService.findOne(habitacionId);

    if (!habitacion) {
      throw new Error('No se encontró la habitación');
    }

    const huespedPrincipalResponse = await this.postTraHuespedPrincipalFromForm(
      registroFormularioDto,
      habitacion,
    );

    const huespedesSecundariosData =
      await this.postTraHuespedesSecundariosFromForm(
        huespedes_secundarios,
        huespedPrincipalResponse.code,
        habitacion.numero_habitacion,
        fecha_inicio,
        fecha_fin,
      );

    return {
      huespedPrincipal: huespedPrincipalResponse,
      huespedesSecundarios: huespedesSecundariosData,
    };
  }

  /**
   * Registra al huésped principal en TRA.
   */
  private async postTraHuespedPrincipalFromForm(
    registroFormularioDto: CreateRegistroFormularioDto,
    habitacion: Habitacion,
  ) {
    const payload = this.createHuespedPrincipalPayload(
      registroFormularioDto,
      habitacion,
    );

    return await this.postToTraEndpoint(
      TRA_CREDENCIALES.ENDPOINT_TRA_PRINCIPAL,
      payload,
    );
  }

  /**
   * Registra a los huéspedes secundarios en TRA.
   */
  private async postTraHuespedesSecundariosFromForm(
    huespedesSecundarios: CreateHuespedSecundarioWithoutIdDto[],
    padreId: number,
    numero_habitacion: number,
    check_in: Date,
    check_out: Date,
  ) {
    const huespedesSecundariosData = [];

    if (!huespedesSecundarios?.length) return [];

    const huespedesSecundariosTraDtos = huespedesSecundarios.map((huesped) =>
      this.dtoFactoryService
        .getFactory<
          CreateHuespedSecundarioWithoutIdDto,
          CreateHuespedSecundarioTraDto
        >('huespedSecundario')
        .create(huesped, numero_habitacion, padreId, check_in, check_out),
    );

    for (const huesped of huespedesSecundariosTraDtos) {
      huespedesSecundariosData.push(
        await this.postToTraEndpoint(
          TRA_CREDENCIALES.ENDPOINT_TRA_SECUNDARIO,
          huesped,
        ),
      );
    }
    return huespedesSecundariosData;
  }

  /**
   * Crea el payload para el registro del huésped principal.
   */
  private createHuespedPrincipalPayload(
    registroFormularioDto: CreateRegistroFormularioDto,
    habitacion: Habitacion,
  ) {
    const huespedPrincipalDto = this.dtoFactoryService
      .getFactory<
        CreateRegistroFormularioDto,
        CreateHuespedPrincipalTraDto
      >('huespedPrincipal')
      .create(registroFormularioDto, habitacion);

    return {
      ...huespedPrincipalDto,
      nombre_establecimiento: TRA_CREDENCIALES.NOMBRE_ESTABLECIMIENTO,
      rnt_establecimiento: TRA_CREDENCIALES.RNT_ESTABLECIMIENTO,
    };
  }

  /**
   * Realiza una petición a un endpoint de TRA.
   */
  private async postToTraEndpoint(endpoint: string, payload: any) {
    const headers = this.createTraHeaders();

    try {
      // Para entornos reales, descomentar la línea siguiente
      // const { data } = await firstValueFrom(
      //   this.httpService.post(endpoint, payload, { headers }),
      // );

       // Mock para entornos de desarrollo
      const data = { code: 1222 }; // Mock de respuesta
      this.logger.debug(`Mock response from TRA endpoint: ${endpoint}`);
      this.logger.debug(headers);
      this.logger.debug(payload);
      return data;
    } catch (error) {
      this.logger.error(
        `Error in TRA request to ${endpoint}: ${error.message}`,
      );

      if (error.response) {
        this.logger.error(`Status: ${error.response.status}`);
        this.logger.error(
          `Response data: ${JSON.stringify(error.response.data, null, 2)}`,
        );
        this.logger.error(
          `Response headers: ${JSON.stringify(error.response.headers, null, 2)}`,
        );
      } else if (error.request) {
        // Si la petición fue hecha pero no hubo respuesta
        this.logger.error(`No response received from ${endpoint}`);
      } else {
        // Errores generales
        this.logger.error(`Unexpected error: ${error.message}`);
      }

      this.logger.debug(`payload: ${JSON.stringify(payload, null, 2)}`);
      this.logger.debug(`headers: ${JSON.stringify(headers, null, 2)}`);
      throw new Error('Error al realizar la petición a TRA.');
    }
  }

  /**
   * Crea los headers comunes para peticiones a TRA.
   */
  private createTraHeaders() {
    return {
      Authorization: `token ${TRA_CREDENCIALES.TOKEN_ESTABLECIMIENTO}`,
    };
  }
}
