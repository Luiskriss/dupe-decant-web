// ============================================================
// pedido.js - solo para pedido.html
// Muestra el carrito, deja cambiar cantidades y envía el pedido por WhatsApp.
// ============================================================

const listaPedido = document.getElementById("lista-pedido");
const resumenTotal = document.getElementById("resumen-total");
const panelDatos = document.getElementById("panel-datos");
const botonEnviar = document.getElementById("enviar");
const modalidad = document.getElementById("modalidad");
const campoZona = document.getElementById("campo-zona");
const zona = document.getElementById("zona-cliente");
const errorForm = document.getElementById("error-form");
const confirmacion = document.getElementById("confirmacion");
const disenoPedido = document.querySelector(".pedido-diseno");
let ultimoEnlace = "";

function crear(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function crearBotonCantidad(texto, etiquetaAccesible, accion) {
  const boton = crear("button", "", texto);
  boton.type = "button";
  boton.setAttribute("aria-label", etiquetaAccesible);
  boton.addEventListener("click", accion);
  return boton;
}

function dibujarPedido() {
  const items = leerCarrito();
  listaPedido.innerHTML = "";
  resumenTotal.innerHTML = "";

  // Carrito vacío
  if (items.length === 0) {
    const vacio = crear("div", "carrito-vacio");
    vacio.appendChild(crear("p", "", "Tu carrito está vacío."));
    const enlace = crear("a", "boton boton-principal", "Ver el catálogo");
    enlace.href = "catalogo.html";
    vacio.appendChild(enlace);
    listaPedido.appendChild(vacio);
    panelDatos.style.display = "none";
    return;
  }

  panelDatos.style.display = "";

  items.forEach(function (item) {
    const linea = crear("div", "linea-pedido");

    const info = crear("div");
    info.appendChild(crear("div", "nombre", item.nombre));
    info.appendChild(crear("div", "detalle", item.ml + " ml · " + formatoQ(item.precio) + " c/u"));
    linea.appendChild(info);

    const cantidad = crear("div", "cantidad");
    cantidad.appendChild(
      crearBotonCantidad("−", "Quitar uno de " + item.nombre, function () {
        cambiarCantidad(item.clave, -1);
        dibujarPedido();
      })
    );
    cantidad.appendChild(crear("span", "", String(item.cantidad)));
    cantidad.appendChild(
      crearBotonCantidad("+", "Agregar uno de " + item.nombre, function () {
        cambiarCantidad(item.clave, 1);
        dibujarPedido();
      })
    );
    linea.appendChild(cantidad);

    linea.appendChild(crear("div", "subtotal", formatoQ(item.cantidad * item.precio)));
    listaPedido.appendChild(linea);
  });

  const totalFila = crear("div", "total-fila");
  totalFila.appendChild(crear("span", "", "Total"));
  totalFila.appendChild(crear("span", "", formatoQ(totalCarrito())));
  resumenTotal.appendChild(totalFila);

  const acciones = crear("div", "acciones-pedido");
  const seguir = crear("a", "", "← Seguir viendo el catálogo");
  seguir.href = "catalogo.html";
  acciones.appendChild(seguir);
  const vaciar = crear("button", "boton-texto", "Vaciar carrito");
  vaciar.type = "button";
  vaciar.addEventListener("click", function () {
    vaciarCarrito();
    dibujarPedido();
  });
  acciones.appendChild(vaciar);
  resumenTotal.appendChild(acciones);
}

function mostrarError(texto) {
  errorForm.textContent = texto;
  errorForm.hidden = false;
}

function actualizarZona() {
  campoZona.style.display = modalidad.value === "entrega" ? "block" : "none";
}

modalidad.addEventListener("change", actualizarZona);

botonEnviar.addEventListener("click", function () {
  errorForm.hidden = true;
  const items = leerCarrito();

  if (items.length === 0) {
    mostrarError("Agrega al menos una fragancia a tu pedido.");
    return;
  }

  const nombreCliente = document.getElementById("nombre-cliente").value.trim();
  const telefono = document.getElementById("telefono-cliente").value.trim();
  const notas = document.getElementById("notas-cliente").value.trim();

  if (nombreCliente === "") {
    mostrarError("Escribe tu nombre.");
    return;
  }
  if (telefono.replace(/\D/g, "").length < 8) {
    mostrarError("Escribe un teléfono válido (al menos 8 números).");
    return;
  }
  if (modalidad.value === "entrega" && zona.value.trim() === "") {
    mostrarError("Escribe la zona o dirección de entrega.");
    return;
  }

  let mensaje = "Hola, quiero hacer este pedido:\n";
  items.forEach(function (item) {
    mensaje +=
      "- " + item.nombre + " " + item.ml + " ml x" + item.cantidad +
      " (" + formatoQ(item.cantidad * item.precio) + ")\n";
  });
  mensaje += "Total: " + formatoQ(totalCarrito()) + "\n";
  mensaje += "Pago: al recibir o al recoger\n\n";
  mensaje += "Nombre: " + nombreCliente + "\n";
  mensaje += "Teléfono: " + telefono + "\n";

  if (modalidad.value === "entrega") {
    mensaje += "Entrega en: " + zona.value.trim() + "\n";
  } else {
    mensaje += "Pasaré a recoger\n";
  }
  if (notas !== "") {
    mensaje += "Notas: " + notas;
  }

  ultimoEnlace = "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(mensaje);
  abrirWhatsApp();

  // El carrito NO se borra todavía: no sabemos si realmente presionó "Enviar".
  // Mostramos el aviso para que lo confirme.
  disenoPedido.hidden = true;
  confirmacion.hidden = false;
  window.scrollTo(0, 0);
});

function abrirWhatsApp() {
  const ventana = window.open(ultimoEnlace, "_blank");
  if (!ventana) {
    // el navegador bloqueó la ventana nueva: abrir en esta misma pestaña
    window.location.href = ultimoEnlace;
  }
}

// --- Aviso después de enviar ---

document.getElementById("reintentar").addEventListener("click", abrirWhatsApp);

document.getElementById("volver-editar").addEventListener("click", function () {
  confirmacion.hidden = true;
  disenoPedido.hidden = false;
});

document.getElementById("ya-envie").addEventListener("click", function () {
  vaciarCarrito();
  confirmacion.innerHTML = "";
  confirmacion.appendChild(crear("h2", "", "¡Gracias por tu pedido!"));
  confirmacion.appendChild(crear("p", "", "Lo reviso y te confirmo por WhatsApp. Si algo está agotado, te recomiendo una fragancia similar."));
  const enlace = crear("a", "boton boton-principal boton-ancho", "Seguir viendo el catálogo");
  enlace.href = "catalogo.html";
  confirmacion.appendChild(enlace);
});

actualizarZona();
dibujarPedido();
