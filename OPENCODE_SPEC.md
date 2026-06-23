# 📋 SPEC: Sistema de Seguimiento de Becados — SPA para OpenCode

> **Instrucciones para OpenCode:** Este documento es la fuente única de verdad del proyecto. Sigue cada sección en orden. No improvises tecnologías, nombres de variables ni estructuras que no estén definidas aquí. Ante cualquier ambigüedad, prioriza la simplicidad y la funcionalidad completa sobre la complejidad.

---

## 1. RESUMEN DEL PROYECTO

**Nombre de la aplicación:** SeguiBecas  
**Tipo:** Single Page Application (SPA) — sin frameworks, sin bundlers, sin dependencias de build.  
**Propósito:** Centralizar el seguimiento académico y psicosocial de estudiantes becados en un instituto, con dos roles diferenciados: Docente y Psicólogo/a.  
**Persistencia:** `localStorage` del navegador (no requiere backend ni base de datos).  
**Entrega:** Una sola carpeta `/seguibecas/` con todos los archivos. El `index.html` debe ser ejecutable directamente abriendo el archivo en un navegador (protocolo `file://`).

---

## 2. STACK TECNOLÓGICO

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Estructura | HTML5 semántico | Sin frameworks — máxima compatibilidad y portabilidad |
| Estilos | CSS3 con variables nativas (`:root`) | Sin frameworks CSS — control total, cero dependencias |
| Tipografía | Google Fonts CDN: `Inter` (cuerpo) + `Sora` (títulos) | Carga vía `<link>` en el `<head>`, sin instalación local |
| Lógica | Vanilla JavaScript ES6+ (módulos inline en `<script>`) | Sin npm, sin bundlers — un solo archivo JS o inline |
| Íconos | Lucide Icons via CDN (`https://unpkg.com/lucide@latest`) | SVG inline ligeros, sin dependencias de imagen |
| Almacenamiento | `window.localStorage` | Requerimiento explícito del proyecto |

**Estructura de archivos:**
```
/seguibecas/
├── index.html        ← punto de entrada único (contiene HTML + CSS + JS)
└── README.md         ← descripción breve del proyecto (para GitHub)
```

> **Nota:** Todo el CSS y JS puede ir en `index.html` para simplicidad máxima. Si el archivo supera 800 líneas, OpenCode puede separar en `style.css` y `app.js` enlazados desde `index.html`.

---

## 3. SISTEMA DE DISEÑO (Design Tokens)

OpenCode debe declarar estas variables CSS en `:root` y usarlas en **todo** el CSS. Prohibido usar colores o tamaños hardcodeados fuera de esta sección.

```css
:root {
  /* Paleta principal — Azul institucional con acento verde esmeralda */
  --color-bg:         #F0F4F8;   /* Fondo general: gris azulado suave */
  --color-surface:    #FFFFFF;   /* Tarjetas y paneles */
  --color-primary:    #1E3A5F;   /* Azul oscuro institucional */
  --color-primary-lt: #2D5F9E;   /* Azul medio (hover, secundario) */
  --color-accent:     #10B981;   /* Verde esmeralda — acción positiva */
  --color-accent-lt:  #D1FAE5;   /* Verde muy suave — fondo de badge OK */
  --color-alert:      #EF4444;   /* Rojo — estado Alerta */
  --color-alert-lt:   #FEE2E2;   /* Rojo suave — fondo de badge Alerta */
  --color-warn:       #F59E0B;   /* Ámbar — advertencia / ausencia */
  --color-warn-lt:    #FEF3C7;   /* Ámbar suave */
  --color-text:       #1A202C;   /* Texto principal */
  --color-text-muted: #64748B;   /* Texto secundario */
  --color-border:     #CBD5E1;   /* Bordes de inputs y tablas */

  /* Tipografía */
  --font-display: 'Sora', sans-serif;
  --font-body:    'Inter', sans-serif;

  /* Escala de fuente */
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-4xl:  2.25rem;

  /* Espaciado */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Bordes */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Sombras */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06);
  --shadow-lg: 0 10px 30px rgba(0,0,0,0.12);

  /* Transiciones */
  --transition: 0.2s ease;
}
```

---

## 4. ESTRUCTURA HTML — VISTAS (SPA)

La SPA tiene **tres vistas** gestionadas con `display: none / block` mediante JavaScript. **No se usa ningún framework de routing.**

```
#view-home       → Pantalla de inicio / selección de rol
#view-docente    → Panel del Docente
#view-psicologo  → Panel del Psicólogo/a
```

### Función de navegación (JS):
```javascript
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  document.getElementById(viewId).style.display = 'block';
  window.scrollTo(0, 0);
}
```

---

## 5. ESPECIFICACIONES POR VISTA

### 5.1 VISTA HOME (`#view-home`)

**Layout:** centrado vertical y horizontal, fondo con gradiente suave de `--color-primary` a `--color-primary-lt`.

**Contenido (de arriba a abajo):**
1. **Logo/ícono institucional:** ícono `GraduationCap` de Lucide, tamaño 64px, color blanco.
2. **Título principal:** `"SeguiBecas"` — fuente `Sora`, `var(--text-4xl)`, color blanco, bold.
3. **Subtítulo:** `"Sistema de Seguimiento de Estudiantes Becados"` — fuente Inter, `var(--text-lg)`, blanco con 80% opacidad.
4. **Nombre del instituto:** `"Instituto [Nombre del Instituto]"` — badge pequeño con fondo blanco semitransparente.
5. **Dos tarjetas de rol** (lado a lado en desktop, apiladas en móvil):

   **Tarjeta Docente:**
   - Ícono: `BookOpen` (Lucide), 40px, color `--color-primary`
   - Título: `"Soy Docente"`
   - Descripción: `"Registra asistencia, calificaciones y genera alertas académicas"`
   - Botón: `"Ingresar como Docente"` — color `--color-primary`, al hacer clic llama `showView('view-docente')`

   **Tarjeta Psicólogo/a:**
   - Ícono: `HeartHandshake` (Lucide), 40px, color `--color-accent`
   - Título: `"Soy Psicólogo/a"`
   - Descripción: `"Gestiona alertas, registra seguimientos y resuelve casos"`
   - Botón: `"Ingresar como Psicólogo/a"` — color `--color-accent`, al hacer clic llama `showView('view-psicologo')`

6. **Pie:** `"© 2025 · Proyecto de Becas Institucionales"` — texto pequeño, blanco, 60% opacidad.

**Elemento de firma visual (signature):** Las dos tarjetas tienen una franja de color en la parte superior (4px de altura), `--color-primary` para Docente y `--color-accent` para Psicólogo. Al hacer hover, la tarjeta sube suavemente (`transform: translateY(-4px)`) con sombra `--shadow-lg`.

---

### 5.2 VISTA DOCENTE (`#view-docente`)

**Layout:** Barra de navegación superior fija + contenido en área scrolleable.

#### 5.2.1 Barra de navegación superior
- Fondo: `--color-primary`
- Izquierda: ícono `BookOpen` + texto `"Panel Docente"`
- Derecha: botón `"← Inicio"` que llama `showView('view-home')`

#### 5.2.2 Sección: Lista de Estudiantes Becados

**Encabezado de sección:**
- Título: `"Estudiantes Becados"`
- Contador badge: `"X estudiantes"` (dinámico, cuenta el array)
- Buscador: `<input type="text">` con placeholder `"Buscar estudiante..."` que filtra la tabla en tiempo real

**Tabla de estudiantes** con columnas:

| # | Nombre | Programa | Asistencia | Calificación | Estado | Acciones |
|---|--------|----------|------------|--------------|--------|----------|

- La tabla debe ser horizontalmente scrolleable en móvil (`overflow-x: auto` en el contenedor).
- Cada fila alterna entre `--color-surface` y `#F8FAFC` para legibilidad.
- La columna **Estado** muestra un badge:
  - `"Normal"` → badge verde (`--color-accent-lt` + `--color-accent`)
  - `"Alerta"` → badge rojo (`--color-alert-lt` + `--color-alert`) con ícono `AlertTriangle`

**Controles por fila (columna Acciones):**
1. **Botón "✓ Asistió"** — verde pequeño, al clic registra asistencia del día y guarda en localStorage.
2. **Botón "✗ Faltó"** — rojo pequeño, al clic registra inasistencia y guarda en localStorage.
3. **Input de nota** — `type="number"` min=1 max=5, placeholder="1-5", con botón "Guardar" al lado.
4. **Botón "⚠ Remitir a Psicología"** — ámbar/naranja, solo visible si `estado === 'Normal'`. Al clic cambia `estado` a `'Alerta'`, guarda en localStorage y muestra una confirmación inline (no `alert()`).

**Nota UX:** Si el estudiante ya está en "Alerta", reemplazar el botón de remitir por un badge `"En seguimiento psicológico"`.

---

### 5.3 VISTA PSICÓLOGO/A (`#view-psicologo`)

**Layout:** Igual que Docente — barra superior + contenido scrolleable.

#### 5.3.1 Barra de navegación superior
- Fondo: `--color-accent`
- Izquierda: ícono `HeartHandshake` + texto `"Panel de Psicología"`
- Derecha: botón `"← Inicio"` que llama `showView('view-home')`

#### 5.3.2 Sección: Bandeja de Alertas

**Encabezado:**
- Título: `"Casos en Alerta"`
- Badge dinámico: número de estudiantes con `estado === 'Alerta'`
- Botón `"🔄 Actualizar bandeja"` que recarga los datos del localStorage

**Estado vacío:** Si no hay estudiantes en alerta, mostrar panel centrado con ícono `CheckCircle` verde y texto `"No hay casos en alerta en este momento. Todo está en orden."`.

**Tarjetas de caso** (una por estudiante en Alerta):
Cada tarjeta contiene:
- **Encabezado:** nombre del estudiante + badge `"ALERTA"` rojo + programa académico.
- **Datos rápidos** (en fila): asistencia registrada, última calificación.
- **Área de historial de bitácoras:** lista scrolleable de observaciones previas (fecha + texto).
- **Formulario de nueva observación:**
  - `<textarea>` con placeholder `"Escribe las observaciones de la llamada de seguimiento..."` (mínimo 3 filas).
  - Botón `"💾 Guardar observación"` — guarda en el array `bitacora` del estudiante en localStorage con timestamp automático (`new Date().toLocaleString('es-CO')`).
- **Botón `"✅ Resolver caso"`** — al clic:
  1. Cambia `estado` del estudiante de `'Alerta'` a `'Normal'`.
  2. Agrega una entrada automática a la bitácora: `"Caso resuelto por Psicología — [fecha]"`.
  3. Remueve la tarjeta de la bandeja con animación de fade-out.
  4. Guarda todo en localStorage.

---

## 6. MODELO DE DATOS (localStorage)

### Clave principal: `"seguibecas_estudiantes"`

**Formato:** JSON array. Inicializar con `JSON.parse(localStorage.getItem('seguibecas_estudiantes')) || DATOS_INICIALES`.

```javascript
const DATOS_INICIALES = [
  {
    id: 1,
    nombre: "Valentina Torres Ruiz",
    programa: "Ingeniería de Sistemas",
    semestre: 3,
    estado: "Normal",          // "Normal" | "Alerta"
    asistencia: [],            // array de strings: ["2025-06-10:asistio", "2025-06-11:falto"]
    calificaciones: [],        // array de numbers: [4, 3, 5]
    bitacora: []               // array de objetos: [{fecha: string, nota: string}]
  },
  {
    id: 2,
    nombre: "Carlos Andrés Mejía",
    programa: "Contaduría Pública",
    semestre: 2,
    estado: "Normal",
    asistencia: [],
    calificaciones: [],
    bitacora: []
  },
  {
    id: 3,
    nombre: "Luisa Fernanda Ospina",
    programa: "Administración de Empresas",
    semestre: 4,
    estado: "Normal",
    asistencia: [],
    calificaciones: [],
    bitacora: []
  },
  {
    id: 4,
    nombre: "Daniel Esteban Cárdenas",
    programa: "Psicología",
    semestre: 1,
    estado: "Normal",
    asistencia: [],
    calificaciones: [],
    bitacora: []
  },
  {
    id: 5,
    nombre: "María Camila Delgado",
    programa: "Medicina",
    semestre: 5,
    estado: "Normal",
    asistencia: [],
    calificaciones: [],
    bitacora: []
  },
  {
    id: 6,
    nombre: "Juan Pablo Herrera",
    programa: "Derecho",
    semestre: 2,
    estado: "Normal",
    asistencia: [],
    calificaciones: [],
    bitacora: []
  }
];
```

### Funciones de persistencia requeridas:

```javascript
// Leer todos los estudiantes
function getEstudiantes() {
  return JSON.parse(localStorage.getItem('seguibecas_estudiantes')) || DATOS_INICIALES;
}

// Guardar todos los estudiantes
function saveEstudiantes(data) {
  localStorage.setItem('seguibecas_estudiantes', JSON.stringify(data));
}

// Actualizar un estudiante por id
function updateEstudiante(id, campos) {
  const lista = getEstudiantes();
  const idx = lista.findIndex(e => e.id === id);
  if (idx !== -1) {
    lista[idx] = { ...lista[idx], ...campos };
    saveEstudiantes(lista);
  }
}

// Agregar entrada a bitácora
function addBitacora(id, nota) {
  const lista = getEstudiantes();
  const idx = lista.findIndex(e => e.id === id);
  if (idx !== -1) {
    lista[idx].bitacora.push({
      fecha: new Date().toLocaleString('es-CO'),
      nota: nota.trim()
    });
    saveEstudiantes(lista);
  }
}
```

---

## 7. LÓGICA DE NEGOCIO — REGLAS CRÍTICAS

1. **Sincronización inmediata:** Toda acción que modifique datos debe llamar `saveEstudiantes()` ANTES de re-renderizar la UI.
2. **Re-render completo:** Después de cada modificación, llamar a la función de renderizado de la vista activa para reflejar el estado actualizado.
3. **No usar `alert()` ni `confirm()`:** Los mensajes de confirmación y error deben ser elementos HTML con clase `.toast` o `.inline-msg` que aparecen y desaparecen con `setTimeout`.
4. **Validación de nota:** Solo aceptar números enteros entre 1 y 5. Si el input es inválido, mostrar mensaje de error inline en rojo debajo del input.
5. **Observación vacía:** No guardar una observación si el textarea está vacío o tiene solo espacios. Mostrar mensaje `"Escribe una observación antes de guardar."`.
6. **Estado de asistencia visual:** Los botones "Asistió" / "Faltó" deben cambiar de apariencia según el último registro del día (si ya se registró asistencia hoy, el botón "Asistió" queda con estilo activo/presionado).

---

## 8. SISTEMA DE TOAST / NOTIFICACIONES

Implementar un contenedor fijo en la esquina inferior derecha:

```html
<div id="toast-container" style="position:fixed; bottom:24px; right:24px; z-index:9999; display:flex; flex-direction:column; gap:8px;"></div>
```

```javascript
function showToast(mensaje, tipo = 'success') {
  // tipo: 'success' | 'error' | 'warning' | 'info'
  const colores = {
    success: { bg: 'var(--color-accent)', icon: '✓' },
    error:   { bg: 'var(--color-alert)',  icon: '✗' },
    warning: { bg: 'var(--color-warn)',   icon: '⚠' },
    info:    { bg: 'var(--color-primary-lt)', icon: 'ℹ' }
  };
  const c = colores[tipo];
  const toast = document.createElement('div');
  toast.innerHTML = `<span>${c.icon}</span> ${mensaje}`;
  toast.style.cssText = `
    background: ${c.bg}; color: white; padding: 12px 20px; border-radius: var(--radius-md);
    box-shadow: var(--shadow-md); font-size: var(--text-sm); font-family: var(--font-body);
    display: flex; gap: 8px; align-items: center; min-width: 240px; max-width: 360px;
    animation: slideIn 0.3s ease;
  `;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
```

CSS de animación a incluir:
```css
@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

---

## 9. RESPONSIVIDAD (Mobile-First)

| Breakpoint | Regla |
|------------|-------|
| Móvil (< 640px) | Las tarjetas de rol en Home se apilan verticalmente. La tabla de docentes tiene scroll horizontal. Las acciones de cada fila se reorganizan en columna. |
| Tablet (640–1024px) | Dos columnas para tarjetas de rol. Tabla completa visible. |
| Desktop (> 1024px) | Layout máximo centrado en 1200px (`max-width: 1200px; margin: 0 auto`). |

Breakpoints a usar en CSS:
```css
/* Mobile first — estilos base para móvil */
/* Tablet */
@media (min-width: 640px) { ... }
/* Desktop */
@media (min-width: 1024px) { ... }
```

---

## 10. ACCESIBILIDAD (mínimo requerido)

- Todos los `<button>` deben tener texto descriptivo (no solo íconos).
- Los `<input>` deben tener `<label>` asociado con `for` / `id`.
- El contraste de texto sobre fondo debe cumplir WCAG AA (garantizado por la paleta definida).
- Focus visible: no eliminar el outline de focus por defecto; mejorarlo con:
  ```css
  *:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  ```
- Usar atributos `aria-label` en botones de ícono.

---

## 11. CHECKLIST DE CALIDAD (OpenCode debe verificar antes de entregar)

### Funcionalidad Core
- [ ] La vista Home carga al abrir `index.html`
- [ ] Botón "Ingresar como Docente" navega a `#view-docente`
- [ ] Botón "Ingresar como Psicólogo/a" navega a `#view-psicologo`
- [ ] Ambos botones "← Inicio" regresan a `#view-home`
- [ ] Los 6 estudiantes aparecen en la tabla del Docente al cargar
- [ ] "Asistió" y "Faltó" guardan en localStorage y se reflejan en UI
- [ ] Guardar nota válida (1-5) actualiza localStorage y muestra toast
- [ ] Nota inválida (fuera de 1-5 o texto) muestra error inline sin guardar
- [ ] "Remitir a Psicología" cambia `estado` a `"Alerta"` en localStorage
- [ ] Al ir a Vista Psicólogo, solo aparecen estudiantes en `"Alerta"`
- [ ] Si no hay estudiantes en Alerta, se muestra el estado vacío
- [ ] "Guardar observación" con texto válido agrega entrada a `bitacora` con fecha
- [ ] "Guardar observación" vacío no guarda y muestra error
- [ ] "Resolver caso" cambia `estado` a `"Normal"`, agrega nota automática y remueve tarjeta
- [ ] Al recargar la página (F5), todos los datos persisten

### UX / Visual
- [ ] No hay ningún `alert()` ni `confirm()` nativo en el código
- [ ] Los toasts aparecen y desaparecen sin intervención del usuario
- [ ] La tabla es scrolleable horizontalmente en pantallas < 640px
- [ ] Hover en tarjetas de Home produce animación de elevación
- [ ] Los badges de estado son visualmente distinguibles (verde vs rojo)

### Código
- [ ] No hay errores en consola del navegador (F12 → Console) al cargar
- [ ] No hay errores al ejecutar ninguna acción de la aplicación
- [ ] Todas las variables CSS están definidas en `:root`
- [ ] El archivo `index.html` es auto-contenido y abre correctamente con `file://`

---

## 12. INSTRUCCIONES FINALES PARA OPENCODE

1. **Genera primero** el esqueleto HTML con las tres vistas y el sistema de Design Tokens CSS.
2. **Luego implementa** la capa de datos (funciones de localStorage) y los datos iniciales.
3. **Luego implementa** la Vista Docente con tabla, controles de asistencia, notas y remisión.
4. **Luego implementa** la Vista Psicólogo con bandeja filtrada, formulario de bitácora y resolución.
5. **Finalmente** implementa el sistema de toasts, el buscador y los estilos responsivos.
6. **Ejecuta el checklist** de la Sección 11 antes de dar el código por terminado.
7. **El archivo `index.html` final** debe funcionar abriéndolo directamente en el navegador sin ningún servidor local.

> ⚠️ **Restricción importante:** No uses `React`, `Vue`, `Angular`, `Bootstrap`, `Tailwind` ni ningún framework o librería que requiera instalación via `npm`. Solo HTML, CSS y JS nativos + Google Fonts CDN + Lucide CDN.
