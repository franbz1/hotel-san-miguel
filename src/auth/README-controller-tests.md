# Tests del Controlador de Autenticación

## Descripción

Este archivo contiene tests unitarios completos para el `AuthController` basados en la documentación de la API. Los tests verifican todos los endpoints del módulo de autenticación y sus diferentes casos de uso.

## Endpoints Testeados

### 1. POST /auth/login
- ✅ Autenticación exitosa con credenciales válidas
- ✅ Error 401 para credenciales inválidas
- ✅ Error 400 para errores de procesamiento
- ✅ Validación de estructura del DTO de entrada

### 2. POST /auth/logout
- ✅ Logout exitoso con token válido
- ✅ Error 401 para token inválido
- ✅ Error 401 para token no proporcionado
- ✅ Error 401 para formato de token inválido
- ✅ Error 401 para token ya invalidado

### 3. POST /auth/validate
- ✅ Validación exitosa de token válido
- ✅ Error 401 para token inválido
- ✅ Error 401 para token no proporcionado
- ✅ Error 401 para formato de token inválido
- ✅ Error 401 para token en lista negra
- ✅ Error 401 para usuario no encontrado
- ✅ Validación de estructura de respuesta

## Casos de Prueba Adicionales

### Casos de Borde
- ✅ Múltiples llamadas concurrentes al login
- ✅ Manejo de diferentes tipos de roles de usuario
- ✅ Validación de parámetros correctos en métodos del servicio

### Integración con Documentación API
- ✅ Estructura de respuesta para login exitoso
- ✅ Estructura de respuesta para logout exitoso
- ✅ Estructura de respuesta para validación exitosa

## Configuración de Tests

Los tests están configurados para:

1. **Aislamiento completo**: Utilizan mocks del `AuthService` y `AuthGuard`
2. **Sin dependencias externas**: No requieren base de datos ni servicios externos
3. **Limpieza automática**: Los mocks se limpian después de cada test
4. **Verificación completa**: Verifican tanto el comportamiento como la estructura de datos

## Estructura del Test

```typescript
describe('AuthController', () => {
  // Mock del AuthService
  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
    validateToken: jest.fn(),
  };

  // Configuración del módulo de testing
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();
  });
});
```

## Ejecución de Tests

Para ejecutar solo los tests del controlador de auth:

```bash
# Configurar variable de entorno
$env:NODE_ENV='development'

# Ejecutar tests específicos
npm test -- --testPathPattern=auth.controller.spec.ts

# O ejecutar todos los tests
npm test
```

## Cobertura de Pruebas

Los tests cubren:

- **100% de métodos públicos** del controlador
- **Casos exitosos** de todos los endpoints
- **Casos de error** documentados en la API
- **Validaciones de tipos** y estructura de datos
- **Casos de borde** y situaciones especiales

## Tecnologías Utilizadas

- **Jest**: Framework de testing
- **@nestjs/testing**: Utilidades de testing de NestJS
- **Mocks**: Para aislar dependencias
- **TypeScript**: Tipado fuerte en tests

## Resultados de Ejemplo

```
 PASS  src/auth/auth.controller.spec.ts
  AuthController
    Definición del controlador
      ✓ debería estar definido
    login
      ✓ debería autenticar correctamente un usuario válido
      ✓ debería lanzar UnauthorizedException para credenciales inválidas
      ✓ debería lanzar BadRequestException para errores de procesamiento
      ✓ debería validar la estructura del DTO de entrada
    logout
      ✓ debería cerrar sesión correctamente con token válido
      ✓ debería lanzar UnauthorizedException para token inválido
      ✓ debería lanzar UnauthorizedException para token no proporcionado
      ✓ debería lanzar UnauthorizedException para formato de token inválido
      ✓ debería lanzar UnauthorizedException para token ya invalidado
    validateToken
      ✓ debería validar correctamente un token válido
      ✓ debería lanzar UnauthorizedException para token inválido
      ✓ debería lanzar UnauthorizedException para token no proporcionado
      ✓ debería lanzar UnauthorizedException para formato de token inválido
      ✓ debería lanzar UnauthorizedException para token en lista negra
      ✓ debería lanzar UnauthorizedException para usuario no encontrado
      ✓ debería validar la estructura de la respuesta exitosa
    Casos de borde y validaciones adicionales
      ✓ debería manejar correctamente múltiples llamadas concurrentes a login
      ✓ debería manejar diferentes tipos de roles de usuario
      ✓ debería validar que los métodos del servicio son llamados con los parámetros correctos
    Validaciones de integración con documentación API
      ✓ debería cumplir con la estructura de respuesta documentada para login exitoso
      ✓ debería cumplir con la estructura de respuesta documentada para logout exitoso
      ✓ debería cumplir con la estructura de respuesta documentada para validación exitosa

Test Suites: 1 passed, 1 total
Tests:       23 passed, 23 total
```

## Mantenimiento

Para mantener estos tests actualizados:

1. **Cuando se modifique la API**: Actualizar los tests correspondientes
2. **Nuevos endpoints**: Agregar nuevos grupos de tests
3. **Cambios en DTOs**: Actualizar las validaciones de estructura
4. **Nuevos casos de error**: Agregar tests para nuevos códigos de error

## Buenas Prácticas Implementadas

- **Patrón AAA (Arrange-Act-Assert)**: Estructura clara de tests
- **Nomenclatura descriptiva**: Nombres de tests que explican qué se está probando
- **Mocks aislados**: Cada test es independiente
- **Verificación completa**: Se verifica tanto el resultado como las llamadas
- **Casos de borde**: Tests para situaciones especiales
- **Documentación**: Comentarios y explicaciones claras 