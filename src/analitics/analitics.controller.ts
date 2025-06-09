import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  AnaliticsService,
  DailyRevenueResponse,
  MonthlyRevenueResponse,
} from './analitics.service';
import {
  GetDailyRevenueDto,
  GetMonthlyRevenueDto,
  GetInvoicesRangeDto,
} from './dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/usuarios/entities/rol.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { Factura } from 'src/facturas/entities/factura.entity';

/**
 * Controller para manejar análisis y reportes de facturación
 */
@ApiTags('analitics')
@ApiBearerAuth()
@Auth(Role.ADMINISTRADOR)
@ApiExtraModels(
  DailyRevenueResponse,
  MonthlyRevenueResponse,
  Factura,
  GetDailyRevenueDto,
  GetMonthlyRevenueDto,
  GetInvoicesRangeDto,
)
@Controller('analitics')
export class AnaliticsController {
  constructor(private readonly analiticsService: AnaliticsService) {}

  /**
   * Obtiene los ingresos diarios para una fecha específica.
   *
   * **Funcionalidad:**
   * - Calcula el total de ingresos del día especificado
   * - Cuenta la cantidad de facturas emitidas
   * - Calcula el promedio de ingresos por factura
   * - Excluye facturas eliminadas (deleted = true)
   *
   * **Validaciones:**
   * - La fecha debe estar en formato válido (YYYY-MM-DD)
   * - Solo incluye facturas activas (no eliminadas)
   */
  @Get('daily-revenue/:date')
  @ApiOperation({
    summary: 'Obtener ingresos diarios por fecha',
    description: `
    Calcula los ingresos totales, cantidad de facturas y promedio por factura para una fecha específica.
    
    **Características:**
    - **Formato de fecha**: YYYY-MM-DD (ejemplo: 2024-01-15)
    - **Filtros automáticos**: Solo facturas activas (deleted = false)
    - **Cálculo de promedio**: totalRevenue / invoiceCount (0 si no hay facturas)
    - **Precisión**: Valores monetarios redondeados a 2 decimales
    
    **Casos de uso:**
    - Análisis de ventas diarias
    - Reportes de caja diarios
    - Comparación de rendimiento entre días
    `,
  })
  @ApiParam({
    name: 'date',
    description: 'Fecha a analizar en formato YYYY-MM-DD',
    type: String,
    example: '2024-01-15',
  })
  @ApiResponse({
    status: 200,
    description: `
    Ingresos diarios calculados exitosamente.
    
    **Respuesta incluye:**
    - date: Fecha analizada
    - totalRevenue: Suma total de ingresos del día
    - invoiceCount: Cantidad de facturas emitidas
    - averagePerInvoice: Promedio de ingresos por factura
    `,
    type: DailyRevenueResponse,
  })
  @ApiResponse({
    status: 400,
    description:
      'Formato de fecha inválido - La fecha debe estar en formato YYYY-MM-DD',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticación inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description:
      'Sin permisos suficientes - Solo administradores pueden acceder a analytics',
  })
  @ApiResponse({
    status: 500,
    description:
      'Error interno del servidor al procesar los datos de facturación',
  })
  getDailyRevenue(@Param('date') date: string) {
    return this.analiticsService.getDailyRevenue(date);
  }

  /**
   * Obtiene los ingresos mensuales para un año y mes específicos.
   *
   * **Funcionalidad:**
   * - Calcula el total de ingresos del mes completo
   * - Suma facturas de todos los días del mes
   * - Maneja correctamente meses con diferentes cantidades de días
   * - Considera años bisiestos para febrero
   *
   * **Validaciones:**
   * - El mes debe estar entre 1 y 12
   * - Solo incluye facturas del mes exacto especificado
   */
  @Get('monthly-revenue/:year/:month')
  @ApiOperation({
    summary: 'Obtener ingresos mensuales por año y mes',
    description: `
    Calcula los ingresos totales, cantidad de facturas y promedio por factura para un mes completo.
    
    **Características:**
    - **Rango temporal**: Desde el día 1 hasta el último día del mes
    - **Años bisiestos**: Maneja correctamente febrero en años bisiestos
    - **Validación de mes**: Debe estar entre 1 (enero) y 12 (diciembre)
    - **Exclusión de datos**: Solo facturas activas del mes especificado
    
    **Casos de uso:**
    - Reportes mensuales de ventas
    - Análisis de tendencias mensuales
    - Comparación entre meses diferentes
    - Reportes ejecutivos mensuales
    `,
  })
  @ApiParam({
    name: 'year',
    description: 'Año a analizar',
    type: Number,
    example: 2024,
  })
  @ApiParam({
    name: 'month',
    description: 'Mes a analizar (1-12, donde 1=enero, 12=diciembre)',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: `
    Ingresos mensuales calculados exitosamente.
    
    **Respuesta incluye:**
    - year: Año analizado
    - month: Mes analizado (1-12)
    - totalRevenue: Suma total de ingresos del mes
    - invoiceCount: Cantidad de facturas emitidas en el mes
    - averagePerInvoice: Promedio de ingresos por factura
    `,
    type: MonthlyRevenueResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Mes inválido - El mes debe estar entre 1 y 12',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticación inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description:
      'Sin permisos suficientes - Solo administradores pueden acceder a analytics',
  })
  @ApiResponse({
    status: 500,
    description:
      'Error interno del servidor al procesar los datos de facturación',
  })
  getMonthlyRevenue(
    @Param('year') year: number,
    @Param('month') month: number,
  ) {
    return this.analiticsService.getMonthlyRevenue(+year, +month);
  }

  /**
   * Obtiene todas las facturas dentro de un rango de fechas específico.
   *
   * **Funcionalidad:**
   * - Retorna lista completa de facturas en el rango
   * - Incluye datos relacionados de huéspedes y reservas activos
   * - Ordena por fecha de facturación (más recientes primero)
   * - Excluye facturas eliminadas
   * - Excluye facturas con huéspedes o reservas eliminados
   *
   * **Validaciones:**
   * - Ambas fechas deben tener formato válido
   * - La fecha de inicio no puede ser mayor que la fecha de fin
   * - Incluye facturas del día completo (00:00:00 a 23:59:59)
   */
  @Get('invoices-range')
  @ApiOperation({
    summary: 'Obtener facturas en un rango de fechas',
    description: `
    Retorna todas las facturas emitidas dentro de un rango de fechas específico.
    
         **Características:**
     - **Formato de fechas**: YYYY-MM-DD para ambos parámetros
     - **Rango inclusivo**: Incluye facturas de startDate y endDate
     - **Datos relacionados**: Incluye información de huéspedes y reservas activos
     - **Ordenamiento**: Por fecha de facturación descendente (más recientes primero)
     - **Filtros**: Solo facturas, huéspedes y reservas activas (deleted = false)
    
    **Validaciones:**
    - startDate <= endDate
    - Formatos de fecha válidos
    - Rango puede ser un solo día (startDate = endDate)
    
    **Casos de uso:**
    - Consulta de facturas por período
    - Exportación de datos para reportes
    - Auditoría de facturación por rangos
    - Análisis detallado de transacciones
    `,
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Fecha de inicio del rango en formato YYYY-MM-DD',
    type: String,
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Fecha de fin del rango en formato YYYY-MM-DD',
    type: String,
    example: '2024-01-31',
  })
  @ApiResponse({
    status: 200,
    description: `
    Lista de facturas en el rango especificado.
    
         **Cada factura incluye:**
     - Datos básicos de la factura (id, total, fecha)
     - Información del huésped asociado (solo si no está eliminado)
     - Datos de la reserva relacionada (solo si no está eliminada)
     - Fechas de creación y actualización
     - Estado de eliminación (siempre false en resultados)
    
    **Array vacío** si no hay facturas en el rango.
    `,
    type: [Factura],
  })
  @ApiResponse({
    status: 400,
    description: `
    Error de validación en los parámetros:
    - Formato de fecha inválido (debe ser YYYY-MM-DD)
    - startDate mayor que endDate
    `,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticación inválido o ausente',
  })
  @ApiResponse({
    status: 403,
    description:
      'Sin permisos suficientes - Solo administradores pueden acceder a analytics',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor al consultar las facturas',
  })
  getInvoicesInRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.analiticsService.getInvoicesInRange(startDate, endDate);
  }
}
