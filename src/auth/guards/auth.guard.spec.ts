import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { BlacklistService } from '../blacklist.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

// Mock de envs
jest.mock('src/config/envs', () => ({
  envs: {
    jwtSecret: 'test-secret-key',
  },
}));

describe('AuthGuard', () => {
  let guard: AuthGuard;

  // Mocks de los servicios
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

  // Mock del ExecutionContext
  const mockExecutionContext = {
    switchToHttp: jest.fn(),
  };

  const mockRequest = {
    headers: {} as Record<string, any>,
  };

  const mockHttpContext = {
    getRequest: jest.fn().mockReturnValue(mockRequest),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
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
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);

    // Setup mocks
    mockExecutionContext.switchToHttp.mockReturnValue(mockHttpContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset request object
    mockRequest.headers = {};
    delete mockRequest['usuario'];
  });

  describe('Definición del guard', () => {
    it('debería estar definido', () => {
      expect(guard).toBeDefined();
    });
  });

  describe('canActivate', () => {
    const usuarioMock = {
      id: 1,
      nombre: 'testUser',
      rol: 'ADMINISTRADOR',
    };

    it('debería permitir acceso con token válido', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      mockRequest.headers.authorization = `Bearer ${token}`;

      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verifyAsync.mockResolvedValue({
        id: 1,
        rol: 'ADMINISTRADOR',
      });
      mockPrismaService.usuario.findFirst.mockResolvedValue(usuarioMock);

      // Act
      const resultado = await guard.canActivate(
        mockExecutionContext as unknown as ExecutionContext,
      );

      // Assert
      expect(resultado).toBe(true);
      expect(mockBlacklistService.isTokenBlacklisted).toHaveBeenCalledWith(
        token,
      );
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: 'test-secret-key',
      });
      expect(mockPrismaService.usuario.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          deleted: false,
        },
        select: {
          id: true,
          nombre: true,
          rol: true,
        },
      });
      expect(mockRequest['usuario']).toEqual(usuarioMock);
    });

    it('debería lanzar UnauthorizedException cuando no se proporciona token', async () => {
      // Arrange
      mockRequest.headers.authorization = undefined;

      // Act & Assert
      await expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).rejects.toThrow('Token no proporcionado');
    });

    it('debería lanzar UnauthorizedException cuando el formato del header es inválido', async () => {
      // Arrange
      const invalidFormats = [
        'InvalidFormat token',
        'Basic token',
        'Bearer',
        'token without bearer',
      ];

      // Act & Assert
      for (const invalidFormat of invalidFormats) {
        mockRequest.headers.authorization = invalidFormat;
        await expect(
          guard.canActivate(
            mockExecutionContext as unknown as ExecutionContext,
          ),
        ).rejects.toThrow(UnauthorizedException);
        await expect(
          guard.canActivate(
            mockExecutionContext as unknown as ExecutionContext,
          ),
        ).rejects.toThrow('Token no proporcionado');
      }
    });

    it('debería lanzar UnauthorizedException cuando el token está en blacklist', async () => {
      // Arrange
      const token = 'blacklisted.token';
      mockRequest.headers.authorization = `Bearer ${token}`;
      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(true);

      // Act & Assert
      await expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).rejects.toThrow('Token ha sido invalidado');
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('debería lanzar UnauthorizedException cuando el token JWT es inválido', async () => {
      // Arrange
      const token = 'invalid.jwt.token';
      mockRequest.headers.authorization = `Bearer ${token}`;

      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // Act & Assert
      await expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).rejects.toThrow('Token inválido o expirado');
    });

    it('debería lanzar UnauthorizedException cuando el usuario no existe', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      mockRequest.headers.authorization = `Bearer ${token}`;

      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verifyAsync.mockResolvedValue({
        id: 999,
        rol: 'ADMINISTRADOR',
      });
      mockPrismaService.usuario.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('debería lanzar UnauthorizedException cuando el usuario está eliminado', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      mockRequest.headers.authorization = `Bearer ${token}`;

      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verifyAsync.mockResolvedValue({
        id: 1,
        rol: 'ADMINISTRADOR',
      });
      mockPrismaService.usuario.findFirst.mockResolvedValue(null); // Usuario eliminado

      // Act & Assert
      await expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('debería lanzar BadRequestException cuando ocurre un error inesperado', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      mockRequest.headers.authorization = `Bearer ${token}`;

      mockBlacklistService.isTokenBlacklisted.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).rejects.toThrow(BadRequestException);
      await expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).rejects.toThrow('Error al procesar la autenticación');
    });

    it('debería propagar UnauthorizedException del JWT service', async () => {
      // Arrange
      const token = 'expired.jwt.token';
      mockRequest.headers.authorization = `Bearer ${token}`;

      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verifyAsync.mockRejectedValue(
        new UnauthorizedException('Token expirado'),
      );

      // Act & Assert
      await expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
      ).rejects.toThrow('Token expirado');
    });
  });

  describe('extractTokenFromHeader', () => {
    it('debería extraer token correctamente del header Bearer', () => {
      // Arrange
      const token = 'test.jwt.token';
      const request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as any;

      // Act
      const resultado = guard.extractTokenFromHeader(request);

      // Assert
      expect(resultado).toBe(token);
    });

    it('debería retornar undefined cuando no hay header authorization', () => {
      // Arrange
      const request = {
        headers: {},
      } as any;

      // Act
      const resultado = guard.extractTokenFromHeader(request);

      // Assert
      expect(resultado).toBeUndefined();
    });

    it('debería retornar undefined cuando el tipo no es Bearer', () => {
      // Arrange
      const request = {
        headers: {
          authorization: 'Basic dGVzdDp0ZXN0',
        },
      } as any;

      // Act
      const resultado = guard.extractTokenFromHeader(request);

      // Assert
      expect(resultado).toBeUndefined();
    });

    it('debería retornar undefined cuando no hay token después de Bearer', () => {
      // Arrange
      const request = {
        headers: {
          authorization: 'Bearer',
        },
      } as any;

      // Act
      const resultado = guard.extractTokenFromHeader(request);

      // Assert
      expect(resultado).toBeUndefined();
    });

    it('debería manejar header authorization con espacios extra', () => {
      // Arrange
      const token = 'test.jwt.token';
      const request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as any;

      // Act
      const resultado = guard.extractTokenFromHeader(request);

      // Assert
      expect(resultado).toBe(token);
    });
  });

  describe('Casos de borde y validaciones adicionales', () => {
    it('debería manejar diferentes tipos de roles de usuario', async () => {
      // Arrange
      const roles = ['ADMINISTRADOR', 'CAJERO', 'ASEO', 'REGISTRO_FORMULARIO'];
      const token = 'valid.jwt.token';
      mockRequest.headers.authorization = `Bearer ${token}`;

      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);

      // Act & Assert
      for (let i = 0; i < roles.length; i++) {
        const rol = roles[i];
        const usuario = { id: i + 1, nombre: `user${i + 1}`, rol };

        mockJwtService.verifyAsync.mockResolvedValueOnce({ id: i + 1, rol });
        mockPrismaService.usuario.findFirst.mockResolvedValueOnce(usuario);

        const resultado = await guard.canActivate(
          mockExecutionContext as unknown as ExecutionContext,
        );

        expect(resultado).toBe(true);
        expect(mockRequest['usuario'].rol).toBe(rol);
      }
    });

    it('debería validar que se ejecutan las verificaciones en el orden correcto', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      mockRequest.headers.authorization = `Bearer ${token}`;
      const order: string[] = [];

      mockBlacklistService.isTokenBlacklisted.mockImplementation(async () => {
        order.push('blacklist');
        return false;
      });

      mockJwtService.verifyAsync.mockImplementation(async () => {
        order.push('jwt');
        return { id: 1, rol: 'ADMINISTRADOR' };
      });

      mockPrismaService.usuario.findFirst.mockImplementation(async () => {
        order.push('database');
        return { id: 1, nombre: 'usuario', rol: 'ADMINISTRADOR' };
      });

      // Act
      await guard.canActivate(
        mockExecutionContext as unknown as ExecutionContext,
      );

      // Assert
      expect(order).toEqual(['blacklist', 'jwt', 'database']);
    });

    it('debería manejar tokens con diferentes longitudes', async () => {
      // Arrange
      const shortToken = 'abc';
      const longToken = 'a'.repeat(500);
      const usuario = { id: 1, nombre: 'usuario', rol: 'ADMINISTRADOR' };

      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verifyAsync.mockResolvedValue({
        id: 1,
        rol: 'ADMINISTRADOR',
      });
      mockPrismaService.usuario.findFirst.mockResolvedValue(usuario);

      // Act & Assert
      mockRequest.headers.authorization = `Bearer ${shortToken}`;
      const resultadoShort = await guard.canActivate(
        mockExecutionContext as unknown as ExecutionContext,
      );

      mockRequest.headers.authorization = `Bearer ${longToken}`;
      const resultadoLong = await guard.canActivate(
        mockExecutionContext as unknown as ExecutionContext,
      );

      expect(resultadoShort).toBe(true);
      expect(resultadoLong).toBe(true);
    });

    it('debería adjuntar el usuario correcto al request', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      const usuarioEsperado = {
        id: 123,
        nombre: 'Usuario Test',
        rol: 'CAJERO',
      };

      mockRequest.headers.authorization = `Bearer ${token}`;
      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verifyAsync.mockResolvedValue({ id: 123, rol: 'CAJERO' });
      mockPrismaService.usuario.findFirst.mockResolvedValue(usuarioEsperado);

      // Act
      await guard.canActivate(
        mockExecutionContext as unknown as ExecutionContext,
      );

      // Assert
      expect(mockRequest['usuario']).toEqual(usuarioEsperado);
      expect(mockRequest['usuario']).toHaveProperty('id', 123);
      expect(mockRequest['usuario']).toHaveProperty('nombre', 'Usuario Test');
      expect(mockRequest['usuario']).toHaveProperty('rol', 'CAJERO');
    });
  });
});
