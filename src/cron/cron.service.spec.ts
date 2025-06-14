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

  describe('procesoAseoNocturno', () => {
    const mockConfiguracion = {
      id: 1,
      hora_proceso_nocturno_utc: '05:00',
      frecuencia_rotacion_colchones: 180, // 6 meses
      dias_aviso_rotacion_colchones: 5,
      elementos_aseo_default: ['Escoba', 'Trapeador'],
      elementos_proteccion_default: ['Guantes', 'Mascarilla'],
      productos_quimicos_default: ['Desinfectante', 'Detergente'],
      procedimiento_aseo_habitacion_default: 'Limpieza estándar',
      procedimiento_desinfeccion_habitacion_default: 'Desinfección completa',
      procedimiento_limieza_zona_comun_default: 'Limpieza áreas comunes',
      procedimiento_desinfeccion_zona_comun_default:
        'Desinfección áreas comunes',
    };

    beforeEach(() => {
      // Reset mocks antes de cada test
      jest.clearAllMocks();
      mockPrismaService.configuracionAseo.findFirst.mockResolvedValue(
        mockConfiguracion,
      );
    });

    describe('generarReporteAseoNocturno', () => {
      it('debería generar reporte de aseo diario exitosamente', async () => {
        // Arrange
        const fechaHoy = '2024-01-15';
        const registrosHabitaciones = [
          {
            id: 1,
            habitacionId: 101,
            usuarioId: 1,
            fecha_registro: new Date('2024-01-15T10:00:00Z'),
            tipos_realizados: ['LIMPIEZA'],
            objetos_perdidos: false,
            rastros_de_animales: false,
            observaciones: 'Habitación limpia',
          },
          {
            id: 2,
            habitacionId: 102,
            usuarioId: 2,
            fecha_registro: new Date('2024-01-15T14:00:00Z'),
            tipos_realizados: ['DESINFECCION'],
            objetos_perdidos: true,
            rastros_de_animales: false,
            observaciones: 'Objeto perdido encontrado',
          },
        ];

        const registrosZonasComunes = [
          {
            id: 1,
            zonaComunId: 1,
            usuarioId: 1,
            fecha_registro: new Date('2024-01-15T09:00:00Z'),
            tipos_realizados: ['LIMPIEZA'],
            objetos_perdidos: false,
            rastros_de_animales: false,
            observaciones: 'Lobby limpio',
          },
        ];

        const reporteEsperado = {
          id: 1,
          fecha: new Date('2024-01-15T00:00:00Z'),
          elementos_aseo: mockConfiguracion.elementos_aseo_default,
          elementos_proteccion: mockConfiguracion.elementos_proteccion_default,
          productos_quimicos: mockConfiguracion.productos_quimicos_default,
          procedimiento_aseo_habitacion:
            mockConfiguracion.procedimiento_aseo_habitacion_default,
          procedimiento_desinfeccion_habitacion:
            mockConfiguracion.procedimiento_desinfeccion_habitacion_default,
          procedimiento_limpieza_zona_comun:
            mockConfiguracion.procedimiento_limieza_zona_comun_default,
          procedimiento_desinfeccion_zona_comun:
            mockConfiguracion.procedimiento_desinfeccion_zona_comun_default,
          datos: {
            habitaciones: registrosHabitaciones,
            zonas_comunes: registrosZonasComunes,
            resumen: {
              total_habitaciones_aseadas: 2,
              total_zonas_comunes_aseadas: 1,
              objetos_perdidos_encontrados: 1,
              rastros_animales_encontrados: 0,
            },
          },
        };

        // Mock de que no existe reporte previo
        mockPrismaService.reporteAseoDiario.findFirst.mockResolvedValue(null);
        mockPrismaService.registroAseoHabitacion.findMany.mockResolvedValue(
          registrosHabitaciones,
        );
        mockPrismaService.registroAseoZonaComun.findMany.mockResolvedValue(
          registrosZonasComunes,
        );
        mockPrismaService.reporteAseoDiario.create.mockResolvedValue(
          reporteEsperado,
        );

        // Act
        const resultado = await service.generarReporteAseoNocturno(fechaHoy);

        // Assert
        expect(resultado).toEqual(reporteEsperado);
        expect(
          mockPrismaService.configuracionAseo.findFirst,
        ).toHaveBeenCalledWith({
          orderBy: { createdAt: 'desc' },
        });
        expect(
          mockPrismaService.reporteAseoDiario.findFirst,
        ).toHaveBeenCalledWith({
          where: {
            fecha: {
              gte: new Date('2024-01-15T00:00:00.000Z'),
              lt: new Date('2024-01-16T00:00:00.000Z'),
            },
            deleted: false,
          },
        });
        expect(
          mockPrismaService.registroAseoHabitacion.findMany,
        ).toHaveBeenCalledWith({
          where: {
            fecha_registro: {
              gte: new Date('2024-01-15T00:00:00.000Z'),
              lt: new Date('2024-01-16T00:00:00.000Z'),
            },
            deleted: false,
          },
        });
        expect(
          mockPrismaService.registroAseoZonaComun.findMany,
        ).toHaveBeenCalledWith({
          where: {
            fecha_registro: {
              gte: new Date('2024-01-15T00:00:00.000Z'),
              lt: new Date('2024-01-16T00:00:00.000Z'),
            },
            deleted: false,
          },
        });
        expect(mockPrismaService.reporteAseoDiario.create).toHaveBeenCalledWith(
          {
            data: {
              fecha: new Date('2024-01-15T00:00:00.000Z'),
              elementos_aseo: mockConfiguracion.elementos_aseo_default,
              elementos_proteccion:
                mockConfiguracion.elementos_proteccion_default,
              productos_quimicos: mockConfiguracion.productos_quimicos_default,
              procedimiento_aseo_habitacion:
                mockConfiguracion.procedimiento_aseo_habitacion_default,
              procedimiento_desinfeccion_habitacion:
                mockConfiguracion.procedimiento_desinfeccion_habitacion_default,
              procedimiento_limpieza_zona_comun:
                mockConfiguracion.procedimiento_limieza_zona_comun_default,
              procedimiento_desinfeccion_zona_comun:
                mockConfiguracion.procedimiento_desinfeccion_zona_comun_default,
              datos: {
                habitaciones: registrosHabitaciones,
                zonas_comunes: registrosZonasComunes,
                resumen: {
                  total_habitaciones_aseadas: 2,
                  total_zonas_comunes_aseadas: 1,
                  objetos_perdidos_encontrados: 1,
                  rastros_animales_encontrados: 0,
                },
              },
            },
          },
        );
      });

      it('debería lanzar error si ya existe reporte para la fecha', async () => {
        // Arrange
        const fechaHoy = '2024-01-15';
        const reporteExistente = {
          id: 1,
          fecha: new Date('2024-01-15T00:00:00Z'),
        };
        mockPrismaService.reporteAseoDiario.findFirst.mockResolvedValue(
          reporteExistente,
        );

        // Act & Assert
        await expect(
          service.generarReporteAseoNocturno(fechaHoy),
        ).rejects.toThrow(
          'Ya existe un reporte de aseo para la fecha: 2024-01-15',
        );
        expect(
          mockPrismaService.reporteAseoDiario.create,
        ).not.toHaveBeenCalled();
      });

      it('debería manejar caso sin registros de aseo', async () => {
        // Arrange
        const fechaHoy = '2024-01-15';
        mockPrismaService.reporteAseoDiario.findFirst.mockResolvedValue(null);
        mockPrismaService.registroAseoHabitacion.findMany.mockResolvedValue([]);
        mockPrismaService.registroAseoZonaComun.findMany.mockResolvedValue([]);
        mockPrismaService.reporteAseoDiario.create.mockResolvedValue({
          id: 1,
          datos: {
            habitaciones: [],
            zonas_comunes: [],
            resumen: {
              total_habitaciones_aseadas: 0,
              total_zonas_comunes_aseadas: 0,
              objetos_perdidos_encontrados: 0,
              rastros_animales_encontrados: 0,
            },
          },
        });

        // Act
        const resultado = await service.generarReporteAseoNocturno(fechaHoy);

        // Assert
        expect(resultado.datos.resumen.total_habitaciones_aseadas).toBe(0);
        expect(resultado.datos.resumen.total_zonas_comunes_aseadas).toBe(0);
        expect(resultado.datos.resumen.objetos_perdidos_encontrados).toBe(0);
        expect(resultado.datos.resumen.rastros_animales_encontrados).toBe(0);
      });

      it('debería usar configuración por defecto si no existe configuración', async () => {
        // Arrange
        const fechaHoy = '2024-01-15';
        mockPrismaService.configuracionAseo.findFirst.mockResolvedValue(null);
        mockPrismaService.reporteAseoDiario.findFirst.mockResolvedValue(null);
        mockPrismaService.registroAseoHabitacion.findMany.mockResolvedValue([]);
        mockPrismaService.registroAseoZonaComun.findMany.mockResolvedValue([]);
        mockPrismaService.reporteAseoDiario.create.mockResolvedValue({ id: 1 });

        // Act
        await service.generarReporteAseoNocturno(fechaHoy);

        // Assert
        expect(mockPrismaService.reporteAseoDiario.create).toHaveBeenCalledWith(
          {
            data: expect.objectContaining({
              elementos_aseo: ['Escoba', 'Trapeador', 'Aspiradora'],
              elementos_proteccion: ['Guantes de látex', 'Mascarilla N95'],
              productos_quimicos: [
                'Desinfectante multiusos',
                'Detergente líquido',
              ],
              procedimiento_aseo_habitacion:
                'Ventilación, retiro de ropa de cama, limpieza de superficies',
              procedimiento_desinfeccion_habitacion:
                'Aplicación de desinfectante en todas las superficies',
              procedimiento_limpieza_zona_comun:
                'Barrido, trapeado con desinfectante',
              procedimiento_desinfeccion_zona_comun:
                'Nebulización con desinfectante',
            }),
          },
        );
      });
    });

    describe('actualizarEstadosAseoZonasComunes', () => {
      it('debería actualizar zonas comunes que requieren aseo diario', async () => {
        // Arrange
        const zonasComunes = [
          {
            id: 1,
            nombre: 'Lobby',
            ultimo_aseo_fecha: new Date('2024-01-14T10:00:00Z'), // Ayer
            ultimo_aseo_tipo: 'LIMPIEZA',
          },
          {
            id: 2,
            nombre: 'Piscina',
            ultimo_aseo_fecha: new Date('2024-01-13T10:00:00Z'), // Hace 2 días
            ultimo_aseo_tipo: 'LIMPIEZA',
          },
        ];

        mockPrismaService.zonaComun.findMany.mockResolvedValue(zonasComunes);
        mockPrismaService.zonaComun.updateMany.mockResolvedValue({ count: 2 });

        // Act
        const resultado = await service.actualizarEstadosAseoZonasComunes();

        // Assert
        expect(resultado).toEqual({
          zonasActualizadas: 2,
          requierenAseo: 2,
          requierenDesinfeccion: 0,
        });

        expect(mockPrismaService.zonaComun.findMany).toHaveBeenCalledWith({
          where: { deleted: false },
          select: {
            id: true,
            nombre: true,
            ultimo_aseo_fecha: true,
            ultimo_aseo_tipo: true,
          },
        });

        expect(mockPrismaService.zonaComun.updateMany).toHaveBeenCalledWith({
          where: {
            id: { in: [1, 2] },
          },
          data: {
            requerido_aseo_hoy: true,
          },
        });
      });

      it('debería actualizar zonas comunes que requieren desinfección según configuración', async () => {
        // Arrange
        const configuracionConDesinfeccion = {
          ...mockConfiguracion,
          frecuencia_desinfeccion_zonas_comunes: 30, // Cada 30 días
        };
        mockPrismaService.configuracionAseo.findFirst.mockResolvedValue(
          configuracionConDesinfeccion,
        );

        const zonasComunes = [
          {
            id: 1,
            nombre: 'Lobby',
            ultimo_aseo_fecha: new Date('2023-12-15T10:00:00Z'), // Hace más de 30 días
            ultimo_aseo_tipo: 'DESINFECCION',
          },
          {
            id: 2,
            nombre: 'Piscina',
            ultimo_aseo_fecha: new Date('2024-01-10T10:00:00Z'), // Hace 5 días
            ultimo_aseo_tipo: 'DESINFECCION',
          },
        ];

        mockPrismaService.zonaComun.findMany.mockResolvedValue(zonasComunes);
        mockPrismaService.zonaComun.updateMany.mockResolvedValue({ count: 1 });

        // Act
        const resultado = await service.actualizarEstadosAseoZonasComunes();

        // Assert
        expect(resultado.requierenDesinfeccion).toBe(1);
        expect(mockPrismaService.zonaComun.updateMany).toHaveBeenCalledWith({
          where: {
            id: { in: [1] },
          },
          data: {
            requerido_aseo_hoy: true,
          },
        });
      });

      it('debería manejar zonas comunes sin historial de aseo', async () => {
        // Arrange
        const zonasComunes = [
          {
            id: 1,
            nombre: 'Lobby',
            ultimo_aseo_fecha: null,
            ultimo_aseo_tipo: null,
          },
        ];

        mockPrismaService.zonaComun.findMany.mockResolvedValue(zonasComunes);
        mockPrismaService.zonaComun.updateMany.mockResolvedValue({ count: 1 });

        // Act
        const resultado = await service.actualizarEstadosAseoZonasComunes();

        // Assert
        expect(resultado.requierenAseo).toBe(1);
        expect(mockPrismaService.zonaComun.updateMany).toHaveBeenCalledWith({
          where: {
            id: { in: [1] },
          },
          data: {
            requerido_aseo_hoy: true,
          },
        });
      });

      it('debería manejar caso sin zonas comunes', async () => {
        // Arrange
        mockPrismaService.zonaComun.findMany.mockResolvedValue([]);

        // Act
        const resultado = await service.actualizarEstadosAseoZonasComunes();

        // Assert
        expect(resultado).toEqual({
          zonasActualizadas: 0,
          requierenAseo: 0,
          requierenDesinfeccion: 0,
        });
        expect(mockPrismaService.zonaComun.updateMany).not.toHaveBeenCalled();
      });
    });

    describe('actualizarEstadosAseoHabitaciones', () => {
      it('debería actualizar habitaciones que requieren aseo diario', async () => {
        // Arrange
        const habitaciones = [
          {
            id: 1,
            numero: 101,
            ultimo_aseo_fecha: new Date('2024-01-14T10:00:00Z'), // Ayer
            reservas: [],
          },
          {
            id: 2,
            numero: 102,
            ultimo_aseo_fecha: new Date('2024-01-13T10:00:00Z'), // Hace 2 días
            reservas: [],
          },
        ];

        mockPrismaService.habitacion.findMany.mockResolvedValue(habitaciones);
        mockPrismaService.habitacion.updateMany.mockResolvedValue({ count: 2 });

        // Act
        const resultado = await service.actualizarEstadosAseoHabitaciones();

        // Assert
        expect(resultado).toEqual({
          habitacionesActualizadas: 2,
          requierenAseo: 2,
          requierenDesinfeccion: 0,
        });

        expect(mockPrismaService.habitacion.findMany).toHaveBeenCalledWith({
          where: { deleted: false },
          select: {
            id: true,
            numero: true,
            ultimo_aseo_fecha: true,
            ultima_rotacion_colchones: true,
            reservas: {
              where: {
                deleted: false,
                estado: { in: ['RESERVADO', 'PENDIENTE'] },
                fecha_inicio: { lte: expect.any(Date) },
                fecha_fin: { gte: expect.any(Date) },
              },
              select: { id: true, estado: true },
            },
          },
        });

        expect(mockPrismaService.habitacion.updateMany).toHaveBeenCalledWith({
          where: {
            id: { in: [1, 2] },
          },
          data: {
            requerido_aseo_hoy: true,
          },
        });
      });

      it('debería actualizar habitaciones que requieren desinfección por reserva activa', async () => {
        // Arrange
        const habitaciones = [
          {
            id: 1,
            numero: 101,
            ultimo_aseo_fecha: new Date('2024-01-15T08:00:00Z'), // Hoy temprano
            reservas: [
              { id: 1, estado: 'RESERVADO' }, // Tiene reserva activa
            ],
          },
          {
            id: 2,
            numero: 102,
            ultimo_aseo_fecha: new Date('2024-01-15T08:00:00Z'), // Hoy temprano
            reservas: [], // Sin reserva activa
          },
        ];

        mockPrismaService.habitacion.findMany.mockResolvedValue(habitaciones);
        mockPrismaService.habitacion.updateMany.mockResolvedValue({ count: 1 });

        // Act
        const resultado = await service.actualizarEstadosAseoHabitaciones();

        // Assert
        expect(resultado.requierenDesinfeccion).toBe(1);
        expect(resultado.requierenAseo).toBe(1); // La habitación 102 sin reserva
        expect(mockPrismaService.habitacion.updateMany).toHaveBeenCalledTimes(
          2,
        );
      });

      it('debería calcular días restantes para rotación de colchones', async () => {
        // Arrange
        const habitaciones = [
          {
            id: 1,
            numero: 101,
            ultimo_aseo_fecha: new Date('2024-01-15T08:00:00Z'),
            ultima_rotacion_colchones: new Date('2023-07-15T00:00:00Z'), // Hace ~6 meses
            reservas: [],
          },
          {
            id: 2,
            numero: 102,
            ultimo_aseo_fecha: new Date('2024-01-15T08:00:00Z'),
            ultima_rotacion_colchones: null, // Nunca se ha rotado
            reservas: [],
          },
        ];

        mockPrismaService.habitacion.findMany.mockResolvedValue(habitaciones);
        mockPrismaService.habitacion.updateMany.mockResolvedValue({ count: 2 });
        mockPrismaService.habitacion.update.mockResolvedValue({});

        // Act
        const resultado = await service.actualizarEstadosAseoHabitaciones();

        // Assert
        expect(resultado).toEqual({
          habitacionesActualizadas: 2,
          requierenAseo: 2,
          requierenDesinfeccion: 0,
          rotacionColchones: {
            habitacionesActualizadas: 2,
            requierenRotacion: 1, // Solo la habitación 1 que ya cumplió los 180 días
            sinHistorial: 1, // La habitación 2 sin historial
          },
        });

        // Verificar que se actualizaron los días restantes para rotación
        expect(mockPrismaService.habitacion.update).toHaveBeenCalledTimes(2);
        expect(mockPrismaService.habitacion.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: {
            requerido_rotacion_colchones: true,
            dias_restantes_rotacion: expect.any(Number),
          },
        });
        expect(mockPrismaService.habitacion.update).toHaveBeenCalledWith({
          where: { id: 2 },
          data: {
            requerido_rotacion_colchones: false,
            dias_restantes_rotacion: 180, // Días completos desde hoy
          },
        });
      });

      it('debería manejar habitaciones sin historial de aseo', async () => {
        // Arrange
        const habitaciones = [
          {
            id: 1,
            numero: 101,
            ultimo_aseo_fecha: null,
            ultima_rotacion_colchones: null,
            reservas: [],
          },
        ];

        mockPrismaService.habitacion.findMany.mockResolvedValue(habitaciones);
        mockPrismaService.habitacion.updateMany.mockResolvedValue({ count: 1 });
        mockPrismaService.habitacion.update.mockResolvedValue({});

        // Act
        const resultado = await service.actualizarEstadosAseoHabitaciones();

        // Assert
        expect(resultado.requierenAseo).toBe(1);
        expect(mockPrismaService.habitacion.updateMany).toHaveBeenCalledWith({
          where: {
            id: { in: [1] },
          },
          data: {
            requerido_aseo_hoy: true,
          },
        });
      });

      it('debería manejar caso sin habitaciones', async () => {
        // Arrange
        mockPrismaService.habitacion.findMany.mockResolvedValue([]);

        // Act
        const resultado = await service.actualizarEstadosAseoHabitaciones();

        // Assert
        expect(resultado).toEqual({
          habitacionesActualizadas: 0,
          requierenAseo: 0,
          requierenDesinfeccion: 0,
          rotacionColchones: {
            habitacionesActualizadas: 0,
            requierenRotacion: 0,
            sinHistorial: 0,
          },
        });
        expect(mockPrismaService.habitacion.updateMany).not.toHaveBeenCalled();
        expect(mockPrismaService.habitacion.update).not.toHaveBeenCalled();
      });
    });

    describe('procesoAseoNocturnoCompleto', () => {
      it('debería ejecutar proceso completo de aseo nocturno exitosamente', async () => {
        // Arrange
        const fechaHoy = '2024-01-15';

        // Mock de todos los métodos
        jest.spyOn(service, 'generarReporteAseoNocturno').mockResolvedValue({
          id: 1,
          fecha: new Date('2024-01-15T00:00:00Z'),
          datos: { resumen: { total_habitaciones_aseadas: 5 } },
        } as any);

        jest
          .spyOn(service, 'actualizarEstadosAseoZonasComunes')
          .mockResolvedValue({
            zonasActualizadas: 3,
            requierenAseo: 2,
            requierenDesinfeccion: 1,
          });

        jest
          .spyOn(service, 'actualizarEstadosAseoHabitaciones')
          .mockResolvedValue({
            habitacionesActualizadas: 10,
            requierenAseo: 7,
            requierenDesinfeccion: 3,
            rotacionColchones: {
              habitacionesActualizadas: 10,
              requierenRotacion: 2,
              sinHistorial: 1,
            },
          });

        // Act
        const resultado = await service.procesoAseoNocturnoCompleto(fechaHoy);

        // Assert
        expect(resultado).toEqual({
          fecha: fechaHoy,
          reporte: {
            id: 1,
            fecha: new Date('2024-01-15T00:00:00Z'),
            datos: { resumen: { total_habitaciones_aseadas: 5 } },
          },
          zonasComunes: {
            zonasActualizadas: 3,
            requierenAseo: 2,
            requierenDesinfeccion: 1,
          },
          habitaciones: {
            habitacionesActualizadas: 10,
            requierenAseo: 7,
            requierenDesinfeccion: 3,
            rotacionColchones: {
              habitacionesActualizadas: 10,
              requierenRotacion: 2,
              sinHistorial: 1,
            },
          },
          tiempoEjecucion: expect.any(Number),
        });

        expect(service.generarReporteAseoNocturno).toHaveBeenCalledWith(
          fechaHoy,
        );
        expect(service.actualizarEstadosAseoZonasComunes).toHaveBeenCalled();
        expect(service.actualizarEstadosAseoHabitaciones).toHaveBeenCalled();
      });

      it('debería manejar errores en generación de reporte', async () => {
        // Arrange
        const fechaHoy = '2024-01-15';
        const errorEsperado = new Error('Error al generar reporte');

        jest
          .spyOn(service, 'generarReporteAseoNocturno')
          .mockRejectedValue(errorEsperado);
        jest
          .spyOn(service, 'actualizarEstadosAseoZonasComunes')
          .mockResolvedValue({
            zonasActualizadas: 0,
            requierenAseo: 0,
            requierenDesinfeccion: 0,
          });
        jest
          .spyOn(service, 'actualizarEstadosAseoHabitaciones')
          .mockResolvedValue({
            habitacionesActualizadas: 0,
            requierenAseo: 0,
            requierenDesinfeccion: 0,
            rotacionColchones: {
              habitacionesActualizadas: 0,
              requierenRotacion: 0,
              sinHistorial: 0,
            },
          });

        // Act
        const resultado = await service.procesoAseoNocturnoCompleto(fechaHoy);

        // Assert
        expect(resultado.reporte).toEqual({
          error: 'Error al generar reporte',
        });
        expect(resultado.zonasComunes).toBeDefined();
        expect(resultado.habitaciones).toBeDefined();
      });

      it('debería continuar proceso aunque falle actualización de zonas comunes', async () => {
        // Arrange
        const fechaHoy = '2024-01-15';

        jest
          .spyOn(service, 'generarReporteAseoNocturno')
          .mockResolvedValue({ id: 1 } as any);
        jest
          .spyOn(service, 'actualizarEstadosAseoZonasComunes')
          .mockRejectedValue(new Error('Error en zonas comunes'));
        jest
          .spyOn(service, 'actualizarEstadosAseoHabitaciones')
          .mockResolvedValue({
            habitacionesActualizadas: 5,
            requierenAseo: 3,
            requierenDesinfeccion: 2,
            rotacionColchones: {
              habitacionesActualizadas: 5,
              requierenRotacion: 1,
              sinHistorial: 0,
            },
          });

        // Act
        const resultado = await service.procesoAseoNocturnoCompleto(fechaHoy);

        // Assert
        expect(resultado.reporte).toEqual({ id: 1 });
        expect(resultado.zonasComunes).toEqual({
          error: 'Error en zonas comunes',
        });
        expect(resultado.habitaciones.habitacionesActualizadas).toBe(5);
      });

      it('debería medir tiempo de ejecución correctamente', async () => {
        // Arrange
        const fechaHoy = '2024-01-15';

        jest
          .spyOn(service, 'generarReporteAseoNocturno')
          .mockImplementation(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100)); // Simular delay
            return { id: 1 } as any;
          });
        jest
          .spyOn(service, 'actualizarEstadosAseoZonasComunes')
          .mockResolvedValue({
            zonasActualizadas: 0,
            requierenAseo: 0,
            requierenDesinfeccion: 0,
          });
        jest
          .spyOn(service, 'actualizarEstadosAseoHabitaciones')
          .mockResolvedValue({
            habitacionesActualizadas: 0,
            requierenAseo: 0,
            requierenDesinfeccion: 0,
            rotacionColchones: {
              habitacionesActualizadas: 0,
              requierenRotacion: 0,
              sinHistorial: 0,
            },
          });

        // Act
        const resultado = await service.procesoAseoNocturnoCompleto(fechaHoy);

        // Assert
        expect(resultado.tiempoEjecucion).toBeGreaterThan(90); // Al menos 90ms
        expect(resultado.tiempoEjecucion).toBeLessThan(200); // Menos de 200ms
      });
    });
  });
});
