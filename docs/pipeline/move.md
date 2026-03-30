# move.js — Copia de recursos al directorio de salida

## 1. Proposito

`move.js` es la tercera fase del pipeline. Recibe el objeto ya verificado por `verify.js`
y el directorio de salida (`outputDir`), y copia fisicamente los recursos del repositorio
local al directorio donde se creara el proyecto del usuario.

Esta fase es la que separa "tener los recursos en el repositorio" de "tener el proyecto
listo para importar". En una version futura, la logica de copia local podria sustituirse
por descargas HTTP desde un servidor remoto sin modificar el resto del pipeline.

---

## 2. Entradas y salidas

**Entrada:** objeto `verified` devuelto por `verify()` mas `outputDir` (string con la ruta
absoluta del directorio de salida, normalmente `process.cwd()`).

**Salida:** objeto con todos los campos de `verified` mas `projectPath` (ruta absoluta
al directorio del proyecto generado: `path.join(outputDir, projectName)`).

**Lanza:** `Error` si alguna operacion de copia falla, con el mensaje del error original.

---

## 3. Operaciones en orden

### 3.1 Copiar la plantilla

Origen:  `repository/templates/<template>/`
Destino: `<outputDir>/<projectName>/`

Se usa `fs.cpSync(src, dest, { recursive: true, filter })` con un filtro que excluye:
- `node_modules/`
- `.git/`

Si la carpeta de destino ya existe se sobreescribe sin preguntar (suficiente para el TFG).

Log emitido:
```
[move]   Copiando plantilla '<template>'...               OK
```
o
```
[move]   Copiando plantilla '<template>'...               FALLO
```

### 3.2 Copiar cada componente

Por cada nombre en `verified.components` (excluyendo los `STRUCTURAL_COMPONENTS`,
aunque verify ya los filtra antes):

Origen:  `repository/components/<name.toLowerCase()>/`
Destino: `<projectPath>/src/components/<name.toLowerCase()>/`

La carpeta de destino se crea automaticamente si no existe (la crea `fs.cpSync` con
`recursive: true`).

Log emitido por componente:
```
[move]   Copiando componente '<NombreComponente>'...      OK
```
o
```
[move]   Copiando componente '<NombreComponente>'...      FALLO
```

### 3.3 Linea de resumen

Al terminar todos los movimientos:
```
[move]   Moves completados: <N> errores.
```

Si hay errores, `move()` lanza un `Error` y el pipeline se detiene. No se ejecuta `import.js`.

---

## 4. Rutas relevantes

| Variable          | Valor                                              |
|-------------------|----------------------------------------------------|
| `TEMPLATES_DIR`   | `<raiz>/repository/templates/`                     |
| `COMPONENTS_DIR`  | `<raiz>/repository/components/`                    |
| `projectPath`     | `<outputDir>/<projectName>/`                       |
| Componentes dest  | `<projectPath>/src/components/<name>/`             |

---

## 5. Comportamiento ante errores

- Si la copia del template falla: se registra el error, se emite la linea de resumen
  con 1 error y se lanza un `Error` que aborta el pipeline.
- Si la copia de un componente falla: se acumula el error, se continua con los siguientes
  componentes para mostrar todos los fallos en el resumen, y al final se lanza el `Error`.

---

## 6. Logging

Sigue el formato definido en `docs/logging.md`. Usa la funcion `log(fase, mensaje, resultado)`
de `functions.js` con `fase = 'move'`.

---

## 7. Version futura — descarga remota

En v2, las lineas de `fs.cpSync` se sustituirian por llamadas `fetch` a un servidor que
sirva los archivos de cada componente y plantilla. La interfaz de la funcion `move(verified, outputDir)`
no cambia: el resto del pipeline no necesita saber de donde vienen los archivos.
