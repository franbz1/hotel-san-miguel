import { getSchemaPath } from '@nestjs/swagger';

/**
 * Genera un schema de respuesta paginada para Swagger
 */
export function createPaginatedResponseSchema(
  entityClass: any,
  totalFieldName: string,
) {
  return {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: { $ref: getSchemaPath(entityClass) },
      },
      meta: {
        type: 'object',
        properties: {
          page: {
            type: 'number',
            description: 'Página actual',
          },
          limit: {
            type: 'number',
            description: 'Límite por página',
          },
          [totalFieldName]: {
            type: 'number',
            description: `Total de ${getEntityDisplayName(totalFieldName)}`,
          },
          lastPage: {
            type: 'number',
            description: 'Última página',
          },
        },
      },
    },
  };
}

/**
 * Obtiene el nombre de visualización de la entidad basado en el campo total
 */
function getEntityDisplayName(totalFieldName: string): string {
  const displayNames: Record<string, string> = {
    totalUsuarios: 'usuarios',
    totalHabitaciones: 'habitaciones',
    totalHuespedes: 'huéspedes',
    totalHuespedesSecundarios: 'huéspedes secundarios',
    totalReservas: 'reservas',
    totalFacturas: 'facturas',
    totalFormularios: 'formularios',
    total: 'elementos',
  };

  return displayNames[totalFieldName] || 'elementos';
}

/**
 * Decorador de respuesta paginada estándar
 */
export function createPaginatedApiResponse(
  entityClass: any,
  totalFieldName: string,
  description?: string,
) {
  const defaultDescription = `Lista paginada de ${getEntityDisplayName(totalFieldName)} con metadatos`;

  return {
    status: 200,
    description: description || defaultDescription,
    schema: createPaginatedResponseSchema(entityClass, totalFieldName),
  };
}

/**
 * Query de página para documentación
 */
export const PAGE_QUERY = {
  name: 'page',
  description: 'Número de página (por defecto: 1)',
  required: false,
  type: Number,
  example: 1,
};

/**
 * Query de límite para documentación
 */
export const LIMIT_QUERY = {
  name: 'limit',
  description: 'Límite de resultados por página (por defecto: 10)',
  required: false,
  type: Number,
  example: 10,
};

/**
 * Respuesta de error de autenticación
 */
export const AUTH_INVALID_RESPONSE = {
  status: 401,
  description: 'Token de autenticación inválido',
};

/**
 * Respuesta de error de permisos
 */
export const PERMISSIONS_RESPONSE = {
  status: 403,
  description: 'Sin permisos suficientes',
};
