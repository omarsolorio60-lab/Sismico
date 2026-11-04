const hoy = new Date();

const registros = [
    { diasAtras: 0, lugar: "Tijuana", magnitud: 5.1, profundidad: 12 },
    { diasAtras: 1, lugar: "Ensenada", magnitud: 4.2, profundidad: 18 },
    { diasAtras: 2, lugar: "Mexicali", magnitud: 3.4, profundidad: 8 },
    { diasAtras: 4, lugar: "Tecate", magnitud: 3.8, profundidad: 15 },
    { diasAtras: 6, lugar: "Tijuana", magnitud: 4.5, profundidad: 22 },
    { diasAtras: 10, lugar: "Ensenada", magnitud: 5.3, profundidad: 25 },
    { diasAtras: 15, lugar: "Mexicali", magnitud: 3.1, profundidad: 6 },
    { diasAtras: 21, lugar: "Tecate", magnitud: 4.0, profundidad: 11 },
    { diasAtras: 28, lugar: "Tijuana", magnitud: 3.6, profundidad: 9 }
];

function formatoFecha(diasAtras) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - diasAtras);
    return fecha.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric"
});
}

function claseMagnitud(magnitud) {
    if (magnitud >= 5) return "magnitud-alta";
    if (magnitud >= 4) return "magnitud-media";
    return "magnitud-baja";
}

function cumpleProfundidad(profundidad, filtro) {
    if (filtro === "menos10") return profundidad < 10;
    if (filtro === "10a20") return profundidad >= 10 && profundidad <= 20;
    if (filtro === "mas20") return profundidad > 20;
    return true;
}

function mostrarHistorial() {
    const fecha = document.getElementById("filtro-fecha").value;
    const magnitudMinima = Number(document.getElementById("filtro-magnitud").value);
    const ubicacion = document.getElementById("filtro-ubicacion").value;
    const profundidad = document.getElementById("filtro-profundidad").value;


    const filtrados = registros.filter(function (registro) {
    const cumpleFecha = fecha === "todos" || registro.diasAtras < Number(fecha);
    const cumpleMagnitud = registro.magnitud >= magnitudMinima;
    const cumpleUbicacion = ubicacion === "todas" || registro.lugar === ubicacion;
    return cumpleFecha && cumpleMagnitud && cumpleUbicacion
    && cumpleProfundidad(registro.profundidad, profundidad);
});

const filas = filtrados.map(function (registro) {
    return "<tr>"
    + "<td>" + formatoFecha(registro.diasAtras) + "</td>"
    + "<td>" + registro.lugar + ", B.C.</td>"
    + "<td class='" + claseMagnitud(registro.magnitud) + "'>" + registro.magnitud.toFixed(1) + "</td>"
    + "<td>" + registro.profundidad + " km</td>"
    + "</tr>";
});

document.getElementById("tabla-historial").innerHTML = filas.length
    ? filas.join("")
    : "<tr><td colspan='4'>No hay sismos con esos filtros.</td></tr>";

document.getElementById("conteo-historial").textContent =
    "Mostrando " + filtrados.length + " registro(s) de ejemplo.";
}

document.querySelectorAll(".filtros select").forEach(function (select) {
select.addEventListener("change", mostrarHistorial);
});

mostrarHistorial();