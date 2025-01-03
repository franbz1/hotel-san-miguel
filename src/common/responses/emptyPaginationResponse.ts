/**
 * Respuesta de paginación vacía.
 * @param page Página actual.
 * @param limit Límite de registros por página.
 * @param total Número total de elementos (opcional).
 * @param lastPage Última página (opcional).
 * @returns Objeto con datos vacíos y metadatos de paginación.
 */
export default function emptyPaginationResponse(
  page: number,
  limit: number,
  total: number,
  lastPage: number,
) {
  return { data: [], meta: { page, limit, total, lastPage } };
}
