const catalogo = document.getElementById("catalogo");
const lista = document.getElementById("lista-pedido");
const totalTexto = document.getElementById("total");
const botonVaciar = document.getElementById("vaciar");

let pedido ={};

function dibujarPedido() {
    lista.innerHTML = "";
    let total = 0;

    for (const nombre in pedido) {
        const producto = pedido[nombre];
        const subtotal = producto.cantidad * producto.precio;
        total = total + subtotal;
        
        const item = document.createElement("li");
        item.textContent = nombre + " x" + producto.cantidad + " - Q" + subtotal;
        lista.appendChild(item);
    }

    totalTexto.textContent = "Total: Q" + total;
}

function agregarAlPedido(nombre, precio) {
    if (pedido[nombre]) {
        pedido[nombre].cantidad = pedido[nombre].cantidad + 1;
    } else {
        pedido[nombre] = { cantidad: 1, precio: precio };
    }
    dibujarPedido();
}

const NUMERO_WHATSAPP = "50233036333";
const botonEnviar = document.getElementById("enviar");
const modalidad = document.getElementById("modalidad");
const zona = document.getElementById("zona-cliente");

function actualizarZona(){
    zona.style.display = modalidad.value === "entrega" ? "block" : "none";
    }
    modalidad.addEventListener("change", actualizarZona);
    actualizarZona();

    botonEnviar.addEventListener("click", function () {
        console.log("click en enviar");
        if (Object.keys(pedido).length === 0) {
            alert("Agrega al menos un producto a tu pedido");
            return;
        }

        const nombreCliente = document.getElementById("nombre-cliente").value.trim();
        const telefono = document.getElementById("telefono-cliente").value.trim();
        const notas = document.getElementById("notas-cliente").value.trim();

        if (nombreCliente === "" || telefono === "") {
            alert("Escribe tu nombre y tu telefono");
            return;
        }
        if (modalidad.value === "entrega" && zona.value.trim() === ""){
            alert("Escribe la zona o direccion de entrega");
            return;
        }

        let mensaje = "Hola, quiero hacer este pedido: \n";
        let total = 0;

        for (const nombre in pedido) {
            const p = pedido[nombre];
            const subtotal = p.cantidad * p.precio;
            total = total + subtotal;
            mensaje += "- " + nombre + " x" + p.cantidad + " (Q" + subtotal + ")\n";
        }

        mensaje += "Total: Q" + total + "\n";
        mensaje += "Pago: al recibir o al recoger\n\n";
        mensaje += "Nombre: " + nombreCliente + "\n";
        mensaje += "Telefono: " + telefono + "\n";

        if (modalidad.value === "entrega") {
            mensaje += "Entrega en: " + zona.value.trim() + "\n";
        } else {
            mensaje += "Pasare a recoger\n";
        }

        if (notas !== "") {
            mensaje += "Notas: " + notas;
        }

        const enlace = "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(mensaje);
        window.open(enlace, "_black");
    });


const buscador = document.getElementById("buscador");
const sinResultados = document.getElementById("sin-resultados");

let todasLasFragancias = [];
let todosLosEnvases = [];

function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function dibujarCatalogo() {
    const busqueda = normalizar(buscador.value.trim());
    catalogo.innerHTML = "";

    const visibles = todasLasFragancias.filter(function (f) {
        const texto = normalizar(f.nombre_frgancia + " " + f.marca_fragancia);
        return texto.includes(busqueda);
    });

    sinResultados.style.display = visibles.length === 0 ? "block" : "none";

    visibles.forEach(function (f) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta";
        tarjeta.innerHTML = 
            "<h3>" + f.nombre_fragancia + "<h3>" + 
            "<p>Marca: " + f.marca_fragancia + "</p>";

        const selector = document.createElement("select");
        todosLosEnvases.forEach(function (e, indice) {
            const opcion = document.createElement("option");
            opcion.value = indice;
            opcion.textContent = e.dimension_envases + " ml - Q" + e.precio;
            selector.appendChild(opcion);
        });

        const boton = document.createElement("button");
        boton.className = "btn-pedir";
        boton.textContent = "Pedir";
        boton.addEventListener("click", function () {
            const envase = todosLosEnvases[selector.value];
            agregarAlPedido(
                f.nombre_fragancia = " " + envase.dimension_envases + " ml",
                Number(envase.precio)
    
            );
        });

        tarjeta.appendChild(selector);
        tarjeta.appendChild(boton);
        catalogo.appendChild(tarjeta);
    });

}

async function cargarCatalogo() {
    const resFrag = await fetch("http://localhost:3000/api/fragancias");
    todasLasFragancias = await resFrag.json();
    const resEnv = await fetch("http://localhost:3000/api/envases");
    todosLosEnvases = await resEnv.json();
    dibujarCatalogo();
}

buscador.addEventListener("input", dibujarCatalogo);

botonVaciar.addEventListener("click", function () {
    pedido = {};
    dibujarPedido();
});

cargarCatalogo();
