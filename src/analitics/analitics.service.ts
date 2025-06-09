import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Service para manejar análisis y reportes de facturación
 */
@Injectable()
export class AnaliticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene los ingresos diarios para una fecha específica
   * @param date Fecha en formato YYYY-MM-DD
   * @returns Ingresos totales, cantidad de facturas y promedio por factura del día
   */
  async getDailyRevenue(date: string): Promise<DailyRevenueResponse> {
    try {
      // Validar formato de fecha
      const fechaObj = new Date(date);
      if (isNaN(fechaObj.getTime())) {
        throw new BadRequestException('Formato de fecha inválido');
      }

      // Calcular el rango del día
      const startOfDay = new Date(date + 'T00:00:00.000Z');
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      // Obtener agregados de facturas del día
      const resultado = await this.prisma.factura.aggregate({
        where: {
          fecha_factura: {
            gte: startOfDay,
            lt: endOfDay,
          },
          deleted: false,
        },
        _sum: {
          total: true,
        },
        _count: {
          id: true,
        },
      });

      const totalRevenue = resultado._sum.total || 0;
      const invoiceCount = resultado._count.id || 0;
      const averagePerInvoice =
        invoiceCount > 0
          ? Math.round((totalRevenue / invoiceCount) * 100) / 100
          : 0;

      return {
        date,
        totalRevenue,
        invoiceCount,
        averagePerInvoice,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener los ingresos diarios');
    }
  }

  /**
   * Obtiene los ingresos mensuales para un año y mes específicos
   * @param year Año
   * @param month Mes (1-12)
   * @returns Ingresos totales, cantidad de facturas y promedio por factura del mes
   */
  async getMonthlyRevenue(
    year: number,
    month: number,
  ): Promise<MonthlyRevenueResponse> {
    try {
      // Validar mes
      if (month < 1 || month > 12) {
        throw new BadRequestException('Mes debe estar entre 1 y 12');
      }

      // Calcular el rango del mes
      const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
      const endOfMonth = new Date(Date.UTC(year, month, 1));

      // Obtener agregados de facturas del mes
      const resultado = await this.prisma.factura.aggregate({
        where: {
          fecha_factura: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
          deleted: false,
        },
        _sum: {
          total: true,
        },
        _count: {
          id: true,
        },
      });

      const totalRevenue = resultado._sum.total || 0;
      const invoiceCount = resultado._count.id || 0;
      const averagePerInvoice =
        invoiceCount > 0
          ? Math.round((totalRevenue / invoiceCount) * 100) / 100
          : 0;

      return {
        year,
        month,
        totalRevenue,
        invoiceCount,
        averagePerInvoice,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener los ingresos mensuales');
    }
  }

  /**
   * Obtiene todas las facturas dentro de un rango de fechas
   * @param startDate Fecha de inicio en formato YYYY-MM-DD
   * @param endDate Fecha de fin en formato YYYY-MM-DD
   * @returns Array de facturas en el rango especificado
   */
  async getInvoicesInRange(startDate: string, endDate: string): Promise<any[]> {
    try {
      // Validar formatos de fecha
      const fechaInicio = new Date(startDate);
      const fechaFin = new Date(endDate);

      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        throw new BadRequestException('Formato de fecha inválido');
      }

      // Validar que startDate no sea mayor que endDate
      if (fechaInicio > fechaFin) {
        throw new BadRequestException(
          'La fecha de inicio no puede ser mayor que la fecha de fin',
        );
      }

      // Ajustar el rango para incluir todo el día
      const startOfDay = new Date(startDate + 'T00:00:00.000Z');
      const endOfDay = new Date(endDate + 'T23:59:59.999Z');

      // Obtener facturas en el rango
      const facturas = await this.prisma.factura.findMany({
        where: {
          fecha_factura: {
            gte: startOfDay,
            lte: endOfDay,
          },
          deleted: false,
          huesped: {
            deleted: false,
          },
          reserva: {
            deleted: false,
          },
        },
        include: {
          huesped: true,
          reserva: true,
        },
        orderBy: {
          fecha_factura: 'desc',
        },
      });

      return facturas;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Error al obtener las facturas en el rango',
      );
    }
  }
}

// Clases para respuestas de la API
export class DailyRevenueResponse {
  @ApiProperty({
    description: 'Fecha analizada en formato YYYY-MM-DD',
    example: '2024-01-15',
  })
  date: string;

  @ApiProperty({
    description: 'Total de ingresos del día',
    example: 1500.75,
    type: 'number',
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Cantidad de facturas emitidas en el día',
    example: 10,
  })
  invoiceCount: number;

  @ApiProperty({
    description: 'Promedio de ingresos por factura',
    example: 150.08,
    type: 'number',
  })
  averagePerInvoice: number;
}

export class MonthlyRevenueResponse {
  @ApiProperty({
    description: 'Año analizado',
    example: 2024,
  })
  year: number;

  @ApiProperty({
    description: 'Mes analizado (1-12)',
    example: 1,
  })
  month: number;

  @ApiProperty({
    description: 'Total de ingresos del mes',
    example: 45000.5,
    type: 'number',
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Cantidad de facturas emitidas en el mes',
    example: 300,
  })
  invoiceCount: number;

  @ApiProperty({
    description: 'Promedio de ingresos por factura',
    example: 150.0,
    type: 'number',
  })
  averagePerInvoice: number;
}
