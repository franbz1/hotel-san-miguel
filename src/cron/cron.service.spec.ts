import { Test, TestingModule } from '@nestjs/testing';
import { CronService } from './cron.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { HabitacionSseService } from 'src/sse/habitacionSse.service';
import { ReservaSseService } from 'src/sse/reservasSse.service';
import { EstadoHabitacion } from 'src/common/enums/estadosHbaitacion.enum';
import { EstadosReserva } from '@prisma/client';

describe('CronService', () => {
  let service: CronService;
  let prismaService: PrismaService;
  let habitacionSseService: HabitacionSseService;
  let reservaSseService: ReservaSseService;

  // Mock del PrismaService con transacciones
  const mockPrismaService = {
    $transaction: jest.fn(),
    habitacion: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    reserva: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    zonaComun: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    configuracionAseo: {
      findFirst: jest.fn(),
    },
    reporteAseoDiario: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    registroAseoHabitacion: {
      findMany: jest.fn(),
    },
    registroAseoZonaComun: {
      findMany: jest.fn(),
    },
  };

  // Mock del HabitacionSseService
  const mockHabitacionSseService = {
    emitirCambios: jest.fn(),
  };

  // Mock del ReservaSseService
  const mockReservaSseService = {
    emitirCambio: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: HabitacionSseService,
          useValue: mockHabitacionSseService,
        },
        {
          provide: ReservaSseService,
          useValue: mockReservaSseService,
        },
      ],
    }).compile();

    service = module.get<CronService>(CronService);
    prismaService = module.get<PrismaService>(PrismaService);
    habitacionSseService =
      module.get<HabitacionSseService>(HabitacionSseService);
    reservaSseService = module.get<ReservaSseService>(ReservaSseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición del servicio', () => {
    it('debería estar definido', () => {
      expect(service).toBeDefined();
    });

    it('debería tener todas las dependencias inyectadas', () => {
      expect(prismaService).toBeDefined();
      expect(habitacionSseService).toBeDefined();
      expect(reservaSseService).toBeDefined();
    });
  });

  describe('marcarEstadosCronConTransaccion', () => {
    it('debería actualizar estados de habitaciones y reservas exitosamente', async () => {
      // Arrange
      const habitacionesNear = [{ id: 1 }, { id: 2 }];
      const habitacionesOccupied = [{ id: 3 }];
      const habitacionesFree = [{ id: 4 }, { id: 5 }, { id: 6 }];
      const reservasFinalizadas = [
        { id: 10, habitacionId: 1 },
        { id: 11, habitacionId: 2 },
      ];

      // Mock de la transacción
      const mockTx = {
        habitacion: {
          findMany: jest.fn(),
          updateMany: jest.fn(),
        },
        reserva: {
          findMany: jest.fn(),
          updateMany: jest.fn(),
        },
      };

      // Configurar respuestas del mock de transacción
      mockTx.habitacion.findMany
        .mockResolvedValueOnce(habitacionesNear) // nearRooms
        .mockResolvedValueOnce(habitacionesOccupied) // occRooms
        .mockResolvedValueOnce(habitacionesFree); // freeRooms

      mockTx.reserva.findMany.mockResolvedValue(reservasFinalizadas);

      mockTx.habitacion.updateMany.mockResolvedValue({ count: 0 });
      mockTx.reserva.updateMany.mockResolvedValue({ count: 0 });

      // Simular transacción exitosa
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const result = await callback(mockTx);
        return result;
      });

      // Act
      const resultado = await service.marcarEstadosCronConTransaccion();

      // Assert
      expect(resultado).toEqual({
        habitaciones: {
          near: 2,
          occupied: 1,
          free: 3,
        },
        reservas: {
          finalizadas: 2,
        },
      });

      // Verificar que se ejecutaron todas las consultas
      expect(mockTx.habitacion.findMany).toHaveBeenCalledTimes(3);
      expect(mockTx.reserva.findMany).toHaveBeenCalledTimes(1);
      expect(mockTx.habitacion.updateMany).toHaveBeenCalledTimes(3);
      expect(mockTx.reserva.updateMany).toHaveBeenCalledTimes(1);

      // Verificar emisiones SSE
      expect(habitacionSseService.emitirCambios).toHaveBeenCalledWith([
        { habitacionId: 1, nuevoEstado: EstadoHabitacion.RESERVADO },
        { habitacionId: 2, nuevoEstado: EstadoHabitacion.RESERVADO },
        { habitacionId: 3, nuevoEstado: EstadoHabitacion.OCUPADO },
        { habitacionId: 4, nuevoEstado: EstadoHabitacion.LIBRE },
        { habitacionId: 5, nuevoEstado: EstadoHabitacion.LIBRE },
        { habitacionId: 6, nuevoEstado: EstadoHabitacion.LIBRE },
      ]);

      expect(reservaSseService.emitirCambio).toHaveBeenCalledTimes(2);
      expect(reservaSseService.emitirCambio).toHaveBeenCalledWith(1, {
        reservaId: 10,
        nuevoEstado: EstadosReserva.FINALIZADO,
      });
      expect(reservaSseService.emitirCambio).toHaveBeenCalledWith(2, {
        reservaId: 11,
        nuevoEstado: EstadosReserva.FINALIZADO,
      });
    });

    it('debería manejar caso sin cambios correctamente', async () => {
      // Arrange
      const mockTx = {
        habitacion: {
          findMany: jest.fn().mockResolvedValue([]), // Sin habitaciones para cambiar
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        reserva: {
          findMany: jest.fn().mockResolvedValue([]), // Sin reservas para finalizar
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      // Act
      const resultado = await service.marcarEstadosCronConTransaccion();

      // Assert
      expect(resultado).toEqual({
        habitaciones: {
          near: 0,
          occupied: 0,
          free: 0,
        },
        reservas: {
          finalizadas: 0,
        },
      });

      // Verificar que no se emitieron cambios SSE
      expect(habitacionSseService.emitirCambios).toHaveBeenCalledWith([]);
      expect(reservaSseService.emitirCambio).not.toHaveBeenCalled();
    });

    it('debería manejar errores en la transacción correctamente', async () => {
      // Arrange
      const errorEsperado = new Error('Error de conexión a la base de datos');
      mockPrismaService.$transaction.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(service.marcarEstadosCronConTransaccion()).rejects.toThrow(
        'Error de conexión a la base de datos',
      );

      // Verificar que no se emitieron cambios SSE en caso de error
      expect(habitacionSseService.emitirCambios).not.toHaveBeenCalled();
      expect(reservaSseService.emitirCambio).not.toHaveBeenCalled();
    });

    it('debería construir filtros WHERE correctamente para habitaciones', async () => {
      // Arrange
      const mockTx = {
        habitacion: {
          findMany: jest.fn().mockResolvedValue([]),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        reserva: {
          findMany: jest.fn().mockResolvedValue([]),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      // Act
      await service.marcarEstadosCronConTransaccion();

      // Assert - Verificar que se llamaron con los filtros correctos
      expect(mockTx.habitacion.findMany).toHaveBeenCalledWith({
        where: {
          deleted: false,
          estado: {
            notIn: [EstadoHabitacion.RESERVADO, EstadoHabitacion.OCUPADO],
          },
          reservas: {
            some: {
              deleted: false,
              estado: { in: [EstadosReserva.RESERVADO] },
              fecha_inicio: {
                gte: expect.any(Date),
                lte: expect.any(Date),
              },
            },
          },
        },
        select: { id: true },
      });
    });

    it('debería agrupar reservas por habitación para SSE correctamente', async () => {
      // Arrange
      const reservasFinalizadas = [
        { id: 10, habitacionId: 1 },
        { id: 11, habitacionId: 1 }, // Misma habitación
        { id: 12, habitacionId: 2 },
        { id: 13, habitacionId: 3 },
        { id: 14, habitacionId: 3 }, // Misma habitación
      ];

      const mockTx = {
        habitacion: {
          findMany: jest.fn().mockResolvedValue([]),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        reserva: {
          findMany: jest.fn().mockResolvedValue(reservasFinalizadas),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      // Act
      await service.marcarEstadosCronConTransaccion();

      // Assert - Verificar que se emitieron cambios para cada reserva
      expect(reservaSseService.emitirCambio).toHaveBeenCalledTimes(5);

      // Verificar llamadas específicas agrupadas por habitación
      expect(reservaSseService.emitirCambio).toHaveBeenCalledWith(1, {
        reservaId: 10,
        nuevoEstado: EstadosReserva.FINALIZADO,
      });
      expect(reservaSseService.emitirCambio).toHaveBeenCalledWith(1, {
        reservaId: 11,
        nuevoEstado: EstadosReserva.FINALIZADO,
      });
      expect(reservaSseService.emitirCambio).toHaveBeenCalledWith(2, {
        reservaId: 12,
        nuevoEstado: EstadosReserva.FINALIZADO,
      });
      expect(reservaSseService.emitirCambio).toHaveBeenCalledWith(3, {
        reservaId: 13,
        nuevoEstado: EstadosReserva.FINALIZADO,
      });
      expect(reservaSseService.emitirCambio).toHaveBeenCalledWith(3, {
        reservaId: 14,
        nuevoEstado: EstadosReserva.FINALIZADO,
      });
    });
  });

  describe('Validaciones de lógica de negocio', () => {
    it('debería validar condiciones de tiempo para habitaciones RESERVADAS', async () => {
      // Arrange
      const mockTx = {
        habitacion: {
          findMany: jest.fn(),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        reserva: {
          findMany: jest.fn().mockResolvedValue([]),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
      };

      mockTx.habitacion.findMany
        .mockResolvedValueOnce([{ id: 1 }]) // near
        .mockResolvedValueOnce([]) // occupied
        .mockResolvedValueOnce([]); // free

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      // Act
      await service.marcarEstadosCronConTransaccion();

      // Assert
      const nearCall = mockTx.habitacion.findMany.mock.calls[0][0];
      expect(nearCall.where.reservas.some.fecha_inicio).toHaveProperty('gte');
      expect(nearCall.where.reservas.some.fecha_inicio).toHaveProperty('lte');

      // Verificar que el límite futuro es 6 horas
      const gte = nearCall.where.reservas.some.fecha_inicio.gte;
      const lte = nearCall.where.reservas.some.fecha_inicio.lte;
      const diffHours = (lte.getTime() - gte.getTime()) / (1000 * 60 * 60);
      expect(diffHours).toBe(6);
    });

    it('debería validar condiciones de tiempo para habitaciones OCUPADAS', async () => {
      // Arrange
      const mockTx = {
        habitacion: {
          findMany: jest.fn(),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        reserva: {
          findMany: jest.fn().mockResolvedValue([]),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
      };

      mockTx.habitacion.findMany
        .mockResolvedValueOnce([]) // near
        .mockResolvedValueOnce([{ id: 2 }]) // occupied
        .mockResolvedValueOnce([]); // free

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      // Act
      await service.marcarEstadosCronConTransaccion();

      // Assert
      const occupiedCall = mockTx.habitacion.findMany.mock.calls[1][0];
      expect(occupiedCall.where.reservas.some.fecha_inicio).toHaveProperty(
        'lte',
      );
      expect(occupiedCall.where.reservas.some.fecha_fin).toHaveProperty('gt');

      // Verificar que se buscan reservas activas en este momento
      const fechaInicio = occupiedCall.where.reservas.some.fecha_inicio.lte;
      const fechaFin = occupiedCall.where.reservas.some.fecha_fin.gt;
      expect(fechaInicio).toBeInstanceOf(Date);
      expect(fechaFin).toBeInstanceOf(Date);
    });

    it('debería validar condiciones para habitaciones LIBRES', async () => {
      // Arrange
      const mockTx = {
        habitacion: {
          findMany: jest.fn(),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        reserva: {
          findMany: jest.fn().mockResolvedValue([]),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
      };

      mockTx.habitacion.findMany
        .mockResolvedValueOnce([]) // near
        .mockResolvedValueOnce([]) // occupied
        .mockResolvedValueOnce([{ id: 3 }]); // free

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      // Act
      await service.marcarEstadosCronConTransaccion();

      // Assert
      const freeCall = mockTx.habitacion.findMany.mock.calls[2][0];
      expect(freeCall.where.reservas).toHaveProperty('none');
      expect(freeCall.where.estado).toEqual({
        not: EstadoHabitacion.LIBRE,
      });

      // Verificar condiciones de reservas
      const reservasCondition = freeCall.where.reservas.none;
      expect(reservasCondition.deleted).toBe(false);
      expect(reservasCondition.estado.in).toContain(EstadosReserva.RESERVADO);
      expect(reservasCondition.estado.in).toContain(EstadosReserva.PENDIENTE);
    });

    it('debería validar condiciones para reservas finalizadas', async () => {
      // Arrange
      const mockTx = {
        habitacion: {
          findMany: jest.fn().mockResolvedValue([]),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        reserva: {
          findMany: jest.fn().mockResolvedValue([{ id: 1, habitacionId: 1 }]),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      // Act
      await service.marcarEstadosCronConTransaccion();

      // Assert
      const reservaCall = mockTx.reserva.findMany.mock.calls[0][0];
      expect(reservaCall.where.deleted).toBe(false);
      expect(reservaCall.where.estado).toBe(EstadosReserva.RESERVADO);
      expect(reservaCall.where.fecha_fin).toHaveProperty('lt');
      expect(reservaCall.where.fecha_fin.lt).toBeInstanceOf(Date);
    });
  });

  describe('Casos de borde y validaciones adicionales', () => {
    it('debería manejar múltiples habitaciones del mismo tipo correctamente', async () => {
      // Arrange
      const habitacionesMultiples = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
      }));

      const mockTx = {
        habitacion: {
          findMany: jest.fn(),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        reserva: {
          findMany: jest.fn().mockResolvedValue([]),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
      };

      mockTx.habitacion.findMany
        .mockResolvedValueOnce(habitacionesMultiples) // todas como near
        .mockResolvedValueOnce([]) // occupied
        .mockResolvedValueOnce([]); // free

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      // Act
      const resultado = await service.marcarEstadosCronConTransaccion();

      // Assert
      expect(resultado.habitaciones.near).toBe(50);
      expect(habitacionSseService.emitirCambios).toHaveBeenCalledWith(
        habitacionesMultiples.map((h) => ({
          habitacionId: h.id,
          nuevoEstado: EstadoHabitacion.RESERVADO,
        })),
      );
    });

    it('debería manejar errores parciales en la transacción', async () => {
      // Arrange
      const mockTx = {
        habitacion: {
          findMany: jest
            .fn()
            .mockResolvedValueOnce([{ id: 1 }])
            .mockRejectedValueOnce(new Error('Error en consulta')),
          updateMany: jest.fn(),
        },
        reserva: {
          findMany: jest.fn(),
          updateMany: jest.fn(),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      // Act & Assert
      await expect(service.marcarEstadosCronConTransaccion()).rejects.toThrow(
        'Error en consulta',
      );
    });

    it('debería verificar el orden correcto de ejecución de operaciones', async () => {
      // Arrange
      const operaciones: string[] = [];

      const mockTx = {
        habitacion: {
          findMany: jest.fn().mockImplementation(async () => {
            operaciones.push('findMany-habitacion');
            return [];
          }),
          updateMany: jest.fn().mockImplementation(async () => {
            operaciones.push('updateMany-habitacion');
            return { count: 0 };
          }),
        },
        reserva: {
          findMany: jest.fn().mockImplementation(async () => {
            operaciones.push('findMany-reserva');
            return [];
          }),
          updateMany: jest.fn().mockImplementation(async () => {
            operaciones.push('updateMany-reserva');
            return { count: 0 };
          }),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      // Act
      await service.marcarEstadosCronConTransaccion();

      // Assert
      expect(operaciones).toEqual([
        'findMany-habitacion', // near
        'findMany-habitacion', // occupied
        'findMany-habitacion', // free
        'findMany-reserva', // finalizadas
        'updateMany-habitacion', // near update
        'updateMany-habitacion', // occupied update
        'updateMany-habitacion', // free update
        'updateMany-reserva', // finalizadas update
      ]);
    });

    it('debería emitir eventos SSE solo después de confirmación de transacción', async () => {
      // Arrange
      let transaccionCompletada = false;
      const mockTx = {
        habitacion: {
          findMany: jest.fn().mockResolvedValue([{ id: 1 }]),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        reserva: {
          findMany: jest.fn().mockResolvedValue([]),
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const result = await callback(mockTx);
        transaccionCompletada = true;
        return result;
      });

      mockHabitacionSseService.emitirCambios.mockImplementation(() => {
        expect(transaccionCompletada).toBe(true);
      });

      // Act
      await service.marcarEstadosCronConTransaccion();

      // Assert
      expect(habitacionSseService.emitirCambios).toHaveBeenCalled();
    });
  });
});
