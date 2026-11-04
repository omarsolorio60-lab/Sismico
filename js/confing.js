const rangoMagnitud = document.getElementById("rango-magnitud");
const rangoRadio = document.getElementById("rango-radio");

rangoMagnitud.addEventListener("input", function () {
    document.getElementById("valor-magnitud").textContent =
    Number(rangoMagnitud.value).toFixed(1) + " Mw";
});

rangoRadio.addEventListener("input", function () {
    document.getElementById("valor-radio").textContent = rangoRadio.value + " km";
});