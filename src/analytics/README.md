# Módulo de Analíticas - Hotel San Miguel

## Descripción

El módulo de analíticas proporciona endpoints especializados para obtener insights de negocio del sistema hotelero. Está diseñado para soportar la toma de decisiones estratégicas mediante análisis de datos operacionales.

## Arquitectura

### Estructura del Módulo

```
src/analytics/
├── analytics.controller.ts    # Endpoints de la API
├── analytics.service.ts       # Lógica de negocio y consultas
├── analytics.module.ts        # Configuración del módulo
├── dto/
│   ├── filtros-analytics.dto.ts    # DTOs para filtros
│   └── response-analytics.dto.ts   # DTOs para respuestas
└── README.md                  # Esta documentación
```

### Patrones de Diseño

El módulo sigue los patrones establecidos en el proyecto:
- **Service Pattern**: Lógica de negocio encapsulada en `AnalyticsService`
- **DTO Pattern**: Validación y tipado fuerte con class-validator
- **Repository Pattern**: Uso de Prisma para acceso a datos
- **Dependency Injection**: Inyección de dependencias con NestJS

## Endpoints Disponibles

### 🏨 Analíticas de Ocupación
```http
GET /analytics/ocupacion
```
- **Permisos**: ADMINISTRADOR, CAJERO
- **Descripción**: Análisis de ocupación con RevPAR, ADR y métricas de rendimiento
- **Filtros**: Rango de fechas, tipo de habitación, agrupación por período

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

### 📊 Dashboard Ejecutivo
```http
GET /analytics/dashboard
```
- **Permisos**: ADMINISTRADOR
- **Descripción**: Vista consolidada de KPIs principales
- **Incluye**: Comparación temporal opcional

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

## Tecnologías y Optimizaciones

### Base de Datos
- **Consultas SQL optimizadas** con Prisma raw queries
- **Agregaciones nativas** para performance
- **Índices aprovechados** en campos de filtrado

### Performance
- **Consultas paralelas** en dashboard ejecutivo
- **Caching de resultados** (preparado para implementar)
- **Paginación futura** para grandes datasets

### Seguridad
- **Autenticación JWT** requerida
- **Autorización por roles** (ADMINISTRADOR/CAJERO)
- **Validación de entrada** con DTOs

## Casos de Uso de Negocio

### 💼 Para Administradores
1. **Revenue Management**: Optimización de precios basada en RevPAR y ocupación
2. **Planificación Estratégica**: Análisis de tendencias y predicciones
3. **Marketing Dirigido**: Segmentación por demografía y procedencia
4. **Optimización Operacional**: Análisis de rendimiento por tipo de habitación

### 🏨 Para Cajeros
1. **Reportes Operacionales**: Análisis de ocupación y demographics
2. **Seguimiento de Performance**: Métricas de rendimiento diarias
3. **Insights de Huéspedes**: Patrones de reserva y procedencia

## Ejemplos de Uso

### Consulta de Ocupación Mensual
```bash
curl -X GET "http://localhost:3000/analytics/ocupacion?fechaInicio=2024-01-01&fechaFin=2024-12-31&agruparPor=mes" \
  -H "Authorization: Bearer {token}"
```

### Dashboard Ejecutivo con Comparación
```bash
curl -X GET "http://localhost:3000/analytics/dashboard?fechaInicio=2024-01-01&fechaFin=2024-06-30&incluirComparacion=true&topMercados=10" \
  -H "Authorization: Bearer {token}"
```

### Predicción de Ocupación
```bash
curl -X GET "http://localhost:3000/analytics/forecast/ocupacion?periodosAdelante=6&tipoPeriodo=mes" \
  -H "Authorization: Bearer {token}"
```

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

## Contribución

Al extender este módulo, seguir:
1. **Patrones establecidos** del proyecto
2. **Documentación Swagger** completa
3. **Tests unitarios** para nueva funcionalidad
4. **Validación de DTOs** para nuevos endpoints
5. **Consideraciones de performance** para consultas complejas 