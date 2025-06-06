# 📊 Módulo de Analytics - Hotel San Miguel

## 📋 Descripción General

El módulo de Analytics proporciona análisis estadísticos y métricas de rendimiento del hotel a través de consultas optimizadas. Incluye ocupación hotelera, demografía de huéspedes, rendimiento por habitaciones, motivos de viaje, predicciones y dashboard ejecutivo.

## 🔒 Permisos de Acceso

**Todos los endpoints requieren autenticación y autorización:**
- **Roles permitidos:** `ADMINISTRADOR` y `CAJERO`
- **Excepción:** Endpoints de forecast y dashboard son **solo para ADMINISTRADOR**
- **Implementación:** Decorador `@Auth(Role.ADMINISTRADOR, Role.CAJERO)` a nivel de clase + `@Roles` a nivel de método

## 🌐 Endpoints Disponibles

### Base URL: `/analytics`

---

## 1. 📈 Análisis de Ocupación

### `GET /analytics/ocupacion`

Calcula métricas de ocupación hotelera (RevPAR, ADR, tasa de ocupación) agrupadas por períodos.

#### **Parámetros de Query (FiltrosOcupacionDto):**

| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|---------|
| `fechaInicio` | `string` | ❌ | Fecha de inicio (ISO 8601) | `2024-01-01` |
| `fechaFin` | `string` | ❌ | Fecha de fin (ISO 8601) | `2024-12-31` |
| `agruparPor` | `'día' \| 'semana' \| 'mes' \| 'año'` | ❌ | Período de agrupación | `mes` |
| `tipoHabitacion` | `TiposHabitacion` | ❌ | Filtrar por tipo específico | `SENCILLA` |

**Validaciones:**
- `@IsOptional()` y `@IsDateString()` para fechas
- `@IsOptional()` y `@IsEnum(['día', 'semana', 'mes', 'año'])` para agrupación
- `@IsOptional()` y `@IsEnum(TiposHabitacion)` para tipo de habitación

#### **Ejemplo de Request:**
```
GET /analytics/ocupacion?fechaInicio=2024-01-01&fechaFin=2024-03-31&agruparPor=mes&tipoHabitacion=SENCILLA
```

#### **Respuesta (AnalisisOcupacionResponseDto):**

```typescript
interface AnalisisOcupacionResponseDto {
  ocupacionPorPeriodo: OcupacionPorPeriodoDto[];
  ocupacionPromedio: number;
  revparPromedio: number;
  adrPromedio: number;
}

interface OcupacionPorPeriodoDto {
  periodo: string;         // Fecha ISO del período
  tasaOcupacion: number;   // Porcentaje de ocupación
  revpar: number;          // Revenue Per Available Room
  adr: number;             // Average Daily Rate
  totalReservas: number;   // Número total de reservas
  ingresosTotales: number; // Ingresos totales del período
}
```

#### **Ejemplo de Respuesta:**
```json
{
  "ocupacionPorPeriodo": [
    {
      "periodo": "2024-01-01T00:00:00.000Z",
      "tasaOcupacion": 85.5,
      "revpar": 38475.0,
      "adr": 45000,
      "totalReservas": 34,
      "ingresosTotales": 1530000
    }
  ],
  "ocupacionPromedio": 88.9,
  "revparPromedio": 40005.0,
  "adrPromedio": 45000
}
```

---

## 2. 🌍 Análisis Demográfico de Huéspedes

### `GET /analytics/huespedes/demografia`

Analiza la distribución demográfica de huéspedes por nacionalidad con métricas de ingresos.

#### **Parámetros de Query (FiltrosAnalyticsDto):**

| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|---------|
| `fechaInicio` | `string` | ❌ | Fecha de inicio | `2024-01-01` |
| `fechaFin` | `string` | ❌ | Fecha de fin | `2024-12-31` |
| `tipoHabitacion` | `TiposHabitacion` | ❌ | Filtrar por tipo habitación | `SENCILLA` |
| `nacionalidades` | `string[]` | ❌ | Array de nacionalidades específicas | `["Colombia", "Venezuela"]` |
| `paisesProcedencia` | `string[]` | ❌ | Array de países de procedencia | `["Colombia", "Venezuela"]` |
| `motivoViaje` | `MotivosViajes` | ❌ | Motivo específico | `VACACIONES_RECREO_Y_OCIO` |
| `estadoReserva` | `EstadosReserva` | ❌ | Estado específico | `FINALIZADO` |

**Validaciones:**
- `@IsOptional()` y `@IsDateString()` para fechas
- `@IsOptional()` y `@IsEnum()` para enums
- `@IsOptional()`, `@IsArray()` y `@IsString({ each: true })` para arrays

#### **Ejemplo de Request:**
```
GET /analytics/huespedes/demografia?fechaInicio=2024-01-01&fechaFin=2024-12-31&nacionalidades=Colombia,Venezuela
```

#### **Respuesta (DemografiaHuespedesDto[]):**

```typescript
interface DemografiaHuespedesDto {
  nacionalidad: string;
  cantidad: number;
  porcentaje: number;
  ingresos: number;
}
```

#### **Ejemplo de Respuesta:**
```json
[
  {
    "nacionalidad": "Colombia",
    "cantidad": 145,
    "porcentaje": 72.5,
    "ingresos": 6525000
  },
  {
    "nacionalidad": "Venezuela",
    "cantidad": 55,
    "porcentaje": 27.5,
    "ingresos": 2475000
  }
]
```

---

## 3. 🗺️ Análisis de Procedencia de Huéspedes

### `GET /analytics/huespedes/procedencia`

Analiza la procedencia geográfica (país y ciudad) de los huéspedes.

#### **Parámetros de Query (FiltrosAnalyticsDto):**
*Mismos parámetros que el endpoint de demografía*

#### **Ejemplo de Request:**
```
GET /analytics/huespedes/procedencia?fechaInicio=2024-01-01&fechaFin=2024-12-31&paisesProcedencia=Colombia
```

#### **Respuesta (ProcedenciaHuespedesDto[]):**

```typescript
interface ProcedenciaHuespedesDto {
  paisProcedencia: string;
  ciudadProcedencia: string;
  cantidad: number;
  porcentaje: number;
}
```

#### **Ejemplo de Respuesta:**
```json
[
  {
    "paisProcedencia": "Colombia",
    "ciudadProcedencia": "Bogotá",
    "cantidad": 89,
    "porcentaje": 44.5
  },
  {
    "paisProcedencia": "Colombia",
    "ciudadProcedencia": "Medellín",
    "cantidad": 56,
    "porcentaje": 28.0
  }
]
```

---

## 4. 🏨 Análisis de Rendimiento de Habitaciones

### `GET /analytics/habitaciones/rendimiento`

Analiza la rentabilidad individual de cada habitación del hotel, proporcionando métricas detalladas de rendimiento financiero y ocupacional por habitación específica.

#### **Parámetros de Query (FiltrosAnalyticsDto):**
*Mismos parámetros que el endpoint de demografía*

#### **Ejemplo de Request:**
```
GET /analytics/habitaciones/rendimiento?fechaInicio=2024-01-01&fechaFin=2024-12-31&tipoHabitacion=SENCILLA
```

#### **Respuesta (RendimientoHabitacionDto[]):**

```typescript
interface RendimientoHabitacionDto {
  habitacionId: string;           // ID único de la habitación
  numeroHabitacion: string;       // Número de la habitación (ej: "101")
  tipo: string;                   // Tipo de habitación (ej: "SENCILLA")
  ingresosTotales: number;        // Ingresos totales en el período
  totalReservas: number;          // Total de reservas realizadas
  nochesVendidas: number;         // Total de noches vendidas
  ingresoPromedioReserva: number; // Ingreso promedio por reserva
  porcentajeOcupacion: number;    // Porcentaje de ocupación
}
```

#### **Ejemplo de Respuesta:**
```json
[
  {
    "habitacionId": "clm123456789abcdef",
    "numeroHabitacion": "101",
    "tipo": "SENCILLA",
    "ingresosTotales": 850000,
    "totalReservas": 15,
    "nochesVendidas": 42,
    "ingresoPromedioReserva": 56666.67,
    "porcentajeOcupacion": 75.23
  },
  {
    "habitacionId": "clm987654321fedcba",
    "numeroHabitacion": "102",
    "tipo": "SENCILLA",
    "ingresosTotales": 720000,
    "totalReservas": 12,
    "nochesVendidas": 36,
    "ingresoPromedioReserva": 60000,
    "porcentajeOcupacion": 64.29
  }
]
```

---

## 5. ✈️ Análisis de Motivos de Viaje

### `GET /analytics/motivos-viaje`

Segmenta las reservas por motivos de viaje con duración promedio de estancia.

#### **Parámetros de Query (FiltrosAnalyticsDto):**
*Mismos parámetros que el endpoint de demografía*

#### **Ejemplo de Request:**
```
GET /analytics/motivos-viaje?fechaInicio=2024-01-01&fechaFin=2024-12-31&motivoViaje=VACACIONES_RECREO_Y_OCIO
```

#### **Respuesta (MotivosViajeDto[]):**

```typescript
interface MotivosViajeDto {
  motivo: MotivosViajes;
  cantidad: number;
  porcentaje: number;
  duracionPromedioEstancia: number;
}
```

#### **Ejemplo de Respuesta:**
```json
[
  {
    "motivo": "VACACIONES_RECREO_Y_OCIO",
    "cantidad": 125,
    "porcentaje": 62.5,
    "duracionPromedioEstancia": 3.2
  },
  {
    "motivo": "NEGOCIOS_Y_MOTIVOS_PROFESIONALES",
    "cantidad": 75,
    "porcentaje": 37.5,
    "duracionPromedioEstancia": 1.8
  }
]
```

---

## 6. 🔮 Predicción de Ocupación (Solo Administrador)

### `GET /analytics/forecast/ocupacion`

Genera predicciones de ocupación futura basadas en patrones históricos.

#### **Parámetros de Query (ForecastParamsDto):**

| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|---------|
| `fechaInicio` | `string` | ❌ | Fecha de inicio datos históricos | `2024-01-01` |
| `fechaFin` | `string` | ❌ | Fecha de fin datos históricos | `2024-12-31` |
| `periodosAdelante` | `number` | ✅ | Períodos a predecir (1-12) | `6` |
| `tipoPeriodo` | `'mes' \| 'semana'` | ✅ | Tipo de período | `mes` |

**Validaciones:**
- `@IsInt()` y `@Min(1)` para períodos adelante
- `@IsEnum(['mes', 'semana'])` para tipo de período

#### **Ejemplo de Request:**
```
GET /analytics/forecast/ocupacion?fechaInicio=2024-01-01&fechaFin=2024-12-31&periodosAdelante=6&tipoPeriodo=mes
```

#### **Respuesta (PrediccionOcupacionDto[]):**

```typescript
interface PrediccionOcupacionDto {
  periodo: string;
  ocupacionPredicida: number;
  nivelConfianza: number;
  ingresosPredichos: number;
}
```

#### **Ejemplo de Respuesta:**
```json
[
  {
    "periodo": "2025-01",
    "ocupacionPredicida": 78.2,
    "nivelConfianza": 85.5,
    "ingresosPredichos": 4250000
  }
]
```

---

## 7. 📊 Dashboard Ejecutivo (Solo Administrador)

### `GET /analytics/dashboard`

Dashboard consolidado con KPIs principales, comparaciones temporales, análisis demográfico, motivos de viaje y rendimiento detallado por habitación individual.

#### **Parámetros de Query (FiltrosDashboardDto):**

| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|---------|
| `fechaInicio` | `string` | ❌ | Fecha de inicio | `2024-01-01` |
| `fechaFin` | `string` | ❌ | Fecha de fin | `2024-12-31` |
| `incluirComparacion` | `boolean` | ❌ | Comparar con período anterior | `true` |
| `topMercados` | `number` | ❌ | Número top mercados (3-10) | `5` |

**Validaciones:**
- `@Transform()` para boolean desde string
- `@IsInt()` y `@Min(3)` para top mercados

#### **Ejemplo de Request:**
```
GET /analytics/dashboard?fechaInicio=2024-01-01&fechaFin=2024-06-30&incluirComparacion=true&topMercados=5
```

#### **Respuesta (DashboardEjecutivoDto):**

```typescript
interface DashboardEjecutivoDto {
  ocupacionActual: number;              // KPI de ocupación actual
  revparActual: number;                 // RevPAR actual
  adrActual: number;                    // ADR actual
  ingresosPeriodo: number;              // Ingresos del período
  topMercadosEmisores: DemografiaHuespedesDto[];    // Top mercados por nacionalidad
  distribucionMotivosViaje: MotivosViajeDto[];      // Distribución por motivo de viaje
  rendimientoHabitaciones: RendimientoHabitacionDto[];  // Rendimiento por habitación individual (ordenado por ingresos)
  tasaHuespedesRecurrentes: number;     // Tasa de huéspedes recurrentes (%)
  comparacionPeriodoAnterior?: {        // Comparación opcional con período anterior
    ocupacionAnterior: number;
    revparAnterior: number;
    adrAnterior: number;
    ingresosAnteriores: number;
    cambioOcupacion: number;            // Cambio porcentual
    cambioRevpar: number;               // Cambio porcentual
    cambioAdr: number;                  // Cambio porcentual
    cambioIngresos: number;             // Cambio porcentual
  };
}
```

#### **Ejemplo de Respuesta:**
```json
{
  "ocupacionActual": 75.8,
  "revparActual": 45000,
  "adrActual": 59500,
  "ingresosPeriodo": 12500000,
  "topMercadosEmisores": [
    {
      "nacionalidad": "Colombia",
      "cantidad": 145,
      "porcentaje": 72.5,
      "ingresos": 6525000
    }
  ],
  "distribucionMotivosViaje": [
    {
      "motivo": "VACACIONES_RECREO_Y_OCIO",
      "cantidad": 85,
      "porcentaje": 65.4,
      "duracionPromedioEstancia": 3.2
    }
  ],
  "rendimientoHabitaciones": [
    {
      "habitacionId": "clm123456789abcdef",
      "numeroHabitacion": "101",
      "tipo": "SENCILLA",
      "ingresosTotales": 850000,
      "totalReservas": 15,
      "nochesVendidas": 42,
      "ingresoPromedioReserva": 56666.67,
      "porcentajeOcupacion": 75.23
    },
    {
      "habitacionId": "clm987654321fedcba",
      "numeroHabitacion": "205",
      "tipo": "DOBLE",
      "ingresosTotales": 720000,
      "totalReservas": 12,
      "nochesVendidas": 36,
      "ingresoPromedioReserva": 60000,
      "porcentajeOcupacion": 64.29
    }
  ],
  "tasaHuespedesRecurrentes": 18.5,
  "comparacionPeriodoAnterior": {
    "ocupacionAnterior": 68.2,
    "revparAnterior": 38000,
    "adrAnterior": 55700,
    "ingresosAnteriores": 10200000,
    "cambioOcupacion": 11.1,
    "cambioRevpar": 18.4,
    "cambioAdr": 6.8,
    "cambioIngresos": 22.5
  }
}
```

---

## 🎯 Enums y Tipos Utilizados

### **TiposHabitacion**
```typescript
enum TiposHabitacion {
  SENCILLA = 'SENCILLA',
  DOBLE = 'DOBLE',
  TRIPLE = 'TRIPLE',
  MATRIMONIAL = 'MATRIMONIAL',
  FAMILIAR = 'FAMILIAR'
}
```

### **MotivosViajes**
```typescript
enum MotivosViajes {
  VACACIONES_RECREO_Y_OCIO = 'VACACIONES_RECREO_Y_OCIO',
  NEGOCIOS_Y_MOTIVOS_PROFESIONALES = 'NEGOCIOS_Y_MOTIVOS_PROFESIONALES',
  // ... otros valores según @prisma/client
}
```

### **EstadosReserva**
```typescript
enum EstadosReserva {
  FINALIZADO = 'FINALIZADO',
  // ... otros valores según @prisma/client
}
```

---

## 🚀 Ejemplos de Uso para Frontend

### 1. Dashboard Principal con KPIs
```typescript
// Obtener dashboard completo con comparación
const response = await fetch('/analytics/dashboard?fechaInicio=2024-01-01&fechaFin=2024-12-31&incluirComparacion=true&topMercados=5', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const dashboard = await response.json();

// Mostrar KPIs principales
console.log(`Ocupación: ${dashboard.ocupacionActual}%`);
console.log(`RevPAR: $${dashboard.revparActual}`);
console.log(`Cambio vs anterior: ${dashboard.comparacionPeriodoAnterior?.cambioOcupacion}%`);

// Top 3 habitaciones más rentables
const topHabitaciones = dashboard.rendimientoHabitaciones.slice(0, 3);
console.log('Top 3 habitaciones más rentables:');
topHabitaciones.forEach((hab, index) => {
  console.log(`${index + 1}. Habitación ${hab.numeroHabitacion} (${hab.tipo}): $${hab.ingresosTotales.toLocaleString()}`);
});

// Distribución de motivos de viaje
const motivoPrincipal = dashboard.distribucionMotivosViaje[0];
if (motivoPrincipal) {
  console.log(`Motivo principal: ${motivoPrincipal.motivo} (${motivoPrincipal.porcentaje}%)`);
}
```

### 2. Gráfico de Ocupación Mensual
```typescript
// Obtener datos de ocupación por meses
const response = await fetch('/analytics/ocupacion?fechaInicio=2024-01-01&fechaFin=2024-12-31&agruparPor=mes');
const data = await response.json();

// Preparar datos para Chart.js
const chartData = {
  labels: data.ocupacionPorPeriodo.map(p => new Date(p.periodo).toLocaleString('es', { month: 'long' })),
  datasets: [{
    label: 'Tasa de Ocupación (%)',
    data: data.ocupacionPorPeriodo.map(p => p.tasaOcupacion),
    backgroundColor: 'rgba(54, 162, 235, 0.2)'
  }]
};
```

### 3. Análisis de Rendimiento por Habitaciones
```typescript
// Obtener rendimiento de habitaciones específicas
const response = await fetch('/analytics/habitaciones/rendimiento?fechaInicio=2024-01-01&fechaFin=2024-12-31&tipoHabitacion=SENCILLA');
const rendimientoData = await response.json();

// Top 5 habitaciones más rentables
const topHabitaciones = rendimientoData
  .sort((a, b) => b.ingresosTotales - a.ingresosTotales)
  .slice(0, 5);

// Preparar datos para tabla de rendimiento
const tablaRendimiento = rendimientoData.map(hab => ({
  habitacion: hab.numeroHabitacion,
  tipo: hab.tipo,
  ingresos: `$${hab.ingresosTotales.toLocaleString()}`,
  ocupacion: `${hab.porcentajeOcupacion}%`,
  reservas: hab.totalReservas,
  promedioReserva: `$${hab.ingresoPromedioReserva.toLocaleString()}`
}));
```

### 4. Análisis de Mercados con Filtros
```typescript
// Análisis demográfico específico
const params = new URLSearchParams({
  fechaInicio: '2024-01-01',
  fechaFin: '2024-12-31',
  'nacionalidades[]': 'Colombia',
  'nacionalidades[]': 'Venezuela'
});

const response = await fetch(`/analytics/huespedes/demografia?${params}`);
const demografiaData = await response.json();

// Crear gráfico de distribución
const pieChartData = demografiaData.map(item => ({
  label: item.nacionalidad,
  value: item.porcentaje
}));
```

### 5. Predicción de Ocupación
```typescript
// Solo para administradores
const response = await fetch('/analytics/forecast/ocupacion?periodosAdelante=6&tipoPeriodo=mes');
const predicciones = await response.json();

// Mostrar tabla de predicciones
predicciones.forEach(pred => {
  console.log(`${pred.periodo}: ${pred.ocupacionPredicida}% (confianza: ${pred.nivelConfianza}%)`);
});
```

---

## 🔧 Códigos de Error Comunes

| Código | Descripción | Solución |
|--------|-------------|----------|
| `400` | Parámetros de fecha inválidos | Usar formato ISO 8601: `YYYY-MM-DD` |
| `400` | Enum inválido | Verificar valores exactos de enums Prisma |
| `400` | Rango de períodos inválido | `periodosAdelante` debe estar entre 1-12 |
| `401` | No autenticado | Incluir token Bearer válido |
| `403` | Sin permisos | Verificar rol (some endpoints solo ADMIN) |
| `500` | Error de consulta SQL | Revisar logs del servidor |

---

## 📚 Notas Técnicas

### **Performance y Optimización**
- **Consultas SQL Optimizadas**: Uso de `$queryRaw` con `DATE_TRUNC` para agrupación
- **Consultas Paralelas**: Dashboard ejecuta múltiples consultas con `Promise.all()`
- **Conversión de BigInt**: Manejo correcto de tipos de datos PostgreSQL
- **Índices**: Aprovecha índices en `fecha_inicio`, `habitacionId`, `huespedId`

### **Manejo de Fechas**
- **Timezone**: Todas las fechas en UTC
- **Formato**: ISO 8601 (`YYYY-MM-DD`)
- **Opcional**: Todos los filtros de fecha son opcionales
- **Conversión**: Frontend debe manejar conversión a timezone local

### **Validaciones**
- **Class-validator**: Decoradores de validación en todos los DTOs
- **Transform**: Conversión automática de strings a tipos apropiados
- **Enum validation**: Validación estricta contra enums de Prisma

### **Seguridad**
- **Autenticación JWT**: Requerida en todos los endpoints
- **Autorización por Roles**: ADMINISTRADOR/CAJERO con restricciones específicas
- **Sanitización**: Prisma protege contra SQL injection
- **Rate Limiting**: Considerar implementar para endpoints intensivos

---

## 📈 Métricas de Negocio Calculadas

- **Tasa de Ocupación**: `(Total Reservas / Total Habitaciones) × 100`
- **RevPAR**: `(Tasa Ocupación / 100) × ADR`
- **ADR**: `Precio Promedio por Noche`
- **Tasa Huéspedes Recurrentes**: `(Huéspedes con >1 reserva / Total Huéspedes) × 100`
- **Factor Estacional**: `1 + sin(período × π × 2) × 0.15` (en predicciones)
- **Noches Vendidas**: `Intersección de días de reserva con el período analizado`
- **Ingreso Promedio por Reserva**: `Ingresos Totales / Total Reservas`
- **Porcentaje de Ocupación por Habitación**: `(Noches Vendidas / Días del Período) × 100`

---

## 🧪 Testing

- **Cobertura**: 47 tests unitarios (22 controller + 25 service)
- **Mocks**: PrismaService completamente mockeado
- **Casos**: Éxito, error, datos vacíos, valores BigInt
- **Comando**: `npm test -- --testPathPattern=analytics`

---

## 🔄 Changelog vs README Anterior

- ✅ **Corregidos**: 7 endpoints reales vs 4 ficticios
- ✅ **DTOs Reales**: Basados en implementación Prisma
- ✅ **Parámetros Correctos**: Todos opcionales, no requeridos
- ✅ **Respuestas Reales**: Estructuras exactas del código
- ✅ **Permisos Precisos**: Diferenciación ADMIN vs CAJERO
- ✅ **Validaciones Reales**: Basadas en decoradores implementados