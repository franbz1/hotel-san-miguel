import { Test, TestingModule } from '@nestjs/testing';
import { ReservasService } from './reservas.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { FiltrosReservaDto } from './dto/filtros-reserva.dto';
import { EstadosReserva } from 'src/common/enums/estadosReserva.enum';
import { MotivosViajes } from 'src/common/enums/motivosViajes.enum';

describe('ReservasService - Búsqueda con Filtros (Patrón Query Builder)', () => {
  let service: ReservasService;

  // Mock del PrismaService para tests de búsqueda
  const mockPrismaService = {
    reserva: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  // Datos de prueba para reservas con información completa
  const mockReservaCompleta = {
    id: 1,
    fecha_inicio: new Date('2024-01-15'),
    fecha_fin: new Date('2024-01-20'),
    estado: EstadosReserva.RESERVADO,
    pais_procedencia: 'Colombia',
    ciudad_procedencia: 'Medellín',
    pais_destino: 'Estados Unidos',
    motivo_viaje: MotivosViajes.VACACIONES_RECREO_Y_OCIO,
    check_in: new Date('2024-01-15T14:00:00'),
    check_out: new Date('2024-01-20T12:00:00'),
    costo: 500.5,
    numero_acompaniantes: 2,
    habitacionId: 101,
    huespedId: 1,
    facturaId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deleted: false,
    factura: null,
    huespedes_secundarios: [],
    huesped: {
      id: 1,
      nombres: 'Juan Carlos',
      primer_apellido: 'Pérez',
      segundo_apellido: 'García',
      numero_documento: '12345678',
      tipo_documento: 'CC',
      nacionalidad: 'Colombiana',
      telefono: '+57 300 123 4567',
      correo: 'juan.perez@email.com',
    },
    habitacion: {
      id: 101,
      numero_habitacion: 101,
      tipo: 'SENCILLA',
      precio_por_noche: 150.0,
    },
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ================================================================
  // DEFINICIÓN DEL SERVICIO
  // ================================================================
  describe('Definición del servicio de búsqueda', () => {
    it('debería estar definido', () => {
      expect(service).toBeDefined();
    });

    it('debería tener el método buscarConFiltros', () => {
      expect(service.buscarConFiltros).toBeDefined();
      expect(typeof service.buscarConFiltros).toBe('function');
    });
  });

  // ================================================================
  // BÚSQUEDA SIN FILTROS - Comportamiento por defecto
  // ================================================================
  describe('buscarConFiltros - Sin filtros (comportamiento por defecto)', () => {
    it('debería retornar todas las reservas cuando no se aplican filtros', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
      };

      const totalReservas = 5;
      const reservasEsperadas = [mockReservaCompleta];

      mockPrismaService.reserva.count.mockResolvedValue(totalReservas);
      mockPrismaService.reserva.findMany.mockResolvedValue(reservasEsperadas);

      // Act
      const result = await service.buscarConFiltros(filtros);

      // Assert
      expect(result.data).toEqual(reservasEsperadas);
      expect((result.meta as any).totalReservas).toBe(totalReservas);
      expect((result.meta as any).filtrosAplicados.total).toBe(0);

      // Verificar que se construya el WHERE clause básico
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: { deleted: false },
      });

      expect(mockPrismaService.reserva.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { deleted: false },
        orderBy: { createdAt: 'desc' }, // Orden por defecto
        include: expect.objectContaining({
          factura: { where: { deleted: false } },
          huespedes_secundarios: { where: { deleted: false } },
          huesped: expect.any(Object),
          habitacion: expect.any(Object),
        }),
      });
    });
  });

  // ================================================================
  // FILTROS DE FECHAS - Patrones más comunes
  // ================================================================
  describe('buscarConFiltros - Filtros de fechas', () => {
    it('debería filtrar por rango de fechas de inicio correctamente', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        fechaInicioDesde: '2024-01-01T00:00:00.000Z',
        fechaInicioHasta: '2024-12-31T23:59:59.999Z',
      };

      mockPrismaService.reserva.count.mockResolvedValue(3);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      const result = await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          fecha_inicio: {
            gte: new Date('2024-01-01T00:00:00.000Z'),
            lte: new Date('2024-12-31T23:59:59.999Z'),
          },
        },
      });

      expect((result.meta as any).filtrosAplicados.total).toBe(2);
      expect((result.meta as any).filtrosAplicados.filtros).toEqual({
        fechaInicioDesde: '2024-01-01T00:00:00.000Z',
        fechaInicioHasta: '2024-12-31T23:59:59.999Z',
      });
    });

    it('debería filtrar por rango de check-in correctamente', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        checkInDesde: '2024-01-15T14:00:00.000Z',
        checkInHasta: '2024-01-20T12:00:00.000Z',
      };

      mockPrismaService.reserva.count.mockResolvedValue(2);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          check_in: {
            gte: new Date('2024-01-15T14:00:00.000Z'),
            lte: new Date('2024-01-20T12:00:00.000Z'),
          },
        },
      });
    });

    it('debería combinar filtros de fecha de inicio y check-in', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        fechaInicioDesde: '2024-01-01T00:00:00.000Z',
        checkInHasta: '2024-01-20T12:00:00.000Z',
      };

      mockPrismaService.reserva.count.mockResolvedValue(1);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          fecha_inicio: {
            gte: new Date('2024-01-01T00:00:00.000Z'),
          },
          check_in: {
            lte: new Date('2024-01-20T12:00:00.000Z'),
          },
        },
      });
    });
  });

  // ================================================================
  // FILTROS DE ENUMS - Estados y motivos
  // ================================================================
  describe('buscarConFiltros - Filtros de enums', () => {
    it('debería filtrar por estado de reserva', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        estado: EstadosReserva.RESERVADO,
      };

      mockPrismaService.reserva.count.mockResolvedValue(4);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          estado: EstadosReserva.RESERVADO,
        },
      });
    });

    it('debería filtrar por motivo de viaje', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        motivoViaje: MotivosViajes.NEGOCIOS_Y_MOTIVOS_PROFESIONALES,
      };

      mockPrismaService.reserva.count.mockResolvedValue(2);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          motivo_viaje: MotivosViajes.NEGOCIOS_Y_MOTIVOS_PROFESIONALES,
        },
      });
    });

    it('debería validar todos los estados posibles de reserva', async () => {
      // Arrange
      const estados = Object.values(EstadosReserva);
      mockPrismaService.reserva.count.mockResolvedValue(1);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act & Assert
      for (const estado of estados) {
        const filtros: FiltrosReservaDto = {
          page: 1,
          limit: 10,
          estado,
        };

        await service.buscarConFiltros(filtros);

        expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
          where: {
            deleted: false,
            estado,
          },
        });
      }

      expect(mockPrismaService.reserva.count).toHaveBeenCalledTimes(
        estados.length,
      );
    });
  });

  // ================================================================
  // FILTROS GEOGRÁFICOS - País y ciudad
  // ================================================================
  describe('buscarConFiltros - Filtros geográficos', () => {
    it('debería filtrar por país de procedencia (búsqueda parcial insensible)', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        paisProcedencia: 'colombia',
      };

      mockPrismaService.reserva.count.mockResolvedValue(3);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          pais_procedencia: {
            contains: 'colombia',
            mode: 'insensitive',
          },
        },
      });
    });

    it('debería filtrar por ciudad de procedencia (búsqueda parcial insensible)', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        ciudadProcedencia: 'MEDELLÍN',
      };

      mockPrismaService.reserva.count.mockResolvedValue(2);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          ciudad_procedencia: {
            contains: 'MEDELLÍN',
            mode: 'insensitive',
          },
        },
      });
    });

    it('debería combinar filtros geográficos país y ciudad', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        paisProcedencia: 'Colombia',
        ciudadProcedencia: 'Medellín',
      };

      mockPrismaService.reserva.count.mockResolvedValue(1);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          pais_procedencia: {
            contains: 'Colombia',
            mode: 'insensitive',
          },
          ciudad_procedencia: {
            contains: 'Medellín',
            mode: 'insensitive',
          },
        },
      });
    });
  });

  // ================================================================
  // FILTROS NUMÉRICOS - Costos, IDs y acompañantes
  // ================================================================
  describe('buscarConFiltros - Filtros numéricos', () => {
    it('debería filtrar por rango de costo', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        costoMinimo: 100.0,
        costoMaximo: 1000.0,
      };

      mockPrismaService.reserva.count.mockResolvedValue(5);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          costo: {
            gte: 100.0,
            lte: 1000.0,
          },
        },
      });
    });

    it('debería filtrar por número de acompañantes', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        acompaniantesMinimo: 1,
        acompaniantesMaximo: 5,
      };

      mockPrismaService.reserva.count.mockResolvedValue(3);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          numero_acompaniantes: {
            gte: 1,
            lte: 5,
          },
        },
      });
    });

    it('debería filtrar por ID de habitación', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        habitacionId: 101,
      };

      mockPrismaService.reserva.count.mockResolvedValue(2);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          habitacionId: 101,
        },
      });
    });

    it('debería filtrar por ID de huésped', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        huespedId: 1,
      };

      mockPrismaService.reserva.count.mockResolvedValue(4);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          huespedId: 1,
        },
      });
    });
  });

  // ================================================================
  // BÚSQUEDA DE TEXTO LIBRE - En datos del huésped
  // ================================================================
  describe('buscarConFiltros - Búsqueda de texto libre', () => {
    it('debería buscar en nombres del huésped', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        busquedaTexto: 'Juan',
      };

      mockPrismaService.reserva.count.mockResolvedValue(2);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          huesped: {
            OR: [
              {
                nombres: {
                  contains: 'Juan',
                  mode: 'insensitive',
                },
              },
              {
                primer_apellido: {
                  contains: 'Juan',
                  mode: 'insensitive',
                },
              },
              {
                segundo_apellido: {
                  contains: 'Juan',
                  mode: 'insensitive',
                },
              },
              {
                numero_documento: {
                  contains: 'Juan',
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      });
    });

    it('debería buscar número de documento', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        busquedaTexto: '12345',
      };

      mockPrismaService.reserva.count.mockResolvedValue(1);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          huesped: {
            OR: expect.arrayContaining([
              {
                numero_documento: {
                  contains: '12345',
                  mode: 'insensitive',
                },
              },
            ]),
          },
        },
      });
    });
  });

  // ================================================================
  // ORDENAMIENTO - Diferentes campos y direcciones
  // ================================================================
  describe('buscarConFiltros - Ordenamiento', () => {
    it('debería ordenar por fecha de inicio ascendente', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        ordenarPor: 'fecha_inicio',
        direccionOrden: 'asc',
      };

      mockPrismaService.reserva.count.mockResolvedValue(3);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { fecha_inicio: 'asc' },
        }),
      );
    });

    it('debería ordenar por costo descendente', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        ordenarPor: 'costo',
        direccionOrden: 'desc',
      };

      mockPrismaService.reserva.count.mockResolvedValue(3);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { costo: 'desc' },
        }),
      );
    });

    it('debería usar ordenamiento por defecto cuando no se especifica', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
      };

      mockPrismaService.reserva.count.mockResolvedValue(3);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' }, // Orden por defecto
        }),
      );
    });
  });

  // ================================================================
  // COMBINACIÓN DE FILTROS MÚLTIPLES - Casos complejos
  // ================================================================
  describe('buscarConFiltros - Filtros múltiples combinados', () => {
    it('debería combinar filtros de fecha, estado y costo correctamente', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        fechaInicioDesde: '2024-01-01T00:00:00.000Z',
        fechaInicioHasta: '2024-12-31T23:59:59.999Z',
        estado: EstadosReserva.RESERVADO,
        costoMinimo: 200.0,
        costoMaximo: 800.0,
        paisProcedencia: 'Colombia',
      };

      mockPrismaService.reserva.count.mockResolvedValue(2);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      const result = await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          fecha_inicio: {
            gte: new Date('2024-01-01T00:00:00.000Z'),
            lte: new Date('2024-12-31T23:59:59.999Z'),
          },
          estado: EstadosReserva.RESERVADO,
          costo: {
            gte: 200.0,
            lte: 800.0,
          },
          pais_procedencia: {
            contains: 'Colombia',
            mode: 'insensitive',
          },
        },
      });

      // Verificar que se contaron correctamente los filtros aplicados (6 filtros: 2 fechas + 1 estado + 2 costos + 1 país)
      expect((result.meta as any).filtrosAplicados.total).toBe(6);
      expect((result.meta as any).filtrosAplicados.filtros).toEqual({
        fechaInicioDesde: '2024-01-01T00:00:00.000Z',
        fechaInicioHasta: '2024-12-31T23:59:59.999Z',
        estado: EstadosReserva.RESERVADO,
        costoMinimo: 200.0,
        costoMaximo: 800.0,
        paisProcedencia: 'Colombia',
      });
    });

    it('debería aplicar búsqueda de texto con otros filtros', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        busquedaTexto: 'Juan',
        estado: EstadosReserva.FINALIZADO,
        habitacionId: 101,
      };

      mockPrismaService.reserva.count.mockResolvedValue(1);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          estado: EstadosReserva.FINALIZADO,
          habitacionId: 101,
          huesped: {
            OR: expect.any(Array),
          },
        },
      });
    });
  });

  // ================================================================
  // PAGINACIÓN Y METADATOS - Verificación de estructura de respuesta
  // ================================================================
  describe('buscarConFiltros - Paginación y metadatos', () => {
    it('debería retornar respuesta vacía cuando no hay resultados', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        estado: EstadosReserva.CANCELADO,
      };

      mockPrismaService.reserva.count.mockResolvedValue(0);

      // Act
      const result = await service.buscarConFiltros(filtros);

      // Assert
      expect(result.data).toEqual([]);
      // La respuesta vacía usa el formato estándar sin propiedades adicionales
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.lastPage).toBe(0);

      // No debería llamar findMany si no hay resultados
      expect(mockPrismaService.reserva.findMany).not.toHaveBeenCalled();
    });

    it('debería manejar correctamente la paginación con resultados', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 2,
        limit: 5,
        estado: EstadosReserva.RESERVADO,
      };

      const totalReservas = 12;
      mockPrismaService.reserva.count.mockResolvedValue(totalReservas);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      const result = await service.buscarConFiltros(filtros);

      // Assert
      expect((result.meta as any).totalReservas).toBe(12);
      expect(result.meta.lastPage).toBe(3); // Math.ceil(12/5)
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);

      // Verificar skip correcto para página 2
      expect(mockPrismaService.reserva.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (2-1) * 5
          take: 5,
        }),
      );
    });

    it('debería incluir estructura completa de datos en la respuesta', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        estado: EstadosReserva.RESERVADO,
      };

      mockPrismaService.reserva.count.mockResolvedValue(1);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      const result = await service.buscarConFiltros(filtros);

      // Assert
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('page');
      expect(result.meta).toHaveProperty('limit');
      expect(result.meta).toHaveProperty('totalReservas');
      expect(result.meta).toHaveProperty('lastPage');
      expect(result.meta as any).toHaveProperty('filtrosAplicados');
      expect((result.meta as any).filtrosAplicados).toHaveProperty('total');
      expect((result.meta as any).filtrosAplicados).toHaveProperty('filtros');

      // Verificar include correcto para datos relacionados
      expect(mockPrismaService.reserva.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            factura: { where: { deleted: false } },
            huespedes_secundarios: { where: { deleted: false } },
            huesped: {
              select: expect.objectContaining({
                id: true,
                nombres: true,
                primer_apellido: true,
                segundo_apellido: true,
                numero_documento: true,
                tipo_documento: true,
                nacionalidad: true,
                telefono: true,
                correo: true,
              }),
            },
            habitacion: {
              select: expect.objectContaining({
                id: true,
                numero_habitacion: true,
                tipo: true,
                precio_por_noche: true,
              }),
            },
          },
        }),
      );
    });
  });

  // ================================================================
  // CASOS DE BORDE Y VALIDACIONES - Edge cases
  // ================================================================
  describe('buscarConFiltros - Casos de borde', () => {
    it('debería manejar filtros con valores cero correctamente', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        costoMinimo: 0,
        acompaniantesMinimo: 0,
      };

      mockPrismaService.reserva.count.mockResolvedValue(1);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          costo: {
            gte: 0,
          },
          numero_acompaniantes: {
            gte: 0,
          },
        },
      });
    });

    it('debería aplicar búsqueda de texto incluso con solo espacios', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        busquedaTexto: '   ', // Solo espacios
        paisProcedencia: '', // String vacío
      };

      mockPrismaService.reserva.count.mockResolvedValue(1);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      const result = await service.buscarConFiltros(filtros);

      // Assert
      // La búsqueda de texto se aplica tal como viene del DTO después del transform
      expect(mockPrismaService.reserva.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          huesped: {
            OR: [
              {
                nombres: {
                  contains: '   ',
                  mode: 'insensitive',
                },
              },
              {
                primer_apellido: {
                  contains: '   ',
                  mode: 'insensitive',
                },
              },
              {
                segundo_apellido: {
                  contains: '   ',
                  mode: 'insensitive',
                },
              },
              {
                numero_documento: {
                  contains: '   ',
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      });

      expect((result.meta as any).filtrosAplicados.total).toBe(1); // Solo la búsqueda de texto cuenta
    });

    it('debería manejar página que excede el límite', async () => {
      // Arrange
      const filtros: FiltrosReservaDto = {
        page: 10, // Página muy alta
        limit: 10,
        estado: EstadosReserva.RESERVADO,
      };

      const totalReservas = 5; // Solo 5 resultados = 1 página
      mockPrismaService.reserva.count.mockResolvedValue(totalReservas);

      // Act
      const result = await service.buscarConFiltros(filtros);

      // Assert
      expect(result.data).toEqual([]); // Respuesta vacía
      expect(result.meta.lastPage).toBe(1);
      expect(mockPrismaService.reserva.findMany).not.toHaveBeenCalled();
    });
  });

  // ================================================================
  // RENDIMIENTO Y CONCURRENCIA - Tests de estrés
  // ================================================================
  describe('buscarConFiltros - Rendimiento y concurrencia', () => {
    it('debería manejar múltiples búsquedas concurrentes', async () => {
      // Arrange
      const filtros1: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        estado: EstadosReserva.RESERVADO,
      };
      const filtros2: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        paisProcedencia: 'Colombia',
      };
      const filtros3: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        costoMinimo: 100,
      };

      mockPrismaService.reserva.count.mockResolvedValue(1);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      const promises = [
        service.buscarConFiltros(filtros1),
        service.buscarConFiltros(filtros2),
        service.buscarConFiltros(filtros3),
      ];

      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(3);
      expect(mockPrismaService.reserva.count).toHaveBeenCalledTimes(3);
      expect(mockPrismaService.reserva.findMany).toHaveBeenCalledTimes(3);
    });

    it('debería mantener aislamiento entre filtros diferentes', async () => {
      // Arrange
      const filtros1: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        estado: EstadosReserva.RESERVADO,
      };
      const filtros2: FiltrosReservaDto = {
        page: 1,
        limit: 10,
        estado: EstadosReserva.CANCELADO,
      };

      mockPrismaService.reserva.count.mockResolvedValue(1);
      mockPrismaService.reserva.findMany.mockResolvedValue([
        mockReservaCompleta,
      ]);

      // Act
      await service.buscarConFiltros(filtros1);
      await service.buscarConFiltros(filtros2);

      // Assert
      expect(mockPrismaService.reserva.count).toHaveBeenNthCalledWith(1, {
        where: { deleted: false, estado: EstadosReserva.RESERVADO },
      });
      expect(mockPrismaService.reserva.count).toHaveBeenNthCalledWith(2, {
        where: { deleted: false, estado: EstadosReserva.CANCELADO },
      });
    });
  });
});
