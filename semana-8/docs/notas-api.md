# Notas de la API - Rick and Morty

## 1. URL de la lista principal
`https://rickandmortyapi.com/api/character`

## 2. Ubicación del array de datos
El array con la lista de personajes está ubicado en la propiedad `results` de la respuesta JSON (`datos.results`).

## 3. Navegación a la siguiente página
La URL para la página siguiente se encuentra en la propiedad `info.next` (`datos.info.next`). La API implementa paginación tradicional basada en parámetros de consulta (`?page=2`).

## 4. Detalle de elementos
Cada objeto dentro del array `results` contiene la información suficiente para maquetar la tarjeta básica (`name`, `status`, `species`, `image`, `origin`, `location`). Para consultar detalles adicionales de origen o episodios específicos se pueden realizar peticiones secundarias si fuera requerido.

// profe te amo gracias 