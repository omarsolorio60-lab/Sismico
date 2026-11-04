function mostrarVista() {
    const id = location.hash.slice(1) || "inicio";
    
    document.querySelectorAll(".vista").forEach(function (vista) {
    vista.classList.toggle("activa", vista.id === id);
});

document.querySelectorAll(".bottom-nav a").forEach(function (enlace) {
    enlace.classList.toggle("activo", enlace.getAttribute("href") === "#" + id);
});;
}

window.addEventListener("hashchange", mostrarVista);
mostrarVista(); 

