import 'aframe';
import 'locar-aframe';
import 'aframe-look-at-component';

let firstLocation = true;
const locarCamera = document.querySelector('[locar-camera]');
const scene = document.querySelector('a-scene');

const places = [
  {
    location: [-3.733442, -38.512584],
    title: 'Minha Casa'
  },
  {
    location: [-3.730604, -38.510667],
    title: 'Coco Bambu'
  },
  {
    location: [-3.732103, -38.511155],
    title: 'Forum'
  },
  {
    location: [-3.732816, -38.508997],
    title: 'McDonalds'

  },
  {
    location: [-3.729904, -38.512795],
    title: 'Cangaceiro'
  }
];

locarCamera.addEventListener('gpsupdate', e => {
  // Default location is lat 0, lon 0 so ignore gpsupdate if for this location
  if (e.detail.position.coords.latitude != 0 && e.detail.position.coords.longitude != 0 && firstLocation) {
    let pin_id = 1;
    for (const place of places) {
      const distancia = Math.round(distanciaMetros(
        place.location[0],
        place.location[1],
        e.detail.position.coords.latitude,
        e.detail.position.coords.longitude));

      if (Math.round(distancia) < 10) {
        continue;
      } else {
        //Pin
        const pin = document.createElement("a-entity");
        pin.setAttribute('id', `pin-${pin_id}`);
        pin.setAttribute('pin-onibus', `text:${distancia}m`);
        pin.setAttribute("look-at", "[camera]")
        pin.setAttribute("locar-entity-place", {
          latitude: place.location[0],
          longitude: place.location[1],
        });
        pin.setAttribute('scale', '50 50 50');
        scene.appendChild(pin);
      }
      pin_id++;
    }
    firstLocation = false;
  } else {
    // Atualiza distancias
    let pin_id = 1;
    for (const place of places) {
      const pin_text = document.querySelector(`#pin-${pin_id} a-text`);
      const distancia = Math.round(distanciaMetros(
        place.location[0],
        place.location[1],
        e.detail.position.coords.latitude,
        e.detail.position.coords.longitude));
      pin_text.setAttribute('value', `${distancia}m`);
      pin_id++;
    }
  }
});

/* COMPONENTE TAG TEXT */
AFRAME.registerComponent('tag-text', {
  schema: {
    text: { default: "Texto" },
    width: { default: 1 },
    height: { default: 0.3 },
    background: { default: "#222" },
    color: { default: "#000" }
  },
  init: function () {
    const d = this.data;

    // Cria bordar e define cor
    const border = document.createElement('a-plane');
    border.setAttribute('width', d.width + 0.05);
    border.setAttribute('height', d.height + 0.05);
    border.setAttribute('color', d.color);
    border.setAttribute('position', '0 0 -.01');

    // Cria fundo do texto branco
    const bg = document.createElement('a-plane');
    bg.setAttribute('width', d.width);
    bg.setAttribute('height', d.height);
    bg.setAttribute('color', '#FFF');

    // Cria o texto
    const txt = document.createElement('a-text');
    txt.setAttribute('value', d.text);
    txt.setAttribute('color', d.color);
    txt.setAttribute('align', 'center');
    txt.setAttribute('position', `0 0 0.01`);

    //this.el.appendChild(border);
    this.el.appendChild(bg);
    this.el.appendChild(txt);
  }
});

/* COMPONENTE PIN-ONIBUS */
AFRAME.registerComponent('pin-onibus', {
  schema: {
    text: { default: "Texto" },
    width: { default: 1 },
  },
  init: function () {
    const d = this.data;

    /* Elemento 3D */
    const pin = document.createElement('a-entity')
    pin.setAttribute('gltf-model', 'url(map_pin.glb)')
    this.el.appendChild(pin);

    /* Placa de Onibus */
    const placa = document.createElement('a-circle');
    placa.setAttribute('position', '0 0.07 -0.05');
    placa.setAttribute('radius', '0.15');
    placa.setAttribute('material', 'src: #placa-onibus; color: white; shader: standard; repeat: 1 1; side: double')
    this.el.appendChild(placa);

    /* Tag com texto */
    const tag = document.createElement('a-entity');
    tag.setAttribute('position', '0 -.18 .1');
    tag.setAttribute('scale', '.4 .4 .4');
    tag.setAttribute('tag-text', `text:${d.text}; width: ${d.width};`)
    this.el.appendChild(tag);
  }
});

/* Função Auxiliar */
function distanciaMetros(lat1, lng1, lat2, lng2) {
  const R = 6371000; // raio da Terra em metros
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distância em metros
}

function calcularCoordenadaAfastada(lat1, lon1, lat2, lon2, distanciaMetros) {
  // Raio médio da Terra em METROS
  const RAIO_TERRA_M = 6371000;

  // --- 1. Funções Auxiliares para Conversão ---

  const toRad = (graus) => (graus * Math.PI) / 180;
  const toDeg = (radianos) => (radianos * 180) / Math.PI;

  // Converte as coordenadas de graus para radianos
  const phi1 = toRad(lat1);
  const lambda1 = toRad(lon1);
  const phi2 = toRad(lat2);
  const lambda2 = toRad(lon2);

  // --- 2. Calcular o Rumo (Azimuth) de P2 para P1 ---

  // Delta Longitude (diferença entre longitudes)
  const dLambda = lambda1 - lambda2;

  const y = Math.sin(dLambda) * Math.cos(phi1);
  const x = Math.cos(phi2) * Math.sin(phi1) -
    Math.sin(phi2) * Math.cos(phi1) * Math.cos(dLambda);

  // O rumo (bearing) é o ângulo do ponto P2 para P1
  let rumoRad = Math.atan2(y, x);

  // Normalizar o rumo para estar no intervalo [0, 2 * PI]
  if (rumoRad < 0) {
    rumoRad += (2 * Math.PI);
  }

  // --- 3. Calcular a Nova Coordenada (Ponto Final) ---

  // Distância angular (distância percorrida em radianos)
  // Usando RAIO_TERRA_M para que a unidade coincida com distanciaMetros
  const distanciaAngular = distanciaMetros / RAIO_TERRA_M;

  const novaLatRad = Math.asin(
    Math.sin(phi2) * Math.cos(distanciaAngular) +
    Math.cos(phi2) * Math.sin(distanciaAngular) * Math.cos(rumoRad)
  );

  let novaLonRad = lambda2 + Math.atan2(
    Math.sin(rumoRad) * Math.sin(distanciaAngular) * Math.cos(phi2),
    Math.cos(distanciaAngular) - Math.sin(phi2) * Math.sin(novaLatRad)
  );

  // Normalizar a longitude
  novaLonRad = (novaLonRad + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

  // --- 4. Retornar as Coordenadas em Graus ---

  return {
    latitude: toDeg(novaLatRad),
    longitude: toDeg(novaLonRad)
  };
}