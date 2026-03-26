/*
 *
 *  verify.js - Verifica que el objeto normalizado es ejecutable.
 *
 *  Ejecuta tres comprobaciones sobre el objeto devuelto por parser.js:
 *
 *    1. checkTemplate    : Comprueba que la carpeta de la plantilla indicada existe
 *                          en repository/templates/. Es un error bloqueante.
 *
 *    2. checkComponents  : Recorre la lista completa de componentes y comprueba que
 *                          cada uno tiene su carpeta en repository/components/ con al
 *                          menos un archivo .tsx dentro. Acumula todos los fallos antes
 *                          de devolver el resultado, no se detiene al primer error.
 *                          Los componentes de STRUCTURAL_COMPONENTS se omiten porque
 *                          no tienen archivo en la biblioteca.
 *
 *    3. checkOverlaps    : Recorre el arbol recursivamente y compara los rangos de
 *                          columnas de los nodos hermanos. Si dos hermanos ocupan las
 *                          mismas columnas dentro de un nodo padre, genera un aviso.
 *                          No es bloqueante, se incluye como warning en la respuesta.
 *
 *  verify: funcion principal. Ejecuta los tres checks y devuelve un objeto con:
 *    - ok       : true si no hay errores, false si los hay.
 *    - errors   : lista de errores bloqueantes.
 *    - warnings : lista de avisos no bloqueantes.
 *    - resto de campos del objeto parsed si ok es true.
 *
 */

const fs   = require('fs');
const path = require('path');

const TEMPLATES_DIR  = path.resolve(__dirname, '../repository/templates');
const COMPONENTS_DIR = path.resolve(__dirname, '../repository/components');

const { STRUCTURAL_COMPONENTS, walkTree, log } = require('./functions');

// ─── Check 1: la plantilla existe ───────────────────────────────────────────

function checkTemplate(template) {
    const templatePath = path.join(TEMPLATES_DIR, template);
    if (!fs.existsSync(templatePath)) {
        log('verify', `Comprobando plantilla '${template}'`, 'FALLO');
        return `Plantilla '${template}' no encontrada en repository/templates/.`;
    }
    log('verify', `Comprobando plantilla '${template}'`, 'OK');
    return null;
}

// ─── Check 2: todos los componentes de biblioteca existen en disco ───────────

function checkComponents(components) {
    const errors = [];
    for (const name of components) {
        if (STRUCTURAL_COMPONENTS.has(name)) continue;

        const folderPath = path.join(COMPONENTS_DIR, name.toLowerCase());
        if (!fs.existsSync(folderPath)) {
            log('verify', `Comprobando componente '${name}'`, 'FALLO');
            errors.push(`Componente '${name}' no encontrado en repository/components/${name.toLowerCase()}/`);
            continue;
        }

        // Comprobar que hay al menos un .tsx dentro
        const files = fs.readdirSync(folderPath);
        const hasTsx = files.some(f => f.endsWith('.tsx'));
        if (!hasTsx) {
            log('verify', `Comprobando componente '${name}'`, 'FALLO');
            errors.push(`Componente '${name}': la carpeta existe pero no contiene ningún archivo .tsx.`);
            continue;
        }

        log('verify', `Comprobando componente '${name}'`, 'OK');
    }
    return errors;
}

// ─── Check 3: solapamiento de layout (warning, no bloqueante) ────────────────

function checkOverlaps(tree, warnings) {
    walkTree(tree, node => {
        const children = node.children;
        if (!Array.isArray(children) || children.length < 2) return;

        for (let i = 0; i < children.length; i++) {
            for (let j = i + 1; j < children.length; j++) {
                const a = children[i];
                const b = children[j];
                if (!a.layout || !b.layout) continue;

                const aStart = a.layout.colStart;
                const aEnd   = a.layout.colStart + a.layout.colSpan;
                const bStart = b.layout.colStart;
                const bEnd   = b.layout.colStart + b.layout.colSpan;

                if (aStart < bEnd && bStart < aEnd) {
                    warnings.push(
                        `Solapamiento de layout en '${node.id}': ` +
                        `'${a.id}' (cols ${aStart}-${aEnd - 1}) y '${b.id}' (cols ${bStart}-${bEnd - 1}) se superponen.`
                    );
                    log('verify', `Solapamiento detectado en '${node.id}'`, 'AVISO');
                }
            }
        }
    });
}

// ─── Función principal ───────────────────────────────────────────────────────

/**
 * Verifica que el objeto normalizado es ejecutable:
 * plantilla existente, componentes existentes, sin solapamientos de layout.
 *
 * @param {object} parsed - Objeto devuelto por parseJson()
 * @returns {{ ok: boolean, errors: string[], warnings: string[], ...parsed }}
 */
function verify(parsed) {
    const errors   = [];
    const warnings = [];

    // Check 1: plantilla
    const templateError = checkTemplate(parsed.template);
    if (templateError) errors.push(templateError);

    // Check 2: componentes (se acumulan todos los fallos)
    const componentErrors = checkComponents(parsed.components);
    errors.push(...componentErrors);

    // Check 3: solapamientos (solo warnings)
    checkOverlaps(parsed.tree, warnings);

    log('verify', `Verificacion completada: ${errors.length} errores, ${warnings.length} warnings.`);

    if (errors.length > 0) {
        return { ok: false, errors, warnings };
    }

    return { ok: true, errors: [], warnings, ...parsed };
}

module.exports = { verify };
