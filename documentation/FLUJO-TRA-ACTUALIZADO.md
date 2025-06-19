# Flujo Actualizado de Integración TRA

## 📋 Resumen de Cambios

El flujo de trabajo ha sido reorganizado para separar la creación de formularios de la subida a TRA, dando mayor control sobre cuándo y cómo se envían los datos al sistema externo.

## 🔄 Nuevo Flujo de Trabajo

### 1. **Crear Formulario (Sin TRA)**
```
POST /registro-formulario/:token
```

**Comportamiento:**
- ✅ Crea el formulario completo en la base de datos
- ❌ NO sube automáticamente a TRA
- 📊 Retorna estado `traStatus: 'NOT_UPLOADED'`
- 💡 Notifica que se puede subir posteriormente

**Respuesta:**
```json
{
  "message": "Formulario registrado exitosamente",
  "data": {
    "formulario": { /* datos del formulario */ },
    "reserva": { /* datos de reserva */ },
    "huesped": { /* datos del huésped */ }
  },
  "traStatus": "NOT_UPLOADED",
  "notice": "El formulario ha sido creado pero no se ha subido a TRA. Use el endpoint POST /registro-formulario/tra/formulario/{id} para subirlo cuando sea necesario."
}
```

### 2. **Subir a TRA (Separado)**
```
POST /registro-formulario/tra/formulario/:id
```

**Comportamiento:**
- 🔍 Verifica que el formulario existe
- ⚠️ Valida que NO esté subido previamente a TRA
- 📤 Envía datos al servicio TRA
- 💾 Actualiza estado en base de datos
- 📝 Logging detallado del proceso

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Formulario subido exitosamente a TRA",
  "data": {
    "formulario": { /* formulario actualizado */ },
    "traData": { /* respuesta de TRA */ }
  },
  "traStatus": "UPLOADED"
}
```

**Respuesta de Error:**
```json
{
  "success": false,
  "message": "El formulario ya fue subido a TRA anteriormente con ID 1222",
  "error": "Error específico",
  "traStatus": "FAILED"
}
```

## 🛡️ Validaciones Implementadas

### En el Servicio de Registro:
1. **Formulario existe:** Verifica que el ID corresponde a un formulario válido
2. **No duplicación:** Impide subir formularios ya enviados a TRA
3. **Transacciones atómicas:** Garantiza consistencia de datos
4. **Logging detallado:** Rastrea todo el proceso para debugging

### En el Servicio TRA:
1. **Validación de respuesta:** Verifica estructura válida de TRA
2. **Manejo de errores HTTP:** Códigos específicos (400, 401, 403, 404, 500)
3. **Timeout handling:** Detecta problemas de conectividad
4. **Logging extensivo:** Registra request/response completos

## 📊 Estados del Formulario TRA

| Estado | Campo BD | Descripción |
|--------|----------|-------------|
| `NOT_UPLOADED` | `SubidoATra: false, traId: null` | Formulario creado, pendiente de subir |
| `UPLOADED` | `SubidoATra: true, traId: [ID_TRA]` | Subido exitosamente a TRA |
| `FAILED` | `SubidoATra: false, traId: null` | Falló la subida a TRA |

## 🔧 Mejoras en el TRA Service

### Logging Mejorado:
```typescript
// Antes
this.logger.debug(`Mock response from TRA endpoint: ${endpoint}`);

// Después  
this.logger.log(`=== INICIO PETICIÓN TRA ===`);
this.logger.log(`Endpoint: ${endpoint}`);
this.logger.log(`Headers: ${JSON.stringify(headers, null, 2)}`);
this.logger.log(`Payload: ${JSON.stringify(payload, null, 2)}`);
```

### Activación de Llamadas Reales:
```typescript
// Llamadas reales activadas (comentar el mock)
const { data } = await firstValueFrom(
  this.httpService.post(endpoint, payload, { headers }),
);

// Mock comentado para producción
// const data = { code: 1222 }; // Mock de respuesta
```

### Manejo de Errores Específicos:
```typescript
switch (error.response.status) {
  case 400: throw new Error(`Datos inválidos enviados a TRA`);
  case 401: throw new Error(`Token de autenticación TRA inválido`);
  case 403: throw new Error(`Acceso prohibido al servicio TRA`);
  case 404: throw new Error(`Endpoint TRA no encontrado`);
  case 500: throw new Error(`Error interno del servidor TRA`);
}
```

## 🎯 Beneficios del Nuevo Flujo

1. **Control Total:** El usuario decide cuándo subir a TRA
2. **Tolerancia a Fallos:** Formularios se guardan aunque TRA falle
3. **Debugging Mejorado:** Logs detallados para troubleshooting
4. **Prevención de Duplicados:** No permite subir dos veces el mismo formulario
5. **Feedback Claro:** Estados específicos y mensajes descriptivos

## 🧪 Para Testing

1. **Activar llamadas reales:** Descomentar línea en `postToTraEndpoint`
2. **Logs visibles:** Usar nivel `log` en lugar de `debug`
3. **Error handling:** Probar diferentes escenarios de fallo
4. **Validación de datos:** Verificar estructura de payload enviado

## 🚨 Cambios Requeridos para Producción

- [ ] Comentar mock y activar llamadas reales en TRA service
- [ ] Configurar logging level según ambiente
- [ ] Verificar credenciales de TRA están correctas
- [ ] Probar conectividad con endpoints de TRA
- [ ] Validar estructura de respuesta TRA en ambiente real 