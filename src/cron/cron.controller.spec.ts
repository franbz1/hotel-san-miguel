import { Test, TestingModule } from '@nestjs/testing';
import { CronController } from './cron.controller';
import { CronService } from './cron.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { BlacklistService } from 'src/auth/blacklist.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Reflector } from '@nestjs/core';

describe('CronController', () => {
  let controller: CronController;
  let cronService: CronService;

  // Mock del CronService
  const mockCronService = {
    marcarEstadosCronConTransaccion: jest.fn(),
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
      controllers: [CronController],
      providers: [
        {
          provide: CronService,
          useValue: mockCronService,
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

    controller = module.get<CronController>(CronController);
    cronService = module.get<CronService>(CronService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición del controller', () => {
    it('debería estar definido', () => {
      expect(controller).toBeDefined();
    });

    it('debería tener el servicio inyectado', () => {
      expect(cronService).toBeDefined();
    });
  });

  describe('manualMarcarEstados', () => {
    it('debería ejecutar la actualización manual de estados exitosamente', async () => {
      // Arrange
      const resultadoEsperado = {
        habitaciones: {
          near: 2,
          occupied: 1,
          free: 3,
        },
        reservas: {
          finalizadas: 1,
        },
      };

      mockCronService.marcarEstadosCronConTransaccion.mockResolvedValue(
        resultadoEsperado,
      );

      // Act
      const resultado = await controller.manualMarcarEstados();

      // Assert
      expect(resultado).toEqual(resultadoEsperado);
      expect(cronService.marcarEstadosCronConTransaccion).toHaveBeenCalledTimes(
        1,
      );
      expect(
        cronService.marcarEstadosCronConTransaccion,
      ).toHaveBeenCalledWith();
    });

    it('debería retornar resultado con contadores en cero cuando no hay cambios', async () => {
      // Arrange
      const resultadoVacio = {
        habitaciones: {
          near: 0,
          occupied: 0,
          free: 0,
        },
        reservas: {
          finalizadas: 0,
        },
      };

      mockCronService.marcarEstadosCronConTransaccion.mockResolvedValue(
        resultadoVacio,
      );

      // Act
      const resultado = await controller.manualMarcarEstados();

      // Assert
      expect(resultado).toEqual(resultadoVacio);
      expect(resultado.habitaciones.near).toBe(0);
      expect(resultado.habitaciones.occupied).toBe(0);
      expect(resultado.habitaciones.free).toBe(0);
      expect(resultado.reservas.finalizadas).toBe(0);
    });

    it('debería propagar errores del servicio', async () => {
      // Arrange
      const errorEsperado = new Error('Error en la base de datos');
      mockCronService.marcarEstadosCronConTransaccion.mockRejectedValue(
        errorEsperado,
      );

      // Act & Assert
      await expect(controller.manualMarcarEstados()).rejects.toThrow(
        'Error en la base de datos',
      );
      expect(cronService.marcarEstadosCronConTransaccion).toHaveBeenCalledTimes(
        1,
      );
    });

    it('debería manejar diferentes tipos de errores del servicio', async () => {
      // Arrange
      const errores = [
        new Error('Error de conexión a BD'),
        new Error('Error de transacción'),
        new Error('Error interno del servidor'),
      ];

      // Act & Assert
      for (const error of errores) {
        mockCronService.marcarEstadosCronConTransaccion.mockRejectedValue(
          error,
        );

        await expect(controller.manualMarcarEstados()).rejects.toThrow(
          error.message,
        );
      }

      expect(cronService.marcarEstadosCronConTransaccion).toHaveBeenCalledTimes(
        errores.length,
      );
    });
  });

  describe('Configuración y decoradores', () => {
    it('debería tener la configuración correcta de ruta', () => {
      const metadata = Reflect.getMetadata('path', CronController);
      expect(metadata).toBe('cron');
    });

    it('debería requerir autenticación de administrador', () => {
      // Verificar que tiene el decorador @Auth con Role.ADMINISTRADOR
      const authMetadata = Reflect.getMetadata('roles', CronController);
      // Este test verifica la existencia del decorador, la lógica específica
      // se testea en los tests de guards
      expect(authMetadata).toBeDefined();
    });
  });

  describe('Casos de borde y validaciones', () => {
    it('debería manejar valores numéricos grandes correctamente', async () => {
      // Arrange
      const resultadoGrande = {
        habitaciones: {
          near: 999,
          occupied: 1000,
          free: 2500,
        },
        reservas: {
          finalizadas: 500,
        },
      };

      mockCronService.marcarEstadosCronConTransaccion.mockResolvedValue(
        resultadoGrande,
      );

      // Act
      const resultado = await controller.manualMarcarEstados();

      // Assert
      expect(resultado).toEqual(resultadoGrande);
      expect(resultado.habitaciones.near).toBe(999);
      expect(resultado.habitaciones.occupied).toBe(1000);
      expect(resultado.habitaciones.free).toBe(2500);
      expect(resultado.reservas.finalizadas).toBe(500);
    });

    it('debería mantener la estructura de respuesta incluso con datos vacíos', async () => {
      // Arrange
      const resultadoNulo = {
        habitaciones: {
          near: 0,
          occupied: 0,
          free: 0,
        },
        reservas: {
          finalizadas: 0,
        },
      };

      mockCronService.marcarEstadosCronConTransaccion.mockResolvedValue(
        resultadoNulo,
      );

      // Act
      const resultado = await controller.manualMarcarEstados();

      // Assert
      expect(resultado).toHaveProperty('habitaciones');
      expect(resultado.habitaciones).toHaveProperty('near');
      expect(resultado.habitaciones).toHaveProperty('occupied');
      expect(resultado.habitaciones).toHaveProperty('free');
      expect(resultado).toHaveProperty('reservas');
      expect(resultado.reservas).toHaveProperty('finalizadas');
    });

    it('debería llamar al método del servicio solo una vez por invocación', async () => {
      // Arrange
      const resultado = {
        habitaciones: { near: 1, occupied: 1, free: 1 },
        reservas: { finalizadas: 1 },
      };

      mockCronService.marcarEstadosCronConTransaccion.mockResolvedValue(
        resultado,
      );

      // Act
      await controller.manualMarcarEstados();
      await controller.manualMarcarEstados();
      await controller.manualMarcarEstados();

      // Assert
      expect(cronService.marcarEstadosCronConTransaccion).toHaveBeenCalledTimes(
        3,
      );
      // Cada llamada debería ser independiente sin parámetros
      expect(
        cronService.marcarEstadosCronConTransaccion,
      ).toHaveBeenNthCalledWith(1);
      expect(
        cronService.marcarEstadosCronConTransaccion,
      ).toHaveBeenNthCalledWith(2);
      expect(
        cronService.marcarEstadosCronConTransaccion,
      ).toHaveBeenNthCalledWith(3);
    });
  });
});
