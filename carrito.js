// ============================================================
// carrito.js - lo usan TODAS las páginas.
// Aquí vive la configuración, el carrito y el contador del encabezado.
// ============================================================

// --- CONFIGURACIÓN (lo único que normalmente vas a cambiar) ---

// Dirección del servidor. Cuando publiques la página, aquí cambia.
const API = "http://localhost:3000";

// Tu número de WhatsApp con código de país, sin espacios ni signos.
// Ejemplo en Guatemala: "50212345678"
const NUMERO_WHATSAPP = "50233036333";

// --- DATOS DEL CATÁLOGO ---
// Todas las páginas piden los datos con esta función. Si más adelante los
// datos salen de un archivo en vez del servidor, solo se cambia aquí.
async function cargarDatos() {
  const [resFrag, resEnv] = await Promise.all([
    fetch(API + "/api/fragancias"),
    fetch(API + "/api/envases"),
  ]);
  if (!resFrag.ok || !resEnv.ok) {
    throw new Error("El servidor respondió con error");
  }
  return {
    fragancias: await resFrag.json(),
    envases: await resEnv.json(),
  };
}

// --- UTILIDADES ---

function formatoQ(numero) {
  const n = Number(numero);
  return "Q" + (Number.isInteger(n) ? n : n.toFixed(2));
}

// Precio con descuento (si la fragancia está en oferta)
function precioFinal(precio, descuentoPct) {
  const p = Number(precio);
  const d = Number(descuentoPct) || 0;
  return Math.round((p * (100 - d)) / 100);
}

// Quita mayúsculas y tildes: "Sauvagé" -> "sauvage"
function normalizar(texto) {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Nombre de archivo de la foto: "Najim Parfum" -> "najim-parfum"
// (minúsculas, sin tildes, y guiones en lugar de espacios o símbolos)
function slugDeNombre(nombre) {
  return normalizar(nombre)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// --- CARRITO ---
// Se guarda en el navegador (localStorage) para que NO se pierda al
// cambiar de página. Cada producto es: { clave, nombre, ml, precio, cantidad }

const CLAVE_CARRITO = "dupedecant_carrito";
let carritoEnMemoria = []; // respaldo por si el navegador no deja guardar

function leerCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
    if (Array.isArray(guardado)) return guardado;
  } catch (error) {
    return carritoEnMemoria;
  }
  return [];
}

function guardarCarrito(items) {
  carritoEnMemoria = items;
  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
  } catch (error) {
    // sin almacenamiento: sigue funcionando en esta página
  }
  actualizarContador();
}

function agregarAlCarrito(nombre, ml, precio) {
  const items = leerCarrito();
  const clave = nombre + "|" + ml;
  const existente = items.find(function (item) {
    return item.clave === clave;
  });
  if (existente) {
    existente.cantidad = existente.cantidad + 1;
  } else {
    items.push({ clave: clave, nombre: nombre, ml: ml, precio: Number(precio), cantidad: 1 });
  }
  guardarCarrito(items);
}

function cambiarCantidad(clave, cambio) {
  let items = leerCarrito();
  items.forEach(function (item) {
    if (item.clave === clave) item.cantidad = item.cantidad + cambio;
  });
  items = items.filter(function (item) {
    return item.cantidad > 0;
  });
  guardarCarrito(items);
}

function quitarDelCarrito(clave) {
  guardarCarrito(
    leerCarrito().filter(function (item) {
      return item.clave !== clave;
    })
  );
}

function vaciarCarrito() {
  guardarCarrito([]);
}

function cantidadTotal() {
  return leerCarrito().reduce(function (suma, item) {
    return suma + item.cantidad;
  }, 0);
}

function totalCarrito() {
  return leerCarrito().reduce(function (suma, item) {
    return suma + item.cantidad * item.precio;
  }, 0);
}

// Actualiza el numerito del icono del carrito (arriba, en todas las páginas)
function actualizarContador(animar) {
  const contador = document.getElementById("carrito-contador");
  if (!contador) return;
  const cantidad = cantidadTotal();
  contador.textContent = cantidad;
  contador.hidden = cantidad === 0;
  if (animar) {
    contador.classList.remove("salto");
    void contador.offsetWidth; // reinicia la animación
    contador.classList.add("salto");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  actualizarContador();
});

// Si el carrito cambia en otra pestaña, este contador se actualiza solo
window.addEventListener("storage", function () {
  actualizarContador();
});
