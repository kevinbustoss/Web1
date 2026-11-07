/**
 * Realiza una petición HTTP y convierte la respuesta a JSON validando el estado de la red.
 */
async function pedirJSON(url) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`Error HTTP ${respuesta.status}: No se pudo consultar la API.`);
  }
  return await respuesta.json();
}

/**
 * Obtiene la lista de personajes con soporte para filtros y paginación.
 */
export async function obtenerPersonajes({ page = 1, name = '', status = '' } = {}) {
  const params = new URLSearchParams({ page });
  if (name) params.append('name', name);
  if (status) params.append('status', status);

  const url = `https://rickandmortyapi.com/api/character/?${params.toString()}`;
  return await pedirJSON(url);
}

/**
 * Obtiene la lista de episodios paginada.
 */
export async function obtenerEpisodios(page = 1) {
  const url = `https://rickandmortyapi.com/api/episode/?page=${page}`;
  return await pedirJSON(url);
}