# API Módulo de Aseo - Documentación para Frontend

Esta documentación describe todos los endpoints del módulo de aseo del Hotel San Miguel, incluyendo los DTOs de entrada y las respuestas esperadas.

## Índice

- [Tipos de Aseo](#tipos-de-aseo)
- [Paginación](#paginación)
- [Habitaciones para Aseo](#habitaciones-para-aseo)
- [Configuración de Aseo](#configuración-de-aseo)
- [Zonas Comunes](#zonas-comunes)
- [Registro de Aseo de Habitaciones](#registro-de-aseo-de-habitaciones)
- [Registro de Aseo de Zonas Comunes](#registro-de-aseo-de-zonas-comunes)
- [Reportes de Aseo](#reportes-de-aseo)

## Tipos de Aseo

Los siguientes tipos de aseo están disponibles en el sistema:

```typescript
enum TiposAseo {
  LIMPIEZA = 'LIMPIEZA',
  DESINFECCION = 'DESINFECCION',
  ROTACION_COLCHONES = 'ROTACION_COLCHONES',
  LIMPIEZA_BANIO = 'LIMPIEZA_BANIO',
  DESINFECCION_BANIO = 'DESINFECCION_BANIO'
}
```

## Paginación

Todos los endpoints de listado utilizan el siguiente esquema de paginación:

### PaginationDto (Query Parameters)
```typescript
{
  page?: number;    // Página actual (default: 1, mínimo: 1)
  limit?: number;   // Elementos por página (default: 10, mínimo: 1)
}
```

### Respuesta Paginada
```typescript
{
  data: T[];        // Array de elementos
  meta: {
    page: number;     // Página actual
    limit: number;    // Límite por página
    total: number;    // Total de elementos
    lastPage: number; // Última página disponible
  };
}
```

---

## Habitaciones para Aseo

### `GET /habitaciones/aseo` (Listar habitaciones con información de aseo)

**Permisos:** ADMINISTRADOR, ASEO, CAJERO

**Query Parameters:** `FiltrosAseoHabitacionDto + PaginationDto`
```typescript
{
  // Paginación
  page?: number;
  limit?: number;
  
  // Filtros específicos de aseo
  requerido_aseo_hoy?: boolean;           // true/false - habitaciones que requieren aseo hoy
  requerido_desinfeccion_hoy?: boolean;   // true/false - habitaciones que requieren desinfección hoy
  requerido_rotacion_colchones?: boolean; // true/false - habitaciones que requieren rotación de colchones
  ultimo_aseo_tipo?: TiposAseo;           // Enum TiposAseo - filtrar por último tipo de aseo
}
```

**Respuesta:** Paginada de `HabitacionAseo`
```typescript
{
  data: [
    {
      id: number;                                   // 1
      numero_habitacion: number;                    // 101
      tipo: TiposHabitacion;                       // "SENCILLA"
      estado: EstadosHabitacion;                   // "LIBRE"
      ultimo_aseo_fecha: Date | null;              // "2024-01-15T10:30:00Z"
      ultimo_aseo_tipo: TiposAseo | null;          // "LIMPIEZA"
      ultima_rotacion_colchones: Date | null;      // "2024-01-10T08:00:00Z"
      proxima_rotacion_colchones: Date | null;     // "2024-07-10T08:00:00Z"
      requerido_aseo_hoy: boolean;                 // false
      requerido_desinfeccion_hoy: boolean;         // true
      requerido_rotacion_colchones: boolean;       // false
      createdAt: Date;                             // "2024-01-01T00:00:00Z"
      updatedAt: Date;                             // "2024-01-15T12:00:00Z"
    }
  ],
  meta: { page, limit, totalHabitaciones, lastPage }
}
```

**Características Especiales:**
- **Información optimizada:** Solo devuelve campos relevantes para aseo (sin reservas, precios, etc.)
- **Ordenamiento inteligente:** Prioriza habitaciones que requieren aseo, desinfección o rotación
- **Filtros específicos:** Permite buscar habitaciones según necesidades de aseo
- **Acceso multi-rol:** Disponible para personal de aseo, administradores y cajeros

**Ejemplos de uso:**

1. **Obtener habitaciones que requieren aseo hoy:**
   ```
   GET /habitaciones/aseo?requerido_aseo_hoy=true&page=1&limit=10
   ```

2. **Buscar habitaciones que necesitan desinfección:**
   ```
   GET /habitaciones/aseo?requerido_desinfeccion_hoy=true
   ```

3. **Filtrar por último tipo de aseo realizado:**
   ```
   GET /habitaciones/aseo?ultimo_aseo_tipo=LIMPIEZA&page=1&limit=20
   ```

4. **Habitaciones pendientes de rotación de colchones:**
   ```
   GET /habitaciones/aseo?requerido_rotacion_colchones=true
   ```

**Estados de Habitación:**
```typescript
enum EstadosHabitacion {
  LIBRE = 'LIBRE',
  OCUPADO = 'OCUPADO', 
  RESERVADO = 'RESERVADO',
  EN_DESINFECCION = 'EN_DESINFECCION',
  EN_MANTENIMIENTO = 'EN_MANTENIMIENTO',
  EN_LIMPIEZA = 'EN_LIMPIEZA'
}
```

**Tipos de Habitación:**
```typescript
enum TiposHabitacion {
  SENCILLA = 'SENCILLA',
  DOBLE = 'DOBLE',
  TRIPLE = 'TRIPLE',
  FAMILIAR = 'FAMILIAR'
}
```

---

## Configuración de Aseo

### `GET /configuracion-aseo` (Obtener configuración actual)

**Permisos:** ADMINISTRADOR, CAJERO, ASEO

**Query Parameters:** Ninguno

**Respuesta:** `ConfiguracionAseo`
```typescript
{
  id: number;
  hora_limite_aseo: string;                                   // "17:00"
  hora_proceso_nocturno_utc: string;                         // "05:00"
  frecuencia_rotacion_colchones: number;                    // 180
  dias_aviso_rotacion_colchones: number;                    // 5
  habilitar_notificaciones: boolean;                        // false
  email_notificaciones?: string;                             // "admin@hotel.com"
  elementos_aseo_default: string[];                         // ["Escoba", "Trapeador"]
  elementos_proteccion_default: string[];                   // ["Guantes", "Mascarilla"]
  productos_quimicos_default: string[];                     // ["Desinfectante"]
  areas_intervenir_habitacion_default: string[];            // ["Cama", "Baño"]
  areas_intervenir_banio_default: string[];                 // ["Inodoro", "Lavamanos"]
  procedimiento_aseo_habitacion_default?: string;
  procedimiento_desinfeccion_habitacion_default?: string;
  procedimiento_rotacion_colchones_default?: string;
  procedimiento_limieza_zona_comun_default?: string;
  procedimiento_desinfeccion_zona_comun_default?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### `PUT /configuracion-aseo` (Actualizar configuración)

**Permisos:** ADMINISTRADOR

**Body:** `UpdateConfiguracionAseoDto` (todos los campos opcionales)
```typescript
{
  hora_limite_aseo?: string;                                 // Formato: "HH:MM"
  hora_proceso_nocturno_utc?: string;                       // Formato: "HH:MM"
  frecuencia_rotacion_colchones?: number;                   // 1-365 días
  dias_aviso_rotacion_colchones?: number;                   // 1-30 días
  habilitar_notificaciones?: boolean;
  email_notificaciones?: string;                            // Email válido
  elementos_aseo_default?: string[];                        // Máx 50 elementos, 100 chars c/u
  elementos_proteccion_default?: string[];                  // Máx 50 elementos, 100 chars c/u
  productos_quimicos_default?: string[];                    // Máx 50 elementos, 100 chars c/u
  areas_intervenir_habitacion_default?: string[];           // Máx 50 elementos, 100 chars c/u
  areas_intervenir_banio_default?: string[];                // Máx 50 elementos, 100 chars c/u
  procedimiento_aseo_habitacion_default?: string;           // Máx 1000 chars
  procedimiento_desinfeccion_habitacion_default?: string;   // Máx 1000 chars
  procedimiento_rotacion_colchones_default?: string;        // Máx 1000 chars
  procedimiento_limieza_zona_comun_default?: string;        // Máx 1000 chars
  procedimiento_desinfeccion_zona_comun_default?: string;   // Máx 1000 chars
}
```

**Respuesta:** `ConfiguracionAseo` (ver arriba)

---

## Zonas Comunes

### `GET /zonas-comunes` (Listar zonas comunes con filtros)

**Permisos:** ADMINISTRADOR, ASEO, CAJERO

**Query Parameters:** `FiltrosZonaComunDto + PaginationDto`
```typescript
{
  // Paginación
  page?: number;
  limit?: number;
  
  // Filtros
  piso?: number;                          // 0-50
  requerido_aseo_hoy?: boolean;           // true/false
  ultimo_aseo_tipo?: TiposAseo;           // Enum TiposAseo
}
```

**Respuesta:** Paginada de `ZonaComun`
```typescript
{
  data: [
    {
      id: number;
      nombre: string;                       // "Recepción"
      piso: number;                        // 1
      requerido_aseo_hoy: boolean;         // false
      ultimo_aseo_fecha: Date | null;      // "2024-01-15T10:30:00Z"
      ultimo_aseo_tipo: TiposAseo | null;  // "LIMPIEZA"
      createdAt: Date;
      updatedAt: Date;
      deleted: boolean;
    }
  ],
  meta: { page, limit, total, lastPage }
}
```

### `POST /zonas-comunes` (Crear zona común)

**Permisos:** ADMINISTRADOR

**Body:** `CreateZonaComunDto`
```typescript
{
  nombre: string;                         // 2-100 chars, obligatorio
  piso: number;                          // 0-50, obligatorio
  requerido_aseo_hoy?: boolean;          // Opcional, default: false
  ultimo_aseo_fecha?: string;            // ISO date string, opcional
  ultimo_aseo_tipo?: TiposAseo;          // Opcional
}
```

**Respuesta:** `ZonaComun` (ver arriba)

### `GET /zonas-comunes/:id` (Obtener zona común por ID)

**Permisos:** ADMINISTRADOR, ASEO, CAJERO

**Path Parameters:**
- `id`: number (ID de la zona común)

**Respuesta:** `ZonaComun` (ver arriba)

### `PUT /zonas-comunes/:id` (Actualizar zona común)

**Permisos:** ADMINISTRADOR

**Path Parameters:**
- `id`: number (ID de la zona común)

**Body:** `UpdateZonaComunDto` (todos los campos de CreateZonaComunDto pero opcionales)

**Respuesta:** `ZonaComun` (ver arriba)

### `DELETE /zonas-comunes/:id` (Eliminar zona común - soft delete)

**Permisos:** ADMINISTRADOR

**Path Parameters:**
- `id`: number (ID de la zona común)

**Respuesta:** `ZonaComun` (ver arriba)

### `GET /zonas-comunes/requieren-aseo` (Zonas que requieren aseo hoy)

**Permisos:** ADMINISTRADOR, ASEO

**Respuesta:** Array de `ZonaComun`

### `GET /zonas-comunes/piso/:piso` (Zonas comunes por piso)

**Permisos:** ADMINISTRADOR, ASEO, CAJERO

**Path Parameters:**
- `piso`: number (Número del piso)

**Respuesta:** Array de `ZonaComun`

---

## Registro de Aseo de Habitaciones

### `GET /registro-aseo-habitaciones` (Listar registros con filtros)

**Permisos:** ASEO, ADMINISTRADOR, CAJERO

**Query Parameters:** `FiltrosRegistroAseoHabitacionDto + PaginationDto`
```typescript
{
  // Paginación
  page?: number;
  limit?: number;
  
  // Filtros
  usuarioId?: number;                     // ID del usuario
  habitacionId?: number;                  // ID de la habitación
  fecha?: string;                         // "YYYY-MM-DD"
  tipo_aseo?: TiposAseo;                  // Enum TiposAseo
  objetos_perdidos?: boolean;             // true/false
  rastros_de_animales?: boolean;          // true/false
}
```

**Respuesta:** Paginada de `RegistroAseoHabitacion`
```typescript
{
  data: [
    {
      id: number;
      usuarioId: number;
      habitacionId: number;
      fecha_registro: Date;                         // "2024-01-15T14:30:00Z"
      areas_intervenidas: string[];                 // ["Cama", "Escritorio"]
      areas_intervenidas_banio: string[];           // ["Inodoro", "Lavamanos"]
      procedimiento_rotacion_colchones: string | null;
      tipos_realizados: TiposAseo[];                // ["LIMPIEZA", "DESINFECCION"]
      objetos_perdidos: boolean;
      rastros_de_animales: boolean;
      observaciones: string | null;
      createdAt: Date;
      updatedAt: Date;
      deleted: boolean;
    }
  ],
  meta: { page, limit, total, lastPage }
}
```

### `POST /registro-aseo-habitaciones` (Crear registro)

**Permisos:** ASEO, ADMINISTRADOR, CAJERO

**Body:** `CreateRegistroAseoHabitacionDto`
```typescript
{
  usuarioId: number;                              // Obligatorio, > 0
  habitacionId: number;                           // Obligatorio, > 0
  fecha_registro: string;                         // ISO date string, obligatorio
  elementos_aseo: string[];                       // Mín 1 elemento, 2-100 chars c/u
  elementos_proteccion: string[];                 // Mín 1 elemento, 2-100 chars c/u
  productos_quimicos: string[];                   // Mín 1 elemento, 2-100 chars c/u
  areas_intervenidas: string[];                   // Mín 1 elemento, 2-100 chars c/u
  areas_intervenidas_banio: string[];             // Mín 1 elemento, 2-100 chars c/u
  procedimiento_aseo: string;                     // 10-500 chars, obligatorio
  procedimiento_desinfeccion: string;             // 10-500 chars, obligatorio
  procedimiento_rotacion_colchones?: string;      // 10-500 chars, opcional
  tipos_realizados: TiposAseo[];                  // Mín 1 elemento, obligatorio
  objetos_perdidos?: boolean;                     // Opcional, default: false
  rastros_de_animales?: boolean;                  // Opcional, default: false
  observaciones?: string;                         // 5-1000 chars, opcional
}
```

**Respuesta:** `RegistroAseoHabitacion` (ver arriba)

### `GET /registro-aseo-habitaciones/:id` (Obtener registro por ID)

**Permisos:** ASEO, ADMINISTRADOR, CAJERO

**Path Parameters:**
- `id`: number (ID del registro)

**Respuesta:** `RegistroAseoHabitacion` (ver arriba)

### `PUT /registro-aseo-habitaciones/:id` (Actualizar registro)

**Permisos:** ASEO, ADMINISTRADOR, CAJERO

**Path Parameters:**
- `id`: number (ID del registro)

**Body:** `UpdateRegistroAseoHabitacionDto` (todos los campos de CreateRegistroAseoHabitacionDto pero opcionales)

**Respuesta:** `RegistroAseoHabitacion` (ver arriba)

### `DELETE /registro-aseo-habitaciones/:id` (Eliminar registro - soft delete)

**Permisos:** ASEO, ADMINISTRADOR, CAJERO

**Path Parameters:**
- `id`: number (ID del registro)

**Respuesta:** `RegistroAseoHabitacion` (ver arriba)

### Endpoints Específicos

#### `GET /registro-aseo-habitaciones/habitacion/:id` (Por habitación)
**Respuesta:** Array de `RegistroAseoHabitacion`

#### `GET /registro-aseo-habitaciones/usuario/:id` (Por usuario)
**Respuesta:** Array de `RegistroAseoHabitacion`

#### `GET /registro-aseo-habitaciones/fecha/:fecha` (Por fecha específica)
**Path Parameters:**
- `fecha`: string ("YYYY-MM-DD")

**Respuesta:** Array de `RegistroAseoHabitacion`

---

## Registro de Aseo de Zonas Comunes

### `GET /registro-aseo-zonas-comunes` (Listar registros con filtros)

**Permisos:** ASEO, ADMINISTRADOR, CAJERO

**Query Parameters:** `FiltrosRegistroAseoZonaComunDto + PaginationDto`
```typescript
{
  // Paginación
  page?: number;
  limit?: number;
  
  // Filtros
  usuarioId?: number;                     // ID del usuario
  zonaComunId?: number;                   // ID de la zona común
  fecha?: string;                         // "YYYY-MM-DD"
  tipo_aseo?: TiposAseo;                  // Enum TiposAseo
  objetos_perdidos?: boolean;             // true/false
  rastros_de_animales?: boolean;          // true/false
}
```

**Respuesta:** Paginada de `RegistroAseoZonaComun`
```typescript
{
  data: [
    {
      id: number;
      usuarioId: number;
      zonaComunId: number;
      fecha_registro: Date;                         // "2024-01-15T14:30:00Z"
      tipos_realizados: TiposAseo[];                // ["LIMPIEZA", "DESINFECCION"]
      objetos_perdidos: boolean;
      rastros_de_animales: boolean;
      observaciones: string | null;
      createdAt: Date;
      updatedAt: Date;
      deleted: boolean;
    }
  ],
  meta: { page, limit, total, lastPage }
}
```

### `POST /registro-aseo-zonas-comunes` (Crear registro)

**Permisos:** ASEO, ADMINISTRADOR, CAJERO

**Body:** `CreateRegistroAseoZonaComunDto`
```typescript
{
  usuarioId: number;                              // Obligatorio, > 0
  zonaComunId: number;                            // Obligatorio, > 0
  fecha_registro: string;                         // ISO date string, obligatorio
  tipos_realizados: TiposAseo[];                  // Mín 1 elemento, obligatorio
  objetos_perdidos?: boolean;                     // Opcional, default: false
  rastros_de_animales?: boolean;                  // Opcional, default: false
  observaciones?: string;                         // 5-1000 chars, opcional
}
```

**Respuesta:** `RegistroAseoZonaComun` (ver arriba)

### `GET /registro-aseo-zonas-comunes/:id` (Obtener registro por ID)

**Permisos:** ASEO, ADMINISTRADOR, CAJERO

**Path Parameters:**
- `id`: number (ID del registro)

**Respuesta:** `RegistroAseoZonaComun` (ver arriba)

### `PUT /registro-aseo-zonas-comunes/:id` (Actualizar registro)

**Permisos:** ASEO, ADMINISTRADOR, CAJERO

**Path Parameters:**
- `id`: number (ID del registro)

**Body:** `UpdateRegistroAseoZonaComunDto` (todos los campos de CreateRegistroAseoZonaComunDto pero opcionales)

**Respuesta:** `RegistroAseoZonaComun` (ver arriba)

### `DELETE /registro-aseo-zonas-comunes/:id` (Eliminar registro - soft delete)

**Permisos:** ASEO, ADMINISTRADOR, CAJERO

**Path Parameters:**
- `id`: number (ID del registro)

**Respuesta:** `RegistroAseoZonaComun` (ver arriba)

### Endpoints Específicos

#### `GET /registro-aseo-zonas-comunes/zona-comun/:id` (Por zona común)
**Respuesta:** Array de `RegistroAseoZonaComun`

#### `GET /registro-aseo-zonas-comunes/usuario/:id` (Por usuario)
**Respuesta:** Array de `RegistroAseoZonaComun`

#### `GET /registro-aseo-zonas-comunes/fecha/:fecha` (Por fecha específica)
**Path Parameters:**
- `fecha`: string ("YYYY-MM-DD")

**Respuesta:** Array de `RegistroAseoZonaComun`

---

## Reportes de Aseo

### `GET /reportes-aseo` (Listar reportes con filtros)

**Permisos:** ASEO, ADMINISTRADOR, CAJERO

**Query Parameters:** `FiltrosReportesAseoDto + PaginationDto`
```typescript
{
  // Paginación
  page?: number;
  limit?: number;
  
  // Filtros
  fecha?: string;                         // "YYYY-MM-DD" - fecha específica
  fecha_inicio?: string;                  // "YYYY-MM-DD" - rango inicial
  fecha_fin?: string;                     // "YYYY-MM-DD" - rango final
  elemento_aseo?: string;                 // 2-100 chars
  producto_quimico?: string;              // 2-100 chars
  elemento_proteccion?: string;           // 2-100 chars
}
```

**Respuesta:** Paginada de `ReporteAseoDiario`
```typescript
{
  data: [
    {
      id: number;
      fecha: Date;                                  // "2024-01-15T00:00:00Z"
      elementos_aseo: string[];                     // ["Escoba", "Trapeador"]
      elementos_proteccion: string[];               // ["Guantes", "Mascarilla"]
      productos_quimicos: string[];                 // ["Desinfectante"]
      procedimiento_aseo_habitacion: string;
      procedimiento_desinfeccion_habitacion: string;
      procedimiento_limpieza_zona_comun: string;
      procedimiento_desinfeccion_zona_comun: string;
      datos: {
        habitaciones: RegistroAseoHabitacion[];
        zonas_comunes: RegistroAseoZonaComun[];
        resumen: {
          total_habitaciones_aseadas: number;
          total_zonas_comunes_aseadas: number;
          objetos_perdidos_encontrados: number;
          rastros_animales_encontrados: number;
        };
      };
      createdAt: Date;
      updatedAt: Date;
      deleted: boolean;
    }
  ],
  meta: { page, limit, total, lastPage }
}
```

### `POST /reportes-aseo` (Crear reporte)

**Permisos:** ASEO, ADMINISTRADOR, CAJERO

**Body:** `CreateReportesAseoDto`
```typescript
{
  fecha: string;                                    // ISO date string, obligatorio
  elementos_aseo: string[];                         // Mín 1 elemento, 2-100 chars c/u
  elementos_proteccion: string[];                   // Mín 1 elemento, 2-100 chars c/u
  productos_quimicos: string[];                     // Mín 1 elemento, 2-100 chars c/u
  procedimiento_aseo_habitacion: string;            // 10-1000 chars, obligatorio
  procedimiento_desinfeccion_habitacion: string;    // 10-1000 chars, obligatorio
  procedimiento_limpieza_zona_comun: string;        // 10-1000 chars, obligatorio
  procedimiento_desinfeccion_zona_comun: string;    // 10-1000 chars, obligatorio
  datos?: {                                         // Objeto JSON opcional
    habitaciones: any[];
    zonas_comunes: any[];
    resumen: {
      total_habitaciones_aseadas: number;
      total_zonas_comunes_aseadas: number;
      objetos_perdidos_encontrados: number;
      rastros_animales_encontrados: number;
    };
  };
}
```

**Respuesta:** `ReporteAseoDiario` (ver arriba)

### `GET /reportes-aseo/:id` (Obtener reporte por ID)

**Permisos:** ASEO, ADMINISTRADOR, CAJERO

**Path Parameters:**
- `id`: number (ID del reporte)

**Respuesta:** `ReporteAseoDiario` (ver arriba)

### `PUT /reportes-aseo/:id` (Actualizar reporte)

**Permisos:** ASEO, ADMINISTRADOR, CAJERO

**Path Parameters:**
- `id`: number (ID del reporte)

**Body:** `UpdateReportesAseoDto` (todos los campos de CreateReportesAseoDto pero opcionales)

**Respuesta:** `ReporteAseoDiario` (ver arriba)

### `DELETE /reportes-aseo/:id` (Eliminar reporte - soft delete)

**Permisos:** ASEO, ADMINISTRADOR, CAJERO

**Path Parameters:**
- `id`: number (ID del reporte)

**Respuesta:** `ReporteAseoDiario` (ver arriba)

### Endpoints Específicos

#### `GET /reportes-aseo/fecha/:fecha` (Por fecha específica)
**Path Parameters:**
- `fecha`: string ("YYYY-MM-DD")

**Respuesta:** `ReporteAseoDiario` o `null`

#### `POST /reportes-aseo/generar` (Generar reporte automático)
**Body:**
```typescript
{
  fecha: string;    // "YYYY-MM-DD", obligatorio
}
```

**Respuesta:** `ReporteAseoDiario` (ver arriba)

---

## Códigos de Estado HTTP

- `200`: OK - Operación exitosa
- `201`: Created - Recurso creado exitosamente
- `400`: Bad Request - Datos de entrada inválidos
- `401`: Unauthorized - Token de autenticación inválido
- `403`: Forbidden - Sin permisos para realizar la operación
- `404`: Not Found - Recurso no encontrado
- `500`: Internal Server Error - Error interno del servidor

## Headers Requeridos

Todos los endpoints requieren:
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Notas Importantes

1. **Fechas**: Todas las fechas deben enviarse en formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)
2. **Paginación**: Los parámetros `page` y `limit` se envían como query parameters
3. **Filtros**: Los filtros booleanos aceptan `'true'` o `'false'` como strings en query parameters
4. **Validaciones**: Revisar los límites de caracteres y rangos numéricos especificados
5. **Soft Delete**: Los elementos eliminados no se muestran en las consultas normales
6. **Permisos**: Cada endpoint especifica los roles requeridos para acceder 