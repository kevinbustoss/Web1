import { personajes } from './datos.js';
import { aplicarFiltros, buscarPorId } from './logica.js';

// Estado global de los filtros
const filtros = {
  texto: '',
  status: ''
};

// Referencias al DOM
const grilla = document.getElementById('grilla');
const formFiltros = document.getElementById('form-filtros');
const inputBuscador = document.getElementById('input-buscador');
const selectStatus = document.getElementById('select-status');
const contador = document.getElementById('contador');
const modalDetalle = document.getElementById('modal-detalle');

// Función de plantilla HTML con las clases de Tailwind originales de tu proyecto
function tarjetaHTML(personaje) {
  // Traducir el estado al formato visual de color con Tailwind
  let badgeClasses = "bg-emerald-100 text-emerald-700";
  let estadoTexto = personaje.status;
  
  if (personaje.status === "Dead" || personaje.status === "Muerto") {
    badgeClasses = "bg-rose-100 text-rose-700";
  } else if (personaje.status === "unknown" || personaje.status === "Desconocido") {
    badgeClasses = "bg-slate-200 text-slate-600";
  }

  return `
    <article class="flex flex-col overflow-hidden rounded-2xl bg-white shadow group transition hover:-translate-y-1 hover:shadow-xl">
      <div class="overflow-hidden">
        <img src="${personaje.image}" alt="${personaje.name}" class="aspect-square w-full object-cover transition group-hover:scale-105">
      </div>
      <div class="flex flex-1 flex-col gap-2 p-4">
        <h3 class="text-lg font-bold text-slate-900">${personaje.name}</h3>
        <span class="w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClasses}">● ${estadoTexto}</span>
        <p class="text-sm text-slate-500">${personaje.species} · ${personaje.origin?.name || 'unknown'}</p>
        <button type="button" class="btn-detalle mt-auto rounded-lg bg-indigo-600 py-2 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" data-id="${personaje.id}">
          Ver detalle
        </button>
      </div>
    </article>
  `;
}

// Función principal de Renderizado
function render() {
  const listaFiltrada = aplicarFiltros(personajes, filtros);

  // Actualizar contador con el formato original
  if (contador) {
    contador.textContent = `${listaFiltrada.length} de ${personajes.length} personajes`;
  }

  // Renderizar o mostrar estado vacío
  if (listaFiltrada.length === 0) {
    grilla.innerHTML = `<p class="col-span-full text-center py-8 text-slate-500">No se encontraron personajes que coincidan con tu búsqueda.</p>`;
    return;
  }

  grilla.innerHTML = listaFiltrada.map(tarjetaHTML).join('');
}

// Prevenir envío de formulario e input del buscador
if (formFiltros) {
  formFiltros.addEventListener('submit', (e) => e.preventDefault());
}

if (inputBuscador) {
  inputBuscador.addEventListener('input', (e) => {
    filtros.texto = e.target.value;
    render();
  });
}

// Listener del Select de filtro por categoría
if (selectStatus) {
  selectStatus.addEventListener('change', (e) => {
    filtros.status = e.target.value;
    render();
  });
}

// Delegación de eventos en la grilla para el modal de Tailwind existente en tu HTML
if (grilla) {
  grilla.addEventListener('click', (e) => {
    const boton = e.target.closest('.btn-detalle');
    if (!boton) return;

    const id = boton.dataset.id;
    const personaje = buscarPorId(personajes, id);

    if (personaje && modalDetalle) {
      const modalNombre = document.getElementById('modal-nombre');
      const modalImg = document.getElementById('modal-img');
      const modalEstado = document.getElementById('modal-estado');
      const modalEspecie = document.getElementById('modal-especie');
      const modalOrigen = document.getElementById('modal-origen');
      const modalUbicacion = document.getElementById('modal-ubicacion');

      if (modalNombre) modalNombre.textContent = personaje.name;
      if (modalImg) {
        modalImg.src = personaje.image;
        modalImg.alt = personaje.name;
      }
      if (modalEstado) modalEstado.textContent = personaje.status;
      if (modalEspecie) modalEspecie.textContent = personaje.species;
      if (modalOrigen) modalOrigen.textContent = personaje.origin?.name || 'unknown';
      if (modalUbicacion) modalUbicacion.textContent = personaje.location?.name || 'unknown';

      modalDetalle.showModal();
    }
  });
}

// Clic en el fondo oscuro del modal para cerrarlo
if (modalDetalle) {
  modalDetalle.addEventListener('click', function (e) {
    if (e.target === modalDetalle) modalDetalle.close();
  });
}

// Render inicial al cargar la página
render();