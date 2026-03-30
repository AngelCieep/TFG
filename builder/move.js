/*
 *
 *  move.js - Copia la plantilla y los componentes al directorio de salida.
 *
 *  Recibe el objeto verificado por verify.js y realiza las siguientes operaciones:
 *
 *    1. Copia el contenido de repository/templates/<template>/ a una carpeta nueva
 *       en el directorio de salida con el nombre del proyecto (projectName).
 *
 *    2. Para cada componente de la lista, copia todos los archivos de su carpeta
 *       en repository/components/<nombreComponente>/ al directorio src/components/
 *       del proyecto generado.
 *
 *    3. Crea las carpetas intermedias que sean necesarias si no existen.
 *
 *  El resultado de este paso es un proyecto React con la plantilla base y los
 *  componentes en su lugar, listo para que import.js genere los imports en App.tsx.
 *
 */

const fs   = require('fs');
const path = require('path');

const TEMPLATES_DIR  = path.resolve(__dirname, '../repository/templates');
const COMPONENTS_DIR = path.resolve(__dirname, '../repository/components');

const { log } = require('./functions');

// Nombres de carpetas que no deben copiarse del template
const EXCLUDE_DIRS = new Set(['node_modules', '.git']);

/**
 * Copia la plantilla y los componentes al directorio de salida.
 *
 * @param {object} verified  - Objeto devuelto por verify()
 * @param {string} outputDir - Ruta absoluta del directorio de salida (process.cwd() en CLI)
 * @returns {{ projectPath: string, ...verified }}
 * @throws {Error} si alguna operacion de copia falla
 */
function move(verified, outputDir) {
    const errors      = [];
    const projectPath = path.join(outputDir, verified.projectName);

    // ─── 1. Copiar la plantilla ───────────────────────────────────────────────
    const templateSrc = path.join(TEMPLATES_DIR, verified.template);
    try {
        fs.cpSync(templateSrc, projectPath, {
            recursive: true,
            filter: (src) => {
                const name = path.basename(src);
                return !EXCLUDE_DIRS.has(name);
            },
        });
        log('move', `Copiando plantilla '${verified.template}'`, 'OK');
    } catch (err) {
        log('move', `Copiando plantilla '${verified.template}'`, 'FALLO');
        errors.push(`Error al copiar plantilla '${verified.template}': ${err.message}`);
    }

    // ─── 2. Copiar cada componente ────────────────────────────────────────────
    for (const name of verified.components) {
        const src  = path.join(COMPONENTS_DIR, name.toLowerCase());
        const dest = path.join(projectPath, 'src', 'components', name.toLowerCase());
        try {
            fs.cpSync(src, dest, { recursive: true });
            log('move', `Copiando componente '${name}'`, 'OK');
        } catch (err) {
            log('move', `Copiando componente '${name}'`, 'FALLO');
            errors.push(`Error al copiar componente '${name}': ${err.message}`);
        }
    }

    // ─── 3. Resumen ───────────────────────────────────────────────────────────
    log('move', `Moves completados: ${errors.length} errores.`);

    if (errors.length > 0) {
        throw new Error(errors.join('\n'));
    }

    return { ...verified, projectPath };
}

module.exports = { move };