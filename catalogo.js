// ============================================================
// catalogo.js - solo para catalogo.html
// Dibuja las tarjetas, el buscador y los filtros.
// ============================================================

const catalogo = document.getElementById("catalogo");
const buscador = document.getElementById("buscador");
const contadorResultados = document.getElementById("contador-resultados");
const zonaCatalogo = document.getElementById("zona-catalogo");
const pestanas = document.querySelectorAll(".pestana");
const filtrosUso = document.querySelectorAll(".filtro");

const CATEGORIAS_VALIDAS = ["todos", "mujer", "hombre", "unisex", "ofertas"];
const TEXTO_CLASIFICACION = { hombre: "Hombre", mujer: "Mujer", unisex: "Unisex" };
const TEXTO_USO = { frio: "Frío", calor: "Calor", ambos: "Frío y calor" };

let fragancias = [];
let envases = [];
let categoria = "todos";
let uso = "todos";

// Si llegaron desde la página de inicio: catalogo.html?categoria=mujer
const categoriaDeLaDireccion = new URLSearchParams(window.location.search).get("categoria");
if (CATEGORIAS_VALIDAS.includes(categoriaDeLaDireccion)) {
  categoria = categoriaDeLaDireccion;
}

// Crea un elemento con clase y texto (más seguro que armar HTML a mano)
function crear(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function enlaceWhatsApp(texto) {
  return "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(texto);
}

// ¿Esta fragancia se muestra con la búsqueda y los filtros actuales?
function seMuestra(f, busqueda) {
  if (busqueda !== "") {
    // Al buscar, se busca en TODO el catálogo (así no se pierde ninguna venta)
    const texto = normalizar(f.nombre_fragancia + " " + f.marca_fragancia);
    return texto.includes(busqueda);
  }
  if (categoria === "ofertas") {
    if (!f.en_oferta) return false;
  } else if (categoria !== "todos" && f.clasificacion !== categoria) {
    return false;
  }
  if (uso !== "todos" && f.tipo_uso !== uso && f.tipo_uso !== "ambos") {
    return false;
  }
  return true;
}

// Frasco dibujado que se muestra cuando una fragancia todavía no tiene foto
const SVG_FRASCO =
  '<svg viewBox="0 0 64 80" width="64" height="80" fill="none" stroke="#cfb07a" stroke-width="1.6" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<rect x="26" y="4" width="12" height="9" rx="2"/><path d="M28 13v6M36 13v6"/>' +
  '<rect x="12" y="19" width="40" height="55" rx="8"/><path d="M20 38h24M20 46h16"/></svg>';

// La foto se busca en img/nombre-de-la-fragancia.jpg
function crearFoto(f) {
  const caja = crear("div", "foto");
  const imagen = document.createElement("img");
  imagen.src = "img/" + slugDeNombre(f.nombre_fragancia) + ".jpg";
  imagen.alt = f.nombre_fragancia + " - " + f.marca_fragancia;
  imagen.loading = "lazy";
  imagen.addEventListener("error", function () {
    caja.classList.add("foto-vacia");
    caja.innerHTML = SVG_FRASCO;
  });
  caja.appendChild(imagen);
  return caja;
}

function crearTarjeta(f) {
  const tarjeta = crear("article", "tarjeta");
  const descuento = f.en_oferta ? Number(f.descuento_pct) || 0 : 0;

  tarjeta.appendChild(crearFoto(f));

  if (descuento > 0) {
    tarjeta.appendChild(crear("span", "insignia-oferta", "-" + descuento + "%"));
  }

  tarjeta.appendChild(crear("h3", "", f.nombre_fragancia));
  tarjeta.appendChild(crear("p", "marca", f.marca_fragancia));

  const etiquetas = crear("div", "etiquetas");
  if (f.clasificacion) {
    etiquetas.appendChild(crear("span", "etiqueta-chip", TEXTO_CLASIFICACION[f.clasificacion] || f.clasificacion));
  }
  if (f.tipo_uso) {
    etiquetas.appendChild(crear("span", "etiqueta-chip", TEXTO_USO[f.tipo_uso] || f.tipo_uso));
  }
  tarjeta.appendChild(etiquetas);

  const selector = crear("select");
  selector.setAttribute("aria-label", "Presentación de " + f.nombre_fragancia);
  envases.forEach(function (e, indice) {
    const opcion = crear("option", "", e.dimension_envases + " ml");
    opcion.value = indice;
    selector.appendChild(opcion);
  });
  tarjeta.appendChild(selector);

  const precio = crear("div", "precio");
  const precioActual = crear("span", "precio-actual");
  const precioTachado = crear("span", "precio-tachado");
  precio.appendChild(precioActual);
  precio.appendChild(precioTachado);
  tarjeta.appendChild(precio);

  // Muestra el precio de la presentación elegida (con descuento si hay oferta)
  function mostrarPrecio() {
    const envase = envases[selector.value];
    const base = Number(envase.precio);
    const final = precioFinal(base, descuento);
    precioActual.textContent = formatoQ(final);
    precioTachado.textContent = descuento > 0 ? formatoQ(base) : "";
  }
  selector.addEventListener("change", mostrarPrecio);
  mostrarPrecio();

  const boton = crear("button", "boton boton-principal boton-ancho", "Agregar al carrito");
  boton.addEventListener("click", function () {
    const envase = envases[selector.value];
    agregarAlCarrito(f.nombre_fragancia, envase.dimension_envases, precioFinal(envase.precio, descuento));
    actualizarContador(true);

    boton.textContent = "Agregado ✓";
    boton.classList.add("agregado");
    setTimeout(function () {
      boton.textContent = "Agregar al carrito";
      boton.classList.remove("agregado");
    }, 1200);
  });
  tarjeta.appendChild(boton);

  return tarjeta;
}

function mensajeSinResultados(busqueda) {
  const caja = crear("div", "mensaje-estado");

  if (busqueda !== "") {
    caja.appendChild(document.createTextNode("No encontré «" + buscador.value.trim() + "». "));
  } else if (categoria === "ofertas") {
    caja.appendChild(document.createTextNode("Por ahora no hay ofertas activas. "));
  } else {
    caja.appendChild(document.createTextNode("No hay fragancias con esos filtros. "));
  }

  const enlace = crear("a", "", "Escríbeme por WhatsApp");
  enlace.href = enlaceWhatsApp("Hola, estoy buscando una fragancia y no la encontré en el catálogo.");
  enlace.target = "_blank";
  enlace.rel = "noopener";
  caja.appendChild(enlace);
  caja.appendChild(document.createTextNode(" y te recomiendo una similar."));
  return caja;
}

function dibujarCatalogo() {
  const busqueda = normalizar(buscador.value.trim());
  const visibles = fragancias.filter(function (f) {
    return seMuestra(f, busqueda);
  });

  zonaCatalogo.classList.toggle("buscando-todo", busqueda !== "");
  catalogo.innerHTML = "";

  if (visibles.length === 0) {
    catalogo.appendChild(mensajeSinResultados(busqueda));
    contadorResultados.textContent = "";
    return;
  }

  visibles.forEach(function (f) {
    catalogo.appendChild(crearTarjeta(f));
  });

  const plural = visibles.length === 1 ? "fragancia" : "fragancias";
  contadorResultados.textContent =
    busqueda !== ""
      ? visibles.length + " " + plural + " en todo el catálogo"
      : visibles.length + " " + plural;
}

function marcarBotones() {
  pestanas.forEach(function (p) {
    p.classList.toggle("activa", p.dataset.categoria === categoria);
  });
  filtrosUso.forEach(function (f) {
    f.classList.toggle("activo", f.dataset.uso === uso);
  });
}

pestanas.forEach(function (p) {
  p.addEventListener("click", function () {
    categoria = p.dataset.categoria;
    buscador.value = "";
    marcarBotones();
    dibujarCatalogo();
    // actualiza la dirección sin recargar, para poder compartir el enlace
    history.replaceState(null, "", categoria === "todos" ? "catalogo.html" : "catalogo.html?categoria=" + categoria);
  });
});

filtrosUso.forEach(function (f) {
  f.addEventListener("click", function () {
    uso = f.dataset.uso;
    marcarBotones();
    dibujarCatalogo();
  });
});

buscador.addEventListener("input", dibujarCatalogo);

async function iniciar() {
  marcarBotones();
  try {
    const datos = await cargarDatos();
    fragancias = datos.fragancias;
    envases = datos.envases;
    dibujarCatalogo();
  } catch (error) {
    console.error("No se pudo cargar el catálogo:", error);
    catalogo.innerHTML = "";
    catalogo.appendChild(
      crear("p", "mensaje-estado", "No pude cargar el catálogo en este momento. Intenta de nuevo en unos minutos.")
    );
  }
}

iniciar();
