/*
 *
 *  verify.js - Verifica que el objeto normalizado es ejecutable.
 *
 *  Ejecuta cuatro comprobaciones sobre el objeto devuelto por parser.js:
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
 *    3. checkOutlet      : Comprueba que el shell contiene exactamente un nodo Outlet.
 *                          Es un error bloqueante si hay cero o mas de uno.
 *
 *    4. checkOverlaps    : Recorre cada arbol de pagina recursivamente y compara los
 *                          rectangulos de layout de los nodos hermanos. Dos nodos se
 *                          solapan si sus rangos de columna Y de fila se intersectan
 *                          simultaneamente. No es bloqueante, se incluye como warning.
 *
 *  verify: funcion principal. Ejecuta los cuatro checks y devuelve un objeto con:
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

// ─── Check 3: el shell contiene exactamente un Outlet ────────────────────────

function checkOutlet(shell) {
    const count = shell.filter(n => n.component === 'Outlet').length;
    if (count === 0) {
        log('verify', `Comprobando Outlet en shell`, 'FALLO');
        return `El shell no contiene ningún nodo Outlet. Añade un Outlet para que las páginas se rendericen.`;
    }
    if (count > 1) {
        log('verify', `Comprobando Outlet en shell`, 'FALLO');
        return `El shell contiene ${count} nodos Outlet. Solo puede haber uno.`;
    }
    log('verify', `Comprobando Outlet en shell`, 'OK');
    return null;
}

// ─── Check 4: solapamiento de layout (warning, no bloqueante) ────────────────

function checkOverlaps(tree, warnings) {
    walkTree(tree, node => {
        const children = node.children;
        if (!Array.isArray(children) || children.length < 2) return;

        for (let i = 0; i < children.length; i++) {
            for (let j = i + 1; j < children.length; j++) {
                const a = children[i];
                const b = children[j];
                if (!a.layout || !b.layout) continue;

                const aColStart = a.layout.colStart;
                const aColEnd   = a.layout.colStart + a.layout.colSpan;
                const bColStart = b.layout.colStart;
                const bColEnd   = b.layout.colStart + b.layout.colSpan;

                const aRowStart = a.layout.rowStart;
                const aRowEnd   = a.layout.rowStart + a.layout.rowSpan;
                const bRowStart = b.layout.rowStart;
                const bRowEnd   = b.layout.rowStart + b.layout.rowSpan;

                // Sin rowStart/rowSpan no se puede determinar solapamiento real
                if (aRowStart == null || bRowStart == null) continue;

                const colsOverlap = aColStart < bColEnd && bColStart < aColEnd;
                const rowsOverlap = aRowStart < bRowEnd && bRowStart < aRowEnd;

                if (colsOverlap && rowsOverlap) {
                    warnings.push(
                        `Solapamiento de layout en '${node.id}': ` +
                        `'${a.id}' y '${b.id}' ocupan el mismo espacio en la cuadrícula.`
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
 * plantilla existente, componentes existentes, Outlet en shell, sin solapamientos.
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

    // Check 3: Outlet en el shell
    const outletError = checkOutlet(parsed.shell);
    if (outletError) errors.push(outletError);

    // Check 4: solapamientos por página (solo warnings)
    for (const page of parsed.pages) {
        checkOverlaps(page.body, warnings);
    }

    log('verify', `Verificacion completada: ${errors.length} errores, ${warnings.length} warnings.`);

    if (errors.length > 0) {
        return { ok: false, errors, warnings };
    }

    return { ok: true, errors: [], warnings, ...parsed };
}

module.exports = { verify };
