import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import {
  FiltrosAnalyticsDto,
  FiltrosOcupacionDto,
  FiltrosDashboardDto,
  ForecastParamsDto,
} from './dto/filtros-analytics.dto';
import {
  AnalisisOcupacionResponseDto,
  DemografiaHuespedesDto,
  ProcedenciaHuespedesDto,
  RendimientoHabitacionDto,
  MotivosViajeDto,
  PrediccionOcupacionDto,
  DashboardEjecutivoDto,
} from './dto/response-analytics.dto';

/**
 * Controller para manejar las analíticas del sistema hotelero
 */
@ApiTags('analytics')
@ApiBearerAuth()
@Auth(Role.ADMINISTRADOR, Role.CAJERO)
@ApiExtraModels(
  AnalisisOcupacionResponseDto,
  DemografiaHuespedesDto,
  ProcedenciaHuespedesDto,
  RendimientoHabitacionDto,
  MotivosViajeDto,
  PrediccionOcupacionDto,
  DashboardEjecutivoDto,
)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Obtiene analíticas de ocupación del hotel
   *
   * **Métricas incluidas:**
   * - Tasa de ocupación por período
   * - RevPAR (Revenue per Available Room)
   * - ADR (Average Daily Rate)
   * - Ingresos totales por período
   * - Número de reservas por período
   *
   * **Agrupación disponible:**
   * - Por día, semana, mes o año
   * - Filtrable por tipo de habitación
   * - Rango de fechas personalizable
   */
  @Get('ocupacion')
  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @ApiOperation({
    summary: 'Obtener análisis de ocupación del hotel',
    description: `
    Proporciona un análisis detallado de la ocupación del hotel, incluyendo:
    
    **Métricas principales:**
    - Tasa de ocupación (porcentaje)
    - RevPAR (Revenue per Available Room)
    - ADR (Average Daily Rate)
    - Total de reservas
    - Ingresos totales
    
    **Capacidades de filtrado:**
    - Rango de fechas personalizable
    - Agrupación por día, semana, mes o año
    - Filtro por tipo de habitación específico
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis de ocupación obtenido exitosamente',
    type: AnalisisOcupacionResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticación inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos suficientes para acceder a las analíticas',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  obtenerAnaliticsOcupacion(@Query() filtros: FiltrosOcupacionDto) {
    return this.analyticsService.calcularOcupacion(filtros);
  }

  /**
   * Obtiene análisis demográfico de huéspedes
   *
   * **Información incluida:**
   * - Distribución por nacionalidad
   * - Cantidad de huéspedes por nacionalidad
   * - Porcentaje del total
   * - Ingresos generados por nacionalidad
   *
   * **Filtros disponibles:**
   * - Rango de fechas
   * - Nacionalidades específicas
   */
  @Get('huespedes/demografia')
  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @ApiOperation({
    summary: 'Obtener análisis demográfico de huéspedes',
    description: `
    Analiza la demografía de los huéspedes del hotel, proporcionando:
    
    **Datos demográficos:**
    - Distribución por nacionalidad
    - Cantidad absoluta y porcentual de huéspedes
    - Ingresos generados por cada grupo demográfico
    
    **Utilidad estratégica:**
    - Identificar mercados emisores principales
    - Optimizar estrategias de marketing geográfico
    - Personalizar servicios por perfil demográfico
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis demográfico obtenido exitosamente',
    type: [DemografiaHuespedesDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticación inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos suficientes para acceder a las analíticas',
  })
  obtenerDemografiaHuespedes(@Query() filtros: FiltrosAnalyticsDto) {
    return this.analyticsService.analizarDemografia(filtros);
  }

  /**
   * Obtiene análisis de procedencia de huéspedes
   *
   * **Información incluida:**
   * - País y ciudad de procedencia
   * - Cantidad de reservas por ubicación
   * - Porcentaje del total de reservas
   *
   * **Aplicaciones estratégicas:**
   * - Identificar rutas de viaje principales
   * - Optimizar canales de marketing por región
   * - Establecer alianzas estratégicas geográficas
   */
  @Get('huespedes/procedencia')
  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @ApiOperation({
    summary: 'Obtener análisis de procedencia de huéspedes',
    description: `
    Analiza los lugares de procedencia de los huéspedes, incluyendo:
    
    **Datos de procedencia:**
    - País y ciudad de origen
    - Volumen de reservas por ubicación
    - Distribución porcentual
    
    **Valor estratégico:**
    - Mapear mercados emisores geográficos
    - Identificar oportunidades de marketing regional
    - Planificar estrategias de expansión
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis de procedencia obtenido exitosamente',
    type: [ProcedenciaHuespedesDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticación inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos suficientes para acceder a las analíticas',
  })
  obtenerProcedenciaHuespedes(@Query() filtros: FiltrosAnalyticsDto) {
    return this.analyticsService.analizarProcedencia(filtros);
  }

  /**
   * Obtiene análisis de rendimiento por tipo de habitación
   *
   * **Métricas por tipo de habitación:**
   * - Número total de habitaciones
   * - Tasa de ocupación promedio
   * - Ingresos totales generados
   * - Precio promedio por noche
   * - RevPAR específico
   *
   * **Utilidad para gestión:**
   * - Optimizar mix de tipos de habitación
   * - Ajustar precios por rendimiento
   * - Identificar tipos más/menos rentables
   */
  @Get('habitaciones/rendimiento')
  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @ApiOperation({
    summary: 'Obtener análisis de rendimiento por tipo de habitación',
    description: `
    Analiza el rendimiento financiero y operacional de cada tipo de habitación:
    
    **Métricas de rendimiento:**
    - Tasa de ocupación por tipo
    - Ingresos totales generados
    - Precio promedio por noche
    - RevPAR específico por tipo
    - Número total de habitaciones disponibles
    
    **Aplicaciones de negocio:**
    - Optimizar estrategias de pricing
    - Planificar renovaciones o expansiones
    - Maximizar el revenue management
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis de rendimiento obtenido exitosamente',
    type: [RendimientoHabitacionDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticación inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos suficientes para acceder a las analíticas',
  })
  obtenerRendimientoHabitaciones(@Query() filtros: FiltrosAnalyticsDto) {
    return this.analyticsService.analizarRendimientoHabitaciones(filtros);
  }

  /**
   * Obtiene análisis de motivos de viaje
   *
   * **Información incluida:**
   * - Distribución por motivo de viaje
   * - Cantidad y porcentaje de reservas
   * - Duración promedio de estancia por motivo
   *
   * **Valor estratégico:**
   * - Personalizar servicios por tipo de viajero
   * - Optimizar paquetes y ofertas
   * - Planificar marketing segmentado
   */
  @Get('motivos-viaje')
  @Roles(Role.ADMINISTRADOR, Role.CAJERO)
  @ApiOperation({
    summary: 'Obtener análisis de motivos de viaje',
    description: `
    Analiza los motivos de viaje de los huéspedes para segmentación estratégica:
    
    **Datos de motivos:**
    - Distribución por tipo de viaje (negocios, recreo, etc.)
    - Volumen y porcentaje de cada segmento
    - Duración promedio de estancia por motivo
    
    **Oportunidades de negocio:**
    - Crear paquetes específicos por segmento
    - Personalizar servicios y amenidades
    - Optimizar estrategias de marketing dirigido
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis de motivos de viaje obtenido exitosamente',
    type: [MotivosViajeDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticación inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos suficientes para acceder a las analíticas',
  })
  obtenerMotivosViaje(@Query() filtros: FiltrosAnalyticsDto) {
    return this.analyticsService.analizarMotivosViaje(filtros);
  }

  /**
   * Obtiene predicción de ocupación futura
   *
   * **Predicciones incluidas:**
   * - Ocupación predicha por período
   * - Nivel de confianza de la predicción
   * - Ingresos proyectados
   *
   * **Base del modelo:**
   * - Análisis de patrones históricos
   * - Factores estacionales
   * - Tendencias de demanda
   *
   * **Nota:** Esta es una implementación básica de forecasting.
   * Para predicciones más avanzadas, se recomienda integrar
   * modelos de machine learning especializados.
   */
  @Get('forecast/ocupacion')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Obtener predicción de ocupación futura',
    description: `
    Genera predicciones de ocupación basadas en datos históricos:
    
    **Modelo predictivo:**
    - Análisis de patrones históricos de ocupación
    - Aplicación de factores estacionales
    - Proyección de ingresos esperados
    - Cálculo de niveles de confianza
    
    **Parámetros configurables:**
    - Número de períodos a predecir (1-12)
    - Tipo de período (semanal o mensual)
    - Rango de datos históricos base
    
    **Aplicaciones estratégicas:**
    - Planificación de capacidad
    - Estrategias de pricing dinámico
    - Presupuestación y forecasting financiero
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Predicción de ocupación generada exitosamente',
    type: [PrediccionOcupacionDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticación inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos de administrador para acceder a predicciones',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de predicción inválidos',
  })
  obtenerForecastOcupacion(@Query() parametros: ForecastParamsDto) {
    return this.analyticsService.predecirOcupacion(parametros);
  }

  /**
   * Obtiene dashboard ejecutivo con KPIs principales
   *
   * **Dashboard incluye:**
   * - KPIs principales (ocupación, RevPAR, ADR)
   * - Top mercados emisores
   * - Distribución por motivos de viaje
   * - Rendimiento por tipo de habitación
   * - Tasa de huéspedes recurrentes
   * - Comparación con período anterior (opcional)
   *
   * **Valor ejecutivo:**
   * - Vista consolidada de performance
   * - Métricas clave para toma de decisiones
   * - Comparaciones temporales para análisis de tendencias
   */
  @Get('dashboard')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Obtener dashboard ejecutivo con KPIs principales',
    description: `
    Proporciona un dashboard ejecutivo completo con las métricas más importantes:
    
    **KPIs principales:**
    - Ocupación actual y RevPAR
    - ADR (Average Daily Rate)
    - Ingresos del período
    - Tasa de huéspedes recurrentes
    
    **Análisis segmentado:**
    - Top mercados emisores (configurable)
    - Distribución por motivos de viaje
    - Rendimiento por tipo de habitación
    
    **Comparación temporal:**
    - Datos del período anterior (opcional)
    - Porcentajes de cambio period-over-period
    - Tendencias de crecimiento o decline
    
    **Optimizado para:**
    - Reportes ejecutivos
    - Toma de decisiones estratégicas
    - Monitoreo de performance general
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard ejecutivo generado exitosamente',
    type: DashboardEjecutivoDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticación inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos de administrador para acceder al dashboard',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno al generar el dashboard',
  })
  obtenerDashboardEjecutivo(@Query() filtros: FiltrosDashboardDto) {
    return this.analyticsService.generarDashboard(filtros);
  }
}
