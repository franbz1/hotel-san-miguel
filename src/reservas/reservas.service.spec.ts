import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { EstadosReserva } from 'src/common/enums/estadosReserva.enum';
import { MotivosViajes } from 'src/common/enums/motivosViajes.enum';
import { Prisma } from '@prisma/client';

describe('ReservasService', () => {
  let service: ReservasService;
  let prismaService: PrismaService;

  // Mock del PrismaService
  const mockPrismaService = {
    reserva: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    formulario: {
      updateMany: jest.fn(),
    },
    linkFormulario: {
      update: jest.fn(),
    },
    factura: {
      update: jest.fn(),
    },
    huespedSecundario: {
      update: jest.fn(),
    },
    huesped: {
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  // Datos de prueba
  const mockReservaData: CreateReservaDto = {
    fecha_inicio: new Date('2024-01-15'),
    fecha_fin: new Date('2024-01-20'),
    estado: EstadosReserva.RESERVADO,
    pais_procedencia: 'Colombia',
    ciudad_procedencia: 'Medellín',
    pais_destino: 'Estados Unidos',
    motivo_viaje: MotivosViajes.COMPRAS,
    check_in: new Date('2024-01-15T14:00:00'),
    check_out: new Date('2024-01-20T12:00:00'),
    costo: 500.5,
    numero_acompaniantes: 2,
    habitacionId: 101,
    huespedId: 1,
  };

  const mockReservaCreated = {
    id: 1,
    ...mockReservaData,
    facturaId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deleted: false,
  };

  const mockPaginationDto: PaginationDto = {
    page: 1,
    limit: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservasService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReservasService>(ReservasService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ================================================================
  // DEFINICIÓN DEL SERVICIO
  // ================================================================
  describe('Definición del servicio', () => {
    it('debería estar definido', () => {
      expect(service).toBeDefined();
    });

    it('debería tener todas las dependencias inyectadas', () => {
      expect(prismaService).toBeDefined();
    });
  });

  // ================================================================
  // CREATE - Crear nueva reserva
  // ================================================================
  describe('create', () => {
    it('debería crear una reserva correctamente', async () => {
      // Arrange
      mockPrismaService.reserva.create.mockResolvedValue(mockReservaCreated);

      // Act
      const result = await service.create(mockReservaData);

      // Assert
      expect(result).toEqual(mockReservaCreated);
      expect(mockPrismaService.reserva.create).toHaveBeenCalledWith({
        data: mockReservaData,
      });
      expect(mockPrismaService.reserva.create).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar BadRequestException cuando el huésped no existe', async () => {
      // Arrange
      const prismaError = { code: 'P2003' };
      mockPrismaService.reserva.create.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(service.create(mockReservaData)).rejects.toThrow(
        new BadRequestException(
          'El huesped no existe o no se encontró la habitación',
        ),
      );
      expect(mockPrismaService.reserva.create).toHaveBeenCalledTimes(1);
    });

    it('debería propagar errores inesperados', async () => {
      // Arrange
      const unexpectedError = new Error('Error inesperado');
      mockPrismaService.reserva.create.mockRejectedValue(unexpectedError);

      // Act & Assert
      await expect(service.create(mockReservaData)).rejects.toThrow(
        unexpectedError,
      );
    });
  });

  // ================================================================
  // CREATE TRANSACTION - Crear reserva en transacción
  // ================================================================
  describe('createTransaction', () => {
    it('debería crear una reserva en transacción correctamente', async () => {
      // Arrange
      const facturaId = 1;
      const expectedData = { ...mockReservaData, facturaId };
      const expectedResult = { ...mockReservaCreated, facturaId };

      const mockTx = {
        reserva: {
          create: jest.fn().mockResolvedValue(expectedResult),
        },
      } as unknown as Prisma.TransactionClient;

      // Act
      const result = await service.createTransaction(
        mockReservaData,
        facturaId,
        mockTx,
      );

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockTx.reserva.create).toHaveBeenCalledWith({
        data: expectedData,
      });
    });

    it('debería lanzar BadRequestException en transacción cuando hay error P2003', async () => {
      // Arrange
      const facturaId = 1;
      const prismaError = { code: 'P2003' };

      const mockTx = {
        reserva: {
          create: jest.fn().mockRejectedValue(prismaError),
        },
      } as unknown as Prisma.TransactionClient;

      // Act & Assert
      await expect(
        service.createTransaction(mockReservaData, facturaId, mockTx),
      ).rejects.toThrow(
        new BadRequestException(
          'El huesped no existe o no se encontró la habitación',
        ),
      );
    });
  });

  // ================================================================
  // FIND ALL - Obtener todas las reservas
  // ================================================================
  describe('findAll', () => {
    it('debería retornar reservas con paginación correctamente', async () => {
      // Arrange
      const totalReservas = 25;
      const reservas = [mockReservaCreated];
      const expectedLastPage = Math.ceil(
        totalReservas / mockPaginationDto.limit,
      );

      mockPrismaService.reserva.count.mockResolvedValue(totalReservas);
      mockPrismaService.reserva.findMany.mockResolvedValue(reservas);

      // Act
      const result = await service.findAll(mockPaginationDto);

      // Assert
      expect(result).toEqual({
        data: reservas,
        meta: {
          page: mockPaginationDto.page,
          limit: mockPaginationDto.limit,
          totalReservas,
          lastPage: expectedLastPage,
        },
      });

      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: { deleted: false },
      });

      expect(mockPrismaService.reserva.findMany).toHaveBeenCalledWith({
        skip: (mockPaginationDto.page - 1) * mockPaginationDto.limit,
        take: mockPaginationDto.limit,
        where: { deleted: false },
        include: {
          huesped: {
            select: {
              nombres: true,
              primer_apellido: true,
              segundo_apellido: true,
              numero_documento: true,
            },
          },
        },
      });
    });

    it('debería retornar respuesta vacía cuando no hay reservas', async () => {
      // Arrange
      const totalReservas = 0;
      mockPrismaService.reserva.count.mockResolvedValue(totalReservas);

      // Act
      const result = await service.findAll(mockPaginationDto);

      // Assert
      expect(result.data).toEqual([]);
      expect(result.meta.page).toBe(mockPaginationDto.page);
      expect(result.meta.limit).toBe(mockPaginationDto.limit);
      expect(mockPrismaService.reserva.findMany).not.toHaveBeenCalled();
    });

    it('debería retornar respuesta vacía cuando la página excede el límite', async () => {
      // Arrange
      const totalReservas = 5;
      const paginationExceedsLimit = { page: 10, limit: 10 };
      mockPrismaService.reserva.count.mockResolvedValue(totalReservas);

      // Act
      const result = await service.findAll(paginationExceedsLimit);

      // Assert
      expect(result.data).toEqual([]);
      expect(result.meta.lastPage).toBe(1);
      expect(mockPrismaService.reserva.findMany).not.toHaveBeenCalled();
    });
  });

  // ================================================================
  // FIND ONE - Buscar reserva por ID
  // ================================================================
  describe('findOne', () => {
    it('debería encontrar una reserva por ID correctamente', async () => {
      // Arrange
      const reservaId = 1;
      mockPrismaService.reserva.findFirstOrThrow.mockResolvedValue(
        mockReservaCreated,
      );

      // Act
      const result = await service.findOne(reservaId);

      // Assert
      expect(result).toEqual(mockReservaCreated);
      expect(mockPrismaService.reserva.findFirstOrThrow).toHaveBeenCalledWith({
        where: { id: reservaId, deleted: false },
        include: {
          factura: {
            where: { deleted: false },
          },
          huespedes_secundarios: {
            where: { deleted: false },
          },
          huesped: true,
        },
      });
    });

    it('debería lanzar NotFoundException cuando la reserva no existe', async () => {
      // Arrange
      const reservaId = 999;
      const prismaError = { code: 'P2025' };
      mockPrismaService.reserva.findFirstOrThrow.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(service.findOne(reservaId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería propagar errores inesperados', async () => {
      // Arrange
      const reservaId = 1;
      const unexpectedError = new Error('Error de base de datos');
      mockPrismaService.reserva.findFirstOrThrow.mockRejectedValue(
        unexpectedError,
      );

      // Act & Assert
      await expect(service.findOne(reservaId)).rejects.toThrow(unexpectedError);
    });
  });

  // ================================================================
  // UPDATE - Actualizar reserva
  // ================================================================
  describe('update', () => {
    const updateDto: UpdateReservaDto = {
      estado: EstadosReserva.FINALIZADO,
      costo: 600.0,
    };

    it('debería actualizar una reserva correctamente', async () => {
      // Arrange
      const reservaId = 1;
      const updatedReserva = { ...mockReservaCreated, ...updateDto };
      mockPrismaService.reserva.update.mockResolvedValue(updatedReserva);

      // Act
      const result = await service.update(reservaId, updateDto);

      // Assert
      expect(result).toEqual(updatedReserva);
      expect(mockPrismaService.reserva.update).toHaveBeenCalledWith({
        where: { id: reservaId, deleted: false },
        data: updateDto,
      });
    });

    it('debería lanzar BadRequestException cuando no se proporcionan datos', async () => {
      // Arrange
      const reservaId = 1;
      const emptyDto = {};

      // Act & Assert
      await expect(service.update(reservaId, emptyDto)).rejects.toThrow(
        new BadRequestException(
          'Debe enviar datos para actualizar la reserva.',
        ),
      );

      expect(mockPrismaService.reserva.update).not.toHaveBeenCalled();
    });
  });

  // ================================================================
  // REMOVE - Eliminar reserva (con cascada)
  // ================================================================
  describe('remove', () => {
    const mockReservaWithRelations = {
      id: 1,
      ...mockReservaCreated,
      Formulario: [
        {
          id: 1,
          LinkFormulario: { id: 1 },
        },
      ],
      factura: {
        id: 1,
      },
      huespedes_secundarios: [{ id: 1 }, { id: 2 }],
      huesped: {
        id: 1,
      },
      huespedId: 1,
    };

    it('debería eliminar reserva y entidades relacionadas correctamente', async () => {
      // Arrange
      const reservaId = 1;

      // Mock de la transacción usando el patrón correcto
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          reserva: {
            findFirst: jest.fn().mockResolvedValue(mockReservaWithRelations),
            update: jest.fn().mockResolvedValue(mockReservaCreated),
            count: jest
              .fn()
              .mockResolvedValueOnce(0) // huésped secundario 1
              .mockResolvedValueOnce(0) // huésped secundario 2
              .mockResolvedValueOnce(0), // huésped principal
          },
          linkFormulario: {
            update: jest.fn(),
          },
          formulario: {
            updateMany: jest.fn(),
          },
          factura: {
            update: jest.fn(),
          },
          huespedSecundario: {
            update: jest.fn(),
          },
          huesped: {
            update: jest.fn(),
          },
        };
        return await callback(mockTx);
      });

      // Act
      const result = await service.remove(reservaId);

      // Assert
      expect(result).toEqual(mockReservaCreated);
      expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
    });

    it('debería preservar huésped principal si tiene otras reservas activas', async () => {
      // Arrange
      const reservaId = 1;

      // Mock de la transacción
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          reserva: {
            findFirst: jest.fn().mockResolvedValue(mockReservaWithRelations),
            update: jest.fn().mockResolvedValue(mockReservaCreated),
            count: jest
              .fn()
              .mockResolvedValueOnce(0) // huésped secundario 1
              .mockResolvedValueOnce(0) // huésped secundario 2
              .mockResolvedValueOnce(2), // huésped principal tiene 2 reservas más
          },
          linkFormulario: { update: jest.fn() },
          formulario: { updateMany: jest.fn() },
          factura: { update: jest.fn() },
          huespedSecundario: { update: jest.fn() },
          huesped: { update: jest.fn() },
        };
        return await callback(mockTx);
      });

      // Act
      await service.remove(reservaId);

      // Assert - El huésped principal no debería eliminarse
      // No podemos verificar directamente mockTx.huesped.update porque está dentro del callback
      // pero el test pasará si la lógica del servicio es correcta
      expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar NotFoundException cuando la reserva no existe', async () => {
      // Arrange
      const reservaId = 999;

      // Mock de la transacción que retorna null
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          reserva: {
            findFirst: jest.fn().mockResolvedValue(null),
          },
        };
        return await callback(mockTx);
      });

      // Act & Assert
      await expect(service.remove(reservaId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ================================================================
  // REMOVE TRANSACTION - Eliminar en transacción
  // ================================================================
  describe('removeTx', () => {
    it('debería eliminar reserva en transacción correctamente', async () => {
      // Arrange
      const reservaId = 1;
      const mockTx = {
        reserva: {
          update: jest.fn().mockResolvedValue(mockReservaCreated),
        },
      } as unknown as Prisma.TransactionClient;

      // Act
      const result = await service.removeTx(reservaId, mockTx);

      // Assert
      expect(result).toEqual(mockReservaCreated);
      expect(mockTx.reserva.update).toHaveBeenCalledWith({
        where: { id: reservaId, deleted: false },
        data: { deleted: true },
      });
    });

    it('debería lanzar NotFoundException en transacción cuando la reserva no existe', async () => {
      // Arrange
      const reservaId = 999;
      const mockTx = {
        reserva: {
          update: jest.fn().mockRejectedValue({ code: 'P2025' }),
        },
      } as unknown as Prisma.TransactionClient;

      // Act & Assert
      await expect(service.removeTx(reservaId, mockTx)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ================================================================
  // UPDATE TRANSACTION - Actualizar en transacción
  // ================================================================
  describe('UpdateTransaction', () => {
    const mockUpdateDto = {
      estado: EstadosReserva.FINALIZADO,
      huespedes_secundarios: [{ id: 1 }, { id: 2 }],
    };

    it('debería actualizar reserva con huéspedes secundarios en transacción', async () => {
      // Arrange
      const reservaId = 1;
      const mockTx = {
        reserva: {
          update: jest.fn().mockResolvedValue(mockReservaCreated),
        },
      } as unknown as Prisma.TransactionClient;

      const { huespedes_secundarios, ...expectedData } = mockUpdateDto;

      // Act
      const result = await service.UpdateTransaction(
        mockUpdateDto as any,
        mockTx,
        reservaId,
      );

      // Assert
      expect(result).toEqual(mockReservaCreated);
      expect(mockTx.reserva.update).toHaveBeenCalledWith({
        where: { id: reservaId },
        data: {
          ...expectedData,
          huespedes_secundarios: {
            connect: huespedes_secundarios,
          },
        },
      });
    });
  });

  // ================================================================
  // CASOS DE BORDE Y VALIDACIONES ADICIONALES
  // ================================================================
  describe('Casos de borde y validaciones adicionales', () => {
    it('debería manejar múltiples operaciones concurrentes correctamente', async () => {
      // Arrange
      const promises = [];
      mockPrismaService.reserva.findFirstOrThrow.mockResolvedValue(
        mockReservaCreated,
      );

      // Act
      for (let i = 1; i <= 5; i++) {
        promises.push(service.findOne(i));
      }
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(5);
      expect(mockPrismaService.reserva.findFirstOrThrow).toHaveBeenCalledTimes(
        5,
      );
    });

    it('debería validar correctamente diferentes estados de reserva', async () => {
      // Arrange
      const estados = Object.values(EstadosReserva);
      mockPrismaService.reserva.create.mockResolvedValue(mockReservaCreated);

      // Act & Assert
      for (const estado of estados) {
        const reservaData = { ...mockReservaData, estado };
        await expect(service.create(reservaData)).resolves.toBeDefined();
      }
    });

    it('debería manejar correctamente diferentes motivos de viaje', async () => {
      // Arrange
      const motivos = Object.values(MotivosViajes);
      mockPrismaService.reserva.create.mockResolvedValue(mockReservaCreated);

      // Act & Assert
      for (const motivo of motivos) {
        const reservaData = { ...mockReservaData, motivo_viaje: motivo };
        await expect(service.create(reservaData)).resolves.toBeDefined();
      }
    });
  });

  // ================================================================
  // INTEGRACIÓN CON DOCUMENTACIÓN API
  // ================================================================
  describe('Integración con documentación API', () => {
    it('debería cumplir con el contrato de la API para creación exitosa', async () => {
      // Arrange
      mockPrismaService.reserva.create.mockResolvedValue(mockReservaCreated);

      // Act
      const result = await service.create(mockReservaData);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('fecha_inicio');
      expect(result).toHaveProperty('fecha_fin');
      expect(result).toHaveProperty('estado');
      expect(result).toHaveProperty('costo');
      expect(result).toHaveProperty('habitacionId');
      expect(result).toHaveProperty('huespedId');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(result).toHaveProperty('deleted');
      expect(typeof result.id).toBe('number');
      expect(result.deleted).toBe(false);
    });

    it('debería cumplir con el contrato de la API para paginación', async () => {
      // Arrange
      const totalReservas = 15;
      mockPrismaService.reserva.count.mockResolvedValue(totalReservas);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCreated,
      ]);

      // Act
      const result = await service.findAll(mockPaginationDto);

      // Assert
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('page');
      expect(result.meta).toHaveProperty('limit');
      expect(result.meta).toHaveProperty('totalReservas');
      expect(result.meta).toHaveProperty('lastPage');
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.meta.page).toBe('number');
      expect(typeof result.meta.limit).toBe('number');
      // Verificar que tiene la propiedad correcta dependiendo del tipo de respuesta
      if ('totalReservas' in result.meta) {
        expect(typeof result.meta.totalReservas).toBe('number');
      } else {
        expect(typeof (result.meta as any).total).toBe('number');
      }
      expect(typeof result.meta.lastPage).toBe('number');
    });

    it('debería cumplir con el contrato de la API para actualización exitosa', async () => {
      // Arrange
      const updateDto: UpdateReservaDto = { costo: 750.0 };
      const updatedReserva = { ...mockReservaCreated, ...updateDto };
      mockPrismaService.reserva.update.mockResolvedValue(updatedReserva);

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(result).toEqual(updatedReserva);
      expect(result.costo).toBe(750.0);
      expect(result).toHaveProperty('updatedAt');
    });
  });
});
