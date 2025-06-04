# Módulo de Analíticas - Hotel San Miguel

## Descripción

El módulo de analíticas proporciona endpoints especializados para obtener insights de negocio del sistema hotelero. Está diseñado para soportar la toma de decisiones estratégicas mediante análisis de datos operacionales.

## Arquitectura

### Estructura del Módulo

```
src/analytics/
├── analytics.controller.ts         # Endpoints de la API
├── analytics.service.ts            # Lógica de negocio y consultas
├── analytics.module.ts             # Configuración del módulo
├── analytics.controller.spec.ts    # Tests unitarios del controller
├── analytics.service.spec.ts       # Tests unitarios del service
├── dto/
│   ├── filtros-analytics.dto.ts    # DTOs para filtros
│   └── response-analytics.dto.ts   # DTOs para respuestas
└── README.md                       # Esta documentación
```

### Patrones de Diseño

El módulo sigue los patrones establecidos en el proyecto:
- **Service Pattern**: Lógica de negocio encapsulada en `AnalyticsService`
- **DTO Pattern**: Validación y tipado fuerte con class-validator
- **Repository Pattern**: Uso de Prisma para acceso a datos
- **Dependency Injection**: Inyección de dependencias con NestJS
- **Test-Driven Development**: Cobertura completa de tests unitarios

## Endpoints Disponibles

### 🏨 Analíticas de Ocupación
```http
GET /analytics/ocupacion
```
- **Permisos**: ADMINISTRADOR, CAJERO
- **Descripción**: Análisis de ocupación con RevPAR, ADR y métricas de rendimiento
- **Filtros**: Rango de fechas, tipo de habitación, agrupación por período
- **Optimizaciones**: Consultas SQL optimizadas con `DATE_TRUNC` para agrupación

### 👥 Demografia de Huéspedes
```http
GET /analytics/huespedes/demografia
```
- **Permisos**: ADMINISTRADOR, CAJERO
- **Descripción**: Análisis demográfico por nacionalidad e ingresos
- **Filtros**: Rango de fechas, nacionalidades específicas

### 🌍 Procedencia de Huéspedes
```http
GET /analytics/huespedes/procedencia
```
- **Permisos**: ADMINISTRADOR, CAJERO
- **Descripción**: Análisis de procedencia geográfica
- **Filtros**: Rango de fechas, países de procedencia

### 🏠 Rendimiento de Habitaciones
```http
GET /analytics/habitaciones/rendimiento
```
- **Permisos**: ADMINISTRADOR, CAJERO
- **Descripción**: Análisis de rendimiento por tipo de habitación
- **Métricas**: Ocupación, ingresos, RevPAR por tipo

### ✈️ Motivos de Viaje
```http
GET /analytics/motivos-viaje
```
- **Permisos**: ADMINISTRADOR, CAJERO
- **Descripción**: Segmentación por motivos de viaje
- **Métricas**: Distribución, duración promedio de estancia

### 🔮 Predicción de Ocupación
```http
GET /analytics/forecast/ocupacion
```
- **Permisos**: ADMINISTRADOR
- **Descripción**: Predicciones de ocupación basadas en datos históricos
- **Parámetros**: Períodos a predecir, tipo de período
- **Algoritmo**: Predicción básica con factores estacionales

### 📊 Dashboard Ejecutivo
```http
GET /analytics/dashboard
```
- **Permisos**: ADMINISTRADOR
- **Descripción**: Vista consolidada de KPIs principales
- **Incluye**: Comparación temporal opcional, consultas paralelas optimizadas

## Modelos de Datos

### DTOs de Filtros

#### `FiltrosAnalyticsDto`
```typescript
{
  fechaInicio?: string;          // Formato: YYYY-MM-DD
  fechaFin?: string;             // Formato: YYYY-MM-DD
  tipoHabitacion?: TiposHabitacion;
  nacionalidades?: string[];
  paisesProcedencia?: string[];
  motivoViaje?: MotivosViajes;
  estadoReserva?: EstadosReserva;
}
```

#### `FiltrosOcupacionDto`
```typescript
{
  ...FiltrosAnalyticsDto,
  agruparPor?: 'día' | 'semana' | 'mes' | 'año';
}
```

#### `ForecastParamsDto`
```typescript
{
  fechaInicio?: string;
  fechaFin?: string;
  periodosAdelante: number;      // Entre 1 y 12
  tipoPeriodo: 'mes' | 'semana';
}
```

### DTOs de Respuesta

#### `AnalisisOcupacionResponseDto`
```typescript
{
  ocupacionPorPeriodo: OcupacionPorPeriodoDto[];
  ocupacionPromedio: number;
  revparPromedio: number;
  adrPromedio: number;
}
```

#### `DashboardEjecutivoDto`
```typescript
{
  ocupacionActual: number;
  revparActual: number;
  adrActual: number;
  ingresosPeriodo: number;
  topMercadosEmisores: DemografiaHuespedesDto[];
  distribucionMotivosViaje: MotivosViajeDto[];
  rendimientoHabitaciones: RendimientoHabitacionDto[];
  tasaHuespedesRecurrentes: number;
  comparacionPeriodoAnterior?: ComparacionPeriodoAnterior;
}
```

#### `PrediccionOcupacionDto`
```typescript
{
  periodo: string;
  ocupacionPredicida: number;
  nivelConfianza: number;
  ingresosPredichos: number;
}
```

## Tecnologías y Optimizaciones

### Base de Datos
- **Consultas SQL optimizadas** con Prisma raw queries
- **Agregaciones nativas** para performance
- **Funciones DATE_TRUNC** para agrupación temporal eficiente
- **Índices aprovechados** en campos de filtrado
- **Manejo correcto de BigInt** y conversiones de tipos

### Performance
- **Consultas paralelas** en dashboard ejecutivo usando `Promise.all()`
- **Caching de resultados** (preparado para implementar)
- **Paginación futura** para grandes datasets
- **Optimización de GROUP BY** con funciones SQL nativas

### Seguridad
- **Autenticación JWT** requerida
- **Autorización por roles** (ADMINISTRADOR/CAJERO)
- **Validación de entrada** con DTOs
- **Sanitización de consultas SQL** con Prisma

## Testing

### Cobertura de Tests

El módulo cuenta con **cobertura completa** de tests unitarios:

#### Controller Tests (`analytics.controller.spec.ts`)
- ✅ **22 tests** cubriendo todos los endpoints
- ✅ Mocks completos de dependencias (AnalyticsService, AuthGuard, etc.)
- ✅ Tests de manejo de errores y casos límite
- ✅ Validación de configuración y decoradores
- ✅ Tests de llamadas concurrentes

#### Service Tests (`analytics.service.spec.ts`)
- ✅ **25 tests** cubriendo todos los métodos del service
- ✅ Mocks de PrismaService con `$queryRaw`
- ✅ Tests de lógica de negocio compleja
- ✅ Manejo de valores null y BigInt
- ✅ Tests de errores de base de datos
- ✅ Validación de cálculos matemáticos

### Ejecutar Tests

```bash
# Tests específicos del módulo analytics
npm run test -- --testPathPattern=analytics

# Tests con cobertura
npm run test:cov -- --testPathPattern=analytics

# Tests en modo watch
npm run test:watch -- --testPathPattern=analytics
```

## Casos de Uso de Negocio

### 💼 Para Administradores
1. **Revenue Management**: Optimización de precios basada en RevPAR y ocupación
2. **Planificación Estratégica**: Análisis de tendencias y predicciones
3. **Marketing Dirigido**: Segmentación por demografía y procedencia
4. **Optimización Operacional**: Análisis de rendimiento por tipo de habitación
5. **Forecasting**: Predicciones de ocupación para planificación futura

### 🏨 Para Cajeros
1. **Reportes Operacionales**: Análisis de ocupación y demographics
2. **Seguimiento de Performance**: Métricas de rendimiento diarias
3. **Insights de Huéspedes**: Patrones de reserva y procedencia

## Ejemplos de Uso

### Consulta de Ocupación Mensual
```bash
curl -X GET "http://localhost:3001/analytics/ocupacion?fechaInicio=2024-01-01&fechaFin=2024-12-31&agruparPor=mes" \
  -H "Authorization: Bearer {token}"
```

### Dashboard Ejecutivo con Comparación
```bash
curl -X GET "http://localhost:3001/analytics/dashboard?fechaInicio=2024-01-01&fechaFin=2024-06-30&incluirComparacion=true&topMercados=10" \
  -H "Authorization: Bearer {token}"
```

### Predicción de Ocupación
```bash
curl -X GET "http://localhost:3001/analytics/forecast/ocupacion?fechaInicio=2024-01-01&fechaFin=2024-12-31&periodosAdelante=6&tipoPeriodo=mes" \
  -H "Authorization: Bearer {token}"
```

### Análisis de Demografia
```bash
curl -X GET "http://localhost:3001/analytics/huespedes/demografia?fechaInicio=2024-01-01&fechaFin=2024-12-31&nacionalidades=Colombia,Venezuela" \
  -H "Authorization: Bearer {token}"
```

## Troubleshooting

### Errores Comunes

#### Error de Sintaxis SQL
```
ERROR: syntax error at or near "("
```
**Solución**: Verificar que las consultas usen `${dateFunction}` directamente, no `${dateFunction}(fecha_inicio)`, ya que `getDateTruncFunction()` ya incluye la columna.

#### Error de GROUP BY
```
ERROR: column must appear in the GROUP BY clause
```
**Solución**: Asegurar que las columnas del SELECT que no son agregaciones estén incluidas en GROUP BY.

#### Error de Configuración en Tests
```
"NODE_ENV" must be one of [development, production]
```
**Solución**: Establecer `NODE_ENV=development` antes de ejecutar los tests.

### Logging y Debugging

Para debuggear consultas SQL:
```typescript
// Habilitar logging de Prisma en desarrollo
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

## Mejoras Implementadas (Changelog)

### v1.1.0 - Correcciones de Sintaxis SQL
- ✅ **Corregida interpolación de funciones DATE_TRUNC** en consultas Prisma
- ✅ **Optimizada consulta de predicción de ocupación** con manejo correcto de períodos
- ✅ **Mejorado manejo de valores BigInt** en respuestas de base de datos
- ✅ **Implementada validación robusta** de parámetros de entrada

### v1.2.0 - Tests Unitarios Completos
- ✅ **Implementados 47 tests unitarios** (22 controller + 25 service)
- ✅ **Cobertura completa de métodos** y casos de error
- ✅ **Mocks robustos** de dependencias externas
- ✅ **Documentación de tests** en español

## Roadmap y Mejoras Futuras

### Fase 2: Analíticas Avanzadas
- [ ] Machine Learning para predicciones más precisas
- [ ] Análisis de sentimientos de reviews
- [ ] Optimización dinámica de precios
- [ ] Detección de patrones estacionales avanzados

### Fase 3: Inteligencia de Negocio
- [ ] Integración con herramientas BI (Power BI, Tableau)
- [ ] Alertas automáticas de performance
- [ ] Recomendaciones de acciones estratégicas
- [ ] Análisis competitivo automático

### Optimizaciones Técnicas
- [ ] Caching de Redis para consultas frecuentes
- [ ] Jobs en background para reportes pesados
- [ ] Streaming de datos en tiempo real
- [ ] API GraphQL para consultas flexibles
- [ ] Mejoras en algoritmos de predicción

## Contribución

Al extender este módulo, seguir:
1. **Patrones establecidos** del proyecto
2. **Documentación Swagger** completa
3. **Tests unitarios** para nueva funcionalidad (obligatorio)
4. **Validación de DTOs** para nuevos endpoints
5. **Consideraciones de performance** para consultas complejas
6. **Manejo correcto de Prisma.Sql** en consultas raw
7. **Documentación en español** para tests y comentarios 