# El Diseñador: arquitectura y funcionamiento

## 1. Propósito

El diseñador es la herramienta visual que el usuario utiliza para construir la interfaz de su web.
Su salida es un archivo JSON que describe de forma completa la estructura de la web: qué componentes
aparecen, en qué posición, con qué propiedades, y en qué páginas.

Ese JSON es la entrada del pipeline de generación. El backend lo lee y produce un proyecto React
funcional listo para ejecutarse. El diseñador no genera código directamente — solo produce el JSON.

---

## 2. Conceptos fundamentales

### 2.1 Shell

El **shell** es el layout global de la aplicación. Se renderiza en `App.tsx` y es compartido
por todas las páginas. Típicamente contiene el header, el footer, y el marcador `Outlet` entre ellos.

El shell se define en el apartado `installation` del JSON como un array de nodos:

```json
"shell": [
  { "component": "Header1", "props": { "brand": "Mi Web", "links": [...] } },
  { "component": "Outlet" },
  { "component": "Footer1", "props": { "copyright": "© 2026 Mi Web." } }
]
```

Los nodos del shell no tienen `id`, `layout` ni `children` — son componentes directos sin posicionamiento
en cuadrícula. El shell se aplica a nivel de aplicación, no de página.

### 2.2 Outlet

`Outlet` es un nodo especial del shell. No corresponde a ningún componente de la biblioteca.
Representa el **hueco** donde React Router inyecta el contenido de la página activa.

Cuando se genera el código, `Outlet` se convierte en `<Outlet />` de `react-router-dom` en `App.tsx`.
Cada página individual se renderiza dentro de ese hueco.

Si el shell no incluye `Outlet`, las páginas nunca se mostrarán. El diseñador debe garantizar
que el shell contenga exactamente un `Outlet`.

### 2.3 Páginas

Cada página (`page`) tiene una ruta (`path`), un título para la pestaña del navegador (`title`),
y un árbol de componentes (`body`). El `body` es idéntico en estructura al árbol de componentes
descrito en `json.md`.

El generador produce un archivo `.tsx` por cada página (por ejemplo `Home.tsx`, `About.tsx`) y
configura React Router en `App.tsx` con una ruta por página.

---

## 3. El candado: componentes globales vs de página

En el diseñador, cada componente que se coloca en el canvas tiene un **botón de candado**.

- **Candado cerrado** → el componente es global. Se incluye en el `shell[]` de `installation`.
  Aparece en todas las páginas.
- **Candado abierto** → el componente pertenece a la página activa. Va al `body` de esa página.
  Solo aparece en esa página.

El diseñador gestiona internamente esta separación. Al exportar el JSON, lo que tiene candado
cerrado va a `installation.shell`, y el resto va al `body` de su página correspondiente.

### Ejemplo visual

```
┌──────────────────────────────────────┐
│  🔒 Header1       ← shell (global)   │
├──────────────────────────────────────┤
│  [Outlet]         ← hueco páginas    │
│  ┌────────────────────────────────┐  │
│  │  🔓 Section                   │  │
│  │    🔓 Container               │  │
│  │      🔓 Text                  │  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│  🔒 Footer1       ← shell (global)   │
└──────────────────────────────────────┘
```

---

## 4. Cómo se traduce al JSON

El diseñador produce el JSON con esta estructura:

```json
{
  "installation": {
    "projectName": "mi-web",
    "template": "template1",
    "version": "1.0",
    "grid": 12,
    "shell": [
      { "component": "Header1", "props": { ... } },
      { "component": "Outlet" },
      { "component": "Footer1", "props": { ... } }
    ]
  },
  "pages": [
    {
      "id": "home",
      "path": "/",
      "title": "Inicio - Mi Web",
      "body": {
        "id": "page-root",
        "component": "Root",
        "layout": { "colStart": 1, "colSpan": 12, "rowStart": 1, "rowSpan": 1 },
        "props": {},
        "children": [ ... ]
      }
    }
  ]
}
```

La correspondencia entre acciones del diseñador y campos del JSON es:

| Acción en el diseñador              | Campo en el JSON                         |
|-------------------------------------|------------------------------------------|
| Crear proyecto                      | `installation.projectName`               |
| Elegir plantilla                    | `installation.template`                  |
| Poner candado a un componente       | Nodo pasa a `installation.shell[]`       |
| Crear página nueva                  | Nuevo objeto en `pages[]`                |
| Asignar nombre a la pestaña         | `pages[i].title`                         |
| Asignar ruta a la página            | `pages[i].path`                          |
| Añadir componente a la página       | Nodo en `pages[i].body.children[]`       |
| Posicionar componente en la rejilla | `layout.colStart`, `colSpan`, `rowStart`, `rowSpan` |

---

## 5. Componentes estructurales

Algunos nodos del árbol no corresponden a archivos de la biblioteca de componentes.
Son contenedores estructurales que el generador interpreta de forma especial:

| Nombre      | Propósito                                                    |
|-------------|--------------------------------------------------------------|
| `Root`      | Nodo raíz del `body` de cada página. Contenedor principal.   |
| `Section`   | Sección semántica de la página.                              |
| `Container` | Contenedor de elementos dentro de una sección.               |
| `Outlet`    | Marcador del hueco de páginas dentro del shell.              |

El pipeline los excluye de la verificación de biblioteca y no intenta copiar ningún archivo para ellos.

---

## 6. Estado actual y limitaciones

### Implementado
- Un shell global compartido por todas las páginas
- N páginas, cada una con su ruta y árbol de componentes independiente
- Separación candado/página ya diseñada en el schema JSON

### Pendiente / expansión futura
- **Obligatoriedad de componentes**: en el futuro, `installation` podría forzar que el shell
  contenga obligatoriamente al menos un header y un footer, mostrando error en el diseñador
  si el usuario intenta exportar sin ellos.
- **Componentes de página obligatorios**: similar al punto anterior, pero por página.
- **Validación de Outlet único**: el diseñador debería impedir que el usuario coloque más de un
  `Outlet` en el shell, o que lo elimine por error.
- **Vista previa por página**: seleccionar qué página se previsualiza en el canvas.
- **Navegación entre páginas en el diseñador**: panel lateral con la lista de páginas creadas.
