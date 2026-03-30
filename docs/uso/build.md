# Comando build — Generacion de proyectos React

## 1. Que hace

El comando `npm run build` lee un archivo JSON con el diseño de la web y genera un proyecto
React completo en el directorio desde el que se ejecuta el comando.

Internamente ejecuta el pipeline en este orden:

1. **parse** — Valida y normaliza el JSON.
2. **verify** — Comprueba que la plantilla y los componentes existen en disco.
3. **move** — Copia la plantilla y los componentes al directorio de salida.
4. **import** — Genera `App.tsx` y `src/pages/*.tsx` con el layout definido en el JSON.
5. **launch** — Ejecuta `npm install`, arranca `npm run dev` y abre el navegador.

---

## 2. Sintaxis

```
npm run build -- <ruta-al-archivo-json>
```

Los `--` son obligatorios: le indican a npm que el argumento que sigue es para el script,
no para npm en si mismo.

---

## 3. Donde se crea el proyecto

El proyecto se genera en el **directorio desde el que se ejecuta el comando** (`CWD`).
El nombre de la carpeta es el valor de `projectName` del JSON.

```
<CWD>/
  <projectName>/
    src/
      App.tsx
      pages/
      components/
    package.json
    ...
```

---

## 4. Ejemplos

### Ejemplo 1 — JSON en la misma carpeta del TFG

```bash
cd C:\Users\Angel\Documents\TFG
npm run build -- diseñador/pruebajson2.json
```

Resultado: crea `C:\Users\Angel\Documents\TFG\mi-web-prueba\`

---

### Ejemplo 2 — Crear el proyecto en otra carpeta

```bash
cd C:\Users\Angel\MisProyectos
npm run build -- C:\Users\Angel\Documents\TFG\diseñador\pruebajson2.json
```

Resultado: crea `C:\Users\Angel\MisProyectos\mi-web-prueba\`

---

### Ejemplo 3 — Con ruta relativa desde otra ubicacion

```bash
cd C:\Users\Angel\Desktop
npm run build -- ..\Documents\TFG\diseñador\pruebajson2.json
```

Resultado: crea `C:\Users\Angel\Desktop\mi-web-prueba\`

---

## 5. Salida esperada en consola

```
[verify] Comprobando plantilla 'template1'...             OK
[verify] Comprobando componente 'Header1'...              OK
[verify] Comprobando componente 'Footer1'...              OK
[verify] Verificacion completada: 0 errores, 0 warnings.
[move]   Copiando plantilla 'template1'...                OK
[move]   Copiando componente 'Header1'...                 OK
[move]   Copiando componente 'Footer1'...                 OK
[move]   Moves completados: 0 errores.
[import] Generando App.tsx...                             OK
[import] Generando pagina 'home'...                       OK
[import] Generando pagina 'about'...                      OK
[import] Imports completados.
[launch] Instalando dependencias...
(salida de npm install)
[launch] Iniciando servidor de desarrollo...
(el navegador se abre en http://localhost:5173)
```

---

## 6. Errores comunes

| Error en consola                                          | Causa                                              |
|-----------------------------------------------------------|----------------------------------------------------|
| `Archivo no encontrado: ...`                              | La ruta al JSON no existe o esta mal escrita       |
| `Plantilla 'X' no encontrada en repository/templates/`   | El campo `template` del JSON no coincide con ninguna carpeta en `repository/templates/` |
| `Componente 'X' no encontrado en repository/components/` | El componente referenciado en el JSON no existe en la biblioteca |
| `El shell no contiene ningun nodo Outlet`                 | Falta un nodo `Outlet` en el array `shell` del JSON |
| `npm install termino con codigo 1`                        | Error durante la instalacion de dependencias       |

Si el pipeline encuentra errores bloqueantes, imprime `Abortando build` y no continua
con las fases siguientes.

---

## 7. Requisitos previos

- Node.js instalado en el sistema.
- El servidor **no** necesita estar corriendo (`node index.js`) para usar el CLI.
  El comando `npm run build` es independiente del servidor Express.
