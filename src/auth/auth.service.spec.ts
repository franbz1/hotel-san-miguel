import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BlacklistService } from './blacklist.service';
import { LoginDto } from './dto/loginDto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock de bcryptjs
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock de envs
jest.mock('src/config/envs', () => ({
  envs: {
    jwtSecret: 'test-secret-key',
  },
}));

describe('AuthService', () => {
  let service: AuthService;

  // Mocks de los servicios
  const mockPrismaService = {
    usuario: {
      findFirst: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockBlacklistService = {
    isTokenBlacklisted: jest.fn(),
    addToBlacklist: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: BlacklistService,
          useValue: mockBlacklistService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición del servicio', () => {
    it('debería estar definido', () => {
      expect(service).toBeDefined();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      nombre: 'usuarioTest',
      password: 'password123',
    };

    const usuarioMock = {
      id: 1,
      nombre: 'usuarioTest',
      password: '$2a$10$hashedPassword',
      rol: 'ADMINISTRADOR',
    };

    it('debería autenticar correctamente un usuario con credenciales válidas', async () => {
      // Arrange
      mockPrismaService.usuario.findFirst.mockResolvedValue(usuarioMock);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.signAsync.mockResolvedValue(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSJyb2wiOiJBRE1JTklTVFJBRE9SIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      );

      // Act
      const resultado = await service.login(loginDto);

      // Assert
      expect(mockPrismaService.usuario.findFirst).toHaveBeenCalledWith({
        where: {
          nombre: loginDto.nombre,
          deleted: false,
        },
        select: {
          id: true,
          nombre: true,
          password: true,
          rol: true,
        },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        usuarioMock.password,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { id: usuarioMock.id, rol: usuarioMock.rol },
        { expiresIn: '1d' },
      );
      expect(resultado).toEqual({
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSJyb2wiOiJBRE1JTklTVFJBRE9SIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        usuarioId: usuarioMock.id,
        nombre: usuarioMock.nombre,
        rol: usuarioMock.rol,
      });
    });

    it('debería lanzar UnauthorizedException cuando el usuario no existe', async () => {
      // Arrange
      mockPrismaService.usuario.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciales inválidas',
      );
      expect(mockPrismaService.usuario.findFirst).toHaveBeenCalledWith({
        where: {
          nombre: loginDto.nombre,
          deleted: false,
        },
        select: {
          id: true,
          nombre: true,
          password: true,
          rol: true,
        },
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('debería lanzar UnauthorizedException cuando la contraseña es incorrecta', async () => {
      // Arrange
      mockPrismaService.usuario.findFirst.mockResolvedValue(usuarioMock);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciales inválidas',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        usuarioMock.password,
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException cuando ocurre un error inesperado', async () => {
      // Arrange
      mockPrismaService.usuario.findFirst.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Error al procesar el login',
      );
    });

    it('debería manejar errores en la comparación de contraseñas', async () => {
      // Arrange
      mockPrismaService.usuario.findFirst.mockResolvedValue(usuarioMock);
      mockedBcrypt.compare.mockRejectedValue(
        new Error('Bcrypt error') as never,
      );

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Error al procesar el login',
      );
    });

    it('debería manejar errores en la generación del token JWT', async () => {
      // Arrange
      mockPrismaService.usuario.findFirst.mockResolvedValue(usuarioMock);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.signAsync.mockRejectedValue(new Error('JWT error'));

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Error al procesar el login',
      );
    });
  });

  describe('logout', () => {
    const validToken = 'valid.jwt.token';
    const validAuthHeader = `Bearer ${validToken}`;

    it('debería cerrar sesión correctamente con un token válido', async () => {
      // Arrange
      mockJwtService.verifyAsync.mockResolvedValue({
        id: 1,
        rol: 'ADMINISTRADOR',
      });
      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockBlacklistService.addToBlacklist.mockResolvedValue(undefined);

      // Act
      const resultado = await service.logout(validAuthHeader);

      // Assert
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(validToken, {
        secret: 'test-secret-key',
      });
      expect(mockBlacklistService.isTokenBlacklisted).toHaveBeenCalledWith(
        validToken,
      );
      expect(mockBlacklistService.addToBlacklist).toHaveBeenCalledWith(
        validToken,
      );
      expect(resultado).toEqual({
        message: 'Sesión cerrada exitosamente',
      });
    });

    it('debería lanzar UnauthorizedException cuando no se proporciona header de autorización', async () => {
      // Act & Assert
      await expect(service.logout('')).rejects.toThrow(UnauthorizedException);
      await expect(service.logout('')).rejects.toThrow(
        'Token no proporcionado',
      );

      await expect(service.logout(undefined as any)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.logout(undefined as any)).rejects.toThrow(
        'Token no proporcionado',
      );
    });

    it('debería lanzar UnauthorizedException cuando el formato del token es inválido', async () => {
      // Arrange
      const invalidFormats = [
        'InvalidFormat token',
        'Bearer',
        'Bearer ',
        'token without bearer',
        'Basic token',
      ];

      // Act & Assert
      for (const invalidFormat of invalidFormats) {
        await expect(service.logout(invalidFormat)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.logout(invalidFormat)).rejects.toThrow(
          'Formato de token inválido',
        );
      }
    });

    it('debería lanzar UnauthorizedException cuando el token es inválido', async () => {
      // Arrange
      const invalidAuthHeader = 'Bearer invalid.token';
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // Act & Assert
      await expect(service.logout(invalidAuthHeader)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.logout(invalidAuthHeader)).rejects.toThrow(
        'Token inválido o expirado',
      );
    });

    it('debería lanzar UnauthorizedException cuando el token ya está en lista negra', async () => {
      // Arrange
      mockJwtService.verifyAsync.mockResolvedValue({
        id: 1,
        rol: 'ADMINISTRADOR',
      });
      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(true);

      // Act & Assert
      await expect(service.logout(validAuthHeader)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.logout(validAuthHeader)).rejects.toThrow(
        'Token ya ha sido invalidado',
      );
      expect(mockBlacklistService.addToBlacklist).not.toHaveBeenCalled();
    });

    it('debería manejar errores al agregar token a lista negra', async () => {
      // Arrange
      mockJwtService.verifyAsync.mockResolvedValue({
        id: 1,
        rol: 'ADMINISTRADOR',
      });
      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockBlacklistService.addToBlacklist.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.logout(validAuthHeader)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.logout(validAuthHeader)).rejects.toThrow(
        'Token inválido o expirado',
      );
    });
  });

  describe('validateToken', () => {
    const validToken = 'valid.jwt.token';
    const validAuthHeader = `Bearer ${validToken}`;
    const usuarioMock = {
      id: 1,
      nombre: 'usuarioTest',
      rol: 'ADMINISTRADOR',
    };

    it('debería validar correctamente un token válido', async () => {
      // Arrange
      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verifyAsync.mockResolvedValue({
        id: 1,
        rol: 'ADMINISTRADOR',
      });
      mockPrismaService.usuario.findFirst.mockResolvedValue(usuarioMock);

      // Act
      const resultado = await service.validateToken(validAuthHeader);

      // Assert
      expect(mockBlacklistService.isTokenBlacklisted).toHaveBeenCalledWith(
        validToken,
      );
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(validToken, {
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
      expect(resultado).toEqual({
        isValid: true,
        usuarioId: usuarioMock.id,
        nombre: usuarioMock.nombre,
        rol: usuarioMock.rol,
      });
    });

    it('debería lanzar UnauthorizedException cuando no se proporciona header de autorización', async () => {
      // Act & Assert
      await expect(service.validateToken('')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateToken('')).rejects.toThrow(
        'Token no proporcionado',
      );

      await expect(service.validateToken(undefined as any)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateToken(undefined as any)).rejects.toThrow(
        'Token no proporcionado',
      );
    });

    it('debería lanzar UnauthorizedException cuando el formato del token es inválido', async () => {
      // Arrange
      const invalidFormats = [
        'InvalidFormat token',
        'Bearer',
        'Bearer ',
        'token without bearer',
        'Basic token',
      ];

      // Act & Assert
      for (const invalidFormat of invalidFormats) {
        await expect(service.validateToken(invalidFormat)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.validateToken(invalidFormat)).rejects.toThrow(
          'Formato de token inválido',
        );
      }
    });

    it('debería lanzar UnauthorizedException cuando el token está en lista negra', async () => {
      // Arrange
      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(true);

      // Act & Assert
      await expect(service.validateToken(validAuthHeader)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateToken(validAuthHeader)).rejects.toThrow(
        'Token ha sido invalidado',
      );
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
      expect(mockPrismaService.usuario.findFirst).not.toHaveBeenCalled();
    });

    it('debería lanzar UnauthorizedException cuando el token es inválido o expirado', async () => {
      // Arrange
      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Token expired'));

      // Act & Assert
      await expect(service.validateToken(validAuthHeader)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateToken(validAuthHeader)).rejects.toThrow(
        'Token inválido o expirado',
      );
      expect(mockPrismaService.usuario.findFirst).not.toHaveBeenCalled();
    });

    it('debería lanzar UnauthorizedException cuando el usuario no existe', async () => {
      // Arrange
      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verifyAsync.mockResolvedValue({
        id: 1,
        rol: 'ADMINISTRADOR',
      });
      mockPrismaService.usuario.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateToken(validAuthHeader)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateToken(validAuthHeader)).rejects.toThrow(
        'Usuario no encontrado',
      );
    });

    it('debería manejar errores inesperados durante la validación', async () => {
      // Arrange
      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verifyAsync.mockResolvedValue({
        id: 1,
        rol: 'ADMINISTRADOR',
      });
      mockPrismaService.usuario.findFirst.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.validateToken(validAuthHeader)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateToken(validAuthHeader)).rejects.toThrow(
        'Token inválido o expirado',
      );
    });
  });

  describe('Casos de borde y validaciones adicionales', () => {
    it('debería manejar múltiples validaciones de token concurrentes', async () => {
      // Arrange
      const token1 = 'Bearer token1';
      const token2 = 'Bearer token2';
      const usuario1 = { id: 1, nombre: 'user1', rol: 'ADMINISTRADOR' };
      const usuario2 = { id: 2, nombre: 'user2', rol: 'CAJERO' };

      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verifyAsync
        .mockResolvedValueOnce({ id: 1, rol: 'ADMINISTRADOR' })
        .mockResolvedValueOnce({ id: 2, rol: 'CAJERO' });
      mockPrismaService.usuario.findFirst
        .mockResolvedValueOnce(usuario1)
        .mockResolvedValueOnce(usuario2);

      // Act
      const [resultado1, resultado2] = await Promise.all([
        service.validateToken(token1),
        service.validateToken(token2),
      ]);

      // Assert
      expect(resultado1.usuarioId).toBe(1);
      expect(resultado2.usuarioId).toBe(2);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.usuario.findFirst).toHaveBeenCalledTimes(2);
    });

    it('debería validar diferentes tipos de roles correctamente', async () => {
      // Arrange
      const roles = ['ADMINISTRADOR', 'CAJERO', 'ASEO', 'REGISTRO_FORMULARIO'];
      const authHeader = 'Bearer valid.token';

      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);

      // Act & Assert
      for (let i = 0; i < roles.length; i++) {
        const rol = roles[i];
        const usuarioMock = { id: i + 1, nombre: `user${i + 1}`, rol };

        mockJwtService.verifyAsync.mockResolvedValueOnce({ id: i + 1, rol });
        mockPrismaService.usuario.findFirst.mockResolvedValueOnce(usuarioMock);

        const resultado = await service.validateToken(authHeader);

        expect(resultado.rol).toBe(rol);
        expect(resultado.isValid).toBe(true);
      }
    });

    it('debería manejar correctamente tokens con diferentes longitudes', async () => {
      // Arrange
      const shortToken = 'Bearer abc';
      const longToken = 'Bearer ' + 'a'.repeat(500);

      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verifyAsync.mockResolvedValue({
        id: 1,
        rol: 'ADMINISTRADOR',
      });
      mockPrismaService.usuario.findFirst.mockResolvedValue({
        id: 1,
        nombre: 'usuario',
        rol: 'ADMINISTRADOR',
      });

      // Act
      const resultadoShort = await service.validateToken(shortToken);
      const resultadoLong = await service.validateToken(longToken);

      // Assert
      expect(resultadoShort.isValid).toBe(true);
      expect(resultadoLong.isValid).toBe(true);
    });

    it('debería verificar que se llama a las dependencias en el orden correcto', async () => {
      // Arrange
      const authHeader = 'Bearer valid.token';
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
      await service.validateToken(authHeader);

      // Assert
      expect(order).toEqual(['blacklist', 'jwt', 'database']);
    });
  });

  describe('Integración con documentación API', () => {
    it('debería cumplir con el contrato de la API para login exitoso', async () => {
      // Arrange
      const loginDto: LoginDto = {
        nombre: 'Juan Pérez',
        password: 'password123',
      };

      const usuarioMock = {
        id: 1,
        nombre: 'Juan Pérez',
        password: '$2a$10$hashedPassword',
        rol: 'ADMINISTRADOR',
      };

      mockPrismaService.usuario.findFirst.mockResolvedValue(usuarioMock);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.signAsync.mockResolvedValue(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSJyb2wiOiJBRE1JTklTVFJBRE9SIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      );

      // Act
      const resultado = await service.login(loginDto);

      // Assert
      expect(resultado).toMatchObject({
        token: expect.any(String),
        usuarioId: expect.any(Number),
        nombre: expect.any(String),
        rol: expect.any(String),
      });
      expect(resultado.token).toMatch(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
      );
    });

    it('debería cumplir con el contrato de la API para logout exitoso', async () => {
      // Arrange
      const authHeader = 'Bearer valid.token';

      mockJwtService.verifyAsync.mockResolvedValue({
        id: 1,
        rol: 'ADMINISTRADOR',
      });
      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockBlacklistService.addToBlacklist.mockResolvedValue(undefined);

      // Act
      const resultado = await service.logout(authHeader);

      // Assert
      expect(resultado).toMatchObject({
        message: expect.any(String),
      });
      expect(resultado.message).toContain('exitosamente');
    });

    it('debería cumplir con el contrato de la API para validación exitosa', async () => {
      // Arrange
      const authHeader = 'Bearer valid.token';
      const usuarioMock = {
        id: 1,
        nombre: 'Juan Pérez',
        rol: 'ADMINISTRADOR',
      };

      mockBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
      mockJwtService.verifyAsync.mockResolvedValue({
        id: 1,
        rol: 'ADMINISTRADOR',
      });
      mockPrismaService.usuario.findFirst.mockResolvedValue(usuarioMock);

      // Act
      const resultado = await service.validateToken(authHeader);

      // Assert
      expect(resultado).toMatchObject({
        isValid: expect.any(Boolean),
        usuarioId: expect.any(Number),
        nombre: expect.any(String),
        rol: expect.any(String),
      });
      expect(resultado.isValid).toBe(true);
      expect([
        'ADMINISTRADOR',
        'CAJERO',
        'ASEO',
        'REGISTRO_FORMULARIO',
      ]).toContain(resultado.rol);
    });
  });
});
