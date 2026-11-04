// ==========================================
// 1. CONFIGURACIÓN
// ==========================================

// Ruta del JSON original de Semana 9.
const RUTA_JSON = "./data/datos_sismicos_web.json";

// Criterios provisionales del semáforo.
const FACTOR_AMARILLO = 2;
const FACTOR_ROJO = 3;

const textosNivel = {
    rojo: "ALERTA: evento registrado",
    naranja: "PRECAUCIÓN: actividad moderada",
    verde: "NORMAL: sin alerta registrada"
};

let graficaSenal = null;


// ==========================================
// 2. CALCULAR LOS UMBRALES
// ==========================================

function calcularUmbrales(datos) {

    const alerta = datos.alerta;

    if (!alerta) {
        return null;
    }

    const amplitudPico = Number(alerta.pico_amplitud_cuentas);
    const vecesSobreRuido = Number(alerta.veces_sobre_ruido);

    if (
        !Number.isFinite(amplitudPico) ||
        !Number.isFinite(vecesSobreRuido) ||
        amplitudPico <= 0 ||
        vecesSobreRuido <= 0
    ) {
        return null;
    }

    // Estimar el nivel de ruido a partir de la relación señal/ruido.
    const ruidoEstimado = amplitudPico / vecesSobreRuido;

    // Calcular los umbrales amarillo y rojo.
    const umbralAmarillo = ruidoEstimado * FACTOR_AMARILLO;
    const umbralRojo = ruidoEstimado * FACTOR_ROJO;

    return {
        ruidoEstimado: ruidoEstimado,
        umbralAmarillo: umbralAmarillo,
        umbralRojo: umbralRojo
    };
}


// ==========================================
// 3. DETERMINAR EL NIVEL DE ALERTA
// ==========================================

function nivelDeAlerta(datos) {

    const alerta = datos.alerta;
    const umbrales = calcularUmbrales(datos);

    if (!alerta || !umbrales) {
        return "verde";
    }

    const vecesSobreRuido = Number(alerta.veces_sobre_ruido);

    // Rojo: tres veces el nivel de ruido o más.
    if (vecesSobreRuido >= FACTOR_ROJO) {
        return "rojo";
    }

    // Amarillo: desde dos veces el nivel de ruido.
    if (vecesSobreRuido >= FACTOR_AMARILLO) {
        return "naranja";
    }

    // Verde: actividad por debajo del nivel amarillo.
    return "verde";
}


// ==========================================
// 4. MOSTRAR EL SEMÁFORO Y LOS INDICADORES
// ==========================================

function mostrarSemaforo(datos) {

    const nivel = nivelDeAlerta(datos);
    const umbrales = calcularUmbrales(datos);

    const luces = {
        rojo: "luz-roja",
        naranja: "luz-naranja",
        verde: "luz-verde"
    };

    // Encender la luz correspondiente.
    Object.keys(luces).forEach(function (color) {

        const luz = document.getElementById(luces[color]);

        if (luz) {
            luz.classList.toggle("encendida", color === nivel);
        }
    });

    // Mostrar el mensaje de alerta.
    const estado = document.getElementById("estado-alerta");

    if (estado) {
        estado.textContent = textosNivel[nivel];
        estado.className = "estado-alerta " + nivel;
    }

    const alerta = datos.alerta;

    // Mostrar la amplitud máxima.
    const amplitud = document.getElementById("pico-amplitud");

    if (amplitud) {
        amplitud.textContent = alerta
            ? Number(alerta.pico_amplitud_cuentas).toLocaleString("es-MX") + " cuentas"
            : "No disponible";
    }

    // Mostrar la hora del pico.
    const hora = document.getElementById("pico-hora");

    if (hora) {
        hora.textContent = alerta && alerta.hora_iso8601
            ? new Date(alerta.hora_iso8601).toISOString().slice(11, 19)
            : "No disponible";
    }

    // Mostrar la relación señal/ruido.
    const desviacion = document.getElementById("pico-desviacion");

    if (desviacion) {
        desviacion.textContent = alerta
            ? Number(alerta.veces_sobre_ruido).toLocaleString("es-MX") + " veces sobre ruido"
            : "No disponible";
    }

    // Mostrar el umbral rojo calculado.
    const umbral = document.getElementById("pico-umbral");

    if (umbral) {
        umbral.textContent = umbrales
            ? umbrales.umbralRojo.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + " cuentas"
            : "No disponible";
    }

}


// ==========================================
// 5. BUSCAR EL PUNTO MÁS CERCANO AL PICO
// ==========================================

function buscarIndicePico(serie, tiempoPico) {

    if (
        !Number.isFinite(Number(tiempoPico)) ||
        serie.length === 0
    ) {
        return -1;
    }

    let indiceCercano = -1;
    let diferenciaMenor = Infinity;

    serie.forEach(function (punto, indice) {

        const diferencia = Math.abs(
            Number(punto.t) - Number(tiempoPico)
        );

        if (diferencia < diferenciaMenor) {
            diferenciaMenor = diferencia;
            indiceCercano = indice;
        }

    });

    return indiceCercano;
}


// ==========================================
// 6. DIBUJAR LA GRÁFICA DE AMPLITUD VS. TIEMPO
// ==========================================

function dibujarGrafica(datos) {

    const serie = datos.serie;

    if (!serie || serie.length === 0) {
        throw new Error("No hay datos en la serie temporal.");
    }

    // Convertir el tiempo Unix a horas UTC.
    const etiquetas = serie.map(function (punto) {

        return new Date(Number(punto.t))
            .toISOString()
            .slice(11, 19);

    });

    // Buscar el punto más cercano a la hora del pico.
    const indicePico = buscarIndicePico(
        serie,
        datos.alerta ? datos.alerta.hora_epoch_ms : null
    );

    // Identificar la amplitud extrema del punto.
    let valorPico = null;

    if (indicePico !== -1) {

        const punto = serie[indicePico];

        valorPico =
            Math.abs(Number(punto.max)) >= Math.abs(Number(punto.min))
                ? Number(punto.max)
                : Number(punto.min);

    }

    // Crear los datos del marcador del pico.
    const marcadorPico = serie.map(function (punto, indice) {

        return indice === indicePico
            ? valorPico
            : null;

    });

    const elementoGrafica = document.getElementById("grafica-senal");

    if (!elementoGrafica) {
        throw new Error("No se encontró grafica-senal.");
    }

    if (typeof Chart === "undefined") {
        throw new Error("No se encontró la librería Chart.js.");
    }

    // Evitar crear varias gráficas encima de la anterior.
    if (graficaSenal) {
        graficaSenal.destroy();
    }

    // Crear la gráfica.
    graficaSenal = new Chart(elementoGrafica, {

        type: "line",

        data: {

            labels: etiquetas,

            datasets: [

                {
                    label: "Máximo por segundo",

                    data: serie.map(function (punto) {
                        return Number(punto.max);
                    }),

                    borderColor: "#800000",
                    backgroundColor: "rgba(128, 0, 0, 0.15)",
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: false
                },

                {
                    label: "Mínimo por segundo",

                    data: serie.map(function (punto) {
                        return Number(punto.min);
                    }),

                    borderColor: "#ef8f1c",
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: false
                },

                {
                    label: "Pico máximo",

                    data: marcadorPico,

                    showLine: false,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    backgroundColor: "#c62828",
                    borderColor: "#c62828"
                }

            ]

        },

        options: {

            responsive: true,
            maintainAspectRatio: false,
            animation: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {

                legend: {
                    position: "bottom"
                }

            },

            scales: {

                x: {

                    title: {
                        display: true,
                        text: "Tiempo (UTC)"
                    },

                    ticks: {
                        maxTicksLimit: 8,
                        maxRotation: 0
                    }

                },

                y: {

                    title: {
                        display: true,
                        text: "Amplitud (cuentas)"
                    }

                }

            }

        }

    });

}


// ==========================================
// 7. CARGAR DATOS DE SEMANA 9 MEDIANTE FETCH
// ==========================================

async function cargarDatos() {

    try {

        // Solicitar el archivo JSON.
        const respuesta = await fetch(RUTA_JSON);

        if (!respuesta.ok) {
            throw new Error("Error HTTP " + respuesta.status);
        }

        // Convertir la respuesta a JSON.
        const datos = await respuesta.json();

        console.log("Datos originales de Semana 9:", datos);

        // Comprobar que exista una serie temporal.
        if (!Array.isArray(datos.serie)) {
            throw new Error("El JSON no contiene una serie temporal válida.");
        }

        // Calcular y mostrar los umbrales en consola.
        const umbrales = calcularUmbrales(datos);

        console.log("Umbrales calculados:", umbrales);

        console.log("Nivel de alerta:", nivelDeAlerta(datos));

        // Mostrar estación y cantidad de puntos.
        const estacion = document.getElementById("estacion-texto");

        if (estacion) {

            estacion.textContent =
                "Estación " + datos.estacion +
                " · " + datos.serie.length +
                " puntos · " + datos.resolucion_reducida_s +
                " segundo por muestra";

        }

        // Actualizar el semáforo y sus indicadores.
        mostrarSemaforo(datos);

        // Dibujar la gráfica.
        dibujarGrafica(datos);

    } catch (error) {

        console.error("No se pudieron cargar los datos:", error);

        const estacion = document.getElementById("estacion-texto");

        if (estacion) {
            estacion.textContent =
                "No se pudieron cargar los datos sísmicos.";
        }

        const estado = document.getElementById("estado-alerta");

        if (estado) {
            estado.textContent = "Sin datos";
            estado.className = "estado-alerta";
        }

    }

}


// ==========================================
// 8. EJECUTAR
// ==========================================

cargarDatos();