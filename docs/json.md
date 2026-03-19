# Documentación: Estructura JSON del Diseñador de Interfaces

## 1. Introducción

El sistema de generación de interfaces utiliza un archivo JSON como representación estructural del diseño creado mediante el editor visual.

Este JSON actúa como **fuente de verdad (source of truth)** del diseño y será interpretado posteriormente por un backend desarrollado en Node.js para generar automáticamente un proyecto React funcional.

La estructura del JSON se divide en dos partes principales:

* **Header** → Información del proyecto
* **Body** → Jerarquía de componentes de la interfaz

---

# 2. Estructura General

```json
{
  "header": {},
  "body": {}
}
```

### Header

Contiene la información global del proyecto.

### Body

Contiene la estructura jerárquica de los componentes visuales de la página.

---

# 3. Header

El `header` contiene metadatos necesarios para generar el proyecto.

## Ejemplo

```json
{
  "header": {
    "projectName": "mi-web",
    "template": "react-basic",
    "version": "1.0",
    "grid": 12
  }
}
```

## Propiedades

| Propiedad   | Descripción                            |
| ----------- | -------------------------------------- |
| projectName | Nombre del proyecto generado           |
| template    | Plantilla base de React a utilizar     |
| version     | Versión del esquema JSON               |
| grid        | Número de columnas del sistema de grid |

---

# 4. Body

El `body` representa la estructura visual de la página.

Los componentes se organizan en forma de **árbol jerárquico**, permitiendo hasta **5 niveles de profundidad**.

Cada nodo del árbol representa un componente visual.

---

# 5. Estructura de un nodo

Cada nodo del árbol sigue la siguiente estructura:

```json
{
  "id": "unique-id",
  "component": "NombreDelComponente",
  "bootstrap": {},
  "props": {},
  "children": []
}
```

## Propiedades

| Propiedad | Descripción                            |
| --------- | -------------------------------------- |
| id        | Identificador único del componente     |
| component | Nombre del componente en la biblioteca |
| bootstrap | Información de layout (grid)           |
| props     | Propiedades del componente             |
| children  | Subcomponentes anidados                |

---

# 6. Sistema de Grid (Bootstrap Layout)

El campo `bootstrap` define la posición del componente dentro de la cuadrícula.

Ejemplo:

```json
{
  "bootstrap": {
    "colStart": 1,
    "colSpan": 6
  }
}
```

## Propiedades

| Propiedad | Descripción                 |
| --------- | --------------------------- |
| colStart  | Columna inicial             |
| colSpan   | Número de columnas ocupadas |

---

# 7. Props del componente

Los `props` almacenan las propiedades que el componente recibirá en React.

Ejemplo en React:

```jsx
<Button label="Comprar" color="primary" />
```

Representación en JSON:

```json
{
  "props": {
    "label": "Comprar",
    "color": "primary"
  }
}
```

Tipos de valores permitidos:

* String
* Number
* Boolean
* Object
* Array

Ejemplo:

```json
{
  "props": {
    "title": "Producto",
    "price": 19.99,
    "featured": true,
    "tags": ["nuevo", "oferta"]
  }
}
```

---

# 8. Jerarquía de Componentes

El sistema permite una jerarquía de hasta **5 niveles**.

## Ejemplo de jerarquía

```
Page
 └ Section
     └ Container
         └ Card
             └ Button
```

Esto permite crear layouts complejos manteniendo una estructura controlada.

---

# 9. Ejemplo Completo

```json
{
  "header": {
    "projectName": "mi-web",
    "template": "react-basic",
    "version": "1.0",
    "grid": 12
  },

  "body": {
    "id": "page-root",
    "component": "Page",
    "bootstrap": {
      "colStart": 1,
      "colSpan": 12
    },

    "props": {},

    "children": [
      {
        "id": "section-1",
        "component": "Section",
        "bootstrap": {
          "colStart": 1,
          "colSpan": 12
        },

        "props": {
          "background": "light"
        },

        "children": [
          {
            "id": "container-1",
            "component": "Container",
            "bootstrap": {
              "colStart": 1,
              "colSpan": 12
            },

            "props": {},

            "children": [
              {
                "id": "card-1",
                "component": "Card",
                "bootstrap": {
                  "colStart": 4,
                  "colSpan": 4
                },

                "props": {
                  "title": "Producto"
                },

                "children": [
                  {
                    "id": "text-1",
                    "component": "Text",
                    "bootstrap": {
                      "colStart": 1,
                      "colSpan": 12
                    },

                    "props": {
                      "text": "Descripción del producto"
                    },

                    "children": []
                  },

                  {
                    "id": "button-1",
                    "component": "Button",
                    "bootstrap": {
                      "colStart": 5,
                      "colSpan": 2
                    },

                    "props": {
                      "label": "Comprar",
                      "color": "primary"
                    },

                    "children": []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

# 10. Interpretación del JSON

El archivo JSON será procesado por el backend de Node.js siguiendo este flujo:

```
Leer JSON
   ↓
Analizar header
   ↓
Crear proyecto React base
   ↓
Recorrer árbol de componentes
   ↓
Generar JSX automáticamente
   ↓
Copiar componentes desde biblioteca
   ↓
Construir proyecto final
```

---

# 11. Ventajas de este sistema

* Separación entre diseño y código
* Generación automática de interfaces
* Estructura escalable
* Fácil interpretación por backend
* Compatible con renderizado dinámico en React

---

# 12. Uso en el proyecto

El flujo completo del sistema será:

```
Editor visual
     ↓
Generación de JSON
     ↓
Backend Node interpreta JSON
     ↓
Generación automática del proyecto React
```

Este enfoque permite construir aplicaciones web de forma visual manteniendo una arquitectura basada en componentes.
