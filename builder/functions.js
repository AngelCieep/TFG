/*
 *
 *  functions.js - Funciones utilitarias reutilizables del pipeline.
 *
 *  Centraliza las operaciones comunes que necesitan varios archivos del builder
 *  para evitar duplicar logica. Cualquier funcion que se use en mas de un archivo
 *  del pipeline debe definirse aqui y exportarse.
 *
 *  STRUCTURAL_COMPONENTS : Set de nombres de nodos que actuan como contenedores
 *    estructurales (Root, Section, Container). No tienen archivo en la biblioteca
 *    de componentes y se excluyen de cualquier operacion sobre la biblioteca.
 *    Es la fuente unica de esta lista para todo el pipeline.
 *
 *  walkTree : Recorre el arbol de nodos en profundidad (depth-first) y llama a
 *    callback(node) en cada nodo. Es la base sobre la que se construyen todas las
 *    operaciones que necesiten iterar el arbol: recolectar componentes, generar JSX,
 *    comprobar solapamientos, etc.
 *
 */

// Nodos estructurales que no corresponden a ningun archivo en la biblioteca.
const STRUCTURAL_COMPONENTS = new Set(['Root', 'Section', 'Container']);

/**
 * Recorre el arbol de nodos recursivamente en profundidad.
 * Llama a callback(node) en cada nodo, incluyendo el nodo raiz.
 *
 * @param {object}   node     - Nodo actual del arbol.
 * @param {Function} callback - Funcion a ejecutar en cada nodo.
 */
function walkTree(node, callback) {
    callback(node);
    if (Array.isArray(node.children)) {
        node.children.forEach(child => walkTree(child, callback));
    }
}

/**
 * Emite un mensaje de log por consola con el formato del pipeline.
 *
 * @param {string} fase      - Nombre de la fase: 'verify', 'move' o 'import'.
 * @param {string} mensaje   - Descripcion de la operacion.
 * @param {string} [resultado] - 'OK', 'FALLO' o 'AVISO'. Si se omite, no se imprime resultado.
 */
function log(fase, mensaje, resultado) {
    const prefijo = `[${fase}]`;
    const linea   = resultado !== undefined
        ? `${prefijo} ${mensaje}...`.padEnd(60) + resultado
        : `${prefijo} ${mensaje}`;

    if (resultado === 'FALLO') {
        console.error(linea);
    } else if (resultado === 'AVISO') {
        console.warn(linea);
    } else {
        console.log(linea);
    }
}

module.exports = { STRUCTURAL_COMPONENTS, walkTree, log };
