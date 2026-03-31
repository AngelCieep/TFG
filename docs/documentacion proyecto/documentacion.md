REACT PAGE GENERATOR




Angel Mariblanca y Daniel Domínguez.
Índice

Descripción del proyecto
Planificación del proyecto
Definición de alcance
Necesidades a cubrir
Objetivos que cumplir
Límites establecidos
Análisis de viabilidad
Viabilidad técnica
Viabilidad económica
Planificación temporal
Distribución temporal
Asignación de recursos y roles
Roles de cada miembro del equipo
Organización de tareas por prioridad

Descripción del Proyecto

React Page Generator consiste en un editor web el cual te permite diseñar visualmente páginas web basadas en react mediante un sistema de bloques arrastrables.
El usuario podrá construir interfaces web utilizando componentes predefinidos organizados en una cuadrícula de 12 columnas. Este diseño no genera código directamente, sino que se transforma en un archivo JSON que describe la estructura de la página.
Posteriormente, un backend desarrollado en Node.js interpretará ese JSON y generará automáticamente un proyecto React funcional a partir de una plantilla base, insertando los componentes necesarios y organizando el proyecto.
El objetivo es simplificar y estandarizar la creación de interfaces web modernas, permitiendo generar proyectos simples ya estructurados, los cuales puedes editar fácilmente para producir un producto de calidad en menor tiempo.

Planificación del proyecto
Definición de alcance
Necesidades a cubrir:
Se buscan incluir los siguientes elementos:
Editor visual para poder diseñar rápidamente.
Sistema de bloques arrastrables para decidir el layout.
Generar una preview en tiempo real. (lo estamos revisando)
Traducción del diseño visual a un archivo JSON.
Biblioteca de componentes de React.
Backend que lea el JSON y genere el proyecto.
Un método para exportar el proyecto.
Un backend estándar que se pueda usar con todos los proyectos creados. (en revisión)

Objetivos que cumplir
Buscamos automatizar las tareas repetitivas de React, dando una interfaz visual con la que se pueden obviar todos esos procesos. El coste es que todo lo que quieras usar en el proyecto tienes que haberlo programado antes.
Nuestro sistema se encargaría de ubicar componentes y escribir rutas, nada de código real. Buscamos que los proyectos generados sean compatibles con servidores ya existentes, haciendo que los componentes de cada proyecto hagan llamadas de una forma estandarizada y repetible.
Objetivos específicos
Crear un editor visual funcional
Implementar sistema drag & drop
Diseñar estructura JSON escalable
Desarrollar un generador automático en Node.js
Implementar biblioteca de componentes
Generar proyectos ejecutables
Permitir futura conexión con backend externo mediante API
Límites establecidos
El sistema simplemente generará un frontend, un proyecto de react con componentes prefabricados.
No será un CMS (Sistema de Gestión de Contenidos, herramienta de gestión de páginas web sin necesidad de programar) completo, tendrás que seguir modificando código después de la generación del proyecto.
El contenido es simple, no se busca gestionar contenido excesivamente complejo y dinámico.
Los componentes estarán limitados a los que estén en la biblioteca.
El editor simplemente te permite crear la base y algunos elementos, no es una herramienta de diseño gráfico avanzada.

Análisis de viabilidad 
El proyecto es viable porque se basa en React, una tecnología consolidada y ampliamente utilizada en el desarrollo web actual, junto con librerías que nos permiten implementar funcionalidades como bloques arrastrables o animaciones simples.
Es una adaptación para darle una interfaz visual al proceso de crear un proyecto de react y automatizar procesos de preparación y organización de la web.
Viabilidad técnica
El proyecto es técnicamente viable porque:
React permite renderizar interfaces desde estructuras de datos JSON.
Node.js permite generación de archivos junto con manipulación de archivos. 
Existen librerías para drag & drop y grids visuales.
La generación de proyectos mediante plantillas es un proceso ampliamente utilizado (ej: CLI frameworks).
El uso de JSON como estructura intermedia simplifica el sistema.
No requiere tecnologías experimentales.
Viabilidad económica
Prácticamente no tiene coste de desarrollo, ya que las herramientas son opensource y no requiere licencias de ningún tipo.
Se está enfocando como herramienta de trabajo local, pero una posible ampliación es subirlo a internet y que se hostee desde la nube, añadiendo bibliotecas de componentes públicas que se retroalimentan de componentes creados por usuarios.

Planificación temporal
El desarrollo se realizará por fases:
Investigación tecnológica
Desarrollo del editor visual
Sistema de generación JSON
Backend generador de proyectos
Integración del sistema completo
Pruebas y optimización
Documentación final
El desarrollo del proyecto se ha organizado en semanas, siguiendo una progresión incremental donde cada fase añade funcionalidad al sistema y permite validar avances antes de continuar.
Distribución temporal:
Semana 1 (9-15 Marzo)
Diseño inicial del mockup utilizando Figma para definir la estructura visual del editor.
Instalación y configuración básica del proyecto, tanto en React como en Node.js.
Desarrollo inicial del diseñador y del entorno de trabajo en Node.
La creación del frontend (no funcional, sin conexión con el backend).
Definición de la estructura del JSON, estableciendo la jerarquía del sistema: estructura base (bootstrap), componentes y organización interna de los mismos.
Semana 2 (16-22 Marzo)
Desarrollo del Producto Mínimo Viable, centrado en definir el funcionamiento del JSON y la estructura del proyecto en Node.js.
Implementación del sistema para que el diseñador genere JSON a partir del diseño visual.
Avance del backend para demostrar que es capaz de insertar componentes en una plantilla base.
Implementación de la exportación del diseño a un archivo JSON interpretable por el backend.
Comando de node para poder interpretar el json:
Lectura del archivo JSON
Análisis del diseño
Creación del proyecto base
Semana 3 (23-29 Marzo)
Continuación del desarrollo del Producto Mínimo Viable, mejorando la estructura del JSON y su integración con el backend.
Avance del sistema para permitir que el backend manipule e inserte componentes dentro de una plantilla de forma dinámica.
Mejora del sistema de exportación del diseño a JSON.
Comando de node para poder interpretar el json:
Generación de los archivos React
Inserción de componentes desde la biblioteca
Organización del proyecto final
Preparación del proyecto para ejecución
Semana 4 (30 Marzo - 5 Abril)
Consolidación del Producto Mínimo Viable, asegurando el correcto funcionamiento del sistema completo.
Mejora del backend para gestionar correctamente la inserción y organización de componentes dentro de la plantilla.
Optimización del sistema de exportación a JSON para garantizar su correcta interpretación.
Semana 5 (6 - 11 Abril)
Implementación de funcionalidades adicionales, como la indexación de múltiples páginas dentro del proyecto.
Desarrollo de sistemas de exportación avanzados, permitiendo generar el proyecto completo desde el diseñador o descargarlo en formato JSON.
Posible integración del diseñador como builder, generando directamente un archivo comprimido (zip) con el proyecto final.
Inicio de la expansión de la biblioteca de componentes disponibles.
Semanas posteriores (Abril - Mayo)
Fase centrada en pruebas, detección de errores y optimización del sistema.
Se trabajará en mejorar la estabilidad del generador, corregir fallos detectados durante el uso y ampliar la biblioteca de componentes y templates disponibles.

Asignación de recursos y roles
El equipo está formado por dos integrantes, ambos con un papel clave en el desarrollo del proyecto y con una distribución de tareas basada en especialización técnica.
Roles de cada miembro del equipo
Angel Mariblanca
Se encarga principalmente del backend en Node.js.
Sus tareas incluyen la verificación de archivos generados a partir del JSON, la gestión del sistema de generación del proyecto, así como el movimiento e importación de componentes dentro del template base.
Es el responsable principal del generador de webs.
Actúa como líder del equipo debido a que la idea del proyecto parte de él, aunque ambos miembros tienen el mismo nivel de importancia dentro del grupo.
Daniel Domínguez
Se encarga de la gestión del diseñador visual y colabora en el backend de Node.js.
Su trabajo se centra especialmente en la generación del JSON a partir del diseño y en el análisis de este dentro del backend para comenzar a posicionar los componentes dentro de la plantilla.
También participa en la integración entre el editor visual y el sistema de generación.

Organización de tareas por prioridad
Las tareas del proyecto se han organizado siguiendo un orden de prioridad basado en dependencias técnicas:
Primero se desarrolla la estructura base del sistema (editor visual y definición del JSON), ya que todo el proyecto depende de esta representación.
Posteriormente se implementa el backend generador en Node.js, encargado de interpretar el JSON y construir el proyecto React.
Una vez el sistema es funcional (MVP), se añaden mejoras como exportación avanzada, gestión de múltiples páginas y ampliación de la biblioteca de componentes.
Finalmente, se dedica una fase completa a pruebas, corrección de errores y optimización, asegurando la estabilidad del sistema antes de dar el proyecto por finalizado.
