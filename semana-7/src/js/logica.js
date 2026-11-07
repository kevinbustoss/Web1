/**
 * Aplica los filtros sobre la lista de personajes.
 * @param {Array} lista - Lista base de personajes.
 * @param {Object} filtros - Objeto con { texto: string, status: string }.
 * @returns {Array} Lista filtrada.
 */
export function aplicarFiltros(lista, filtros) {
  return lista.filter((personaje) => {
    const coincideNombre = personaje.name
      .toLowerCase()
      .includes(filtros.texto.toLowerCase().trim());

    const coincideStatus =
      filtros.status === "" || personaje.status === filtros.status;

    return coincideNombre && coincideStatus;
  });
}

/**
 * Busca un personaje por su id.
 * @param {Array} lista - Lista completa de personajes.
 * @param {number|string} id - ID a buscar.
 * @returns {Object|undefined}
 */
export function buscarPorId(lista, id) {
  return lista.find((personaje) => personaje.id === Number(id));
}