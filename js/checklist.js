const progresoNumero = document.getElementById('progreso-numero');
const checklist = document.querySelectorAll('#lista-checklist input[type="checkbox"]');

function actualizar() {
    const seleccionados = document.querySelectorAll(
        '#lista-checklist input[type="checkbox"]:checked'
    ).length;

    progresoNumero.textContent = `${seleccionados} de ${checklist.length}`;
}

checklist.forEach((checkbox) => {
    checkbox.addEventListener('change', actualizar);
});

document.getElementById('reiniciar-checklist').addEventListener('click', () => {
    checklist.forEach((checkbox) => {
        checkbox.checked = false;
    });
    actualizar();
});

actualizar();