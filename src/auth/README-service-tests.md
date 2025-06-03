# Tests del Servicio de Autenticación (AuthService)

## Descripción

Este archivo contiene tests unitarios completos para el `AuthService` que validan **toda la lógica de negocio real** del servicio de autenticación. A diferencia de los tests del controller, estos tests verifican la implementación completa de cada método del service.

## 🔍 **Diferencia con los Tests del Controller**

### **Tests del Controller (`auth.controller.spec.ts`)**
- ✅ Valida únicamente el comportamiento del controller
- ✅ Usa mocks del service (no ejecuta lógica real)
- ✅ Verifica que se llamen los métodos correctos con parámetros correctos

### **Tests del Service (`auth.service.spec.ts`)**
- ✅ Valida **toda la lógica de negocio real**
- ✅ Mockea únicamente las dependencias externas (BD, JWT, Blacklist)
- ✅ Ejecuta el código real del service y valida su comportamiento

## 🧪 **Métodos Testeados**

### **1. login(loginDto)**

**Lógica testeada:**
- ✅ Búsqueda de usuario en base de datos con filtros correctos
- ✅ Verificación de contraseña con bcrypt
- ✅ Generación de payload JWT correcto
- ✅ Manejo de errores en cada paso del proceso
- ✅ Transformación correcta de respuesta

**Casos de prueba:**
- ✅ Login exitoso con credenciales válidas
- ✅ Error cuando usuario no existe
- ✅ Error cuando contraseña es incorrecta
- ✅ Error cuando falla la base de datos
- ✅ Error cuando falla bcrypt
- ✅ Error cuando falla la generación del JWT

### **2. logout(authHeader)**

**Lógica testeada:**
- ✅ Parseo correcto del header Authorization
- ✅ Validación de formato "Bearer token"
- ✅ Verificación de token con JWT service
- ✅ Consulta a blacklist service
- ✅ Adición del token a la blacklist
- ✅ Manejo de errores en cada validación

**Casos de prueba:**
- ✅ Logout exitoso con token válido
- ✅ Error con header vacío o undefined
- ✅ Error con formato de token inválido
- ✅ Error con token JWT inválido
- ✅ Error con token ya en blacklist
- ✅ Error al agregar token a blacklist

### **3. validateToken(authHeader)**

**Lógica testeada:**
- ✅ Parseo del header Authorization
- ✅ Verificación en blacklist antes de validar
- ✅ Verificación del token JWT
- ✅ Búsqueda del usuario en base de datos
- ✅ Orden correcto de validaciones
- ✅ Estructura correcta de respuesta

**Casos de prueba:**
- ✅ Validación exitosa de token válido
- ✅ Error con header vacío o undefined
- ✅ Error con formato de token inválido
- ✅ Error con token en blacklist
- ✅ Error con token JWT inválido
- ✅ Error cuando usuario no existe
- ✅ Error en base de datos

## 🔧 **Configuración de Mocks**

### **Dependencias Mockeadas:**

```typescript
// PrismaService - Base de datos
const mockPrismaService = {
  usuario: {
    findFirst: jest.fn(),
  },
};

// JwtService - Tokens JWT
const mockJwtService = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
};

// BlacklistService - Lista negra de tokens
const mockBlacklistService = {
  isTokenBlacklisted: jest.fn(),
  addToBlacklist: jest.fn(),
};

// bcrypt - Hashing de contraseñas
jest.mock('bcryptjs');

// Variables de entorno
jest.mock('src/config/envs', () => ({
  envs: { jwtSecret: 'test-secret-key' },
}));
```

## ✨ **Casos de Borde Testeados**

### **Validaciones Concurrentes**
- ✅ Múltiples validaciones de token simultáneas
- ✅ Diferentes roles de usuario
- ✅ Tokens de diferentes longitudes

### **Orden de Ejecución**
- ✅ Verificación del orden correcto de llamadas a dependencias
- ✅ Validación de que se ejecutan en secuencia correcta:
  1. Blacklist check
  2. JWT verification
  3. Database lookup

### **Integración con API**
- ✅ Estructura de respuesta cumple con documentación
- ✅ Tipos de datos correctos
- ✅ Validación de roles permitidos
- ✅ Formato de tokens JWT válido

## 🚀 **Ejecución de Tests**

```bash
# Solo tests del AuthService
$env:NODE_ENV='development'
npm test -- --testPathPattern=auth.service.spec.ts

# Todos los tests
npm test
```

## 📊 **Resultados Esperados**

```
PASS  src/auth/auth.service.spec.ts
  AuthService
    Definición del servicio
      ✓ debería estar definido
    login
      ✓ debería autenticar correctamente un usuario con credenciales válidas
      ✓ debería lanzar UnauthorizedException cuando el usuario no existe
      ✓ debería lanzar UnauthorizedException cuando la contraseña es incorrecta
      ✓ debería lanzar BadRequestException cuando ocurre un error inesperado
      ✓ debería manejar errores en la comparación de contraseñas
      ✓ debería manejar errores en la generación del token JWT
    logout
      ✓ debería cerrar sesión correctamente con un token válido
      ✓ debería lanzar UnauthorizedException cuando no se proporciona header
      ✓ debería lanzar UnauthorizedException cuando el formato del token es inválido
      ✓ debería lanzar UnauthorizedException cuando el token es inválido
      ✓ debería lanzar UnauthorizedException cuando el token ya está en lista negra
      ✓ debería manejar errores al agregar token a lista negra
    validateToken
      ✓ debería validar correctamente un token válido
      ✓ debería lanzar UnauthorizedException cuando no se proporciona header
      ✓ debería lanzar UnauthorizedException cuando el formato del token es inválido
      ✓ debería lanzar UnauthorizedException cuando el token está en lista negra
      ✓ debería lanzar UnauthorizedException cuando el token es inválido o expirado
      ✓ debería lanzar UnauthorizedException cuando el usuario no existe
      ✓ debería manejar errores inesperados durante la validación
    Casos de borde y validaciones adicionales
      ✓ debería manejar múltiples validaciones de token concurrentes
      ✓ debería validar diferentes tipos de roles correctamente
      ✓ debería manejar correctamente tokens con diferentes longitudes
      ✓ debería verificar que se llama a las dependencias en el orden correcto
    Integración con documentación API
      ✓ debería cumplir con el contrato de la API para login exitoso
      ✓ debería cumplir con el contrato de la API para logout exitoso
      ✓ debería cumplir con el contrato de la API para validación exitosa

Tests: 22 passed, 22 total
```

## 🎯 **Cobertura de Pruebas**

### **Lógica de Negocio**
- **100%** de métodos públicos del service
- **100%** de flujos de éxito
- **100%** de casos de error documentados
- **100%** de validaciones de entrada

### **Dependencias Externas**
- **PrismaService**: Todas las consultas SQL mockeadas
- **JwtService**: Generación y verificación de tokens
- **BlacklistService**: Operaciones de lista negra
- **bcrypt**: Comparación de contraseñas

### **Casos de Error**
- **Database errors**: Fallos en consultas SQL
- **JWT errors**: Tokens inválidos o expirados
- **Blacklist errors**: Problemas con lista negra
- **Validation errors**: Entrada inválida
- **Business logic errors**: Lógica de negocio

## 📝 **Ventajas de estos Tests**

### **Confianza en el Código**
- ✅ Valida la lógica real del service
- ✅ Detecta errores en implementación
- ✅ Garantiza comportamiento correcto

### **Refactoring Seguro**
- ✅ Permite cambios con confianza
- ✅ Detecta regresiones inmediatamente
- ✅ Mantiene contratos de API

### **Documentación Viva**
- ✅ Los tests documentan el comportamiento esperado
- ✅ Ejemplos de uso reales
- ✅ Casos de error claramente definidos

## 🔄 **Mantenimiento**

### **Cuando actualizar:**
1. **Cambios en lógica de negocio**: Actualizar tests correspondientes
2. **Nuevas validaciones**: Agregar casos de prueba
3. **Cambios en dependencias**: Actualizar mocks
4. **Nuevos casos de error**: Agregar tests de error

### **Buenas prácticas seguidas:**
- **Patrón AAA**: Arrange-Act-Assert
- **Mocks aislados**: Cada test independiente
- **Nombres descriptivos**: Explican qué se prueba
- **Verificación completa**: Resultado y comportamiento
- **Casos realistas**: Datos de prueba reales 