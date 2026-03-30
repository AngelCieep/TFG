# Estructura JSON del diseñador

## 1. Introducción

El sistema de generación de interfaces utiliza un archivo JSON como fuente de verdad del diseño
creado mediante el editor visual. Este JSON es interpretado por el pipeline de Node.js para
generar automáticamente un proyecto React funcional con soporte de múltiples páginas.

La estructura del JSON se divide en dos partes principales:

- **`installation`** → Información global del proyecto, plantilla, y shell compartido entre páginas.
- **`pages`** → Array de páginas, cada una con su ruta, título y árbol de componentes.

---

## 2. Estructura general

```json
{
  "installation": { ... },
  "pages": [ ... ]
}
```

---

## 3. installation

Contiene los metadatos del proyecto y el **shell**: el layout global que se renderiza en `App.tsx`
y es compartido por todas las páginas.

```json
{
  "installation": {
    "projectName": "mi-web",
    "template": "template1",
    "version": "1.0",
    "grid": 12,
    "shell": [
      { "component": "Header1", "props": { "brand": "Mi Web", "links": [] } },
      { "component": "Outlet" },
      { "component": "Footer1", "props": { "copyright": "© 2026 Mi Web." } }
    ]
  }
}
```

### Propiedades de installation

| Propiedad   | Tipo     | Descripción                                                   |
|-------------|----------|---------------------------------------------------------------|
| projectName | string   | Nombre del proyecto generado. Nombre de la carpeta de salida. |
| template    | string   | Nombre de la plantilla base en `repository/templates/`.       |
| version     | string   | Versión del esquema JSON.                                     |
| grid        | number   | Número de columnas de la cuadrícula. Por defecto 12.          |
| shell       | array    | Lista de componentes del layout global. Ver sección 3.1.      |

### 3.1 shell

El `shell` es un array de nodos de componente que forman el layout global de la aplicación.
Se renderizan en `App.tsx` envolviendo el contenido de todas las páginas.

Cada nodo del shell tiene solo `component` y `props` — sin `id`, `layout` ni `children`.

| Propiedad | Tipo   | Descripción                                      |
|-----------|--------|--------------------------------------------------|
| component | string | Nombre del componente. Puede ser un componente de biblioteca o `Outlet`. |
| props     | object | Propiedades que se pasan al componente.          |

**`Outlet`** es un nodo especial que marca el hueco donde React Router inyecta el contenido
de la página activa. El shell debe contener exactamente un nodo `Outlet`.

---

## 4. pages

Array de páginas de la aplicación. Cada elemento representa una ruta navegable.

```json
{
  "pages": [
    {
      "id": "home",
      "path": "/",
      "title": "Inicio - Mi Web",
      "body": { ... }
    },
    {
      "id": "about",
      "path": "/about",
      "title": "Sobre nosotros",
      "body": { ... }
    }
  ]
}
```

### Propiedades de cada página

| Propiedad | Tipo   | Descripción                                                      |
|-----------|--------|------------------------------------------------------------------|
| id        | string | Identificador único de la página. Usado como nombre del archivo `.tsx`. |
| path      | string | Ruta de React Router. Ej: `/`, `/about`, `/contacto`.           |
| title     | string | Texto que aparece en la pestaña del navegador (`<title>`).       |
| body      | object | Árbol de componentes de esta página. Ver sección 5.              |

---

## 5. body: árbol de componentes

El `body` de cada página es un árbol jerárquico de nodos. El nodo raíz siempre es `Root`.
Los componentes se pueden anidar hasta **5 niveles de profundidad**.

### Estructura de un nodo

```json
{
  "id": "unique-id",
  "component": "NombreDelComponente",
  "layout": {
    "colStart": 1,
    "colSpan": 12,
    "rowStart": 1,
    "rowSpan": 1
  },
  "props": {},
  "children": []
}
```

### Propiedades de un nodo

| Propiedad | Tipo   | Descripción                                                       |
|-----------|--------|-------------------------------------------------------------------|
| id        | string | Identificador único del nodo dentro de la página.                 |
| component | string | Nombre del componente. Debe existir en `repository/components/` o ser estructural. |
| layout    | object | Posición del componente en la cuadrícula. Ver sección 6.          |
| props     | object | Propiedades que se pasan al componente React.                     |
| children  | array  | Nodos hijos. Puede estar vacío (`[]`).                            |

---

## 6. layout: posicionamiento en cuadrícula

El campo `layout` define la posición del nodo dentro de la cuadrícula CSS Grid de su contenedor.
Usa cuatro valores: columna de inicio, ancho en columnas, fila de inicio, y alto en filas.

```json
{
  "layout": {
    "colStart": 1,
    "colSpan": 6,
    "rowStart": 2,
    "rowSpan": 1
  }
}
```

| Propiedad | Tipo   | Descripción                                               |
|-----------|--------|-----------------------------------------------------------|
| colStart  | number | Columna en la que empieza el componente. Base 1.          |
| colSpan   | number | Número de columnas que ocupa.                             |
| rowStart  | number | Fila en la que empieza el componente. Base 1.             |
| rowSpan   | number | Número de filas que ocupa.                                |

El número total de columnas disponibles está definido en `installation.grid` (por defecto 12).
El número total de filas por contenedor lo calcula el diseñador automáticamente.
Ver `grid.md` para los detalles del sistema de cuadrícula.

---

## 7. props

Los `props` almacenan las propiedades que el componente recibirá en React.

```json
{
  "props": {
    "label": "Comprar",
    "color": "primary",
    "price": 19.99,
    "featured": true,
    "tags": ["nuevo", "oferta"]
  }
}
```

Tipos de valores permitidos: `string`, `number`, `boolean`, `object`, `array`.

---

## 8. Componentes estructurales

Algunos nombres de componente son especiales. No tienen archivo en `repository/components/`
y el pipeline los trata como contenedores estructurales, no como componentes de biblioteca.

| Componente  | Uso                                                               |
|-------------|-------------------------------------------------------------------|
| `Root`      | Nodo raíz del `body` de cada página. Obligatorio como primer nodo. |
| `Section`   | Sección semántica dentro de una página.                           |
| `Container` | Contenedor de elementos dentro de una sección.                    |
| `Outlet`    | Marcador del hueco de páginas en el shell. Solo válido en `shell[]`. |

El pipeline los omite en la verificación de biblioteca y no copia ningún archivo para ellos.

---

## 9. Ejemplo completo

```json
{
  "installation": {
    "projectName": "mi-web-prueba",
    "template": "template1",
    "version": "1.0",
    "grid": 12,
    "shell": [
      {
        "component": "Header1",
        "props": {
          "brand": "Mi Web",
          "links": [
            { "label": "Inicio", "href": "/" },
            { "label": "Sobre nosotros", "href": "/about" }
          ]
        }
      },
      { "component": "Outlet" },
      {
        "component": "Footer1",
        "props": {
          "copyright": "© 2026 Mi Web. Todos los derechos reservados.",
          "links": [
            { "label": "Privacidad", "href": "/privacy" }
          ]
        }
      }
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
        "layout": { "colStart": 1, "colSpan": 12, "rowStart": 1, "rowSpan": 3 },
        "props": {},
        "children": [
          {
            "id": "section-1",
            "component": "Section",
            "layout": { "colStart": 1, "colSpan": 12, "rowStart": 1, "rowSpan": 1 },
            "props": { "background": "light" },
            "children": [
              {
                "id": "container-1",
                "component": "Container",
                "layout": { "colStart": 1, "colSpan": 12, "rowStart": 1, "rowSpan": 1 },
                "props": {},
                "children": [
                  {
                    "id": "text-1",
                    "component": "Text",
                    "layout": { "colStart": 1, "colSpan": 8, "rowStart": 1, "rowSpan": 1 },
                    "props": { "text": "Bienvenido a mi web generada automáticamente" },
                    "children": []
                  },
                  {
                    "id": "button-1",
                    "component": "Button",
                    "layout": { "colStart": 9, "colSpan": 4, "rowStart": 1, "rowSpan": 1 },
                    "props": { "label": "Saber más", "color": "primary" },
                    "children": []
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    {
      "id": "about",
      "path": "/about",
      "title": "Sobre nosotros - Mi Web",
      "body": {
        "id": "about-root",
        "component": "Root",
        "layout": { "colStart": 1, "colSpan": 12, "rowStart": 1, "rowSpan": 1 },
        "props": {},
        "children": [
          {
            "id": "about-text",
            "component": "Text",
            "layout": { "colStart": 1, "colSpan": 12, "rowStart": 1, "rowSpan": 1 },
            "props": { "text": "Esta web fue generada con React Page Generator." },
            "children": []
          }
        ]
      }
    }
  ]
}
```

