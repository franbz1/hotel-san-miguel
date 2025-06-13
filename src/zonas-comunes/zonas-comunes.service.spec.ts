import { Test, TestingModule } from '@nestjs/testing';
import { ZonasComunesService } from './zonas-comunes.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateZonaComunDto } from './dto/create-zona-comun.dto';
import { UpdateZonaComunDto } from './dto/update-zona-comun.dto';
import { FiltrosZonaComunDto } from './dto/filtros-zona-comun.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { TiposAseo } from './entities/tipos-aseo.enum';

describe('ZonasComunesService', () => {
  let service: ZonasComunesService;

  // Mock de PrismaService
  const mockPrismaService = {
    zonaComun: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZonasComunesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ZonasComunesService>(ZonasComunesService);
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
    const createZonaComunDto: CreateZonaComunDto = {
      nombre: 'Recepción',
      piso: 1,
      requerido_aseo_hoy: false,
    };

    const zonaComunCreada = {
      id: 1,
      ...createZonaComunDto,
      ultimo_aseo_fecha: null,
      ultimo_aseo_tipo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false,
    };

    it('debería crear una zona común correctamente', async () => {
      // Arrange
      mockPrismaService.zonaComun.create.mockResolvedValue(zonaComunCreada);

      // Act
      const resultado = await service.create(createZonaComunDto);

      // Assert
      expect(mockPrismaService.zonaComun.create).toHaveBeenCalledWith({
        data: createZonaComunDto,
        select: {
          id: true,
          nombre: true,
          piso: true,
          requerido_aseo_hoy: true,
          ultimo_aseo_fecha: true,
          ultimo_aseo_tipo: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(resultado).toEqual(zonaComunCreada);
    });

    it('debería lanzar BadRequestException cuando ocurre un error en la creación', async () => {
      // Arrange
      mockPrismaService.zonaComun.create.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.create(createZonaComunDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createZonaComunDto)).rejects.toThrow(
        'Error al crear zona común',
      );
    });

    it('debería manejar la creación con datos opcionales', async () => {
      // Arrange
      const createDtoCompleto: CreateZonaComunDto = {
        nombre: 'Sala de Conferencias',
        piso: 2,
        requerido_aseo_hoy: true,
        ultimo_aseo_fecha: '2024-01-15T10:30:00Z',
        ultimo_aseo_tipo: TiposAseo.LIMPIEZA,
      };

      const zonaComunCompletaCreada = {
        id: 2,
        ...createDtoCompleto,
        ultimo_aseo_fecha: new Date('2024-01-15T10:30:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      mockPrismaService.zonaComun.create.mockResolvedValue(
        zonaComunCompletaCreada,
      );

      // Act
      const resultado = await service.create(createDtoCompleto);

      // Assert
      expect(mockPrismaService.zonaComun.create).toHaveBeenCalledWith({
        data: createDtoCompleto,
        select: {
          id: true,
          nombre: true,
          piso: true,
          requerido_aseo_hoy: true,
          ultimo_aseo_fecha: true,
          ultimo_aseo_tipo: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(resultado).toEqual(zonaComunCompletaCreada);
    });
  });

  describe('findAll', () => {
    const paginationDto: PaginationDto = { page: 1, limit: 10 };
    const filtrosDto: FiltrosZonaComunDto = {};

    const zonasComunes = [
      {
        id: 1,
        nombre: 'Recepción',
        piso: 1,
        requerido_aseo_hoy: false,
        ultimo_aseo_fecha: null,
        ultimo_aseo_tipo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        nombre: 'Sala de Conferencias',
        piso: 2,
        requerido_aseo_hoy: true,
        ultimo_aseo_fecha: new Date(),
        ultimo_aseo_tipo: TiposAseo.LIMPIEZA,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('debería obtener todas las zonas comunes con paginación', async () => {
      // Arrange
      mockPrismaService.zonaComun.count.mockResolvedValue(2);
      mockPrismaService.zonaComun.findMany.mockResolvedValue(zonasComunes);

      // Act
      const resultado = await service.findAll(paginationDto, filtrosDto);

      // Assert
      expect(mockPrismaService.zonaComun.count).toHaveBeenCalledWith({
        where: { deleted: false },
      });
      expect(mockPrismaService.zonaComun.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { deleted: false },
        select: {
          id: true,
          nombre: true,
          piso: true,
          requerido_aseo_hoy: true,
          ultimo_aseo_fecha: true,
          ultimo_aseo_tipo: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(resultado).toEqual({
        data: zonasComunes,
        meta: { page: 1, limit: 10, total: 2, lastPage: 1 },
      });
    });

    it('debería aplicar filtros correctamente', async () => {
      // Arrange
      const filtrosConDatos: FiltrosZonaComunDto = {
        piso: 1,
        requerido_aseo_hoy: true,
        ultimo_aseo_tipo: TiposAseo.LIMPIEZA,
      };

      mockPrismaService.zonaComun.count.mockResolvedValue(1);
      mockPrismaService.zonaComun.findMany.mockResolvedValue([zonasComunes[0]]);

      // Act
      const resultado = await service.findAll(paginationDto, filtrosConDatos);

      // Assert
      expect(mockPrismaService.zonaComun.count).toHaveBeenCalledWith({
        where: {
          deleted: false,
          piso: 1,
          requerido_aseo_hoy: true,
          ultimo_aseo_tipo: TiposAseo.LIMPIEZA,
        },
      });
      expect(mockPrismaService.zonaComun.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          deleted: false,
          piso: 1,
          requerido_aseo_hoy: true,
          ultimo_aseo_tipo: TiposAseo.LIMPIEZA,
        },
        select: {
          id: true,
          nombre: true,
          piso: true,
          requerido_aseo_hoy: true,
          ultimo_aseo_fecha: true,
          ultimo_aseo_tipo: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('debería retornar respuesta vacía cuando no hay zonas comunes', async () => {
      // Arrange
      mockPrismaService.zonaComun.count.mockResolvedValue(0);

      // Act
      const resultado = await service.findAll(paginationDto, filtrosDto);

      // Assert
      expect(resultado).toEqual({
        data: [],
        meta: { page: 1, limit: 10, total: 0, lastPage: 0 },
      });
      expect(mockPrismaService.zonaComun.findMany).not.toHaveBeenCalled();
    });

    it('debería manejar paginación en página superior al límite', async () => {
      // Arrange
      const paginacionFueraDeLimite: PaginationDto = { page: 5, limit: 10 };
      mockPrismaService.zonaComun.count.mockResolvedValue(2);

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
      expect(mockPrismaService.zonaComun.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const zonaComunEncontrada = {
      id: 1,
      nombre: 'Recepción',
      piso: 1,
      requerido_aseo_hoy: false,
      ultimo_aseo_fecha: null,
      ultimo_aseo_tipo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('debería obtener una zona común por ID correctamente', async () => {
      // Arrange
      mockPrismaService.zonaComun.findFirst.mockResolvedValue(
        zonaComunEncontrada,
      );

      // Act
      const resultado = await service.findOne(1);

      // Assert
      expect(mockPrismaService.zonaComun.findFirst).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        select: {
          id: true,
          nombre: true,
          piso: true,
          requerido_aseo_hoy: true,
          ultimo_aseo_fecha: true,
          ultimo_aseo_tipo: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(resultado).toEqual(zonaComunEncontrada);
    });

    it('debería lanzar NotFoundException cuando la zona común no existe', async () => {
      // Arrange
      mockPrismaService.zonaComun.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Zona común con ID 999 no encontrada',
      );
    });

    it('debería manejar errores inesperados', async () => {
      // Arrange
      mockPrismaService.zonaComun.findFirst.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.findOne(1)).rejects.toThrow(Error);
    });
  });

  describe('update', () => {
    const updateZonaComunDto: UpdateZonaComunDto = {
      nombre: 'Recepción Actualizada',
      requerido_aseo_hoy: true,
    };

    const zonaComunActualizada = {
      id: 1,
      ...updateZonaComunDto,
      piso: 1,
      ultimo_aseo_fecha: null,
      ultimo_aseo_tipo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('debería actualizar una zona común correctamente', async () => {
      // Arrange
      mockPrismaService.zonaComun.update.mockResolvedValue(
        zonaComunActualizada,
      );

      // Act
      const resultado = await service.update(1, updateZonaComunDto);

      // Assert
      expect(mockPrismaService.zonaComun.update).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: updateZonaComunDto,
        select: {
          id: true,
          nombre: true,
          piso: true,
          requerido_aseo_hoy: true,
          ultimo_aseo_fecha: true,
          ultimo_aseo_tipo: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(resultado).toEqual(zonaComunActualizada);
    });

    it('debería lanzar BadRequestException cuando no se proporcionan datos para actualizar', async () => {
      // Arrange
      const updateDtoVacio: UpdateZonaComunDto = {};

      // Act & Assert
      await expect(service.update(1, updateDtoVacio)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(1, updateDtoVacio)).rejects.toThrow(
        'Debe enviar datos para actualizar la zona común',
      );
    });

    it('debería lanzar NotFoundException cuando la zona común no existe', async () => {
      // Arrange
      mockPrismaService.zonaComun.update.mockRejectedValue({
        code: 'P2025',
      });

      // Act & Assert
      await expect(service.update(999, updateZonaComunDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(999, updateZonaComunDto)).rejects.toThrow(
        'Zona común con ID 999 no encontrada',
      );
    });

    it('debería manejar errores inesperados durante la actualización', async () => {
      // Arrange
      mockPrismaService.zonaComun.update.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.update(1, updateZonaComunDto)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('remove', () => {
    const zonaComunEliminada = {
      id: 1,
      nombre: 'Recepción',
      piso: 1,
      requerido_aseo_hoy: false,
      ultimo_aseo_fecha: null,
      ultimo_aseo_tipo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('debería eliminar (soft delete) una zona común correctamente', async () => {
      // Arrange
      mockPrismaService.zonaComun.update.mockResolvedValue(zonaComunEliminada);

      // Act
      const resultado = await service.remove(1);

      // Assert
      expect(mockPrismaService.zonaComun.update).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: { deleted: true },
        select: {
          id: true,
          nombre: true,
          piso: true,
          requerido_aseo_hoy: true,
          ultimo_aseo_fecha: true,
          ultimo_aseo_tipo: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(resultado).toEqual(zonaComunEliminada);
    });

    it('debería lanzar NotFoundException cuando la zona común no existe', async () => {
      // Arrange
      mockPrismaService.zonaComun.update.mockRejectedValue({
        code: 'P2025',
      });

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow(
        'Zona común con ID 999 no encontrada',
      );
    });

    it('debería manejar errores inesperados durante la eliminación', async () => {
      // Arrange
      mockPrismaService.zonaComun.update.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.remove(1)).rejects.toThrow(Error);
    });
  });

  describe('findByPiso', () => {
    const zonasDelPiso = [
      {
        id: 1,
        nombre: 'Recepción',
        piso: 1,
        requerido_aseo_hoy: false,
        ultimo_aseo_fecha: null,
        ultimo_aseo_tipo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        nombre: 'Lobby',
        piso: 1,
        requerido_aseo_hoy: true,
        ultimo_aseo_fecha: new Date(),
        ultimo_aseo_tipo: TiposAseo.LIMPIEZA,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('debería obtener zonas comunes por piso correctamente', async () => {
      // Arrange
      mockPrismaService.zonaComun.findMany.mockResolvedValue(zonasDelPiso);

      // Act
      const resultado = await service.findByPiso(1);

      // Assert
      expect(mockPrismaService.zonaComun.findMany).toHaveBeenCalledWith({
        where: { piso: 1, deleted: false },
        select: {
          id: true,
          nombre: true,
          piso: true,
          requerido_aseo_hoy: true,
          ultimo_aseo_fecha: true,
          ultimo_aseo_tipo: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { nombre: 'asc' },
      });
      expect(resultado).toEqual(zonasDelPiso);
    });

    it('debería retornar array vacío cuando no hay zonas en el piso', async () => {
      // Arrange
      mockPrismaService.zonaComun.findMany.mockResolvedValue([]);

      // Act
      const resultado = await service.findByPiso(99);

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  describe('findRequierenAseo', () => {
    const zonasQueRequierenAseo = [
      {
        id: 2,
        nombre: 'Sala de Conferencias',
        piso: 2,
        requerido_aseo_hoy: true,
        ultimo_aseo_fecha: null,
        ultimo_aseo_tipo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('debería obtener zonas que requieren aseo correctamente', async () => {
      // Arrange
      mockPrismaService.zonaComun.findMany.mockResolvedValue(
        zonasQueRequierenAseo,
      );

      // Act
      const resultado = await service.findRequierenAseo();

      // Assert
      expect(mockPrismaService.zonaComun.findMany).toHaveBeenCalledWith({
        where: { requerido_aseo_hoy: true, deleted: false },
        select: {
          id: true,
          nombre: true,
          piso: true,
          requerido_aseo_hoy: true,
          ultimo_aseo_fecha: true,
          ultimo_aseo_tipo: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [{ piso: 'asc' }, { nombre: 'asc' }],
      });
      expect(resultado).toEqual(zonasQueRequierenAseo);
    });

    it('debería retornar array vacío cuando no hay zonas que requieren aseo', async () => {
      // Arrange
      mockPrismaService.zonaComun.findMany.mockResolvedValue([]);

      // Act
      const resultado = await service.findRequierenAseo();

      // Assert
      expect(resultado).toEqual([]);
    });
  });

  describe('Integración con documentación API', () => {
    it('debería cumplir con el contrato de creación de zona común', async () => {
      // Arrange
      const createDto: CreateZonaComunDto = {
        nombre: 'Nueva Zona',
        piso: 3,
        requerido_aseo_hoy: false,
      };

      const zonaComunCreada = {
        id: 1,
        ...createDto,
        ultimo_aseo_fecha: null,
        ultimo_aseo_tipo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      mockPrismaService.zonaComun.create.mockResolvedValue(zonaComunCreada);

      // Act
      const resultado = await service.create(createDto);

      // Assert
      expect(resultado).toMatchObject({
        id: expect.any(Number),
        nombre: expect.any(String),
        piso: expect.any(Number),
        requerido_aseo_hoy: expect.any(Boolean),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('debería cumplir con el contrato de listado con paginación', async () => {
      // Arrange
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const filtrosDto: FiltrosZonaComunDto = {};

      mockPrismaService.zonaComun.count.mockResolvedValue(5);
      mockPrismaService.zonaComun.findMany.mockResolvedValue([]);

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
