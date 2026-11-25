console.log("Script cargado correctamente");

const botones = document.querySelectorAll(".btn-pedir");
const lista = document.getElementById("lista-pedido");

botones.forEach(function(boton) {
    boton.addEventListener("click", function() {
        const tarjeta = boton.parentElement;
        const nombre = tarjeta.querySelector("h3").textContent;
        
       // aca hace la funcion de agregar a la lista de pedidos
        const item = document.createElement("li");
        item.textContent = nombre;
        lista.appendChild(item);
    });
});



