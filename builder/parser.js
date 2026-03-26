/*
 *
 *  parser.js - Interpreta el JSON crudo del disenador y extrae un objeto normalizado.
 *
 *  Recibe el body de la peticion POST /generate y devuelve un objeto con los campos
 *  que necesita el resto del pipeline:
 *
 *    - projectName  : nombre del proyecto a generar.
 *    - template     : nombre de la plantilla base a utilizar.
 *    - grid         : numero de columnas del sistema de grid (por defecto 12).
 *    - components   : lista unica de nombres de componentes de biblioteca usados.
 *    - tree         : arbol completo de nodos tal como viene en el body del JSON.
 *
 *  STRUCTURAL_COMPONENTS: nombres de nodos que actuan como contenedores estructurales
 *  y no corresponden a ningun archivo en la biblioteca de componentes. Se excluyen
 *  de la lista de componentes al recorrer el arbol.
 *
 *  collectComponents: funcion recursiva que recorre el arbol de nodos y acumula
 *  en un Set los nombres de componentes de biblioteca, evitando duplicados.
 *
 *  parseJson: funcion principal. Valida que el JSON tenga la estructura minima
 *  requerida (header con projectName y template, y body) y devuelve el objeto
 *  normalizado. Lanza un Error con mensaje descriptivo si falta algún campo.
 *
 */

const { STRUCTURAL_COMPONENTS, walkTree } = require('./functions');

/**
 * Recibe el JSON crudo del diseñador y devuelve un objeto normalizado.
 *
 * @param {object} json - JSON parseado del diseñador
 * @returns {{ projectName: string, template: string, grid: number, components: string[], tree: object }}
 * @throws {Error} si el JSON no tiene la estructura mínima requerida
 */
function parseJson(json) {
    if (!json || typeof json !== 'object') {
        throw new Error('El JSON recibido no es un objeto válido.');
    }
    if (!json.header) {
        throw new Error('El JSON no contiene la sección "header".');
    }
    if (!json.header.projectName) {
        throw new Error('El header no contiene "projectName".');
    }
    if (!json.header.template) {
        throw new Error('El header no contiene "template".');
    }
    if (!json.body) {
        throw new Error('El JSON no contiene la sección "body".');
    }

    const found = new Set();
    walkTree(json.body, node => {
        if (!STRUCTURAL_COMPONENTS.has(node.component)) {
            found.add(node.component);
        }
    });

    return {
        projectName: json.header.projectName,
        template:    json.header.template,
        grid:        json.header.grid ?? 12,
        components:  Array.from(found),
        tree:        json.body,
    };
}

module.exports = { parseJson };
