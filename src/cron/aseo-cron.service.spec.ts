import { Test, TestingModule } from '@nestjs/testing';
import { AseoCronService } from './aseo-cron.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { HabitacionSseService } from 'src/sse/habitacionSse.service';
import { ReservaSseService } from 'src/sse/reservasSse.service';

describe('CronService - Módulo de Aseo', () => {
  let service: AseoCronService;
  let prismaService: PrismaService;

  // Mock del PrismaService específico para aseo
  const mockPrismaService = {
    habitacion: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
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
        AseoCronService,
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

    service = module.get<AseoCronService>(AseoCronService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
        expect(
          (resultado.datos as any).resumen.total_habitaciones_aseadas,
        ).toBe(0);
        expect(
          (resultado.datos as any).resumen.total_zonas_comunes_aseadas,
        ).toBe(0);
        expect(
          (resultado.datos as any).resumen.objetos_perdidos_encontrados,
        ).toBe(0);
        expect(
          (resultado.datos as any).resumen.rastros_animales_encontrados,
        ).toBe(0);
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
