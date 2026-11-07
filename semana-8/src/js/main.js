import { obtenerPersonajes, obtenerEpisodios } from './api.js';
import { obtenerFavoritos, esFavorito, alternarFavorito } from './favoritos.js';

// Estado global de la aplicación
const estado = {
  tabActual: 'characters',
  pagina: 1,
  totalPaginas: 1,
  nombre: '',
  status: '',
  personajesAcumulados: [],
  cargando: false
};

// Referencias al DOM
const dom = {
  cardsContainer: document.getElementById('cards-container'),
  loadingState: document.getElementById('loading-state'),
  errorState: document.getElementById('error-state'),
  errorMessage: document.getElementById('error-message'),
  retryBtn: document.getElementById('retry-btn'),
  emptyState: document.getElementById('empty-state'),
  emptyTitle: document.getElementById('empty-title'),
  emptyMessage: document.getElementById('empty-message'),
  cardCounter: document.getElementById('card-counter'),
  loadMoreBtn: document.getElementById('load-more-btn'),
  sectionTitle: document.getElementById('section-title'),
  searchInput: document.getElementById('search-input'),
  statusFilter: document.getElementById('status-filter'),
  searchBtn: document.getElementById('search-btn'),
  modal: document.getElementById('modal'),
  modalContent: document.getElementById('modal-content'),
  navLinks: document.querySelectorAll('.nav-link')
};

// --- FUNCIÓN CENTRAL DE CARGA (TRES ESTADOS) ---
async function cargar(reiniciar = true) {
  if (estado.cargando) return;
  estado.cargando = true;

  if (reiniciar) {
    estado.pagina = 1;
    estado.personajesAcumulados = [];
    dom.cardsContainer.innerHTML = '';
  }

  // Ocultar estados secundarios y mostrar loader
  dom.errorState.classList.add('hidden');
  dom.emptyState.classList.add('hidden');
  dom.loadingState.classList.remove('hidden');
  if (reiniciar) dom.loadMoreBtn.classList.add('hidden');

  try {
    // VISTA DE FAVORITOS
    if (estado.tabActual === 'favorites') {
      const favs = obtenerFavoritos();
      dom.loadingState.classList.add('hidden');
      estado.cargando = false;
      dom.sectionTitle.textContent = 'ESPECÍMENES FAVORITOS';
      
      if (favs.length === 0) {
        mostrarVacio('Sin favoritos en la Ciudadela', 'Aún no has marcado especímenes con el corazón. Explora la lista y marca tus favoritos con ❤️.');
        actualizarContador(0);
      } else {
        renderizarTarjetas(favs, 'characters');
        actualizarContador(favs.length);
      }
      dom.loadMoreBtn.classList.add('hidden');
      return;
    }

    // VISTA DE EPISODIOS
    if (estado.tabActual === 'episodes') {
      dom.sectionTitle.textContent = 'EPISODIOS DEL MULTIVERSO';
      const data = await obtenerEpisodios(estado.pagina);
      dom.loadingState.classList.add('hidden');
      estado.cargando = false;

      estado.totalPaginas = data.info.pages || 1;
      estado.personajesAcumulados = [...estado.personajesAcumulados, ...data.results];

      if (estado.personajesAcumulados.length === 0) {
        mostrarVacio('No hay episodios registrados', 'No se encontraron datos en este momento.');
      } else {
        renderizarTarjetas(estado.personajesAcumulados, 'episodes');
        actualizarContador(estado.personajesAcumulados.length);
        gestionarBotonCargarMas();
      }
      return;
    }

    // VISTA DE PERSONAJES
    dom.sectionTitle.textContent = 'ESPECÍMENES DEL MULTIVERSO';
    const data = await obtenerPersonajes({
      page: estado.pagina,
      name: estado.nombre,
      status: estado.status
    });

    dom.loadingState.classList.add('hidden');
    estado.cargando = false;

    estado.totalPaginas = data.info?.pages || 0;
    const nuevosResultados = data.results || [];
    estado.personajesAcumulados = [...estado.personajesAcumulados, ...nuevosResultados];

    if (estado.personajesAcumulados.length === 0) {
      mostrarVacio('No encontramos especímenes', 'No existe ninguna entidad multiversal que coincida con esos parámetros de búsqueda.');
      actualizarContador(0);
      dom.loadMoreBtn.classList.add('hidden');
    } else {
      renderizarTarjetas(estado.personajesAcumulados, 'characters');
      actualizarContador(estado.personajesAcumulados.length);
      gestionarBotonCargarMas();
    }

  } catch (error) {
    dom.loadingState.classList.add('hidden');
    estado.cargando = false;
    mostrarError(error.message || 'No pudimos conectar con el servidor.');
    dom.loadMoreBtn.classList.add('hidden');
  }
}

// --- RENDERIZADO DE TARJETAS ---
function renderizarTarjetas(lista, tipo) {
  dom.cardsContainer.innerHTML = '';
  
  lista.forEach(item => {
    const card = document.createElement('article');
    card.className = 'bg-space-card border border-space-border/30 rounded-xl overflow-hidden hover:border-space-neon/60 transition duration-300 shadow-md flex flex-col group relative';
    card.dataset.id = item.id;

    if (tipo === 'characters') {
      const fav = esFavorito(item.id);
      const statusColor = item.status === 'Alive' ? 'bg-green-500' : item.status === 'Dead' ? 'bg-red-500' : 'bg-gray-500';

      card.innerHTML = `
        <div class="relative overflow-hidden w-full h-52 bg-space-dark cursor-pointer action-detail">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" loading="lazy">
          <button data-fav="${item.id}" class="btn-fav absolute top-2 right-2 bg-space-dark/80 hover:bg-space-dark border border-space-neon text-lg w-9 h-9 rounded-full flex items-center justify-center transition shadow-neon-glow" title="Guardar en favoritos">
            ${fav ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="p-4 flex flex-col flex-grow justify-between gap-2 cursor-pointer action-detail">
          <div>
            <h3 class="font-bold text-lg text-white group-hover:text-space-neon transition line-clamp-1">${item.name}</h3>
            <div class="flex items-center gap-2 mt-1 text-xs">
              <span class="w-2 h-2 rounded-full ${statusColor}"></span>
              <span class="capitalize text-space-accent">${item.status} - ${item.species}</span>
            </div>
          </div>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="p-6 flex flex-col gap-3 justify-between h-full bg-space-card/80">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-space-portal bg-space-portal/10 px-2 py-1 rounded border border-space-portal/30">${item.episode}</span>
            <span class="text-xs text-space-accent/60">${item.air_date}</span>
          </div>
          <h3 class="text-base font-bold text-white">${item.name}</h3>
        </div>
      `;
    }

    dom.cardsContainer.appendChild(card);
  });
}

// --- DELEGACIÓN DE EVENTOS EN LA GRILLA ---
dom.cardsContainer.addEventListener('click', (e) => {
  const btnFav = e.target.closest('[data-fav]');
  if (btnFav) {
    e.stopPropagation();
    const id = Number(btnFav.dataset.fav);
    const personaje = estado.personajesAcumulados.find(p => p.id === id) || obtenerFavoritos().find(p => p.id === id);
    if (personaje) {
      const guardado = alternarFavorito(personaje);
      btnFav.textContent = guardado ? '❤️' : '🤍';
      if (estado.tabActual === 'favorites') {
        cargar(true);
      }
    }
    return;
  }

  const cardDetalle = e.target.closest('.action-detail');
  if (cardDetalle) {
    const card = cardDetalle.closest('article');
    const id = Number(card.dataset.id);
    const personaje = estado.personajesAcumulados.find(p => p.id === id) || obtenerFavoritos().find(p => p.id === id);
    if (personaje) abrirModal(personaje);
  }
});

// --- HELPER DE ESTADOS ---
function mostrarError(msj) {
  dom.errorMessage.textContent = msj;
  dom.errorState.classList.remove('hidden');
}

function mostrarVacio(titulo, msj) {
  dom.emptyTitle.textContent = titulo;
  dom.emptyMessage.textContent = msj;
  dom.emptyState.classList.remove('hidden');
}

function actualizarContador(cantidad) {
  dom.cardCounter.textContent = `Mostrando ${cantidad} especímenes`;
}

function gestionarBotonCargarMas() {
  if (estado.pagina < estado.totalPaginas) {
    dom.loadMoreBtn.classList.remove('hidden');
  } else {
    dom.loadMoreBtn.classList.add('hidden');
  }
}

// --- MODAL DE DETALLE ---
function abrirModal(char) {
  const statusColor = char.status === 'Alive' ? 'bg-green-500' : char.status === 'Dead' ? 'bg-red-500' : 'bg-gray-500';

  dom.modalContent.innerHTML = `
    <div class="relative w-full h-56 bg-space-dark"><img src="${char.image}" class="w-full h-full object-cover"></div>
    <div class="p-6 flex flex-col gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white">${char.name}</h2>
        <div class="flex items-center gap-2 mt-1 text-sm">
          <span class="w-2.5 h-2.5 rounded-full ${statusColor}"></span>
          <span class="capitalize text-space-accent">${char.status} - ${char.species}</span>
        </div>
      </div>
      <div class="bg-space-dark/80 p-4 rounded-xl border border-space-border/30 text-sm space-y-2">
        <p class="flex justify-between"><strong class="text-space-neon">Género:</strong> <span class="text-white">${char.gender}</span></p>
        <p class="flex justify-between"><strong class="text-space-neon">Origen:</strong> <span class="text-white truncate max-w-[180px]">${char.origin?.name || 'Desconocido'}</span></p>
        <p class="flex justify-between"><strong class="text-space-neon">Ubicación:</strong> <span class="text-white truncate max-w-[180px]">${char.location?.name || 'Desconocido'}</span></p>
      </div>
      <button id="close-modal-btn" class="w-full bg-space-dark hover:bg-space-border/20 border border-space-neon text-space-neon font-semibold py-2.5 rounded-xl transition shadow-neon-glow">Cerrar</button>
    </div>
  `;
  dom.modal.classList.remove('hidden');
  dom.modal.classList.add('flex');
  document.getElementById('close-modal-btn').onclick = () => dom.modal.classList.add('hidden');
}

dom.modal.onclick = (e) => { if (e.target === dom.modal) dom.modal.classList.add('hidden'); };

// --- EVENTOS DE INTERFAZ ---
dom.loadMoreBtn.onclick = () => {
  if (estado.pagina < estado.totalPaginas) {
    estado.pagina++;
    cargar(false); // Carga acumulativa
  }
};

dom.retryBtn.onclick = () => cargar(true);

dom.searchBtn.onclick = () => {
  estado.nombre = dom.searchInput.value.trim();
  estado.status = dom.statusFilter.value;
  cargar(true);
};

dom.searchInput.onkeypress = (e) => {
  if (e.key === 'Enter') {
    estado.nombre = dom.searchInput.value.trim();
    estado.status = dom.statusFilter.value;
    cargar(true);
  }
};

dom.statusFilter.onchange = () => {
  estado.nombre = dom.searchInput.value.trim();
  estado.status = dom.statusFilter.value;
  cargar(true);
};

// Navegación de pestañas
dom.navLinks.forEach(link => {
  link.onclick = (e) => {
    dom.navLinks.forEach(l => l.className = 'nav-link text-space-accent/70 hover:text-space-neon pb-1 transition');
    e.target.className = 'nav-link text-space-neon border-b-2 border-space-neon pb-1 transition font-semibold';
    estado.tabActual = e.target.dataset.tab;
    cargar(true);
  };
});

// Inicializar la aplicación
cargar(true);