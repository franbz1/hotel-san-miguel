import { Test, TestingModule } from '@nestjs/testing';
import { RegistroAseoZonasComunesService } from './registro-aseo-zonas-comunes.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateRegistroAseoZonaComunDto } from './dto/create-registro-aseo-zonas-comune.dto';
import { UpdateRegistroAseoZonaComunDto } from './dto/update-registro-aseo-zonas-comune.dto';
import { FiltrosRegistroAseoZonaComunDto } from './dto/filtros-registro-aseo-zona-comun.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { TiposAseo } from 'src/common/enums/tipos-aseo.enum';
import { ConfiguracionAseoService } from 'src/configuracion-aseo/configuracion-aseo.service';

describe('RegistroAseoZonasComunesService', () => {
  let service: RegistroAseoZonasComunesService;

  // Mock de PrismaService
  const mockPrismaService = {
    registroAseoZonaComun: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  // Mock de ConfiguracionAseoService
  const mockConfiguracionAseoService = {
    obtenerConfiguracion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistroAseoZonasComunesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfiguracionAseoService,
          useValue: mockConfiguracionAseoService,
        },
      ],
    }).compile();

    service = module.get<RegistroAseoZonasComunesService>(
      RegistroAseoZonasComunesService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición del servicio', () => {
    it('debería estar definido', () => {
    expect(service).toBeDefined();
    });
  });

  describe('create', () => {
    const createRegistroDto: CreateRegistroAseoZonaComunDto = {
      usuarioId: 1,
      zonaComunId: 1,
      fecha_registro: '2024-01-15T10:30:00Z',
      tipos_realizados: [TiposAseo.LIMPIEZA, TiposAseo.DESINFECCION],
      objetos_perdidos: false,
      rastros_de_animales: false,
    };

    const registroCreado = {
      id: 1,
      ...createRegistroDto,
      fecha_registro: new Date('2024-01-15T10:30:00Z'),
      observaciones: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false,
    };

    const mockZonaComun = {
      id: 1,
      nombre: 'Lobby',
      ultimo_aseo_fecha: new Date('2024-01-14T10:00:00Z'),
      ultimo_aseo_tipo: TiposAseo.LIMPIEZA,
      requerido_aseo_hoy: true,
    };

    beforeEach(() => {
      // Configurar mock de transacción por defecto
      const mockTransaction = {
        registroAseoZonaComun: {
          create: jest.fn().mockResolvedValue(registroCreado),
        },
        zonaComun: {
          findUnique: jest.fn().mockResolvedValue(mockZonaComun),
          update: jest.fn().mockResolvedValue(mockZonaComun),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });
    });

    it('debería crear un registro de aseo de zona común correctamente', async () => {
      // Act
      const resultado = await service.create(createRegistroDto);

      // Assert
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(registroCreado);
    });

    it('debería lanzar BadRequestException cuando ocurre un error en la creación', async () => {
      // Arrange
      mockPrismaService.$transaction.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.create(createRegistroDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createRegistroDto)).rejects.toThrow(
        'Error al crear registro de aseo de zona común',
      );
    });

    it('debería manejar la creación con datos opcionales completos', async () => {
      // Arrange
      const createDtoCompleto: CreateRegistroAseoZonaComunDto = {
        usuarioId: 2,
        zonaComunId: 2,
        fecha_registro: '2024-01-16T14:00:00Z',
        tipos_realizados: [TiposAseo.DESINFECCION],
        objetos_perdidos: true,
        rastros_de_animales: false,
        observaciones: 'Se encontró una billetera en el lobby',
      };

      const registroCompletoCreado = {
        id: 2,
        ...createDtoCompleto,
        fecha_registro: new Date('2024-01-16T14:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      const mockTransactionCompleto = {
        registroAseoZonaComun: {
          create: jest.fn().mockResolvedValue(registroCompletoCreado),
        },
        zonaComun: {
          findUnique: jest.fn().mockResolvedValue({ id: 2, nombre: 'Piscina' }),
          update: jest.fn().mockResolvedValue({ id: 2, nombre: 'Piscina' }),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransactionCompleto);
      });

      // Act
      const resultado = await service.create(createDtoCompleto);

      // Assert
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(registroCompletoCreado);
    });

    it('debería actualizar el estado de la zona común al crear un registro', async () => {
      // Arrange
      const mockTransaction = {
        registroAseoZonaComun: {
          create: jest.fn().mockResolvedValue(registroCreado),
        },
        zonaComun: {
          findUnique: jest.fn().mockResolvedValue(mockZonaComun),
          update: jest.fn().mockResolvedValue(mockZonaComun),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      // Act
      const resultado = await service.create(createRegistroDto);

      // Assert
      expect(mockTransaction.registroAseoZonaComun.create).toHaveBeenCalledWith({
        data: createRegistroDto,
        select: expect.any(Object),
      });

      expect(mockTransaction.zonaComun.findUnique).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
      });

      expect(mockTransaction.zonaComun.update).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: {
          ultimo_aseo_fecha: new Date('2024-01-15T10:30:00Z'),
          ultimo_aseo_tipo: TiposAseo.DESINFECCION, // El más relevante según prioridades
          requerido_aseo_hoy: false,
        },
      });

      expect(resultado).toEqual(registroCreado);
    });

    it('debería determinar correctamente el tipo de aseo más relevante', async () => {
      // Arrange
      const createDtoMultiplesTipos: CreateRegistroAseoZonaComunDto = {
        ...createRegistroDto,
        tipos_realizados: [TiposAseo.LIMPIEZA, TiposAseo.DESINFECCION],
      };

      const mockTransaction = {
        registroAseoZonaComun: {
          create: jest.fn().mockResolvedValue({ id: 1 }),
        },
        zonaComun: {
          findUnique: jest.fn().mockResolvedValue(mockZonaComun),
          update: jest.fn().mockResolvedValue(mockZonaComun),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      // Act
      await service.create(createDtoMultiplesTipos);

      // Assert - Debería elegir DESINFECCION como el más relevante
      expect(mockTransaction.zonaComun.update).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: expect.objectContaining({
          ultimo_aseo_tipo: TiposAseo.DESINFECCION,
        }),
      });
    });

    it('debería lanzar NotFoundException cuando la zona común no existe', async () => {
      // Arrange
      const mockTransaction = {
        registroAseoZonaComun: {
          create: jest.fn().mockResolvedValue(registroCreado),
        },
        zonaComun: {
          findUnique: jest.fn().mockResolvedValue(null), // Zona común no existe
          update: jest.fn(),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      // Act & Assert
      await expect(service.create(createRegistroDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createRegistroDto)).rejects.toThrow(
        'No se encontró el elemento con el ID: 1',
      );
    });

    it('debería usar la fecha del registro para actualizar ultimo_aseo_fecha', async () => {
      // Arrange
      const fechaEspecifica = '2024-01-20T15:45:00Z';
      const createDtoConFecha: CreateRegistroAseoZonaComunDto = {
        ...createRegistroDto,
        fecha_registro: fechaEspecifica,
      };

      const mockTransaction = {
        registroAseoZonaComun: {
          create: jest.fn().mockResolvedValue({ id: 1 }),
        },
        zonaComun: {
          findUnique: jest.fn().mockResolvedValue(mockZonaComun),
          update: jest.fn().mockResolvedValue(mockZonaComun),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      // Act
      await service.create(createDtoConFecha);

      // Assert
      expect(mockTransaction.zonaComun.update).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: expect.objectContaining({
          ultimo_aseo_fecha: new Date(fechaEspecifica),
        }),
      });
    });

    it('debería actualizar campos de desinfección cuando se incluye DESINFECCION en tipos realizados', async () => {
      // Arrange
      const fechaDesinfeccion = '2024-01-15T10:30:00Z';
      const createDtoConDesinfeccion: CreateRegistroAseoZonaComunDto = {
        ...createRegistroDto,
        tipos_realizados: [TiposAseo.DESINFECCION],
        fecha_registro: fechaDesinfeccion,
      };

      const mockConfiguracion = {
        id: 1,
        frecuencia_desinfeccion_zona_comun: 7, // 7 días
        hora_limite_aseo: '17:00',
        hora_proceso_nocturno_utc: '05:00',
        frecuencia_rotacion_colchones: 180,
        dias_aviso_rotacion_colchones: 5,
        habilitar_notificaciones: false,
        elementos_aseo_default: [],
        elementos_proteccion_default: [],
        productos_quimicos_default: [],
        areas_intervenir_habitacion_default: [],
        areas_intervenir_banio_default: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      mockConfiguracionAseoService.obtenerConfiguracion.mockResolvedValue(
        mockConfiguracion,
      );

      const fechaEsperada = new Date('2024-01-15T10:30:00Z');
      const proximaDesinfeccionEsperada = new Date('2024-01-22T10:30:00Z'); // +7 días

      const mockTransaction = {
        registroAseoZonaComun: {
          create: jest.fn().mockResolvedValue({ id: 1 }),
        },
        zonaComun: {
          findUnique: jest.fn().mockResolvedValue(mockZonaComun),
          update: jest.fn().mockResolvedValue(mockZonaComun),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      // Act
      await service.create(createDtoConDesinfeccion);

      // Assert
      expect(mockConfiguracionAseoService.obtenerConfiguracion).toHaveBeenCalledTimes(1);
      expect(mockTransaction.zonaComun.update).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: {
          ultimo_aseo_fecha: fechaEsperada,
          ultimo_aseo_tipo: TiposAseo.DESINFECCION,
          requerido_aseo_hoy: false,
          ultima_desinfeccion: fechaEsperada,
          proxima_desinfeccion: proximaDesinfeccionEsperada,
          requerido_desinfeccion: false,
        },
      });
    });

    it('debería NO actualizar campos de desinfección cuando NO se incluye DESINFECCION', async () => {
      // Arrange
      const createDtoSoloLimpieza: CreateRegistroAseoZonaComunDto = {
        ...createRegistroDto,
        tipos_realizados: [TiposAseo.LIMPIEZA],
      };

      const mockTransaction = {
        registroAseoZonaComun: {
          create: jest.fn().mockResolvedValue({ id: 1 }),
        },
        zonaComun: {
          findUnique: jest.fn().mockResolvedValue(mockZonaComun),
          update: jest.fn().mockResolvedValue(mockZonaComun),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      // Act
      await service.create(createDtoSoloLimpieza);

      // Assert
      expect(mockConfiguracionAseoService.obtenerConfiguracion).not.toHaveBeenCalled();
      expect(mockTransaction.zonaComun.update).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: {
          ultimo_aseo_fecha: new Date('2024-01-15T10:30:00Z'),
          ultimo_aseo_tipo: TiposAseo.LIMPIEZA,
          requerido_aseo_hoy: false,
        },
      });
    });

    it('debería calcular correctamente la próxima desinfección con diferentes frecuencias', async () => {
      // Arrange
      const fechaBase = '2024-02-01T14:00:00Z';
      const createDtoDesinfeccion: CreateRegistroAseoZonaComunDto = {
        ...createRegistroDto,
        tipos_realizados: [TiposAseo.DESINFECCION],
        fecha_registro: fechaBase,
      };

      const mockConfiguracionConFrecuencia14 = {
        id: 1,
        frecuencia_desinfeccion_zona_comun: 14, // 14 días
        hora_limite_aseo: '17:00',
        hora_proceso_nocturno_utc: '05:00',
        frecuencia_rotacion_colchones: 180,
        dias_aviso_rotacion_colchones: 5,
        habilitar_notificaciones: false,
        elementos_aseo_default: [],
        elementos_proteccion_default: [],
        productos_quimicos_default: [],
        areas_intervenir_habitacion_default: [],
        areas_intervenir_banio_default: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      mockConfiguracionAseoService.obtenerConfiguracion.mockResolvedValue(
        mockConfiguracionConFrecuencia14,
      );

      const fechaEsperada = new Date('2024-02-01T14:00:00Z');
      const proximaDesinfeccionEsperada = new Date('2024-02-15T14:00:00Z'); // +14 días

      const mockTransaction = {
        registroAseoZonaComun: {
          create: jest.fn().mockResolvedValue({ id: 1 }),
        },
        zonaComun: {
          findUnique: jest.fn().mockResolvedValue(mockZonaComun),
          update: jest.fn().mockResolvedValue(mockZonaComun),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      // Act
      await service.create(createDtoDesinfeccion);

      // Assert
      expect(mockTransaction.zonaComun.update).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: expect.objectContaining({
          proxima_desinfeccion: proximaDesinfeccionEsperada,
        }),
      });
    });

    it('debería manejar desinfección con múltiples tipos de aseo realizados', async () => {
      // Arrange
      const createDtoMultiplesTipos: CreateRegistroAseoZonaComunDto = {
        ...createRegistroDto,
        tipos_realizados: [TiposAseo.LIMPIEZA, TiposAseo.DESINFECCION],
      };

      const mockConfiguracion = {
        id: 1,
        frecuencia_desinfeccion_zona_comun: 10,
        hora_limite_aseo: '17:00',
        hora_proceso_nocturno_utc: '05:00',
        frecuencia_rotacion_colchones: 180,
        dias_aviso_rotacion_colchones: 5,
        habilitar_notificaciones: false,
        elementos_aseo_default: [],
        elementos_proteccion_default: [],
        productos_quimicos_default: [],
        areas_intervenir_habitacion_default: [],
        areas_intervenir_banio_default: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      mockConfiguracionAseoService.obtenerConfiguracion.mockResolvedValue(
        mockConfiguracion,
      );

      const mockTransaction = {
        registroAseoZonaComun: {
          create: jest.fn().mockResolvedValue({ id: 1 }),
        },
        zonaComun: {
          findUnique: jest.fn().mockResolvedValue(mockZonaComun),
          update: jest.fn().mockResolvedValue(mockZonaComun),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      // Act
      await service.create(createDtoMultiplesTipos);

      // Assert
      expect(mockTransaction.zonaComun.update).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: expect.objectContaining({
          ultimo_aseo_tipo: TiposAseo.DESINFECCION, // El más relevante
          ultima_desinfeccion: new Date('2024-01-15T10:30:00Z'),
          proxima_desinfeccion: expect.any(Date),
          requerido_desinfeccion: false,
                 }),
       });
     });

     it('debería manejar errores al obtener la configuración de aseo', async () => {
       // Arrange
       const createDtoConDesinfeccion: CreateRegistroAseoZonaComunDto = {
         ...createRegistroDto,
         tipos_realizados: [TiposAseo.DESINFECCION],
       };

       mockConfiguracionAseoService.obtenerConfiguracion.mockRejectedValue(
         new Error('Error al obtener configuración'),
       );

       const mockTransaction = {
         registroAseoZonaComun: {
           create: jest.fn().mockResolvedValue({ id: 1 }),
         },
         zonaComun: {
           findUnique: jest.fn().mockResolvedValue(mockZonaComun),
           update: jest.fn(),
         },
       };

       mockPrismaService.$transaction.mockImplementation(async (callback) => {
         return await callback(mockTransaction);
       });

       // Act & Assert
       await expect(service.create(createDtoConDesinfeccion)).rejects.toThrow(
         BadRequestException,
       );
       await expect(service.create(createDtoConDesinfeccion)).rejects.toThrow(
         'Error al crear registro de aseo de zona común',
       );
     });
   });

  describe('findAll', () => {
    const paginationDto: PaginationDto = { page: 1, limit: 10 };
    const filtrosDto: FiltrosRegistroAseoZonaComunDto = {};

    const registrosAseo = [
      {
        id: 1,
        usuarioId: 1,
        zonaComunId: 1,
        fecha_registro: new Date('2024-01-15T10:30:00Z'),
        tipos_realizados: [TiposAseo.LIMPIEZA],
        objetos_perdidos: false,
        rastros_de_animales: false,
        observaciones: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        usuarioId: 2,
        zonaComunId: 2,
        fecha_registro: new Date('2024-01-16T14:00:00Z'),
        tipos_realizados: [TiposAseo.DESINFECCION],
        objetos_perdidos: true,
        rastros_de_animales: false,
        observaciones: 'Objeto perdido encontrado en recepción',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('debería obtener todos los registros con paginación', async () => {
      // Arrange
      mockPrismaService.registroAseoZonaComun.count.mockResolvedValue(2);
      mockPrismaService.registroAseoZonaComun.findMany.mockResolvedValue(
        registrosAseo,
      );

      // Act
      const resultado = await service.findAll(paginationDto, filtrosDto);

      // Assert
      expect(
        mockPrismaService.registroAseoZonaComun.count,
      ).toHaveBeenCalledWith({
        where: { deleted: false },
      });
      expect(
        mockPrismaService.registroAseoZonaComun.findMany,
      ).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { deleted: false },
        select: {
          id: true,
          usuarioId: true,
          zonaComunId: true,
          fecha_registro: true,
          tipos_realizados: true,
          objetos_perdidos: true,
          rastros_de_animales: true,
          observaciones: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { fecha_registro: 'desc' },
      });
      expect(resultado).toEqual({
        data: registrosAseo,
        meta: { page: 1, limit: 10, total: 2, lastPage: 1 },
      });
    });

    it('debería aplicar filtros correctamente', async () => {
      // Arrange
      const filtrosConDatos: FiltrosRegistroAseoZonaComunDto = {
        usuarioId: 1,
        zonaComunId: 1,
        fecha: '2024-01-15',
        tipo_aseo: TiposAseo.LIMPIEZA,
        objetos_perdidos: false,
        rastros_de_animales: false,
      };

      mockPrismaService.registroAseoZonaComun.count.mockResolvedValue(1);
      mockPrismaService.registroAseoZonaComun.findMany.mockResolvedValue([
        registrosAseo[0],
      ]);

      // Act
      const resultado = await service.findAll(paginationDto, filtrosConDatos);

      // Assert
      expect(
        mockPrismaService.registroAseoZonaComun.count,
      ).toHaveBeenCalledWith({
        where: {
          deleted: false,
          usuarioId: 1,
          zonaComunId: 1,
          fecha_registro: {
            gte: new Date('2024-01-15T00:00:00.000Z'),
            lt: new Date('2024-01-16T00:00:00.000Z'),
          },
          tipos_realizados: {
            has: TiposAseo.LIMPIEZA,
          },
          objetos_perdidos: false,
          rastros_de_animales: false,
        },
      });
    });

    it('debería retornar respuesta vacía cuando no hay registros', async () => {
      // Arrange
      mockPrismaService.registroAseoZonaComun.count.mockResolvedValue(0);

      // Act
      const resultado = await service.findAll(paginationDto, filtrosDto);

      // Assert
      expect(resultado).toEqual({
        data: [],
        meta: { page: 1, limit: 10, total: 0, lastPage: 0 },
      });
      expect(
        mockPrismaService.registroAseoZonaComun.findMany,
      ).not.toHaveBeenCalled();
    });

    it('debería manejar paginación en página superior al límite', async () => {
      // Arrange
      const paginacionFueraDeLimite: PaginationDto = { page: 5, limit: 10 };
      mockPrismaService.registroAseoZonaComun.count.mockResolvedValue(2);

      // Act
      const resultado = await service.findAll(
        paginacionFueraDeLimite,
        filtrosDto,
      );

      // Assert
      expect(resultado).toEqual({
        data: [],
        meta: { page: 5, limit: 10, total: 2, lastPage: 1 },
      });
      expect(
        mockPrismaService.registroAseoZonaComun.findMany,
      ).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const registroEncontrado = {
      id: 1,
      usuarioId: 1,
      zonaComunId: 1,
      fecha_registro: new Date('2024-01-15T10:30:00Z'),
      tipos_realizados: [TiposAseo.LIMPIEZA],
      objetos_perdidos: false,
      rastros_de_animales: false,
      observaciones: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('debería obtener un registro por ID correctamente', async () => {
      // Arrange
      mockPrismaService.registroAseoZonaComun.findFirst.mockResolvedValue(
        registroEncontrado,
      );

      // Act
      const resultado = await service.findOne(1);

      // Assert
      expect(
        mockPrismaService.registroAseoZonaComun.findFirst,
      ).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        select: {
          id: true,
          usuarioId: true,
          zonaComunId: true,
          fecha_registro: true,
          tipos_realizados: true,
          objetos_perdidos: true,
          rastros_de_animales: true,
          observaciones: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(resultado).toEqual(registroEncontrado);
    });

    it('debería lanzar NotFoundException cuando el registro no existe', async () => {
      // Arrange
      mockPrismaService.registroAseoZonaComun.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'No se encontró el elemento con el ID: 999',
      );
    });

    it('debería manejar errores inesperados', async () => {
      // Arrange
      mockPrismaService.registroAseoZonaComun.findFirst.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.findOne(1)).rejects.toThrow(Error);
    });
  });

  describe('update', () => {
    const updateRegistroDto: UpdateRegistroAseoZonaComunDto = {
      tipos_realizados: [TiposAseo.LIMPIEZA, TiposAseo.DESINFECCION],
      observaciones: 'Aseo completado satisfactoriamente',
    };

    const registroActualizado = {
      id: 1,
      usuarioId: 1,
      zonaComunId: 1,
      fecha_registro: new Date('2024-01-15T10:30:00Z'),
      ...updateRegistroDto,
      objetos_perdidos: false,
      rastros_de_animales: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('debería actualizar un registro correctamente', async () => {
      // Arrange
      mockPrismaService.registroAseoZonaComun.update.mockResolvedValue(
        registroActualizado,
      );

      // Act
      const resultado = await service.update(1, updateRegistroDto);

      // Assert
      expect(
        mockPrismaService.registroAseoZonaComun.update,
      ).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: updateRegistroDto,
        select: {
          id: true,
          usuarioId: true,
          zonaComunId: true,
          fecha_registro: true,
          tipos_realizados: true,
          objetos_perdidos: true,
          rastros_de_animales: true,
          observaciones: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(resultado).toEqual(registroActualizado);
    });

    it('debería lanzar BadRequestException cuando no se proporcionan datos para actualizar', async () => {
      // Arrange
      const updateDtoVacio: UpdateRegistroAseoZonaComunDto = {};

      // Act & Assert
      await expect(service.update(1, updateDtoVacio)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(1, updateDtoVacio)).rejects.toThrow(
        'Debe enviar datos para actualizar el registro de aseo',
      );
    });

    it('debería lanzar NotFoundException cuando el registro no existe', async () => {
      // Arrange
      mockPrismaService.registroAseoZonaComun.update.mockRejectedValue({
        code: 'P2025',
      });

      // Act & Assert
      await expect(service.update(999, updateRegistroDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(999, updateRegistroDto)).rejects.toThrow(
        'No se encontró el elemento con el ID: 999',
      );
    });

    it('debería manejar errores inesperados durante la actualización', async () => {
      // Arrange
      mockPrismaService.registroAseoZonaComun.update.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.update(1, updateRegistroDto)).rejects.toThrow(Error);
    });
  });

  describe('remove', () => {
    const registroEliminado = {
      id: 1,
      usuarioId: 1,
      zonaComunId: 1,
      fecha_registro: new Date('2024-01-15T10:30:00Z'),
      tipos_realizados: [TiposAseo.LIMPIEZA],
      objetos_perdidos: false,
      rastros_de_animales: false,
      observaciones: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('debería eliminar (soft delete) un registro correctamente', async () => {
      // Arrange
      mockPrismaService.registroAseoZonaComun.update.mockResolvedValue(
        registroEliminado,
      );

      // Act
      const resultado = await service.remove(1);

      // Assert
      expect(
        mockPrismaService.registroAseoZonaComun.update,
      ).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: { deleted: true },
        select: {
          id: true,
          usuarioId: true,
          zonaComunId: true,
          fecha_registro: true,
          tipos_realizados: true,
          objetos_perdidos: true,
          rastros_de_animales: true,
          observaciones: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(resultado).toEqual(registroEliminado);
    });

    it('debería lanzar NotFoundException cuando el registro no existe', async () => {
      // Arrange
      mockPrismaService.registroAseoZonaComun.update.mockRejectedValue({
        code: 'P2025',
      });

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow(
        'No se encontró el elemento con el ID: 999',
      );
    });

    it('debería manejar errores inesperados durante la eliminación', async () => {
      // Arrange
      mockPrismaService.registroAseoZonaComun.update.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.remove(1)).rejects.toThrow(Error);
    });
  });

  describe('findByZonaComun', () => {
    const registrosDeZonaComun = [
      {
        id: 1,
        usuarioId: 1,
        zonaComunId: 1,
        fecha_registro: new Date('2024-01-15T10:30:00Z'),
        tipos_realizados: [TiposAseo.LIMPIEZA],
        objetos_perdidos: false,
        rastros_de_animales: false,
        observaciones: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('debería obtener registros por zona común correctamente', async () => {
      // Arrange
      mockPrismaService.registroAseoZonaComun.findMany.mockResolvedValue(
        registrosDeZonaComun,
      );

      // Act
      const resultado = await service.findByZonaComun(1);

      // Assert
      expect(
        mockPrismaService.registroAseoZonaComun.findMany,
      ).toHaveBeenCalledWith({
        where: { zonaComunId: 1, deleted: false },
        select: {
          id: true,
          usuarioId: true,
          zonaComunId: true,
          fecha_registro: true,
          tipos_realizados: true,
          objetos_perdidos: true,
          rastros_de_animales: true,
          observaciones: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { fecha_registro: 'desc' },
      });
      expect(resultado).toEqual(registrosDeZonaComun);
    });

    it('debería retornar array vacío cuando no hay registros para la zona común', async () => {
      // Arrange
      mockPrismaService.registroAseoZonaComun.findMany.mockResolvedValue([]);

      // Act
      const resultado = await service.findByZonaComun(999);

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  describe('findByUsuario', () => {
    const registrosDelUsuario = [
      {
        id: 1,
        usuarioId: 1,
        zonaComunId: 1,
        fecha_registro: new Date('2024-01-15T10:30:00Z'),
        tipos_realizados: [TiposAseo.LIMPIEZA],
        objetos_perdidos: false,
        rastros_de_animales: false,
        observaciones: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('debería obtener registros por usuario correctamente', async () => {
      // Arrange
      mockPrismaService.registroAseoZonaComun.findMany.mockResolvedValue(
        registrosDelUsuario,
      );

      // Act
      const resultado = await service.findByUsuario(1);

      // Assert
      expect(
        mockPrismaService.registroAseoZonaComun.findMany,
      ).toHaveBeenCalledWith({
        where: { usuarioId: 1, deleted: false },
        select: {
          id: true,
          usuarioId: true,
          zonaComunId: true,
          fecha_registro: true,
          tipos_realizados: true,
          objetos_perdidos: true,
          rastros_de_animales: true,
          observaciones: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { fecha_registro: 'desc' },
      });
      expect(resultado).toEqual(registrosDelUsuario);
    });

    it('debería retornar array vacío cuando no hay registros para el usuario', async () => {
      // Arrange
      mockPrismaService.registroAseoZonaComun.findMany.mockResolvedValue([]);

      // Act
      const resultado = await service.findByUsuario(999);

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  describe('findByFecha', () => {
    const registrosDeLaFecha = [
      {
        id: 1,
        usuarioId: 1,
        zonaComunId: 1,
        fecha_registro: new Date('2024-01-15T10:30:00Z'),
        tipos_realizados: [TiposAseo.LIMPIEZA],
        objetos_perdidos: false,
        rastros_de_animales: false,
        observaciones: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('debería obtener registros por fecha correctamente', async () => {
      // Arrange
      mockPrismaService.registroAseoZonaComun.findMany.mockResolvedValue(
        registrosDeLaFecha,
      );

      // Act
      const resultado = await service.findByFecha('2024-01-15');

      // Assert
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
        select: {
          id: true,
          usuarioId: true,
          zonaComunId: true,
          fecha_registro: true,
          tipos_realizados: true,
          objetos_perdidos: true,
          rastros_de_animales: true,
          observaciones: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { fecha_registro: 'desc' },
      });
      expect(resultado).toEqual(registrosDeLaFecha);
    });

    it('debería retornar array vacío cuando no hay registros para la fecha', async () => {
      // Arrange
      mockPrismaService.registroAseoZonaComun.findMany.mockResolvedValue([]);

      // Act
      const resultado = await service.findByFecha('2024-12-31');

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  describe('Integración con documentación API', () => {
    it('debería cumplir con el contrato de creación de registro', async () => {
      // Arrange
      const createDto: CreateRegistroAseoZonaComunDto = {
        usuarioId: 1,
        zonaComunId: 1,
        fecha_registro: '2024-01-15T10:30:00Z',
        tipos_realizados: [TiposAseo.LIMPIEZA],
        objetos_perdidos: false,
        rastros_de_animales: false,
      };

      const registroCreado = {
        id: 1,
        ...createDto,
        fecha_registro: new Date('2024-01-15T10:30:00Z'),
        observaciones: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      mockPrismaService.registroAseoZonaComun.create.mockResolvedValue(
        registroCreado,
      );

      // Act
      const resultado = await service.create(createDto);

      // Assert
      expect(resultado).toMatchObject({
        id: expect.any(Number),
        usuarioId: expect.any(Number),
        zonaComunId: expect.any(Number),
        fecha_registro: expect.any(Date),
        tipos_realizados: expect.any(Array),
        objetos_perdidos: expect.any(Boolean),
        rastros_de_animales: expect.any(Boolean),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('debería cumplir con el contrato de listado con paginación', async () => {
      // Arrange
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const filtrosDto: FiltrosRegistroAseoZonaComunDto = {};

      mockPrismaService.registroAseoZonaComun.count.mockResolvedValue(5);
      mockPrismaService.registroAseoZonaComun.findMany.mockResolvedValue([]);

      // Act
      const resultado = await service.findAll(paginationDto, filtrosDto);

      // Assert
      expect(resultado).toMatchObject({
        data: expect.any(Array),
        meta: {
          page: expect.any(Number),
          limit: expect.any(Number),
          total: expect.any(Number),
          lastPage: expect.any(Number),
        },
      });
    });
  });
});
