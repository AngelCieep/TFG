# Cómo iniciar el proyecto

## Requisitos previos

- [Node.js](https://nodejs.org/) instalado (v18 o superior recomendado)
- npm (incluido con Node.js)

## Instalación

Instala las dependencias del proyecto:

```bash
npm install
```

## Arrancar el servidor

```bash
npm start
```

Esto levanta el servidor con **nodemon** en modo desarrollo (se reinicia automáticamente al guardar cambios).

El servidor quedará disponible en:

```
http://localhost:3000
```

## Arrancar en producción

Si no quieres usar nodemon:

```bash
node index.js
```
