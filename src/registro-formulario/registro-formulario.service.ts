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
import { LinkFormularioService } from './link-formulario/linkFormulario.service';
import { HuespedesSecundariosService } from 'src/huespedes-secundarios/huespedes-secundarios.service';

@Injectable()
export class RegistroFormularioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly traService: TraService,
    private readonly huespedService: HuespedesService,
    private readonly dtoFactoryService: DtoFactoryService,
    private readonly reservaService: ReservasService,
    private readonly facturaService: FacturasService,
    private readonly formularioService: FormularioService,
    private readonly linkFormularioService: LinkFormularioService,
    private readonly huespedesSecundariosService: HuespedesSecundariosService,
  ) {}

  private readonly logger = new Logger(RegistroFormularioService.name);

  async create(
    createRegistroFormularioDto: CreateRegistroFormularioDto,
    tokenId: number,
  ) {
    const huespedDto = this.dtoFactoryService
      .getFactory<CreateRegistroFormularioDto, CreateHuespedDto>('huesped')
      .create(createRegistroFormularioDto);

    const huesped = await this.huespedService.findOrCreateHuesped(huespedDto);

    const reserva = this.dtoFactoryService
      .getFactory<CreateRegistroFormularioDto, CreateReservaDto>('reserva')
      .create(createRegistroFormularioDto, huesped.id);

    const factura = this.dtoFactoryService
      .getFactory<CreateRegistroFormularioDto, CreateFacturaDto>('factura')
      .create(createRegistroFormularioDto, huesped.id, reserva);

    const { huespedes_secundarios } = createRegistroFormularioDto;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
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
            {
              completado: true,
              formularioId: formularioCreated.id,
            },
            tx,
            tokenId,
          );

        let huespedesSecundariosCreated = [];

        if (huespedes_secundarios?.length) {
          const huespedesSecundariosConHuespedId = huespedes_secundarios.map(
            (huespedSecundario) => ({
              ...huespedSecundario,
              huespedId: huesped.id,
            }),
          );

          huespedesSecundariosCreated =
            await this.huespedesSecundariosService.createManyTransaction(
              huespedesSecundariosConHuespedId,
              tx,
            );

          await this.reservaService.UpdateTransaction(
            { huespedes_secundarios: huespedesSecundariosCreated },
            tx,
            reservaCreated.id,
          );
        }

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

      if (result.success) {
        const traFormulario = await this.registerTra(
          createRegistroFormularioDto,
          result,
        );

        return {
          result,
          traFormulario,
        };
      }
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  /**
   * hace el registro en el TRA
   * @param createRegistroFormularioDto Datos del formulario
   * @param result Resultado de la transacción
   * @returns Formulario
   */
  private async registerTra(
    createRegistroFormularioDto: CreateRegistroFormularioDto,
    result: ProcessTransactionResult,
  ): Promise<Formulario> {
    try {
      const padre = await this.traService.postTraHuespedPrincipalFromForm(
        createRegistroFormularioDto,
      );

      //TODO: cambiar por el traId
      const form = await this.prisma.formulario.update({
        where: {
          id: result.formulario.id,
        },
        data: {
          SubidoATra: true,
          traId: padre.code,
        },
      });

      return form;
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  /**
   * Busca error de habitación no existente
   * @param error error de la base de datos
   * @returns nunca
   */
  private handleDatabaseError(error: any): never {
    if (error.code === 'P2003') {
      throw new BadRequestException('La habitación no existe');
    }
    throw error;
  }
}
