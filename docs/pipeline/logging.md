# Sistema de logging del pipeline

## 1. Proposito

El pipeline del generador ejecuta tres fases en orden: verificacion, copia de archivos e importaciones.
Cada fase emite mensajes por consola en tiempo real para que quien ejecute el servidor pueda
seguir el progreso operacion a operacion.

El logging es independiente de la gestion de errores. Los errores siguen acumulandose y
devolviendose en la respuesta HTTP con normalidad. El log no reemplaza ni altera ese mecanismo.

---

## 2. Reglas del sistema

- Todos los mensajes van a `console.log`, `console.warn` o `console.error` segun el resultado.
- Cada linea sigue el formato: `[fase]  Descripcion de la operacion...   RESULTADO`
- El resultado es siempre una de estas tres palabras: `OK`, `FALLO` o `AVISO`.
- Los mensajes se emiten linea a linea conforme se procesa cada operacion, no al final.
- Al terminar cada fase se emite una linea de resumen con el conteo de errores y avisos.
- Si una fase tiene errores bloqueantes, el pipeline se detiene y no ejecuta las siguientes.

---

## 3. Niveles por resultado

| Resultado | Funcion de consola | Cuando se usa                          |
|-----------|--------------------|----------------------------------------|
| `OK`      | `console.log`      | La operacion ha pasado sin problemas.  |
| `FALLO`   | `console.error`    | Error bloqueante. Detiene el pipeline. |
| `AVISO`   | `console.warn`     | Warning no bloqueante. Continua.       |

---

## 4. Formato de linea

```
[fase]   Descripcion de la operacion 'nombre'...   RESULTADO
```

- El prefijo de fase va entre corchetes y alineado a la izquierda: `[verify]`, `[move]`, `[import]`.
- La descripcion incluye el nombre del elemento afectado entre comillas simples cuando aplica.
- Los tres puntos `...` separan la descripcion del resultado.
- El resultado va al final de la misma linea.

---

## 5. Especificacion por fase

### 5.1 verify.js

Responsable de comprobar que la plantilla y los componentes existen en disco, y detectar
solapamientos de layout.

Mensajes a emitir, en orden:

```
[verify] Comprobando plantilla '<template>'...                OK
```
o
```
[verify] Comprobando plantilla '<template>'...                FALLO
```

Luego, por cada componente de la lista `components` del objeto normalizado
(excluyendo los STRUCTURAL_COMPONENTS):

```
[verify] Comprobando componente '<NombreComponente>'...       OK
```
o
```
[verify] Comprobando componente '<NombreComponente>'...       FALLO
```

Si se detecta un solapamiento de layout entre dos nodos hermanos:

```
[verify] Solapamiento detectado en '<id-padre>'...            AVISO
```

Linea de resumen al finalizar todos los checks:

```
[verify] Verificacion completada: <N> errores, <N> warnings.
```

Si hay errores, el pipeline se detiene aqui. No se ejecutan move ni import.

---

### 5.2 move.js

Responsable de copiar la plantilla base y los archivos de cada componente al directorio
de salida del proyecto generado.

Mensajes a emitir, en orden:

```
[move]   Copiando plantilla '<template>'...                   OK
```

Luego, por cada componente de la lista:

```
[move]   Copiando componente '<NombreComponente>'...          OK
```
o
```
[move]   Copiando componente '<NombreComponente>'...          FALLO
```

Linea de resumen al finalizar:

```
[move]   Moves completados: <N> errores.
```

Si hay errores, el pipeline se detiene aqui. No se ejecuta import.

---

### 5.3 import.js

Responsable de generar las sentencias de importacion y el JSX en el archivo App.tsx
del proyecto generado.

Mensajes a emitir, en orden:

```
[import] Generando imports en App.tsx...                      OK
```

```
[import] Generando JSX...                                     OK
```

Linea de resumen al finalizar:

```
[import] Imports completados.
```

---

## 6. Ejemplo de salida completa sin errores

```
[verify] Comprobando plantilla 'template1'...                 OK
[verify] Comprobando componente 'Header1'...                  OK
[verify] Comprobando componente 'Footer1'...                  OK
[verify] Verificacion completada: 0 errores, 0 warnings.
[move]   Copiando plantilla 'template1'...                    OK
[move]   Copiando componente 'Header1'...                     OK
[move]   Copiando componente 'Footer1'...                     OK
[move]   Moves completados: 0 errores.
[import] Generando imports en App.tsx...                      OK
[import] Generando JSX...                                     OK
[import] Imports completados.
```

---

## 7. Ejemplo de salida con errores en verify

```
[verify] Comprobando plantilla 'template99'...                FALLO
[verify] Comprobando componente 'Header1'...                  OK
[verify] Comprobando componente 'Button'...                   FALLO
[verify] Comprobando componente 'Card'...                     FALLO
[verify] Verificacion completada: 3 errores, 0 warnings.
```

El pipeline se detiene. No se ejecutan move ni import.

---

## 8. Implementacion en codigo

La funcion de log debe centralizarse en `functions.js` y exportarse para que
todos los archivos del pipeline la usen con el mismo formato.

Firma esperada:

```js
/**
 * Emite un mensaje de log por consola con el formato del pipeline.
 *
 * @param {string} fase      - Nombre de la fase: 'verify', 'move' o 'import'.
 * @param {string} mensaje   - Descripcion de la operacion.
 * @param {string} resultado - 'OK', 'FALLO' o 'AVISO'. Si se omite, no se imprime resultado.
 */
function log(fase, mensaje, resultado) { ... }
```

- Si `resultado` es `'FALLO'` usa `console.error`.
- Si `resultado` es `'AVISO'` usa `console.warn`.
- En cualquier otro caso usa `console.log`.
- Si `resultado` se omite (undefined), emite la linea sin resultado al final (para los resumenes).
