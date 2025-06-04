import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { TiposHabitacion, MotivosViajes } from '@prisma/client';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prismaService: PrismaService;

  // Mock del PrismaService
  const mockPrismaService = {
    $queryRaw: jest.fn(),
    habitacion: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición del servicio', () => {
    it('debería estar definido', () => {
      expect(service).toBeDefined();
    });

    it('debería tener el servicio de Prisma inyectado', () => {
      expect(prismaService).toBeDefined();
    });
  });

  describe('calcularOcupacion', () => {
    it('debería calcular ocupación por períodos exitosamente', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
        agruparPor: 'mes' as const,
      };

      const datosOcupacionMock = [
        {
          periodo: '2024-01-01T00:00:00.000Z',
          total_reservas: BigInt(25),
          ingresos_totales: 1125000,
          precio_promedio: 45000,
        },
        {
          periodo: '2024-02-01T00:00:00.000Z',
          total_reservas: BigInt(30),
          ingresos_totales: 1350000,
          precio_promedio: 45000,
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(datosOcupacionMock);
      mockPrismaService.habitacion.count.mockResolvedValue(20);

      // Act
      const resultado = await service.calcularOcupacion(filtros);

      // Assert
      expect(resultado).toBeDefined();
      expect(resultado.ocupacionPorPeriodo).toHaveLength(2);
      expect(resultado.ocupacionPorPeriodo[0]).toEqual({
        periodo: '2024-01-01T00:00:00.000Z',
        tasaOcupacion: 125.0, // 25/20 * 100
        revpar: 56250.0, // (125/100) * 45000
        adr: 45000,
        totalReservas: 25,
        ingresosTotales: 1125000,
      });
      expect(resultado.ocupacionPromedio).toBeGreaterThan(0);
      expect(resultado.revparPromedio).toBeGreaterThan(0);
      expect(resultado.adrPromedio).toBe(45000);

      // Verificar que se llamaron las consultas correctas
      expect(prismaService.$queryRaw).toHaveBeenCalledTimes(1);
      expect(prismaService.habitacion.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
        },
      });
    });

    it('debería filtrar por tipo de habitación', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
        tipoHabitacion: TiposHabitacion.SENCILLA,
        agruparPor: 'mes' as const,
      };

      const datosOcupacionMock = [
        {
          periodo: '2024-01-01T00:00:00.000Z',
          total_reservas: BigInt(15),
          ingresos_totales: 675000,
          precio_promedio: 45000,
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(datosOcupacionMock);
      mockPrismaService.habitacion.count.mockResolvedValue(10);

      // Act
      const resultado = await service.calcularOcupacion(filtros);

      // Assert
      expect(resultado).toBeDefined();
      expect(resultado.ocupacionPorPeriodo).toHaveLength(1);
      expect(prismaService.habitacion.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          tipo: TiposHabitacion.SENCILLA,
        },
      });
    });

    it('debería manejar datos vacíos correctamente', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
        agruparPor: 'mes' as const,
      };

      mockPrismaService.$queryRaw.mockResolvedValue([]);
      mockPrismaService.habitacion.count.mockResolvedValue(20);

      // Act
      const resultado = await service.calcularOcupacion(filtros);

      // Assert
      expect(resultado).toBeDefined();
      expect(resultado.ocupacionPorPeriodo).toHaveLength(0);
      expect(resultado.ocupacionPromedio).toBe(0);
      expect(resultado.revparPromedio).toBe(0);
      expect(resultado.adrPromedio).toBe(0);
    });

    it('debería manejar errores en la consulta', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
        agruparPor: 'mes' as const,
      };

      const errorDB = new Error('Error de conexión a la base de datos');
      mockPrismaService.$queryRaw.mockRejectedValue(errorDB);

      // Act & Assert
      await expect(service.calcularOcupacion(filtros)).rejects.toThrow(
        'Error de conexión a la base de datos',
      );
    });
  });

  describe('analizarDemografia', () => {
    it('debería analizar demografía de huéspedes exitosamente', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
        nacionalidades: ['Colombia', 'Venezuela'],
      };

      const demografiaMock = [
        {
          nacionalidad: 'Colombia',
          cantidad: BigInt(45),
          ingresos: 2700000,
        },
        {
          nacionalidad: 'Venezuela',
          cantidad: BigInt(30),
          ingresos: 1800000,
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(demografiaMock);

      // Act
      const resultado = await service.analizarDemografia(filtros);

      // Assert
      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toEqual({
        nacionalidad: 'Colombia',
        cantidad: 45,
        porcentaje: 60.0, // 45/75 * 100
        ingresos: 2700000,
      });
      expect(resultado[1]).toEqual({
        nacionalidad: 'Venezuela',
        cantidad: 30,
        porcentaje: 40.0, // 30/75 * 100
        ingresos: 1800000,
      });
      expect(prismaService.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('debería manejar filtros sin nacionalidades específicas', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
      };

      const demografiaMock = [
        {
          nacionalidad: 'Colombia',
          cantidad: BigInt(50),
          ingresos: 3000000,
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(demografiaMock);

      // Act
      const resultado = await service.analizarDemografia(filtros);

      // Assert
      expect(resultado).toHaveLength(1);
      expect(resultado[0].porcentaje).toBe(100.0);
    });

    it('debería manejar datos vacíos', async () => {
      // Arrange
      const filtros = {};

      mockPrismaService.$queryRaw.mockResolvedValue([]);

      // Act
      const resultado = await service.analizarDemografia(filtros);

      // Assert
      expect(resultado).toHaveLength(0);
    });
  });

  describe('analizarProcedencia', () => {
    it('debería analizar procedencia de huéspedes exitosamente', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
        paisesProcedencia: ['Colombia', 'Venezuela'],
      };

      const procedenciaMock = [
        {
          pais_procedencia: 'Colombia',
          ciudad_procedencia: 'Bogotá',
          cantidad: BigInt(28),
        },
        {
          pais_procedencia: 'Venezuela',
          ciudad_procedencia: 'Caracas',
          cantidad: BigInt(22),
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(procedenciaMock);

      // Act
      const resultado = await service.analizarProcedencia(filtros);

      // Assert
      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toEqual({
        paisProcedencia: 'Colombia',
        ciudadProcedencia: 'Bogotá',
        cantidad: 28,
        porcentaje: 56.0, // 28/50 * 100
      });
      expect(resultado[1]).toEqual({
        paisProcedencia: 'Venezuela',
        ciudadProcedencia: 'Caracas',
        cantidad: 22,
        porcentaje: 44.0, // 22/50 * 100
      });
    });
  });

  describe('analizarRendimientoHabitaciones', () => {
    it('debería analizar rendimiento de habitaciones exitosamente', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
        tipoHabitacion: TiposHabitacion.SENCILLA,
      };

      const rendimientoMock = [
        {
          tipo: 'SENCILLA',
          total_habitaciones: BigInt(15),
          total_reservas: BigInt(100),
          ingresos_totales: 4500000,
          precio_promedio: 45000,
        },
        {
          tipo: 'DOBLE',
          total_habitaciones: BigInt(10),
          total_reservas: BigInt(80),
          ingresos_totales: 5600000,
          precio_promedio: 70000,
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(rendimientoMock);

      // Act
      const resultado = await service.analizarRendimientoHabitaciones(filtros);

      // Assert
      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toEqual({
        tipo: 'SENCILLA',
        totalHabitaciones: 15,
        tasaOcupacionPromedio: 666.67, // (100/15) * 100
        ingresosTotales: 4500000,
        precioPromedioNoche: 45000,
        revpar: 300000, // (666.67/100) * 45000 redondeado
      });
    });

    it('debería manejar habitaciones sin reservas', async () => {
      // Arrange
      const filtros = {};

      const rendimientoMock = [
        {
          tipo: 'SENCILLA',
          total_habitaciones: BigInt(15),
          total_reservas: BigInt(0),
          ingresos_totales: 0,
          precio_promedio: 45000,
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(rendimientoMock);

      // Act
      const resultado = await service.analizarRendimientoHabitaciones(filtros);

      // Assert
      expect(resultado).toHaveLength(1);
      expect(resultado[0].tasaOcupacionPromedio).toBe(0);
      expect(resultado[0].revpar).toBe(0);
    });
  });

  describe('analizarMotivosViaje', () => {
    it('debería analizar motivos de viaje exitosamente', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-12-31',
        motivoViaje: MotivosViajes.VACACIONES_RECREO_Y_OCIO,
      };

      const motivosMock = [
        {
          motivo_viaje: 'VACACIONES_RECREO_Y_OCIO',
          cantidad: BigInt(65),
          duracion_promedio: 3.2,
        },
        {
          motivo_viaje: 'NEGOCIOS_Y_MOTIVOS_PROFESIONALES',
          cantidad: BigInt(35),
          duracion_promedio: 2.1,
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(motivosMock);

      // Act
      const resultado = await service.analizarMotivosViaje(filtros);

      // Assert
      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toEqual({
        motivo: 'VACACIONES_RECREO_Y_OCIO',
        cantidad: 65,
        porcentaje: 65.0, // 65/100 * 100
        duracionPromedioEstancia: 3.2,
      });
      expect(resultado[1]).toEqual({
        motivo: 'NEGOCIOS_Y_MOTIVOS_PROFESIONALES',
        cantidad: 35,
        porcentaje: 35.0, // 35/100 * 100
        duracionPromedioEstancia: 2.1,
      });
    });

    it('debería manejar duraciones null', async () => {
      // Arrange
      const filtros = {};

      const motivosMock = [
        {
          motivo_viaje: 'VACACIONES_RECREO_Y_OCIO',
          cantidad: BigInt(50),
          duracion_promedio: null,
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(motivosMock);

      // Act
      const resultado = await service.analizarMotivosViaje(filtros);

      // Assert
      expect(resultado).toHaveLength(1);
      expect(resultado[0].duracionPromedioEstancia).toBe(0);
    });
  });

  describe('predecirOcupacion', () => {
    it('debería generar predicciones de ocupación exitosamente', async () => {
      // Arrange
      const parametros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-06-30',
        periodosAdelante: 3,
        tipoPeriodo: 'mes' as const,
      };

      const datosHistoricosMock = [
        {
          periodo: '2024-01-01T00:00:00.000Z',
          ocupacion_promedio: 75.0,
          ingresos_promedio: 50000,
        },
        {
          periodo: '2024-02-01T00:00:00.000Z',
          ocupacion_promedio: 80.0,
          ingresos_promedio: 55000,
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(datosHistoricosMock);

      // Act
      const resultado = await service.predecirOcupacion(parametros);

      // Assert
      expect(resultado).toHaveLength(3);
      expect(resultado[0]).toHaveProperty('periodo');
      expect(resultado[0]).toHaveProperty('ocupacionPredicida');
      expect(resultado[0]).toHaveProperty('nivelConfianza');
      expect(resultado[0]).toHaveProperty('ingresosPredichos');
      expect(resultado[0].nivelConfianza).toBe(90); // 95 - 1*5
      expect(resultado[1].nivelConfianza).toBe(85); // 95 - 2*5
      expect(resultado[2].nivelConfianza).toBe(80); // 95 - 3*5
    });

    it('debería generar predicciones semanales', async () => {
      // Arrange
      const parametros = {
        periodosAdelante: 2,
        tipoPeriodo: 'semana' as const,
      };

      const datosHistoricosMock = [
        {
          periodo: '2024-01-01T00:00:00.000Z',
          ocupacion_promedio: 70.0,
          ingresos_promedio: 45000,
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(datosHistoricosMock);

      // Act
      const resultado = await service.predecirOcupacion(parametros);

      // Assert
      expect(resultado).toHaveLength(2);
      expect(resultado[0].periodo).toMatch(/202[45]-\d{2}/); // Permitir 2024 o 2025
    });

    it('debería manejar datos históricos vacíos', async () => {
      // Arrange
      const parametros = {
        periodosAdelante: 1,
        tipoPeriodo: 'mes' as const,
      };

      mockPrismaService.$queryRaw.mockResolvedValue([]);

      // Act
      const resultado = await service.predecirOcupacion(parametros);

      // Assert
      expect(resultado).toHaveLength(1);
      expect(resultado[0].ocupacionPredicida).toBe(0); // Sin datos históricos
      expect(resultado[0].ingresosPredichos).toBe(0);
    });
  });

  describe('generarDashboard', () => {
    it('debería generar dashboard ejecutivo completo', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-06-30',
        incluirComparacion: false,
        topMercados: 5,
      };

      // Mock de todos los métodos del servicio
      const ocupacionMock = {
        ocupacionPorPeriodo: [
          {
            periodo: '2024-01',
            tasaOcupacion: 75.8,
            revpar: 45000,
            adr: 59400,
            totalReservas: 100,
            ingresosTotales: 5940000,
          },
        ],
        ocupacionPromedio: 75.8,
        revparPromedio: 45000,
        adrPromedio: 59400,
      };

      const demografiaMock = [
        {
          nacionalidad: 'Colombia',
          cantidad: 45,
          porcentaje: 32.1,
          ingresos: 2700000,
        },
      ];

      const motivosMock = [
        {
          motivo: MotivosViajes.VACACIONES_RECREO_Y_OCIO,
          cantidad: 65,
          porcentaje: 42.5,
          duracionPromedioEstancia: 3.2,
        },
      ];

      const rendimientoMock = [
        {
          tipo: TiposHabitacion.SENCILLA,
          totalHabitaciones: 15,
          tasaOcupacionPromedio: 68.5,
          ingresosTotales: 8500000,
          precioPromedioNoche: 55000,
          revpar: 37675,
        },
      ];

      // Mock de huéspedes recurrentes
      const huespedesRecurrentesMock = [
        {
          total_huespedes: BigInt(100),
          huespedes_recurrentes: BigInt(18),
        },
      ];

      // Configurar spies para llamar a los métodos reales pero con datos mock
      jest.spyOn(service, 'calcularOcupacion').mockResolvedValue(ocupacionMock);
      jest
        .spyOn(service, 'analizarDemografia')
        .mockResolvedValue(demografiaMock);
      jest
        .spyOn(service, 'analizarMotivosViaje')
        .mockResolvedValue(motivosMock);
      jest
        .spyOn(service, 'analizarRendimientoHabitaciones')
        .mockResolvedValue(rendimientoMock);

      // Mock para huéspedes recurrentes
      mockPrismaService.$queryRaw.mockResolvedValue(huespedesRecurrentesMock);

      // Act
      const resultado = await service.generarDashboard(filtros);

      // Assert
      expect(resultado).toBeDefined();
      expect(resultado.ocupacionActual).toBe(75.8);
      expect(resultado.revparActual).toBe(45000);
      expect(resultado.adrActual).toBe(59400);
      expect(resultado.ingresosPeriodo).toBe(5940000);
      expect(resultado.topMercadosEmisores).toEqual(demografiaMock);
      expect(resultado.distribucionMotivosViaje).toEqual(motivosMock);
      expect(resultado.rendimientoHabitaciones).toEqual(rendimientoMock);
      expect(resultado.tasaHuespedesRecurrentes).toBe(18.0); // 18/100 * 100
      expect(resultado.comparacionPeriodoAnterior).toBeUndefined();

      // Verificar que se llamaron todos los métodos necesarios
      expect(service.calcularOcupacion).toHaveBeenCalledWith({
        fechaInicio: '2024-01-01',
        fechaFin: '2024-06-30',
      });
      expect(service.analizarDemografia).toHaveBeenCalledWith({
        fechaInicio: '2024-01-01',
        fechaFin: '2024-06-30',
      });
    });

    it('debería incluir comparación con período anterior', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-06-30',
        incluirComparacion: true,
        topMercados: 3,
      };

      const ocupacionActualMock = {
        ocupacionPorPeriodo: [
          {
            periodo: '2024-01',
            tasaOcupacion: 75.8,
            revpar: 45000,
            adr: 59400,
            totalReservas: 100,
            ingresosTotales: 5940000,
          },
        ],
        ocupacionPromedio: 75.8,
        revparPromedio: 45000,
        adrPromedio: 59400,
      };

      const ocupacionAnteriorMock = {
        ocupacionPorPeriodo: [
          {
            periodo: '2023-07',
            tasaOcupacion: 70.0,
            revpar: 42000,
            adr: 58000,
            totalReservas: 90,
            ingresosTotales: 5220000,
          },
        ],
        ocupacionPromedio: 70.0,
        revparPromedio: 42000,
        adrPromedio: 58000,
      };

      // Mock de calcularOcupacion para diferentes llamadas
      jest
        .spyOn(service, 'calcularOcupacion')
        .mockResolvedValueOnce(ocupacionActualMock) // Primera llamada (período actual)
        .mockResolvedValueOnce(ocupacionAnteriorMock); // Segunda llamada (período anterior)

      jest.spyOn(service, 'analizarDemografia').mockResolvedValue([]);
      jest.spyOn(service, 'analizarMotivosViaje').mockResolvedValue([]);
      jest
        .spyOn(service, 'analizarRendimientoHabitaciones')
        .mockResolvedValue([]);

      mockPrismaService.$queryRaw.mockResolvedValue([
        { total_huespedes: BigInt(100), huespedes_recurrentes: BigInt(20) },
      ]);

      // Act
      const resultado = await service.generarDashboard(filtros);

      // Assert
      expect(resultado.comparacionPeriodoAnterior).toBeDefined();
      expect(resultado.comparacionPeriodoAnterior.ocupacionAnterior).toBe(70.0);
      expect(resultado.comparacionPeriodoAnterior.cambioOcupacion).toBe(8.29); // ((75.8-70)/70)*100
      expect(resultado.comparacionPeriodoAnterior.cambioRevpar).toBe(7.14); // ((45000-42000)/42000)*100
      expect(resultado.comparacionPeriodoAnterior.cambioAdr).toBe(2.41); // ((59400-58000)/58000)*100

      // Verificar que calcularOcupacion se llamó dos veces
      expect(service.calcularOcupacion).toHaveBeenCalledTimes(2);
    });

    it('debería manejar errores en consultas paralelas', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-06-30',
      };

      const errorDB = new Error('Error en consulta paralela');
      jest.spyOn(service, 'calcularOcupacion').mockRejectedValue(errorDB);

      // Act & Assert
      await expect(service.generarDashboard(filtros)).rejects.toThrow(
        'Error en consulta paralela',
      );
    });
  });

  describe('Métodos helper privados', () => {
    it('debería calcular período anterior correctamente', async () => {
      // Arrange
      const filtros = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-06-30',
        incluirComparacion: true,
      };

      // Mock para simular el comportamiento del método privado
      jest.spyOn(service, 'calcularOcupacion').mockResolvedValue({
        ocupacionPorPeriodo: [],
        ocupacionPromedio: 75,
        revparPromedio: 45000,
        adrPromedio: 59400,
      });
      jest.spyOn(service, 'analizarDemografia').mockResolvedValue([]);
      jest.spyOn(service, 'analizarMotivosViaje').mockResolvedValue([]);
      jest
        .spyOn(service, 'analizarRendimientoHabitaciones')
        .mockResolvedValue([]);
      mockPrismaService.$queryRaw.mockResolvedValue([
        { total_huespedes: BigInt(100), huespedes_recurrentes: BigInt(20) },
      ]);

      // Act
      await service.generarDashboard(filtros);

      // Assert
      // Verificar que se llamó calcularOcupacion con fechas del período anterior
      expect(service.calcularOcupacion).toHaveBeenNthCalledWith(2, {
        fechaInicio: expect.stringMatching(/2023-07-0[24]/), // Período anterior calculado con flexibilidad
        fechaFin: '2023-12-31',
      });
    });
  });

  describe('Manejo de errores y casos edge', () => {
    it('debería manejar divisiones por cero en cálculos de porcentajes', async () => {
      // Arrange
      const filtros = {};

      // Mock con datos que podrían causar división por cero
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      // Act & Assert
      const demografiaResultado = await service.analizarDemografia(filtros);
      const procedenciaResultado = await service.analizarProcedencia(filtros);
      const motivosResultado = await service.analizarMotivosViaje(filtros);

      expect(demografiaResultado).toEqual([]);
      expect(procedenciaResultado).toEqual([]);
      expect(motivosResultado).toEqual([]);
    });

    it('debería manejar valores null en consultas SQL', async () => {
      // Arrange
      const filtros = {};

      const datosConNulls = [
        {
          nacionalidad: 'Colombia',
          cantidad: BigInt(50),
          ingresos: null, // Valor null
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(datosConNulls);

      // Act
      const resultado = await service.analizarDemografia(filtros);

      // Assert
      expect(resultado).toHaveLength(1);
      expect(resultado[0].ingresos).toBe(0); // Debería manejar null como 0
    });

    it('debería propagar errores de Prisma correctamente', async () => {
      // Arrange
      const filtros = {};
      const errorPrisma = new Error('Error de Prisma');

      mockPrismaService.$queryRaw.mockRejectedValue(errorPrisma);

      // Act & Assert para diferentes métodos
      await expect(service.analizarDemografia(filtros)).rejects.toThrow(
        'Error de Prisma',
      );
      await expect(service.analizarProcedencia(filtros)).rejects.toThrow(
        'Error de Prisma',
      );
      await expect(
        service.analizarRendimientoHabitaciones(filtros),
      ).rejects.toThrow('Error de Prisma');
      await expect(service.analizarMotivosViaje(filtros)).rejects.toThrow(
        'Error de Prisma',
      );
    });

    it('debería manejar BigInt correctamente en todas las conversiones', async () => {
      // Arrange
      const filtros = {};

      const datosConBigInt = [
        {
          nacionalidad: 'Colombia',
          cantidad: BigInt(999999999999), // Número muy grande
          ingresos: 1000000,
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(datosConBigInt);

      // Act
      const resultado = await service.analizarDemografia(filtros);

      // Assert
      expect(resultado[0].cantidad).toBe(999999999999);
      expect(typeof resultado[0].cantidad).toBe('number');
    });
  });
});
