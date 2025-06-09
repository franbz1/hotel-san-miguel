import { Test, TestingModule } from '@nestjs/testing';
import { AnaliticsService } from './analitics.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('AnaliticsService', () => {
  let service: AnaliticsService;

  // Mock del servicio Prisma
  const mockPrismaService = {
    factura: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnaliticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AnaliticsService>(AnaliticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición del servicio', () => {
    it('debería estar definido', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getDailyRevenue', () => {
    const fechaTest = '2024-01-15';

    it('debería devolver ceros cuando no hay facturas para la fecha especificada', async () => {
      // Arrange
      mockPrismaService.factura.aggregate.mockResolvedValue({
        _sum: { total: null },
        _count: { id: 0 },
      });

      // Act
      const resultado = await service.getDailyRevenue(fechaTest);

      // Assert
      expect(mockPrismaService.factura.aggregate).toHaveBeenCalledWith({
        where: {
          fecha_factura: {
            gte: new Date('2024-01-15T00:00:00.000Z'),
            lt: new Date('2024-01-16T00:00:00.000Z'),
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
      expect(resultado).toEqual({
        date: fechaTest,
        totalRevenue: 0,
        invoiceCount: 0,
        averagePerInvoice: 0,
      });
    });

    it('debería calcular correctamente con una única factura', async () => {
      // Arrange
      mockPrismaService.factura.aggregate.mockResolvedValue({
        _sum: { total: 100.0 },
        _count: { id: 1 },
      });

      // Act
      const resultado = await service.getDailyRevenue(fechaTest);

      // Assert
      expect(resultado).toEqual({
        date: fechaTest,
        totalRevenue: 100.0,
        invoiceCount: 1,
        averagePerInvoice: 100.0,
      });
    });

    it('debería calcular correctamente con varias facturas', async () => {
      // Arrange - Facturas de 50, 150 y 200 = 400 total, promedio 133.33
      mockPrismaService.factura.aggregate.mockResolvedValue({
        _sum: { total: 400.0 },
        _count: { id: 3 },
      });

      // Act
      const resultado = await service.getDailyRevenue(fechaTest);

      // Assert
      expect(resultado).toEqual({
        date: fechaTest,
        totalRevenue: 400.0,
        invoiceCount: 3,
        averagePerInvoice: 133.33,
      });
    });

    it('debería excluir facturas con deleted = true', async () => {
      // Arrange
      mockPrismaService.factura.aggregate.mockResolvedValue({
        _sum: { total: 250.0 },
        _count: { id: 2 },
      });

      // Act
      const resultado = await service.getDailyRevenue(fechaTest);

      // Assert
      expect(mockPrismaService.factura.aggregate).toHaveBeenCalledWith({
        where: {
          fecha_factura: {
            gte: new Date('2024-01-15T00:00:00.000Z'),
            lt: new Date('2024-01-16T00:00:00.000Z'),
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
      expect(resultado.totalRevenue).toBe(250.0);
      expect(resultado.invoiceCount).toBe(2);
    });

    it('debería manejar división por cero devolviendo 0 en averagePerInvoice', async () => {
      // Arrange
      mockPrismaService.factura.aggregate.mockResolvedValue({
        _sum: { total: null },
        _count: { id: 0 },
      });

      // Act
      const resultado = await service.getDailyRevenue(fechaTest);

      // Assert
      expect(resultado.averagePerInvoice).toBe(0);
      expect(Number.isNaN(resultado.averagePerInvoice)).toBe(false);
      expect(Number.isFinite(resultado.averagePerInvoice)).toBe(true);
    });

    it('debería lanzar BadRequestException con formato de fecha inválido', async () => {
      // Arrange
      const fechaInvalida = 'abcd';

      // Act & Assert
      await expect(service.getDailyRevenue(fechaInvalida)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getDailyRevenue(fechaInvalida)).rejects.toThrow(
        'Formato de fecha inválido',
      );
      expect(mockPrismaService.factura.aggregate).not.toHaveBeenCalled();
    });

    it('debería manejar errores de base de datos', async () => {
      // Arrange
      mockPrismaService.factura.aggregate.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.getDailyRevenue(fechaTest)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getDailyRevenue(fechaTest)).rejects.toThrow(
        'Error al obtener los ingresos diarios',
      );
    });
  });

  describe('getMonthlyRevenue', () => {
    const yearTest = 2024;
    const monthTest = 1; // Enero

    it('debería devolver ceros cuando no hay facturas para el mes especificado', async () => {
      // Arrange
      mockPrismaService.factura.aggregate.mockResolvedValue({
        _sum: { total: null },
        _count: { id: 0 },
      });

      // Act
      const resultado = await service.getMonthlyRevenue(yearTest, monthTest);

      // Assert
      expect(mockPrismaService.factura.aggregate).toHaveBeenCalledWith({
        where: {
          fecha_factura: {
            gte: new Date('2024-01-01T00:00:00.000Z'),
            lt: new Date('2024-02-01T00:00:00.000Z'),
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
      expect(resultado).toEqual({
        year: yearTest,
        month: monthTest,
        totalRevenue: 0,
        invoiceCount: 0,
        averagePerInvoice: 0,
      });
    });

    it('debería sumar correctamente facturas de distintos días del mes', async () => {
      // Arrange
      mockPrismaService.factura.aggregate.mockResolvedValue({
        _sum: { total: 750.0 },
        _count: { id: 5 },
      });

      // Act
      const resultado = await service.getMonthlyRevenue(yearTest, monthTest);

      // Assert
      expect(resultado).toEqual({
        year: yearTest,
        month: monthTest,
        totalRevenue: 750.0,
        invoiceCount: 5,
        averagePerInvoice: 150.0,
      });
    });

    it('debería manejar correctamente febrero en año bisiesto', async () => {
      // Arrange
      const añoBisiesto = 2024;
      const febrero = 2;
      mockPrismaService.factura.aggregate.mockResolvedValue({
        _sum: { total: 200.0 },
        _count: { id: 1 },
      });

      // Act
      const resultado = await service.getMonthlyRevenue(añoBisiesto, febrero);

      // Assert
      expect(mockPrismaService.factura.aggregate).toHaveBeenCalledWith({
        where: {
          fecha_factura: {
            gte: new Date('2024-02-01T00:00:00.000Z'),
            lt: new Date('2024-03-01T00:00:00.000Z'),
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
      expect(resultado.totalRevenue).toBe(200.0);
    });

    it('no debería incluir facturas de meses adyacentes', async () => {
      // Arrange
      mockPrismaService.factura.aggregate.mockResolvedValue({
        _sum: { total: 300.0 },
        _count: { id: 2 },
      });

      // Act
      await service.getMonthlyRevenue(yearTest, monthTest);

      // Assert
      expect(mockPrismaService.factura.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            fecha_factura: {
              gte: new Date('2024-01-01T00:00:00.000Z'),
              lt: new Date('2024-02-01T00:00:00.000Z'),
            },
          }),
        }),
      );
    });

    it('debería manejar entradas límite de mes y año', async () => {
      // Arrange
      const testCases = [
        { year: 2024, month: 1 }, // Enero
        { year: 2024, month: 12 }, // Diciembre
        { year: 1900, month: 6 }, // Año muy atrás
        { year: 2050, month: 6 }, // Año futuro
      ];

      mockPrismaService.factura.aggregate.mockResolvedValue({
        _sum: { total: 100.0 },
        _count: { id: 1 },
      });

      // Act & Assert
      for (const testCase of testCases) {
        const resultado = await service.getMonthlyRevenue(
          testCase.year,
          testCase.month,
        );

        expect(resultado.year).toBe(testCase.year);
        expect(resultado.month).toBe(testCase.month);
        expect(resultado.totalRevenue).toBe(100.0);
      }
    });

    it('debería verificar la precisión del promedio calculado', async () => {
      // Arrange
      mockPrismaService.factura.aggregate.mockResolvedValue({
        _sum: { total: 100.0 },
        _count: { id: 3 },
      });

      // Act
      const resultado = await service.getMonthlyRevenue(yearTest, monthTest);

      // Assert
      expect(resultado.averagePerInvoice).toBeCloseTo(33.33, 2);
    });

    it('debería lanzar BadRequestException con mes inválido', async () => {
      // Act & Assert
      await expect(service.getMonthlyRevenue(yearTest, 0)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getMonthlyRevenue(yearTest, 13)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getMonthlyRevenue(yearTest, 0)).rejects.toThrow(
        'Mes debe estar entre 1 y 12',
      );
    });

    it('debería manejar errores de base de datos', async () => {
      // Arrange
      mockPrismaService.factura.aggregate.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(
        service.getMonthlyRevenue(yearTest, monthTest),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.getMonthlyRevenue(yearTest, monthTest),
      ).rejects.toThrow('Error al obtener los ingresos mensuales');
    });
  });

  describe('getInvoicesInRange', () => {
    const startDate = '2024-01-01';
    const endDate = '2024-01-31';

    const facturasMock = [
      {
        id: 1,
        total: 100.0,
        fecha_factura: new Date('2024-01-15'),
        huespedId: 1,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        deleted: false,
      },
      {
        id: 2,
        total: 200.0,
        fecha_factura: new Date('2024-01-20'),
        huespedId: 2,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
        deleted: false,
      },
    ];

    it('debería devolver array vacío cuando no hay facturas en el rango', async () => {
      // Arrange
      mockPrismaService.factura.findMany.mockResolvedValue([]);

      // Act
      const resultado = await service.getInvoicesInRange(startDate, endDate);

      // Assert
      expect(mockPrismaService.factura.findMany).toHaveBeenCalledWith({
        where: {
          fecha_factura: {
            gte: new Date('2024-01-01T00:00:00.000Z'),
            lte: new Date('2024-01-31T23:59:59.999Z'),
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
      expect(resultado).toEqual([]);
      expect(Array.isArray(resultado)).toBe(true);
    });

    it('debería devolver facturas cuando startDate === endDate', async () => {
      // Arrange
      const sameDateFacturas = [facturasMock[0]];
      mockPrismaService.factura.findMany.mockResolvedValue(sameDateFacturas);

      // Act
      const resultado = await service.getInvoicesInRange(
        '2024-01-15',
        '2024-01-15',
      );

      // Assert
      expect(mockPrismaService.factura.findMany).toHaveBeenCalledWith({
        where: {
          fecha_factura: {
            gte: new Date('2024-01-15T00:00:00.000Z'),
            lte: new Date('2024-01-15T23:59:59.999Z'),
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
      expect(resultado).toEqual(sameDateFacturas);
      expect(resultado).toHaveLength(1);
    });

    it('no debería incluir facturas fuera del rango especificado', async () => {
      // Arrange
      mockPrismaService.factura.findMany.mockResolvedValue(facturasMock);

      // Act
      const resultado = await service.getInvoicesInRange(startDate, endDate);

      // Assert
      expect(mockPrismaService.factura.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            fecha_factura: {
              gte: new Date('2024-01-01T00:00:00.000Z'),
              lte: new Date('2024-01-31T23:59:59.999Z'),
            },
            deleted: false,
            huesped: {
              deleted: false,
            },
            reserva: {
              deleted: false,
            },
          }),
        }),
      );
      expect(resultado).toEqual(facturasMock);
    });

    it('debería lanzar BadRequestException cuando startDate > endDate', async () => {
      // Act & Assert
      await expect(
        service.getInvoicesInRange('2024-01-31', '2024-01-01'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.getInvoicesInRange('2024-01-31', '2024-01-01'),
      ).rejects.toThrow(
        'La fecha de inicio no puede ser mayor que la fecha de fin',
      );
      expect(mockPrismaService.factura.findMany).not.toHaveBeenCalled();
    });

    it('debería excluir facturas con deleted = true', async () => {
      // Arrange
      const facturasNoEliminadas = facturasMock.filter((f) => !f.deleted);
      mockPrismaService.factura.findMany.mockResolvedValue(
        facturasNoEliminadas,
      );

      // Act
      const resultado = await service.getInvoicesInRange(startDate, endDate);

      // Assert
      expect(mockPrismaService.factura.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deleted: false,
            huesped: {
              deleted: false,
            },
            reserva: {
              deleted: false,
            },
          }),
        }),
      );
      expect(resultado.every((factura) => !factura.deleted)).toBe(true);
    });

    it('debería excluir facturas con huéspedes o reservas eliminados', async () => {
      // Arrange
      const facturasSoloActivos = facturasMock.filter((f) => !f.deleted);
      mockPrismaService.factura.findMany.mockResolvedValue(facturasSoloActivos);

      // Act
      const resultado = await service.getInvoicesInRange(startDate, endDate);

      // Assert
      expect(mockPrismaService.factura.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deleted: false,
            huesped: {
              deleted: false,
            },
            reserva: {
              deleted: false,
            },
          }),
        }),
      );
      // Verificar que solo se incluyen facturas con huéspedes y reservas activos
      expect(resultado).toEqual(facturasSoloActivos);
    });

    it('debería lanzar BadRequestException con formato de fecha inválido', async () => {
      // Act & Assert
      await expect(
        service.getInvoicesInRange('fecha-invalida', endDate),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.getInvoicesInRange(startDate, 'fecha-invalida'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.getInvoicesInRange('fecha-invalida', endDate),
      ).rejects.toThrow('Formato de fecha inválido');
    });

    it('debería manejar errores de base de datos', async () => {
      // Arrange
      mockPrismaService.factura.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(
        service.getInvoicesInRange(startDate, endDate),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.getInvoicesInRange(startDate, endDate),
      ).rejects.toThrow('Error al obtener las facturas en el rango');
    });

    it('debería ordenar las facturas por fecha de manera descendente', async () => {
      // Arrange
      mockPrismaService.factura.findMany.mockResolvedValue(facturasMock);

      // Act
      await service.getInvoicesInRange(startDate, endDate);

      // Assert
      expect(mockPrismaService.factura.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            fecha_factura: 'desc',
          },
        }),
      );
    });

    it('debería incluir datos relacionados de huésped y reserva', async () => {
      // Arrange
      mockPrismaService.factura.findMany.mockResolvedValue(facturasMock);

      // Act
      await service.getInvoicesInRange(startDate, endDate);

      // Assert
      expect(mockPrismaService.factura.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            huesped: true,
            reserva: true,
          },
        }),
      );
    });
  });

  describe('Casos de borde y validaciones adicionales', () => {
    it('debería manejar múltiples consultas concurrentes de getDailyRevenue', async () => {
      // Arrange
      const fechas = ['2024-01-01', '2024-01-02', '2024-01-03'];
      mockPrismaService.factura.aggregate.mockResolvedValue({
        _sum: { total: 100.0 },
        _count: { id: 1 },
      });

      // Act
      const resultados = await Promise.all(
        fechas.map((fecha) => service.getDailyRevenue(fecha)),
      );

      // Assert
      expect(resultados).toHaveLength(3);
      expect(mockPrismaService.factura.aggregate).toHaveBeenCalledTimes(3);
      resultados.forEach((resultado, index) => {
        expect(resultado.date).toBe(fechas[index]);
        expect(resultado.totalRevenue).toBe(100.0);
      });
    });

    it('debería redondear correctamente los promedios a 2 decimales', async () => {
      // Arrange
      mockPrismaService.factura.aggregate.mockResolvedValue({
        _sum: { total: 100.0 },
        _count: { id: 3 },
      });

      // Act
      const resultado = await service.getDailyRevenue('2024-01-01');

      // Assert
      expect(resultado.averagePerInvoice).toBeCloseTo(33.33, 2);
      expect(resultado.averagePerInvoice.toString()).toMatch(/^\d+\.\d{2}$/);
    });

    it('debería manejar correctamente fechas con diferentes formatos válidos', async () => {
      // Arrange
      const formatosFecha = [
        '2024-01-01',
        '2024-1-1',
        '2024-12-31',
        '2024-2-29', // Año bisiesto
      ];

      mockPrismaService.factura.aggregate.mockResolvedValue({
        _sum: { total: 100.0 },
        _count: { id: 1 },
      });

      // Act & Assert
      for (const fecha of formatosFecha) {
        const resultado = await service.getDailyRevenue(fecha);
        expect(resultado.totalRevenue).toBe(100.0);
      }
    });

    it('debería verificar que se llama a las dependencias en el orden correcto', async () => {
      // Arrange
      const order: string[] = [];

      mockPrismaService.factura.aggregate.mockImplementation(async () => {
        order.push('aggregate');
        return { _sum: { total: 100.0 }, _count: { id: 1 } };
      });

      mockPrismaService.factura.findMany.mockImplementation(async () => {
        order.push('findMany');
        return [];
      });

      // Act
      await service.getDailyRevenue('2024-01-01');
      await service.getInvoicesInRange('2024-01-01', '2024-01-01');

      // Assert
      expect(order).toEqual(['aggregate', 'findMany']);
    });
  });

  describe('Integración con documentación API', () => {
    it('debería cumplir con el contrato de la API para getDailyRevenue', async () => {
      // Arrange
      mockPrismaService.factura.aggregate.mockResolvedValue({
        _sum: { total: 1500.75 },
        _count: { id: 10 },
      });

      // Act
      const resultado = await service.getDailyRevenue('2024-01-15');

      // Assert
      expect(resultado).toMatchObject({
        date: expect.any(String),
        totalRevenue: expect.any(Number),
        invoiceCount: expect.any(Number),
        averagePerInvoice: expect.any(Number),
      });
      expect(resultado.date).toBe('2024-01-15');
      expect(resultado.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(resultado.invoiceCount).toBeGreaterThanOrEqual(0);
      expect(resultado.averagePerInvoice).toBeGreaterThanOrEqual(0);
    });

    it('debería cumplir con el contrato de la API para getMonthlyRevenue', async () => {
      // Arrange
      mockPrismaService.factura.aggregate.mockResolvedValue({
        _sum: { total: 5000.0 },
        _count: { id: 25 },
      });

      // Act
      const resultado = await service.getMonthlyRevenue(2024, 1);

      // Assert
      expect(resultado).toMatchObject({
        year: expect.any(Number),
        month: expect.any(Number),
        totalRevenue: expect.any(Number),
        invoiceCount: expect.any(Number),
        averagePerInvoice: expect.any(Number),
      });
      expect(resultado.year).toBe(2024);
      expect(resultado.month).toBe(1);
      expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).toContain(
        resultado.month,
      );
    });

    it('debería cumplir con el contrato de la API para getInvoicesInRange', async () => {
      // Arrange
      const facturasMock = [
        {
          id: 1,
          total: 150.75,
          fecha_factura: new Date('2024-01-15'),
          huespedId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deleted: false,
          huesped: { id: 1, nombre: 'Juan Pérez' },
          reserva: null,
        },
      ];
      mockPrismaService.factura.findMany.mockResolvedValue(facturasMock);

      // Act
      const resultado = await service.getInvoicesInRange(
        '2024-01-01',
        '2024-01-31',
      );

      // Assert
      expect(Array.isArray(resultado)).toBe(true);
      if (resultado.length > 0) {
        expect(resultado[0]).toMatchObject({
          id: expect.any(Number),
          total: expect.any(Number),
          fecha_factura: expect.any(Date),
          huespedId: expect.any(Number),
          deleted: expect.any(Boolean),
        });
        expect(resultado[0].deleted).toBe(false);
      }
    });
  });
});
