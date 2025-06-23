Objetivo: Integrar un nuevo módulo con todas las características de aseo del hotel, lo cual permitirá generar un reporte válido para las entidades de salubridad estatales y llevar un control y notificaciones del aseo en el hotel.



Los tipos de aseo que se realizaran depende de:

- si es una habitación debe recibir limpieza si no fue ocupada por un huésped ese día.
- si es una habitación debe recibir limpieza del baño si no fue ocupada por un huésped ese día.
- si es una habitación debe recibir desinfección si fue ocupada ese día.
- si es una habitación debe recibir desinfección del baño si fue ocupada por un huésped ese día.
- si es una habitación debe recibir rotación de colchones cada 6 meses o cada número de días que especifique el usuario en la configuración de aseo.
- si es una zona común debe recibir limpieza diaria
- si es una zona común debe recibir desinfección cada mes o cada número de días que especifique el administrador en la configuración de aseo.


Estos serán los tipos de aseo:

```
enum TiposAseo {
  LIMPIEZA
  DESINFECCION
  ROTACION_COLCHONES
  LIMPIEZA_BANIO
  DESINFECCION_BANIO
}
```
Primero se necesitan crear las entidades de zonas comunes y zonas de lavado.

Las zonas de comunes son lugares que no son habitaciones, pero deben estar en los informes de aseo, al igual que las habitaciones, estas se clasificaran y ordenaran por piso y deberá ser un administrado quien pueda realizar las acciones de crud de las mismas.



Su entidad es la siguiente:

```
model ZonaComun {
  id Int @id @default(autoincrement())
  nombre String
  piso Int
  requerido_aseo_hoy Boolean @default(false)
  ultimo_aseo_fecha DateTime?
  ultimo_aseo_tipo TiposAseo?

  RegistrosAseoZonaComun RegistroAseoZonaComun[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deleted   Boolean  @default(false)

  @@index([ultimo_aseo_fecha, deleted])
  @@index([requerido_aseo_hoy, deleted])
  @@index([deleted])
}
```


Y la entidad de registro aseo zona común contiene los datos detallados de esa zona común en específico necesarios para el reporte diario



su entidad es la siguiente:

```
model RegistroAseoZonaComun {
  id Int @id @default(autoincrement())
  zonaComunId Int
  usuarioId Int
  fecha_registro DateTime

  zonaComun ZonaComun @relation(fields: [zonaComunId], references: [id])
  usuario Usuario @relation(fields: [usuarioId], references: [id])

  tipos_realizados TiposAseo[]

  objetos_perdidos Boolean @default(false)
  rastros_de_animales Boolean @default(false)
  observaciones String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deleted   Boolean  @default(false)

  @@index([fecha_registro, zonaComunId])
  @@index([usuarioId, fecha_registro])
  @@index([deleted])
}
```


Las habitaciones requieren un registro de aseo distinto:

```
model RegistroAseoHabitacion {
  id             Int      @id @default(autoincrement())
  usuarioId      Int
  habitacionId   Int
  fecha_registro DateTime

  areas_intervenidas String[]
  areas_intervenidas_banio String[]
  procedimiento_rotacion_colchones String?

  usuario    Usuario    @relation(fields: [usuarioId], references: [id])
  habitacion Habitacion @relation(fields: [habitacionId], references: [id])

  tipos_realizados TiposAseo[]

  objetos_perdidos Boolean @default(false)
  rastros_de_animales Boolean @default(false)
  observaciones String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deleted   Boolean  @default(false)

  @@index([fecha_registro, habitacionId, deleted])
  @@index([usuarioId, fecha_registro, deleted])
  @@index([deleted])
}
```
Una vez al día, el sistema deberá generar un registro unificado del aseo total, el cual debe contener los registros de las habitaciones y de las zonas, además de los procedimientos hechos en el día, los productos que fueron usados, elementos de protección usados que normalmente son los mismos para todos los días. Los reportes se almacenan como JSON



La entidad del registro diario es:

```
model ReporteAseoDiario {
  id Int @id @default(autoincrement())
  fecha DateTime

  elementos_aseo String[]
  elementos_proteccion String[]
  productos_quimicos String[]
  procedimiento_aseo_habitacion String
  procedimiento_desinfeccion_habitacion String
  procedimiento_limpieza_zona_comun String
  procedimiento_desinfeccion_zona_comun String

  datos Json

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deleted   Boolean  @default(false)

  @@index([fecha])
  @@index([deleted])
}
```


Para facilitar los campos repetitivos y tener control sobre datos variables es necesaria una configuración de los parámetros de aseo. La cual va a tener los valores por defecto de los formularios, tiempos de validación, etc.



Esta es la entidad de la configuración:

```
model ConfiguracionAseo {
  id Int @id @default(autoincrement())
  hora_limite_aseo String @default("17:00")
  frecuencia_rotacion_colchones Int @default(180) // en dias
  dias_aviso_rotacion_colchones Int @default(5) // en dias

  habilitar_notificaciones Boolean @default(false)
  email_notificaciones String?

  elementos_aseo_default String[]
  elementos_proteccion_default String[]
  productos_quimicos_default String[]
  areas_intervenir_habitacion_default String[]
  areas_intervenir_banio_default String[]
  procedimiento_aseo_habitacion_default String?
  procedimiento_desinfeccion_habitacion_default String?
  procedimiento_rotacion_colchones_default String?
  procedimiento_limieza_zona_comun_default String?
  procedimiento_desinfeccion_zona_comun_default String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
## 📋 **ANÁLISIS DEL ESTADO ACTUAL**
✅ **Ya implementado:**

- Todas las entidades del módulo de aseo en `prisma/schema.prisma` 
- Enum `TiposAseo`  con todos los tipos necesarios
- Rol `ASEO`  en el enum `Role`  
- Campos de aseo agregados a la entidad `Habitacion` 
- Relaciones entre `Usuario`  y los registros de aseo
❌ **Falta implementar:**

- Crear los tipos necesarios para los enums
- Los módulos de NestJS para aseo
- Controllers, services y DTOs
- Endpoints de la API
- Lógica de negocio para automatización
- Jobs programados (cron) para generar reportes
## 🛣️ **ROADMAP DE IMPLEMENTACIÓN**
### **FASE 1: Módulos Base (2-3 días)**
#### 1.1 Módulo de Configuración de Aseo
```
src/configuracion-aseo/
├── configuracion-aseo.controller.ts
├── configuracion-aseo.service.ts
├── configuracion-aseo.module.ts
└── dto/
    ├── create-configuracion-aseo.dto.ts
    └── update-configuracion-aseo.dto.ts
```
**Endpoints necesarios:**

- `GET /configuracion-aseo`  - Obtener configuración actual
- `PUT /configuracion-aseo`  - Actualizar configuración (solo ADMINISTRADOR)
#### 1.2 Módulo de Zonas Comunes
```
src/zonas-comunes/
├── zonas-comunes.controller.ts
├── zonas-comunes.service.ts
├── zonas-comunes.module.ts
└── dto/
    ├── create-zona-comun.dto.ts
    ├── update-zona-comun.dto.ts
    └── filtros-zona-comun.dto.ts
```
**Endpoints necesarios:**

- `GET /zonas-comunes`  - Listar zonas con paginación y filtros
- `GET /zonas-comunes/:id`  - Obtener zona específica
- `POST /zonas-comunes`  - Crear zona (ADMINISTRADOR)
- `PUT /zonas-comunes/:id`  - Actualizar zona (ADMINISTRADOR)
- `DELETE /zonas-comunes/:id`  - Eliminar zona (ADMINISTRADOR)
- `GET /zonas-comunes/piso/:piso`  - Obtener zonas por piso
### **FASE 2: Registros de Aseo (3-4 días)**
#### 2.1 Módulo de Registro Aseo Habitaciones
```
src/registro-aseo-habitaciones/
├── registro-aseo-habitaciones.controller.ts
├── registro-aseo-habitaciones.service.ts
├── registro-aseo-habitaciones.module.ts
└── dto/
    ├── create-registro-aseo-habitacion.dto.ts
    ├── update-registro-aseo-habitacion.dto.ts
    └── filtros-registro-aseo.dto.ts
```
**Endpoints necesarios:**

- `GET /registro-aseo-habitaciones`  - Listar registros con filtros y paginacion (ASEO, ADMINISTRADOR, CAJERO)
- `GET /registro-aseo-habitaciones/:id`  - Obtener registro específico (ASEO, ADMINISTRADOR, CAJERO)
- `POST /registro-aseo-habitaciones`  - Crear registro (ASEO, ADMINISTRADOR, CAJERO)
- `PUT /registro-aseo-habitaciones/:id`  - Actualizar registro (ASEO, ADMINISTRADOR, CAJERO)
- `GET /registro-aseo-habitaciones/habitacion/:habitacionId`  - Por habitación (ASEO, ADMINISTRADOR, CAJERO)
- `GET /registro-aseo-habitaciones/fecha/:fecha`  - Por fecha (ASEO, ADMINISTRADOR, CAJERO)
- `GET /registro-aseo-habitaciones/usuario/:usuarioId`  - Por usuario (ASEO, ADMINISTRADOR, CAJERO)
#### 2.2 Módulo de Registro Aseo Zonas Comunes
```
src/registro-aseo-zonas-comunes/
├── registro-aseo-zonas-comunes.controller.ts
├── registro-aseo-zonas-comunes.service.ts
├── registro-aseo-zonas-comunes.module.ts
└── dto/
    ├── create-registro-aseo-zona-comun.dto.ts
    ├── update-registro-aseo-zona-comun.dto.ts
    └── filtros-registro-zona.dto.ts
```
**Endpoints similares** a habitaciones pero para zonas comunes.

### **FASE 3: Reportes y Automatización (3-4 días)**
#### 3.1 Módulo de Reportes de Aseo
```
src/reportes-aseo/
├── reportes-aseo.controller.ts
├── reportes-aseo.service.ts
├── reportes-aseo.module.ts
└── dto/
    ├── generar-reporte.dto.ts
    └── filtros-reporte.dto.ts
```
**Endpoints necesarios:**

- `GET /reportes-aseo`  - Listar reportes con filtros
- `GET /reportes-aseo/:id`  - Obtener reporte específico
- `POST /reportes-aseo/generar`  - Generar reporte manual
- `GET /reportes-aseo/fecha/:fecha`  - Obtener reporte por fecha
- `GET /reportes-aseo/:id/pdf`  - Descargar reporte en PDF
#### 3.2 Dashboard de Aseo
```
src/dashboard-aseo/
├── dashboard-aseo.controller.ts
├── dashboard-aseo.service.ts
└── dashboard-aseo.module.ts
```
**Endpoints necesarios:**

- `GET /dashboard-aseo/resumen`  - Resumen del día actual
- `GET /dashboard-aseo/habitaciones-pendientes`  - Habitaciones que requieren aseo
- `GET /dashboard-aseo/zonas-pendientes`  - Zonas que requieren aseo
- `GET /dashboard-aseo/rotacion-colchones`  - Habitaciones próximas a rotación
### **FASE 4: Jobs Programados y Notificaciones (2-3 días)**
#### 4.1 Extensión del módulo Cron existente
Agregar al `src/cron/cron.service.ts`:

**Jobs necesarios:**

- **Diario (00:00)**: Marcar habitaciones/zonas que requieren aseo
- **Diario (18:00)**: Generar reporte diario automático
- **Diario (19:00)**: Enviar notificaciones de aseo pendiente
- **Semanal**: Calcular próximas rotaciones de colchones
### **FASE 5: Integración y Testing (1-2 días)**
- Actualizar `app.module.ts`  con todos los nuevos módulos
- Ejecutar migraciones de Prisma
- Testing de endpoints
- Validación de lógica de negocio
## 🎯 **ENDPOINTS CONSOLIDADOS POR MÓDULO**
### **ConfiguracionAseo (2 endpoints)**
- `GET /configuracion-aseo` 
- `PUT /configuracion-aseo` 
### **ZonasComunes (7 endpoints)**
- `GET /zonas-comunes` 
- `GET /zonas-comunes/:id` 
- `POST /zonas-comunes` 
- `PUT /zonas-comunes/:id` 
- `DELETE /zonas-comunes/:id` 
- `GET /zonas-comunes/piso/:piso` 
- `GET /zonas-comunes/requieren-aseo` 
### **RegistroAseoHabitaciones (8 endpoints)**
- `GET /registro-aseo-habitaciones` 
- `GET /registro-aseo-habitaciones/:id` 
- `POST /registro-aseo-habitaciones` 
- `PUT /registro-aseo-habitaciones/:id` 
- `GET /registro-aseo-habitaciones/habitacion/:habitacionId` 
- `GET /registro-aseo-habitaciones/fecha/:fecha` 
- `GET /registro-aseo-habitaciones/usuario/:usuarioId` 
- `GET /registro-aseo-habitaciones/pendientes` 
### **RegistroAseoZonasComunes (8 endpoints)**
- Misma estructura que habitaciones pero para zonas
### **ReportesAseo (5 endpoints)**
- `GET /reportes-aseo` 
- `GET /reportes-aseo/:id` 
- `POST /reportes-aseo/generar` 
- `GET /reportes-aseo/fecha/:fecha` 
- `GET /reportes-aseo/:id/pdf` 
### **DashboardAseo (4 endpoints)**
- `GET /dashboard-aseo/resumen` 
- `GET /dashboard-aseo/habitaciones-pendientes` 
- `GET /dashboard-aseo/zonas-pendientes` 
- `GET /dashboard-aseo/rotacion-colchones` 
## 📝 **RECOMENDACIONES**
1. **Mantén la estructura actual**: Tu organización de módulos es excelente
2. **Roles y permisos**: Utiliza los decoradores existentes (`@Roles()` ) 
3. **Validaciones**: Usa `class-validator`  como en los otros módulos
4. **Paginación**: Implementa el patrón de paginación existente
5. **Logging**: Usa el Logger de NestJS para debugging
6. **Testing**: Sigue el patrón de testing existente


