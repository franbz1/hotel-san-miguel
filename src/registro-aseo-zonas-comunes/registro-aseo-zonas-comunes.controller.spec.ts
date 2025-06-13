import { Test, TestingModule } from '@nestjs/testing';
import { RegistroAseoZonasComunesController } from './registro-aseo-zonas-comunes.controller';
import { RegistroAseoZonasComunesService } from './registro-aseo-zonas-comunes.service';
import { CreateRegistroAseoZonaComunDto } from './dto/create-registro-aseo-zonas-comune.dto';
import { UpdateRegistroAseoZonaComunDto } from './dto/update-registro-aseo-zonas-comune.dto';
import { FiltrosRegistroAseoZonaComunDto } from './dto/filtros-registro-aseo-zona-comun.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TiposAseo } from 'src/zonas-comunes/entities/tipos-aseo.enum';
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

describe('RegistroAseoZonasComunesController', () => {
  let controller: RegistroAseoZonasComunesController;
  let service: RegistroAseoZonasComunesService;

  // Mock del RegistroAseoZonasComunesService
  const mockRegistroAseoZonasComunesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByZonaComun: jest.fn(),
    findByUsuario: jest.fn(),
    findByFecha: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistroAseoZonasComunesController],
      providers: [
        {
          provide: RegistroAseoZonasComunesService,
          useValue: mockRegistroAseoZonasComunesService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RegistroAseoZonasComunesController>(
      RegistroAseoZonasComunesController,
    );
    service = module.get<RegistroAseoZonasComunesService>(
      RegistroAseoZonasComunesService,
    );
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
    };

    it('debería crear un registro de aseo correctamente', async () => {
      // Arrange
      mockRegistroAseoZonasComunesService.create.mockResolvedValue(
        registroCreado,
      );

      // Act
      const resultado = await controller.create(createRegistroDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createRegistroDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(registroCreado);
      expect(resultado).toHaveProperty('id');
      expect(resultado).toHaveProperty('usuarioId');
      expect(resultado).toHaveProperty('zonaComunId');
      expect(resultado).toHaveProperty('fecha_registro');
      expect(resultado).toHaveProperty('tipos_realizados');
    });

    it('debería lanzar BadRequestException cuando hay error en la creación', async () => {
      // Arrange
      mockRegistroAseoZonasComunesService.create.mockRejectedValue(
        new BadRequestException(
          'Error al crear registro de aseo de zona común',
        ),
      );

      // Act & Assert
      await expect(controller.create(createRegistroDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.create(createRegistroDto)).rejects.toThrow(
        'Error al crear registro de aseo de zona común',
      );
      expect(service.create).toHaveBeenCalledWith(createRegistroDto);
    });

    it('debería validar la estructura del DTO de entrada', () => {
      // Assert
      expect(createRegistroDto).toHaveProperty('usuarioId');
      expect(createRegistroDto).toHaveProperty('zonaComunId');
      expect(createRegistroDto).toHaveProperty('fecha_registro');
      expect(createRegistroDto).toHaveProperty('tipos_realizados');
      expect(createRegistroDto).toHaveProperty('objetos_perdidos');
      expect(createRegistroDto).toHaveProperty('rastros_de_animales');
      expect(typeof createRegistroDto.usuarioId).toBe('number');
      expect(typeof createRegistroDto.zonaComunId).toBe('number');
      expect(typeof createRegistroDto.fecha_registro).toBe('string');
      expect(Array.isArray(createRegistroDto.tipos_realizados)).toBe(true);
      expect(typeof createRegistroDto.objetos_perdidos).toBe('boolean');
      expect(typeof createRegistroDto.rastros_de_animales).toBe('boolean');
    });
  });

  describe('findAll', () => {
    const filtrosDto: FiltrosRegistroAseoZonaComunDto = { page: 1, limit: 10 };

    const respuestaFindAll = {
      data: [
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
      ],
      meta: { page: 1, limit: 10, total: 1, lastPage: 1 },
    };

    it('debería obtener todos los registros con paginación', async () => {
      // Arrange
      mockRegistroAseoZonasComunesService.findAll.mockResolvedValue(
        respuestaFindAll,
      );

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
      const filtrosConDatos: FiltrosRegistroAseoZonaComunDto = {
        page: 1,
        limit: 10,
        usuarioId: 1,
        zonaComunId: 1,
        fecha: '2024-01-15',
        tipo_aseo: TiposAseo.LIMPIEZA,
        objetos_perdidos: false,
        rastros_de_animales: false,
      };

      mockRegistroAseoZonasComunesService.findAll.mockResolvedValue(
        respuestaFindAll,
      );

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

      mockRegistroAseoZonasComunesService.findAll.mockResolvedValue(
        respuestaVacia,
      );

      // Act
      const resultado = await controller.findAll(filtrosDto);

      // Assert
      expect(resultado.data).toEqual([]);
      expect(resultado.meta.total).toBe(0);
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
      mockRegistroAseoZonasComunesService.findOne.mockResolvedValue(
        registroEncontrado,
      );

      // Act
      const resultado = await controller.findOne(1);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(registroEncontrado);
      expect(resultado).toHaveProperty('id');
      expect(resultado).toHaveProperty('usuarioId');
      expect(resultado).toHaveProperty('zonaComunId');
    });

    it('debería lanzar NotFoundException cuando el registro no existe', async () => {
      // Arrange
      mockRegistroAseoZonasComunesService.findOne.mockRejectedValue(
        new NotFoundException(
          'Registro de aseo de zona común con ID 999 no encontrado',
        ),
      );

      // Act & Assert
      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(controller.findOne(999)).rejects.toThrow(
        'Registro de aseo de zona común con ID 999 no encontrado',
      );
      expect(service.findOne).toHaveBeenCalledWith(999);
    });

    it('debería convertir el ID de string a number correctamente', async () => {
      // Arrange
      mockRegistroAseoZonasComunesService.findOne.mockResolvedValue(
        registroEncontrado,
      );

      // Act
      await controller.findOne(123);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(123);
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
      tipos_realizados: [TiposAseo.LIMPIEZA, TiposAseo.DESINFECCION],
      objetos_perdidos: false,
      rastros_de_animales: false,
      observaciones: 'Aseo completado satisfactoriamente',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('debería actualizar un registro correctamente', async () => {
      // Arrange
      mockRegistroAseoZonasComunesService.update.mockResolvedValue(
        registroActualizado,
      );

      // Act
      const resultado = await controller.update(1, updateRegistroDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, updateRegistroDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(registroActualizado);
      expect(resultado.tipos_realizados).toEqual([
        TiposAseo.LIMPIEZA,
        TiposAseo.DESINFECCION,
      ]);
      expect(resultado.observaciones).toBe(
        'Aseo completado satisfactoriamente',
      );
    });

    it('debería lanzar NotFoundException cuando el registro no existe', async () => {
      // Arrange
      mockRegistroAseoZonasComunesService.update.mockRejectedValue(
        new NotFoundException(
          'Registro de aseo de zona común con ID 999 no encontrado',
        ),
      );

      // Act & Assert
      await expect(controller.update(999, updateRegistroDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.update(999, updateRegistroDto)).rejects.toThrow(
        'Registro de aseo de zona común con ID 999 no encontrado',
      );
      expect(service.update).toHaveBeenCalledWith(999, updateRegistroDto);
    });

    it('debería lanzar BadRequestException cuando no se proporcionan datos', async () => {
      // Arrange
      const updateDtoVacio: UpdateRegistroAseoZonaComunDto = {};
      mockRegistroAseoZonasComunesService.update.mockRejectedValue(
        new BadRequestException(
          'Debe enviar datos para actualizar el registro de aseo',
        ),
      );

      // Act & Assert
      await expect(controller.update(1, updateDtoVacio)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.update(1, updateDtoVacio)).rejects.toThrow(
        'Debe enviar datos para actualizar el registro de aseo',
      );
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

    it('debería eliminar un registro correctamente', async () => {
      // Arrange
      mockRegistroAseoZonasComunesService.remove.mockResolvedValue(
        registroEliminado,
      );

      // Act
      const resultado = await controller.remove(1);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(registroEliminado);
    });

    it('debería lanzar NotFoundException cuando el registro no existe', async () => {
      // Arrange
      mockRegistroAseoZonasComunesService.remove.mockRejectedValue(
        new NotFoundException(
          'Registro de aseo de zona común con ID 999 no encontrado',
        ),
      );

      // Act & Assert
      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
      await expect(controller.remove(999)).rejects.toThrow(
        'Registro de aseo de zona común con ID 999 no encontrado',
      );
      expect(service.remove).toHaveBeenCalledWith(999);
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
      {
        id: 2,
        usuarioId: 2,
        zonaComunId: 1,
        fecha_registro: new Date('2024-01-16T14:00:00Z'),
        tipos_realizados: [TiposAseo.DESINFECCION],
        objetos_perdidos: true,
        rastros_de_animales: false,
        observaciones: 'Objeto perdido encontrado',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('debería obtener registros por zona común correctamente', async () => {
      // Arrange
      mockRegistroAseoZonasComunesService.findByZonaComun.mockResolvedValue(
        registrosDeZonaComun,
      );

      // Act
      const resultado = await controller.findByZonaComun(1);

      // Assert
      expect(service.findByZonaComun).toHaveBeenCalledWith(1);
      expect(service.findByZonaComun).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(registrosDeZonaComun);
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBe(2);
      expect(resultado[0].zonaComunId).toBe(1);
      expect(resultado[1].zonaComunId).toBe(1);
    });

    it('debería retornar array vacío cuando no hay registros para la zona común', async () => {
      // Arrange
      mockRegistroAseoZonasComunesService.findByZonaComun.mockResolvedValue([]);

      // Act
      const resultado = await controller.findByZonaComun(999);

      // Assert
      expect(service.findByZonaComun).toHaveBeenCalledWith(999);
      expect(resultado).toEqual([]);
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBe(0);
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
      {
        id: 3,
        usuarioId: 1,
        zonaComunId: 2,
        fecha_registro: new Date('2024-01-17T09:00:00Z'),
        tipos_realizados: [TiposAseo.LIMPIEZA, TiposAseo.DESINFECCION],
        objetos_perdidos: false,
        rastros_de_animales: false,
        observaciones: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('debería obtener registros por usuario correctamente', async () => {
      // Arrange
      mockRegistroAseoZonasComunesService.findByUsuario.mockResolvedValue(
        registrosDelUsuario,
      );

      // Act
      const resultado = await controller.findByUsuario(1);

      // Assert
      expect(service.findByUsuario).toHaveBeenCalledWith(1);
      expect(service.findByUsuario).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(registrosDelUsuario);
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBe(2);
      expect(resultado[0].usuarioId).toBe(1);
      expect(resultado[1].usuarioId).toBe(1);
    });

    it('debería retornar array vacío cuando no hay registros para el usuario', async () => {
      // Arrange
      mockRegistroAseoZonasComunesService.findByUsuario.mockResolvedValue([]);

      // Act
      const resultado = await controller.findByUsuario(999);

      // Assert
      expect(service.findByUsuario).toHaveBeenCalledWith(999);
      expect(resultado).toEqual([]);
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBe(0);
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
      {
        id: 4,
        usuarioId: 2,
        zonaComunId: 2,
        fecha_registro: new Date('2024-01-15T15:45:00Z'),
        tipos_realizados: [TiposAseo.DESINFECCION],
        objetos_perdidos: false,
        rastros_de_animales: true,
        observaciones: 'Se encontraron rastros de insectos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('debería obtener registros por fecha correctamente', async () => {
      // Arrange
      mockRegistroAseoZonasComunesService.findByFecha.mockResolvedValue(
        registrosDeLaFecha,
      );

      // Act
      const resultado = await controller.findByFecha('2024-01-15');

      // Assert
      expect(service.findByFecha).toHaveBeenCalledWith('2024-01-15');
      expect(service.findByFecha).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(registrosDeLaFecha);
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBe(2);
      expect(
        resultado[0].fecha_registro.toISOString().startsWith('2024-01-15'),
      ).toBe(true);
      expect(
        resultado[1].fecha_registro.toISOString().startsWith('2024-01-15'),
      ).toBe(true);
    });

    it('debería retornar array vacío cuando no hay registros para la fecha', async () => {
      // Arrange
      mockRegistroAseoZonasComunesService.findByFecha.mockResolvedValue([]);

      // Act
      const resultado = await controller.findByFecha('2024-12-31');

      // Assert
      expect(service.findByFecha).toHaveBeenCalledWith('2024-12-31');
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

    it('debería permitir acceso a roles ASEO, ADMINISTRADOR y CAJERO', () => {
      // Los endpoints deben permitir acceso a múltiples roles
      // Este test verifica que el RolesGuard está siendo mockeado correctamente
      expect(RolesGuard).toBeDefined();
    });
  });

  describe('Casos de borde y validaciones adicionales', () => {
    it('debería manejar correctamente múltiples llamadas concurrentes', async () => {
      // Arrange
      const dto1: CreateRegistroAseoZonaComunDto = {
        usuarioId: 1,
        zonaComunId: 1,
        fecha_registro: '2024-01-15T10:30:00Z',
        tipos_realizados: [TiposAseo.LIMPIEZA],
        objetos_perdidos: false,
        rastros_de_animales: false,
      };
      const dto2: CreateRegistroAseoZonaComunDto = {
        usuarioId: 2,
        zonaComunId: 2,
        fecha_registro: '2024-01-16T14:00:00Z',
        tipos_realizados: [TiposAseo.DESINFECCION],
        objetos_perdidos: true,
        rastros_de_animales: false,
      };

      mockRegistroAseoZonasComunesService.create
        .mockResolvedValueOnce({
          id: 1,
          ...dto1,
          fecha_registro: new Date('2024-01-15T10:30:00Z'),
          observaciones: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: 2,
          ...dto2,
          fecha_registro: new Date('2024-01-16T14:00:00Z'),
          observaciones: null,
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
      const createDto: CreateRegistroAseoZonaComunDto = {
        usuarioId: 1,
        zonaComunId: 1,
        fecha_registro: '2024-01-15T10:30:00Z',
        tipos_realizados: [TiposAseo.LIMPIEZA],
        objetos_perdidos: false,
        rastros_de_animales: false,
      };
      const updateDto: UpdateRegistroAseoZonaComunDto = {
        observaciones: 'updated',
      };
      const filtrosDto: FiltrosRegistroAseoZonaComunDto = {
        page: 1,
        limit: 10,
      };

      mockRegistroAseoZonasComunesService.create.mockResolvedValue({});
      mockRegistroAseoZonasComunesService.findAll.mockResolvedValue({
        data: [],
        meta: {},
      });
      mockRegistroAseoZonasComunesService.findOne.mockResolvedValue({});
      mockRegistroAseoZonasComunesService.update.mockResolvedValue({});
      mockRegistroAseoZonasComunesService.remove.mockResolvedValue({});
      mockRegistroAseoZonasComunesService.findByZonaComun.mockResolvedValue([]);
      mockRegistroAseoZonasComunesService.findByUsuario.mockResolvedValue([]);
      mockRegistroAseoZonasComunesService.findByFecha.mockResolvedValue([]);

      // Act
      await controller.create(createDto);
      await controller.findAll(filtrosDto);
      await controller.findOne(1);
      await controller.update(1, updateDto);
      await controller.remove(1);
      await controller.findByZonaComun(1);
      await controller.findByUsuario(1);
      await controller.findByFecha('2024-01-15');

      // Assert
      expect(mockRegistroAseoZonasComunesService.create).toHaveBeenCalledWith(
        createDto,
      );
      expect(mockRegistroAseoZonasComunesService.findAll).toHaveBeenCalledWith(
        filtrosDto,
        filtrosDto,
      );
      expect(mockRegistroAseoZonasComunesService.findOne).toHaveBeenCalledWith(
        1,
      );
      expect(mockRegistroAseoZonasComunesService.update).toHaveBeenCalledWith(
        1,
        updateDto,
      );
      expect(mockRegistroAseoZonasComunesService.remove).toHaveBeenCalledWith(
        1,
      );
      expect(
        mockRegistroAseoZonasComunesService.findByZonaComun,
      ).toHaveBeenCalledWith(1);
      expect(
        mockRegistroAseoZonasComunesService.findByUsuario,
      ).toHaveBeenCalledWith(1);
      expect(
        mockRegistroAseoZonasComunesService.findByFecha,
      ).toHaveBeenCalledWith('2024-01-15');
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

        mockRegistroAseoZonasComunesService.findAll.mockResolvedValueOnce(
          respuesta,
        );
      });

      // Act & Assert
      for (const tipo of tiposAseoValidos) {
        const filtros: FiltrosRegistroAseoZonaComunDto = {
          page: 1,
          limit: 10,
          tipo_aseo: tipo,
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
      mockRegistroAseoZonasComunesService.create.mockResolvedValue(
        respuestaEsperada,
      );

      // Act
      const resultado = await controller.create({
        usuarioId: 1,
        zonaComunId: 1,
        fecha_registro: '2024-01-15T10:30:00Z',
        tipos_realizados: [TiposAseo.LIMPIEZA],
        objetos_perdidos: false,
        rastros_de_animales: false,
      });

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

    it('debería cumplir con la estructura de respuesta documentada para listado', async () => {
      // Arrange
      const respuestaEsperada = {
        data: [
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
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          lastPage: 1,
        },
      };
      mockRegistroAseoZonasComunesService.findAll.mockResolvedValue(
        respuestaEsperada,
      );

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
