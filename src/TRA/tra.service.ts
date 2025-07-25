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

    this.logger.log(`=== INICIO PETICIÓN TRA ===`);
    this.logger.log(`Endpoint: ${endpoint}`);
    this.logger.log(`Headers: ${JSON.stringify(headers, null, 2)}`);
    this.logger.log(`Payload: ${JSON.stringify(payload, null, 2)}`);

    try {
      // Para entornos reales, activar la línea siguiente
      //const { data } = await firstValueFrom(
      //  this.httpService.post(endpoint, payload, { headers }),
      //);

      // Mock para entornos de desarrollo - comentar en producción
      const data = { code: 1222 }; // Mock de respuesta

      this.logger.log(`=== RESPUESTA TRA EXITOSA ===`);
      this.logger.log(`Respuesta completa: ${JSON.stringify(data, null, 2)}`);

      // Validar estructura básica de respuesta
      if (
        !data ||
        (typeof data.code !== 'number' && typeof data.code !== 'string')
      ) {
        this.logger.error(
          `Respuesta TRA inválida - falta campo 'code': ${JSON.stringify(data, null, 2)}`,
        );
        throw new Error(`Respuesta inválida de TRA: falta campo 'code'`);
      }

      this.logger.log(`=== FIN PETICIÓN TRA EXITOSA ===`);
      return data;
    } catch (error) {
      this.logger.error(`=== ERROR EN PETICIÓN TRA ===`);
      this.logger.error(`Endpoint: ${endpoint}`);
      this.logger.error(`Error principal: ${error.message}`);

      if (error.response) {
        this.logger.error(`Status HTTP: ${error.response.status}`);
        this.logger.error(
          `Response data: ${JSON.stringify(error.response.data, null, 2)}`,
        );
        this.logger.error(
          `Response headers: ${JSON.stringify(error.response.headers, null, 2)}`,
        );

        // Manejar errores específicos de TRA según status code
        switch (error.response.status) {
          case 400:
            throw new Error(
              `Datos inválidos enviados a TRA: ${JSON.stringify(error.response.data)}`,
            );
          case 401:
            throw new Error(`Token de autenticación TRA inválido o expirado`);
          case 403:
            throw new Error(`Acceso prohibido al servicio TRA`);
          case 404:
            throw new Error(`Endpoint TRA no encontrado: ${endpoint}`);
          case 500:
            throw new Error(
              `Error interno del servidor TRA: ${JSON.stringify(error.response.data)}`,
            );
          default:
            throw new Error(
              `Error HTTP ${error.response.status} en TRA: ${JSON.stringify(error.response.data)}`,
            );
        }
      } else if (error.request) {
        // Si la petición fue hecha pero no hubo respuesta
        this.logger.error(
          `Sin respuesta del servidor TRA - Timeout o servidor caído`,
        );
        this.logger.error(
          `Request config: ${JSON.stringify(error.config, null, 2)}`,
        );
        throw new Error(
          `Sin respuesta del servidor TRA - Verifique conectividad`,
        );
      } else {
        // Errores generales
        this.logger.error(`Error inesperado: ${error.message}`);
        throw new Error(
          `Error inesperado al comunicarse con TRA: ${error.message}`,
        );
      }
    } finally {
      this.logger.log(`Payload enviado: ${JSON.stringify(payload, null, 2)}`);
      this.logger.log(`Headers enviados: ${JSON.stringify(headers, null, 2)}`);
      this.logger.log(`=== FIN PROCESO TRA ===`);
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
