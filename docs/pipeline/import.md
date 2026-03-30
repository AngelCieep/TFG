# import.js — Generacion de codigo React del proyecto

## 1. Proposito

`import.js` es la cuarta fase del pipeline. Recibe el objeto devuelto por `move.js`
(que incluye `projectPath`) y genera el codigo TypeScript/React del proyecto:

- Sobreescribe `src/App.tsx` con el layout global (shell) y el sistema de rutas.
- Crea un archivo `src/pages/<PageId>.tsx` por cada pagina definida en el JSON.

---

## 2. Entradas y salidas

**Entrada:** objeto `moved` con todos los campos de `verify()` mas `projectPath`.

**Salida:** mismo objeto `moved` sin modificaciones (los archivos ya estan escritos en disco).

**Lanza:** `Error` si alguna escritura de archivo falla.

---

## 3. Archivo generado: App.tsx

### 3.1 Imports

Una linea por cada componente de biblioteca (no estructural):

```tsx
import Header1 from './components/header1/header1';
import Footer1 from './components/footer1/footer1';
```

Imports fijos de React Router:

```tsx
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
```

Import de estilos globales (ya existe en el template):

```tsx
import './App.css';
```

### 3.2 Componente Shell

Se genera una funcion `Shell` que renderiza los nodos del array `shell[]` en orden.
El nodo de tipo `Outlet` se renderiza como `<Outlet />`. Los demas se renderizan con
sus props tal como vienen del JSON:

```tsx
function Shell() {
  return (
    <>
      <Header1 brand="Mi Web" links={[...]} />
      <Outlet />
      <Footer1 copyright="..." links={[...]} />
    </>
  );
}
```

### 3.3 Componente App con BrowserRouter y Routes

```tsx
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

Los imports de las paginas se generan como imports directos (no lazy en v1):

```tsx
import Home from './pages/Home';
import About from './pages/About';
```

---

## 4. Archivos generados: src/pages/<PageId>.tsx

Un archivo por cada pagina del JSON. El `PageId` es el campo `id` de la pagina
con la primera letra en mayuscula (ej: `home` → `Home.tsx`).

### 4.1 Estructura del archivo de pagina

```tsx
import React from 'react';

export default function Home() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
      <div style={{ gridColumnStart: 1, gridColumnEnd: 13, gridRowStart: 1, gridRowEnd: 2 }}>
        <Section ...>
          ...
        </Section>
      </div>
    </div>
  );
}
```

### 4.2 Nodos estructurales

| Componente  | Elemento HTML generado |
|-------------|------------------------|
| `Root`      | `<div>` con display:grid y gridTemplateColumns segun `grid` del JSON |
| `Section`   | `<section>` con style de grid si tiene layout                        |
| `Container` | `<div>` con style de grid si tiene layout                            |
| Cualquier otro componente de biblioteca | `<NombreComponente {...props} />` |

### 4.3 Aplicacion del layout CSS Grid

Cuando un nodo tiene `layout.colStart` y `layout.colSpan`:

```tsx
style={{
  gridColumnStart: colStart,
  gridColumnEnd: colStart + colSpan,
  gridRowStart: rowStart,       // si existe
  gridRowEnd: rowStart + rowSpan // si existe
}}
```

Si el nodo no tiene `layout`, no se genera atributo `style`.

---

## 5. Logging

```
[import] Generando App.tsx...                             OK
[import] Generando pagina 'home'...                       OK
[import] Generando pagina 'about'...                      OK
[import] Imports completados.
```

En caso de error:
```
[import] Generando App.tsx...                             FALLO
```

---

## 6. Comportamiento ante errores

Si falla la escritura de `App.tsx` o de cualquier pagina, se lanza un `Error` inmediatamente
y el pipeline se detiene. El proyecto quedara en un estado incompleto pero `move.js` ya
habra copiado los archivos base, por lo que el usuario puede inspeccionar el directorio.
