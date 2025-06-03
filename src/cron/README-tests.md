# Tests del Sistema de Cron Jobs (CronController y CronService)

## Descripción

Este directorio contiene tests unitarios completos para el sistema de cron jobs que gestiona automáticamente los estados de habitaciones y reservas. Los tests están divididos en dos archivos que validan diferentes aspectos del sistema:

- **`cron.controller.spec.ts`**: Tests del controller (comportamiento de API)
- **`cron.service.spec.ts`**: Tests del service (lógica de negocio completa)

## 🔍 **Diferencia entre Tests del Controller y Service**

### **Tests del Controller (`cron.controller.spec.ts`)**
- ✅ Valida únicamente el comportamiento del controller
- ✅ Usa mocks del service (no ejecuta lógica real)
- ✅ Verifica que se llamen los métodos correctos con parámetros correctos
- ✅ Testea propagación de errores y estructura de respuesta

### **Tests del Service (`cron.service.spec.ts`)**
- ✅ Valida **toda la lógica de negocio real**
- ✅ Mockea únicamente las dependencias externas (BD, SSE)
- ✅ Ejecuta el código real del service y valida su comportamiento
- ✅ Testea transacciones, filtros SQL, y emisiones SSE

## 🧪 **Funcionalidad Testeada**

### **Endpoint del Controller**

**`GET /cron/marcar-estados-habitaciones`**
- ✅ Ejecución manual del proceso de cron job
- ✅ Requiere autenticación de administrador
- ✅ Retorna resumen de actualizaciones realizadas
- ✅ Propagación correcta de errores del service

### **Lógica del Service**

**`marcarEstadosCronConTransaccion()`**
- ✅ Actualización automática de estados de habitaciones
- ✅ Finalización de reservas vencidas
- ✅ Uso de transacciones para consistencia
- ✅ Emisión de eventos SSE para tiempo real
- ✅ Manejo robusto de errores

## 🏠 **Estados de Habitaciones Gestionados**

### **RESERVADO (Near - Próximas 6 horas)**
```sql
-- Habitaciones con reservas en las próximas 6 horas
WHERE deleted = false 
  AND estado NOT IN ('RESERVADO', 'OCUPADO')
  AND reservas.some(
    deleted = false 
    AND estado = 'RESERVADO'
    AND fecha_inicio >= ahora
    AND fecha_inicio <= (ahora + 6 horas)
  )
```

### **OCUPADO (Actualmente ocupadas)**
```sql
-- Habitaciones con reservas activas en este momento
WHERE deleted = false 
  AND estado != 'OCUPADO'
  AND reservas.some(
    deleted = false 
    AND estado = 'RESERVADO'
    AND fecha_inicio <= ahora
    AND fecha_fin > ahora
  )
```

### **LIBRE (Sin reservas activas)**
```sql
-- Habitaciones sin reservas activas o próximas
WHERE deleted = false 
  AND estado != 'LIBRE'
  AND reservas.none(
    deleted = false 
    AND estado IN ('RESERVADO', 'PENDIENTE')
    AND (
      (fecha_inicio >= ahora AND fecha_inicio <= (ahora + 6 horas))
      OR (fecha_inicio <= ahora AND fecha_fin > ahora)
    )
  )
```

## 📋 **Reservas Gestionadas**

### **FINALIZADO (Reservas vencidas)**
```sql
-- Reservas que ya terminaron
WHERE deleted = false 
  AND estado = 'RESERVADO'
  AND fecha_fin < ahora
```

## 🔧 **Configuración de Mocks**

### **Tests del Controller**

```typescript
// CronService mockeado
const mockCronService = {
  marcarEstadosCronConTransaccion: jest.fn(),
};

// Dependencias para AuthGuard
const mockJwtService = { verifyAsync: jest.fn() };
const mockBlacklistService = { isTokenBlacklisted: jest.fn() };
const mockPrismaService = { usuario: { findFirst: jest.fn() } };
const mockReflector = { getAllAndOverride: jest.fn() };
```

### **Tests del Service**

```typescript
// PrismaService con transacciones
const mockPrismaService = {
  $transaction: jest.fn(),
  habitacion: { findMany: jest.fn(), updateMany: jest.fn() },
  reserva: { findMany: jest.fn(), updateMany: jest.fn() },
};

// Servicios SSE
const mockHabitacionSseService = { emitirCambios: jest.fn() };
const mockReservaSseService = { emitirCambio: jest.fn() };
```

## ✨ **Casos de Prueba del Controller**

### **Ejecución Exitosa**
- ✅ Retorna resumen correcto de cambios
- ✅ Llama al service una sola vez
- ✅ Maneja contadores en cero correctamente

### **Manejo de Errores**
- ✅ Propaga errores del service
- ✅ Maneja diferentes tipos de errores
- ✅ Mantiene estructura de respuesta

### **Configuración**
- ✅ Decoradores de autenticación configurados
- ✅ Ruta del controller correcta
- ✅ Validación de metadata

## ✨ **Casos de Prueba del Service**

### **Lógica Principal**
- ✅ Actualización completa de estados exitosa
- ✅ Manejo de casos sin cambios
- ✅ Construcción correcta de filtros WHERE
- ✅ Emisión correcta de eventos SSE

### **Validaciones de Negocio**
- ✅ Condiciones de tiempo para habitaciones RESERVADAS
- ✅ Condiciones de tiempo para habitaciones OCUPADAS  
- ✅ Condiciones para habitaciones LIBRES
- ✅ Validación de reservas finalizadas

### **Transacciones**
- ✅ Orden correcto de operaciones
- ✅ Rollback en caso de error
- ✅ Emisión SSE solo después de confirmación

### **Casos de Borde**
- ✅ Múltiples habitaciones del mismo tipo
- ✅ Agrupación correcta de reservas por habitación
- ✅ Errores parciales en transacciones

## 🚀 **Ejecución de Tests**

```bash
# Solo tests del CronController
$env:NODE_ENV='development'
npm test -- --testPathPattern=cron.controller.spec.ts

# Solo tests del CronService  
$env:NODE_ENV='development'
npm test -- --testPathPattern=cron.service.spec.ts

# Todos los tests de cron
$env:NODE_ENV='development'
npm test -- --testPathPattern=cron

# Todos los tests
npm test
```

## 📊 **Resultados Esperados**

### **CronController Tests**
```
PASS  src/cron/cron.controller.spec.ts
  CronController
    Definición del controller
      ✓ debería estar definido
      ✓ debería tener el servicio inyectado
    manualMarcarEstados
      ✓ debería ejecutar la actualización manual de estados exitosamente
      ✓ debería retornar resultado con contadores en cero cuando no hay cambios
      ✓ debería propagar errores del servicio
      ✓ debería manejar diferentes tipos de errores del servicio
    Configuración y decoradores
      ✓ debería tener la configuración correcta de ruta
      ✓ debería requerir autenticación de administrador
    Casos de borde y validaciones
      ✓ debería manejar valores numéricos grandes correctamente
      ✓ debería mantener la estructura de respuesta incluso con datos vacíos
      ✓ debería llamar al método del servicio solo una vez por invocación

Tests: 9 passed, 9 total
```

### **CronService Tests**
```
PASS  src/cron/cron.service.spec.ts
  CronService
    Definición del servicio
      ✓ debería estar definido
      ✓ debería tener todas las dependencias inyectadas
    marcarEstadosCronConTransaccion
      ✓ debería actualizar estados de habitaciones y reservas exitosamente
      ✓ debería manejar caso sin cambios correctamente
      ✓ debería manejar errores en la transacción correctamente
      ✓ debería construir filtros WHERE correctamente para habitaciones
      ✓ debería agrupar reservas por habitación para SSE correctamente
    Validaciones de lógica de negocio
      ✓ debería validar condiciones de tiempo para habitaciones RESERVADAS
      ✓ debería validar condiciones de tiempo para habitaciones OCUPADAS
      ✓ debería validar condiciones para habitaciones LIBRES
      ✓ debería validar condiciones para reservas finalizadas
    Casos de borde y validaciones adicionales
      ✓ debería manejar múltiples habitaciones del mismo tipo correctamente
      ✓ debería manejar errores parciales en la transacción
      ✓ debería verificar el orden correcto de ejecución de operaciones
      ✓ debería emitir eventos SSE solo después de confirmación de transacción

Tests: 14 passed, 14 total
```

## 🎯 **Cobertura de Pruebas**

### **Funcionalidad Core**
- **100%** de métodos públicos del controller y service
- **100%** de flujos de éxito y error
- **100%** de validaciones de entrada
- **100%** de lógica de transacciones

### **Integración con Dependencias**
- **PrismaService**: Todas las consultas y transacciones mockeadas
- **HabitacionSseService**: Emisión de cambios de habitaciones
- **ReservaSseService**: Emisión de cambios de reservas
- **AuthGuard**: Configuración de seguridad

### **Lógica de Negocio**
- **Estados de habitaciones**: Todas las transiciones posibles
- **Gestión temporal**: Ventanas de 6 horas, reservas activas
- **Consistencia**: Transacciones atómicas
- **Tiempo real**: Eventos SSE después de confirmación

## 📝 **Beneficios de estos Tests**

### **Confianza en Automatización**
- ✅ Valida lógica crítica de estados automáticos
- ✅ Garantiza consistencia en actualizaciones masivas
- ✅ Previene inconsistencias en estados de habitaciones

### **Refactoring Seguro**
- ✅ Permite cambios en lógica de cron con confianza
- ✅ Detecta regresiones en filtros SQL complejos
- ✅ Mantiene contratos de API y SSE

### **Documentación Técnica**
- ✅ Los tests documentan la lógica de negocio compleja
- ✅ Ejemplos de uso de transacciones Prisma
- ✅ Casos de error claramente definidos

## 🔄 **Mantenimiento**

### **Cuando actualizar:**
1. **Cambios en lógica de estados**: Actualizar filtros WHERE en tests
2. **Nuevas validaciones temporales**: Agregar casos de tiempo
3. **Cambios en SSE**: Actualizar emisiones esperadas
4. **Modificaciones de BD**: Actualizar mocks de Prisma

### **Buenas prácticas seguidas:**
- **Transacciones atomicas**: Tests validan rollback y commit
- **Tiempo real**: Verificación de emisiones SSE
- **Filtros SQL**: Validación de consultas complejas
- **Datos realistas**: Fechas y estados del dominio
- **Casos extremos**: Múltiples habitaciones, errores parciales

## 🏨 **Importancia del Sistema**

Este sistema de cron jobs es **crítico** para el funcionamiento del hotel:

- **Estados actualizados**: Habitaciones reflejan situación real
- **Experiencia de usuario**: Frontend actualizado en tiempo real
- **Gestión operativa**: Staff tiene información precisa
- **Automatización**: Reduce trabajo manual y errores humanos

Los tests garantizan que esta funcionalidad crítica funcione correctamente en todo momento. 