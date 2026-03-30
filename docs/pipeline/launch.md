# launch — Instalacion y arranque del proyecto generado

## 1. Proposito

La fase de launch es la ultima del pipeline. Tras generar todos los archivos del proyecto,
ejecuta los comandos necesarios para que el usuario pueda ver su web en el navegador sin
ningun paso manual.

Esta logica vive directamente en `builder.js` al final del pipeline, no en un archivo
separado.

---

## 2. Comandos que ejecuta

### 2.1 npm install

```
npm install
```

Ejecutado con `child_process.spawn` en el directorio `projectPath` con `stdio: 'inherit'`,
de modo que la salida de npm es visible en tiempo real en la consola del usuario.

El proceso bloquea el pipeline hasta que `npm install` termina.

Si `npm install` devuelve un codigo de salida distinto de 0, el pipeline lanza un `Error`
y se aborta antes de intentar arrancar el servidor.

Log emitido antes de lanzar:
```
[launch] Instalando dependencias...
```

### 2.2 npm run dev

```
npm run dev
```

Ejecutado con `child_process.spawn` en `projectPath` con `stdio: 'inherit'`. Este proceso
NO bloquea: se lanza en segundo plano y el pipeline continua inmediatamente para abrir
el navegador.

Log emitido antes de lanzar:
```
[launch] Iniciando servidor de desarrollo...
```

### 2.3 Apertura del navegador

Tras lanzar `npm run dev`, el pipeline espera 2 segundos y abre `http://localhost:5173`
en el navegador por defecto del sistema.

En Windows se usa:
```
start http://localhost:5173
```

Ejecutado con `child_process.exec`.

---

## 3. Por que stdio inherit

`stdio: 'inherit'` conecta los streams del proceso hijo directamente con los del proceso
padre (el terminal del usuario), de modo que el output de `npm install` y `npm run dev`
aparece directamente en consola sin necesidad de capturarlo y reenviarlo.

---

## 4. Diagrama de la fase

```
[launch] Instalando dependencias...
    → spawn npm install (bloqueante, stdio: inherit)
    → si exit code != 0: lanzar Error → Abortando build

[launch] Iniciando servidor de desarrollo...
    → spawn npm run dev (no bloqueante, stdio: inherit)
    → esperar 2 segundos
    → start http://localhost:5173
```

---

## 5. Mensaje final en consola

No hay linea de resumen de fase como en las anteriores. Cuando el navegador se abre,
la consola queda en mano del servidor de Vite (que imprime sus propios mensajes).

---

## 6. Dependencias del template

Para que `npm run dev` funcione, `package.json` del template debe incluir
`react-router-dom` y `@types/react-router-dom` como dependencias antes de que
`move.js` lo copie al directorio de salida. Esto se gestiona en la fase de implementacion
del template (ver `docs/import.md`).
