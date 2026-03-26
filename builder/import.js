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
 *    2. Recorre el arbol de nodos (tree) recursivamente y genera el codigo JSX
 *       correspondiente a cada nodo, aplicando las clases de grid de Bootstrap
 *       segun los valores de layout.colStart y layout.colSpan de cada nodo.
 *
 *    3. Sobreescribe el contenido del archivo App.tsx con los imports generados
 *       y el JSX resultante, dejando el proyecto listo para ejecutarse.
 *
 */