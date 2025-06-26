# 🏨 Hotel San Miguel - Sistema de Gestión Hotelera Integral

**🚧 Proyecto en desarrollo activo 🚧**

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

## 📋 Descripción

**Hotel San Miguel** es un sistema de gestión hotelera integral desarrollado con tecnologías modernas y escalables. Diseñado específicamente para hoteles que requieren cumplimiento con normativas gubernamentales Colombianas, el sistema ofrece una solución completa para la administración hotelera con funcionalidades avanzadas de aseo, analytics y integraciones oficiales.

---

## ✨ Características Principales

### 🏢 **Gestión Hotelera Completa**
- **Reservas Inteligentes**: Sistema completo de reservas con gestión de disponibilidad y precios dinámicos
- **Huéspedes Primarios y Secundarios**: Manejo detallado de información de huéspedes con validaciones gubernamentales
- **Habitaciones Multi-tipo**: Soporte para apartamentos, suites, habitaciones dobles, camping y más
- **Facturación Automatizada**: Sistema de facturación integrado con analytics financieros

### 🧹 **Sistema de Aseo Profesional**
- **Módulo de Aseo Avanzado**: Control completo de limpieza, desinfección y rotación de colchones
- **Programación Automática**: Cron jobs que programan tareas de aseo según configuraciones personalizables
- **Zonas Comunes**: Gestión independiente del aseo de áreas comunes del hotel
- **Reportes de Aseo**: Dashboard de reportes con métricas de limpieza y cumplimiento
- **Notificaciones**: Sistema de alertas para tareas pendientes y vencimientos

### 📊 **Analytics y Reportes**
- **Ingresos Diarios/Mensuales**: Análisis financiero detallado con promedios y tendencias
- **Dashboards Ejecutivos**: Métricas en tiempo real para toma de decisiones
- **Reportes Personalizables**: Generación de reportes por rangos de fechas específicos
- **Análisis de Ocupación**: Estadísticas de ocupación por tipo de habitación

### 🇦🇷 **Integraciones Gubernamentales**
- **TRA (TARJETA DE REGISTRO DE ALOJAMIENTO)**: Integración con la plataforma oficial de turismo
- **SIRE (Sistema de Información y Reporte de Extranjeros)**: Cumplimiento automático de reportes migratorios
- **Generación de Documentos**: Automatización de documentos oficiales requeridos

### 🔐 **Seguridad y Autenticación**
- **JWT Authentication**: Sistema de autenticación seguro con roles granulares
- **Control de Acceso por Roles**: Administrador, Cajero, Aseo, Registro de Formularios
- **Blacklist de Tokens**: Gestión segura de sesiones y logout
- **Validación de Datos**: Validaciones robustas con class-validator

### 🔄 **Comunicación en Tiempo Real**
- **Server-Sent Events (SSE)**: Actualizaciones en tiempo real de habitaciones y reservas
- **Notificaciones Push**: Sistema de notificaciones para eventos críticos
- **Formularios Dinámicos**: Enlaces temporales para registro de huéspedes externos

---

## 🏗️ Arquitectura Técnica

### **Stack Tecnológico**
```typescript
Framework:     NestJS (v10) - Framework Node.js empresarial
Lenguaje:      TypeScript - Desarrollo type-safe
Base de Datos: PostgreSQL - Base de datos relacional robusta
ORM:           Prisma - ORM moderno con type-safety
Contenedores:  Docker Compose - Orquestación de servicios
Documentación: Swagger/OpenAPI - API autodocumentada
Autenticación: JWT + bcryptjs - Seguridad empresarial
Validación:    class-validator + class-transformer
Web Scraping:  Puppeteer - Automatización de documentos
```

### **Arquitectura Modular**
El sistema está diseñado con una arquitectura modular basada en **Domain-Driven Design (DDD)**:

```
📁 Módulos Principales:
├── 🏠 Reservas & Habitaciones    → Gestión principal del hotel
├── 👥 Huéspedes & Documentos     → Gestión de clientes
├── 🧹 Sistema de Aseo            → Mantenimiento y limpieza
├── 📊 Analytics & Reportes       → Business Intelligence
├── 🔐 Autenticación & Usuarios   → Seguridad y acceso
├── 🇦🇷 Integraciones TRA/SIRE    → Compliance gubernamental
├── 📋 Formularios Dinámicos      → Registro externo
└── ⚡ Notificaciones & SSE       → Comunicación tiempo real
```

---

## 🚀 Características Avanzadas

### **1. Sistema de Aseo Inteligente**
```typescript
// Ejemplo de configuración de aseo
const configuracion = {
  hora_limite_aseo: "17:00",
  frecuencia_rotacion_colchones: 180, // días
  notificaciones_automaticas: true,
  zonas_comunes_frecuencia: 30 // días
}
```

### **2. Analytics Financieros**
```typescript
// Analytics disponibles
GET /analitics/daily-revenue/2024-01-15     // Ingresos diarios
GET /analitics/monthly-revenue/2024/1       // Ingresos mensuales
GET /analitics/invoices-range?start=&end=   // Facturas por rango
```

### **3. Gestión de Estados**
```typescript
// Estados de habitación dinámicos
enum EstadosHabitacion {
  LIBRE, OCUPADO, RESERVADO,
  EN_DESINFECCION, EN_MANTENIMIENTO, EN_LIMPIEZA
}
```

### **4. Roles de Usuario Granulares**
```typescript
enum Role {
  ADMINISTRADOR,    // Acceso completo al sistema
  CAJERO,          // Reservas, check-in/out, facturación
  ASEO,            // Módulo de limpieza y mantenimiento
  REGISTRO_FORMULARIO // Gestión de huespedes que ingresan a completar un formulario
}
```

---

## 🛠️ Instalación y Configuración

### **Prerrequisitos**
- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL (si no usa Docker)

### **Instalación Rápida**
```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/hotel-san-miguel.git
cd hotel-san-miguel

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Levantar base de datos con Docker
docker-compose up -d

# 5. Ejecutar migraciones
npx prisma migrate dev

# 6. Iniciar aplicación
npm run start:dev
```

### **Variables de Entorno**
```env
# Base de datos
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hotel-san-miguel"

# JWT
JWT_SECRET="tu-jwt-secret-super-seguro"

# Aplicación
PORT=3000
NODE_ENV=development
FRONT_ORIGIN=http://localhost:3001
```

---

## 📖 Documentación API

### **Swagger UI**
Una vez que la aplicación esté ejecutándose, accede a la documentación interactiva:
```
http://localhost:3000/api#
```
![image](https://github.com/user-attachments/assets/50fcc97f-cc22-4284-96a4-8c969b599c42)

### **Endpoints Principales**
```typescript
// Autenticación
POST   /auth/login           // Iniciar sesión
POST   /auth/logout          // Cerrar sesión
POST   /auth/validate        // Validar token

// Reservas
GET    /reservas             // Listar reservas (paginado)
POST   /reservas             // Crear reserva
GET    /reservas/:id         // Obtener reserva
PATCH  /reservas/:id         // Actualizar reserva
DELETE /reservas/:id         // Eliminar reserva (soft delete)

// Habitaciones
GET    /habitaciones         // Listar habitaciones
GET    /habitaciones/aseo    // Habitaciones con info de aseo
POST   /habitaciones         // Crear habitación
PATCH  /habitaciones/:id     // Actualizar habitación

// Aseo
GET    /registro-aseo-habitaciones     // Registros de aseo
POST   /registro-aseo-habitaciones     // Crear registro de aseo
GET    /configuracion-aseo             // Configuración de aseo
PUT    /configuracion-aseo             // Actualizar configuración

// Analytics
GET    /analitics/daily-revenue/:date           // Ingresos diarios
GET    /analitics/monthly-revenue/:year/:month  // Ingresos mensuales
GET    /analitics/invoices-range               // Facturas por rango
```

---

## 🎯 Casos de Uso Principales

### **1. Check-in de Huésped**
```typescript
// Flujo completo de check-in
1. Crear/buscar huésped
2. Validar documentación
3. Crear reserva
4. Asignar habitación
5. Generar factura
6. Reportar a SIRE (extranjeros)
7. Programar aseo post-checkout
```

### **2. Gestión de Aseo Diario**
```typescript
// Proceso automatizado de aseo
1. Cron job evalúa habitaciones (5:00 UTC)
2. Marca habitaciones que requieren aseo
3. Personal de aseo ve dashboard
4. Registra actividades realizadas
5. Sistema actualiza estados
6. Genera reportes de cumplimiento
```

### **3. Reportes Ejecutivos**
```typescript
// Analytics para administración
1. Ingresos diarios/mensuales
2. Ocupación por tipo de habitación
3. Eficiencia del personal de aseo
4. Compliance gubernamental
5. Tendencias de reservas
```

---

## 🧪 Testing

### **Ejecutar Tests**
```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:cov

# Tests e2e
npm run test:e2e

# Watch mode
npm run test:watch
```

### **Estructura de Testing**
- **Unit Tests**: Para servicios y lógica de negocio
- **Integration Tests**: Para controladores y endpoints

---

## 🔄 Flujos de Trabajo

### **CI/CD Pipeline**
```yaml
# Flujo recomendado
Development → Staging → Production
     ↓           ↓         ↓
   Testing    Integration  Deploy
```

### **Base de Datos**
```bash
# Migraciones
npx prisma migrate dev      # Desarrollo
npx prisma migrate deploy   # Producción

# Generar cliente
npx prisma generate

# Visualizar BD
npx prisma studio
```

---

## 📊 Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Líneas de Código** | ~15,000+ |
| **Módulos** | 20+ módulos funcionales |
| **Endpoints** | 100+ endpoints RESTful |
| **Migraciones** | 25+ migraciones de BD |
| **Tests** | 50+ tests automatizados |
| **Documentación** | 100% documentado con Swagger |

---
