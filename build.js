/*
 *
 *  build.js - CLI para generar un proyecto React desde un archivo JSON.
 *
 *  Uso:
 *    node /ruta/a/TFG/build.js <ruta-al-json>
 *
 *  El proyecto se crea en el directorio desde el que se ejecuta el comando (CWD).
 *
 *  Ejemplo:
 *    cd C:\Users\Angel\MisProyectos
 *    node C:\Users\Angel\Documents\TFG\build.js ./mi-diseno.json
 *
 *  Resultado: C:\Users\Angel\MisProyectos\<projectName>\
 *
 */

const fs   = require('fs');
const path = require('path');

const { generate } = require('./builder/builder');

const jsonArg = process.argv[2];

if (!jsonArg) {
    console.error('Uso: node build.js <ruta-al-archivo-json>');
    process.exit(1);
}

const jsonPath = path.resolve(process.cwd(), jsonArg);

if (!fs.existsSync(jsonPath)) {
    console.error(`Archivo no encontrado: ${jsonPath}`);
    process.exit(1);
}

let json;
try {
    json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
} catch (err) {
    console.error(`Error al leer el archivo JSON: ${err.message}`);
    process.exit(1);
}

const outputDir = process.cwd();

generate(json, outputDir)
    .then(() => {
        // El pipeline ya imprimio todos los logs. npm run dev sigue corriendo.
    })
    .catch((err) => {
        // El pipeline ya imprimio "Abortando build" por consola.
        process.exit(1);
    });
