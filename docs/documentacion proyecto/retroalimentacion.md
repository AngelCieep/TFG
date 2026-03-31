# Retroalimentación: documentación oficial vs documentación técnica

Este documento recoge las diferencias, ausencias y contradicciones detectadas al comparar
la documentación oficial del proyecto (`documentacion.md`) con todos los archivos de
documentación técnica (`docs/disenador/`, `docs/pipeline/`, `docs/proyecto/`, `docs/uso/`).

Se organiza en dos sentidos de retroalimentación:

- **Sección A** — Información útil de la documentación oficial que **no está recogida** en los MDs técnicos.
- **Sección B** — Información técnica concreta de los MDs que **no está recogida** en la documentación oficial.
- **Sección C** — Contradicciones o desalineaciones entre ambas.

---

## A. Documentación oficial → MDs técnicos (ausencias en los técnicos)

### A1. Preview en tiempo real
La documentación oficial menciona "Generar una preview en tiempo real" como necesidad en revisión.
Ningún MD técnico documenta ni descarta esta funcionalidad. Debería quedar registrada en
`diseñador.md` o en una futura sección de `flujo.md` indicando si está planificada,
descartada o pendiente.

### A2. Backend estándar reutilizable
La doc oficial menciona "Un backend estándar que se pueda usar con todos los proyectos generados"
como una necesidad en revisión. No hay ninguna mención en los MDs técnicos. Si esta idea
evoluciona, debería documentarse en `proyecto/react-page-generator.md` o en un MD propio.

### A3. Exportación en ZIP
La semana 5 de la planificación temporal contempla "generar directamente un archivo comprimido
(zip) con el proyecto final". Esta funcionalidad no está documentada en ningún MD técnico.
No hay ninguna entrada en `build.md`, `flujo.md` ni en el pipeline sobre empaquetado ZIP.

### A4. Conexión con backend externo mediante API
Uno de los objetivos específicos es "Permitir futura conexión con backend externo mediante API".
Los MDs técnicos no dedican ni una sección a esto, ni como hoja de ruta futura. Podría
documentarse como expansión futura en `react-page-generator.md`.

### A5. Ampliación de la biblioteca de componentes
La doc oficial menciona en la planificación la "expansión de la biblioteca de componentes
disponibles" durante las semanas posteriores (Abril-Mayo). Los MDs técnicos no describen
cómo se añade un nuevo componente a la biblioteca (qué archivos crear, estructura esperada,
proceso para que `verify.js` lo detecte).

### A6. Biblioteca de componentes pública y retroalimentación comunitaria
La doc oficial contempla en su viabilidad económica una posible ampliación hacia la nube
con "bibliotecas de componentes públicas que se retroalimentan de componentes creados por
usuarios". No hay ninguna mención en documentación técnica.

### A7. Roles del equipo y autoría del código
La doc oficial especifica que Angel es responsable del backend/generador y Daniel del
diseñador visual. Esta separación de responsabilidades no existe en ningún MD técnico,
lo que puede dificultar la trazabilidad al revisar el proyecto externamente.

### A8. Limitaciones explícitas del sistema
La doc oficial distingue claramente que: el sistema no es un CMS, no gestiona contenido
complejo y dinámico, no es una herramienta de diseño gráfico avanzada. Estas limitaciones
no están recogidas en ningún MD técnico. El MD de `react-page-generator.md` tiene una
sección de "Limitaciones" muy breve que podría ampliarse.

---

## B. MDs técnicos → Documentación oficial (ausencias en la oficial)

### B1. El concepto de Shell y el mecanismo de candado
Los MDs técnicos (`diseñador.md`, `json.md`) definen el **shell** como el layout global
compartido entre todas las páginas, y el **candado** como el mecanismo visual para que el
usuario decida si un componente es global o pertenece a una página. La documentación oficial
no menciona ni el shell ni el candado en ningún momento.

### B2. El nodo Outlet
Los MDs técnicos explican que `Outlet` es un nodo especial del shell que actúa como marcador
para el enrutador de React. La doc oficial no menciona en ningún momento React Router ni el
concepto de outlet.

### B3. Las cinco fases del pipeline con nombres
La doc oficial habla vagamente de "Comando de node para interpretar el JSON" y lista en
semanas las capacidades esperadas. Los MDs técnicos definen con precisión cinco fases
ordenadas: **parse → verify → move → import → launch**. La doc oficial no usa esta
terminología ni esta estructura.

### B4. La fase parser.js
La doc oficial no menciona en ningún momento la existencia de una fase de parseo/validación
previa al resto del pipeline. `flujo.md` y `build.md` sí la documentan como primera fase.

### B5. El sistema de logging del pipeline
Los MDs definen un sistema de logging completo con formato fijo `[fase] descripción... RESULTADO`,
niveles OK/FALLO/AVISO, y resúmenes por fase. La doc oficial no menciona en absoluto el
sistema de trazabilidad en consola.

### B6. Detección de solapamientos en el grid
`verify.js` detecta colisiones entre nodos hermanos con layout superpuesto y emite un
warning no bloqueante. La doc oficial no menciona esta validación en ningún punto.

### B7. Componentes estructurales (Root, Section, Container)
Los MDs técnicos definen `Root`, `Section` y `Container` como componentes estructurales
que no existen en `repository/components/` y reciben tratamiento especial en el pipeline.
La doc oficial solo menciona "componentes predefinidos" sin distinguir entre estructurales
y de biblioteca.

### B8. Generación de CSS Grid inline
`import.js` genera posicionamiento CSS Grid mediante estilos inline
(`gridColumnStart`, `gridColumnEnd`, `gridRowStart`, `gridRowEnd`). La doc oficial menciona
el grid de 12 columnas como concepto visual pero no describe cómo se traduce a CSS.

### B9. Arranque automático del proyecto generado (fase launch)
`launch.md` y `flujo.md` documentan que el pipeline ejecuta automáticamente `npm install`,
lanza `npm run dev` y abre el navegador en `http://localhost:5173` tras 2 segundos.
La doc oficial solo menciona `npm install` y `npm run dev` como comandos manuales del usuario.

### B10. Estructura exacta del JSON
La doc oficial describe el JSON de forma conceptual ("describe componentes, posición, props").
Los MDs técnicos (`json.md`) definen la estructura completa con esquema, tabla de propiedades,
tipos permitidos y restricciones para cada campo (`installation`, `pages`, `body`, `layout`,
`props`, `children`).

### B11. Profundidad máxima del árbol de componentes
`json.md` especifica que los componentes pueden anidarse hasta **5 niveles de profundidad**.
La doc oficial no menciona este límite.

### B12. Fórmula de cálculo de filas por contenedor
`grid.md` define la fórmula matemática `totalRows = max(rowStart_i + rowSpan_i - 1)` y
el cálculo recursivo de abajo a arriba. La doc oficial no describe ningún aspecto del
sistema de filas, ni que son dinámicas en altura.

### B13. Dos servidores distintos con puertos distintos
`inicio.md` documenta el servidor del TFG en el puerto **3000** y `launch.md` documenta
el proyecto generado en el puerto **5173** (Vite). La doc oficial no distingue entre ambos
entornos de ejecución.

### B14. Requisito de versión de Node.js
`inicio.md` especifica Node.js v18 o superior. La doc oficial no menciona ningún requisito
de versión.

### B15. La distinción entre repository/ y el proyecto generado
Los MDs técnicos distinguen con precisión entre `repository/components/` y
`repository/templates/` (fuentes) y el directorio del proyecto generado (salida). La doc
oficial no describe esta arquitectura de repositorio.

### B16. Utilidades compartidas: functions.js
`flujo.md` menciona `functions.js` como módulo con utilidades compartidas (`STRUCTURAL_COMPONENTS`,
`walkTree`, `log`). No se menciona en la doc oficial.

### B17. Comportamiento ante sobreescritura de proyectos existentes
`move.md` especifica que si la carpeta de destino ya existe se sobreescribe sin preguntar
("suficiente para el TFG"). La doc oficial no menciona este comportamiento.

---

## C. Contradicciones y desalineaciones entre documentos

### C1. Generación ZIP vs generación local directa
La doc oficial (semana 5) contempla "generar un archivo comprimido (zip) con el proyecto
final". La implementación técnica documentada genera el proyecto directamente en un directorio
local y lo arranca automáticamente, sin ZIP. Ningún MD técnico documenta la exportación ZIP,
lo que sugiere que esta funcionalidad quedó pendiente o fue descartada sin registro.

### C2. Editor web como disparador vs CLI como disparador
La doc oficial describe el sistema como un "editor web" que hace llamadas al backend para
generar el proyecto. Los MDs técnicos (`build.md`, `flujo.md`) documentan únicamente un
**CLI** (`npm run build -- <ruta.json>`) como punto de entrada. No hay documentación técnica
de un endpoint HTTP como receptor del JSON desde el diseñador.

**Referencia relevante:** `flujo.md` y `proyecto/react-page-generator.md` no mencionan HTTP
en absoluto. Solo `move.md` menciona "en v2 esta fase podria sustituirse por descargas HTTP"
como posible evolución futura.

### C3. Puerto del servidor: 3000 (official) vs 5173 (launch)
La doc oficial (implícitamente, por `inicio.md`) está asociada al servidor Node.js del TFG
en el puerto 3000. `launch.md` documenta el proyecto generado en el puerto 5173. Son
entornos distintos pero no hay ningún documento que haga esta distinción explícita para
quien lea ambas fuentes por primera vez.

### C4. "Semanas posteriores" vs estado actual de la biblioteca
La doc oficial planifica para Abril-Mayo la "expansión de la biblioteca de componentes".
El repositorio actual contiene solo 4 componentes: `header1`, `header2`, `footer1`,
`footer2`. Los MDs técnicos no documentan el estado actual de la biblioteca ni qué
componentes están disponibles.

### C5. Preview en tiempo real: referenciada pero no resuelta
La doc oficial lista la preview en tiempo real como necesidad "en revisión". Los MDs técnicos
no la mencionan ni para indicar que fue descartada. Queda como funcionalidad en un estado
ambiguo sin cierre documental.

### C6. Logging: formato real vs formato en logging.md
`import.md` documenta los mensajes de la fase import como:
```
[import] Generando App.tsx...                             OK
[import] Generando pagina 'home'...                       OK
```
Pero `logging.md` documenta la misma fase con mensajes distintos:
```
[import] Generando imports en App.tsx...                  OK
[import] Generando JSX...                                 OK
```
Hay una inconsistencia interna entre los dos MDs técnicos sobre los mensajes exactos
de la fase import.
