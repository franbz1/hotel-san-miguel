import { Test, TestingModule } from '@nestjs/testing';
import { JwtCookieGuardGuard } from './jwt-cookie-guard.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('JwtCookieGuardGuard', () => {
  let guard: JwtCookieGuardGuard;

  // Mock del ExecutionContext
  const mockRequest = {
    headers: {} as any,
  };

  const mockHttpContext = {
    getRequest: jest.fn().mockReturnValue(mockRequest),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtCookieGuardGuard],
    }).compile();

    guard = module.get<JwtCookieGuardGuard>(JwtCookieGuardGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset request object
    mockRequest.headers = {};
  });

  describe('Definición del guard', () => {
    it('debería estar definido', () => {
      expect(guard).toBeDefined();
    });
  });

  describe('canActivate', () => {
    it('debería permitir acceso cuando existe auth_token en cookies', () => {
      // Arrange
      const token = 'test.jwt.token';
      mockRequest.headers.cookie = `auth_token=${token}`;

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(mockRequest);
      expect(mockRequest.headers.authorization).toBe(`Bearer ${token}`);
    });

    it('debería permitir acceso con múltiples cookies incluyendo auth_token', () => {
      // Arrange
      const token = 'test.jwt.token';
      mockRequest.headers.cookie = `session_id=123; auth_token=${token}; user_pref=dark`;

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(mockRequest);
      expect(mockRequest.headers.authorization).toBe(`Bearer ${token}`);
    });

    it('debería manejar cookies con valores codificados', () => {
      // Arrange
      const token = 'test.jwt.token.with.encoded.chars';
      const encodedToken = encodeURIComponent(token);
      mockRequest.headers.cookie = `auth_token=${encodedToken}`;

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(mockRequest);
      expect(mockRequest.headers.authorization).toBe(`Bearer ${token}`);
    });

    it('debería manejar cookies con espacios alrededor de valores', () => {
      // Arrange
      const token = 'test.jwt.token';
      mockRequest.headers.cookie = `auth_token=${token}; other=value`;

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(mockRequest);
      expect(mockRequest.headers.authorization).toBe(`Bearer ${token}`);
    });

    it('debería lanzar UnauthorizedException cuando no existe header cookie', () => {
      // Arrange
      mockRequest.headers.cookie = undefined;

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow();
    });

    it('debería lanzar UnauthorizedException cuando no existe auth_token en cookies', () => {
      // Arrange
      mockRequest.headers.cookie = 'session_id=123; user_pref=dark';

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('debería lanzar UnauthorizedException cuando auth_token está vacío', () => {
      // Arrange
      mockRequest.headers.cookie = 'auth_token=; other=value';

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('debería lanzar UnauthorizedException cuando header cookie está vacío', () => {
      // Arrange
      mockRequest.headers.cookie = '';

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('debería lanzar UnauthorizedException cuando el formato de cookies es inválido', () => {
      // Arrange
      mockRequest.headers.cookie = 'invalid_cookie_format';

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Casos de borde y validaciones adicionales', () => {
    it('debería manejar tokens largos en cookies', () => {
      // Arrange
      const longToken = 'a'.repeat(1000);
      mockRequest.headers.cookie = `auth_token=${longToken}`;

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(mockRequest);
      expect(mockRequest.headers.authorization).toBe(`Bearer ${longToken}`);
    });

    it('debería dar prioridad al último auth_token si hay duplicados', () => {
      // Arrange
      const firstToken = 'first.token';
      const secondToken = 'second.token';
      mockRequest.headers.cookie = `auth_token=${firstToken}; other=value; auth_token=${secondToken}`;

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(mockRequest);
      expect(mockRequest.headers.authorization).toBe(`Bearer ${secondToken}`);
    });

    it('debería manejar cookies con caracteres especiales en auth_token', () => {
      // Arrange
      const specialToken = 'token.with-special_chars123';
      mockRequest.headers.cookie = `auth_token=${specialToken}`;

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(mockRequest);
      expect(mockRequest.headers.authorization).toBe(`Bearer ${specialToken}`);
    });

    it('debería manejar cookies con solo auth_token', () => {
      // Arrange
      const token = 'standalone.token';
      mockRequest.headers.cookie = `auth_token=${token}`;

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(mockRequest);
      expect(mockRequest.headers.authorization).toBe(`Bearer ${token}`);
    });

    it('debería preservar otros headers existentes', () => {
      // Arrange
      const token = 'test.token';
      const existingHeaders = {
        'content-type': 'application/json',
        'user-agent': 'Test Browser',
        cookie: `auth_token=${token}`,
      };
      mockRequest.headers = { ...existingHeaders };

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(mockRequest);
      expect(mockRequest.headers.authorization).toBe(`Bearer ${token}`);
      expect(mockRequest.headers['content-type']).toBe('application/json');
      expect(mockRequest.headers['user-agent']).toBe('Test Browser');
    });

    it('debería sobrescribir header authorization existente', () => {
      // Arrange
      const token = 'new.token';
      mockRequest.headers = {
        authorization: 'Bearer old.token',
        cookie: `auth_token=${token}`,
      };

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(mockRequest);
      expect(mockRequest.headers.authorization).toBe(`Bearer ${token}`);
    });

    it('debería manejar cookies vacías entre separadores', () => {
      // Arrange
      const token = 'test.token';
      mockRequest.headers.cookie = `; ; auth_token=${token}; ; other=value; ;`;

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(mockRequest);
      expect(mockRequest.headers.authorization).toBe(`Bearer ${token}`);
    });

    it('debería retornar el objeto request correcto', () => {
      // Arrange
      const token = 'test.token';
      mockRequest.headers.cookie = `auth_token=${token}`;

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(mockRequest);
      expect(typeof resultado).toBe('object');
      expect(resultado).toHaveProperty('headers');
      expect(mockRequest.headers).toHaveProperty('authorization');
    });
  });
});
