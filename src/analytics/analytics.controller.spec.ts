import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { BlacklistService } from 'src/auth/blacklist.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import { TiposHabitacion, MotivosViajes } from '@prisma/client';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let analyticsService: AnalyticsService;

  // Mock del AnalyticsService
  const mockAnalyticsService = {
    calcularOcupacion: jest.fn(),
    analizarDemografia: jest.fn(),
    analizarProcedencia: jest.fn(),
    analizarRendimientoHabitaciones: jest.fn(),
    analizarMotivosViaje: jest.fn(),
    predecirOcupacion: jest.fn(),
    generarDashboard: jest.fn(),
  };

  // Mocks de dependencias para AuthGuard
  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockBlacklistService = {
    isTokenBlacklisted: jest.fn(),
  };

  const mockPrismaService = {
    usuario: {
      findFirst: jest.fn(),
    },
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: BlacklistService,
          useValue: mockBlacklistService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición del controller', () => {
    it('debería estar definido', () => {
      expect(controller).toBeDefined();
    });

    it('debería tener el servicio inyectado', () => {
      expect(analyticsService).toBeDefined();
    });
  });

  describe('obtenerAnaliticsOcupacion', () => {
    it('debería obtener análisis de ocupación exitosamente', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
        agruparPor: 'mes' as const,
      };

      const respuestaEsperada = {
        ocupacionPorPeriodo: [
          {
            periodo: '2024-01',
            tasaOcupacion: 75.5,
            revpar: 45000,
            adr: 60000,
            totalReservas: 25,
            ingresosTotales: 1125000,
          },
        ],
        ocupacionPromedio: 75.5,
        revparPromedio: 45000,
        adrPromedio: 60000,
      };

      mockAnalyticsService.calcularOcupacion.mockResolvedValue(
        respuestaEsperada,
      );

      // Act
      const resultado = await controller.obtenerAnaliticsOcupacion(filtros);

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(analyticsService.calcularOcupacion).toHaveBeenCalledTimes(1);
      expect(analyticsService.calcularOcupacion).toHaveBeenCalledWith(filtros);
    });

    it('debería manejar filtros opcionales correctamente', async () => {
      // Arrange
      const filtros = {
        tipoHabitacion: TiposHabitacion.SENCILLA,
      };

      const respuestaEsperada = {
        ocupacionPorPeriodo: [],
        ocupacionPromedio: 0,
        revparPromedio: 0,
        adrPromedio: 0,
      };

      mockAnalyticsService.calcularOcupacion.mockResolvedValue(
        respuestaEsperada,
      );

      // Act
      const resultado = await controller.obtenerAnaliticsOcupacion(filtros);

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(analyticsService.calcularOcupacion).toHaveBeenCalledWith(filtros);
    });

    it('debería propagar errores del servicio', async () => {
      // Arrange
      const filtros = { fechaInicio: '2024-01-01' };
      const errorEsperado = new Error('Error al calcular ocupación');
      mockAnalyticsService.calcularOcupacion.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(
        controller.obtenerAnaliticsOcupacion(filtros),
      ).rejects.toThrow('Error al calcular ocupación');
      expect(analyticsService.calcularOcupacion).toHaveBeenCalledWith(filtros);
    });
  });

  describe('obtenerDemografiaHuespedes', () => {
    it('debería obtener demografía de huéspedes exitosamente', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
        nacionalidades: ['Colombia', 'Venezuela'],
      };

      const respuestaEsperada = [
        {
          nacionalidad: 'Colombia',
          cantidad: 45,
          porcentaje: 60.0,
          ingresos: 2700000,
        },
        {
          nacionalidad: 'Venezuela',
          cantidad: 30,
          porcentaje: 40.0,
          ingresos: 1800000,
        },
      ];

      mockAnalyticsService.analizarDemografia.mockResolvedValue(
        respuestaEsperada,
      );

      // Act
      const resultado = await controller.obtenerDemografiaHuespedes(filtros);

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(analyticsService.analizarDemografia).toHaveBeenCalledTimes(1);
      expect(analyticsService.analizarDemografia).toHaveBeenCalledWith(filtros);
    });

    it('debería manejar filtros vacíos', async () => {
      // Arrange
      const filtros = {};
      const respuestaEsperada = [];

      mockAnalyticsService.analizarDemografia.mockResolvedValue(
        respuestaEsperada,
      );

      // Act
      const resultado = await controller.obtenerDemografiaHuespedes(filtros);

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(analyticsService.analizarDemografia).toHaveBeenCalledWith(filtros);
    });
  });

  describe('obtenerProcedenciaHuespedes', () => {
    it('debería obtener procedencia de huéspedes exitosamente', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
      };

      const respuestaEsperada = [
        {
          paisProcedencia: 'Colombia',
          ciudadProcedencia: 'Bogotá',
          cantidad: 28,
          porcentaje: 50.0,
        },
        {
          paisProcedencia: 'Venezuela',
          ciudadProcedencia: 'Caracas',
          cantidad: 28,
          porcentaje: 50.0,
        },
      ];

      mockAnalyticsService.analizarProcedencia.mockResolvedValue(
        respuestaEsperada,
      );

      // Act
      const resultado = await controller.obtenerProcedenciaHuespedes(filtros);

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(analyticsService.analizarProcedencia).toHaveBeenCalledTimes(1);
      expect(analyticsService.analizarProcedencia).toHaveBeenCalledWith(
        filtros,
      );
    });
  });

  describe('obtenerRendimientoHabitaciones', () => {
    it('debería obtener rendimiento de habitaciones exitosamente', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
        tipoHabitacion: TiposHabitacion.SENCILLA,
      };

      const respuestaEsperada = [
        {
          tipo: TiposHabitacion.SENCILLA,
          totalHabitaciones: 15,
          tasaOcupacionPromedio: 68.5,
          ingresosTotales: 8500000,
          precioPromedioNoche: 55000,
          revpar: 37675,
        },
      ];

      mockAnalyticsService.analizarRendimientoHabitaciones.mockResolvedValue(
        respuestaEsperada,
      );

      // Act
      const resultado =
        await controller.obtenerRendimientoHabitaciones(filtros);

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(
        analyticsService.analizarRendimientoHabitaciones,
      ).toHaveBeenCalledTimes(1);
      expect(
        analyticsService.analizarRendimientoHabitaciones,
      ).toHaveBeenCalledWith(filtros);
    });
  });

  describe('obtenerMotivosViaje', () => {
    it('debería obtener motivos de viaje exitosamente', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
        motivoViaje: MotivosViajes.VACACIONES_RECREO_Y_OCIO,
      };

      const respuestaEsperada = [
        {
          motivo: MotivosViajes.VACACIONES_RECREO_Y_OCIO,
          cantidad: 65,
          porcentaje: 42.5,
          duracionPromedioEstancia: 3.2,
        },
        {
          motivo: MotivosViajes.NEGOCIOS_Y_MOTIVOS_PROFESIONALES,
          cantidad: 35,
          porcentaje: 22.9,
          duracionPromedioEstancia: 2.1,
        },
      ];

      mockAnalyticsService.analizarMotivosViaje.mockResolvedValue(
        respuestaEsperada,
      );

      // Act
      const resultado = await controller.obtenerMotivosViaje(filtros);

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(analyticsService.analizarMotivosViaje).toHaveBeenCalledTimes(1);
      expect(analyticsService.analizarMotivosViaje).toHaveBeenCalledWith(
        filtros,
      );
    });
  });

  describe('obtenerForecastOcupacion', () => {
    it('debería obtener predicción de ocupación exitosamente', async () => {
      // Arrange
      const parametros = {
        periodosAdelante: 6,
        tipoPeriodo: 'mes' as const,
        fechaInicio: '2024-01-01',
        fechaFin: '2024-06-30',
      };

      const respuestaEsperada = [
        {
          periodo: '2024-07',
          ocupacionPredicida: 78.2,
          nivelConfianza: 85.5,
          ingresosPredichos: 4250000,
        },
        {
          periodo: '2024-08',
          ocupacionPredicida: 82.1,
          nivelConfianza: 80.5,
          ingresosPredichos: 4450000,
        },
      ];

      mockAnalyticsService.predecirOcupacion.mockResolvedValue(
        respuestaEsperada,
      );

      // Act
      const resultado = await controller.obtenerForecastOcupacion(parametros);

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(analyticsService.predecirOcupacion).toHaveBeenCalledTimes(1);
      expect(analyticsService.predecirOcupacion).toHaveBeenCalledWith(
        parametros,
      );
    });

    it('debería validar parámetros requeridos', async () => {
      // Arrange
      const parametros = {
        periodosAdelante: 3,
        tipoPeriodo: 'semana' as const,
      };

      const respuestaEsperada = [
        {
          periodo: '2024-07',
          ocupacionPredicida: 75.0,
          nivelConfianza: 90.0,
          ingresosPredichos: 4000000,
        },
      ];

      mockAnalyticsService.predecirOcupacion.mockResolvedValue(
        respuestaEsperada,
      );

      // Act
      const resultado = await controller.obtenerForecastOcupacion(parametros);

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(analyticsService.predecirOcupacion).toHaveBeenCalledWith(
        parametros,
      );
    });
  });

  describe('obtenerDashboardEjecutivo', () => {
    it('debería obtener dashboard ejecutivo exitosamente', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-06-30',
        incluirComparacion: true,
        topMercados: 5,
      };

      const respuestaEsperada = {
        ocupacionActual: 75.8,
        revparActual: 45000,
        adrActual: 59400,
        ingresosPeriodo: 12500000,
        topMercadosEmisores: [
          {
            nacionalidad: 'Colombia',
            cantidad: 45,
            porcentaje: 32.1,
            ingresos: 2700000,
          },
        ],
        distribucionMotivosViaje: [
          {
            motivo: MotivosViajes.VACACIONES_RECREO_Y_OCIO,
            cantidad: 65,
            porcentaje: 42.5,
            duracionPromedioEstancia: 3.2,
          },
        ],
        rendimientoHabitaciones: [
          {
            tipo: TiposHabitacion.SENCILLA,
            totalHabitaciones: 15,
            tasaOcupacionPromedio: 68.5,
            ingresosTotales: 8500000,
            precioPromedioNoche: 55000,
            revpar: 37675,
          },
        ],
        tasaHuespedesRecurrentes: 18.5,
        comparacionPeriodoAnterior: {
          ocupacionAnterior: 70.0,
          revparAnterior: 42000,
          adrAnterior: 58000,
          ingresosAnteriores: 11000000,
          cambioOcupacion: 8.29,
          cambioRevpar: 7.14,
          cambioAdr: 2.41,
          cambioIngresos: 13.64,
        },
      };

      mockAnalyticsService.generarDashboard.mockResolvedValue(
        respuestaEsperada,
      );

      // Act
      const resultado = await controller.obtenerDashboardEjecutivo(filtros);

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(analyticsService.generarDashboard).toHaveBeenCalledTimes(1);
      expect(analyticsService.generarDashboard).toHaveBeenCalledWith(filtros);
    });

    it('debería manejar dashboard sin comparación', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-06-30',
        incluirComparacion: false,
      };

      const respuestaEsperada = {
        ocupacionActual: 75.8,
        revparActual: 45000,
        adrActual: 59400,
        ingresosPeriodo: 12500000,
        topMercadosEmisores: [],
        distribucionMotivosViaje: [],
        rendimientoHabitaciones: [],
        tasaHuespedesRecurrentes: 18.5,
      };

      mockAnalyticsService.generarDashboard.mockResolvedValue(
        respuestaEsperada,
      );

      // Act
      const resultado = await controller.obtenerDashboardEjecutivo(filtros);

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(analyticsService.generarDashboard).toHaveBeenCalledWith(filtros);
    });
  });

  describe('Manejo de errores genérico', () => {
    it('debería propagar errores de conexión a base de datos', async () => {
      // Arrange
      const filtros = {};
      const errorDB = new Error('Error de conexión a base de datos');

      // Probar con diferentes métodos
      const metodos = [
        'calcularOcupacion',
        'analizarDemografia',
        'analizarProcedencia',
        'analizarRendimientoHabitaciones',
        'analizarMotivosViaje',
        'generarDashboard',
      ];

      for (const metodo of metodos) {
        mockAnalyticsService[metodo].mockRejectedValue(errorDB);

        // Act & Assert
        const metodosController = {
          calcularOcupacion: () =>
            controller.obtenerAnaliticsOcupacion(filtros),
          analizarDemografia: () =>
            controller.obtenerDemografiaHuespedes(filtros),
          analizarProcedencia: () =>
            controller.obtenerProcedenciaHuespedes(filtros),
          analizarRendimientoHabitaciones: () =>
            controller.obtenerRendimientoHabitaciones(filtros),
          analizarMotivosViaje: () => controller.obtenerMotivosViaje(filtros),
          generarDashboard: () => controller.obtenerDashboardEjecutivo(filtros),
        };

        await expect(metodosController[metodo]()).rejects.toThrow(
          'Error de conexión a base de datos',
        );
      }
    });

    it('debería manejar errores de validación de parámetros', async () => {
      // Arrange
      const parametrosInvalidos = {
        periodosAdelante: 15, // Fuera del rango permitido
        tipoPeriodo: 'año' as any, // Tipo inválido
      };

      const errorValidacion = new Error('Parámetros de predicción inválidos');
      mockAnalyticsService.predecirOcupacion.mockRejectedValue(errorValidacion);

      // Act & Assert
      await expect(
        controller.obtenerForecastOcupacion(parametrosInvalidos),
      ).rejects.toThrow('Parámetros de predicción inválidos');
    });
  });

  describe('Configuración y decoradores', () => {
    it('debería tener la configuración correcta de ruta', () => {
      const metadata = Reflect.getMetadata('path', AnalyticsController);
      expect(metadata).toBe('analytics');
    });

    it('debería requerir autenticación y roles apropiados', () => {
      // Verificar que tiene el decorador @Auth
      const authMetadata = Reflect.getMetadata('roles', AnalyticsController);
      expect(authMetadata).toBeDefined();
    });

    it('debería tener documentación Swagger correcta', () => {
      // Verificar que tiene el decorador @ApiTags
      const tagsMetadata = Reflect.getMetadata(
        'swagger/apiUseTags',
        AnalyticsController,
      );
      expect(tagsMetadata).toBeDefined();
    });
  });

  describe('Casos de borde y validaciones', () => {
    it('debería manejar múltiples llamadas concurrentes', async () => {
      // Arrange
      const filtros = { fechaInicio: '2024-01-01', fechaFin: '2024-12-31' };
      const respuestaBase = {
        ocupacionPorPeriodo: [],
        ocupacionPromedio: 0,
        revparPromedio: 0,
        adrPromedio: 0,
      };

      mockAnalyticsService.calcularOcupacion.mockResolvedValue(respuestaBase);

      // Act
      const promesas = Array(5)
        .fill(null)
        .map(() => controller.obtenerAnaliticsOcupacion(filtros));

      const resultados = await Promise.all(promesas);

      // Assert
      expect(resultados).toHaveLength(5);
      expect(analyticsService.calcularOcupacion).toHaveBeenCalledTimes(5);
      resultados.forEach((resultado) => {
        expect(resultado).toEqual(respuestaBase);
      });
    });

    it('debería mantener la consistencia en las respuestas', async () => {
      // Arrange
      const filtros = { fechaInicio: '2024-01-01' };
      const respuestaConsistente = {
        ocupacionPorPeriodo: [
          {
            periodo: '2024-01',
            tasaOcupacion: 75.5,
            revpar: 45000,
            adr: 60000,
            totalReservas: 25,
            ingresosTotales: 1125000,
          },
        ],
        ocupacionPromedio: 75.5,
        revparPromedio: 45000,
        adrPromedio: 60000,
      };

      mockAnalyticsService.calcularOcupacion.mockResolvedValue(
        respuestaConsistente,
      );

      // Act
      const resultado1 = await controller.obtenerAnaliticsOcupacion(filtros);
      const resultado2 = await controller.obtenerAnaliticsOcupacion(filtros);

      // Assert
      expect(resultado1).toEqual(resultado2);
      expect(resultado1).toEqual(respuestaConsistente);
    });

    it('debería llamar al método del servicio solo una vez por invocación', async () => {
      // Arrange
      const filtros = { fechaInicio: '2024-01-01' };
      const respuesta = { ocupacionActual: 75 };

      mockAnalyticsService.generarDashboard.mockResolvedValue(respuesta);

      // Act
      await controller.obtenerDashboardEjecutivo(filtros);
      await controller.obtenerDashboardEjecutivo(filtros);
      await controller.obtenerDashboardEjecutivo(filtros);

      // Assert
      expect(analyticsService.generarDashboard).toHaveBeenCalledTimes(3);
      expect(analyticsService.generarDashboard).toHaveBeenNthCalledWith(
        1,
        filtros,
      );
      expect(analyticsService.generarDashboard).toHaveBeenNthCalledWith(
        2,
        filtros,
      );
      expect(analyticsService.generarDashboard).toHaveBeenNthCalledWith(
        3,
        filtros,
      );
    });
  });
});
