import 'aframe';
import 'locar-aframe';
import 'aframe-look-at-component';

document.querySelectorAll('.toggle-info').forEach(a => {
  a.addEventListener('click', e=> {
    e.preventDefault();
    const info_panel = document.querySelector('.site-info');
    if (info_panel.classList.contains('visible')) {
      info_panel.classList.remove('visible')
    } else {
      info_panel.classList.add('visible')
    }
  }, false);
})

/* CONFIGURAÇÕES GERAIS */
const CONFIG = {
  API_URL: 'https://artecidade.com/wp-content/api-onibus/data.php',
  SEARCH_RADIUS: 500,
  MIN_DIST_RENDER: 10, // Distância mínima para renderizar o pin
  EARTH_RADIUS: 6371000
};

/* ESTADOS DA APLICAÇÃO */
const AppState = {
  isFirstLocation: true,
  paradas: [], // Vai armazenar dados + referências DOM
  userLat: null,
  userLng: null
};

/* REFERENCIA OBJETOS PRINCIPAIS DA APLICAÇÃO */
const scene = document.querySelector('a-scene');
const locarCamera = document.querySelector('[locar-camera]');

locarCamera.addEventListener('gpsupdate', async (e) => {
  const { latitude, longitude } = e.detail.position.coords;

  if (!latitude || !longitude) return;

  if (AppState.isFirstLocation) {
    AppState.userLat = latitude;
    AppState.userLng = longitude;
    AppState.isFirstLocation = false;
    const dadosApi = await carregaDadosApi(latitude, longitude, CONFIG.SEARCH_RADIUS);
    renderizarPins(dadosApi, latitude, longitude);

  } else {
    atualizarDistancias(latitude, longitude);
  }
});

/* FUNÇÃO PRINCIPAL - RENDERIZA OS PINS */
async function renderizarPins(dados, userLat, userLng) {
  console.log("Renderizando locais...", dados);

  AppState.paradas = dados.map((parada, index) => {
    const [pLat, pLng] = parada.location;
    const distancia = Math.round(distanciaMetros(pLat, pLng, userLat, userLng));

    if (distancia < CONFIG.MIN_DIST_RENDER) return null;

    // Cria o elemento pai (Pin)
    const pin = document.createElement("a-entity");
    pin.setAttribute('id', `pin-${index}`);
    pin.setAttribute('look-at', "[camera]");
    pin.setAttribute('locar-entity-place', { latitude: pLat, longitude: pLng });
    pin.setAttribute('scale', '100 100 100');

    // Componente customizado
    pin.setAttribute('pin-onibus', `text:${distancia}m; text2:${parada.title}`);

    scene.appendChild(pin);

    return {
      ...parada,
      elPin: pin, // Referência ao objeto 3D principal
      lastDistance: distancia
    };
  }).filter(p => p !== null); // Remove nulos (muito pertos)
}

function atualizarDistancias(userLat, userLng) {
  AppState.paradas.forEach(parada => {
    if (!parada.elPin) return;
    const [pLat, pLng] = parada.location;
    const novaDistancia = Math.round(distanciaMetros(pLat, pLng, userLat, userLng));
    if (novaDistancia !== parada.lastDistance) {
      parada.lastDistance = novaDistancia;
      const textEntity = parada.elPin.querySelector('[tag-text]');
      if (textEntity) {
        const textNode = textEntity.querySelector('a-text');
        if (textNode) textNode.setAttribute('value', `${novaDistancia}m`);
      }
    }
  });
}

/* FUNÇÃO PRINCIPAL - CARREGAR DADOS DA API */
async function carregaDadosApi(lat, lng, radius) {
  const apiUrl = `${CONFIG.API_URL}?lat=${lat}&lng=${lng}&raio=${radius}`;
  console.log(`Buscando: ${apiUrl}`);

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

    const data = await response.json();
    return data.pontos.map(item => ({
      location: [parseFloat(item.latitude), parseFloat(item.longitude)],
      title: item.nome
    }));

  } catch (error) {
    console.error("Erro API:", error);
    return [];
  }
}

/* FUNÇÃO DE SUPORTE - CALCULAR DISTÂNCIA */
function distanciaMetros(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return CONFIG.EARTH_RADIUS * c;
}


/* COMPONENTES PERSONALIZADOS AFRAME */
AFRAME.registerComponent('tag-text', {
  schema: {
    text: { default: "Texto" },
    width: { default: 1 },
    height: { default: 0.3 },
    background: { default: "#222" },
    color: { default: "#000" },
    bgColor: { default: "#FFF" }
  },
  init: function () {
    const d = this.data;
    const el = this.el;

    const bg = document.createElement('a-plane');
    Object.assign(bg, { width: d.width, height: d.height }); // Exemplo de assign direto se não for setAttribute
    bg.setAttribute('width', d.width);
    bg.setAttribute('height', d.height);
    bg.setAttribute('color', d.bgColor);

    const txt = document.createElement('a-text');
    txt.setAttribute('value', d.text);
    txt.setAttribute('color', d.color);
    txt.setAttribute('align', 'center');
    txt.setAttribute('position', '0 0 0.1');

    el.appendChild(bg);
    el.appendChild(txt);
  }
});

AFRAME.registerComponent('pin-onibus', {
  schema: {
    text: { default: "Texto" }, // Distância
    text2: { default: "Texto 2" }, // Nome
  },
  init: function () {
    const d = this.data;
    const el = this.el;

    // Modelo 3D
    const pin = document.createElement('a-entity');
    pin.setAttribute('gltf-model', 'url(map_pin.glb)');
    el.appendChild(pin);

    // Placa
    const placa = document.createElement('a-circle');
    placa.setAttribute('position', '0 0.07 -0.05');
    placa.setAttribute('radius', '0.15');
    placa.setAttribute('material', 'src: #placa-onibus; color: white; shader: standard; repeat: 1 1; side: double');
    el.appendChild(placa);

    const tagDistancia = document.createElement('a-entity');
    tagDistancia.setAttribute('position', '0 -.15 .1');
    tagDistancia.setAttribute('scale', '.4 .4 .4');
    tagDistancia.setAttribute('tag-text', `text:${d.text}; width: 1; color:#FFF; bgColor:#000`);
    el.appendChild(tagDistancia);
  }
});