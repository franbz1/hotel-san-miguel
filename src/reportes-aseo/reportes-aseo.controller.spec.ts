import { Test, TestingModule } from '@nestjs/testing';
import { ReportesAseoController } from './reportes-aseo.controller';
import { ReportesAseoService } from './reportes-aseo.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateReportesAseoDto } from './dto/create-reportes-aseo.dto';
import { UpdateReportesAseoDto } from './dto/update-reportes-aseo.dto';
import { FiltrosReportesAseoDto } from './dto/filtros-reportes-aseo.dto';

describe('ReportesAseoController', () => {
  let controller: ReportesAseoController;
  let reportesAseoService: ReportesAseoService;

  // Mock del ReportesAseoService
  const mockReportesAseoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByFecha: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    generarReporte: jest.fn(),
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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportesAseoController],
      providers: [
        {
          provide: ReportesAseoService,
          useValue: mockReportesAseoService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReportesAseoController>(ReportesAseoController);
    reportesAseoService = module.get<ReportesAseoService>(ReportesAseoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición del controller', () => {
    it('debería estar definido', () => {
      expect(controller).toBeDefined();
    });

    it('debería tener el servicio inyectado', () => {
      expect(reportesAseoService).toBeDefined();
    });
  });

  // ================================================================
  // CREATE - Crear reporte de aseo
  // ================================================================
  describe('create', () => {
    it('debería crear un reporte de aseo exitosamente', async () => {
      // Arrange
      mockReportesAseoService.create.mockResolvedValue(mockReporteAseo);

      // Act
      const resultado = await controller.create(mockCreateReportesAseoDto);

      // Assert
      expect(resultado).toEqual(mockReporteAseo);
      expect(reportesAseoService.create).toHaveBeenCalledTimes(1);
      expect(reportesAseoService.create).toHaveBeenCalledWith(
        mockCreateReportesAseoDto,
      );
    });

    it('debería propagar errores del servicio al crear reporte', async () => {
      // Arrange
      const errorEsperado = new Error('Ya existe un reporte para esta fecha');
      mockReportesAseoService.create.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(
        controller.create(mockCreateReportesAseoDto),
      ).rejects.toThrow('Ya existe un reporte para esta fecha');
      expect(reportesAseoService.create).toHaveBeenCalledWith(
        mockCreateReportesAseoDto,
      );
    });
  });

  // ================================================================
  // FIND ALL - Listar reportes
  // ================================================================
  describe('findAll', () => {
    it('debería obtener todos los reportes con paginación exitosamente', async () => {
      // Arrange
      const filtrosDto: FiltrosReportesAseoDto = { page: 1, limit: 10 };
      const respuestaEsperada = {
        data: [
          mockReporteAseo,
          {
            ...mockReporteAseo,
            id: 2,
            fecha: new Date('2024-01-16T00:00:00Z'),
          },
        ],
        meta: { page: 1, limit: 10, total: 2, lastPage: 1 },
      };

      mockReportesAseoService.findAll.mockResolvedValue(respuestaEsperada);

      // Act
      const resultado = await controller.findAll(filtrosDto);

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(reportesAseoService.findAll).toHaveBeenCalledTimes(1);
      expect(reportesAseoService.findAll).toHaveBeenCalledWith(filtrosDto);
    });

    it('debería manejar respuesta vacía correctamente', async () => {
      // Arrange
      const filtrosDto: FiltrosReportesAseoDto = { page: 1, limit: 10 };
      const respuestaVacia = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, lastPage: 0 },
      };

      mockReportesAseoService.findAll.mockResolvedValue(respuestaVacia);

      // Act
      const resultado = await controller.findAll(filtrosDto);

      // Assert
      expect(resultado).toEqual(respuestaVacia);
      expect(resultado.data).toHaveLength(0);
    });

    it('debería aplicar filtros correctamente', async () => {
      // Arrange
      const filtrosConFiltros: FiltrosReportesAseoDto = {
        page: 1,
        limit: 10,
        fecha: '2024-01-15',
        elemento_aseo: 'Aspiradora',
      };

      const respuestaFiltrada = {
        data: [mockReporteAseo],
        meta: { page: 1, limit: 10, total: 1, lastPage: 1 },
      };

      mockReportesAseoService.findAll.mockResolvedValue(respuestaFiltrada);

      // Act
      const resultado = await controller.findAll(filtrosConFiltros);

      // Assert
      expect(resultado).toEqual(respuestaFiltrada);
      expect(reportesAseoService.findAll).toHaveBeenCalledWith(
        filtrosConFiltros,
      );
    });
  });

  // ================================================================
  // FIND ONE - Buscar reporte por ID
  // ================================================================
  describe('findOne', () => {
    it('debería obtener un reporte por ID exitosamente', async () => {
      // Arrange
      const reporteId = 1;
      mockReportesAseoService.findOne.mockResolvedValue(mockReporteAseo);

      // Act
      const resultado = await controller.findOne(reporteId);

      // Assert
      expect(resultado).toEqual(mockReporteAseo);
      expect(reportesAseoService.findOne).toHaveBeenCalledTimes(1);
      expect(reportesAseoService.findOne).toHaveBeenCalledWith(1);
    });

    it('debería propagar error cuando el reporte no existe', async () => {
      // Arrange
      const reporteId = 999;
      const errorEsperado = new Error('Reporte no encontrado');

      mockReportesAseoService.findOne.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(controller.findOne(reporteId)).rejects.toThrow(
        'Reporte no encontrado',
      );
      expect(reportesAseoService.findOne).toHaveBeenCalledWith(999);
    });
  });

  // ================================================================
  // FIND BY FECHA - Buscar reporte por fecha
  // ================================================================
  describe('findByFecha', () => {
    it('debería obtener un reporte por fecha exitosamente', async () => {
      // Arrange
      const fecha = '2024-01-15';
      mockReportesAseoService.findByFecha.mockResolvedValue(mockReporteAseo);

      // Act
      const resultado = await controller.findByFecha(fecha);

      // Assert
      expect(resultado).toEqual(mockReporteAseo);
      expect(reportesAseoService.findByFecha).toHaveBeenCalledTimes(1);
      expect(reportesAseoService.findByFecha).toHaveBeenCalledWith(fecha);
    });

    it('debería retornar null cuando no existe reporte para la fecha', async () => {
      // Arrange
      const fecha = '2024-01-20';
      mockReportesAseoService.findByFecha.mockResolvedValue(null);

      // Act
      const resultado = await controller.findByFecha(fecha);

      // Assert
      expect(resultado).toBeNull();
      expect(reportesAseoService.findByFecha).toHaveBeenCalledWith(fecha);
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

      mockReportesAseoService.update.mockResolvedValue(reporteActualizado);

      // Act
      const resultado = await controller.update(
        reporteId,
        mockUpdateReportesAseoDto,
      );

      // Assert
      expect(resultado).toEqual(reporteActualizado);
      expect(reportesAseoService.update).toHaveBeenCalledTimes(1);
      expect(reportesAseoService.update).toHaveBeenCalledWith(
        1,
        mockUpdateReportesAseoDto,
      );
    });

    it('debería propagar error cuando el reporte no existe para actualización', async () => {
      // Arrange
      const reporteId = 999;
      const errorEsperado = new Error('Reporte no encontrado');

      mockReportesAseoService.update.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(
        controller.update(reporteId, mockUpdateReportesAseoDto),
      ).rejects.toThrow('Reporte no encontrado');
      expect(reportesAseoService.update).toHaveBeenCalledWith(
        999,
        mockUpdateReportesAseoDto,
      );
    });
  });

  // ================================================================
  // REMOVE - Eliminar reporte
  // ================================================================
  describe('remove', () => {
    it('debería eliminar un reporte exitosamente', async () => {
      // Arrange
      const reporteId = 1;
      const reporteEliminado = { ...mockReporteAseo, deleted: true };

      mockReportesAseoService.remove.mockResolvedValue(reporteEliminado);

      // Act
      const resultado = await controller.remove(reporteId);

      // Assert
      expect(resultado).toEqual(reporteEliminado);
      expect(reportesAseoService.remove).toHaveBeenCalledTimes(1);
      expect(reportesAseoService.remove).toHaveBeenCalledWith(1);
    });

    it('debería propagar error cuando el reporte no existe para eliminación', async () => {
      // Arrange
      const reporteId = 999;
      const errorEsperado = new Error('Reporte no encontrado');

      mockReportesAseoService.remove.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(controller.remove(reporteId)).rejects.toThrow(
        'Reporte no encontrado',
      );
      expect(reportesAseoService.remove).toHaveBeenCalledWith(999);
    });
  });

  // ================================================================
  // GENERAR REPORTE - Generar reporte automático
  // ================================================================
  describe('generarReporte', () => {
    it('debería generar un reporte automático exitosamente', async () => {
      // Arrange
      const fecha = '2024-01-15';
      const reporteGenerado = { ...mockReporteAseo, id: 2 };

      mockReportesAseoService.generarReporte.mockResolvedValue(reporteGenerado);

      // Act
      const resultado = await controller.generarReporte({ fecha });

      // Assert
      expect(resultado).toEqual(reporteGenerado);
      expect(reportesAseoService.generarReporte).toHaveBeenCalledTimes(1);
      expect(reportesAseoService.generarReporte).toHaveBeenCalledWith(fecha);
    });

    it('debería propagar error cuando ya existe reporte para la fecha', async () => {
      // Arrange
      const fecha = '2024-01-15';
      const errorEsperado = new Error('Ya existe un reporte para esta fecha');

      mockReportesAseoService.generarReporte.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(controller.generarReporte({ fecha })).rejects.toThrow(
        'Ya existe un reporte para esta fecha',
      );
      expect(reportesAseoService.generarReporte).toHaveBeenCalledWith(fecha);
    });
  });

  // ================================================================
  // Casos de borde y validaciones
  // ================================================================
  describe('Casos de borde y validaciones', () => {
    it('debería convertir IDs de string a number correctamente', async () => {
      // Arrange
      const reporteIdString = '42';
      const reporteEsperado = { ...mockReporteAseo, id: 42 };

      mockReportesAseoService.findOne.mockResolvedValue(reporteEsperado);

      // Act
      await controller.findOne(Number(reporteIdString));

      // Assert
      expect(reportesAseoService.findOne).toHaveBeenCalledWith(42);
    });

    it('debería manejar múltiples llamadas independientes', async () => {
      // Arrange
      const filtrosDto: FiltrosReportesAseoDto = { page: 1, limit: 10 };
      const respuesta = { data: [], meta: {} };

      mockReportesAseoService.findAll.mockResolvedValue(respuesta);

      // Act
      await controller.findAll(filtrosDto);
      await controller.findAll(filtrosDto);
      await controller.findAll(filtrosDto);

      // Assert
      expect(reportesAseoService.findAll).toHaveBeenCalledTimes(3);
      expect(reportesAseoService.findAll).toHaveBeenNthCalledWith(
        1,
        filtrosDto,
      );
      expect(reportesAseoService.findAll).toHaveBeenNthCalledWith(
        2,
        filtrosDto,
      );
      expect(reportesAseoService.findAll).toHaveBeenNthCalledWith(
        3,
        filtrosDto,
      );
    });

    it('debería mantener estructura de respuesta de paginación', async () => {
      // Arrange
      const filtrosDto: FiltrosReportesAseoDto = { page: 2, limit: 5 };
      const respuestaPaginada = {
        data: [{ id: 1 }, { id: 2 }],
        meta: { page: 2, limit: 5, total: 15, lastPage: 3 },
      };

      mockReportesAseoService.findAll.mockResolvedValue(respuestaPaginada);

      // Act
      const resultado = await controller.findAll(filtrosDto);

      // Assert
      expect(resultado).toHaveProperty('data');
      expect(resultado).toHaveProperty('meta');
      expect(resultado.meta).toHaveProperty('page');
      expect(resultado.meta).toHaveProperty('limit');
      expect(resultado.meta).toHaveProperty('total');
      expect(resultado.meta).toHaveProperty('lastPage');
    });

    it('debería propagar diferentes tipos de errores del servicio', async () => {
      // Arrange
      const reporteId = 1;
      const errores = [
        new Error('Error de conexión a BD'),
        new Error('Error de validación'),
        new Error('Error interno del servidor'),
      ];

      // Act & Assert
      for (const error of errores) {
        mockReportesAseoService.findOne.mockRejectedValue(error);

        await expect(controller.findOne(reporteId)).rejects.toThrow(
          error.message,
        );
      }

      expect(reportesAseoService.findOne).toHaveBeenCalledTimes(errores.length);
    });

    it('debería manejar filtros complejos correctamente', async () => {
      // Arrange
      const filtrosComplejos: FiltrosReportesAseoDto = {
        page: 1,
        limit: 10,
        fecha_inicio: '2024-01-01',
        fecha_fin: '2024-01-31',
        elemento_aseo: 'Aspiradora',
        producto_quimico: 'Desinfectante',
      };

      const respuestaFiltrada = {
        data: [mockReporteAseo],
        meta: { page: 1, limit: 10, total: 1, lastPage: 1 },
      };

      mockReportesAseoService.findAll.mockResolvedValue(respuestaFiltrada);

      // Act
      const resultado = await controller.findAll(filtrosComplejos);

      // Assert
      expect(resultado).toEqual(respuestaFiltrada);
      expect(reportesAseoService.findAll).toHaveBeenCalledWith(
        filtrosComplejos,
      );
    });
  });
});
