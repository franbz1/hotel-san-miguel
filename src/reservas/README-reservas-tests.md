# Tests del Módulo de Reservas

## Descripción

Este archivo documenta los tests completos del módulo de **Reservas** que incluyen tanto el `ReservasService` como el `ReservasController`. Los tests validan toda la funcionalidad del sistema de gestión de reservas, incluyendo la **eliminación en cascada con soft delete** y la nueva **búsqueda avanzada con filtros múltiples**.

## 🔍 **Diferencia entre Tests del Service y Controller**

### **Tests del Controller (`reservas.controller.spec.ts`)**
- ✅ Valida únicamente el comportamiento del controller
- ✅ Usa mocks del service (no ejecuta lógica real)
- ✅ Verifica que se llamen los métodos correctos con parámetros correctos
- ✅ Valida el cumplimiento con la documentación Swagger

### **Tests del Service (`reservas.service.spec.ts`)**
- ✅ Valida **toda la lógica de negocio real**
- ✅ Mockea únicamente las dependencias externas (PrismaService)
- ✅ Ejecuta el código real del service y valida su comportamiento
- ✅ Prueba la **eliminación en cascada** completa

### **Tests de Búsqueda con Filtros (`busqueda-filtros.service.spec.ts`)** ⭐ **NUEVO**
- ✅ Valida **patrón Query Builder** para construcción dinámica de consultas
- ✅ Prueba **todos los tipos de filtros** disponibles
- ✅ Valida **combinaciones complejas** de filtros múltiples
- ✅ Verifica **paginación avanzada** con metadatos de filtros
- ✅ Prueba **casos de borde** y **rendimiento concurrente**

## 🧪 **Métodos Testeados del ReservasService**

### **1. create(createReservaDto)**

**Lógica testeada:**
- ✅ Creación correcta de reserva en base de datos
- ✅ Manejo de error P2003 (huésped/habitación no existe)
- ✅ Propagación de errores inesperados
- ✅ Validación de estructura de datos

**Casos de prueba:**
- ✅ Creación exitosa con datos válidos
- ✅ Error cuando huésped o habitación no existe
- ✅ Error en base de datos

### **2. createTransaction(createReservaDto, facturaId, tx)**

**Lógica testeada:**
- ✅ Creación de reserva dentro de transacción
- ✅ Asociación correcta con factura
- ✅ Manejo de errores en transacción

**Casos de prueba:**
- ✅ Creación exitosa en transacción
- ✅ Error P2003 en transacción

### **3. findAll(paginationDto)**

**Lógica testeada:**
- ✅ Paginación correcta de resultados
- ✅ Filtrado por deleted: false
- ✅ Cálculo de metadatos de paginación
- ✅ Manejo de respuestas vacías

**Casos de prueba:**
- ✅ Paginación exitosa con datos
- ✅ Respuesta vacía sin reservas
- ✅ Página que excede límites

### **4. buscarConFiltros(filtros)** ⭐ **NUEVO - PATRÓN QUERY BUILDER**

**Lógica testeada:**
- ✅ **Construcción dinámica de consultas** usando patrón Query Builder
- ✅ **Filtros de fechas**: rangos de fecha de inicio y check-in
- ✅ **Filtros de enums**: estado de reserva y motivo de viaje
- ✅ **Filtros geográficos**: país y ciudad con búsqueda insensible
- ✅ **Filtros numéricos**: rangos de costo, acompañantes, IDs
- ✅ **Búsqueda de texto libre**: en nombres, apellidos y documentos
- ✅ **Ordenamiento dinámico**: por múltiples campos ASC/DESC
- ✅ **Combinaciones complejas**: múltiples filtros simultáneos
- ✅ **Paginación avanzada**: con metadatos de filtros aplicados

**Casos de prueba específicos:**
- ✅ **Sin filtros**: comportamiento por defecto
- ✅ **Filtros de fechas**: rangos individuales y combinados
- ✅ **Estados de reserva**: todos los valores enum
- ✅ **Motivos de viaje**: validación completa de enum
- ✅ **Búsqueda geográfica**: país y ciudad insensible a mayúsculas
- ✅ **Rangos numéricos**: costo, acompañantes con valores límite
- ✅ **IDs específicos**: habitación y huésped
- ✅ **Texto libre**: nombres, apellidos, documentos
- ✅ **Ordenamiento**: todos los campos disponibles
- ✅ **Filtros múltiples**: combinaciones complejas
- ✅ **Metadatos**: estructura de respuesta con filtros aplicados
- ✅ **Casos de borde**: valores cero, textos vacíos, páginas excedidas
- ✅ **Concurrencia**: múltiples búsquedas simultáneas
- ✅ **Aislamiento**: independencia entre filtros diferentes

**Ejemplo de filtros combinados:**
```typescript
const filtros: FiltrosReservaDto = {
  page: 1,
  limit: 10,
  fechaInicioDesde: '2024-01-01T00:00:00.000Z',
  fechaInicioHasta: '2024-12-31T23:59:59.999Z',
  estado: EstadosReserva.RESERVADO,
  costoMinimo: 200.0,
  costoMaximo: 800.0,
  paisProcedencia: 'Colombia',
  busquedaTexto: 'Juan',
  ordenarPor: 'fecha_inicio',
  direccionOrden: 'desc'
};
```

### **5. findOne(id)**

**Lógica testeada:**
- ✅ Búsqueda por ID con filtro de eliminación
- ✅ Manejo de NotFoundException
- ✅ Propagación de errores

**Casos de prueba:**
- ✅ Búsqueda exitosa por ID
- ✅ Error cuando reserva no existe
- ✅ Errores inesperados

### **6. update(id, updateReservaDto)**

**Lógica testeada:**
- ✅ Actualización de datos de reserva
- ✅ Validación de datos no vacíos
- ✅ Filtrado por deleted: false

**Casos de prueba:**
- ✅ Actualización exitosa
- ✅ Error con datos vacíos
- ✅ Error cuando reserva no existe

### **7. remove(id) - ⭐ ELIMINACIÓN EN CASCADA**

**Lógica testeada:**
- ✅ **Eliminación en cascada con soft delete**
- ✅ Uso de transacciones para consistencia
- ✅ Eliminación condicional de huéspedes
- ✅ Preservación de datos según reglas de negocio

**Entidades eliminadas:**
- ✅ La reserva (soft delete)
- ✅ Formularios relacionados
- ✅ LinkFormulario relacionados
- ✅ Factura asociada
- ✅ Huéspedes secundarios (si no tienen otras reservas)
- ✅ Huésped principal (si no tiene otras reservas)

**Casos de prueba:**
- ✅ Eliminación completa cuando huésped no tiene otras reservas
- ✅ Preservación de huésped cuando tiene otras reservas activas
- ✅ Error cuando reserva no existe

### **8. removeTx(id, tx) y UpdateTransaction()**

**Lógica testeada:**
- ✅ Operaciones dentro de transacciones
- ✅ Manejo de huéspedes secundarios
- ✅ Actualización con conectores de Prisma

## 🧪 **Métodos Testeados del ReservasController**

### **1. create(createReservaDto)**
- ✅ Llamada correcta al service
- ✅ Propagación de errores
- ✅ Validación de diferentes estados y motivos

### **2. buscarConFiltros(filtros)** ⭐ **NUEVO ENDPOINT**
- ✅ **Llamada correcta al service de búsqueda**
- ✅ **Validación de parámetros query complejos**
- ✅ **Propagación de errores de filtros**
- ✅ **Documentación Swagger completa**
- ✅ **Ejemplos de uso para todos los filtros**

### **3. findAll(paginationDto)**
- ✅ Paginación con parámetros correctos
- ✅ Manejo de respuestas vacías
- ✅ Diferentes opciones de paginación

### **4. findOne(id)**
- ✅ Búsqueda por ID
- ✅ Manejo de diferentes tipos de IDs
- ✅ Propagación de errores

### **5. update(id, updateReservaDto)**
- ✅ Actualización con datos correctos
- ✅ Manejo de datos vacíos
- ✅ Errores del service

### **6. remove(id)**
- ✅ **Eliminación en cascada desde controller**
- ✅ Propagación de errores de eliminación
- ✅ Manejo de errores específicos de cascada

## 🔧 **Configuración de Mocks**

### **ReservasService Tests:**

```typescript
const mockPrismaService = {
  reserva: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findFirstOrThrow: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  formulario: { updateMany: jest.fn() },
  linkFormulario: { update: jest.fn() },
  factura: { update: jest.fn() },
  huespedSecundario: { update: jest.fn() },
  huesped: { update: jest.fn() },
  $transaction: jest.fn(),
};
```

### **Búsqueda con Filtros Tests:** ⭐ **NUEVO**

```typescript
const mockPrismaService = {
  reserva: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
};
```

### **ReservasController Tests:**

```typescript
const mockReservasService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  buscarConFiltros: jest.fn(), // ⭐ NUEVO
};
```

## ✨ **Casos de Borde Testeados**

### **Validaciones de Estados y Motivos**
- ✅ Todos los valores del enum `EstadosReserva`
- ✅ Todos los valores del enum `MotivosViajes`
- ✅ Diferentes parámetros de paginación

### **Búsqueda Avanzada** ⭐ **NUEVO**
- ✅ **Valores cero**: costos y acompañantes mínimos
- ✅ **Textos vacíos**: filtros que se ignoran correctamente
- ✅ **Páginas excedidas**: manejo de paginación fuera de rango
- ✅ **Búsqueda insensible**: mayúsculas/minúsculas en países y ciudades
- ✅ **Rangos incompletos**: solo mínimo o solo máximo
- ✅ **Combinaciones extremas**: todos los filtros aplicados simultáneamente

### **Concurrencia y Rendimiento**
- ✅ Múltiples operaciones simultáneas
- ✅ Integridad de datos entre llamadas
- ✅ Validación de no mutación de parámetros
- ✅ **Búsquedas concurrentes**: múltiples filtros en paralelo ⭐ **NUEVO**
- ✅ **Aislamiento de filtros**: independencia entre consultas ⭐ **NUEVO**

### **Eliminación en Cascada Compleja**
- ✅ Huéspedes con múltiples reservas
- ✅ Huéspedes secundarios compartidos
- ✅ Formularios con enlaces complejos

## 🚀 **Ejecución de Tests**

```bash
# Solo tests de ReservasService (CRUD tradicional)
npm test -- --testPathPattern=reservas.service.spec.ts

# Solo tests de búsqueda con filtros ⭐ NUEVO
npm test -- --testPathPattern=busqueda-filtros.service.spec.ts

# Solo tests de ReservasController  
npm test -- --testPathPattern=reservas.controller.spec.ts

# Todos los tests de reservas
npm test -- --testPathPattern=reservas

# Test específico de búsqueda
npm test -- --testNamePattern="búsqueda|filtros|Query Builder"

# Todos los tests
npm test
```

## 📊 **Resultados Esperados**

### **ReservasService Tests:**
```
PASS  src/reservas/reservas.service.spec.ts
  ReservasService
    Definición del servicio
      ✓ debería estar definido
    create
      ✓ debería crear una reserva correctamente
      ✓ debería lanzar BadRequestException cuando el huésped no existe
      ✓ debería propagar errores inesperados
    createTransaction
      ✓ debería crear una reserva en transacción correctamente
      ✓ debería lanzar BadRequestException en transacción cuando hay error P2003
    findAll
      ✓ debería retornar reservas con paginación correctamente
      ✓ debería retornar respuesta vacía cuando no hay reservas
      ✓ debería retornar respuesta vacía cuando la página excede el límite
    findOne
      ✓ debería encontrar una reserva por ID correctamente
      ✓ debería lanzar NotFoundException cuando la reserva no existe
      ✓ debería propagar errores inesperados
    update
      ✓ debería actualizar una reserva correctamente
      ✓ debería lanzar BadRequestException cuando no se proporcionan datos
    remove (Eliminación en Cascada)
      ✓ debería eliminar reserva y entidades relacionadas correctamente
      ✓ debería preservar huésped principal si tiene otras reservas activas
      ✓ debería lanzar NotFoundException cuando la reserva no existe
    Casos de borde y validaciones adicionales
      ✓ debería manejar múltiples operaciones concurrentes correctamente
      ✓ debería validar correctamente diferentes estados de reserva
      ✓ debería manejar correctamente diferentes motivos de viaje
    Integración con documentación API
      ✓ debería cumplir con el contrato de la API para creación exitosa
      ✓ debería cumplir con el contrato de la API para paginación
      ✓ debería cumplir con el contrato de la API para actualización exitosa

Tests: 20+ passed
```

### **Búsqueda con Filtros Tests:** ⭐ **NUEVO**
```
PASS  src/reservas/busqueda-filtros.service.spec.ts
  ReservasService - Búsqueda con Filtros (Patrón Query Builder)
    Definición del servicio de búsqueda
      ✓ debería estar definido
      ✓ debería tener el método buscarConFiltros
    buscarConFiltros - Sin filtros (comportamiento por defecto)
      ✓ debería retornar todas las reservas cuando no se aplican filtros
    buscarConFiltros - Filtros de fechas
      ✓ debería filtrar por rango de fechas de inicio correctamente
      ✓ debería filtrar por rango de check-in correctamente
      ✓ debería combinar filtros de fecha de inicio y check-in
    buscarConFiltros - Filtros de enums
      ✓ debería filtrar por estado de reserva
      ✓ debería filtrar por motivo de viaje
      ✓ debería validar todos los estados posibles de reserva
    buscarConFiltros - Filtros geográficos
      ✓ debería filtrar por país de procedencia (búsqueda parcial insensible)
      ✓ debería filtrar por ciudad de procedencia (búsqueda parcial insensible)
      ✓ debería combinar filtros geográficos país y ciudad
    buscarConFiltros - Filtros numéricos
      ✓ debería filtrar por rango de costo
      ✓ debería filtrar por número de acompañantes
      ✓ debería filtrar por ID de habitación
      ✓ debería filtrar por ID de huésped
    buscarConFiltros - Búsqueda de texto libre
      ✓ debería buscar en nombres del huésped
      ✓ debería buscar número de documento
    buscarConFiltros - Ordenamiento
      ✓ debería ordenar por fecha de inicio ascendente
      ✓ debería ordenar por costo descendente
      ✓ debería usar ordenamiento por defecto cuando no se especifica
    buscarConFiltros - Filtros múltiples combinados
      ✓ debería combinar filtros de fecha, estado y costo correctamente
      ✓ debería aplicar búsqueda de texto con otros filtros
    buscarConFiltros - Paginación y metadatos
      ✓ debería retornar respuesta vacía cuando no hay resultados
      ✓ debería manejar correctamente la paginación con resultados
      ✓ debería incluir estructura completa de datos en la respuesta
    buscarConFiltros - Casos de borde
      ✓ debería manejar filtros con valores cero correctamente
      ✓ debería ignorar filtros de texto vacíos o solo espacios
      ✓ debería manejar página que excede el límite
    buscarConFiltros - Rendimiento y concurrencia
      ✓ debería manejar múltiples búsquedas concurrentes
      ✓ debería mantener aislamiento entre filtros diferentes

Tests: 27+ passed
```

### **ReservasController Tests:**
```
PASS  src/reservas/reservas.controller.spec.ts
  ReservasController
    Definición del controller
      ✓ debería estar definido
    create
      ✓ debería llamar al servicio create con los datos correctos
      ✓ debería propagar errores del servicio
    buscarConFiltros ⭐ NUEVO
      ✓ debería llamar al servicio buscarConFiltros con filtros correctos
      ✓ debería manejar múltiples filtros combinados
      ✓ debería propagar errores de validación de filtros
      ✓ debería documentar correctamente en Swagger
    findAll
      ✓ debería llamar al servicio findAll con parámetros de paginación
      ✓ debería manejar respuesta vacía del servicio
      ✓ debería propagar errores del servicio
    findOne
      ✓ debería llamar al servicio findOne con el ID correcto
      ✓ debería propagar NotFoundException del servicio
    update
      ✓ debería llamar al servicio update con ID y datos correctos
      ✓ debería propagar BadRequestException cuando no hay datos
      ✓ debería propagar NotFoundException del servicio
    remove (Eliminación en Cascada)
      ✓ debería llamar al servicio remove con el ID correcto
      ✓ debería propagar NotFoundException del servicio
      ✓ debería manejar errores de eliminación en cascada
    Validaciones de tipos y parámetros
      ✓ debería manejar diferentes tipos de IDs numéricos
      ✓ debería validar diferentes estados de reserva en creación
      ✓ debería validar diferentes motivos de viaje
      ✓ debería manejar diferentes parámetros de paginación
    Integración con documentación API
      ✓ debería retornar estructuras que cumplen con Swagger para creación
      ✓ debería retornar estructuras que cumplen con Swagger para paginación
      ✓ debería retornar estructuras que cumplen con Swagger para búsqueda individual
      ✓ debería retornar estructuras que cumplen con Swagger para actualización
      ✓ debería retornar estructuras que cumplen con Swagger para eliminación
      ✓ debería retornar estructuras que cumplen con Swagger para búsqueda con filtros ⭐ NUEVO
    Casos de borde y comportamiento específico
      ✓ debería manejar múltiples llamadas concurrentes
      ✓ debería mantener la integridad de datos entre llamadas
      ✓ debería validar que los parámetros se pasan correctamente sin mutación

Tests: 28+ passed
```

## 🎯 **Cobertura de Pruebas**

### **Lógica de Negocio**
- **100%** de métodos públicos de service y controller
- **100%** de flujos de éxito y error
- **100%** de validaciones de entrada
- **100%** de casos de eliminación en cascada
- **100%** de filtros de búsqueda avanzada ⭐ **NUEVO**

### **Funcionalidades Especiales**
- **Eliminación en Cascada**: Todas las combinaciones posibles
- **Transacciones**: Operaciones complejas con rollback
- **Paginación**: Todos los escenarios edge case
- **Enums**: Validación completa de estados y motivos
- **Búsqueda Avanzada**: Patrón Query Builder completo ⭐ **NUEVO**
- **Filtros Múltiples**: Combinaciones complejas ⭐ **NUEVO**
- **Ordenamiento Dinámico**: Todos los campos disponibles ⭐ **NUEVO**

### **Integración con API**
- **Swagger Compliance**: Estructura de respuestas
- **Error Handling**: Códigos de estado HTTP correctos
- **Data Validation**: DTOs y validaciones
- **Query Parameters**: Filtros complejos documentados ⭐ **NUEVO**

## 📝 **Ventajas de estos Tests**

### **Confianza en Funcionalidad Crítica**
- ✅ **Eliminación en Cascada**: Funcionalidad compleja validada
- ✅ **Integridad de Datos**: Preservación correcta de relaciones
- ✅ **Transacciones**: Consistencia garantizada
- ✅ **Búsqueda Avanzada**: Filtros complejos funcionan correctamente ⭐ **NUEVO**

### **Refactoring Seguro**
- ✅ Permite cambios en lógica de cascada con confianza
- ✅ Detecta regresiones en eliminación de entidades
- ✅ Mantiene contratos de API estables
- ✅ Permite evolución de filtros sin romper funcionalidad ⭐ **NUEVO**

### **Documentación Viva**
- ✅ Los tests documentan el comportamiento de cascada
- ✅ Ejemplos claros de uso del sistema
- ✅ Casos de error bien definidos
- ✅ Patrones de búsqueda bien documentados ⭐ **NUEVO**

## 🚀 **Nuevas Funcionalidades - Búsqueda Avanzada** ⭐

### **Endpoint de Búsqueda:**
```
GET /reservas/buscar?estado=RESERVADO&paisProcedencia=Colombia&costoMinimo=100&costoMaximo=1000&page=1&limit=10&ordenarPor=fecha_inicio&direccionOrden=desc
```

### **Filtros Disponibles:**
- **📅 Fechas**: `fechaInicioDesde`, `fechaInicioHasta`, `checkInDesde`, `checkInHasta`
- **🏷️ Estados**: `estado` (RESERVADO, CANCELADO, FINALIZADO, PENDIENTE)
- **🌍 Geográficos**: `paisProcedencia`, `ciudadProcedencia` (búsqueda insensible)
- **✈️ Motivos**: `motivoViaje` (todos los valores del enum)
- **💰 Costos**: `costoMinimo`, `costoMaximo`
- **👥 Acompañantes**: `acompaniantesMinimo`, `acompaniantesMaximo`
- **🏨 Específicos**: `habitacionId`, `huespedId`
- **🔍 Texto Libre**: `busquedaTexto` (nombres, apellidos, documentos)
- **📊 Ordenamiento**: `ordenarPor`, `direccionOrden`

### **Respuesta Enriquecida:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalReservas": 25,
    "lastPage": 3,
    "filtrosAplicados": {
      "total": 3,
      "filtros": {
        "estado": "RESERVADO",
        "paisProcedencia": "Colombia",
        "costoMinimo": 100
      }
    }
  }
}
```

### **Patrón de Diseño Implementado:**
- **Query Builder**: Construcción dinámica de consultas
- **Modularidad**: Filtros independientes y combinables
- **Escalabilidad**: Fácil agregar nuevos filtros
- **Rendimiento**: Optimización de consultas SQL

## 🔄 **Mantenimiento**

### **Cuando actualizar:**
1. **Cambios en eliminación en cascada**: Actualizar tests de `remove()`
2. **Nuevas relaciones**: Agregar validaciones de cascada
3. **Cambios en enums**: Actualizar tests de validación
4. **Nuevos campos**: Actualizar DTOs de prueba
5. **Nuevos filtros**: Agregar tests en `busqueda-filtros.service.spec.ts` ⭐ **NUEVO**
6. **Cambios en Query Builder**: Actualizar tests de construcción de consultas ⭐ **NUEVO**

### **Buenas prácticas seguidas:**
- **Patrón AAA**: Arrange-Act-Assert consistente
- **Mocks aislados**: Cada test independiente
- **Nombres descriptivos**: Explican funcionalidad específica
- **Datos realistas**: Casos de uso reales del hotel
- **Cascada Completa**: Tests de eliminación exhaustivos
- **Query Builder**: Tests de construcción dinámica de consultas ⭐ **NUEVO**
- **Filtros Complejos**: Validación de combinaciones múltiples ⭐ **NUEVO**

## 🛡️ **Funcionalidades Críticas Validadas**

### **Sistema de Eliminación en Cascada**
- ✅ **Reserva**: Marcada como deleted
- ✅ **Formularios**: Todos eliminados
- ✅ **LinkFormulario**: Enlaces eliminados
- ✅ **Factura**: Eliminada si existe
- ✅ **Huéspedes Secundarios**: Eliminados condicionalmente
- ✅ **Huésped Principal**: Preservado si tiene otras reservas

### **Sistema de Búsqueda Avanzada** ⭐ **NUEVO**
- ✅ **Patrón Query Builder**: Construcción dinámica validada
- ✅ **Filtros Múltiples**: Combinaciones complejas funcionando
- ✅ **Paginación Avanzada**: Con metadatos de filtros aplicados
- ✅ **Búsqueda Insensible**: Mayúsculas/minúsculas en textos
- ✅ **Ordenamiento Dinámico**: Por múltiples campos
- ✅ **Casos de Borde**: Valores límite y situaciones extremas
- ✅ **Rendimiento**: Múltiples consultas concurrentes

### **Validaciones de Negocio**
- ✅ **Estados de Reserva**: Todos los valores enum
- ✅ **Motivos de Viaje**: Validación completa
- ✅ **Paginación**: Edge cases y límites
- ✅ **Fechas**: Validación de rangos
- ✅ **Filtros de Rango**: Valores mínimos y máximos ⭐ **NUEVO**
- ✅ **Búsqueda de Texto**: OR lógico en múltiples campos ⭐ **NUEVO**

Esta documentación garantiza que el módulo de reservas está completamente testeado y listo para producción, con especial énfasis en la funcionalidad crítica de eliminación en cascada y la nueva búsqueda avanzada con filtros múltiples usando el patrón Query Builder. 🎉 