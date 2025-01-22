import { Injectable } from '@nestjs/common';
import { DtoFactoryInterface } from './dtoFactoryInterface';
import { HuespedTraDtoFactory } from './dtos/huespedDtoFactory';
import { FacturaTraDtoFactory } from './dtos/facturaDtoFactory';
import { ReservaTraDtoFactory } from './dtos/reservaDtoFactory';
import { HuespedPrincipalTraDtoFactory } from './dtos/huespedPrincipalTraDtoFactory';

/**
 * Servicio que maneja los factories de los dtos
 * factories:
 * huesped
 * factura
 * reserva
 */
@Injectable()
export class DtoFactoryService {
  private readonly factories = {
    huesped: new HuespedTraDtoFactory(),
    factura: new FacturaTraDtoFactory(),
    reserva: new ReservaTraDtoFactory(),
    huespedPrincipal: new HuespedPrincipalTraDtoFactory(),
  };

  getFactory<TInputDto, TOutputDto>(
    factoryName: keyof typeof this.factories,
  ): DtoFactoryInterface<TInputDto, TOutputDto> {
    const factory = this.factories[factoryName];
    if (!factory) {
      throw new Error(`No existe el factory ${factoryName}`);
    }
    return factory as DtoFactoryInterface<TInputDto, TOutputDto>;
  }
}
