# 📊 API Analytics - Documentación para Frontend

## Descripción General

Los endpoints de Analytics proporcionan información estadística y reportes sobre la facturación del hotel. Todos los endpoints requieren autenticación de **Administrador** y devuelven datos en tiempo real desde la base de datos.

## 🔐 Autenticación

**Todos los endpoints requieren:**
- **Rol:** Administrador
- **Autenticación:** Bearer Token en el header `Authorization`

```javascript
// Ejemplo de header requerido
headers: {
  'Authorization': 'Bearer tu_token_aqui',
  'Content-Type': 'application/json'
}
```

---

## 📋 Endpoints Disponibles

### 1. 💰 Ingresos Diarios

**Obtiene estadísticas de ingresos para una fecha específica**

#### Ruta
```
GET /analitics/daily-revenue/:date
```

#### Parámetros
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `date` | string | Fecha en formato YYYY-MM-DD | `2024-01-15` |

#### Respuesta Exitosa (200)
```json
{
  "date": "2024-01-15",
  "totalRevenue": 1500.75,
  "invoiceCount": 10,
  "averagePerInvoice": 150.08
}
```

#### Campos de Respuesta
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `date` | string | Fecha analizada |
| `totalRevenue` | number | Suma total de ingresos del día |
| `invoiceCount` | number | Cantidad de facturas emitidas |
| `averagePerInvoice` | number | Promedio de ingresos por factura |

#### Ejemplo de Uso (JavaScript)
```javascript
// Función para obtener ingresos diarios
async function obtenerIngresosDiarios(fecha) {
  try {
    const response = await fetch(`/api/analitics/daily-revenue/${fecha}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener ingresos diarios');
    }

    const datos = await response.json();
    return datos;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Uso
const ingresosDiarios = await obtenerIngresosDiarios('2024-01-15');
```

#### Errores Comunes
- **400:** Formato de fecha inválido
- **401:** Token inválido o ausente
- **403:** Permisos insuficientes
- **500:** Error interno del servidor

---

### 2. 📅 Ingresos Mensuales

**Obtiene estadísticas de ingresos para un mes completo**

#### Ruta
```
GET /analitics/monthly-revenue/:year/:month
```

#### Parámetros
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `year` | number | Año a analizar | `2024` |
| `month` | number | Mes (1-12) donde 1=enero, 12=diciembre | `1` |

#### Respuesta Exitosa (200)
```json
{
  "year": 2024,
  "month": 1,
  "totalRevenue": 45000.50,
  "invoiceCount": 300,
  "averagePerInvoice": 150.00
}
```

#### Campos de Respuesta
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `year` | number | Año analizado |
| `month` | number | Mes analizado (1-12) |
| `totalRevenue` | number | Suma total de ingresos del mes |
| `invoiceCount` | number | Cantidad de facturas emitidas en el mes |
| `averagePerInvoice` | number | Promedio de ingresos por factura |

#### Ejemplo de Uso (JavaScript)
```javascript
// Función para obtener ingresos mensuales
async function obtenerIngresosMensuales(año, mes) {
  try {
    const response = await fetch(`/api/analitics/monthly-revenue/${año}/${mes}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener ingresos mensuales');
    }

    const datos = await response.json();
    return datos;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Uso
const ingresosMensuales = await obtenerIngresosMensuales(2024, 1);
```

#### Errores Comunes
- **400:** Mes inválido (debe estar entre 1-12)
- **401:** Token inválido o ausente
- **403:** Permisos insuficientes
- **500:** Error interno del servidor

---

### 3. 📋 Facturas por Rango de Fechas

**Obtiene lista completa de facturas en un rango de fechas específico**

#### Ruta
```
GET /analitics/invoices-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

#### Parámetros Query
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `startDate` | string | Fecha de inicio en formato YYYY-MM-DD | `2024-01-01` |
| `endDate` | string | Fecha de fin en formato YYYY-MM-DD | `2024-01-31` |

#### Respuesta Exitosa (200)
```json
[
  {
    "id": 1,
    "total": 150.75,
    "fecha_factura": "2024-01-15T10:30:00.000Z",
    "huesped_id": 1,
    "reserva_id": 1,
    "deleted": false,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "huesped": {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@email.com",
      "telefono": "123456789",
      "deleted": false
    },
    "reserva": {
      "id": 1,
      "fecha_entrada": "2024-01-15T00:00:00.000Z",
      "fecha_salida": "2024-01-17T00:00:00.000Z",
      "habitacion_id": 101,
      "deleted": false
    }
  }
]
```

#### Estructura de Cada Factura
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | number | ID único de la factura |
| `total` | number | Monto total de la factura |
| `fecha_factura` | string | Fecha y hora de emisión (ISO 8601) |
| `huesped_id` | number | ID del huésped asociado |
| `reserva_id` | number | ID de la reserva asociada |
| `deleted` | boolean | Estado de eliminación (siempre false) |
| `created_at` | string | Fecha de creación |
| `updated_at` | string | Fecha de última actualización |
| `huesped` | object | Información completa del huésped |
| `reserva` | object | Información completa de la reserva |

#### Ejemplo de Uso (JavaScript)
```javascript
// Función para obtener facturas por rango
async function obtenerFacturasPorRango(fechaInicio, fechaFin) {
  try {
    const params = new URLSearchParams({
      startDate: fechaInicio,
      endDate: fechaFin
    });

    const response = await fetch(`/api/analitics/invoices-range?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener facturas por rango');
    }

    const facturas = await response.json();
    return facturas;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Uso
const facturas = await obtenerFacturasPorRango('2024-01-01', '2024-01-31');
```

#### Errores Comunes
- **400:** Formato de fecha inválido o startDate > endDate
- **401:** Token inválido o ausente
- **403:** Permisos insuficientes
- **500:** Error interno del servidor

---

## 🎯 Casos de Uso Típicos

### Dashboard de Administración
```javascript
// Obtener datos para dashboard del día actual
async function cargarDashboardDiario() {
  const fechaHoy = new Date().toISOString().split('T')[0];
  
  const [ingresosDiarios, facturas] = await Promise.all([
    obtenerIngresosDiarios(fechaHoy),
    obtenerFacturasPorRango(fechaHoy, fechaHoy)
  ]);

  // Mostrar estadísticas
  mostrarEstadisticas(ingresosDiarios);
  
  // Mostrar lista de facturas del día
  mostrarFacturasDelDia(facturas);
}
```

### Reporte Mensual
```javascript
// Generar reporte mensual
async function generarReporteMensual(año, mes) {
  const ingresosMensuales = await obtenerIngresosMensuales(año, mes);
  
  // Obtener primer y último día del mes
  const primerDia = `${año}-${mes.toString().padStart(2, '0')}-01`;
  const ultimoDia = new Date(año, mes, 0).toISOString().split('T')[0];
  
  const facturas = await obtenerFacturasPorRango(primerDia, ultimoDia);
  
  return {
    resumen: ingresosMensuales,
    detalles: facturas
  };
}
```

### Análisis de Período Personalizado
```javascript
// Analizar período específico
async function analizarPeriodo(fechaInicio, fechaFin) {
  const facturas = await obtenerFacturasPorRango(fechaInicio, fechaFin);
  
  // Calcular estadísticas personalizadas
  const totalIngresos = facturas.reduce((sum, f) => sum + f.total, 0);
  const totalFacturas = facturas.length;
  const promedioPorFactura = totalFacturas > 0 ? totalIngresos / totalFacturas : 0;
  
  return {
    periodo: { fechaInicio, fechaFin },
    totalIngresos,
    totalFacturas,
    promedioPorFactura,
    facturas
  };
}
```

---

## 🔍 Filtros y Consideraciones

### Datos Incluidos
- ✅ Solo facturas activas (`deleted: false`)
- ✅ Solo huéspedes activos (`deleted: false`)
- ✅ Solo reservas activas (`deleted: false`)
- ✅ Ordenamiento por fecha descendente (más recientes primero)

### Rangos de Fechas
- **Inclusivos:** Ambas fechas (inicio y fin) están incluidas
- **Formato estricto:** YYYY-MM-DD (ISO 8601)
- **Zona horaria:** El servidor esta configurado y espera fechas en UTC
- **Validación:** startDate debe ser <= endDate

### Precisión de Cálculos
- **Valores monetarios:** Redondeados a 2 decimales
- **Promedios:** Calculados solo cuando hay facturas (0 si no hay)
- **Fechas:** Incluye día completo (00:00:00 a 23:59:59)

---

## 🚀 Ejemplos de Integración

### React/Vue Component
```javascript
// Hook personalizado para analytics
function useAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const obtenerDatos = async (tipo, ...params) => {
    setLoading(true);
    setError(null);
    
    try {
      let datos;
      switch (tipo) {
        case 'diario':
          datos = await obtenerIngresosDiarios(params[0]);
          break;
        case 'mensual':
          datos = await obtenerIngresosMensuales(params[0], params[1]);
          break;
        case 'rango':
          datos = await obtenerFacturasPorRango(params[0], params[1]);
          break;
      }
      return datos;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { obtenerDatos, loading, error };
}
```

### Manejo de Errores
```javascript
// Función utilitaria para manejo de errores
function manejarErrorAnalytics(error, response) {
  switch (response?.status) {
    case 400:
      return 'Parámetros inválidos. Verifica el formato de las fechas.';
    case 401:
      return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    case 403:
      return 'No tienes permisos para acceder a esta información.';
    case 500:
      return 'Error del servidor. Intenta nuevamente más tarde.';
    default:
      return 'Error inesperado. Contacta al soporte técnico.';
  }
}
```

---

## 📝 Notas Importantes

1. **Rendimiento:** Los endpoints pueden ser lentos con grandes volúmenes de datos
2. **Cache:** Considera implementar cache en el frontend para consultas frecuentes
3. **Paginación:** Los endpoints de facturas no incluyen paginación automática
4. **Límites:** No hay límites específicos en las consultas, pero considera la performance
5. **Tiempo Real:** Los datos son en tiempo real, sin cache del lado servidor

---

*Documentación generada para Hotel San Miguel - Módulo Analytics v1.0* 