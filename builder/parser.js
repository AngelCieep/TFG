// Componentes estructurales que no pertenecen a la biblioteca
const STRUCTURAL_COMPONENTS = ['Root'];

/**
 * Recorre el árbol de nodos recursivamente y acumula los nombres
 * de componentes de biblioteca (excluye los estructurales).
 */
function collectComponents(node, found) {
    if (!STRUCTURAL_COMPONENTS.includes(node.component)) {
        found.add(node.component);
    }
    if (Array.isArray(node.children)) {
        node.children.forEach(child => collectComponents(child, found));
    }
}

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
    collectComponents(json.body, found);

    return {
        projectName: json.header.projectName,
        template:    json.header.template,
        grid:        json.header.grid ?? 12,
        components:  Array.from(found),
        tree:        json.body,
    };
}

module.exports = { parseJson };
