# Nuevo Endpoint: Habitaciones para Aseo

## 📋 Resumen

Se ha implementado un nuevo endpoint específico para el módulo de aseo que devuelve únicamente la información relevante de habitaciones para tareas de limpieza, desinfección y mantenimiento.

## 🔗 Endpoint

```
GET /habitaciones/aseo
```

## 🎯 Características Implementadas

### ✅ Información Optimizada
- **Solo campos relevantes:** Elimina datos innecesarios como reservas, precios, etc.
- **Enfoque en aseo:** Incluye fechas de último aseo, tipo de aseo, rotación de colchones
- **Estados específicos:** Información del estado actual y requerimientos

### ✅ Paginación Completa
- Parámetros `page` y `limit`
- Metadatos de paginación (`totalHabitaciones`, `lastPage`)
- Respuesta estructurada estándar

### ✅ Filtros Específicos
- `requerido_aseo_hoy`: Habitaciones que necesitan aseo hoy
- `requerido_desinfeccion_hoy`: Habitaciones que necesitan desinfección
- `requerido_rotacion_colchones`: Habitaciones pendientes de rotación
- `ultimo_aseo_tipo`: Filtrar por tipo de último aseo realizado

### ✅ Ordenamiento Inteligente
Prioriza habitaciones por:
1. Requieren aseo hoy (descendente)
2. Requieren desinfección hoy (descendente) 
3. Requieren rotación de colchones (descendente)
4. Número de habitación (ascendente)

## 📁 Archivos Creados/Modificados

### Nuevos Archivos:
- `src/habitaciones/dto/filtros-aseo-habitacion.dto.ts`
- `src/habitaciones/entities/habitacion-aseo.entity.ts`
- `documentation/ENDPOINT-HABITACIONES-ASEO.md`

### Archivos Modificados:
- `src/habitaciones/habitaciones.service.ts` - Método `findAllForAseo()`
- `src/habitaciones/habitaciones.controller.ts` - Endpoint `GET aseo`
- `documentation/README-API-ASEO.md` - Documentación completa

## 🔧 Estructura de Respuesta

```typescript
{
  data: [
    {
      id: number;                          // ID único
      numero_habitacion: number;           // Número de habitación
      tipo: TiposHabitacion;              // Tipo de habitación
      estado: EstadosHabitacion;          // Estado actual
      ultimo_aseo_fecha: Date | null;     // Fecha último aseo
      ultimo_aseo_tipo: TiposAseo | null; // Tipo último aseo
      ultima_rotacion_colchones: Date | null;    // Última rotación
      proxima_rotacion_colchones: Date | null;   // Próxima rotación
      requerido_aseo_hoy: boolean;        // Requiere aseo hoy
      requerido_desinfeccion_hoy: boolean; // Requiere desinfección
      requerido_rotacion_colchones: boolean; // Requiere rotación
      createdAt: Date;                     // Fecha creación
      updatedAt: Date;                     // Fecha actualización
    }
  ],
  meta: {
    page: number;           // Página actual
    limit: number;          // Límite por página
    totalHabitaciones: number; // Total de habitaciones
    lastPage: number;       // Última página
  }
}
```

## 🛡️ Permisos

- **ADMINISTRADOR**: Acceso completo
- **ASEO**: Acceso para personal de limpieza
- **CAJERO**: Acceso para coordinación

## 📖 Ejemplos de Uso

### 1. Habitaciones que requieren aseo hoy
```bash
GET /habitaciones/aseo?requerido_aseo_hoy=true&page=1&limit=10
```

### 2. Habitaciones para desinfección
```bash
GET /habitaciones/aseo?requerido_desinfeccion_hoy=true
```

### 3. Filtrar por último tipo de aseo
```bash
GET /habitaciones/aseo?ultimo_aseo_tipo=LIMPIEZA&page=1&limit=20
```

### 4. Habitaciones pendientes de rotación
```bash
GET /habitaciones/aseo?requerido_rotacion_colchones=true
```

### 5. Combinando filtros
```bash
GET /habitaciones/aseo?requerido_aseo_hoy=true&ultimo_aseo_tipo=DESINFECCION&page=1&limit=5
```

## ✨ Beneficios

1. **Rendimiento optimizado:** Solo datos necesarios para aseo
2. **Filtros específicos:** Encuentra rápidamente habitaciones según necesidad
3. **Ordenamiento inteligente:** Prioriza habitaciones urgentes
4. **Documentación completa:** API bien documentada para frontend
5. **Consistencia:** Sigue patrones del módulo de aseo existente
6. **Paginación eficiente:** Maneja grandes volúmenes de datos

## 🔄 Integración

Este endpoint se integra perfectamente con:
- **Módulo de aseo existente**
- **Sistema de permisos actual**
- **Documentación API unificada**
- **Patrones de respuesta estándar**

## 🚀 Listo para Uso

El endpoint está completamente implementado y documentado, listo para ser consumido por el frontend del módulo de aseo. 