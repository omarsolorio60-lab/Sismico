document.querySelectorAll(".pestana").forEach(function (boton) {
    boton.addEventListener("click", function () {
    const panel = boton.dataset.panel;

    document.querySelectorAll(".pestana").forEach(function (otro) {
        otro.classList.toggle("activa", otro === boton);
    });

    document.querySelectorAll(".guia-panel").forEach(function (contenido) {
        contenido.classList.toggle("activa", contenido.id === "panel-" + panel);
    });
});
});