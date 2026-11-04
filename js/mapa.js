// Crear el mapa.
const mapa = L.map("mapa-grande").setView([31.8, -116.0], 7);

// Agregar el mapa base.
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
}).addTo(mapa);

// Colores según el nivel de alerta.
const colores = {
    alta: "#c62828",
    media: "#ef8f1c",
    baja: "#2e9e5b"
};

// Cargar los sismos desde el archivo JSON.
async function cargarSismos() {

    try {

        const respuesta = await fetch("./data/sismos.json");

        if (!respuesta.ok) {
            throw new Error("Error HTTP " + respuesta.status);
        }

        const sismos = await respuesta.json();

        console.log("Sismos cargados:", sismos);

        // Crear un marcador por cada sismo.
        sismos.forEach(function (sismo) {

            L.circleMarker([sismo.lat, sismo.lon], {

                radius: sismo.magnitud * 3,
                color: colores[sismo.nivel] || "#777777",
                fillOpacity: 0.6

            })
            .addTo(mapa)
            .bindPopup(
                "<strong>" + sismo.lugar +
                "</strong><br>Magnitud " + sismo.magnitud
            );

        });

    } catch (error) {

        console.error("No se pudieron cargar los sismos:", error);

    }
}

// Ejecutar la carga.
cargarSismos();

// Ajustar el tamaño del mapa cuando se muestra su sección.
window.addEventListener("hashchange", function () {

    if (location.hash === "#mapa") {

        setTimeout(function () {
            mapa.invalidateSize();
        }, 100);

    }

});