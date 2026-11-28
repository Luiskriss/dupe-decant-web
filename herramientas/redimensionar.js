// ============================================================
// redimensionar.js - reduce el peso de tus fotos para la página.
//
// Cómo se usa:
//  1. Pon tus fotos en la carpeta "fotos-originales" (junto a index.html).
//     Cada foto debe llamarse como indica la lista nombres_de_fotos.csv,
//     por ejemplo: najim-parfum.jpg
//  2. En la terminal, dentro de la carpeta "herramientas":
//        npm install
//        node redimensionar.js
//  3. Las fotos listas quedan en la carpeta "img".
// ============================================================

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const carpetaOrigen = path.join(__dirname, "..", "fotos-originales");
const carpetaDestino = path.join(__dirname, "..", "img");
const ANCHO_MAXIMO = 700; // píxeles: suficiente para la tarjeta, incluso en pantallas de alta resolución

async function main() {
  if (!fs.existsSync(carpetaOrigen)) {
    console.log('No existe la carpeta "fotos-originales". Créala junto a index.html y pon ahí tus fotos.');
    return;
  }
  fs.mkdirSync(carpetaDestino, { recursive: true });

  const archivos = fs.readdirSync(carpetaOrigen).filter(function (nombre) {
    return /\.(jpe?g|png|webp)$/i.test(nombre);
  });

  if (archivos.length === 0) {
    console.log("No encontré fotos (.jpg, .png o .webp) en fotos-originales.");
    return;
  }

  let listas = 0;
  for (const archivo of archivos) {
    const nombreBase = path.parse(archivo).name.toLowerCase().trim();
    const entrada = path.join(carpetaOrigen, archivo);
    const salida = path.join(carpetaDestino, nombreBase + ".jpg");
    try {
      await sharp(entrada)
        .rotate() // respeta la orientación con que se tomó la foto
        .resize({ width: ANCHO_MAXIMO, height: ANCHO_MAXIMO, fit: "inside", withoutEnlargement: true })
        .flatten({ background: "#ffffff" }) // fondo blanco si la imagen es transparente
        .jpeg({ quality: 80 })
        .toFile(salida);
      const kb = Math.round(fs.statSync(salida).size / 1024);
      console.log("OK   " + nombreBase + ".jpg  (" + kb + " KB)");
      listas++;
    } catch (error) {
      console.log("FALLÓ " + archivo + ": " + error.message);
    }
  }
  console.log("\n" + listas + " de " + archivos.length + " fotos listas en la carpeta img.");
}

main();
