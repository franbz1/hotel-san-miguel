import { BadRequestException, Injectable, Logger, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateRegistroFormularioDto } from './dto/createRegistroFormularioDto';
import { CreateHuespedDto } from 'src/huespedes/dto/create-huesped.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateReservaDto } from 'src/reservas/dto/create-reserva.dto';
import { Formulario } from '@prisma/client';
import { CreateFacturaDto } from 'src/facturas/dto/create-factura.dto';
import { TraService } from 'src/TRA/tra.service';
import { ProcessTransactionResult } from './interfaces/processTransacctionResult';
import { HuespedesService } from 'src/huespedes/huespedes.service';
import { DtoFactoryService } from 'src/common/factories/dto_Factory/dtoFactoryService.service';
import { ReservasService } from 'src/reservas/reservas.service';
import { FacturasService } from 'src/facturas/facturas.service';
import { FormularioService } from './formulario/formulario.service';
import { LinkFormularioService } from 'src/link-formulario/link-formulario.service';
import { HuespedesSecundariosService } from 'src/huespedes-secundarios/huespedes-secundarios.service';
import { HabitacionesService } from 'src/habitaciones/habitaciones.service';
import { SireService } from 'src/sire/sire.service';
import { FormulariosService } from 'src/formularios/formularios.service';

@Injectable()
export class RegistroFormularioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly traService: TraService,
    private readonly huespedService: HuespedesService,
    private readonly dtoFactoryService: DtoFactoryService,
    private readonly reservaService: ReservasService,
    private readonly facturaService: FacturasService,
    private readonly habitacionesService: HabitacionesService,
    private readonly formularioService: FormularioService,
    private readonly linkFormularioService: LinkFormularioService,
    private readonly huespedesSecundariosService: HuespedesSecundariosService,
    private readonly sireService: SireService,
    private readonly formulariosService: FormulariosService,
  ) {}

  private readonly logger = new Logger(RegistroFormularioService.name);

  async createWithTra(
    createRegistroFormularioDto: CreateRegistroFormularioDto,
    tokenId: number,
  ) {
    try {
      const huesped = await this.getOrCreateHuesped(createRegistroFormularioDto);

      const habitacion = await this.habitacionesService.findByNumeroHabitacion(
        createRegistroFormularioDto.numero_habitacion,
      );

      if (!habitacion) {
        throw new NotFoundException(`La habitación con número ${createRegistroFormularioDto.numero_habitacion} no existe`);
      }

      const reserva = this.createReservaDto(
        createRegistroFormularioDto,
        huesped.id,
        habitacion.id,
      );
      const factura = this.createFacturaDto(
        createRegistroFormularioDto,
        huesped.id,
        reserva,
      );

      const transactionResult = await this.executeTransaction(
        createRegistroFormularioDto,
        reserva,
        factura,
        huesped,
        tokenId,
      );

      if (!transactionResult || !transactionResult.success) {
        throw new InternalServerErrorException('Error al procesar la transacción');
      }

      let traFormulario;
      try {
        traFormulario = await this.registerTra(
          createRegistroFormularioDto,
          transactionResult,
        );
        // TODO: Registrar en Sire pendiente
      } catch (traError) {
        this.logger.warn(
          `Formulario creado exitosamente pero falló el registro en TRA: ${traError.message}`,
          traError.stack,
        );
        // Devolvemos éxito parcial con el estado del registro TRA
        return {
          success: true,
          result: transactionResult,
          traRegistration: { success: false, error: traError.message },
          message: 'Formulario registrado exitosamente pero falló el registro en TRA'
        };
      }

      return {
        success: true,
        result: transactionResult,
        traFormulario,
        message: 'Formulario registrado exitosamente'
      };
    } catch (error) {
      this.logger.error(
        `Error al crear registro de formulario: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async getOrCreateHuesped(dto: CreateRegistroFormularioDto) {
    try {
      const huespedDto = this.dtoFactoryService
        .getFactory<CreateRegistroFormularioDto, CreateHuespedDto>('huesped')
        .create(dto);
      return await this.huespedService.findOrCreateHuesped(huespedDto);
    } catch (error) {
      this.logger.error(`Error al obtener o crear huésped: ${error.message}`);
      throw new BadRequestException(`Error al procesar datos del huésped: ${error.message}`);
    }
  }

  private createReservaDto(
    dto: CreateRegistroFormularioDto,
    huespedId: number,
    habitacionId: number,
  ) {
    return this.dtoFactoryService
      .getFactory<CreateRegistroFormularioDto, CreateReservaDto>('reserva')
      .create(dto, huespedId, habitacionId);
  }

  private createFacturaDto(
    dto: CreateRegistroFormularioDto,
    huespedId: number,
    reserva: CreateReservaDto,
  ) {
    return this.dtoFactoryService
      .getFactory<CreateRegistroFormularioDto, CreateFacturaDto>('factura')
      .create(dto, huespedId, reserva);
  }

  private async executeTransaction(
    dto: CreateRegistroFormularioDto,
    reserva: CreateReservaDto,
    factura: CreateFacturaDto,
    huesped: any,
    tokenId: number,
  ): Promise<ProcessTransactionResult> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Verificar si ya existe un formulario completado para este token
        const existingLink = await tx.linkFormulario.findUnique({
          where: { id: tokenId },
          include: { formulario: true },
        });

        if (existingLink?.completado) {
          throw new ConflictException(
            `Ya existe un formulario completado para este token (ID: ${existingLink.formularioId})`,
          );
        }

        const facturaCreated = await this.facturaService.createTransaction(
          factura,
          tx,
        );
        const reservaCreated = await this.reservaService.createTransaction(
          reserva,
          facturaCreated.id,
          tx,
        );
        const formularioCreated =
          await this.formularioService.createTransaction(
            tx,
            huesped.id,
            reservaCreated.id,
          );
        const linkFormulario =
          await this.linkFormularioService.UpdateTransaction(
            { completado: true, formularioId: formularioCreated.id },
            tx,
            tokenId,
          );

        const huespedesSecundariosCreated = await this.handleSecondaryGuests(
          dto.huespedes_secundarios,
          tx,
          huesped.id,
          reservaCreated.id,
        );

        return {
          success: true,
          huesped,
          facturaCreated,
          reservaCreated,
          formulario: formularioCreated,
          linkFormulario,
          huespedesSecundariosCreated,
          timestamp: new Date(),
        };
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  private async handleSecondaryGuests(
    huespedesSecundarios: any[],
    tx: any,
    huespedId: number,
    reservaId: number,
  ) {
    if (!huespedesSecundarios?.length) return [];

    const secondaryGuests = huespedesSecundarios.map((guest) => ({
      ...guest,
      huespedId,
    }));

    const createdGuests =
      await this.huespedesSecundariosService.createManyTransaction(
        secondaryGuests,
        tx,
      );

    await this.reservaService.UpdateTransaction(
      { huespedes_secundarios: createdGuests },
      tx,
      reservaId,
    );

    return createdGuests;
  }

  /**
   * Registra un formulario en el sistema TRA
   */
  private async registerTra(
    createRegistroFormularioDto: CreateRegistroFormularioDto,
    result: ProcessTransactionResult,
  ): Promise<Formulario> {
    try {
      // Ahora usamos el ID del formulario directamente
      const traData = await this.traService.postTra(result.formulario.id);

      if (!traData || !traData.huespedPrincipal?.code) {
        throw new BadRequestException('Respuesta inválida del servicio TRA');
      }

      return await this.prisma.formulario.update({
        where: { id: result.formulario.id },
        data: { SubidoATra: true, traId: traData.huespedPrincipal.code },
      });
    } catch (error) {
      this.logger.error(
        `Error al registrar en TRA: ${error.message}`,
        error.stack,
      );
      
      // Marcamos el formulario como no subido a TRA pero mantenemos el registro
      await this.prisma.formulario.update({
        where: { id: result.formulario.id },
        data: { SubidoATra: false, traId: null },
      });
      
      throw new BadRequestException(
        `Error al registrar en TRA: ${error.message}`,
      );
    }
  }

  private handleDatabaseError(error: any): never {
    this.logger.error(
      `Error en transacción de base de datos: ${error.message}`,
      error.stack,
    );
    
    // Errores específicos de Prisma
    if (error.code) {
      switch (error.code) {
        case 'P2002':
          throw new ConflictException(
            `Ya existe un registro con los mismos datos únicos: ${error.meta?.target?.join(', ')}`,
          );
        case 'P2003':
          throw new BadRequestException(
            `Referencia inválida: ${error.meta?.field_name}`,
          );
        case 'P2025':
          throw new NotFoundException(
            `Registro no encontrado: ${error.meta?.cause}`,
          );
        default:
          throw new BadRequestException(
            `Error de base de datos (${error.code}): ${error.message}`,
          );
      }
    }
    
    // Si es un error de NestJS, lo relanzamos tal cual
    if (error.status && error.response) {
      throw error;
    }
    
    // Error genérico
    throw new InternalServerErrorException(
      `Error en la transacción: ${error.message}`,
    );
  }
  
  /**
   * Intenta registrar un formulario existente en el sistema TRA
   * @param formularioId ID del formulario a registrar en TRA
   */
  async registerFormularioInTra(formularioId: number) {
    try {
      // Verificar si el formulario existe
      const formulario = await this.formulariosService.findOne(formularioId);

      if (!formulario) {
        throw new NotFoundException(`Formulario con ID ${formularioId} no encontrado`);
      }

      // Verificar si ya está subido a TRA
      if (formulario.SubidoATra) {
        return {
          success: true,
          message: `El formulario ya estaba registrado en TRA con ID ${formulario.traId}`,
          formulario,
        };
      }

      // Registrar en TRA
      const traData = await this.traService.postTra(formularioId);

      if (!traData || !traData.huespedPrincipal?.code) {
        throw new BadRequestException('Respuesta inválida del servicio TRA');
      }

      // Actualizar formulario con el ID de TRA
      const updatedFormulario = await this.formulariosService.update(formularioId, {
        SubidoATra: true,
        traId: traData.huespedPrincipal.code,
      });

      return {
        success: true,
        message: 'Formulario registrado exitosamente en TRA',
        formulario: updatedFormulario,
        traData,
      };
    } catch (error) {
      this.logger.error(
        `Error al registrar formulario ${formularioId} en TRA: ${error.message}`,
        error.stack,
      );
      
      // Si es un error de NotFound, lo relanzamos directamente
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      // Para otros errores, marcamos el formulario como no subido a TRA
      try {
        await this.formulariosService.update(formularioId, {
          SubidoATra: false,
          traId: null,
        });
      } catch (dbError) {
        this.logger.error(
          `Error adicional al actualizar estado del formulario: ${dbError.message}`,
        );
      }
      
      throw new BadRequestException(
        `Error al registrar formulario en TRA: ${error.message}`,
      );
    }
  }

  /**
   * Crea un registro de formulario sin integración con el sistema TRA
   */
  async create(
    createRegistroFormularioDto: CreateRegistroFormularioDto,
    tokenId: number,
  ) {
    try {
      const huesped = await this.getOrCreateHuesped(createRegistroFormularioDto);

      const habitacion = await this.habitacionesService.findByNumeroHabitacion(
        createRegistroFormularioDto.numero_habitacion,
      );

      if (!habitacion) {
        throw new NotFoundException(`La habitación con número ${createRegistroFormularioDto.numero_habitacion} no existe`);
      }

      const reserva = this.createReservaDto(
        createRegistroFormularioDto,
        huesped.id,
        habitacion.id,
      );
      const factura = this.createFacturaDto(
        createRegistroFormularioDto,
        huesped.id,
        reserva,
      );

      const transactionResult = await this.executeTransaction(
        createRegistroFormularioDto,
        reserva,
        factura,
        huesped,
        tokenId,
      );

      if (!transactionResult || !transactionResult.success) {
        throw new InternalServerErrorException('Error al procesar la transacción');
      }

      // TODO: Registrar en Sire pendiente
      return {
        success: true,
        result: transactionResult,
        message: 'Formulario registrado exitosamente sin integración con TRA'
      };
    } catch (error) {
      this.logger.error(
        `Error al crear registro de formulario: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
