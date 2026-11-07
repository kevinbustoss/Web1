const CLAVE_FAVORITOS = 'rickmorty:favoritos';

/**
 * Obtiene el arreglo de favoritos con tolerancia a fallos/basura en LocalStorage.
 */
export function obtenerFavoritos() {
  try {
    const datos = localStorage.getItem(CLAVE_FAVORITOS);
    if (!datos) return [];
    const parseados = JSON.parse(datos);
    return Array.isArray(parseados) ? parseados : [];
  } catch (e) {
    console.warn('Se detectaron datos no válidos en LocalStorage. Reiniciando favoritos.');
    return [];
  }
}

/**
 * Verifica si un personaje está guardado.
 */
export function esFavorito(id) {
  const favs = obtenerFavoritos();
  return favs.some(item => item.id === Number(id));
}

/**
 * Agrega o remueve un personaje de favoritos.
 */
export function alternarFavorito(personaje) {
  let favs = obtenerFavoritos();
  const index = favs.findIndex(item => item.id === personaje.id);
  
  if (index >= 0) {
    favs.splice(index, 1);
  } else {
    favs.push(personaje);
  }

  try {
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favs));
  } catch (e) {
    console.error('Error al guardar en LocalStorage:', e);
  }
  return index === -1; // Devuelve true si fue agregado, false si fue removido
}