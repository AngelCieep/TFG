/*
 *
 *  import.js - Genera las sentencias de importacion y el JSX del App.tsx.
 *
 *  Recibe el objeto verificado y el proyecto ya copiado por move.js, y realiza
 *  las siguientes operaciones sobre el archivo src/App.tsx del proyecto generado:
 *
 *    1. Recorre la lista de componentes y genera una linea de importacion por cada
 *       uno apuntando a su carpeta dentro de src/components/.
 *
 *    2. Genera el componente Shell con los nodos del array shell[] en orden.
 *       Los nodos Outlet se renderizan como <Outlet />.
 *
 *    3. Genera el componente App con BrowserRouter, Routes y una Route por pagina.
 *
 *    4. Crea src/pages/<PageId>.tsx por cada pagina con el JSX del body y CSS Grid.
 *
 *    5. Sobreescribe el contenido del archivo App.tsx con todo lo generado.
 *
 */

const fs   = require('fs');
const path = require('path');

const { STRUCTURAL_COMPONENTS, walkTree, log } = require('./functions');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Capitaliza la primera letra de un string */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Serializa un valor JS como expresion JSX inline.
 * Strings → "valor", otros → {JSON.stringify(valor)}
 */
function serializeProp(value) {
    if (typeof value === 'string') return `"${value}"`;
    return `{${JSON.stringify(value)}}`;
}

/**
 * Genera el atributo style de CSS Grid para un nodo con layout.
 * Devuelve string vacio si el nodo no tiene layout.
 */
function gridStyle(layout) {
    if (!layout) return '';
    const parts = [
        `gridColumnStart: ${layout.colStart}`,
        `gridColumnEnd: ${layout.colStart + layout.colSpan}`,
    ];
    if (layout.rowStart != null) {
        parts.push(`gridRowStart: ${layout.rowStart}`);
        parts.push(`gridRowEnd: ${layout.rowStart + layout.rowSpan}`);
    }
    return ` style={{ ${parts.join(', ')} }}`;
}

// ─── Generacion del JSX de un arbol de nodos ─────────────────────────────────

/**
 * Genera el JSX recursivo de un nodo del arbol body de una pagina.
 * Los nodos estructurales se convierten en elementos HTML simples.
 * Los nodos de biblioteca se convierten en componentes React con sus props.
 *
 * @param {object} node   - Nodo del arbol
 * @param {number} indent - Nivel de indentacion (en espacios de 2)
 * @param {number} grid   - Numero de columnas del grid (para el Root)
 * @returns {string}
 */
function renderNode(node, indent, grid) {
    const pad     = ' '.repeat(indent * 2);
    const padIn   = ' '.repeat((indent + 1) * 2);
    const style   = gridStyle(node.layout);
    const children = Array.isArray(node.children) ? node.children : [];

    let tag;
    let extraProps = '';

    switch (node.component) {
        case 'Root':
            tag = 'div';
            extraProps = ` style={{ display: 'grid', gridTemplateColumns: 'repeat(${grid}, 1fr)' }}`;
            break;
        case 'Section':
            tag = 'section';
            break;
        case 'Container':
            tag = 'div';
            break;
        default:
            // Componente de biblioteca: renderizar con sus props
            tag = node.component;
            if (node.props && Object.keys(node.props).length > 0) {
                extraProps = ' ' + Object.entries(node.props)
                    .map(([k, v]) => `${k}=${serializeProp(v)}`)
                    .join(' ');
            }
            break;
    }

    const combinedProps = extraProps + style;

    if (children.length === 0) {
        return `${pad}<${tag}${combinedProps} />`;
    }

    const childLines = children
        .map(child => renderNode(child, indent + 1, grid))
        .join('\n');

    return `${pad}<${tag}${combinedProps}>\n${childLines}\n${pad}</${tag}>`;
}

// ─── Generacion de App.tsx ────────────────────────────────────────────────────

/**
 * Genera el contenido completo de App.tsx.
 *
 * @param {object} moved - Objeto devuelto por move()
 * @returns {string}
 */
function generateAppTsx(moved) {
    const { shell, pages, components, grid } = moved;

    // Imports de componentes de biblioteca
    const compImports = components
        .map(name => `import ${name} from './components/${name.toLowerCase()}/${name.toLowerCase()}';`)
        .join('\n');

    // Imports de paginas
    const pageImports = pages
        .map(p => `import ${capitalize(p.id)} from './pages/${capitalize(p.id)}';`)
        .join('\n');

    // JSX del shell
    const shellJsx = shell.map(node => {
        if (node.component === 'Outlet') return '      <Outlet />';
        const props = node.props && Object.keys(node.props).length > 0
            ? ' ' + Object.entries(node.props).map(([k, v]) => `${k}=${serializeProp(v)}`).join(' ')
            : '';
        return `      <${node.component}${props} />`;
    }).join('\n');

    // Routes
    const routes = pages
        .map(p => `          <Route path="${p.path}" element={<${capitalize(p.id)} />} />`)
        .join('\n');

    return `import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
${compImports}
${pageImports}
import './App.css';

function Shell() {
  return (
    <>
${shellJsx}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
${routes}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
`;
}

// ─── Generacion de src/pages/<PageId>.tsx ─────────────────────────────────────

/**
 * Genera el contenido de un archivo de pagina.
 *
 * @param {object} page - Objeto de pagina con id, path, title y body
 * @param {number} grid - Numero de columnas del grid
 * @returns {string}
 */
function generatePageTsx(page, grid) {
    // Recoger componentes de biblioteca usados en esta pagina
    const used = new Set();
    walkTree(page.body, node => {
        if (!STRUCTURAL_COMPONENTS.has(node.component) && node.component) {
            used.add(node.component);
        }
    });

    const compImports = Array.from(used)
        .map(name => `import ${name} from '../components/${name.toLowerCase()}/${name.toLowerCase()}';`)
        .join('\n');

    const jsx = renderNode(page.body, 2, grid);

    return `import React from 'react';
${compImports ? compImports + '\n' : ''}
export default function ${capitalize(page.id)}() {
  return (
${jsx}
  );
}
`;
}

// ─── Funcion principal ────────────────────────────────────────────────────────

/**
 * Genera App.tsx y src/pages/<PageId>.tsx en el proyecto copiado por move.js.
 *
 * @param {object} moved - Objeto devuelto por move()
 * @returns {object} El mismo objeto moved (los archivos ya estan en disco)
 * @throws {Error} si alguna escritura falla
 */
function generateImports(moved) {
    const { projectPath, pages, grid } = moved;
    const srcDir   = path.join(projectPath, 'src');
    const pagesDir = path.join(srcDir, 'pages');

    // Asegurar que src/pages/ existe
    fs.mkdirSync(pagesDir, { recursive: true });

    // ─── App.tsx ─────────────────────────────────────────────────────────────
    try {
        const appContent = generateAppTsx(moved);
        fs.writeFileSync(path.join(srcDir, 'App.tsx'), appContent, 'utf8');
        log('import', 'Generando App.tsx', 'OK');
    } catch (err) {
        log('import', 'Generando App.tsx', 'FALLO');
        throw new Error(`Error al generar App.tsx: ${err.message}`);
    }

    // ─── Paginas ──────────────────────────────────────────────────────────────
    for (const page of pages) {
        const fileName = `${capitalize(page.id)}.tsx`;
        try {
            const content = generatePageTsx(page, grid);
            fs.writeFileSync(path.join(pagesDir, fileName), content, 'utf8');
            log('import', `Generando pagina '${page.id}'`, 'OK');
        } catch (err) {
            log('import', `Generando pagina '${page.id}'`, 'FALLO');
            throw new Error(`Error al generar pagina '${page.id}': ${err.message}`);
        }
    }

    log('import', 'Imports completados.');

    return moved;
}

module.exports = { generateImports };