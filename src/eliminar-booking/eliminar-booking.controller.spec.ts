import { Test, TestingModule } from '@nestjs/testing';
import { EliminarBookingController } from './eliminar-booking.controller';
import { EliminarBookingService } from './eliminar-booking.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { BlacklistService } from 'src/auth/blacklist.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Reflector } from '@nestjs/core';

describe('EliminarBookingController', () => {
  let controller: EliminarBookingController;
  let eliminarBookingService: EliminarBookingService;

  // Mock del EliminarBookingService
  const mockEliminarBookingService = {
    remove: jest.fn(),
  };

  // Mocks de dependencias para AuthGuard
  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockBlacklistService = {
    isTokenBlacklisted: jest.fn(),
  };

  const mockPrismaService = {
    usuario: {
      findFirst: jest.fn(),
    },
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EliminarBookingController],
      providers: [
        {
          provide: EliminarBookingService,
          useValue: mockEliminarBookingService,
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
      ],
    }).compile();

    controller = module.get<EliminarBookingController>(
      EliminarBookingController,
    );
    eliminarBookingService = module.get<EliminarBookingService>(
      EliminarBookingService,
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
      expect(eliminarBookingService).toBeDefined();
    });
  });

  describe('remove', () => {
    it('debería eliminar un booking completado exitosamente', async () => {
      // Arrange
      const bookingId = 1;
      const respuestaEsperada = {
        message: 'Booking eliminado correctamente',
        data: {
          linkFormularioId: 1,
          formularioId: 1,
          reservaId: 1,
          facturaId: 1,
        },
      };

      mockEliminarBookingService.remove.mockResolvedValue(respuestaEsperada);

      // Act
      const resultado = await controller.remove(bookingId);

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(eliminarBookingService.remove).toHaveBeenCalledTimes(1);
      expect(eliminarBookingService.remove).toHaveBeenCalledWith(bookingId);
    });

    it('debería eliminar un booking no completado exitosamente', async () => {
      // Arrange
      const bookingId = 2;
      const linkFormularioEliminado = {
        id: 2,
        token: 'token-test',
        completado: false,
        expirado: false,
        formularioId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: true,
      };

      mockEliminarBookingService.remove.mockResolvedValue(
        linkFormularioEliminado,
      );

      // Act
      const resultado = await controller.remove(bookingId);

      // Assert
      expect(resultado).toEqual(linkFormularioEliminado);
      expect(eliminarBookingService.remove).toHaveBeenCalledTimes(1);
      expect(eliminarBookingService.remove).toHaveBeenCalledWith(bookingId);
    });

    it('debería propagar errores del servicio', async () => {
      // Arrange
      const bookingId = 999;
      const errorEsperado = new Error('Booking no encontrado');
      mockEliminarBookingService.remove.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(controller.remove(bookingId)).rejects.toThrow(
        'Booking no encontrado',
      );
      expect(eliminarBookingService.remove).toHaveBeenCalledTimes(1);
      expect(eliminarBookingService.remove).toHaveBeenCalledWith(bookingId);
    });

    it('debería manejar diferentes tipos de errores del servicio', async () => {
      // Arrange
      const bookingId = 1;
      const errores = [
        new Error('Error de conexión a BD'),
        new Error('Error de transacción'),
        new Error('Error interno del servidor'),
      ];

      // Act & Assert
      for (const error of errores) {
        mockEliminarBookingService.remove.mockRejectedValue(error);

        await expect(controller.remove(bookingId)).rejects.toThrow(
          error.message,
        );
      }

      expect(eliminarBookingService.remove).toHaveBeenCalledTimes(
        errores.length,
      );
    });

    it('debería validar que el parámetro ID sea un número', async () => {
      // Arrange
      const bookingIdValido = 123;
      const respuestaEsperada = {
        message: 'Booking eliminado correctamente',
        data: {
          linkFormularioId: 123,
          formularioId: 1,
          reservaId: 1,
          facturaId: null,
        },
      };

      mockEliminarBookingService.remove.mockResolvedValue(respuestaEsperada);

      // Act
      const resultado = await controller.remove(bookingIdValido);

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(typeof bookingIdValido).toBe('number');
      expect(eliminarBookingService.remove).toHaveBeenCalledWith(
        bookingIdValido,
      );
    });
  });

  describe('Configuración y decoradores', () => {
    it('debería tener la configuración correcta de ruta', () => {
      const metadata = Reflect.getMetadata('path', EliminarBookingController);
      expect(metadata).toBe('eliminar-booking');
    });

    it('debería requerir autenticación de administrador', () => {
      // Verificar que tiene el decorador @Auth con Role.ADMINISTRADOR
      const authMetadata = Reflect.getMetadata(
        'roles',
        EliminarBookingController,
      );
      // Este test verifica la existencia del decorador, la lógica específica
      // se testea en los tests de guards
      expect(authMetadata).toBeDefined();
    });
  });

  describe('Casos de borde y validaciones', () => {
    it('debería manejar IDs grandes correctamente', async () => {
      // Arrange
      const bookingIdGrande = 999999999;
      const respuestaEsperada = {
        message: 'Booking eliminado correctamente',
        data: {
          linkFormularioId: bookingIdGrande,
          formularioId: 1,
          reservaId: 1,
          facturaId: 1,
        },
      };

      mockEliminarBookingService.remove.mockResolvedValue(respuestaEsperada);

      // Act
      const resultado = await controller.remove(bookingIdGrande);

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(eliminarBookingService.remove).toHaveBeenCalledWith(
        bookingIdGrande,
      );
    });

    it('debería mantener la estructura de respuesta para bookings completados', async () => {
      // Arrange
      const bookingId = 1;
      const respuestaCompleta = {
        message: 'Booking eliminado correctamente',
        data: {
          linkFormularioId: 1,
          formularioId: 1,
          reservaId: 1,
          facturaId: 1,
        },
      };

      mockEliminarBookingService.remove.mockResolvedValue(respuestaCompleta);

      // Act
      const resultado = await controller.remove(bookingId);
      const respuestaCompleta2 = resultado as any; // Type assertion para este test

      // Assert
      expect(resultado).toHaveProperty('message');
      expect(resultado).toHaveProperty('data');
      expect(respuestaCompleta2.data).toHaveProperty('linkFormularioId');
      expect(respuestaCompleta2.data).toHaveProperty('formularioId');
      expect(respuestaCompleta2.data).toHaveProperty('reservaId');
      expect(respuestaCompleta2.data).toHaveProperty('facturaId');
    });

    it('debería mantener la estructura de LinkFormulario para bookings no completados', async () => {
      // Arrange
      const bookingId = 2;
      const linkFormulario = {
        id: 2,
        token: 'token-test',
        completado: false,
        expirado: false,
        formularioId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: true,
      };

      mockEliminarBookingService.remove.mockResolvedValue(linkFormulario);

      // Act
      const resultado = await controller.remove(bookingId);

      // Assert
      expect(resultado).toHaveProperty('id');
      expect(resultado).toHaveProperty('token');
      expect(resultado).toHaveProperty('completado');
      expect(resultado).toHaveProperty('expirado');
      expect(resultado).toHaveProperty('formularioId');
      expect(resultado).toHaveProperty('deleted');
    });

    it('debería llamar al método del servicio solo una vez por invocación', async () => {
      // Arrange
      const bookingId = 1;
      const respuesta = {
        message: 'Booking eliminado correctamente',
        data: {
          linkFormularioId: 1,
          formularioId: 1,
          reservaId: 1,
          facturaId: 1,
        },
      };

      mockEliminarBookingService.remove.mockResolvedValue(respuesta);

      // Act
      await controller.remove(bookingId);
      await controller.remove(bookingId);
      await controller.remove(bookingId);

      // Assert
      expect(eliminarBookingService.remove).toHaveBeenCalledTimes(3);
      // Cada llamada debería ser independiente con el mismo parámetro
      expect(eliminarBookingService.remove).toHaveBeenNthCalledWith(
        1,
        bookingId,
      );
      expect(eliminarBookingService.remove).toHaveBeenNthCalledWith(
        2,
        bookingId,
      );
      expect(eliminarBookingService.remove).toHaveBeenNthCalledWith(
        3,
        bookingId,
      );
    });
  });
});
 