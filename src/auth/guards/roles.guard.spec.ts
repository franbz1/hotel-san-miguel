import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from 'src/usuarios/entities/rol.enum';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  // Mock del Reflector
  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  // Mock del ExecutionContext
  const mockRequest = {
    usuario: {},
  };

  const mockHttpContext = {
    getRequest: jest.fn().mockReturnValue(mockRequest),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset request object
    mockRequest.usuario = {};
  });

  describe('Definición del guard', () => {
    it('debería estar definido', () => {
      expect(guard).toBeDefined();
    });
  });

  describe('canActivate', () => {
    it('debería permitir acceso cuando no hay roles requeridos', () => {
      // Arrange
      mockReflector.getAllAndOverride.mockReturnValue(undefined);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
        'roles',
        [undefined, undefined], // handler y class del mockExecutionContext
      );
    });

    it('debería permitir acceso cuando no hay roles requeridos (null)', () => {
      // Arrange
      mockReflector.getAllAndOverride.mockReturnValue(null);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(true);
    });

    it('debería permitir acceso cuando no hay roles requeridos (array vacío)', () => {
      // Arrange
      mockReflector.getAllAndOverride.mockReturnValue([]);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(false); // Array vacío retorna false porque some([]) es false
    });

    it('debería permitir acceso cuando el usuario tiene el rol requerido', () => {
      // Arrange
      const rolesRequeridos = [Role.ADMINISTRADOR];
      mockRequest.usuario = { rol: 'ADMINISTRADOR' };
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(true);
    });

    it('debería permitir acceso cuando el usuario tiene uno de múltiples roles requeridos', () => {
      // Arrange
      const rolesRequeridos = [Role.ADMINISTRADOR, Role.CAJERO];
      mockRequest.usuario = { rol: 'CAJERO' };
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(true);
    });

    it('debería denegar acceso cuando el usuario no tiene el rol requerido', () => {
      // Arrange
      const rolesRequeridos = [Role.ADMINISTRADOR];
      mockRequest.usuario = { rol: 'CAJERO' };
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(false);
    });

    it('debería denegar acceso cuando el usuario no tiene ninguno de múltiples roles requeridos', () => {
      // Arrange
      const rolesRequeridos = [Role.ADMINISTRADOR, Role.CAJERO];
      mockRequest.usuario = { rol: 'ASEO' };
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(false);
    });

    it('debería denegar acceso cuando el usuario no tiene rol definido', () => {
      // Arrange
      const rolesRequeridos = [Role.ADMINISTRADOR];
      mockRequest.usuario = {};
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(false);
    });

    it('debería denegar acceso cuando el usuario tiene rol null', () => {
      // Arrange
      const rolesRequeridos = [Role.ADMINISTRADOR];
      mockRequest.usuario = { rol: null };
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(false);
    });

    it('debería denegar acceso cuando el usuario tiene rol undefined', () => {
      // Arrange
      const rolesRequeridos = [Role.ADMINISTRADOR];
      mockRequest.usuario = { rol: undefined };
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('Validación con todos los roles del sistema', () => {
    it('debería validar correctamente el rol ADMINISTRADOR', () => {
      // Arrange
      const rolesRequeridos = [Role.ADMINISTRADOR];
      mockRequest.usuario = { rol: 'ADMINISTRADOR' };
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(true);
    });

    it('debería validar correctamente el rol CAJERO', () => {
      // Arrange
      const rolesRequeridos = [Role.CAJERO];
      mockRequest.usuario = { rol: 'CAJERO' };
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(true);
    });

    it('debería validar correctamente el rol ASEO', () => {
      // Arrange
      const rolesRequeridos = [Role.ASEO];
      mockRequest.usuario = { rol: 'ASEO' };
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(true);
    });

    it('debería validar correctamente el rol REGISTRO_FORMULARIO', () => {
      // Arrange
      const rolesRequeridos = [Role.REGISTRO_FORMULARIO];
      mockRequest.usuario = { rol: 'REGISTRO_FORMULARIO' };
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(true);
    });
  });

  describe('Casos de borde y validaciones adicionales', () => {
    it('debería manejar roles con diferentes casos de string', () => {
      // Arrange - Asumiendo que los roles son case-sensitive
      const rolesRequeridos = [Role.ADMINISTRADOR];
      mockRequest.usuario = { rol: 'administrador' }; // lowercase
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(false); // Debería ser case-sensitive
    });

    it('debería manejar múltiples roles en orden diferente', () => {
      // Arrange
      const rolesRequeridos = [Role.CAJERO, Role.ADMINISTRADOR, Role.ASEO];
      mockRequest.usuario = { rol: 'ASEO' }; // Último en la lista
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(true);
    });

    it('debería llamar al reflector con los parámetros correctos', () => {
      // Arrange
      const rolesRequeridos = [Role.ADMINISTRADOR];
      mockRequest.usuario = { rol: 'ADMINISTRADOR' };
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      guard.canActivate(mockExecutionContext);

      // Assert
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('debería manejar usuario con propiedades adicionales', () => {
      // Arrange
      const rolesRequeridos = [Role.CAJERO];
      mockRequest.usuario = {
        id: 123,
        nombre: 'Test User',
        rol: 'CAJERO',
        email: 'test@example.com',
      };
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(true);
    });

    it('debería validar con array de un solo rol', () => {
      // Arrange
      const rolesRequeridos = [Role.ADMINISTRADOR];
      mockRequest.usuario = { rol: 'ADMINISTRADOR' };
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(true);
    });

    it('debería manejar rol como string vacío', () => {
      // Arrange
      const rolesRequeridos = [Role.ADMINISTRADOR];
      mockRequest.usuario = { rol: '' };
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(false);
    });

    it('debería manejar usuario como null', () => {
      // Arrange
      const rolesRequeridos = [Role.ADMINISTRADOR];
      mockRequest.usuario = null;
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow();
    });

    it('debería manejar usuario como undefined', () => {
      // Arrange
      const rolesRequeridos = [Role.ADMINISTRADOR];
      mockRequest.usuario = undefined;
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow();
    });

    it('debería retornar true para el primer rol coincidente (early return)', () => {
      // Arrange
      const rolesRequeridos = [Role.CAJERO, Role.ADMINISTRADOR];
      mockRequest.usuario = { rol: 'CAJERO' }; // Primer rol en la lista
      mockReflector.getAllAndOverride.mockReturnValue(rolesRequeridos);

      // Act
      const resultado = guard.canActivate(mockExecutionContext);

      // Assert
      expect(resultado).toBe(true);
    });
  });
});
