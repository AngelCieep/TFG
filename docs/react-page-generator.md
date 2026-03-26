# React Page Generator

## Descripción del proyecto

React Page Generator es una herramienta que permite generar automáticamente aplicaciones React a partir de un diseño visual.

El usuario no escribe código directamente. En su lugar, utiliza un editor visual basado en bloques arrastrables para construir una interfaz web. Este diseño se transforma en un archivo JSON que describe la estructura de la página.

A partir de ese JSON, un generador desarrollado en Node.js crea un proyecto React funcional.

---

## Objetivo

El objetivo del proyecto es automatizar la creación de interfaces web en React, reduciendo la necesidad de escribir código manualmente.

El sistema debe ser capaz de:

- Interpretar un diseño representado en JSON
- Generar una estructura de proyecto React
- Insertar componentes en función del diseño
- Crear un proyecto listo para ejecutarse

---

## Funcionamiento general

El sistema funciona en tres pasos:

1. El usuario diseña una página web visualmente mediante bloques
2. El sistema genera un archivo JSON con la estructura del diseño
3. El generador interpreta ese JSON y crea un proyecto React

El JSON actúa como la única fuente de verdad del diseño.

---

## Estructura conceptual del JSON

El JSON describe:

- El proyecto
- Las páginas
- Los bloques dentro de cada página
- El tipo de componente de cada bloque
- La posición dentro de un grid
- Las propiedades del componente

Cada bloque representa un componente de React.

Ejemplo conceptual:

- Un bloque de tipo "Text" representa un componente de texto
- Un bloque de tipo "Button" representa un botón
- Cada bloque tiene propiedades como texto, etiquetas o enlaces

---

## Generación del proyecto

El generador debe:

- Leer el JSON
- Identificar los componentes utilizados
- Crear una estructura de proyecto React
- Generar código JSX basado en el diseño
- Insertar los componentes en su posición correspondiente
- Preparar el proyecto para ser ejecutado

El resultado final debe ser un proyecto que funcione con:

npm install  
npm run dev  

---

## Biblioteca de componentes

El sistema se basa en una colección de componentes previamente definidos.

Estos componentes representan los bloques disponibles en el diseñador visual.

El generador utilizará estos componentes para construir la interfaz final.

---

## Reglas del sistema

- El JSON define completamente la interfaz
- Cada bloque del JSON se traduce en un componente React
- El generador no crea lógica compleja, solo estructura visual
- Los componentes deben ser reutilizables
- El sistema debe ser extensible (añadir nuevos componentes fácilmente)

---

## Limitaciones

- Solo se genera el frontend (React)
- No se implementa lógica de negocio compleja
- Los componentes deben existir previamente
- No es un editor de diseño gráfico avanzado

---

## Resultado esperado

Dado un JSON válido, el sistema debe generar un proyecto React funcional que represente visualmente el diseño creado por el usuario.

El usuario podrá ejecutar ese proyecto y modificarlo manualmente si lo desea.