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
 *    - shell        : array de nodos del layout global (installation.shell).
 *    - pages        : array de paginas, cada una con id, path, title y body.
 *    - components   : lista unica de nombres de componentes de biblioteca usados
 *                     en el shell y en todos los body de las paginas.
 *
 *  STRUCTURAL_COMPONENTS: nombres de nodos que actuan como contenedores estructurales
 *  y no corresponden a ningun archivo en la biblioteca de componentes. Se excluyen
 *  de la lista de componentes al recorrer los arboles.
 *
 *  parseJson: funcion principal. Valida que el JSON tenga la estructura minima
 *  requerida (installation con projectName, template y shell; pages no vacio)
 *  y devuelve el objeto normalizado. Lanza un Error con mensaje descriptivo si
 *  falta algun campo obligatorio.
 *
 */

const { STRUCTURAL_COMPONENTS, walkTree } = require('./functions');

/**
 * Recibe el JSON crudo del diseñador y devuelve un objeto normalizado.
 *
 * @param {object} json - JSON parseado del diseñador
 * @returns {{ projectName: string, template: string, grid: number, shell: object[], pages: object[], components: string[] }}
 * @throws {Error} si el JSON no tiene la estructura mínima requerida
 */
function parseJson(json) {
    if (!json || typeof json !== 'object') {
        throw new Error('El JSON recibido no es un objeto válido.');
    }

    const inst = json.installation;
    if (!inst) {
        throw new Error('El JSON no contiene la sección "installation".');
    }
    if (!inst.projectName) {
        throw new Error('installation no contiene "projectName".');
    }
    if (!inst.template) {
        throw new Error('installation no contiene "template".');
    }
    if (!Array.isArray(inst.shell)) {
        throw new Error('installation no contiene "shell" como array.');
    }
    if (!Array.isArray(json.pages) || json.pages.length === 0) {
        throw new Error('El JSON no contiene "pages" o el array está vacío.');
    }

    for (const page of json.pages) {
        if (!page.id)   throw new Error(`Una página no tiene "id".`);
        if (!page.path) throw new Error(`La página '${page.id}' no tiene "path".`);
        if (!page.body) throw new Error(`La página '${page.id}' no tiene "body".`);
    }

    // Recoger componentes de biblioteca del shell y de todos los body de páginas
    const found = new Set();

    for (const node of inst.shell) {
        if (node.component && !STRUCTURAL_COMPONENTS.has(node.component)) {
            found.add(node.component);
        }
    }

    for (const page of json.pages) {
        walkTree(page.body, node => {
            if (!STRUCTURAL_COMPONENTS.has(node.component)) {
                found.add(node.component);
            }
        });
    }

    return {
        projectName: inst.projectName,
        template:    inst.template,
        grid:        inst.grid ?? 12,
        shell:       inst.shell,
        pages:       json.pages,
        components:  Array.from(found),
    };
}

module.exports = { parseJson };
