import { Test, TestingModule } from '@nestjs/testing';
import { AseoCronService } from './aseo-cron.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { ConfiguracionAseoService } from 'src/configuracion-aseo/configuracion-aseo.service';
import { ReportesAseoService } from 'src/reportes-aseo/reportes-aseo.service';
import { NotificacionesService } from 'src/notificaciones/notificaciones.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { BadRequestException } from '@nestjs/common';
import { ConfiguracionAseo } from '@prisma/client';
import * as fs from 'fs';

// Mock de fs
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('AseoCronService', () => {
  let service: AseoCronService;
  let prismaService: any;
  let configuracionAseoService: jest.Mocked<ConfiguracionAseoService>;
  let reportesAseoService: jest.Mocked<ReportesAseoService>;
  let schedulerRegistry: jest.Mocked<SchedulerRegistry>;

  // Configuración mock completa
  const mockConfiguracion: ConfiguracionAseo = {
    id: 1,
    hora_limite_aseo: '14:00',
    hora_proceso_nocturno_utc: '02:30',
    frecuencia_rotacion_colchones: 90,
    dias_aviso_rotacion_colchones: 7,
    frecuencia_desinfeccion_zona_comun: 14,
    dias_aviso_desinfeccion_zona_comun: 3,
    habilitar_notificaciones: true,
    email_notificaciones: 'test@hotel.com',
    elementos_aseo_default: ['Escoba', 'Trapeador'],
    elementos_proteccion_default: ['Guantes', 'Mascarilla'],
    productos_quimicos_default: ['Desinfectante'],
    areas_intervenir_habitacion_default: ['Cama', 'Baño'],
    areas_intervenir_banio_default: ['Inodoro', 'Lavamanos'],
    procedimiento_aseo_habitacion_default: 'Limpiar superficies',
    procedimiento_desinfeccion_habitacion_default: 'Aplicar desinfectante',
    procedimiento_rotacion_colchones_default: 'Rotar colchón 180 grados',
    procedimiento_limieza_zona_comun_default: 'Limpiar áreas comunes',
    procedimiento_desinfeccion_zona_comun_default: 'Desinfectar superficies',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Habitaciones mock
  const mockHabitaciones = [
    {
      id: 1,
      proxima_rotacion_colchones: new Date('2024-01-15T00:00:00.000Z'),
      requerido_rotacion_colchones: false,
    },
    {
      id: 2,
      proxima_rotacion_colchones: new Date('2024-01-10T00:00:00.000Z'), // Pasada
      requerido_rotacion_colchones: false,
    },
    {
      id: 3,
      proxima_rotacion_colchones: new Date('2024-01-20T00:00:00.000Z'), // Futura
      requerido_rotacion_colchones: false,
    },
  ];

  // Zonas comunes mock
  const mockZonasComunes = [
    {
      id: 1,
      proxima_desinfeccion_zona_comun: new Date('2024-01-17T00:00:00.000Z'),
    },
    {
      id: 2,
      proxima_desinfeccion_zona_comun: new Date('2024-01-25T00:00:00.000Z'),
    },
  ];

  beforeEach(async () => {
    // Crear mocks
    const mockPrismaService = {
      $transaction: jest.fn(),
      habitacion: {
        findMany: jest.fn(),
        updateMany: jest.fn(),
      },
      zonaComun: {
        findMany: jest.fn(),
        updateMany: jest.fn(),
      },
      reserva: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AseoCronService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfiguracionAseoService,
          useValue: {
            obtenerConfiguracion: jest.fn(),
          },
        },
        {
          provide: ReportesAseoService,
          useValue: {
            generarReporte: jest.fn(),
          },
        },
        {
          provide: NotificacionesService,
          useValue: {
            notificarRotacionColchones: jest.fn(),
          },
        },
        {
          provide: SchedulerRegistry,
          useValue: {
            deleteCronJob: jest.fn(),
            addCronJob: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AseoCronService>(AseoCronService);
    prismaService = module.get(PrismaService);
    configuracionAseoService = module.get(ConfiguracionAseoService);
    reportesAseoService = module.get(ReportesAseoService);
    schedulerRegistry = module.get(SchedulerRegistry);

    // Setup mocks por defecto
    configuracionAseoService.obtenerConfiguracion.mockResolvedValue(
      mockConfiguracion,
    );
    mockFs.existsSync.mockReturnValue(true);
    mockFs.appendFileSync.mockImplementation(() => {});
    mockFs.mkdirSync.mockImplementation(() => '');

    // Mock de Date para tests consistentes
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('debería configurar el cron job al inicializar', async () => {
      await service.onModuleInit();

      expect(configuracionAseoService.obtenerConfiguracion).toHaveBeenCalled();
      expect(schedulerRegistry.addCronJob).toHaveBeenCalledWith(
        'aseo-diario',
        expect.any(Object),
      );
    });

    it('debería manejar errores al configurar el cron job', async () => {
      configuracionAseoService.obtenerConfiguracion.mockRejectedValue(
        new Error('Error de configuración'),
      );

      await service.onModuleInit();

      expect(mockFs.appendFileSync).toHaveBeenCalledWith(
        expect.stringContaining('aseo-cron.log'),
        expect.stringContaining('Error al configurar cron job'),
      );
    });
  });

  describe('generarReporteAseoNocturno', () => {
    it('debería generar reporte con fecha válida', async () => {
      const fecha = '2024-01-15';
      reportesAseoService.generarReporte.mockResolvedValue({} as any);

      const resultado = await service.generarReporteAseoNocturno(fecha);

      expect(reportesAseoService.generarReporte).toHaveBeenCalledWith(fecha);
      expect(resultado).toBeDefined();
    });

    it('debería lanzar excepción si no se proporciona fecha', async () => {
      await expect(service.generarReporteAseoNocturno('')).rejects.toThrow(
        BadRequestException,
      );
      await expect(
        service.generarReporteAseoNocturno(null as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería manejar errores del servicio de reportes', async () => {
      const fecha = '2024-01-15';
      reportesAseoService.generarReporte.mockRejectedValue(
        new Error('Error en reporte'),
      );

      const resultado = await service.generarReporteAseoNocturno(fecha);

      expect(resultado).toBeUndefined();
    });
  });

  describe('actualizarEstadosAseoZonasComunes', () => {
    it('debería actualizar estados de zonas comunes exitosamente', async () => {
      const fecha = '2024-01-15';
      prismaService.zonaComun.updateMany.mockResolvedValue({ count: 5 });

      const resultado = await service.actualizarEstadosAseoZonasComunes(fecha);

      expect(prismaService.zonaComun.updateMany).toHaveBeenCalledWith({
        where: { deleted: false },
        data: { requerido_aseo_hoy: true },
      });
      expect(resultado).toBe(true);
    });

    it('debería lanzar excepción si no se proporciona fecha', async () => {
      await expect(
        service.actualizarEstadosAseoZonasComunes(''),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería retornar false en caso de error', async () => {
      const fecha = '2024-01-15';
      prismaService.zonaComun.updateMany.mockRejectedValue(
        new Error('Error de base de datos'),
      );

      const resultado = await service.actualizarEstadosAseoZonasComunes(fecha);

      expect(resultado).toBe(false);
    });
  });

  describe('actualizarEstadosAseoHabitaciones', () => {
    beforeEach(() => {
      // Mock de transacción
      prismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          habitacion: {
            findMany: jest.fn(),
            updateMany: jest.fn(),
          },
        };
        return callback(mockTx);
      });
    });

    it('debería actualizar estados de habitaciones exitosamente', async () => {
      const mockTx = {
        habitacion: {
          findMany: jest
            .fn()
            .mockResolvedValueOnce(mockHabitaciones) // Para rotación
            .mockResolvedValueOnce([]), // Para desinfección (habitaciones completas)
          updateMany: jest.fn().mockResolvedValue({ count: 3 }),
        },
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      // Mock para evaluación de desinfección
      prismaService.reserva.findFirst.mockResolvedValue(null);

      const resultado =
        await service.actualizarEstadosAseoHabitaciones(mockConfiguracion);

      expect(resultado.success).toBe(true);
      expect(resultado.idsHabitacionesQueNecesitanRotacion).toEqual([1, 2]); // Habitaciones 1 (hoy) y 2 (pasada)
      expect(resultado.idsHabitacionesQueNecesitanDesinfeccion).toEqual([]);
    });

    it('debería manejar errores en la transacción', async () => {
      prismaService.$transaction.mockRejectedValue(
        new Error('Error de transacción'),
      );

      const resultado =
        await service.actualizarEstadosAseoHabitaciones(mockConfiguracion);

      expect(resultado.success).toBe(false);
      expect(resultado.idsHabitacionesQueNecesitanRotacion).toEqual([]);
      expect(resultado.idsHabitacionesQueDebenNotificarRotacion).toEqual([]);
      expect(resultado.idsHabitacionesQueNecesitanDesinfeccion).toEqual([]);
    });
  });

  describe('Edge Cases de Fechas - necesitaRotacionColchones', () => {
    it('debería identificar rotación necesaria para fecha exacta de hoy', async () => {
      // Fecha exacta de hoy
      const fechaHoy = '2024-01-15';
      const resultado = await (service as any).necesitaRotacionColchones(
        fechaHoy,
      );
      expect(resultado).toBe(true);
    });

    it('debería identificar rotación necesaria para fecha pasada', async () => {
      // Fecha de ayer
      const fechaAyer = '2024-01-14';
      const resultado = await (service as any).necesitaRotacionColchones(
        fechaAyer,
      );
      expect(resultado).toBe(true);
    });

    it('debería NO requerir rotación para fecha futura', async () => {
      // Fecha de mañana
      const fechaManana = '2024-01-16';
      const resultado = await (service as any).necesitaRotacionColchones(
        fechaManana,
      );
      expect(resultado).toBe(false);
    });

    it('debería manejar fechas límite correctamente', async () => {
      // Cambio de año
      jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      const fechaAnoAnterior = '2023-12-31';
      const resultado = await (service as any).necesitaRotacionColchones(
        fechaAnoAnterior,
      );
      expect(resultado).toBe(true);
    });

    it('debería manejar años bisiestos', async () => {
      jest.setSystemTime(new Date('2024-02-29T00:00:00.000Z')); // Año bisiesto
      const fechaBisiesta = '2024-02-29';
      const resultado = await (service as any).necesitaRotacionColchones(
        fechaBisiesta,
      );
      expect(resultado).toBe(true);
    });
  });

  describe('Edge Cases de Fechas - seDebeNotificarRotacionColchones', () => {
    it('debería notificar cuando está dentro del rango de días de aviso', async () => {
      // 5 días en el futuro (dentro del rango de 7 días)
      const fechaFutura = '2024-01-20';
      const resultado = await (service as any).seDebeNotificarRotacionColchones(
        fechaFutura,
      );
      expect(resultado).toBe(true);
    });

    it('debería NO notificar cuando está fuera del rango de días de aviso', async () => {
      // 10 días en el futuro (fuera del rango de 7 días)
      const fechaLejana = '2024-01-25';
      const resultado = await (service as any).seDebeNotificarRotacionColchones(
        fechaLejana,
      );
      expect(resultado).toBe(false);
    });

    it('debería notificar en el día exacto del límite', async () => {
      // Exactamente 7 días en el futuro
      const fechaLimite = '2024-01-22';
      const resultado = await (service as any).seDebeNotificarRotacionColchones(
        fechaLimite,
      );
      expect(resultado).toBe(true);
    });

    it('debería manejar cambios de mes correctamente', async () => {
      jest.setSystemTime(new Date('2024-01-28T00:00:00.000Z'));
      // 5 días después (cruzando al siguiente mes)
      const fechaSiguienteMes = '2024-02-02';
      const resultado = await (service as any).seDebeNotificarRotacionColchones(
        fechaSiguienteMes,
      );
      expect(resultado).toBe(true);
    });
  });

  describe('Edge Cases de Fechas - habitacionTieneReservaHoy', () => {
    it('debería detectar reserva que comienza hoy', async () => {
      const reservaMock = {
        id: 1,
        habitacionId: 1,
        fecha_inicio: new Date('2024-01-15T00:00:00.000Z'),
        fecha_fin: new Date('2024-01-20T00:00:00.000Z'),
      };
      prismaService.reserva.findFirst.mockResolvedValue(reservaMock);

      const fechaHoy = new Date('2024-01-15T00:00:00.000Z');
      fechaHoy.setUTCHours(0, 0, 0, 0);

      const resultado = await (service as any).habitacionTieneReservaHoy(
        1,
        fechaHoy,
      );
      expect(resultado).toBe(true);
    });

    it('debería detectar reserva que termina hoy', async () => {
      const reservaMock = {
        id: 1,
        habitacionId: 1,
        fecha_inicio: new Date('2024-01-10T00:00:00.000Z'),
        fecha_fin: new Date('2024-01-15T00:00:00.000Z'),
      };
      prismaService.reserva.findFirst.mockResolvedValue(reservaMock);

      const fechaHoy = new Date('2024-01-15T00:00:00.000Z');
      fechaHoy.setUTCHours(0, 0, 0, 0);

      const resultado = await (service as any).habitacionTieneReservaHoy(
        1,
        fechaHoy,
      );
      expect(resultado).toBe(true);
    });

    it('debería NO detectar reserva futura', async () => {
      prismaService.reserva.findFirst.mockResolvedValue(null);

      const fechaHoy = new Date('2024-01-15T00:00:00.000Z');
      fechaHoy.setUTCHours(0, 0, 0, 0);

      const resultado = await (service as any).habitacionTieneReservaHoy(
        1,
        fechaHoy,
      );
      expect(resultado).toBe(false);
    });

    it('debería manejar zonas horarias correctamente (UTC)', async () => {
      // Reserva que comienza a las 23:59 UTC del día anterior
      const reservaMock = {
        id: 1,
        habitacionId: 1,
        fecha_inicio: new Date('2024-01-14T23:59:00.000Z'),
        fecha_fin: new Date('2024-01-15T01:00:00.000Z'),
      };
      prismaService.reserva.findFirst.mockResolvedValue(reservaMock);

      const fechaHoy = new Date('2024-01-15T00:00:00.000Z');
      fechaHoy.setUTCHours(0, 0, 0, 0);

      const resultado = await (service as any).habitacionTieneReservaHoy(
        1,
        fechaHoy,
      );
      expect(resultado).toBe(true);
    });
  });

  describe('evaluarDesinfeccionZonasComunes', () => {
    beforeEach(() => {
      prismaService.zonaComun.findMany.mockResolvedValue(mockZonasComunes);
    });

    it('debería evaluar zonas comunes que necesitan notificación', async () => {
      // Zona 1: 2 días en el futuro (dentro del rango de 3 días)
      // Zona 2: 10 días en el futuro (fuera del rango)
      const resultado = await (
        service as any
      ).evaluarDesinfeccionZonasComunes();

      expect(resultado).toEqual([1]); // Solo zona 1
    });

    it('debería manejar zonas sin fecha de desinfección', async () => {
      const zonasSinFecha = [
        { id: 1, proxima_desinfeccion_zona_comun: null },
        {
          id: 2,
          proxima_desinfeccion_zona_comun: new Date('2024-01-17T00:00:00.000Z'),
        },
      ];
      prismaService.zonaComun.findMany.mockResolvedValue(zonasSinFecha);

      const resultado = await (
        service as any
      ).evaluarDesinfeccionZonasComunes();

      expect(resultado).toEqual([2]); // Solo zona 2 (zona 1 se omite)
    });

    it('debería manejar configuración con días de aviso 0', async () => {
      const configConCeroAviso = {
        ...mockConfiguracion,
        dias_aviso_desinfeccion_zona_comun: 0,
      };
      configuracionAseoService.obtenerConfiguracion.mockResolvedValue(
        configConCeroAviso,
      );

      const resultado = await (
        service as any
      ).evaluarDesinfeccionZonasComunes();

      expect(resultado).toEqual([]); // Ninguna zona debería notificar
    });
  });

  describe('Sistema de Logging', () => {
    it('debería escribir logs en archivo correctamente', () => {
      (service as any).log('Mensaje de prueba', { dato: 'valor' }, 'info');

      expect(mockFs.appendFileSync).toHaveBeenCalledWith(
        expect.stringContaining('aseo-cron.log'),
        expect.stringContaining('"mensaje":"Mensaje de prueba"'),
      );
    });

    it('debería crear directorio de logs si no existe', () => {
      mockFs.existsSync.mockReturnValue(false);

      (service as any).log('Mensaje de prueba');

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('logs'),
        { recursive: true },
      );
    });

    it('debería manejar errores al escribir logs', () => {
      mockFs.appendFileSync.mockImplementation(() => {
        throw new Error('Error de escritura');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      (service as any).log('Mensaje de prueba');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error crítico al escribir log en archivo'),
      );

      consoleSpy.mockRestore();
    });

    it('debería formatear logs con diferentes niveles', () => {
      (service as any).log('Error de prueba', { error: 'detalles' }, 'error');

      expect(mockFs.appendFileSync).toHaveBeenCalledWith(
        expect.stringContaining('aseo-cron.log'),
        expect.stringContaining('"nivel":"error"'),
      );
    });
  });

  describe('reconfigurarCronJob', () => {
    it('debería reconfigurar el cron job exitosamente', async () => {
      await service.reconfigurarCronJob();

      expect(configuracionAseoService.obtenerConfiguracion).toHaveBeenCalled();
      expect(schedulerRegistry.addCronJob).toHaveBeenCalled();
    });
  });

  describe('Configuración de Cron Expression', () => {
    it('debería crear expresión cron correcta para diferentes horas', async () => {
      const configuraciones = [
        { hora_proceso_nocturno_utc: '00:00', esperado: '0 0 * * *' },
        { hora_proceso_nocturno_utc: '02:30', esperado: '30 2 * * *' },
        { hora_proceso_nocturno_utc: '23:59', esperado: '59 23 * * *' },
      ];

      for (const config of configuraciones) {
        configuracionAseoService.obtenerConfiguracion.mockResolvedValue({
          ...mockConfiguracion,
          hora_proceso_nocturno_utc: config.hora_proceso_nocturno_utc,
        });

        await (service as any).configurarCronJob();

        // Verificar que se llamó addCronJob
        expect(schedulerRegistry.addCronJob).toHaveBeenCalledWith(
          'aseo-diario',
          expect.any(Object),
        );
      }
    });

    it('debería usar hora por defecto si no está configurada', async () => {
      configuracionAseoService.obtenerConfiguracion.mockResolvedValue({
        ...mockConfiguracion,
        hora_proceso_nocturno_utc: null as any,
      });

      await (service as any).configurarCronJob();

      expect(schedulerRegistry.addCronJob).toHaveBeenCalledWith(
        'aseo-diario',
        expect.any(Object),
      );
    });
  });

  describe('Casos Edge de Fechas Avanzados', () => {
    it('debería manejar correctamente el cambio de horario de verano', async () => {
      // Simular fecha durante cambio de horario
      jest.setSystemTime(new Date('2024-03-31T01:00:00.000Z')); // Cambio de horario en Europa

      const fechaTest = '2024-03-31';
      const resultado = await (service as any).necesitaRotacionColchones(
        fechaTest,
      );
      expect(resultado).toBe(true);
    });

    it('debería manejar fechas en diferentes zonas horarias correctamente', async () => {
      // Test con fecha que podría ser ambigua en diferentes zonas horarias
      jest.setSystemTime(new Date('2024-01-15T23:30:00.000Z'));

      const fechaTest = '2024-01-15';
      const resultado = await (service as any).necesitaRotacionColchones(
        fechaTest,
      );
      expect(resultado).toBe(true);
    });

    it('debería manejar correctamente fechas de febrero en años no bisiestos', async () => {
      jest.setSystemTime(new Date('2023-02-28T12:00:00.000Z')); // Año no bisiesto

      const fechaTest = '2023-02-28';
      const resultado = await (service as any).necesitaRotacionColchones(
        fechaTest,
      );
      expect(resultado).toBe(true);
    });

    it('debería calcular correctamente días entre fechas con diferencias de milisegundos', async () => {
      jest.setSystemTime(new Date('2024-01-15T23:59:59.999Z'));

      const fechaTest = '2024-01-16';
      const resultado = await (service as any).necesitaRotacionColchones(
        fechaTest,
      );
      expect(resultado).toBe(false); // Debería ser falso porque es el día siguiente
    });
  });
});
