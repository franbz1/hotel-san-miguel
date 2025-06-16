import { Test, TestingModule } from '@nestjs/testing';
import { RegistroAseoHabitacionesService } from './registro-aseo-habitaciones.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateRegistroAseoHabitacionDto } from './dto/create-registro-aseo-habitacion.dto';
import { UpdateRegistroAseoHabitacionDto } from './dto/update-registro-aseo-habitacion.dto';
import { FiltrosRegistroAseoHabitacionDto } from './dto/filtros-registro-aseo-habitacion.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { TiposAseo } from 'src/common/enums/tipos-aseo.enum';
import { ConfiguracionAseoService } from 'src/configuracion-aseo/configuracion-aseo.service';

describe('RegistroAseoHabitacionesService', () => {
  let service: RegistroAseoHabitacionesService;

  // Mock de PrismaService
  const mockPrismaService = {
    registroAseoHabitacion: {
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
        RegistroAseoHabitacionesService,
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

    service = module.get<RegistroAseoHabitacionesService>(
      RegistroAseoHabitacionesService,
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
    const createRegistroDto: CreateRegistroAseoHabitacionDto = {
      usuarioId: 1,
      habitacionId: 101,
      fecha_registro: '2024-01-15T10:30:00Z',
      areas_intervenidas: ['Cama', 'Escritorio', 'Ventanas'],
      areas_intervenidas_banio: ['Lavamanos', 'Ducha', 'Inodoro'],
      tipos_realizados: [TiposAseo.LIMPIEZA, TiposAseo.LIMPIEZA_BANIO],
      objetos_perdidos: false,
      rastros_de_animales: false,
    };

    const registroCreado = {
      id: 1,
      ...createRegistroDto,
      fecha_registro: new Date('2024-01-15T10:30:00Z'),
      procedimiento_rotacion_colchones: null,
      observaciones: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false,
    };

    const mockHabitacion = {
      id: 101,
      numero_habitacion: 101,
      ultimo_aseo_fecha: new Date('2024-01-14T10:00:00Z'),
      ultimo_aseo_tipo: TiposAseo.LIMPIEZA,
      requerido_aseo_hoy: true,
    };

    const mockConfiguracion = {
      id: 1,
      frecuencia_rotacion_colchones: 180,
      dias_aviso_rotacion_colchones: 5,
    };

    beforeEach(() => {
      // Configurar mock de transacción por defecto
      const mockTransaction = {
        registroAseoHabitacion: {
          create: jest.fn().mockResolvedValue(registroCreado),
        },
        habitacion: {
          findUnique: jest.fn().mockResolvedValue(mockHabitacion),
          update: jest.fn().mockResolvedValue(mockHabitacion),
        },
        configuracionAseo: {
          findFirst: jest.fn().mockResolvedValue(mockConfiguracion),
          create: jest.fn().mockResolvedValue(mockConfiguracion),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });
    });

    it('debería crear un registro de aseo de habitación correctamente', async () => {
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
        'Error al crear registro de aseo de habitación',
      );
    });

    it('debería actualizar el estado de la habitación al crear un registro', async () => {
      // Arrange
      const mockTransaction = {
        registroAseoHabitacion: {
          create: jest.fn().mockResolvedValue(registroCreado),
        },
        habitacion: {
          findUnique: jest.fn().mockResolvedValue(mockHabitacion),
          update: jest.fn().mockResolvedValue(mockHabitacion),
        },
        configuracionAseo: {
          findFirst: jest.fn().mockResolvedValue(mockConfiguracion),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      // Act
      const resultado = await service.create(createRegistroDto);

      // Assert
      expect(
        mockTransaction.registroAseoHabitacion.create,
      ).toHaveBeenCalledWith({
        data: createRegistroDto,
        select: expect.any(Object),
      });

      expect(mockTransaction.habitacion.findUnique).toHaveBeenCalledWith({
        where: { id: 101, deleted: false },
      });

      expect(mockTransaction.habitacion.update).toHaveBeenCalledWith({
        where: { id: 101, deleted: false },
        data: {
          ultimo_aseo_fecha: new Date('2024-01-15T10:30:00Z'),
          ultimo_aseo_tipo: TiposAseo.LIMPIEZA_BANIO, // El más relevante según prioridades
          requerido_aseo_hoy: false,
        },
      });

      expect(resultado).toEqual(registroCreado);
    });

    it('debería manejar rotación de colchones y calcular próxima fecha', async () => {
      // Arrange
      const createDtoConRotacion: CreateRegistroAseoHabitacionDto = {
        ...createRegistroDto,
        tipos_realizados: [TiposAseo.LIMPIEZA, TiposAseo.ROTACION_COLCHONES],
        procedimiento_rotacion_colchones: 'Rotación 180° del colchón',
      };

      const mockConfiguracionCompleta = {
        id: 1,
        frecuencia_rotacion_colchones: 180, // 180 días
        dias_aviso_rotacion_colchones: 5,
        hora_limite_aseo: '17:00',
        hora_proceso_nocturno_utc: '05:00',
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
        mockConfiguracionCompleta,
      );

      const fechaRegistro = new Date('2024-01-15T10:30:00Z');
      const proximaRotacionEsperada = new Date('2024-07-13T10:30:00Z'); // +180 días

      const mockTransaction = {
        registroAseoHabitacion: {
          create: jest.fn().mockResolvedValue({ id: 1 }),
        },
        habitacion: {
          findUnique: jest.fn().mockResolvedValue(mockHabitacion),
          update: jest.fn().mockResolvedValue(mockHabitacion),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      // Act
      await service.create(createDtoConRotacion);

      // Assert
      expect(mockConfiguracionAseoService.obtenerConfiguracion).toHaveBeenCalledTimes(1);
      expect(mockTransaction.habitacion.update).toHaveBeenCalledWith({
        where: { id: 101, deleted: false },
        data: {
          ultimo_aseo_fecha: fechaRegistro,
          ultimo_aseo_tipo: TiposAseo.ROTACION_COLCHONES, // Máxima prioridad
          requerido_aseo_hoy: false,
          ultima_rotacion_colchones: fechaRegistro,
          proxima_rotacion_colchones: proximaRotacionEsperada,
          requerido_rotacion_colchones: false,
        },
      });
    });

    it('debería NO actualizar campos de rotación cuando NO se incluye ROTACION_COLCHONES', async () => {
      // Arrange
      const createDtoSinRotacion: CreateRegistroAseoHabitacionDto = {
        ...createRegistroDto,
        tipos_realizados: [TiposAseo.LIMPIEZA, TiposAseo.DESINFECCION],
      };

      const mockTransaction = {
        registroAseoHabitacion: {
          create: jest.fn().mockResolvedValue({ id: 1 }),
        },
        habitacion: {
          findUnique: jest.fn().mockResolvedValue(mockHabitacion),
          update: jest.fn().mockResolvedValue(mockHabitacion),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      // Act
      await service.create(createDtoSinRotacion);

      // Assert
      expect(mockConfiguracionAseoService.obtenerConfiguracion).not.toHaveBeenCalled();
      expect(mockTransaction.habitacion.update).toHaveBeenCalledWith({
        where: { id: 101, deleted: false },
        data: {
          ultimo_aseo_fecha: new Date('2024-01-15T10:30:00Z'),
          ultimo_aseo_tipo: TiposAseo.DESINFECCION, // Mayor prioridad que LIMPIEZA
          requerido_aseo_hoy: false,
        },
      });
    });

    it('debería calcular correctamente la próxima rotación con diferentes frecuencias', async () => {
      // Arrange
      const fechaBase = '2024-02-01T14:00:00Z';
      const createDtoRotacion: CreateRegistroAseoHabitacionDto = {
        ...createRegistroDto,
        tipos_realizados: [TiposAseo.ROTACION_COLCHONES],
        fecha_registro: fechaBase,
        procedimiento_rotacion_colchones: 'Rotación completa del colchón',
      };

      const mockConfiguracionConFrecuencia90 = {
        id: 1,
        frecuencia_rotacion_colchones: 90, // 90 días
        dias_aviso_rotacion_colchones: 5,
        hora_limite_aseo: '17:00',
        hora_proceso_nocturno_utc: '05:00',
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
        mockConfiguracionConFrecuencia90,
      );

      const fechaEsperada = new Date('2024-02-01T14:00:00Z');
      const proximaRotacionEsperada = new Date('2024-05-01T14:00:00Z'); // +90 días

      const mockTransaction = {
        registroAseoHabitacion: {
          create: jest.fn().mockResolvedValue({ id: 1 }),
        },
        habitacion: {
          findUnique: jest.fn().mockResolvedValue(mockHabitacion),
          update: jest.fn().mockResolvedValue(mockHabitacion),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      // Act
      await service.create(createDtoRotacion);

      // Assert
      expect(mockTransaction.habitacion.update).toHaveBeenCalledWith({
        where: { id: 101, deleted: false },
        data: expect.objectContaining({
          proxima_rotacion_colchones: proximaRotacionEsperada,
        }),
      });
    });

    it('debería manejar rotación con múltiples tipos de aseo realizados', async () => {
      // Arrange
      const createDtoMultiplesTipos: CreateRegistroAseoHabitacionDto = {
        ...createRegistroDto,
        tipos_realizados: [
          TiposAseo.LIMPIEZA,
          TiposAseo.DESINFECCION,
          TiposAseo.ROTACION_COLCHONES,
          TiposAseo.LIMPIEZA_BANIO,
        ],
        procedimiento_rotacion_colchones: 'Rotación y desinfección completa',
      };

      const mockConfiguracion = {
        id: 1,
        frecuencia_rotacion_colchones: 120,
        dias_aviso_rotacion_colchones: 5,
        hora_limite_aseo: '17:00',
        hora_proceso_nocturno_utc: '05:00',
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
        registroAseoHabitacion: {
          create: jest.fn().mockResolvedValue({ id: 1 }),
        },
        habitacion: {
          findUnique: jest.fn().mockResolvedValue(mockHabitacion),
          update: jest.fn().mockResolvedValue(mockHabitacion),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      // Act
      await service.create(createDtoMultiplesTipos);

      // Assert
      expect(mockTransaction.habitacion.update).toHaveBeenCalledWith({
        where: { id: 101, deleted: false },
        data: expect.objectContaining({
          ultimo_aseo_tipo: TiposAseo.ROTACION_COLCHONES, // Máxima prioridad (5)
          ultima_rotacion_colchones: new Date('2024-01-15T10:30:00Z'),
          proxima_rotacion_colchones: expect.any(Date),
          requerido_rotacion_colchones: false,
        }),
      });
    });

    it('debería manejar errores al obtener la configuración de aseo', async () => {
      // Arrange
      const createDtoConRotacion: CreateRegistroAseoHabitacionDto = {
        ...createRegistroDto,
        tipos_realizados: [TiposAseo.ROTACION_COLCHONES],
        procedimiento_rotacion_colchones: 'Rotación del colchón',
      };

      mockConfiguracionAseoService.obtenerConfiguracion.mockRejectedValue(
        new Error('Error al obtener configuración'),
      );

      const mockTransaction = {
        registroAseoHabitacion: {
          create: jest.fn().mockResolvedValue({ id: 1 }),
        },
        habitacion: {
          findUnique: jest.fn().mockResolvedValue(mockHabitacion),
          update: jest.fn(),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      // Act & Assert
      await expect(service.create(createDtoConRotacion)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDtoConRotacion)).rejects.toThrow(
        'Error al crear registro de aseo de habitación',
      );
    });

    it('debería crear configuración por defecto si no existe', async () => {
      // Arrange
      const mockTransaction = {
        registroAseoHabitacion: {
          create: jest.fn().mockResolvedValue(registroCreado),
        },
        habitacion: {
          findUnique: jest.fn().mockResolvedValue(mockHabitacion),
          update: jest.fn().mockResolvedValue(mockHabitacion),
        },
        configuracionAseo: {
          findFirst: jest.fn().mockResolvedValue(null), // No existe configuración
          create: jest.fn().mockResolvedValue(mockConfiguracion),
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      // Act
      await service.create(createRegistroDto);

      // Assert
      expect(mockTransaction.configuracionAseo.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          frecuencia_rotacion_colchones: 180,
          dias_aviso_rotacion_colchones: 5,
        }),
      });
    });

    it('debería lanzar NotFoundException cuando la habitación no existe', async () => {
      // Arrange
      const mockTransaction = {
        registroAseoHabitacion: {
          create: jest.fn().mockResolvedValue(registroCreado),
        },
        habitacion: {
          findUnique: jest.fn().mockResolvedValue(null), // Habitación no existe
          update: jest.fn(),
        },
        configuracionAseo: {
          findFirst: jest.fn().mockResolvedValue(mockConfiguracion),
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
        'No se encontró el elemento con el ID: 101',
      );
    });
  });

  describe('findAll', () => {
    const paginationDto: PaginationDto = { page: 1, limit: 10 };
    const filtrosDto: FiltrosRegistroAseoHabitacionDto = {};

    const registrosAseo = [
      {
        id: 1,
        usuarioId: 1,
        habitacionId: 101,
        fecha_registro: new Date('2024-01-15T10:30:00Z'),
        areas_intervenidas: ['Cama', 'Escritorio'],
        areas_intervenidas_banio: ['Lavamanos', 'Ducha'],
        procedimiento_rotacion_colchones: null,
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
        habitacionId: 102,
        fecha_registro: new Date('2024-01-16T14:00:00Z'),
        areas_intervenidas: ['Cama', 'Ventanas'],
        areas_intervenidas_banio: ['Inodoro', 'Ducha'],
        procedimiento_rotacion_colchones: 'Rotación completa',
        tipos_realizados: [
          TiposAseo.DESINFECCION,
          TiposAseo.ROTACION_COLCHONES,
        ],
        objetos_perdidos: true,
        rastros_de_animales: false,
        observaciones: 'Objeto perdido encontrado',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('debería obtener todos los registros con paginación', async () => {
      // Arrange
      mockPrismaService.registroAseoHabitacion.count.mockResolvedValue(2);
      mockPrismaService.registroAseoHabitacion.findMany.mockResolvedValue(
        registrosAseo,
      );

      // Act
      const resultado = await service.findAll(paginationDto, filtrosDto);

      // Assert
      expect(
        mockPrismaService.registroAseoHabitacion.count,
      ).toHaveBeenCalledWith({
        where: { deleted: false },
      });
      expect(
        mockPrismaService.registroAseoHabitacion.findMany,
      ).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { deleted: false },
        select: {
          id: true,
          usuarioId: true,
          habitacionId: true,
          fecha_registro: true,
          areas_intervenidas: true,
          areas_intervenidas_banio: true,
          procedimiento_rotacion_colchones: true,
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
      const filtrosConDatos: FiltrosRegistroAseoHabitacionDto = {
        usuarioId: 1,
        habitacionId: 101,
        fecha: '2024-01-15',
        tipo_aseo: TiposAseo.LIMPIEZA,
        objetos_perdidos: false,
        rastros_de_animales: false,
      };

      mockPrismaService.registroAseoHabitacion.count.mockResolvedValue(1);
      mockPrismaService.registroAseoHabitacion.findMany.mockResolvedValue([
        registrosAseo[0],
      ]);

      // Act
      const resultado = await service.findAll(paginationDto, filtrosConDatos);

      // Assert
      expect(
        mockPrismaService.registroAseoHabitacion.count,
      ).toHaveBeenCalledWith({
        where: {
          deleted: false,
          usuarioId: 1,
          habitacionId: 101,
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
      mockPrismaService.registroAseoHabitacion.count.mockResolvedValue(0);

      // Act
      const resultado = await service.findAll(paginationDto, filtrosDto);

      // Assert
      expect(resultado).toEqual({
        data: [],
        meta: { page: 1, limit: 10, total: 0, lastPage: 0 },
      });
      expect(
        mockPrismaService.registroAseoHabitacion.findMany,
      ).not.toHaveBeenCalled();
    });

    it('debería manejar paginación en página superior al límite', async () => {
      // Arrange
      const paginacionFueraDeLimite: PaginationDto = { page: 5, limit: 10 };
      mockPrismaService.registroAseoHabitacion.count.mockResolvedValue(2);

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
        mockPrismaService.registroAseoHabitacion.findMany,
      ).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const registroEncontrado = {
      id: 1,
      usuarioId: 1,
      habitacionId: 101,
      fecha_registro: new Date('2024-01-15T10:30:00Z'),
      areas_intervenidas: ['Cama', 'Escritorio'],
      areas_intervenidas_banio: ['Lavamanos', 'Ducha'],
      procedimiento_rotacion_colchones: null,
      tipos_realizados: [TiposAseo.LIMPIEZA],
      objetos_perdidos: false,
      rastros_de_animales: false,
      observaciones: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('debería obtener un registro por ID correctamente', async () => {
      // Arrange
      mockPrismaService.registroAseoHabitacion.findFirst.mockResolvedValue(
        registroEncontrado,
      );

      // Act
      const resultado = await service.findOne(1);

      // Assert
      expect(
        mockPrismaService.registroAseoHabitacion.findFirst,
      ).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        select: {
          id: true,
          usuarioId: true,
          habitacionId: true,
          fecha_registro: true,
          areas_intervenidas: true,
          areas_intervenidas_banio: true,
          procedimiento_rotacion_colchones: true,
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
      mockPrismaService.registroAseoHabitacion.findFirst.mockResolvedValue(
        null,
      );

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'No se encontró el elemento con el ID: 999',
      );
    });

    it('debería manejar errores inesperados', async () => {
      // Arrange
      mockPrismaService.registroAseoHabitacion.findFirst.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.findOne(1)).rejects.toThrow(Error);
    });
  });

  describe('update', () => {
    const updateRegistroDto: UpdateRegistroAseoHabitacionDto = {
      areas_intervenidas: ['Cama', 'Escritorio', 'Ventanas', 'Piso'],
      observaciones: 'Aseo completado satisfactoriamente',
    };

    const registroActualizado = {
      id: 1,
      usuarioId: 1,
      habitacionId: 101,
      fecha_registro: new Date('2024-01-15T10:30:00Z'),
      ...updateRegistroDto,
      areas_intervenidas_banio: ['Lavamanos', 'Ducha'],
      procedimiento_rotacion_colchones: null,
      tipos_realizados: [TiposAseo.LIMPIEZA],
      objetos_perdidos: false,
      rastros_de_animales: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('debería actualizar un registro correctamente', async () => {
      // Arrange
      mockPrismaService.registroAseoHabitacion.update.mockResolvedValue(
        registroActualizado,
      );

      // Act
      const resultado = await service.update(1, updateRegistroDto);

      // Assert
      expect(
        mockPrismaService.registroAseoHabitacion.update,
      ).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: updateRegistroDto,
        select: {
          id: true,
          usuarioId: true,
          habitacionId: true,
          fecha_registro: true,
          areas_intervenidas: true,
          areas_intervenidas_banio: true,
          procedimiento_rotacion_colchones: true,
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
      const updateDtoVacio: UpdateRegistroAseoHabitacionDto = {};

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
      mockPrismaService.registroAseoHabitacion.update.mockRejectedValue({
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
      mockPrismaService.registroAseoHabitacion.update.mockRejectedValue(
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
      habitacionId: 101,
      fecha_registro: new Date('2024-01-15T10:30:00Z'),
      areas_intervenidas: ['Cama', 'Escritorio'],
      areas_intervenidas_banio: ['Lavamanos', 'Ducha'],
      procedimiento_rotacion_colchones: null,
      tipos_realizados: [TiposAseo.LIMPIEZA],
      objetos_perdidos: false,
      rastros_de_animales: false,
      observaciones: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('debería eliminar (soft delete) un registro correctamente', async () => {
      // Arrange
      mockPrismaService.registroAseoHabitacion.update.mockResolvedValue(
        registroEliminado,
      );

      // Act
      const resultado = await service.remove(1);

      // Assert
      expect(
        mockPrismaService.registroAseoHabitacion.update,
      ).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: { deleted: true },
        select: {
          id: true,
          usuarioId: true,
          habitacionId: true,
          fecha_registro: true,
          areas_intervenidas: true,
          areas_intervenidas_banio: true,
          procedimiento_rotacion_colchones: true,
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
      mockPrismaService.registroAseoHabitacion.update.mockRejectedValue({
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
      mockPrismaService.registroAseoHabitacion.update.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.remove(1)).rejects.toThrow(Error);
    });
  });

  describe('findByHabitacion', () => {
    const registrosDeHabitacion = [
      {
        id: 1,
        usuarioId: 1,
        habitacionId: 101,
        fecha_registro: new Date('2024-01-15T10:30:00Z'),
        areas_intervenidas: ['Cama', 'Escritorio'],
        areas_intervenidas_banio: ['Lavamanos', 'Ducha'],
        procedimiento_rotacion_colchones: null,
        tipos_realizados: [TiposAseo.LIMPIEZA],
        objetos_perdidos: false,
        rastros_de_animales: false,
        observaciones: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('debería obtener registros por habitación correctamente', async () => {
      // Arrange
      mockPrismaService.registroAseoHabitacion.findMany.mockResolvedValue(
        registrosDeHabitacion,
      );

      // Act
      const resultado = await service.findByHabitacion(101);

      // Assert
      expect(
        mockPrismaService.registroAseoHabitacion.findMany,
      ).toHaveBeenCalledWith({
        where: { habitacionId: 101, deleted: false },
        select: {
          id: true,
          usuarioId: true,
          habitacionId: true,
          fecha_registro: true,
          areas_intervenidas: true,
          areas_intervenidas_banio: true,
          procedimiento_rotacion_colchones: true,
          tipos_realizados: true,
          objetos_perdidos: true,
          rastros_de_animales: true,
          observaciones: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { fecha_registro: 'desc' },
      });
      expect(resultado).toEqual(registrosDeHabitacion);
    });

    it('debería retornar array vacío cuando no hay registros para la habitación', async () => {
      // Arrange
      mockPrismaService.registroAseoHabitacion.findMany.mockResolvedValue([]);

      // Act
      const resultado = await service.findByHabitacion(999);

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  describe('findByUsuario', () => {
    const registrosDelUsuario = [
      {
        id: 1,
        usuarioId: 1,
        habitacionId: 101,
        fecha_registro: new Date('2024-01-15T10:30:00Z'),
        areas_intervenidas: ['Cama', 'Escritorio'],
        areas_intervenidas_banio: ['Lavamanos', 'Ducha'],
        procedimiento_rotacion_colchones: null,
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
      mockPrismaService.registroAseoHabitacion.findMany.mockResolvedValue(
        registrosDelUsuario,
      );

      // Act
      const resultado = await service.findByUsuario(1);

      // Assert
      expect(
        mockPrismaService.registroAseoHabitacion.findMany,
      ).toHaveBeenCalledWith({
        where: { usuarioId: 1, deleted: false },
        select: {
          id: true,
          usuarioId: true,
          habitacionId: true,
          fecha_registro: true,
          areas_intervenidas: true,
          areas_intervenidas_banio: true,
          procedimiento_rotacion_colchones: true,
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
      mockPrismaService.registroAseoHabitacion.findMany.mockResolvedValue([]);

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
        habitacionId: 101,
        fecha_registro: new Date('2024-01-15T10:30:00Z'),
        areas_intervenidas: ['Cama', 'Escritorio'],
        areas_intervenidas_banio: ['Lavamanos', 'Ducha'],
        procedimiento_rotacion_colchones: null,
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
      mockPrismaService.registroAseoHabitacion.findMany.mockResolvedValue(
        registrosDeLaFecha,
      );

      // Act
      const resultado = await service.findByFecha('2024-01-15');

      // Assert
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
        select: {
          id: true,
          usuarioId: true,
          habitacionId: true,
          fecha_registro: true,
          areas_intervenidas: true,
          areas_intervenidas_banio: true,
          procedimiento_rotacion_colchones: true,
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
      mockPrismaService.registroAseoHabitacion.findMany.mockResolvedValue([]);

      // Act
      const resultado = await service.findByFecha('2024-12-31');

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  describe('Integración con documentación API', () => {
    it('debería cumplir con el contrato de creación de registro', async () => {
      // Arrange
      const createDto: CreateRegistroAseoHabitacionDto = {
        usuarioId: 1,
        habitacionId: 101,
        fecha_registro: '2024-01-15T10:30:00Z',
        areas_intervenidas: ['Cama', 'Escritorio'],
        areas_intervenidas_banio: ['Lavamanos', 'Ducha'],
        tipos_realizados: [TiposAseo.LIMPIEZA],
        objetos_perdidos: false,
        rastros_de_animales: false,
      };

      const registroCreado = {
        id: 1,
        ...createDto,
        fecha_registro: new Date('2024-01-15T10:30:00Z'),
        procedimiento_rotacion_colchones: null,
        observaciones: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      mockPrismaService.registroAseoHabitacion.create.mockResolvedValue(
        registroCreado,
      );

      // Act
      const resultado = await service.create(createDto);

      // Assert
      expect(resultado).toMatchObject({
        id: expect.any(Number),
        usuarioId: expect.any(Number),
        habitacionId: expect.any(Number),
        fecha_registro: expect.any(Date),
        areas_intervenidas: expect.any(Array),
        areas_intervenidas_banio: expect.any(Array),
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
      const filtrosDto: FiltrosRegistroAseoHabitacionDto = {};

      mockPrismaService.registroAseoHabitacion.count.mockResolvedValue(5);
      mockPrismaService.registroAseoHabitacion.findMany.mockResolvedValue([]);

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
