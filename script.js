const botones = document.querySelectorAll('.btn-pedir');
const lista = document.getElementById('lista-pedido');
const totalTexto = document.getElementById('total');
const botonVaciar = document.getElementById('vaciar');

let total = 0;

botones.forEach(function(boton) {
    boton.addEventListener('click', function() {
        const nombre = boton.parentElement.querySelector('h3').textContent;
        const precio = Number(boton.dataset.precio);

        const item = document.createElement('li');
        item.textContent = nombre + ' - Q' + precio;
        lista.appendChild(item);

        total = total + precio;
        totalTexto.textContent = 'Total: Q' + total;
    });
});

botonVaciar.addEventListener('click', function() {
    lista.innerHTML = '';
    total = 0;
    totalTexto.textContent = 'Total: Q0';
});