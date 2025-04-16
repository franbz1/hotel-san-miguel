import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
  ) {}

  private readonly logger = new Logger(RegistroFormularioService.name);

  async create(
    createRegistroFormularioDto: CreateRegistroFormularioDto,
    tokenId: number,
  ) {
    const huesped = await this.getOrCreateHuesped(createRegistroFormularioDto);

    const reserva = this.createReservaDto(
      createRegistroFormularioDto,
      huesped.id,
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

    if (transactionResult.success) {
      const traFormulario = await this.registerTra(
        createRegistroFormularioDto,
        transactionResult,
      );

      // TODO: Registrar en Sire pendiente
      return { result: transactionResult, traFormulario };
    }
  }

  private async getOrCreateHuesped(dto: CreateRegistroFormularioDto) {
    const huespedDto = this.dtoFactoryService
      .getFactory<CreateRegistroFormularioDto, CreateHuespedDto>('huesped')
      .create(dto);
    return this.huespedService.findOrCreateHuesped(huespedDto);
  }

  private createReservaDto(
    dto: CreateRegistroFormularioDto,
    huespedId: number,
  ) {
    return this.dtoFactoryService
      .getFactory<CreateRegistroFormularioDto, CreateReservaDto>('reserva')
      .create(dto, huespedId);
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
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
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
        };
      });
    } catch (error) {
      this.handleDatabaseError(error);
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

  private async registerTra(
    createRegistroFormularioDto: CreateRegistroFormularioDto,
    result: ProcessTransactionResult,
  ): Promise<Formulario> {
    try {
      const traData = await this.traService.postTra(
        createRegistroFormularioDto,
      );

      return this.prisma.formulario.update({
        where: { id: result.formulario.id },
        data: { SubidoATra: true, traId: traData.huespedPrincipal.code },
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private handleDatabaseError(error: any): never {
    if (error.code === 'P2003') {
      throw new BadRequestException('La habitación no existe');
    }
    throw error;
  }
}
