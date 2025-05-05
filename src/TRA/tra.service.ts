import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { TRA_CREDENCIALES } from 'src/common/constants/TraCredenciales';
import {
  Habitacion,
  Huesped,
  HuespedSecundario,
  Reserva,
} from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { FormulariosService } from 'src/formularios/formularios.service';

@Injectable()
export class TraService {
  private readonly logger = new Logger(TraService.name);

  constructor(
    private readonly httpService: HttpService,

    private readonly formulariosService: FormulariosService,
  ) {}

  /**
   * Procesa el registro en TRA para el huésped principal y secundarios a partir del ID de un formulario.
   * @param formularioId ID del formulario a registrar en TRA
   */
  async postTra(formularioId: number) {
    // Obtenemos los datos del formulario con todas sus relaciones necesarias usando el servicio de formularios
    const formulario =
      await this.formulariosService.getFormularioWithRelations(formularioId);

    if (!formulario) {
      throw new NotFoundException(
        `No se encontró el formulario con id ${formularioId}`,
      );
    }

    const { huesped, reserva, habitacion } = formulario;

    // Obtenemos huéspedes secundarios relacionados con la reserva
    const huespedesSecundarios =
      await this.formulariosService.getHuespedesSecundariosFromReserva(
        reserva.id,
      );

    // Registramos el huésped principal en TRA
    const huespedPrincipalResponse = await this.postTraHuespedPrincipal(
      huesped,
      reserva,
      habitacion,
    );

    // Registramos los huéspedes secundarios en TRA
    const huespedesSecundariosData = await this.postTraHuespedesSecundarios(
      huespedesSecundarios,
      huespedPrincipalResponse.code,
      habitacion.numero_habitacion,
      reserva.check_in,
      reserva.check_out,
    );

    return {
      huespedPrincipal: huespedPrincipalResponse,
      huespedesSecundarios: huespedesSecundariosData,
    };
  }

  /**
   * Registra al huésped principal en TRA.
   */
  private async postTraHuespedPrincipal(
    huesped: Huesped,
    reserva: Reserva,
    habitacion: Habitacion,
  ) {
    const payload = this.createHuespedPrincipalPayload(
      huesped,
      reserva,
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
  private async postTraHuespedesSecundarios(
    huespedesSecundarios: HuespedSecundario[],
    padreId: number,
    numero_habitacion: number,
    check_in: Date,
    check_out: Date,
  ) {
    const huespedesSecundariosData = [];

    if (!huespedesSecundarios?.length) return [];

    const huespedesSecundariosTraDtos = await Promise.all(
      huespedesSecundarios.map(async (huesped) => {
        return this.createHuespedSecundarioTraPayload(
          huesped,
          numero_habitacion,
          padreId,
          check_in,
          check_out,
        );
      }),
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
   * Crea el payload para el huésped secundario a enviar a TRA
   */
  private createHuespedSecundarioTraPayload(
    huesped: HuespedSecundario,
    numero_habitacion: number,
    padreId: number,
    check_in: Date,
    check_out: Date,
  ) {
    // Transformar el huésped secundario en el formato esperado por TRA
    const payload = {
      padre: padreId,
      num_habitacion: numero_habitacion,
      tipo_documento: huesped.tipo_documento,
      numero_documento: huesped.numero_documento,
      primer_apellido: huesped.primer_apellido,
      segundo_apellido: huesped.segundo_apellido || '',
      nombres: huesped.nombres,
      genero: huesped.genero,
      fecha_nacimiento: huesped.fecha_nacimiento.toISOString().split('T')[0],
      nacionalidad: huesped.nacionalidad,
      pais_residencia: huesped.pais_residencia,
      ciudad_residencia: huesped.ciudad_residencia,
      pais_procedencia: huesped.pais_procedencia,
      ciudad_procedencia: huesped.ciudad_procedencia,
      ocupacion: huesped.ocupacion,
      check_in: check_in.toISOString().split('T')[0],
      check_out: check_out.toISOString().split('T')[0],
    };

    return payload;
  }

  /**
   * Crea el payload para el registro del huésped principal.
   */
  private createHuespedPrincipalPayload(
    huesped: Huesped,
    reserva: Reserva,
    habitacion: Habitacion,
  ) {
    // Transformar los datos del huésped y reserva en el formato esperado por TRA
    const payload = {
      nombre_establecimiento: TRA_CREDENCIALES.NOMBRE_ESTABLECIMIENTO,
      rnt_establecimiento: TRA_CREDENCIALES.RNT_ESTABLECIMIENTO,
      num_habitacion: habitacion.numero_habitacion,
      tipo_documento: huesped.tipo_documento,
      numero_documento: huesped.numero_documento,
      primer_apellido: huesped.primer_apellido,
      segundo_apellido: huesped.segundo_apellido || '',
      nombres: huesped.nombres,
      genero: huesped.genero,
      fecha_nacimiento: huesped.fecha_nacimiento.toISOString().split('T')[0],
      nacionalidad: huesped.nacionalidad,
      tipo_habitacion: habitacion.tipo,
      pais_residencia: huesped.pais_residencia,
      ciudad_residencia: huesped.ciudad_residencia,
      pais_procedencia: huesped.pais_procedencia,
      ciudad_procedencia: huesped.ciudad_procedencia,
      pais_destino: reserva.pais_destino,
      motivo_viaje: reserva.motivo_viaje,
      ocupacion: huesped.ocupacion,
      medio_transporte: 'TERRESTRE', // Valor por defecto, podría extraerse de la reserva si se añade
      check_in: reserva.check_in.toISOString().split('T')[0],
      check_out: reserva.check_out.toISOString().split('T')[0],
    };

    return payload;
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
