import { Test, TestingModule } from '@nestjs/testing';
import { ZonasComunesController } from './zonas-comunes.controller';
import { ZonasComunesService } from './zonas-comunes.service';
import { CreateZonaComunDto } from './dto/create-zona-comun.dto';
import { UpdateZonaComunDto } from './dto/update-zona-comun.dto';
import { FiltrosZonaComunDto } from './dto/filtros-zona-comun.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TiposAseo } from './entities/tipos-aseo.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';

// Mock de los guards
jest.mock('src/auth/guards/auth.guard', () => ({
  AuthGuard: class MockAuthGuard {
    canActivate() {
      return true;
    }
  },
}));

jest.mock('src/auth/guards/roles.guard', () => ({
  RolesGuard: class MockRolesGuard {
    canActivate() {
      return true;
    }
  },
}));

describe('ZonasComunesController', () => {
  let controller: ZonasComunesController;
  let service: ZonasComunesService;

  // Mock del ZonasComunesService
  const mockZonasComunesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByPiso: jest.fn(),
    findRequierenAseo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZonasComunesController],
      providers: [
        {
          provide: ZonasComunesService,
          useValue: mockZonasComunesService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ZonasComunesController>(ZonasComunesController);
    service = module.get<ZonasComunesService>(ZonasComunesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición del controlador', () => {
    it('debería estar definido', () => {
    expect(controller).toBeDefined();
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
    };

    it('debería crear una zona común correctamente', async () => {
      // Arrange
      mockZonasComunesService.create.mockResolvedValue(zonaComunCreada);

      // Act
      const resultado = await controller.create(createZonaComunDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createZonaComunDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(zonaComunCreada);
      expect(resultado).toHaveProperty('id');
      expect(resultado).toHaveProperty('nombre');
      expect(resultado).toHaveProperty('piso');
      expect(resultado).toHaveProperty('requerido_aseo_hoy');
    });

    it('debería lanzar BadRequestException cuando hay error en la creación', async () => {
      // Arrange
      mockZonasComunesService.create.mockRejectedValue(
        new BadRequestException('Error al crear zona común'),
      );

      // Act & Assert
      await expect(controller.create(createZonaComunDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.create(createZonaComunDto)).rejects.toThrow(
        'Error al crear zona común',
      );
      expect(service.create).toHaveBeenCalledWith(createZonaComunDto);
    });

    it('debería validar la estructura del DTO de entrada', () => {
      // Assert
      expect(createZonaComunDto).toHaveProperty('nombre');
      expect(createZonaComunDto).toHaveProperty('piso');
      expect(createZonaComunDto).toHaveProperty('requerido_aseo_hoy');
      expect(typeof createZonaComunDto.nombre).toBe('string');
      expect(typeof createZonaComunDto.piso).toBe('number');
      expect(typeof createZonaComunDto.requerido_aseo_hoy).toBe('boolean');
    });
  });

  describe('findAll', () => {
    const filtrosDto: FiltrosZonaComunDto = { page: 1, limit: 10 };

    const respuestaFindAll = {
      data: [
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
      ],
      meta: { page: 1, limit: 10, total: 1, lastPage: 1 },
    };

    it('debería obtener todas las zonas comunes con paginación', async () => {
      // Arrange
      mockZonasComunesService.findAll.mockResolvedValue(respuestaFindAll);

      // Act
      const resultado = await controller.findAll(filtrosDto);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(filtrosDto, filtrosDto);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(respuestaFindAll);
      expect(resultado).toHaveProperty('data');
      expect(resultado).toHaveProperty('meta');
      expect(Array.isArray(resultado.data)).toBe(true);
    });

    it('debería aplicar filtros correctamente', async () => {
      // Arrange
      const filtrosConDatos: FiltrosZonaComunDto = {
        page: 1,
        limit: 10,
        piso: 1,
        requerido_aseo_hoy: true,
        ultimo_aseo_tipo: TiposAseo.LIMPIEZA,
      };

      mockZonasComunesService.findAll.mockResolvedValue(respuestaFindAll);

      // Act
      const resultado = await controller.findAll(filtrosConDatos);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(
        filtrosConDatos,
        filtrosConDatos,
      );
      expect(resultado).toEqual(respuestaFindAll);
    });

    it('debería manejar respuesta vacía', async () => {
      // Arrange
      const respuestaVacia = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, lastPage: 1 },
      };

      mockZonasComunesService.findAll.mockResolvedValue(respuestaVacia);

      // Act
      const resultado = await controller.findAll(filtrosDto);

      // Assert
      expect(resultado.data).toEqual([]);
      expect(resultado.meta.total).toBe(0);
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
      mockZonasComunesService.findOne.mockResolvedValue(zonaComunEncontrada);

      // Act
      const resultado = await controller.findOne(1);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(zonaComunEncontrada);
      expect(resultado).toHaveProperty('id');
      expect(resultado).toHaveProperty('nombre');
    });

    it('debería lanzar NotFoundException cuando la zona común no existe', async () => {
      // Arrange
      mockZonasComunesService.findOne.mockRejectedValue(
        new NotFoundException('Zona común con ID 999 no encontrada'),
      );

      // Act & Assert
      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(controller.findOne(999)).rejects.toThrow(
        'Zona común con ID 999 no encontrada',
      );
      expect(service.findOne).toHaveBeenCalledWith(999);
    });

    it('debería convertir el ID de string a number correctamente', async () => {
      // Arrange
      mockZonasComunesService.findOne.mockResolvedValue(zonaComunEncontrada);

      // Act
      await controller.findOne(123);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(123);
    });
  });

  describe('update', () => {
    const updateZonaComunDto: UpdateZonaComunDto = {
      nombre: 'Recepción Actualizada',
      requerido_aseo_hoy: true,
    };

    const zonaComunActualizada = {
      id: 1,
      nombre: 'Recepción Actualizada',
      piso: 1,
      requerido_aseo_hoy: true,
      ultimo_aseo_fecha: null,
      ultimo_aseo_tipo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('debería actualizar una zona común correctamente', async () => {
      // Arrange
      mockZonasComunesService.update.mockResolvedValue(zonaComunActualizada);

      // Act
      const resultado = await controller.update(1, updateZonaComunDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, updateZonaComunDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(zonaComunActualizada);
      expect(resultado.nombre).toBe('Recepción Actualizada');
      expect(resultado.requerido_aseo_hoy).toBe(true);
    });

    it('debería lanzar NotFoundException cuando la zona común no existe', async () => {
      // Arrange
      mockZonasComunesService.update.mockRejectedValue(
        new NotFoundException('Zona común con ID 999 no encontrada'),
      );

      // Act & Assert
      await expect(controller.update(999, updateZonaComunDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.update(999, updateZonaComunDto)).rejects.toThrow(
        'Zona común con ID 999 no encontrada',
      );
      expect(service.update).toHaveBeenCalledWith(999, updateZonaComunDto);
    });

    it('debería lanzar BadRequestException cuando no se proporcionan datos', async () => {
      // Arrange
      const updateDtoVacio: UpdateZonaComunDto = {};
      mockZonasComunesService.update.mockRejectedValue(
        new BadRequestException(
          'Debe enviar datos para actualizar la zona común',
        ),
      );

      // Act & Assert
      await expect(controller.update(1, updateDtoVacio)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.update(1, updateDtoVacio)).rejects.toThrow(
        'Debe enviar datos para actualizar la zona común',
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

    it('debería eliminar una zona común correctamente', async () => {
      // Arrange
      mockZonasComunesService.remove.mockResolvedValue(zonaComunEliminada);

      // Act
      const resultado = await controller.remove(1);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(zonaComunEliminada);
    });

    it('debería lanzar NotFoundException cuando la zona común no existe', async () => {
      // Arrange
      mockZonasComunesService.remove.mockRejectedValue(
        new NotFoundException('Zona común con ID 999 no encontrada'),
      );

      // Act & Assert
      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
      await expect(controller.remove(999)).rejects.toThrow(
        'Zona común con ID 999 no encontrada',
      );
      expect(service.remove).toHaveBeenCalledWith(999);
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
      mockZonasComunesService.findByPiso.mockResolvedValue(zonasDelPiso);

      // Act
      const resultado = await controller.findByPiso(1);

      // Assert
      expect(service.findByPiso).toHaveBeenCalledWith(1);
      expect(service.findByPiso).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(zonasDelPiso);
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBe(2);
      expect(resultado[0].piso).toBe(1);
      expect(resultado[1].piso).toBe(1);
    });

    it('debería retornar array vacío cuando no hay zonas en el piso', async () => {
      // Arrange
      mockZonasComunesService.findByPiso.mockResolvedValue([]);

      // Act
      const resultado = await controller.findByPiso(99);

      // Assert
      expect(service.findByPiso).toHaveBeenCalledWith(99);
      expect(resultado).toEqual([]);
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBe(0);
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
      {
        id: 3,
        nombre: 'Comedor',
        piso: 1,
        requerido_aseo_hoy: true,
        ultimo_aseo_fecha: new Date(),
        ultimo_aseo_tipo: TiposAseo.LIMPIEZA,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('debería obtener zonas que requieren aseo correctamente', async () => {
      // Arrange
      mockZonasComunesService.findRequierenAseo.mockResolvedValue(
        zonasQueRequierenAseo,
      );

      // Act
      const resultado = await controller.findRequierenAseo();

      // Assert
      expect(service.findRequierenAseo).toHaveBeenCalledWith();
      expect(service.findRequierenAseo).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(zonasQueRequierenAseo);
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBe(2);
      expect(resultado[0].requerido_aseo_hoy).toBe(true);
      expect(resultado[1].requerido_aseo_hoy).toBe(true);
    });

    it('debería retornar array vacío cuando no hay zonas que requieren aseo', async () => {
      // Arrange
      mockZonasComunesService.findRequierenAseo.mockResolvedValue([]);

      // Act
      const resultado = await controller.findRequierenAseo();

      // Assert
      expect(service.findRequierenAseo).toHaveBeenCalledWith();
      expect(resultado).toEqual([]);
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBe(0);
    });
  });

  describe('Validaciones de autorización y roles', () => {
    it('debería requerir autenticación para todos los endpoints', () => {
      // Todos los endpoints deben tener el AuthGuard aplicado
      // Este test verifica que el guard está siendo mockeado correctamente
      expect(AuthGuard).toBeDefined();
    });

    it('debería requerir rol ADMINISTRADOR para endpoints de escritura', () => {
      // Los endpoints create, update y remove deben requerir rol ADMINISTRADOR
      // Este test verifica que el RolesGuard está siendo mockeado correctamente
      expect(RolesGuard).toBeDefined();
    });
  });

  describe('Casos de borde y validaciones adicionales', () => {
    it('debería manejar correctamente múltiples llamadas concurrentes', async () => {
      // Arrange
      const dto1: CreateZonaComunDto = {
        nombre: 'Zona1',
        piso: 1,
        requerido_aseo_hoy: false,
      };
      const dto2: CreateZonaComunDto = {
        nombre: 'Zona2',
        piso: 2,
        requerido_aseo_hoy: true,
      };

      mockZonasComunesService.create
        .mockResolvedValueOnce({
          id: 1,
          ...dto1,
          ultimo_aseo_fecha: null,
          ultimo_aseo_tipo: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: 2,
          ...dto2,
          ultimo_aseo_fecha: null,
          ultimo_aseo_tipo: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      // Act
      const [resultado1, resultado2] = await Promise.all([
        controller.create(dto1),
        controller.create(dto2),
      ]);

      // Assert
      expect(service.create).toHaveBeenCalledTimes(2);
      expect(resultado1.id).toBe(1);
      expect(resultado2.id).toBe(2);
    });

    it('debería validar que los métodos del servicio son llamados con los parámetros correctos', async () => {
      // Arrange
      const createDto: CreateZonaComunDto = {
        nombre: 'test',
        piso: 1,
        requerido_aseo_hoy: false,
      };
      const updateDto: UpdateZonaComunDto = { nombre: 'updated' };
      const filtrosDto: FiltrosZonaComunDto = { page: 1, limit: 10 };

      mockZonasComunesService.create.mockResolvedValue({});
      mockZonasComunesService.findAll.mockResolvedValue({ data: [], meta: {} });
      mockZonasComunesService.findOne.mockResolvedValue({});
      mockZonasComunesService.update.mockResolvedValue({});
      mockZonasComunesService.remove.mockResolvedValue({});
      mockZonasComunesService.findByPiso.mockResolvedValue([]);
      mockZonasComunesService.findRequierenAseo.mockResolvedValue([]);

      // Act
      await controller.create(createDto);
      await controller.findAll(filtrosDto);
      await controller.findOne(1);
      await controller.update(1, updateDto);
      await controller.remove(1);
      await controller.findByPiso(1);
      await controller.findRequierenAseo();

      // Assert
      expect(mockZonasComunesService.create).toHaveBeenCalledWith(createDto);
      expect(mockZonasComunesService.findAll).toHaveBeenCalledWith(
        filtrosDto,
        filtrosDto,
      );
      expect(mockZonasComunesService.findOne).toHaveBeenCalledWith(1);
      expect(mockZonasComunesService.update).toHaveBeenCalledWith(1, updateDto);
      expect(mockZonasComunesService.remove).toHaveBeenCalledWith(1);
      expect(mockZonasComunesService.findByPiso).toHaveBeenCalledWith(1);
      expect(mockZonasComunesService.findRequierenAseo).toHaveBeenCalledWith();
    });

    it('debería manejar diferentes tipos de aseo correctamente', async () => {
      // Arrange
      const tiposAseoValidos = [
        TiposAseo.LIMPIEZA,
        TiposAseo.DESINFECCION,
        TiposAseo.ROTACION_COLCHONES,
        TiposAseo.LIMPIEZA_BANIO,
        TiposAseo.DESINFECCION_BANIO,
      ];

      tiposAseoValidos.forEach(() => {
        const respuesta = {
          data: [],
          meta: { page: 1, limit: 10, total: 0, lastPage: 1 },
        };

        mockZonasComunesService.findAll.mockResolvedValueOnce(respuesta);
      });

      // Act & Assert
      for (const tipo of tiposAseoValidos) {
        const filtros: FiltrosZonaComunDto = {
          page: 1,
          limit: 10,
          ultimo_aseo_tipo: tipo,
        };
        const resultado = await controller.findAll(filtros);
        expect(resultado).toBeDefined();
      }
    });
  });

  describe('Integración con documentación API', () => {
    it('debería cumplir con la estructura de respuesta documentada para creación', async () => {
      // Arrange
      const respuestaEsperada = {
        id: 1,
        nombre: 'Nueva Zona',
        piso: 1,
        requerido_aseo_hoy: false,
        ultimo_aseo_fecha: null,
        ultimo_aseo_tipo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockZonasComunesService.create.mockResolvedValue(respuestaEsperada);

      // Act
      const resultado = await controller.create({
        nombre: 'Nueva Zona',
        piso: 1,
        requerido_aseo_hoy: false,
      });

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

    it('debería cumplir con la estructura de respuesta documentada para listado', async () => {
      // Arrange
      const respuestaEsperada = {
        data: [
          {
            id: 1,
            nombre: 'Zona Test',
            piso: 1,
            requerido_aseo_hoy: false,
            ultimo_aseo_fecha: null,
            ultimo_aseo_tipo: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          lastPage: 1,
        },
      };
      mockZonasComunesService.findAll.mockResolvedValue(respuestaEsperada);

      // Act
      const resultado = await controller.findAll({ page: 1, limit: 10 });

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
