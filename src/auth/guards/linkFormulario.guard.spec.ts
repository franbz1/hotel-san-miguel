import { Test, TestingModule } from '@nestjs/testing';
import { LinkFormularioGuard } from './linkFormulario.guard';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { LinkFormularioService } from 'src/link-formulario/link-formulario.service';
import { BlacklistService } from '../blacklist.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

// Mock de envs
jest.mock('src/config/envs', () => ({
  envs: {
    jwtSecret: 'test-secret-key',
  },
}));

describe('LinkFormularioGuard', () => {
  let guard: LinkFormularioGuard;

  // Mocks de los servicios
  const mockJwtService = {
    decode: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockLinkFormularioService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockBlacklistService = {
    isTokenBlacklisted: jest.fn(),
  };

  // Mock del ExecutionContext
  const mockRequest = {
    params: {} as any,
  };

  const mockHttpContext = {
    getRequest: jest.fn().mockReturnValue(mockRequest),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
  } as unknown as ExecutionContext;

  // Datos compartidos para los tests
  const formularioMock = {
    id: 1,
    completado: false,
    expirado: false,
  };

  const payloadMock = {
    id: 1,
    rol: 'REGISTRO_FORMULARIO',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkFormularioGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: LinkFormularioService,
          useValue: mockLinkFormularioService,
        },
        {
          provide: BlacklistService,
          useValue: mockBlacklistService,
        },
      ],
    }).compile();

    guard = module.get<LinkFormularioGuard>(LinkFormularioGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset request object
    mockRequest.params = {};
    delete mockRequest['usuario'];
  });

  describe('Definición del guard', () => {
    it('debería estar definido', () => {
      expect(guard).toBeDefined();
    });
  });

  describe('canActivate', () => {
    it('debería permitir acceso con token válido y formulario no completado', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      mockRequest.params.token = token;

      mockJwtService.decode.mockReturnValue(payloadMock);
      mockLinkFormularioService.findOne.mockResolvedValue(formularioMock);
      mockJwtService.verifyAsync.mockResolvedValue(payloadMock);
      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);

      // Act
      const resultado = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(true);
      expect(mockJwtService.decode).toHaveBeenCalledWith(token);
      expect(mockLinkFormularioService.findOne).toHaveBeenCalledWith(1);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'test-secret-key',
      });
      expect(mockBlacklistService.isTokenBlacklisted).toHaveBeenCalledWith(
        token,
      );
      expect(mockRequest['usuario']).toEqual(payloadMock);
    });

    it('debería lanzar UnauthorizedException cuando no se proporciona token', async () => {
      // Arrange
      mockRequest.params.token = undefined;

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Link invalido',
      );
    });

    it('debería lanzar UnauthorizedException cuando el formulario ya está completado', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      mockRequest.params.token = token;

      const formularioCompletado = { ...formularioMock, completado: true };

      mockJwtService.decode.mockReturnValue(payloadMock);
      mockLinkFormularioService.findOne.mockResolvedValue(formularioCompletado);

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Formulario ya completado',
      );
    });

    it('debería lanzar UnauthorizedException cuando el formulario está expirado', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      mockRequest.params.token = token;

      const formularioExpirado = { ...formularioMock, expirado: true };

      mockJwtService.decode.mockReturnValue(payloadMock);
      mockLinkFormularioService.findOne.mockResolvedValue(formularioExpirado);
      mockJwtService.verifyAsync.mockResolvedValue(payloadMock);

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Link expirado',
      );
    });

    it('debería lanzar UnauthorizedException cuando el token está en blacklist', async () => {
      // Arrange
      const token = 'blacklisted.token';
      mockRequest.params.token = token;

      mockJwtService.decode.mockReturnValue(payloadMock);
      mockLinkFormularioService.findOne.mockResolvedValue(formularioMock);
      mockJwtService.verifyAsync.mockResolvedValue(payloadMock);
      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(true);

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Link invalido',
      );
    });

    it('debería lanzar UnauthorizedException cuando el token JWT es inválido', async () => {
      // Arrange
      const token = 'invalid.jwt.token';
      mockRequest.params.token = token;

      mockJwtService.decode.mockReturnValue(payloadMock);
      mockLinkFormularioService.findOne.mockResolvedValue(formularioMock);
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Link invalido',
      );
    });

    it('debería manejar token expirado y marcar formulario como expirado', async () => {
      // Arrange
      const token = 'expired.jwt.token';
      mockRequest.params.token = token;

      mockJwtService.decode.mockReturnValue(payloadMock);
      mockLinkFormularioService.findOne.mockResolvedValue(formularioMock);

      // Primera llamada: falla con TokenExpiredError
      // Segunda llamada: éxito con ignoreExpiration
      mockJwtService.verifyAsync
        .mockRejectedValueOnce(
          new TokenExpiredError('Token expired', new Date()),
        )
        .mockResolvedValueOnce(payloadMock);

      mockLinkFormularioService.update.mockResolvedValue({});

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Link expirado',
      );

      // Verificar que se marcó el formulario como expirado
      expect(mockLinkFormularioService.update).toHaveBeenCalledWith(1, {
        expirado: true,
      });
    });

    it('debería lanzar UnauthorizedException cuando no se puede decodificar el token', async () => {
      // Arrange
      const token = 'malformed.token';
      mockRequest.params.token = token;

      mockJwtService.decode.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Link invalido',
      );
    });

    it('debería lanzar UnauthorizedException cuando el formulario no existe', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      mockRequest.params.token = token;

      mockJwtService.decode.mockReturnValue(payloadMock);
      mockLinkFormularioService.findOne.mockRejectedValue(
        new Error('Not found'),
      );

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Link invalido',
      );
    });

    it('debería manejar errores en el manejo de tokens expirados', async () => {
      // Arrange
      const token = 'expired.jwt.token';
      mockRequest.params.token = token;

      mockJwtService.decode.mockReturnValue(payloadMock);
      mockLinkFormularioService.findOne.mockResolvedValue(formularioMock);
      mockJwtService.verifyAsync
        .mockRejectedValueOnce(
          new TokenExpiredError('Token expired', new Date()),
        )
        .mockRejectedValueOnce(
          new Error('Cannot verify with ignoreExpiration'),
        );

      // Act & Assert
      // Incluso si handleExpiredToken falla, debería lanzar 'Link expirado'
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Link expirado',
      );
    });
  });

  describe('Casos de borde y validaciones adicionales', () => {
    it('debería validar el orden correcto de verificaciones', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      mockRequest.params.token = token;
      const order: string[] = [];

      mockJwtService.decode.mockImplementation(() => {
        order.push('decode');
        return payloadMock;
      });

      mockLinkFormularioService.findOne.mockImplementation(async () => {
        order.push('findFormulario');
        return formularioMock;
      });

      mockJwtService.verifyAsync.mockImplementation(async () => {
        order.push('verifyToken');
        return payloadMock;
      });

      mockBlacklistService.isTokenBlacklisted.mockImplementation(async () => {
        order.push('checkBlacklist');
        return false;
      });

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      expect(order).toEqual([
        'decode',
        'findFormulario',
        'verifyToken',
        'checkBlacklist',
      ]);
    });

    it('debería priorizar la verificación de completado sobre expiración', async () => {
      // Arrange
      const token = 'expired.jwt.token';
      mockRequest.params.token = token;

      const formularioCompletadoYExpirado = {
        ...formularioMock,
        completado: true,
        expirado: true,
      };

      mockJwtService.decode.mockReturnValue(payloadMock);
      mockLinkFormularioService.findOne.mockResolvedValue(
        formularioCompletadoYExpirado,
      );

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Formulario ya completado',
      );

      // No debería llegar a verificar el token si ya está completado
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('debería manejar tokens con diferentes IDs de formulario', async () => {
      // Arrange
      const formularioIds = [1, 999, 12345];
      const token = 'valid.jwt.token';
      mockRequest.params.token = token;

      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);

      // Act & Assert
      for (const id of formularioIds) {
        const payload = { id, rol: 'REGISTRO_FORMULARIO' };
        const formulario = { id, completado: false, expirado: false };

        mockJwtService.decode.mockReturnValueOnce(payload);
        mockLinkFormularioService.findOne.mockResolvedValueOnce(formulario);
        mockJwtService.verifyAsync.mockResolvedValueOnce(payload);

        const resultado = await guard.canActivate(mockExecutionContext);

        expect(resultado).toBe(true);
        expect(mockLinkFormularioService.findOne).toHaveBeenCalledWith(id);
        expect(mockRequest['usuario']).toEqual(payload);
      }
    });

    it('debería manejar token expirado sin ID en payload', async () => {
      // Arrange
      const token = 'expired.token.without.id';
      mockRequest.params.token = token;

      mockJwtService.decode.mockReturnValue({ rol: 'REGISTRO_FORMULARIO' }); // Sin ID
      mockLinkFormularioService.findOne.mockRejectedValue(
        new Error('Not found'),
      );

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Link invalido',
      );
    });

    it('debería adjuntar el payload correcto al request', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      const payloadEsperado = {
        id: 123,
        rol: 'REGISTRO_FORMULARIO',
        exp: 1234567890,
      };

      mockRequest.params.token = token;
      mockJwtService.decode.mockReturnValue(payloadEsperado);
      mockLinkFormularioService.findOne.mockResolvedValue({
        id: 123,
        completado: false,
        expirado: false,
      });
      mockJwtService.verifyAsync.mockResolvedValue(payloadEsperado);
      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      expect(mockRequest['usuario']).toEqual(payloadEsperado);
      expect(mockRequest['usuario']).toHaveProperty('id', 123);
      expect(mockRequest['usuario']).toHaveProperty(
        'rol',
        'REGISTRO_FORMULARIO',
      );
    });

    it('debería manejar formularios con estados mixtos correctamente', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      mockRequest.params.token = token;

      const estadosFormulario = [
        { completado: false, expirado: false, deberiaPermitir: true },
        {
          completado: true,
          expirado: false,
          deberiaPermitir: false,
          error: 'Formulario ya completado',
        },
        {
          completado: false,
          expirado: true,
          deberiaPermitir: false,
          error: 'Link expirado',
        },
        {
          completado: true,
          expirado: true,
          deberiaPermitir: false,
          error: 'Formulario ya completado',
        },
      ];

      // Act & Assert
      for (const estado of estadosFormulario) {
        const formulario = { id: 1, ...estado };

        mockJwtService.decode.mockReturnValue(payloadMock);
        mockLinkFormularioService.findOne.mockResolvedValue(formulario);
        mockJwtService.verifyAsync.mockResolvedValue(payloadMock);
        mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);

        if (estado.deberiaPermitir) {
          const resultado = await guard.canActivate(mockExecutionContext);
          expect(resultado).toBe(true);
        } else {
          await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
            estado.error,
          );
        }
      }
    });
  });
});
