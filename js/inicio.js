const sismosInicio = [
  { lugar: "Tijuana, B.C.", magnitud: 5.1, profundidad: 12, hora: "00:47:12", lat: 32.5149, lon: -117.0382, nivel: "alta" },
  { lugar: "Ensenada, B.C.", magnitud: 4.2, profundidad: 18, hora: "22:15:40", lat: 31.8667, lon: -116.6, nivel: "media" },
  { lugar: "Mexicali, B.C.", magnitud: 3.4, profundidad: 8, hora: "19:03:05", lat: 32.6245, lon: -115.4523, nivel: "baja" }
];

const coloresInicio = {
  alta: "#c62828",
  media: "#ef8f1c",
  baja: "#2e9e5b"
};

const contenedorMini = document.getElementById("mapa-mini");
contenedorMini.textContent = "";

const mapaMini = L.map(contenedorMini, { zoomControl: false });

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(mapaMini);

let marcadorMini = null;

function mostrarSismo(indice) {
  const sismo = sismosInicio[indice];

  document.getElementById("magnitud").textContent = sismo.magnitud.toFixed(1);
  document.getElementById("ubicacion").textContent = sismo.lugar;
  document.getElementById("profundidad").textContent = sismo.profundidad + " km";
  document.getElementById("hora").textContent = sismo.hora;

  mapaMini.setView([sismo.lat, sismo.lon], 8);

  if (marcadorMini) {
    marcadorMini.remove();
  }

  marcadorMini = L.circleMarker([sismo.lat, sismo.lon], {
    radius: sismo.magnitud * 3,
    stroke: false,
    fillColor: coloresInicio[sismo.nivel],
    fillOpacity: 0.8
  }).addTo(mapaMini);

  document.querySelectorAll(".lista-sismos .sismo").forEach(function (fila, i) {
    fila.classList.toggle("seleccionado", i === indice);
  });
}

document.querySelectorAll(".lista-sismos .sismo").forEach(function (fila, i) {
  fila.addEventListener("click", function () {
    mostrarSismo(i);
  });
});

window.addEventListener("hashchange", function () {
  if (location.hash === "" || location.hash === "#inicio") {
    setTimeout(function () {
      mapaMini.invalidateSize();
    }, 100);
  }
});

mostrarSismo(0);