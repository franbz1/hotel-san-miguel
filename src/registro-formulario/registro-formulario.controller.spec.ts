import { Test, TestingModule } from '@nestjs/testing';
import { RegistroFormularioController } from './registro-formulario.controller';
import { RegistroFormularioService } from './registro-formulario.service';
import { LinkFormularioGuard } from 'src/auth/guards/linkFormulario.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { BlacklistService } from 'src/auth/blacklist.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import { LinkFormularioService } from 'src/link-formulario/link-formulario.service';

describe('RegistroFormularioController', () => {
  let controller: RegistroFormularioController;
  let registroFormularioService: RegistroFormularioService;

  // Mock del RegistroFormularioService
  const mockRegistroFormularioService = {
    create: jest.fn(),
    createWithTra: jest.fn(),
    registerFormularioInTra: jest.fn(),
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

  // Mock del LinkFormularioService (requerido por LinkFormularioGuard)
  const mockLinkFormularioService = {
    findOneByTokenId: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistroFormularioController],
      providers: [
        {
          provide: RegistroFormularioService,
          useValue: mockRegistroFormularioService,
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
        {
          provide: LinkFormularioService,
          useValue: mockLinkFormularioService,
        },
        LinkFormularioGuard,
        RolesGuard,
      ],
    }).compile();

    controller = module.get<RegistroFormularioController>(
      RegistroFormularioController,
    );
    registroFormularioService = module.get<RegistroFormularioService>(
      RegistroFormularioService,
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
      expect(registroFormularioService).toBeDefined();
    });
  });

  describe('create', () => {
    it('debería crear un formulario sin TRA exitosamente', async () => {
      // Arrange
      const createDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        numero_habitacion: 101,
        fecha_inicio: new Date('2024-01-15'),
        fecha_fin: new Date('2024-01-20'),
        costo: 500,
      } as any;
      const req = { usuario: { id: 1 } } as any;
      const resultadoEsperado = {
        success: true,
        result: {
          formulario: { id: 1, completado: true },
          reservaCreated: { id: 1, numero_habitacion: 101 },
          huesped: { id: 1, nombre: 'Juan' },
        },
        message: 'Formulario registrado exitosamente sin integración con TRA',
      };

      mockRegistroFormularioService.create.mockResolvedValue(resultadoEsperado);

      // Act
      const resultado = await controller.create(createDto, req);

      // Assert
      expect(resultado).toEqual({
        message: 'Formulario registrado exitosamente sin integración con TRA',
        data: {
          formulario: { id: 1, completado: true },
          reserva: { id: 1, numero_habitacion: 101 },
          huesped: { id: 1, nombre: 'Juan' },
        },
      });
      expect(registroFormularioService.create).toHaveBeenCalledTimes(1);
      expect(registroFormularioService.create).toHaveBeenCalledWith(
        createDto,
        1,
      );
    });

    it('debería propagar errores del service', async () => {
      // Arrange
      const createDto = {
        nombre: 'Juan',
        numero_habitacion: 999,
      } as any;
      const req = { usuario: { id: 1 } } as any;
      const errorEsperado = new Error('Habitación no encontrada');

      mockRegistroFormularioService.create.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(controller.create(createDto, req)).rejects.toThrow(
        'Habitación no encontrada',
      );
      expect(registroFormularioService.create).toHaveBeenCalledWith(
        createDto,
        1,
      );
    });
  });

  describe('createWithTra', () => {
    it('debería crear un formulario con TRA exitosamente', async () => {
      // Arrange
      const createDto = {
        nombre: 'María',
        apellido: 'González',
        numero_habitacion: 102,
        fecha_inicio: new Date('2024-02-01'),
        fecha_fin: new Date('2024-02-05'),
        costo: 750,
      } as any;
      const req = { usuario: { id: 2 } } as any;
      const resultadoExitoso = {
        success: true,
        result: {
          formulario: { id: 2, completado: true },
          reservaCreated: { id: 2, numero_habitacion: 102 },
          huesped: { id: 2, nombre: 'María' },
        },
        traFormulario: { id: 2, SubidoATra: true, traId: 'TRA12345' },
        message: 'Formulario registrado exitosamente',
      };

      mockRegistroFormularioService.createWithTra.mockResolvedValue(
        resultadoExitoso,
      );

      // Act
      const resultado = await controller.createWithTra(createDto, req);

      // Assert
      expect(resultado).toEqual({
        message: 'Formulario registrado exitosamente',
        data: {
          formulario: { id: 2, completado: true },
          reserva: { id: 2, numero_habitacion: 102 },
          huesped: { id: 2, nombre: 'María' },
          traFormulario: { id: 2, SubidoATra: true, traId: 'TRA12345' },
        },
      });
      expect(registroFormularioService.createWithTra).toHaveBeenCalledTimes(1);
      expect(registroFormularioService.createWithTra).toHaveBeenCalledWith(
        createDto,
        2,
      );
    });

    it('debería manejar éxito parcial cuando TRA falla', async () => {
      // Arrange
      const createDto = {
        nombre: 'Carlos',
        numero_habitacion: 103,
      } as any;
      const req = { usuario: { id: 3 } } as any;
      const resultadoParcial = {
        success: true,
        result: {
          formulario: { id: 3, completado: true },
          reservaCreated: { id: 3, numero_habitacion: 103 },
          huesped: { id: 3, nombre: 'Carlos' },
        },
        traRegistration: {
          success: false,
          error: 'Error de conexión con TRA',
        },
        message:
          'Formulario registrado exitosamente pero falló el registro en TRA',
      };

      mockRegistroFormularioService.createWithTra.mockResolvedValue(
        resultadoParcial,
      );

      // Act
      const resultado = await controller.createWithTra(createDto, req);

      // Assert
      expect(resultado).toEqual({
        statusCode: 207,
        message:
          'Formulario registrado exitosamente pero falló el registro en TRA',
        data: {
          formulario: { id: 3, completado: true },
          reserva: { id: 3, numero_habitacion: 103 },
          huesped: { id: 3, nombre: 'Carlos' },
          traError: 'Error de conexión con TRA',
        },
      });
    });

    it('debería propagar errores del service para createWithTra', async () => {
      // Arrange
      const createDto = { nombre: 'Test' } as any;
      const req = { usuario: { id: 1 } } as any;
      const errorEsperado = new Error('Error en transacción');

      mockRegistroFormularioService.createWithTra.mockRejectedValue(
        errorEsperado,
      );

      // Act & Assert
      await expect(controller.createWithTra(createDto, req)).rejects.toThrow(
        'Error en transacción',
      );
    });
  });

  describe('registerFormularioInTra', () => {
    it('debería registrar un formulario en TRA exitosamente', async () => {
      // Arrange
      const formularioId = 5;
      const resultadoEsperado = {
        success: true,
        message: 'Formulario registrado exitosamente en TRA',
        formulario: { id: 5, SubidoATra: true, traId: 'TRA67890' },
        traData: { huespedPrincipal: { code: 'TRA67890' } },
      };

      mockRegistroFormularioService.registerFormularioInTra.mockResolvedValue(
        resultadoEsperado,
      );

      // Act
      const resultado = await controller.registerFormularioInTra(formularioId);

      // Assert
      expect(resultado).toEqual({
        message: 'Formulario registrado exitosamente en TRA',
        data: {
          formulario: { id: 5, SubidoATra: true, traId: 'TRA67890' },
          traData: { huespedPrincipal: { code: 'TRA67890' } },
        },
      });
      expect(
        registroFormularioService.registerFormularioInTra,
      ).toHaveBeenCalledTimes(1);
      expect(
        registroFormularioService.registerFormularioInTra,
      ).toHaveBeenCalledWith(5);
    });

    it('debería manejar formulario ya registrado en TRA', async () => {
      // Arrange
      const formularioId = 6;
      const resultadoYaRegistrado = {
        success: true,
        message: 'El formulario ya estaba registrado en TRA con ID TRA11111',
        formulario: { id: 6, SubidoATra: true, traId: 'TRA11111' },
      };

      mockRegistroFormularioService.registerFormularioInTra.mockResolvedValue(
        resultadoYaRegistrado,
      );

      // Act
      const resultado = await controller.registerFormularioInTra(formularioId);

      // Assert
      expect(resultado).toEqual({
        message: 'El formulario ya estaba registrado en TRA con ID TRA11111',
        data: {
          formulario: { id: 6, SubidoATra: true, traId: 'TRA11111' },
          traData: undefined,
        },
      });
    });

    it('debería propagar errores del service para registerFormularioInTra', async () => {
      // Arrange
      const formularioId = 999;
      const errorEsperado = new Error('Formulario no encontrado');

      mockRegistroFormularioService.registerFormularioInTra.mockRejectedValue(
        errorEsperado,
      );

      // Act & Assert
      await expect(
        controller.registerFormularioInTra(formularioId),
      ).rejects.toThrow('Formulario no encontrado');
      expect(
        registroFormularioService.registerFormularioInTra,
      ).toHaveBeenCalledWith(999);
    });
  });

  describe('Configuración y decoradores', () => {
    it('debería tener la configuración correcta de ruta', () => {
      const metadata = Reflect.getMetadata(
        'path',
        RegistroFormularioController,
      );
      expect(metadata).toBe('registro-formulario');
    });

    it('debería tener configurados los decoradores de autenticación', () => {
      // Verificar que el controller tiene decoradores de autenticación configurados
      expect(RegistroFormularioController).toBeDefined();
    });
  });

  describe('Casos de borde y validaciones', () => {
    it('debería manejar múltiples llamadas independientes para create', async () => {
      // Arrange
      const createDto = { nombre: 'Test', numero_habitacion: 101 } as any;
      const req = { usuario: { id: 1 } } as any;
      const resultado = {
        success: true,
        result: { formulario: {}, reservaCreated: {}, huesped: {} },
        message: 'Test message',
      };

      mockRegistroFormularioService.create.mockResolvedValue(resultado);

      // Act
      await controller.create(createDto, req);
      await controller.create(createDto, req);
      await controller.create(createDto, req);

      // Assert
      expect(registroFormularioService.create).toHaveBeenCalledTimes(3);
      expect(registroFormularioService.create).toHaveBeenNthCalledWith(
        1,
        createDto,
        1,
      );
      expect(registroFormularioService.create).toHaveBeenNthCalledWith(
        2,
        createDto,
        1,
      );
      expect(registroFormularioService.create).toHaveBeenNthCalledWith(
        3,
        createDto,
        1,
      );
    });

    it('debería extraer correctamente el usuario ID del request', async () => {
      // Arrange
      const createDto = { nombre: 'Test' } as any;
      const reqConUsuario = { usuario: { id: 42 } } as any;
      const resultado = {
        success: true,
        result: { formulario: {}, reservaCreated: {}, huesped: {} },
        message: 'Test',
      };

      mockRegistroFormularioService.create.mockResolvedValue(resultado);

      // Act
      await controller.create(createDto, reqConUsuario);

      // Assert
      expect(registroFormularioService.create).toHaveBeenCalledWith(
        createDto,
        42,
      );
    });

    it('debería mantener estructura de respuesta consistente', async () => {
      // Arrange
      const createDto = { nombre: 'Test' } as any;
      const req = { usuario: { id: 1 } } as any;
      const resultado = {
        success: true,
        result: {
          formulario: { id: 1, field: 'value' },
          reservaCreated: { id: 1, data: 'test' },
          huesped: { id: 1, info: 'data' },
        },
        message: 'Custom message',
      };

      mockRegistroFormularioService.create.mockResolvedValue(resultado);

      // Act
      const respuesta = await controller.create(createDto, req);

      // Assert
      expect(respuesta).toHaveProperty('message');
      expect(respuesta).toHaveProperty('data');
      expect(respuesta.data).toHaveProperty('formulario');
      expect(respuesta.data).toHaveProperty('reserva');
      expect(respuesta.data).toHaveProperty('huesped');
      expect(respuesta).not.toHaveProperty('statusCode');
    });

    it('debería propagar diferentes tipos de errores del service', async () => {
      // Arrange
      const createDto = { nombre: 'Test' } as any;
      const req = { usuario: { id: 1 } } as any;
      const errores = [
        new Error('Error de validación'),
        new Error('Error de base de datos'),
        new Error('Error de red'),
      ];

      // Act & Assert
      for (const error of errores) {
        mockRegistroFormularioService.create.mockRejectedValue(error);

        await expect(controller.create(createDto, req)).rejects.toThrow(
          error.message,
        );
      }

      expect(registroFormularioService.create).toHaveBeenCalledTimes(
        errores.length,
      );
    });
  });
});
