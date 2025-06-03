# Tests del Sistema de Registro de Formularios (RegistroFormularioController y RegistroFormularioService)

## Descripción

Este directorio contiene tests unitarios completos para el sistema de registro de formularios que gestiona la creación de reservas con integración a sistemas externos como TRA. Los tests están divididos en dos archivos que validan diferentes aspectos del sistema:

- **`registro-formulario.controller.spec.ts`**: Tests del controller (comportamiento de API)
- **`registro-formulario.service.spec.ts`**: Tests del service (lógica de negocio completa)

## ✅ **MEJORAS CRÍTICAS IMPLEMENTADAS**

Las siguientes mejoras críticas han sido implementadas en el sistema antes de crear los tests:

### **1. Operaciones Atómicas con Transacciones**
- **Problema resuelto**: Separación de la integración TRA como operación independiente
- **Implementado**: `registerTraSeparate()` ejecuta en transacción separada y controlada
- **Implementado**: `registerFormularioInTra()` completamente transaccional y atómico

### **2. Manejo Robusto de Errores**
- **Implementado**: Manejo consistente de errores Prisma P2025 con conversión apropiada
- **Implementado**: Try-catch anidado para actualizar estado en caso de fallo TRA
- **Implementado**: Logs detallados para troubleshooting y monitoreo

### **3. Controller Mejorado**
- **Implementado**: Uso correcto de decoradores NestJS (`@HttpCode`, sin statusCode manual)
- **Implementado**: Documentación Swagger completa incluyendo status 207 para casos parciales
- **Implementado**: Manejo diferenciado de éxito completo vs. éxito parcial

## 📁 **Estructura de Tests**

### **Controller Tests (12 tests)**
```
✅ Definición del controller (2 tests)
✅ create (2 tests) - Formulario sin TRA
✅ createWithTra (3 tests) - Formulario con TRA
✅ registerFormularioInTra (3 tests) - Registro TRA manual
✅ Configuración y decoradores (1 test)
✅ Casos de borde y validaciones (4 tests)
```

### **Service Tests (18 tests)**
```
✅ Definición del servicio (2 tests)
✅ create (3 tests) - Lógica sin TRA
✅ createWithTra (3 tests) - Lógica con TRA
✅ registerFormularioInTra (5 tests) - Registro TRA completo
✅ Casos de borde y validaciones adicionales (5 tests)
```

## 🔧 **Configuración de Mocks**

### **Controller Tests**
- **Mock del Service**: Validación únicamente del comportamiento del controller
- **Mocks de Guards**: JwtService, BlacklistService, PrismaService, Reflector
- **No ejecuta lógica real**: Enfoque en estructura de respuestas y propagación de errores

### **Service Tests**
- **Mocks de dependencias externas**: PrismaService, TraService, servicios relacionados
- **Lógica real del service**: Validación completa de la lógica de negocio
- **Transacciones simuladas**: Mock de `$transaction` con callbacks reales

## 🎯 **Funcionalidad Cubierta**

### **Endpoints del Controller**
1. **`POST /registro-formulario/:token`**: Crear formulario sin TRA
2. **`POST /registro-formulario/tra/:token`**: Crear formulario con TRA
3. **`POST /registro-formulario/tra/formulario/:id`**: Registrar formulario existente en TRA

### **Métodos del Service**
1. **`create()`**: Transacción atómica para crear formulario sin TRA
2. **`createWithTra()`**: Transacción principal + TRA separado y controlado
3. **`registerFormularioInTra()`**: Registro TRA transaccional para formularios existentes

### **Flujos de Negocio Validados**

#### **Formulario Sin TRA (`create`)**
- ✅ Creación exitosa con todas las entidades (huésped, habitación, reserva, factura, formulario)
- ✅ Manejo de huéspedes secundarios opcionales
- ✅ Validación de habitación existente
- ✅ Manejo de errores de dependencias

#### **Formulario Con TRA (`createWithTra`)**
- ✅ **Éxito completo**: Formulario + TRA exitoso
- ✅ **Éxito parcial (Status 207)**: Formulario exitoso pero TRA falla
- ✅ Separación de operaciones: transacción principal independiente de TRA
- ✅ Propagación de errores de transacción principal

#### **Registro TRA Manual (`registerFormularioInTra`)**
- ✅ Registro exitoso en TRA con transacción atómica
- ✅ Detección de formularios ya registrados
- ✅ Manejo de formularios no encontrados (P2025 → NotFoundException)
- ✅ Manejo de errores TRA con rollback automático
- ✅ Validación de respuestas TRA inválidas

## 🚨 **Casos de Error Cubiertos**

### **Errores de Validación**
- Habitación no encontrada → `NotFoundException`
- Formulario no encontrado → `NotFoundException`
- Datos inválidos → `BadRequestException`

### **Errores de Concurrencia**
- Token ya completado → `ConflictException`
- Constraints de BD → `ConflictException`

### **Errores de Integración**
- Fallo TRA → Éxito parcial (207) en `createWithTra`
- Fallo TRA → `BadRequestException` en `registerFormularioInTra`
- Respuesta TRA inválida → `BadRequestException`

### **Errores Prisma**
- `P2002` (Unique constraint) → `ConflictException`
- `P2003` (Foreign key) → `BadRequestException`
- `P2025` (Record not found) → `NotFoundException`

## 📊 **Validaciones Específicas**

### **Atomicidad Transaccional**
- Verificación de rollback en caso de error
- Orden correcto de operaciones en transacción
- Separación de operaciones principales vs. auxiliares (TRA)

### **Estructuras de Respuesta**
- **Éxito completo**: `{ message, data: { formulario, reserva, huesped, traFormulario } }`
- **Éxito parcial**: `{ statusCode: 207, message, data: { ..., traError } }`
- **Propagación de errores**: Sin modificación de excepciones del service

### **Integración con Guards**
- Validación de autenticación con `LinkFormularioGuard` y `RolesGuard`
- Extracción correcta de usuario del request JWT
- Configuración apropiada de decoradores de seguridad

## 🧪 **Ejecución de Tests**

### **Tests Individuales**
```bash
# Solo controller
npm test src/registro-formulario/registro-formulario.controller.spec.ts

# Solo service
npm test src/registro-formulario/registro-formulario.service.spec.ts

# Ambos
npm test -- --testPathPattern=registro-formulario
```

### **Tests con Cobertura**
```bash
npm run test:cov -- --testPathPattern=registro-formulario
```

### **Tests en Modo Watch**
```bash
npm run test:watch -- --testPathPattern=registro-formulario
```

## 📈 **Cobertura Esperada**

- **Controller**: 100% cobertura de líneas y branches
- **Service**: 100% cobertura de métodos públicos y principales flujos
- **Casos de error**: Cobertura completa de todos los tipos de excepción
- **Casos de borde**: Validación de todos los flujos condicionales

## 🔍 **Puntos Clave de Validación**

1. **Transacciones Atómicas**: Verificar que las transacciones se ejecuten correctamente
2. **Separación TRA**: Confirmar que TRA no afecta la transacción principal
3. **Manejo de Errores**: Validar que cada tipo de error se maneja apropiadamente
4. **Status Codes**: Verificar respuestas HTTP correctas (201, 207, 400, 404, 409)
5. **Propagación**: Confirmar que errores del service se propagan correctamente al controller

## 🎯 **Importancia del Sistema**

El sistema de registro de formularios es **crítico** para la operación del hotel ya que:

- Gestiona el check-in de huéspedes
- Integra con sistemas externos obligatorios (TRA)
- Maneja transacciones financieras (facturas)
- Coordina múltiples entidades relacionadas
- Debe garantizar consistencia de datos en todo momento

Los tests aseguran que todas estas operaciones funcionen correctamente bajo diferentes escenarios y condiciones de error. 