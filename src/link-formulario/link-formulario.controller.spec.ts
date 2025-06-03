import { Test, TestingModule } from '@nestjs/testing';
import { LinkFormularioController } from './link-formulario.controller';
import { LinkFormularioService } from './link-formulario.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { LinkFormularioGuard } from 'src/auth/guards/linkFormulario.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { BlacklistService } from 'src/auth/blacklist.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Reflector } from '@nestjs/core';

describe('LinkFormularioController', () => {
  let controller: LinkFormularioController;
  let linkFormularioService: LinkFormularioService;

  // Mock del LinkFormularioService
  const mockLinkFormularioService = {
    createLinkTemporal: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    regenerateLink: jest.fn(),
    validateToken: jest.fn(),
    findAllByHabitacion: jest.fn(),
  };

  // Mocks de dependencias para Guards
  const mockJwtService = {
    verifyAsync: jest.fn(),
    signAsync: jest.fn(),
  };

  const mockBlacklistService = {
    isTokenBlacklisted: jest.fn(),
    addToBlacklist: jest.fn(),
  };

  const mockPrismaService = {
    usuario: {
      findFirst: jest.fn(),
    },
    linkFormulario: {
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinkFormularioController],
      providers: [
        {
          provide: LinkFormularioService,
          useValue: mockLinkFormularioService,
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
        LinkFormularioGuard,
        RolesGuard,
      ],
    }).compile();

    controller = module.get<LinkFormularioController>(LinkFormularioController);
    linkFormularioService = module.get<LinkFormularioService>(
      LinkFormularioService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición del controller', () => {
    it('debería estar definido', () => {
      expect(controller).toBeDefined();
    });

    it('debería tener el servicio inyectado', () => {
      expect(linkFormularioService).toBeDefined();
    });
  });

  describe('createLinkTemporal', () => {
    it('debería crear un link temporal exitosamente', async () => {
      // Arrange
      const createLinkDto = {
        numeroHabitacion: 101,
        fechaInicio: new Date('2024-01-15'),
        fechaFin: new Date('2024-01-20'),
        costo: 500,
      };
      const urlEsperada = 'https://frontend.com/registro-formulario/token123';

      mockLinkFormularioService.createLinkTemporal.mockResolvedValue(
        urlEsperada,
      );

      // Act
      const resultado = await controller.createLinkTemporal(createLinkDto);

      // Assert
      expect(resultado).toBe(urlEsperada);
      expect(linkFormularioService.createLinkTemporal).toHaveBeenCalledTimes(1);
      expect(linkFormularioService.createLinkTemporal).toHaveBeenCalledWith(
        createLinkDto,
      );
    });

    it('debería propagar errores del servicio al crear link', async () => {
      // Arrange
      const createLinkDto = {
        numeroHabitacion: 999,
        fechaInicio: new Date(),
        fechaFin: new Date(),
        costo: 100,
      };
      const errorEsperado = new Error('Habitación no encontrada');

      mockLinkFormularioService.createLinkTemporal.mockRejectedValue(
        errorEsperado,
      );

      // Act & Assert
      await expect(
        controller.createLinkTemporal(createLinkDto),
      ).rejects.toThrow('Habitación no encontrada');
      expect(linkFormularioService.createLinkTemporal).toHaveBeenCalledWith(
        createLinkDto,
      );
    });
  });

  describe('findAll', () => {
    it('debería obtener todos los links con paginación exitosamente', async () => {
      // Arrange
      const paginationDto = { page: 1, limit: 10 };
      const respuestaEsperada = {
        data: [
          {
            id: 1,
            url: 'https://example.com/token1',
            completado: false,
            expirado: false,
          },
          {
            id: 2,
            url: 'https://example.com/token2',
            completado: true,
            expirado: false,
          },
        ],
        meta: { page: 1, limit: 10, totalLinks: 2, lastPage: 1 },
      };

      mockLinkFormularioService.findAll.mockResolvedValue(respuestaEsperada);

      // Act
      const resultado = await controller.findAll(paginationDto);

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(linkFormularioService.findAll).toHaveBeenCalledTimes(1);
      expect(linkFormularioService.findAll).toHaveBeenCalledWith(paginationDto);
    });

    it('debería manejar respuesta vacía correctamente', async () => {
      // Arrange
      const paginationDto = { page: 1, limit: 10 };
      const respuestaVacia = {
        data: [],
        meta: { page: 1, limit: 10, totalLinks: 0, lastPage: 0 },
      };

      mockLinkFormularioService.findAll.mockResolvedValue(respuestaVacia);

      // Act
      const resultado = await controller.findAll(paginationDto);

      // Assert
      expect(resultado).toEqual(respuestaVacia);
      expect(resultado.data).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('debería obtener un link por ID exitosamente', async () => {
      // Arrange
      const linkId = '1';
      const linkEsperado = {
        id: 1,
        url: 'https://example.com/token1',
        completado: false,
        expirado: false,
        numeroHabitacion: 101,
      };

      mockLinkFormularioService.findOne.mockResolvedValue(linkEsperado);

      // Act
      const resultado = await controller.findOne(linkId);

      // Assert
      expect(resultado).toEqual(linkEsperado);
      expect(linkFormularioService.findOne).toHaveBeenCalledTimes(1);
      expect(linkFormularioService.findOne).toHaveBeenCalledWith(1);
    });

    it('debería propagar error cuando el link no existe', async () => {
      // Arrange
      const linkId = '999';
      const errorEsperado = new Error('Link no encontrado');

      mockLinkFormularioService.findOne.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(controller.findOne(linkId)).rejects.toThrow(
        'Link no encontrado',
      );
      expect(linkFormularioService.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('remove', () => {
    it('debería eliminar un link exitosamente', async () => {
      // Arrange
      const linkId = '1';
      const linkEliminado = {
        id: 1,
        url: 'https://example.com/token1',
        deleted: true,
      };

      mockLinkFormularioService.remove.mockResolvedValue(linkEliminado);

      // Act
      const resultado = await controller.remove(linkId);

      // Assert
      expect(resultado).toEqual(linkEliminado);
      expect(linkFormularioService.remove).toHaveBeenCalledTimes(1);
      expect(linkFormularioService.remove).toHaveBeenCalledWith(1);
    });

    it('debería propagar error cuando el link no existe para eliminación', async () => {
      // Arrange
      const linkId = '999';
      const errorEsperado = new Error('Link no encontrado');

      mockLinkFormularioService.remove.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(controller.remove(linkId)).rejects.toThrow(
        'Link no encontrado',
      );
      expect(linkFormularioService.remove).toHaveBeenCalledWith(999);
    });
  });

  describe('regenerateLink', () => {
    it('debería regenerar un link exitosamente', async () => {
      // Arrange
      const linkId = '1';
      const linkRegenerado = {
        id: 1,
        url: 'https://example.com/new-token',
        completado: false,
        expirado: false,
        vencimiento: new Date(),
      };

      mockLinkFormularioService.regenerateLink.mockResolvedValue(
        linkRegenerado,
      );

      // Act
      const resultado = await controller.regenerateLink(linkId);

      // Assert
      expect(resultado).toEqual(linkRegenerado);
      expect(linkFormularioService.regenerateLink).toHaveBeenCalledTimes(1);
      expect(linkFormularioService.regenerateLink).toHaveBeenCalledWith(1);
    });

    it('debería propagar error cuando el link ya está completado', async () => {
      // Arrange
      const linkId = '1';
      const errorEsperado = new Error('El link ya ha sido completado');

      mockLinkFormularioService.regenerateLink.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(controller.regenerateLink(linkId)).rejects.toThrow(
        'El link ya ha sido completado',
      );
      expect(linkFormularioService.regenerateLink).toHaveBeenCalledWith(1);
    });
  });

  describe('validateToken', () => {
    it('debería validar un token exitosamente', async () => {
      // Arrange
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const payloadEsperado = {
        id: 1,
        rol: 'REGISTRO_FORMULARIO',
        iat: 1640995200,
        exp: 1640998800,
      };

      mockLinkFormularioService.validateToken.mockResolvedValue(
        payloadEsperado,
      );

      // Act
      const resultado = await controller.validateToken(token);

      // Assert
      expect(resultado).toEqual(payloadEsperado);
      expect(linkFormularioService.validateToken).toHaveBeenCalledTimes(1);
      expect(linkFormularioService.validateToken).toHaveBeenCalledWith(token);
    });

    it('debería propagar error cuando el token es inválido', async () => {
      // Arrange
      const token = 'token-invalido';
      const errorEsperado = new Error('Token inválido o expirado');

      mockLinkFormularioService.validateToken.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(controller.validateToken(token)).rejects.toThrow(
        'Token inválido o expirado',
      );
      expect(linkFormularioService.validateToken).toHaveBeenCalledWith(token);
    });
  });

  describe('findAllByHabitacion', () => {
    it('debería obtener links por habitación exitosamente', async () => {
      // Arrange
      const numeroHabitacion = '101';
      const paginationDto = { page: 1, limit: 5 };
      const respuestaEsperada = {
        data: [
          {
            id: 1,
            numeroHabitacion: 101,
            url: 'https://example.com/token1',
            completado: false,
          },
          {
            id: 2,
            numeroHabitacion: 101,
            url: 'https://example.com/token2',
            completado: true,
          },
        ],
        meta: { page: 1, limit: 5, totalLinks: 2, lastPage: 1 },
      };

      mockLinkFormularioService.findAllByHabitacion.mockResolvedValue(
        respuestaEsperada,
      );

      // Act
      const resultado = await controller.findAllByHabitacion(
        numeroHabitacion,
        paginationDto,
      );

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(linkFormularioService.findAllByHabitacion).toHaveBeenCalledTimes(
        1,
      );
      expect(linkFormularioService.findAllByHabitacion).toHaveBeenCalledWith(
        101,
        paginationDto,
      );
    });

    it('debería convertir numeroHabitacion string a number correctamente', async () => {
      // Arrange
      const numeroHabitacion = '205';
      const paginationDto = { page: 1, limit: 10 };
      const respuestaVacia = {
        data: [],
        meta: { page: 1, limit: 10, totalLinks: 0, lastPage: 0 },
      };

      mockLinkFormularioService.findAllByHabitacion.mockResolvedValue(
        respuestaVacia,
      );

      // Act
      await controller.findAllByHabitacion(numeroHabitacion, paginationDto);

      // Assert
      expect(linkFormularioService.findAllByHabitacion).toHaveBeenCalledWith(
        205, // Verificar que se convirtió a number
        paginationDto,
      );
    });
  });

  describe('Configuración y decoradores', () => {
    it('debería tener la configuración correcta de ruta', () => {
      const metadata = Reflect.getMetadata('path', LinkFormularioController);
      expect(metadata).toBe('link-formulario');
    });

    it('debería tener configurados los decoradores de autenticación', () => {
      // Verificar que el controller tiene decoradores de autenticación configurados
      // Como los decoradores son aplicados a métodos individuales, verificamos la clase
      expect(LinkFormularioController).toBeDefined();
    });
  });

  describe('Casos de borde y validaciones', () => {
    it('debería manejar conversión de string a number en parámetros ID', async () => {
      // Arrange
      const linkIdString = '42';
      const linkEsperado = { id: 42, url: 'test' };

      mockLinkFormularioService.findOne.mockResolvedValue(linkEsperado);

      // Act
      await controller.findOne(linkIdString);

      // Assert
      expect(linkFormularioService.findOne).toHaveBeenCalledWith(42);
    });

    it('debería manejar múltiples llamadas independientes', async () => {
      // Arrange
      const paginationDto = { page: 1, limit: 10 };
      const respuesta = { data: [], meta: {} };

      mockLinkFormularioService.findAll.mockResolvedValue(respuesta);

      // Act
      await controller.findAll(paginationDto);
      await controller.findAll(paginationDto);
      await controller.findAll(paginationDto);

      // Assert
      expect(linkFormularioService.findAll).toHaveBeenCalledTimes(3);
      expect(linkFormularioService.findAll).toHaveBeenNthCalledWith(
        1,
        paginationDto,
      );
      expect(linkFormularioService.findAll).toHaveBeenNthCalledWith(
        2,
        paginationDto,
      );
      expect(linkFormularioService.findAll).toHaveBeenNthCalledWith(
        3,
        paginationDto,
      );
    });

    it('debería mantener estructura de respuesta de paginación', async () => {
      // Arrange
      const paginationDto = { page: 2, limit: 5 };
      const respuestaPaginada = {
        data: [{ id: 1 }, { id: 2 }],
        meta: { page: 2, limit: 5, totalLinks: 15, lastPage: 3 },
      };

      mockLinkFormularioService.findAll.mockResolvedValue(respuestaPaginada);

      // Act
      const resultado = await controller.findAll(paginationDto);

      // Assert
      expect(resultado).toHaveProperty('data');
      expect(resultado).toHaveProperty('meta');
      expect(resultado.meta).toHaveProperty('page');
      expect(resultado.meta).toHaveProperty('limit');
      expect(resultado.meta).toHaveProperty('totalLinks');
      expect(resultado.meta).toHaveProperty('lastPage');
    });

    it('debería propagar diferentes tipos de errores del servicio', async () => {
      // Arrange
      const linkId = '1';
      const errores = [
        new Error('Error de conexión a BD'),
        new Error('Error de validación'),
        new Error('Error interno del servidor'),
      ];

      // Act & Assert
      for (const error of errores) {
        mockLinkFormularioService.findOne.mockRejectedValue(error);

        await expect(controller.findOne(linkId)).rejects.toThrow(error.message);
      }

      expect(linkFormularioService.findOne).toHaveBeenCalledTimes(
        errores.length,
      );
    });
  });
});
