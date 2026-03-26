# Sistema de cuadrícula: columnas y filas

## 1. Propósito

El sistema de cuadrícula define cómo se posicionan los componentes dentro de su contenedor.
Cada componente declara en qué columna empieza, cuántas columnas ocupa, en qué fila empieza,
y cuántas filas ocupa.

El generador traduce estos valores a propiedades de CSS Grid (`grid-column`, `grid-row`).

---

## 2. Columnas

Las columnas son **fijas y proporcionales**. El número total de columnas se define en
`installation.grid` (por defecto 12, al igual que Bootstrap).

```json
"installation": {
  "grid": 12
}
```

Cada componente ocupa un rango de columnas dentro de ese total:

```json
"layout": {
  "colStart": 3,
  "colSpan": 6
}
```

Este componente empieza en la columna 3 y ocupa 6 columnas → ocupa las columnas 3 a 8.

### Propiedades de columna

| Propiedad | Base | Descripción                                                       |
|-----------|------|-------------------------------------------------------------------|
| colStart  | 1    | Columna en la que empieza el componente. La primera columna es 1. |
| colSpan   | —    | Número de columnas que ocupa. Mínimo 1.                           |

**Restricción**: `colStart + colSpan - 1 ≤ grid`. Un componente no puede salirse de la cuadrícula.

### Ejemplo de columnas (grid de 12)

```
Col:  1   2   3   4   5   6   7   8   9   10  11  12
      ├───┤   ┌───────────────────┐   ┌───────────────┐
      │ A │   │         B         │   │       C       │
      └───┘   └───────────────────┘   └───────────────┘
```

- A: `colStart: 1, colSpan: 1`
- B: `colStart: 3, colSpan: 5`
- C: `colStart: 9, colSpan: 4`

---

## 3. Filas

Las filas son **dinámicas en altura**. Su alto no es fijo — cada fila se dimensiona según
el contenido del componente más alto que ocupe esa fila (`grid-auto-rows: auto` en CSS Grid).

El diseñador no define el alto de las filas. Solo define en qué fila empieza cada componente
y cuántas filas ocupa.

```json
"layout": {
  "rowStart": 2,
  "rowSpan": 1
}
```

Este componente empieza en la fila 2 y ocupa 1 fila.

### Propiedades de fila

| Propiedad | Base | Descripción                                                    |
|-----------|------|----------------------------------------------------------------|
| rowStart  | 1    | Fila en la que empieza el componente. La primera fila es 1.    |
| rowSpan   | —    | Número de filas que ocupa. Mínimo 1.                           |

---

## 4. Cálculo del total de filas por contenedor

El número total de filas que necesita un contenedor se calcula a partir de sus hijos directos.
La fórmula es:

$$\text{totalRows} = \max_{i}(\text{rowStart}_i + \text{rowSpan}_i - 1)$$

Es decir: para cada hijo, se calcula la última fila que ocupa (`rowStart + rowSpan - 1`),
y el total de filas del contenedor es el máximo de esos valores.

### Ejemplo

Un contenedor tiene tres hijos:

| Componente | rowStart | rowSpan | Última fila = rowStart + rowSpan - 1 |
|------------|----------|---------|---------------------------------------|
| Header1    | 1        | 1       | 1                                     |
| Section    | 2        | 3       | 4                                     |
| Footer1    | 5        | 1       | 5                                     |

$$\text{totalRows} = \max(1, 4, 5) = 5$$

El contenedor necesita 5 filas. Este valor se pasa como `rowSpan` del nodo padre (Root),
y se puede incluir en `installation` como metadato informativo.

### Cálculo recursivo

El cálculo se aplica de dentro afuera. Primero se calculan las filas de los contenedores
más internos, y luego se propaga hacia arriba.

```
Root (rowSpan = 5)
 └ Header1     rowStart:1 rowSpan:1  → última fila: 1
 └ Section     rowStart:2 rowSpan:3  → última fila: 4
     └ Container rowStart:1 rowSpan:2 → (relativo al Section)
         └ Text   rowStart:1 rowSpan:1
         └ Button rowStart:2 rowSpan:1  → última fila: 2 → Section.rowSpan = 2 (no 3)
 └ Footer1     rowStart:5 rowSpan:1  → última fila: 5
```

Cada nivel calcula su propio `totalRows` sobre sus hijos directos. Las filas son **relativas
al contenedor padre**, no absolutas respecto a la página completa.

---

## 5. Cómo el diseñador asigna los valores

El diseñador calcula y asigna `rowStart` y `rowSpan` automáticamente al posicionar componentes:

1. Cuando el usuario arrastra un componente a una posición en la rejilla, el diseñador
   determina la fila y columna más cercanas.
2. Al soltar el componente, el diseñador asigna `rowStart` y `colStart` según esa posición,
   y `rowSpan`/`colSpan` según el tamaño del componente en la rejilla.
3. Al exportar el JSON, el diseñador recorre el árbol de abajo a arriba y calcula el
   `rowSpan` de cada contenedor usando la fórmula de `totalRows`.

---

## 6. Detección de solapamientos

Dos componentes hermanos (hijos del mismo padre) se solapan si sus **rectángulos se intersectan**
en la cuadrícula. Un rectángulo queda definido por:

$$\text{rectángulo} = [\text{colStart},\ \text{colEnd}) \times [\text{rowStart},\ \text{rowEnd})$$

donde:
- $\text{colEnd} = \text{colStart} + \text{colSpan}$
- $\text{rowEnd} = \text{rowStart} + \text{rowSpan}$

Dos componentes A y B se solapan si y solo si:

$$\text{colStart}_A < \text{colEnd}_B \quad\text{AND}\quad \text{colStart}_B < \text{colEnd}_A$$
$$\text{rowStart}_A < \text{rowEnd}_B \quad\text{AND}\quad \text{rowStart}_B < \text{rowEnd}_A$$

Ambas condiciones deben cumplirse simultáneamente.

### Falso positivo sin rowStart

Si un JSON solo incluye `colStart`/`colSpan` sin `rowStart`/`rowSpan`, la comparación de
columnas sola produce falsos positivos: componentes que comparten columnas pero están en
filas distintas (header en fila 1, footer en fila 5) aparecen como solapados cuando no lo están.

**Por eso `rowStart` y `rowSpan` son obligatorios en el schema.**

### Ejemplo de solapamiento real

```
Fila\Col:  1   2   3   4   5   6   7   8   9   10  11  12
  1        ┌───────────────────────────────────────────────┐
           │              Header1 (cols 1-12, fila 1)      │
           └───────────────────────────────────────────────┘
  2        ┌───────────────┐   ┌───────────────────────────┐
           │  A (cols 1-4) │   │   B (cols 5-12, fila 2)   │
           │  fila 2       │   └───────────────────────────┘
  3        │               │
           └───────────────┘
```

- Header1 y A: no se solapan (filas distintas).
- A y B: no se solapan (columnas distintas en la misma fila).

Solapamiento real: si A tuviese `colStart: 3, colSpan: 4` en fila 2 y B `colStart: 5, colSpan: 4`
también en fila 2, sus rangos de columna [3,7) y [5,9) se intersectan → solapamiento REAL.

---

## 7. Traducción a CSS

El generador aplica los valores de `layout` como estilos inline o clases CSS Grid:

```css
.componente {
  grid-column: colStart / span colSpan;
  grid-row:    rowStart / span rowSpan;
}
```

El contenedor padre recibe:

```css
.contenedor {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: auto;
}
```

Las filas se dimensionan automáticamente por contenido. No se fija ningún alto de fila.
