import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/loginDto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';

// Mock del AuthGuard para evitar problemas de dependencias
jest.mock('./guards/auth.guard', () => ({
  AuthGuard: class MockAuthGuard {
    canActivate() {
      return true;
    }
  },
}));

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mock del AuthService
  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
    validateToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición del controlador', () => {
    it('debería estar definido', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      nombre: 'usuarioTest',
      password: 'password123',
    };

    const respuestaExitosaLogin = {
      token: 'jwt.token.aqui',
      usuarioId: 1,
      nombre: 'usuarioTest',
      rol: 'ADMINISTRADOR',
    };

    it('debería autenticar correctamente un usuario válido', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue(respuestaExitosaLogin);

      // Act
      const resultado = await controller.login(loginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(respuestaExitosaLogin);
      expect(resultado).toHaveProperty('token');
      expect(resultado).toHaveProperty('usuarioId');
      expect(resultado).toHaveProperty('nombre');
      expect(resultado).toHaveProperty('rol');
    });

    it('debería lanzar UnauthorizedException para credenciales inválidas', async () => {
      // Arrange
      const loginDtoInvalido: LoginDto = {
        nombre: 'usuarioInexistente',
        password: 'passwordIncorrecto',
      };
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Credenciales inválidas'),
      );

      // Act & Assert
      await expect(controller.login(loginDtoInvalido)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(loginDtoInvalido)).rejects.toThrow(
        'Credenciales inválidas',
      );
      expect(authService.login).toHaveBeenCalledWith(loginDtoInvalido);
    });

    it('debería lanzar BadRequestException para errores de procesamiento', async () => {
      // Arrange
      mockAuthService.login.mockRejectedValue(
        new BadRequestException('Error al procesar el login'),
      );

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.login(loginDto)).rejects.toThrow(
        'Error al procesar el login',
      );
    });

    it('debería validar la estructura del DTO de entrada', () => {
      // Assert
      expect(loginDto).toHaveProperty('nombre');
      expect(loginDto).toHaveProperty('password');
      expect(typeof loginDto.nombre).toBe('string');
      expect(typeof loginDto.password).toBe('string');
    });
  });

  describe('logout', () => {
    const tokenValido = 'Bearer jwt.token.aqui';
    const respuestaExitosaLogout = {
      message: 'Sesión cerrada exitosamente',
    };

    it('debería cerrar sesión correctamente con token válido', async () => {
      // Arrange
      mockAuthService.logout.mockResolvedValue(respuestaExitosaLogout);

      // Act
      const resultado = await controller.logout(tokenValido);

      // Assert
      expect(authService.logout).toHaveBeenCalledWith(tokenValido);
      expect(authService.logout).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(respuestaExitosaLogout);
      expect(resultado).toHaveProperty('message');
      expect(resultado.message).toBe('Sesión cerrada exitosamente');
    });

    it('debería lanzar UnauthorizedException para token inválido', async () => {
      // Arrange
      const tokenInvalido = 'Bearer token.invalido';
      mockAuthService.logout.mockRejectedValue(
        new UnauthorizedException('Token inválido o expirado'),
      );

      // Act & Assert
      await expect(controller.logout(tokenInvalido)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.logout(tokenInvalido)).rejects.toThrow(
        'Token inválido o expirado',
      );
    });

    it('debería lanzar UnauthorizedException para token no proporcionado', async () => {
      // Arrange
      const tokenVacio = '';
      mockAuthService.logout.mockRejectedValue(
        new UnauthorizedException('Token no proporcionado'),
      );

      // Act & Assert
      await expect(controller.logout(tokenVacio)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.logout(tokenVacio)).rejects.toThrow(
        'Token no proporcionado',
      );
    });

    it('debería lanzar UnauthorizedException para formato de token inválido', async () => {
      // Arrange
      const formatoInvalido = 'InvalidFormat token';
      mockAuthService.logout.mockRejectedValue(
        new UnauthorizedException('Formato de token inválido'),
      );

      // Act & Assert
      await expect(controller.logout(formatoInvalido)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.logout(formatoInvalido)).rejects.toThrow(
        'Formato de token inválido',
      );
    });

    it('debería lanzar UnauthorizedException para token ya invalidado', async () => {
      // Arrange
      mockAuthService.logout.mockRejectedValue(
        new UnauthorizedException('Token ya ha sido invalidado'),
      );

      // Act & Assert
      await expect(controller.logout(tokenValido)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.logout(tokenValido)).rejects.toThrow(
        'Token ya ha sido invalidado',
      );
    });
  });

  describe('validateToken', () => {
    const tokenValido = 'Bearer jwt.token.aqui';
    const respuestaValidacionExitosa = {
      isValid: true,
      usuarioId: 1,
      nombre: 'usuarioTest',
      rol: 'ADMINISTRADOR',
    };

    it('debería validar correctamente un token válido', async () => {
      // Arrange
      mockAuthService.validateToken.mockResolvedValue(
        respuestaValidacionExitosa,
      );

      // Act
      const resultado = await controller.validateToken(tokenValido);

      // Assert
      expect(authService.validateToken).toHaveBeenCalledWith(tokenValido);
      expect(authService.validateToken).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(respuestaValidacionExitosa);
      expect(resultado).toHaveProperty('isValid');
      expect(resultado).toHaveProperty('usuarioId');
      expect(resultado).toHaveProperty('nombre');
      expect(resultado).toHaveProperty('rol');
      expect(resultado.isValid).toBe(true);
    });

    it('debería lanzar UnauthorizedException para token inválido', async () => {
      // Arrange
      const tokenInvalido = 'Bearer token.invalido';
      mockAuthService.validateToken.mockRejectedValue(
        new UnauthorizedException('Token inválido o expirado'),
      );

      // Act & Assert
      await expect(controller.validateToken(tokenInvalido)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.validateToken(tokenInvalido)).rejects.toThrow(
        'Token inválido o expirado',
      );
    });

    it('debería lanzar UnauthorizedException para token no proporcionado', async () => {
      // Arrange
      const tokenVacio = '';
      mockAuthService.validateToken.mockRejectedValue(
        new UnauthorizedException('Token no proporcionado'),
      );

      // Act & Assert
      await expect(controller.validateToken(tokenVacio)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.validateToken(tokenVacio)).rejects.toThrow(
        'Token no proporcionado',
      );
    });

    it('debería lanzar UnauthorizedException para formato de token inválido', async () => {
      // Arrange
      const formatoInvalido = 'InvalidFormat token';
      mockAuthService.validateToken.mockRejectedValue(
        new UnauthorizedException('Formato de token inválido'),
      );

      // Act & Assert
      await expect(controller.validateToken(formatoInvalido)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.validateToken(formatoInvalido)).rejects.toThrow(
        'Formato de token inválido',
      );
    });

    it('debería lanzar UnauthorizedException para token en lista negra', async () => {
      // Arrange
      mockAuthService.validateToken.mockRejectedValue(
        new UnauthorizedException('Token ha sido invalidado'),
      );

      // Act & Assert
      await expect(controller.validateToken(tokenValido)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.validateToken(tokenValido)).rejects.toThrow(
        'Token ha sido invalidado',
      );
    });

    it('debería lanzar UnauthorizedException para usuario no encontrado', async () => {
      // Arrange
      mockAuthService.validateToken.mockRejectedValue(
        new UnauthorizedException('Usuario no encontrado'),
      );

      // Act & Assert
      await expect(controller.validateToken(tokenValido)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.validateToken(tokenValido)).rejects.toThrow(
        'Usuario no encontrado',
      );
    });

    it('debería validar la estructura de la respuesta exitosa', () => {
      // Assert
      expect(respuestaValidacionExitosa).toHaveProperty('isValid');
      expect(respuestaValidacionExitosa).toHaveProperty('usuarioId');
      expect(respuestaValidacionExitosa).toHaveProperty('nombre');
      expect(respuestaValidacionExitosa).toHaveProperty('rol');
      expect(typeof respuestaValidacionExitosa.isValid).toBe('boolean');
      expect(typeof respuestaValidacionExitosa.usuarioId).toBe('number');
      expect(typeof respuestaValidacionExitosa.nombre).toBe('string');
      expect(typeof respuestaValidacionExitosa.rol).toBe('string');
    });
  });

  describe('Casos de borde y validaciones adicionales', () => {
    it('debería manejar correctamente múltiples llamadas concurrentes a login', async () => {
      // Arrange
      const loginDto1: LoginDto = { nombre: 'user1', password: 'pass1' };
      const loginDto2: LoginDto = { nombre: 'user2', password: 'pass2' };

      mockAuthService.login
        .mockResolvedValueOnce({
          token: 'token1',
          usuarioId: 1,
          nombre: 'user1',
          rol: 'ADMINISTRADOR',
        })
        .mockResolvedValueOnce({
          token: 'token2',
          usuarioId: 2,
          nombre: 'user2',
          rol: 'CAJERO',
        });

      // Act
      const [resultado1, resultado2] = await Promise.all([
        controller.login(loginDto1),
        controller.login(loginDto2),
      ]);

      // Assert
      expect(authService.login).toHaveBeenCalledTimes(2);
      expect(resultado1.usuarioId).toBe(1);
      expect(resultado2.usuarioId).toBe(2);
    });

    it('debería manejar diferentes tipos de roles de usuario', async () => {
      // Arrange
      const rolesValidos = [
        'ADMINISTRADOR',
        'CAJERO',
        'ASEO',
        'REGISTRO_FORMULARIO',
      ];

      rolesValidos.forEach((rol) => {
        const respuestaEsperada = {
          isValid: true,
          usuarioId: 1,
          nombre: 'testUser',
          rol: rol,
        };

        mockAuthService.validateToken.mockResolvedValueOnce(respuestaEsperada);
      });

      // Act & Assert
      for (const rol of rolesValidos) {
        const resultado = await controller.validateToken('Bearer valid.token');
        expect(resultado.rol).toBe(rol);
      }
    });

    it('debería validar que los métodos del servicio son llamados con los parámetros correctos', async () => {
      // Arrange
      const loginDto: LoginDto = { nombre: 'test', password: 'test123' };
      const authHeader = 'Bearer test.token';

      mockAuthService.login.mockResolvedValue({});
      mockAuthService.logout.mockResolvedValue({});
      mockAuthService.validateToken.mockResolvedValue({});

      // Act
      await controller.login(loginDto);
      await controller.logout(authHeader);
      await controller.validateToken(authHeader);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(mockAuthService.logout).toHaveBeenCalledWith(authHeader);
      expect(mockAuthService.validateToken).toHaveBeenCalledWith(authHeader);
    });
  });

  describe('Validaciones de integración con documentación API', () => {
    it('debería cumplir con la estructura de respuesta documentada para login exitoso', async () => {
      // Arrange
      const respuestaEsperada = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        usuarioId: 1,
        nombre: 'Juan Pérez',
        rol: 'ADMINISTRADOR',
      };
      mockAuthService.login.mockResolvedValue(respuestaEsperada);

      // Act
      const resultado = await controller.login({
        nombre: 'Juan Pérez',
        password: 'password123',
      });

      // Assert
      expect(resultado).toMatchObject({
        token: expect.any(String),
        usuarioId: expect.any(Number),
        nombre: expect.any(String),
        rol: expect.any(String),
      });
    });

    it('debería cumplir con la estructura de respuesta documentada para logout exitoso', async () => {
      // Arrange
      const respuestaEsperada = {
        message: 'Sesión cerrada exitosamente',
      };
      mockAuthService.logout.mockResolvedValue(respuestaEsperada);

      // Act
      const resultado = await controller.logout('Bearer valid.token');

      // Assert
      expect(resultado).toMatchObject({
        message: expect.any(String),
      });
      expect(resultado.message).toContain('exitosamente');
    });

    it('debería cumplir con la estructura de respuesta documentada para validación exitosa', async () => {
      // Arrange
      const respuestaEsperada = {
        isValid: true,
        usuarioId: 1,
        nombre: 'Juan Pérez',
        rol: 'ADMINISTRADOR',
      };
      mockAuthService.validateToken.mockResolvedValue(respuestaEsperada);

      // Act
      const resultado = await controller.validateToken('Bearer valid.token');

      // Assert
      expect(resultado).toMatchObject({
        isValid: expect.any(Boolean),
        usuarioId: expect.any(Number),
        nombre: expect.any(String),
        rol: expect.any(String),
      });
      expect(resultado.isValid).toBe(true);
    });
  });
});
