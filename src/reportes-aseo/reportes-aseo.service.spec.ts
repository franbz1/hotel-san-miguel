import { Test, TestingModule } from '@nestjs/testing';
import { ReportesAseoService } from './reportes-aseo.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateReportesAseoDto } from './dto/create-reportes-aseo.dto';
import { UpdateReportesAseoDto } from './dto/update-reportes-aseo.dto';
import { FiltrosReportesAseoDto } from './dto/filtros-reportes-aseo.dto';

describe('ReportesAseoService', () => {
  let service: ReportesAseoService;
  let prismaService: PrismaService;

  // Mock del PrismaService
  const mockPrismaService = {
    reporteAseoDiario: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
    },
    registroAseoHabitacion: {
      findMany: jest.fn(),
    },
    registroAseoZonaComun: {
      findMany: jest.fn(),
    },
  };

  // Datos mock para las pruebas
  const mockCreateReportesAseoDto: CreateReportesAseoDto = {
    fecha: '2024-01-15T00:00:00Z',
    elementos_aseo: ['Escoba', 'Trapeador', 'Aspiradora'],
    elementos_proteccion: ['Guantes de látex', 'Mascarilla N95'],
    productos_quimicos: ['Desinfectante multiusos', 'Detergente líquido'],
    procedimiento_aseo_habitacion:
      'Ventilación, retiro de ropa de cama, limpieza de superficies',
    procedimiento_desinfeccion_habitacion:
      'Aplicación de desinfectante en todas las superficies',
    procedimiento_limpieza_zona_comun: 'Barrido, trapeado con desinfectante',
    procedimiento_desinfeccion_zona_comun: 'Nebulización con desinfectante',
    datos: {
      habitaciones: [
        {
          id: 1,
          habitacionId: 101,
          usuarioId: 1,
          fecha_registro: '2024-01-15T14:30:00Z',
          tipos_realizados: ['LIMPIEZA', 'DESINFECCION'],
          objetos_perdidos: false,
          rastros_de_animales: false,
          observaciones: 'Habitación en buen estado',
        },
      ],
      zonas_comunes: [
        {
          id: 1,
          zonaComunId: 1,
          usuarioId: 1,
          fecha_registro: '2024-01-15T15:00:00Z',
          tipos_realizados: ['LIMPIEZA'],
          objetos_perdidos: false,
          rastros_de_animales: false,
          observaciones: 'Zona común limpia',
        },
      ],
      resumen: {
        total_habitaciones_aseadas: 15,
        total_zonas_comunes_aseadas: 8,
        objetos_perdidos_encontrados: 2,
        rastros_animales_encontrados: 0,
      },
    },
  };

  const mockReporteAseo = {
    id: 1,
    fecha: new Date('2024-01-15T00:00:00Z'),
    elementos_aseo: ['Escoba', 'Trapeador', 'Aspiradora'],
    elementos_proteccion: ['Guantes de látex', 'Mascarilla N95'],
    productos_quimicos: ['Desinfectante multiusos', 'Detergente líquido'],
    procedimiento_aseo_habitacion:
      'Ventilación, retiro de ropa de cama, limpieza de superficies',
    procedimiento_desinfeccion_habitacion:
      'Aplicación de desinfectante en todas las superficies',
    procedimiento_limpieza_zona_comun: 'Barrido, trapeado con desinfectante',
    procedimiento_desinfeccion_zona_comun: 'Nebulización con desinfectante',
    datos: mockCreateReportesAseoDto.datos,
    deleted: false,
    createdAt: new Date('2024-01-15T18:00:00Z'),
    updatedAt: new Date('2024-01-15T18:00:00Z'),
  };

  const mockUpdateReportesAseoDto: UpdateReportesAseoDto = {
    elementos_aseo: [
      'Escoba',
      'Trapeador',
      'Aspiradora',
      'Paños de microfibra',
    ],
    procedimiento_aseo_habitacion:
      'Procedimiento actualizado para habitaciones',
  };

  beforeEach(async () => {
    // Resetear completamente todos los mocks antes de cada test
    jest.clearAllMocks();
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportesAseoService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReportesAseoService>(ReportesAseoService);
    prismaService = module.get<PrismaService>(PrismaService);
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
    });
  });

  // ================================================================
  // CREATE - Crear reporte de aseo
  // ================================================================
  describe('create', () => {
    it('debería crear un reporte de aseo exitosamente', async () => {
      // Arrange
      mockPrismaService.reporteAseoDiario.create.mockResolvedValue(
        mockReporteAseo,
      );

      // Act
      const resultado = await service.create(mockCreateReportesAseoDto);

      // Assert
      expect(resultado).toEqual(mockReporteAseo);
      expect(prismaService.reporteAseoDiario.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateReportesAseoDto,
          fecha: new Date(mockCreateReportesAseoDto.fecha),
        },
      });
      expect(prismaService.reporteAseoDiario.create).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar BadRequestException cuando ya existe un reporte para la fecha', async () => {
      // Arrange
      const errorPrisma = { code: 'P2002' };
      mockPrismaService.reporteAseoDiario.create.mockRejectedValue(errorPrisma);

      // Act & Assert
      await expect(service.create(mockCreateReportesAseoDto)).rejects.toThrow(
        new BadRequestException('Ya existe un reporte de aseo para esta fecha'),
      );
      expect(prismaService.reporteAseoDiario.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateReportesAseoDto,
          fecha: new Date(mockCreateReportesAseoDto.fecha),
        },
      });
    });

    it('debería propagar otros errores que no sean P2002', async () => {
      // Arrange
      const errorConexionBD = new Error('Error de conexión a la base de datos');
      mockPrismaService.reporteAseoDiario.create.mockRejectedValue(
        errorConexionBD,
      );

      // Act & Assert
      await expect(service.create(mockCreateReportesAseoDto)).rejects.toThrow(
        'Error de conexión a la base de datos',
      );
    });
  });

  // ================================================================
  // FIND ALL - Listar reportes con paginación y filtros
  // ================================================================
  describe('findAll', () => {
    it('debería obtener reportes con paginación exitosamente', async () => {
      // Arrange
      const filtrosDto: FiltrosReportesAseoDto = { page: 1, limit: 10 };
      const reportesEncontrados = [
        { ...mockReporteAseo, id: 1 },
        { ...mockReporteAseo, id: 2, fecha: new Date('2024-01-16T00:00:00Z') },
      ];

      mockPrismaService.reporteAseoDiario.count.mockResolvedValue(2);
      mockPrismaService.reporteAseoDiario.findMany.mockResolvedValue(
        reportesEncontrados,
      );

      // Act
      const resultado = await service.findAll(filtrosDto);

      // Assert
      expect(resultado).toEqual({
        data: reportesEncontrados,
        meta: { page: 1, limit: 10, total: 2, lastPage: 1 },
      });

      expect(prismaService.reporteAseoDiario.count).toHaveBeenCalledWith({
        where: { deleted: false },
      });

      expect(prismaService.reporteAseoDiario.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { deleted: false },
        orderBy: { fecha: 'desc' },
      });
    });

    it('debería aplicar filtros correctamente', async () => {
      // Arrange
      const filtrosDto: FiltrosReportesAseoDto = {
        page: 1,
        limit: 10,
        fecha: '2024-01-15',
        elemento_aseo: 'Aspiradora',
      };

      mockPrismaService.reporteAseoDiario.count.mockResolvedValue(1);
      mockPrismaService.reporteAseoDiario.findMany.mockResolvedValue([
        mockReporteAseo,
      ]);

      // Act
      const resultado = await service.findAll(filtrosDto);

      // Assert
      expect(prismaService.reporteAseoDiario.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          fecha: {
            gte: new Date('2024-01-15T00:00:00.000Z'),
            lt: new Date('2024-01-16T00:00:00.000Z'),
          },
          elementos_aseo: {
            has: 'Aspiradora',
          },
        },
      });
    });

    it('debería retornar respuesta vacía cuando no hay datos', async () => {
      // Arrange
      const filtrosDto: FiltrosReportesAseoDto = { page: 1, limit: 10 };

      mockPrismaService.reporteAseoDiario.count.mockResolvedValue(0);

      // Act
      const resultado = await service.findAll(filtrosDto);

      // Assert
      expect(resultado.data).toEqual([]);
      expect(resultado.meta.lastPage).toBe(0);
      expect(prismaService.reporteAseoDiario.findMany).not.toHaveBeenCalled();
    });
  });

  // ================================================================
  // FIND ONE - Buscar reporte por ID
  // ================================================================
  describe('findOne', () => {
    it('debería encontrar un reporte por ID exitosamente', async () => {
      // Arrange
      const reporteId = 1;
      mockPrismaService.reporteAseoDiario.findFirstOrThrow.mockResolvedValue(
        mockReporteAseo,
      );

      // Act
      const resultado = await service.findOne(reporteId);

      // Assert
      expect(resultado).toEqual(mockReporteAseo);
      expect(
        prismaService.reporteAseoDiario.findFirstOrThrow,
      ).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
      });
    });

    it('debería lanzar NotFoundException cuando el reporte no existe', async () => {
      // Arrange
      const reporteId = 999;
      const errorPrisma = { code: 'P2025' };

      mockPrismaService.reporteAseoDiario.findFirstOrThrow.mockRejectedValue(
        errorPrisma,
      );

      // Act & Assert
      await expect(service.findOne(reporteId)).rejects.toThrow(
        new NotFoundException(
          `No se encontró el reporte de aseo con ID: ${reporteId}`,
        ),
      );
    });
  });

  // ================================================================
  // FIND BY FECHA - Buscar reporte por fecha
  // ================================================================
  describe('findByFecha', () => {
    it('debería encontrar un reporte por fecha exitosamente', async () => {
      // Arrange
      const fecha = '2024-01-15';
      mockPrismaService.reporteAseoDiario.findFirst.mockResolvedValue(
        mockReporteAseo,
      );

      // Act
      const resultado = await service.findByFecha(fecha);

      // Assert
      expect(resultado).toEqual(mockReporteAseo);
      expect(prismaService.reporteAseoDiario.findFirst).toHaveBeenCalledWith({
        where: {
          fecha: {
            gte: new Date('2024-01-15T00:00:00.000Z'),
            lt: new Date('2024-01-16T00:00:00.000Z'),
          },
          deleted: false,
        },
      });
    });

    it('debería retornar null cuando no existe reporte para la fecha', async () => {
      // Arrange
      const fecha = '2024-01-20';
      mockPrismaService.reporteAseoDiario.findFirst.mockResolvedValue(null);

      // Act
      const resultado = await service.findByFecha(fecha);

      // Assert
      expect(resultado).toBeNull();
    });
  });

  // ================================================================
  // UPDATE - Actualizar reporte
  // ================================================================
  describe('update', () => {
    it('debería actualizar un reporte exitosamente', async () => {
      // Arrange
      const reporteId = 1;
      const reporteActualizado = {
        ...mockReporteAseo,
        ...mockUpdateReportesAseoDto,
      };

      mockPrismaService.reporteAseoDiario.update.mockResolvedValue(
        reporteActualizado,
      );

      // Act
      const resultado = await service.update(
        reporteId,
        mockUpdateReportesAseoDto,
      );

      // Assert
      expect(resultado).toEqual(reporteActualizado);
      expect(prismaService.reporteAseoDiario.update).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: mockUpdateReportesAseoDto,
      });
    });

    it('debería lanzar BadRequestException cuando no se proporcionan datos', async () => {
      // Arrange
      const reporteId = 1;
      const updateDtoVacio = {};

      // Act & Assert
      await expect(service.update(reporteId, updateDtoVacio)).rejects.toThrow(
        new BadRequestException(
          'Debe enviar datos para actualizar el reporte de aseo.',
        ),
      );

      expect(prismaService.reporteAseoDiario.update).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException cuando el reporte no existe', async () => {
      // Arrange
      const reporteId = 999;
      const errorPrisma = { code: 'P2025' };

      mockPrismaService.reporteAseoDiario.update.mockRejectedValue(errorPrisma);

      // Act & Assert
      await expect(
        service.update(reporteId, mockUpdateReportesAseoDto),
      ).rejects.toThrow(
        new NotFoundException(
          `No se encontró el reporte de aseo con ID: ${reporteId}`,
        ),
      );
    });
  });

  // ================================================================
  // REMOVE - Eliminar reporte (soft delete)
  // ================================================================
  describe('remove', () => {
    it('debería eliminar un reporte exitosamente', async () => {
      // Arrange
      const reporteId = 1;
      const reporteEliminado = { ...mockReporteAseo, deleted: true };

      mockPrismaService.reporteAseoDiario.update.mockResolvedValue(
        reporteEliminado,
      );

      // Act
      const resultado = await service.remove(reporteId);

      // Assert
      expect(resultado).toEqual(reporteEliminado);
      expect(prismaService.reporteAseoDiario.update).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: { deleted: true },
      });
    });

    it('debería lanzar NotFoundException cuando el reporte no existe', async () => {
      // Arrange
      const reporteId = 999;
      const errorPrisma = { code: 'P2025' };

      mockPrismaService.reporteAseoDiario.update.mockRejectedValue(errorPrisma);

      // Act & Assert
      await expect(service.remove(reporteId)).rejects.toThrow(
        new NotFoundException(
          `No se encontró el reporte de aseo con ID: ${reporteId}`,
        ),
      );
    });
  });

  // ================================================================
  // GENERAR REPORTE - Generar reporte automático
  // ================================================================
  describe('generarReporte', () => {
    it('debería generar un reporte automático exitosamente', async () => {
      // Arrange
      const fecha = '2024-01-15';
      const registrosHabitaciones = [
        {
          id: 1,
          habitacionId: 101,
          usuarioId: 1,
          fecha_registro: new Date('2024-01-15T14:30:00Z'),
          tipos_realizados: ['LIMPIEZA'],
          objetos_perdidos: false,
          rastros_de_animales: false,
        },
      ];
      const registrosZonas = [
        {
          id: 1,
          zonaComunId: 1,
          usuarioId: 1,
          fecha_registro: new Date('2024-01-15T15:00:00Z'),
          tipos_realizados: ['LIMPIEZA'],
          objetos_perdidos: false,
          rastros_de_animales: false,
        },
      ];

      mockPrismaService.registroAseoHabitacion.findMany.mockResolvedValue(
        registrosHabitaciones,
      );
      mockPrismaService.registroAseoZonaComun.findMany.mockResolvedValue(
        registrosZonas,
      );
      mockPrismaService.reporteAseoDiario.create.mockResolvedValue(
        mockReporteAseo,
      );

      // Act
      const resultado = await service.generarReporte(fecha);

      // Assert
      expect(resultado).toEqual(mockReporteAseo);
      expect(prismaService.registroAseoHabitacion.findMany).toHaveBeenCalled();
      expect(prismaService.registroAseoZonaComun.findMany).toHaveBeenCalled();
      expect(prismaService.reporteAseoDiario.create).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si ya existe reporte para la fecha', async () => {
      // Arrange
      const fecha = '2024-01-15';
      mockPrismaService.reporteAseoDiario.findFirst.mockResolvedValue(
        mockReporteAseo,
      );

      // Act & Assert
      await expect(service.generarReporte(fecha)).rejects.toThrow(
        new BadRequestException(
          `Ya existe un reporte de aseo para la fecha: ${fecha}`,
        ),
      );
    });
  });

  // ================================================================
  // Casos de borde y validaciones adicionales
  // ================================================================
  describe('Casos de borde y validaciones adicionales', () => {
    it('debería manejar filtros de rango de fechas correctamente', async () => {
      // Arrange
      const filtrosDto: FiltrosReportesAseoDto = {
        page: 1,
        limit: 10,
        fecha_inicio: '2024-01-01',
        fecha_fin: '2024-01-31',
      };

      mockPrismaService.reporteAseoDiario.count.mockResolvedValue(5);
      mockPrismaService.reporteAseoDiario.findMany.mockResolvedValue([]);

      // Act
      await service.findAll(filtrosDto);

      // Assert
      expect(prismaService.reporteAseoDiario.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          fecha: {
            gte: new Date('2024-01-01T00:00:00.000Z'),
            lte: new Date('2024-01-31T23:59:59.999Z'),
          },
        },
      });
    });

    it('debería validar fechas correctamente en createReportesAseoDto', async () => {
      // Arrange
      const createDtoConFecha = {
        ...mockCreateReportesAseoDto,
        fecha: '2024-12-25T00:00:00Z',
      };

      const reporteConFecha = {
        ...mockReporteAseo,
        fecha: new Date('2024-12-25T00:00:00Z'),
      };

      mockPrismaService.reporteAseoDiario.create.mockResolvedValue(
        reporteConFecha,
      );

      // Act
      const resultado = await service.create(createDtoConFecha);

      // Assert
      expect(resultado.fecha).toEqual(new Date('2024-12-25T00:00:00Z'));
      expect(resultado.fecha).toBeInstanceOf(Date);
    });

    it('debería mantener la integridad de datos en actualizaciones parciales', async () => {
      // Arrange
      const reporteId = 1;
      const updateParcial = { elementos_aseo: ['Escoba', 'Trapeador'] };
      const reporteActualizado = {
        ...mockReporteAseo,
        elementos_aseo: ['Escoba', 'Trapeador'],
      };

      mockPrismaService.reporteAseoDiario.update.mockResolvedValue(
        reporteActualizado,
      );

      // Act
      const resultado = await service.update(reporteId, updateParcial);

      // Assert
      expect(resultado).toEqual(reporteActualizado);
      expect(resultado.procedimiento_aseo_habitacion).toBe(
        mockReporteAseo.procedimiento_aseo_habitacion,
      );
      expect(resultado.elementos_aseo).toEqual(['Escoba', 'Trapeador']);
    });
  });
});
