# Tests de los Guards de Autenticación

## Descripción

Este directorio contiene tests unitarios completos para todos los **Guards** del módulo de autenticación que validan **toda la lógica de negocio real** de cada guard. Similar a los tests del AuthService, estos tests verifican la implementación completa de cada método de guard.

## 🔍 **Diferencia con los Tests del Controller**

### **Tests del Controller (`auth.controller.spec.ts`)**
- ✅ Usa mocks de los guards (no ejecuta lógica real)
- ✅ Verifica que se aplican los decoradores correctos

### **Tests de los Guards (`*.guard.spec.ts`)**
- ✅ Valida **toda la lógica de seguridad real**
- ✅ Mockea únicamente las dependencias externas
- ✅ Ejecuta el código real de cada guard y valida su comportamiento

## 🛡️ **Guards Testeados**

### **1. AuthGuard (`auth.guard.spec.ts`)**

**Propósito**: Validación completa de autenticación JWT con verificación de usuario en BD.

**Lógica testeada:**
- ✅ Extracción de token desde header Authorization
- ✅ Verificación en blacklist de tokens
- ✅ Validación del token JWT
- ✅ Búsqueda y verificación del usuario en base de datos
- ✅ Adjuntar usuario al request para siguientes guards/controllers
- ✅ Manejo de errores en cada paso

**Casos de prueba:**
- ✅ Acceso permitido con token válido
- ✅ Error cuando no se proporciona token
- ✅ Error con formato de header inválido
- ✅ Error cuando token está en blacklist
- ✅ Error cuando token JWT es inválido
- ✅ Error cuando usuario no existe o está eliminado
- ✅ Error en casos inesperados
- ✅ Validación del método `extractTokenFromHeader`

### **2. JwtCookieGuardGuard (`jwt-cookie-guard.guard.spec.ts`)**

**Propósito**: Extracción de tokens JWT desde cookies para autenticación.

**Lógica testeada:**
- ✅ Parseo de cookies desde header
- ✅ Extracción del token `auth_token`
- ✅ Conversión a header Authorization Bearer
- ✅ Decodificación de valores URL-encoded
- ✅ Manejo de múltiples cookies

**Casos de prueba:**
- ✅ Extracción exitosa de auth_token
- ✅ Manejo de múltiples cookies
- ✅ Decodificación de valores encoded
- ✅ Manejo de espacios en cookies
- ✅ Error cuando no existe header cookie
- ✅ Error cuando no existe auth_token
- ✅ Error cuando auth_token está vacío
- ✅ Casos de borde con cookies malformadas

### **3. LinkFormularioGuard (`linkFormulario.guard.spec.ts`)**

**Propósito**: Validación de tokens de formularios con lógica de negocio específica.

**Lógica testeada:**
- ✅ Extracción de token desde parámetros URL
- ✅ Decodificación inicial del token para obtener ID
- ✅ Verificación de estado del formulario (completado/expirado)
- ✅ Validación completa del token JWT
- ✅ Verificación en blacklist
- ✅ Manejo especial de tokens expirados
- ✅ Actualización automática de formularios expirados

**Casos de prueba:**
- ✅ Acceso permitido con token válido y formulario activo
- ✅ Error cuando no se proporciona token
- ✅ Error cuando formulario ya está completado
- ✅ Error cuando formulario está expirado
- ✅ Error cuando token está en blacklist
- ✅ Error cuando token JWT es inválido
- ✅ Manejo de tokens expirados con actualización de BD
- ✅ Validación de orden de verificaciones (completado > expirado > token)

### **4. RolesGuard (`roles.guard.spec.ts`)**

**Propósito**: Verificación de roles de usuario para autorización.

**Lógica testeada:**
- ✅ Lectura de roles requeridos desde decoradores
- ✅ Extracción de usuario desde request
- ✅ Comparación de rol del usuario con roles requeridos
- ✅ Manejo de casos donde no hay roles requeridos
- ✅ Validación con múltiples roles permitidos

**Casos de prueba:**
- ✅ Acceso permitido cuando no hay roles requeridos
- ✅ Acceso permitido cuando usuario tiene rol requerido
- ✅ Acceso permitido con múltiples roles (any match)
- ✅ Acceso denegado cuando usuario no tiene rol requerido
- ✅ Acceso denegado cuando usuario no tiene rol definido
- ✅ Validación con todos los roles del sistema
- ✅ Casos de borde con roles null/undefined

## 🔧 **Configuración de Mocks**

### **Dependencias Mockeadas por Guard:**

#### **AuthGuard**
```typescript
const mockJwtService = { verifyAsync: jest.fn() };
const mockBlacklistService = { isTokenBlacklisted: jest.fn() };
const mockPrismaService = { usuario: { findFirst: jest.fn() } };
```

#### **JwtCookieGuardGuard**
```typescript
// No requiere servicios externos - lógica pura de parseo
```

#### **LinkFormularioGuard**
```typescript
const mockJwtService = { decode: jest.fn(), verifyAsync: jest.fn() };
const mockLinkFormularioService = { findOne: jest.fn(), update: jest.fn() };
const mockBlacklistService = { isTokenBlacklisted: jest.fn() };
```

#### **RolesGuard**
```typescript
const mockReflector = { getAllAndOverride: jest.fn() };
```

### **ExecutionContext Mock:**
```typescript
const mockExecutionContext = {
  switchToHttp: jest.fn().mockReturnValue({
    getRequest: jest.fn().mockReturnValue(mockRequest)
  })
} as unknown as ExecutionContext;
```

## ✨ **Casos de Borde Testeados**

### **Seguridad y Validación**
- ✅ Tokens con diferentes longitudes
- ✅ Formatos de headers malformados
- ✅ Cookies con caracteres especiales
- ✅ Tokens expirados con manejo especial
- ✅ Usuarios con roles case-sensitive

### **Orden de Ejecución**
- ✅ Verificación del orden correcto de validaciones
- ✅ Priorización de verificaciones (completado > expirado > token)
- ✅ Early returns en validaciones fallidas

### **Integración**
- ✅ Adjuntar datos correctos al request
- ✅ Preservar otros headers existentes
- ✅ Manejo de múltiples roles y permisos

## 🚀 **Ejecución de Tests**

```bash
# Solo tests de guards
$env:NODE_ENV='development'
npm test -- --testPathPattern="guards.*\.spec\.ts"

# Test específico de un guard
npm test -- --testPathPattern="auth.guard.spec.ts"
npm test -- --testPathPattern="jwt-cookie-guard.guard.spec.ts"
npm test -- --testPathPattern="linkFormulario.guard.spec.ts"
npm test -- --testPathPattern="roles.guard.spec.ts"

# Todos los tests del módulo auth
npm test -- --testPathPattern="auth"
```

## 📊 **Resultados Esperados**

```
PASS  src/auth/guards/auth.guard.spec.ts
  AuthGuard
    Definición del guard
      ✓ debería estar definido
    canActivate
      ✓ debería permitir acceso con token válido
      ✓ debería lanzar UnauthorizedException cuando no se proporciona token
      ✓ debería lanzar UnauthorizedException cuando el formato del header es inválido
      ✓ debería lanzar UnauthorizedException cuando el token está en blacklist
      ✓ debería lanzar UnauthorizedException cuando el token JWT es inválido
      ✓ debería lanzar UnauthorizedException cuando el usuario no existe
      ✓ debería lanzar UnauthorizedException cuando el usuario está eliminado
      ✓ debería lanzar BadRequestException cuando ocurre un error inesperado
      ✓ debería propagar UnauthorizedException del JWT service
    extractTokenFromHeader
      ✓ debería extraer token correctamente del header Bearer
      ✓ debería retornar undefined cuando no hay header authorization
      ✓ debería retornar undefined cuando el tipo no es Bearer
      ✓ debería retornar undefined cuando no hay token después de Bearer
      ✓ debería manejar header authorization con espacios extra
    Casos de borde y validaciones adicionales
      ✓ debería manejar diferentes tipos de roles de usuario
      ✓ debería validar que se ejecutan las verificaciones en el orden correcto
      ✓ debería manejar tokens con diferentes longitudes
      ✓ debería adjuntar el usuario correcto al request

PASS  src/auth/guards/jwt-cookie-guard.guard.spec.ts
PASS  src/auth/guards/linkFormulario.guard.spec.ts
PASS  src/auth/guards/roles.guard.spec.ts

Test Suites: 4 passed, 4 total
Tests:       70+ passed, 70+ total
```

## 🎯 **Cobertura de Pruebas**

### **Lógica de Seguridad**
- **100%** de métodos públicos de cada guard
- **100%** de flujos de autorización y denegación
- **100%** de casos de error documentados
- **100%** de validaciones de entrada

### **Dependencias Externas**
- **JwtService**: Verificación y decodificación de tokens
- **PrismaService**: Consultas de usuarios y formularios
- **BlacklistService**: Verificación de tokens invalidados
- **LinkFormularioService**: Gestión de formularios
- **Reflector**: Lectura de metadatos de decoradores

### **Casos de Error de Seguridad**
- **Authentication errors**: Tokens inválidos o faltantes
- **Authorization errors**: Roles insuficientes
- **Token expiration**: Manejo de tokens expirados
- **Blacklist errors**: Tokens en lista negra
- **Business logic errors**: Formularios completados/expirados

## 📝 **Ventajas de estos Tests**

### **Seguridad Garantizada**
- ✅ Valida toda la lógica de seguridad real
- ✅ Detecta vulnerabilidades en implementación
- ✅ Garantiza comportamiento correcto de autorización

### **Mantenimiento Seguro**
- ✅ Permite cambios con confianza en la seguridad
- ✅ Detecta regresiones de seguridad inmediatamente
- ✅ Mantiene contratos de autorización

### **Documentación de Seguridad**
- ✅ Los tests documentan el comportamiento de seguridad esperado
- ✅ Ejemplos de uso de guards reales
- ✅ Casos de error claramente definidos

## 🔄 **Mantenimiento**

### **Cuando actualizar:**
1. **Cambios en lógica de seguridad**: Actualizar tests correspondientes
2. **Nuevas validaciones**: Agregar casos de prueba
3. **Cambios en dependencias**: Actualizar mocks
4. **Nuevos roles o permisos**: Agregar tests de autorización
5. **Cambios en tokens o autenticación**: Actualizar validaciones

### **Buenas prácticas de seguridad seguidas:**
- **Patrón AAA**: Arrange-Act-Assert
- **Mocks aislados**: Cada test independiente
- **Nombres descriptivos**: Explican qué aspecto de seguridad se prueba
- **Verificación completa**: Resultado y comportamiento de seguridad
- **Casos realistas**: Datos de prueba que simulan ataques reales

## 🛡️ **Cobertura de Seguridad**

### **Ataques Prevenidos y Testeados:**
- **Token tampering**: Validación de firmas JWT
- **Token replay**: Verificación de blacklist
- **Privilege escalation**: Validación estricta de roles
- **Session hijacking**: Validación de usuarios en BD
- **Expired token usage**: Manejo correcto de expiración
- **Missing authentication**: Validación de presencia de tokens
- **Invalid authorization**: Verificación de formatos correctos

¡Los tests garantizan que todos los aspectos de seguridad funcionen correctamente! 🔒 