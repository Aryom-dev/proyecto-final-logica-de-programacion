# SeguiBecas — Walkthrough Técnico

> Sistema de seguimiento de estudiantes becados con dos roles (Docente / Psicólogo).
> **Stack:** HTML + CSS + Vanilla JS · Sin frameworks · Sin bundlers · localStorage · Abre con `file://`

---

## Índice

1. [Resumen del Proyecto](#1-resumen-del-proyecto)
2. [Arquitectura](#2-arquitectura)
3. [Modelo de Datos](#3-modelo-de-datos)
4. [Vista Home](#4-vista-home)
5. [Vista Docente](#5-vista-docente)
6. [Vista Psicólogo](#6-vista-psicólogo)
7. [Diseño y UX](#7-diseño-y-ux)
8. [Persistencia y Migración](#8-persistencia-y-migración)
9. [Diagramas de Flujo](#9-diagramas-de-flujo)
10. [Referencias Rápidas del Código](#10-referencias-rápidas-del-código)

---

## 1. Resumen del Proyecto

**SeguiBecas** es una Single Page Application (SPA) que permite a instituciones educativas realizar un seguimiento integral de estudiantes becados. El sistema se divide en dos perfiles:

| Rol | Responsabilidad |
|-----|----------------|
| **Docente** | Registrar asistencia, calificaciones, generar alertas automáticas, remitir casos a psicología |
| **Psicólogo/a** | Revisar casos remitidos, documentar intervenciones en la bitácora, resolver casos |

La aplicación funciona completamente del lado del cliente, sin servidor ni base de datos externa. Todos los datos se almacenan en `localStorage` del navegador, lo que permite abrir el archivo `index.html` directamente con doble clic (`file://`).

### Características principales

- CRUD completo de estudiantes
- Registro de usuarios con roles
- Alertas automáticas configurables (asistencia baja, ausencias consecutivas, notas bajas)
- Bitácora de seguimiento con línea de tiempo
- Remisiones a psicología con selección de motivo
- Notificaciones del sistema con badge y panel desplegable
- Exportación e importación de datos (JSON)
- Sesión persistente con avatares y dropdown
- Tema oscuro Obsidian con glassmorphism y fondo animado

---

## 2. Arquitectura

El proyecto sigue una arquitectura MVC (Modelo-Vista-Controlador) distribuida en tres archivos:

```
seguibecas/
├── index.html    ← Vistas (HTML semántico + modales)
├── style.css     ← Sistema de diseño (Obsidian dark + glassmorphism)
└── app.js        ← Modelo + Controlador (datos, lógica, renderizado)
```

### 2.1 index.html (524 líneas)

Contiene toda la estructura HTML de la aplicación:

- **Fondo animado**: `.bg-animated` (div único que renderiza el gradiente en órbita)
- **Toast container**: `#toast-container` para notificaciones flotantes
- **5 modales**:
  - `modal-registro-overlay` — Registro de usuario
  - `modal-import-overlay` — Importar datos JSON
  - `modal-referir-overlay` — Remitir a psicología (2 opciones)
  - `modal-add-student-overlay` — Agregar estudiante
  - `notif-panel` — Panel de notificaciones desplegable
- **3 vistas** (alternan con clase `.active`):
  - `#view-home` — Portal de acceso
  - `#view-docente` — Panel del docente
  - `#view-psicologo` — Panel del psicólogo

Cada vista funcional se compone de:
```
Sidebar (navegación + marca) | Topbar (búsqueda + acciones) | Content Area (secciones)
```

### 2.2 style.css (1385 líneas)

Sistema de diseño completo con:

- **Variables CSS**: 45 variables de color, tipografía, radios, sombras
- **Sistema de diseño**: Obsidian dark (`#09090b` fondo, `#a78bfa` primario, `#34d399` terciario)
- **Glassmorphism**: 3 clases reutilizables (`.glass`, `.glass-light`, `.glass-card`)
- **Animación**: `@keyframes gradienteMovil` (20s loop infinito)
- **Responsive**: 5 media queries (640px, 768px, 1024px, 767px max)
- **Scrollbar**: Estilizada con `::-webkit-scrollbar`

### 2.3 app.js (1211 líneas)

Organizado en secciones:

| Sección | Líneas | Propósito |
|---------|--------|-----------|
| Migración de datos | 1-17 | `DATA_VERSION`, `migrarDatos()` |
| Datos iniciales | 19-32 | 6 estudiantes de ejemplo + variables globales |
| Capa de datos | 34-90 | `get/save` para estudiantes, umbrales, notificaciones |
| Sistema de usuarios | 156-213 | Registro, inicio/cierre de sesión |
| Export/Import | 215-269 | JSON download/upload |
| Home rendering | 271-337 | Login/logout UI, lista de usuarios |
| Utilidades | 339-421 | Toast, helpers de asistencia/notas/motivos |
| Alertas automáticas | 423-446 | `checkAutoAlert()` |
| Docente | 448-634 | Render, asistencias, notas, remitir, eliminar |
| Psicólogo | 636-858 | Dashboard, caso detalle, bitácora, resolver |
| Sidebar nav | 860-885 | Cambio de secciones |
| Event listeners | 887-1202 | Modales, búsqueda, dropdown, umbrales, registro |
| Inicialización | 1204-1211 | `cargarSesion()`, `getNotificaciones()`, etc. |

---

## 3. Modelo de Datos

La aplicación utiliza **6 claves** en `localStorage`:

```
localStorage {
  "seguibecas_version": 2,
  "seguibecas_estudiantes": [...],   // Array<Estudiante>
  "seguibecas_usuarios": [...],      // Array<Usuario>
  "seguibecas_umbrales": {...},      // UmbralesConfig
  "seguibecas_notificaciones": [...],// Array<Notificacion>
  "seguibecas_sesion": {...}         // Usuario | null
}
```

### 3.1 Estudiante

```javascript
{
  id: 1,
  nombre: "Valentina Torres Ruiz",
  programa: "Ingeniería de Sistemas",
  semestre: 3,
  estado: "Normal" | "Alerta",
  asistencia: ["2026-06-23:asistio", "2026-06-22:falto", ...],
  calificaciones: [{ nota: 4, fecha: "23/06/2026, 10:30:00" }, ...],
  bitacora: [{ fecha, nota, tipo }, ...],
  remisiones: [{ fecha, motivo, origen }, ...],
  notificaciones: [],
  motivoRemision: "bajo_rendimiento" | "desercion" | null,
  remitidoPor: "docente" | null,
  fechaRemision: "2026-06-23T..." | null,
  alertaAutomatica: true | false,
  motivoAlerta: "bajo_rendimiento" | "desercion" | null
}
```

**Campos añadidos por `migrarEstudiante()`** (compatibilidad hacia atrás):
- `remisiones`, `notificaciones`, `motivoRemision`, `remitidoPor`, `fechaRemision`
- `alertaAutomatica`, `motivoAlerta`
- Migración de `calificaciones` de `number[]` a `{ nota, fecha }[]`

### 3.2 Usuario

```javascript
{
  id: 1701234567890,       // Date.now()
  nombre: "Dr. Ana Martínez",
  email: "ana@institucion.edu",
  rol: "docente" | "psicologo",
  fechaRegistro: "2026-06-23T..."
}
```

### 3.3 Umbrales (Configuración)

```javascript
{
  asistenciaMin: 60,         // % mínimo de asistencia
  notaMin: 3.0,              // Promedio mínimo de notas
  faltasConsecutivas: 3      // Faltas seguidas para alerta
}
```

### 3.4 Notificación

```javascript
{
  id: 1,
  mensaje: "Alerta automática para Valentina Torres: Riesgo de deserción",
  fecha: "23/06/2026, 10:30:00",
  leida: false,
  tipo: "info" | "success" | "warning" | "error",
  linkView: "view-docente" | "view-psicologo" | null
}
```

---

## 4. Vista Home

```
┌─────────────────────────────────────────────────────────┐
│  🏫 Obsidian Scholar        Admin Educativo      Ayuda  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│              SeguiBecas Portal                           │
│   Acceso seguro al sistema de seguimiento y gestión     │
│   de becas. Seleccione su perfil para continuar.        │
│                                                          │
│  ┌──────────────┐  ┌──────────────────────────┐         │
│  │  [+ Persona] │  │  Usuarios registrados     │         │
│  │  Registrar   │  │  ┌──────────────────────┐ │         │
│  │  Usuario     │  │  │ 📚 Dr. Ana Martínez │ │         │
│  │              │  │  │ Docente · ana@...   │ │         │
│  │              │  │  └──────────────────────┘ │         │
│  │              │  │  ┌──────────────────────┐ │         │
│  │              │  │  │ 🧠 Carlos Pérez     │ │         │
│  │              │  │  │ Psicólogo · carlos@ │ │         │
│  │              │  │  └──────────────────────┘ │         │
│  └──────────────┘  └──────────────────────────┘         │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  © 2024 Obsidian Scholar · Privacidad · Términos        │
└─────────────────────────────────────────────────────────┘
```

### 4.1 Registro de Usuario

Al hacer clic en "Registrar Usuario" se abre un modal con:

1. **Nombre completo** (input text)
2. **Correo electrónico** (input email, validación `@`)
3. **Selección de rol** (dos botones: Docente 📚 / Psicólogo 🧠)

Validaciones:
- Todos los campos obligatorios
- Correo duplicado → `showToast('Ya existe un usuario con ese correo.', 'error')`
- Rol requerido → botón "Registrar" deshabilitado hasta seleccionar

Al registrarse, se crea el usuario, se inicia sesión automáticamente y se redirige al panel correspondiente.

### 4.2 Inicio de Sesión

Desde la lista de usuarios registrados, un clic en cualquier tarjeta ejecuta `iniciarSesion(email)`:

```javascript
function iniciarSesion(email) {
  const lista = getUsuarios();
  const u = lista.find(x => x.email.toLowerCase() === email.toLowerCase());
  sesionActual = u;
  localStorage.setItem('seguibecas_sesion', JSON.stringify(u));
  actualizarHome();  // Muestra la pantalla de bienvenida
}
```

### 4.3 Pantalla de Sesión Activa

Cuando hay sesión iniciada:

- **Saludo**: "Buenos días/tardes/noches" según la hora (`getSaludo()`, línea 1054)
- **Nombre del usuario** y **rol**
- Botón "Ingresar" → redirige al panel según el rol
- Botón "Cerrar sesión" → `cerrarSesion()`

### 4.4 Avatar Dropdown

En ambas vistas (Docente y Psicólogo), la topbar tiene:

- **Avatar**: iniciales del usuario (ej: "DR" para "Dr. Ana Martínez")
- **Nombre**: visible al lado del avatar
- **Dropdown** al hacer clic: ícono del rol + nombre + "Cerrar sesión"

```javascript
function getInitials(name) {
  return name.split(' ').filter(w => w.length > 0).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
```

---

## 5. Vista Docente

```
┌──────────────┬──────────────────────────────────────────┐
│  Obsidian    │  Panel Docente     🔍 Buscar...    🔔 👤 │
│  Scholar     │                                           │
│  Admin Edu   │  ┌──────┐  ┌──────┐  ┌────────┐         │
│              │  │Total │  │Alert.│  │Asist.  │         │
│ ─────────── │  │  6   │  │  2   │  │  75%   │         │
│ 📊Dashboard │  └──────┘  └──────┘  └────────┘         │
│ 📜Historial │                                           │
│ ⚙️Configura │  ┌─── Tabla de Estudiantes ─────────┐    │
│              │  │ Nombre  │Prog.│Asist│Notas│Estado│    │
│ [+ Agregar]  │  │Valentina│Ing. │ 80% │3.5  │Alerta│    │
│              │  │Carlos   │Cont.│ 60% │2.0  │Alerta│    │
│ 🚪Inicio     │  │Luisa    │Adm. │100% │4.2  │Normal│    │
│              │  └────────────────────────────────┘    │
└──────────────┴──────────────────────────────────────────┘
```

### 5.1 Sidebar

- **Dashboard** (activo por defecto)
- **Historial de Casos** → `renderHistorialDocente()`
- **Configuración** → Umbrales de alerta
- **Agregar Estudiante** → Abre modal
- **Inicio** → `showView('view-home')`

### 5.2 Topbar

- **Título**: "Panel Docente"
- **Buscador**: `#search-docente` filtra estudiantes en tiempo real por nombre o programa
- **Botón notificaciones**: `#notif-btn-docente` con badge de contador
- **Exportar JSON**: `exportarDatosJSON()`
- **Importar JSON**: Abre modal de carga de archivo
- **Avatar + Dropdown**

### 5.3 Stat Cards (Clickables)

Tres tarjetas en `#stats-grid`:

| Card | Contenido | Comportamiento al hacer clic |
|------|-----------|------------------------------|
| **Total Matriculados** | Número de estudiantes visibles | Restablece filtro (`docenteSortFilter = null`) |
| **Alertas Activas** | N° de estudiantes en alerta | Alterna filtro `docenteSortFilter = 'alertas'` |
| **Asistencia Promedio** | % promedio + barra de progreso | Alterna orden `docenteSortFilter = 'asistencia'` (menor a mayor) |

Las cards se iluminan al pasar el mouse y tienen efecto de brillo (`stat-card-glow`).

### 5.4 Tabla de Estudiantes

Columnas:
| Columna | Descripción |
|---------|-------------|
| **Nombre** | Nombre + ID (formato B-00001) + avatar con iniciales |
| **Programa** | Carrera universitaria |
| **Asistencia** | Porcentaje, rojo si < 60% |
| **Notas** | Chips de cada nota + promedio |
| **Estado** | Badge "Normal" o "⚠️ Alerta" |
| **Acciones** | Botones contextuales según estado |

**Estados y acciones disponibles:**

```
Estado Normal:
  [✅ Asistió] [🚫 Faltó] [input nota] [Nota] [🚩 Remitir] [🗑️ Eliminar]

Estado Alerta:
  [🔍 En seguimiento: Bajo rendimiento] [🗑️ Eliminar]
```

### 5.5 Registro de Asistencia

```javascript
function handleAsistio(id) {
  const lista = getEstudiantes();
  const est = lista.find(e => e.id === id);
  const today = todayStr();
  est.asistencia = est.asistencia.filter(a => !a.startsWith(today)); // Sobrescribe el día
  est.asistencia.push(today + ':asistio');
  saveEstudiantes(lista);
  checkAutoAlert(est, getUmbrales());  // ¿Activa alerta?
}
```

- `todayStr()` devuelve `YYYY-MM-DD`
- Cada día solo tiene un registro (se sobrescribe si se hace clic de nuevo)
- El botón presionado se marca visualmente con color

### 5.6 Registro de Notas

```javascript
function handleGrade(id, btn) {
  const val = parseInt(input.value);
  if (val < 1 || val > 5) { /* mostrar error */ return; }
  est.calificaciones.push({ nota: val, fecha: new Date().toLocaleString('es-CO') });
  saveEstudiantes(lista);
  checkAutoAlert(est, getUmbrales());
}
```

- Validación: solo enteros entre 1 y 5
- Se guarda como objeto con `nota` + `fecha` (timestamp)
- Se muestran como chips de colores en la tabla

### 5.7 Remitir a Psicología

Flujo:
1. Docente hace clic en 🚩 "Remitir"
2. Se abre modal `modal-referir-overlay` con dos opciones:
   - 🏫 **Bajo rendimiento académico** (motivo: `bajo_rendimiento`)
   - 🚪 **Riesgo de deserción** (motivo: `desercion`)
3. `handleReferir(id, motivo)`:
   - Cambia `est.estado = 'Alerta'`
   - Guarda `motivoRemision`, `remitidoPor = 'docente'`, `fechaRemision`
   - Agrega entrada a `remisiones[]` y `bitacora[]`
   - Crea notificación: "Fue remitido a Psicología"
   - Notifica al panel del psicólogo

### 5.8 Eliminar Estudiante (Doble Clic)

```javascript
function handleDelete(id) {
  showToast('¿Eliminar? Haz clic de nuevo para confirmar.', 'warning');
  const confirmBtn = document.querySelector(`[data-action="delete"][data-id="${id}"]`);
  if (confirmBtn && confirmBtn.dataset.confirming) {
    // Segundo clic: eliminar
    lista.splice(idx, 1); saveEstudiantes(lista);
  } else {
    // Primer clic: marcar confirmación con timeout de 3s
    confirmBtn.dataset.confirming = 'true';
    confirmBtn.style.background = 'var(--color-error-container)';
    setTimeout(() => { delete confirmBtn.dataset.confirming; }, 3000);
  }
}
```

### 5.9 Alertas Automáticas

`checkAutoAlert(est, umbrales)` (línea 423) se ejecuta después de cada asistencia, nota o remisión:

```javascript
function checkAutoAlert(est, umbrales) {
  if (est.estado === 'Alerta') return;  // Ya está en alerta

  const rate = getAttendanceRate(est.asistencia);
  const avg = getAvgGrade(est.calificaciones);
  const consec = getConsecutiveAbsences(est.asistencia);

  // Regla 1: Asistencia por debajo del mínimo
  if (est.asistencia.length > 0 && rate < umbrales.asistenciaMin) motivo = 'desercion';
  // Regla 2: Faltas consecutivas
  else if (consec >= umbrales.faltasConsecutivas) motivo = 'desercion';
  // Regla 3: Promedio por debajo del mínimo
  else if (avg !== null && parseFloat(avg) < umbrales.notaMin) motivo = 'bajo_rendimiento';

  if (motivo) {
    // Cambia estado, registra alerta, crea notificación
    e.estado = 'Alerta';
    e.alertaAutomatica = true;
    e.remisiones.push({ fecha, motivo, origen: 'automatico' });
    e.bitacora.push({ fecha, nota, tipo: 'alerta' });
    addNotificacionSistema(`Alerta automática para ${e.nombre}`, 'warning', 'view-docente');
  }
}
```

**Cálculos auxiliares:**

```javascript
function getAttendanceRate(asistencia) {
  const attended = asistencia.filter(a => a.includes(':asistio')).length;
  return Math.round((attended / asistencia.length) * 100);
}

function getConsecutiveAbsences(asistencia) {
  let count = 0;
  const sorted = [...asistencia].sort().reverse();  // Más reciente primero
  for (const a of sorted) {
    if (a.includes(':falto')) count++;
    else break;
  }
  return count;
}

function getAvgGrade(calificaciones) {
  const nums = calificaciones.map(c => typeof c === 'number' ? c : c.nota);
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}
```

### 5.10 Historial de Casos (Docente)

- Muestra todos los estudiantes que han tenido remisiones
- Cada tarjeta es expandible: clic en el header togglea `.historial-card-body.open`
- Muestra el historial de remisiones con fecha, motivo y origen

### 5.11 Configuración (Umbrales)

Tres campos editables en `settings-card`:
- **Asistencia mínima** (%): default 60
- **Promedio mínimo de notas**: default 3.0
- **Faltas consecutivas**: default 3

Botón "Guardar Configuración" → `saveUmbrales(u)` → `showToast('Configuración guardada')`

---

## 6. Vista Psicólogo

```
┌──────────────┬──────────────────────────────────────────┐
│  Obsidian    │  Panel de Psicología   🔍 Buscar... 🔔 👤│
│  Scholar     │                                           │
│  Admin Edu   │  ┌── Bandeja ──┐  ┌── Detalle ─────────┐ │
│              │  │ 🔴 Deserción│  │ Valentina Torres   │ │
│ ─────────── │  │ Valentina T │  │ ID: B-0001 · Ing.  │ │
│ 📊Dashboard │  │ Asist: 40%  │  │ ⚠️ ALERTA           │ │
│ 📜Historial │  │             │  │                     │ │
│ ⚙️Configura │  │ 🟡 Rendim. │  │ 📊 Estado Académico │ │
│              │  │ Carlos M.  │  │ 📊 Asistencia: 40% │ │
│              │  │ Prom: 2.0  │  │ 📊 Promedio: 3.5   │ │
│ 🚪Inicio     │  └────────────┘  │                     │ │
│              │                  │ 📝 Bitácora         │ │
│              │                  │ ── Alerta automát..│ │
│              │                  │ ── Remitido por ba..│ │
│              │                  │ ── Resuelto por Ps..│ │
│              │                  │                     │ │
│              │                  │ Agregar observación │ │
│              │                  │ [________________] │ │
│              │                  │ [Guardar Observac..]│ │
│              │                  └─────────────────────┘ │
└──────────────┴──────────────────────────────────────────┘
```

### 6.1 Dashboard

- Muestra todos los estudiantes con `estado === 'Alerta'`
- Cada tarjeta contiene: nombre, programa, semestre, badge de motivo, asistencia %, promedio, origen de alerta, fecha de remisión
- Botón "Ver caso completo" → cambia a la sección de bandeja de alertas

### 6.2 Bandeja de Alertas (Dos Paneles)

Cuando se selecciona "Ver caso completo" o se hace clic en una alerta:

```
┌─────────────────────┬────────────────────────────────┐
│ Bandeja de Alertas  │  Detalle del Caso              │
│                     │                                │
│ ┌─────────────────┐│  ┌────────────────────────────┐ │
│ │ 🔴 Deserción    ││  │ Nombre: Valentina Torres   │ │
│ │ Valentina       ││  │ Motivo: Riesgo deserción   │ │
│ │ Asist: 40%      ││  │ [✅ Resolver Caso]         │ │
│ └─────────────────┘│  ├────────────────────────────┤ │
│                     │  │ 📊Estado: Alerta           │ │
│ ┌─────────────────┐│  │ 📊Asistencia: 40% ❌       │ │
│ │ 🟡 Rendimiento  ││  │ 📊Promedio: 3.5            │ │
│ │ Carlos M.       ││  ├────────────────────────────┤ │
│ │ Prom: 2.0       ││  │ 📝 Bitácora                │ │
│ └─────────────────┘│  │ ○ Alerta automática...     │ │
│                     │  │ ○ Remitido por bajo...    │ │
│ 2 Casos Activos     │  │ ○ Resuelto...             │ │
└─────────────────────┴────────────────────────────────┘
```

- **Panel izquierdo** (`psych-tray`): lista de alertas con borde de color según prioridad
- **Panel derecho** (`psych-detail`): detalle completo del caso seleccionado

### 6.3 Detalle del Caso

Tres tarjetas de contexto académico (`context-grid`):

| Contexto | Indicador | Estado |
|----------|-----------|--------|
| **Estado Académico** | En Alerta / Normal | Requiere atención ✅/❌ |
| **Asistencia** | 40% Asistencia | Por debajo del 80% / OK |
| **Promedio Notas** | 3.5 Prom | Registrado / Sin notas |

**Bitácora de Seguimiento** (`#bitacora-list`):
- Línea de tiempo vertical con dots y tarjetas
- Cada entrada muestra: tipo (Alerta, Remisión, Observación, Resolución), fecha y nota
- Orden cronológico inverso (más reciente primero)

### 6.4 Agregar Observación

```javascript
window.guardarObservacion = function() {
  var nota = document.getElementById('obs-textarea').value.trim();
  if (!nota) { showToast('Escribe una observación antes de guardar.', 'warning'); return; }
  var idx = lista.findIndex(function(e) { return e.id === selectedPsychId; });
  lista[idx].bitacora.push({ fecha: new Date().toLocaleString('es-CO'), nota: nota, tipo: 'observacion' });
  saveEstudiantes(lista);
  textarea.value = '';
  actualizarBitacora(selectedPsychId);  // Re-renderiza solo la bitácora
};
```

- Se asigna a `window.guardarObservacion` para máxima compatibilidad
- También se usa delegación de eventos a nivel de documento como fallback
- `actualizarBitacora(id)` re-renderiza la línea de tiempo desde `localStorage`

### 6.5 Resolver Caso

```javascript
function handleResolver(id) {
  est.estado = 'Normal';
  est.bitacora.push({ fecha, nota: 'Caso resuelto por Psicología', tipo: 'resolucion' });
  est.motivoRemision = null;
  est.alertaAutomatica = false;
  est.motivoAlerta = null;
  saveEstudiantes(lista);
  addNotificacionSistema(`Caso resuelto: ${est.nombre} fue dado de alta`, 'success', 'view-docente');
}
```

Al resolver:
1. El estudiante vuelve a estado "Normal"
2. Se registra en la bitácora como "Resolución"
3. Se limpian `motivoRemision`, `alertaAutomatica`, `motivoAlerta`
4. Se notifica al docente ("Caso resuelto")
5. El estudiante desaparece de la bandeja de alertas

---

## 7. Diseño y UX

### 7.1 Sistema de Colores (Obsidian Dark)

```css
:root {
  --color-bg: #09090b;                    /* Fondo principal */
  --color-surface: #0c0c0f;               /* Superficies */
  --color-primary: #a78bfa;               /* Violeta (Docente) */
  --color-primary-container: #7c3aed;
  --color-tertiary: #34d399;              /* Verde (Psicología) */
  --color-error: #ef4444;                 /* Rojo (Alertas) */
  --color-warn: #f59e0b;                  /* Ámbar (Advertencias) */
  --color-on-surface: #fafafa;            /* Texto principal */
  --color-on-surface-variant: #a1a1aa;    /* Texto secundario */
  --color-outline: #52525b;               /* Bordes */
  --color-outline-variant: rgba(39,39,42,0.6);
}
```

### 7.2 Glassmorphism

Aplicado en cards, modales, stat cards, settings y dashboard:

```css
.glass-card {
  background: rgba(12, 12, 15, 0.55);
  backdrop-filter: blur(14px) saturate(1.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}
.glass-card:hover {
  background: rgba(18, 18, 21, 0.65);
  border-color: rgba(167, 139, 250, 0.2);
  transform: translateY(-2px);
}
```

### 7.3 Fondo Animado

```css
.bg-animated {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(167,139,250,0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(52,211,153,0.10) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(124,58,237,0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 10% 90%, rgba(251,191,36,0.08) 0%, transparent 50%);
  background-size: 200% 200%;
  animation: gradienteMovil 20s ease-in-out infinite;
}
@keyframes gradienteMovil {
  0%   { background-position: 0% 50%; }
  25%  { background-position: 100% 0%; }
  50%  { background-position: 100% 100%; }
  75%  { background-position: 0% 100%; }
  100% { background-position: 0% 50%; }
}
```

Cuatro elipses de colores orbitan lentamente creando un efecto de profundidad. El fondo está fijo (`position: fixed`), con `z-index: 0`, y las vistas tienen `z-index: 1`.

### 7.4 Responsive Design

- **≥ 1024px**: Layout completo con sidebar fija
- **768px - 1023px**: Sidebar colapsable, búsqueda reducida
- **≤ 767px**:
  - Sidebar oculta con `transform: translateX(-100%)`, se abre con botón flotante (esquina inferior izquierda)
  - Panel psicólogo: las dos columnas se muestran una a la vez
  - Stats: 1 columna
  - Topbar: título oculto

### 7.5 Toast System

```javascript
function showToast(mensaje, tipo) {
  const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
  const classes = { success: 'toast-success', error: 'toast-error', warning: 'toast-warning', info: 'toast-info' };
  const toast = document.createElement('div');
  toast.className = 'toast ' + classes[tipo];
  toast.innerHTML = `<span class="material-symbols-outlined">${icons[tipo]}</span> ${mensaje}`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
```

- 4 tipos: `success`, `error`, `warning`, `info`
- Desaparece después de 3.5s con animación slide-out

---

## 8. Persistencia y Migración

### 8.1 localStorage

Todos los datos se almacenan en `localStorage` y sobreviven recargas completas del navegador (F5).

### 8.2 Esquema de Versiones

```javascript
const DATA_VERSION = 2;

function migrarDatos() {
  const ver = parseInt(localStorage.getItem('seguibecas_version') || '0');
  if (ver === 0) {
    // Fresh install: limpiar datos corruptos legacy
    localStorage.removeItem('seguibecas_estudiantes');
    localStorage.removeItem('seguibecas_notificaciones');
    localStorage.setItem('seguibecas_version', String(DATA_VERSION));
  }
  if (ver > 0 && ver < DATA_VERSION) {
    // Future migration: preservar datos existentes
    localStorage.setItem('seguibecas_version', String(DATA_VERSION));
  }
}
```

**Seguridad**: Solo borra datos en instalación fresca (versión 0). En upgrades futuros (ej: v2 → v3), los datos se preservan intactos.

### 8.3 Datos Iniciales

Si no hay estudiantes en localStorage, se cargan 6 estudiantes de ejemplo:

| # | Nombre | Programa |
|---|--------|----------|
| 1 | Valentina Torres Ruiz | Ingeniería de Sistemas |
| 2 | Carlos Andrés Mejía | Contaduría Pública |
| 3 | Luisa Fernanda Ospina | Administración de Empresas |
| 4 | Daniel Esteban Cárdenas | Psicología |
| 5 | María Camila Delgado | Medicina |
| 6 | Juan Pablo Herrera | Derecho |

### 8.4 Exportación / Importación JSON

**Exportar**: `exportarDatosJSON()` (línea 218)
```javascript
const data = {
  estudiantes: getEstudiantes(),
  umbrales: getUmbrales(),
  notificaciones: getNotificaciones(),
  usuarios: getUsuarios(),
  fechaExportacion: new Date().toISOString()
};
// Descarga como seguibecas_datos_YYYY-MM-DD.json
```

**Importar**: `importarDatosJSON(file)` (línea 236)
```javascript
// 1. Lee el archivo con FileReader
// 2. Valida que tenga data.estudiantes
// 3. Pide confirmación: "Se reemplazarán todos los datos"
// 4. Reemplaza estudiantes, umbrales, notificaciones, usuarios
// 5. Re-renderiza todas las vistas
```

---

## 9. Diagramas de Flujo

### 9.1 Ciclo de Vida de un Estudiante

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Normal  │────▶│ Alerta   │────▶│Psicólogo │────▶│  Normal  │
│          │     │ (Auto)   │     │ Revisa   │     │(Resuelto)│
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                                  ▲
     │                │ (Docente remite)                 │
     │                ▼                                  │
     │         ┌──────────┐                              │
     └────────▶│ Alerta   │──────────────────────────────┘
               │ (Docente)│
               └──────────┘
```

### 9.2 Flujo de Datos (Read/Write)

```
                     ┌─────────────┐
                     │ localStorage │
                     └──────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
       ┌──────────┐  ┌──────────┐  ┌──────────┐
       │get/save  │  │get/save  │  │get/save  │
       │Estudiant.│  │Usuarios  │  │Umbrales  │
       └────┬─────┘  └────┬─────┘  └────┬─────┘
            │             │             │
            ▼             ▼             ▼
     ┌────────────┐ ┌───────────┐ ┌──────────┐
     │renderDocen │ │actualizar │ │cargarUmbr│
     │renderPsico │ │Home       │ │          │
     │showCaseDtl │ │listarUsrs │ │          │
     │actualizarB │ └───────────┘ └──────────┘
     │itacora     │
     └────────────┘
```

### 9.3 Estructura de localStorage

```
localStorage (navegador)
│
├── seguibecas_version       → 2
├── seguibecas_estudiantes   → [{id, nombre, programa, semestre, estado,
│                                 asistencia[], calificaciones[], bitacora[],
│                                 remisiones[], ...}, ...]
├── seguibecas_usuarios      → [{id, nombre, email, rol, fechaRegistro}, ...]
├── seguibecas_umbrales      → {asistenciaMin: 60, notaMin: 3.0, faltasConsecutivas: 3}
├── seguibecas_notificaciones→ [{id, mensaje, fecha, leida, tipo, linkView}, ...]
└── seguibecas_sesion        → {id, nombre, email, rol, ...} | null
```

---

## 10. Referencias Rápidas del Código

| Concepto | Función | Archivo:Línea |
|----------|---------|--------------|
| Migración de datos | `migrarDatos()` | `app.js:3` |
| Obtener estudiantes | `getEstudiantes()` | `app.js:46` |
| Guardar estudiantes | `saveEstudiantes(data)` | `app.js:73` |
| Obtener umbrales | `getUmbrales()` | `app.js:34` |
| Guardar umbrales | `saveUmbrales(u)` | `app.js:42` |
| Notificaciones | `addNotificacionSistema()` | `app.js:119` |
| Registro de usuario | `registrarUsuario()` | `app.js:173` |
| Inicio de sesión | `iniciarSesion(email)` | `app.js:189` |
| Cerrar sesión | `cerrarSesion()` | `app.js:200` |
| Cargar sesión | `cargarSesion()` | `app.js:208` |
| Exportar JSON | `exportarDatosJSON()` | `app.js:218` |
| Importar JSON | `importarDatosJSON(file)` | `app.js:236` |
| Home: actualizar | `actualizarHome()` | `app.js:274` |
| Toast | `showToast(mensaje, tipo)` | `app.js:341` |
| Cambiar vista | `showView(viewId)` | `app.js:352` |
| Asistencia hoy | `todayStr()` | `app.js:384` |
| Faltas consecutivas | `getConsecutiveAbsences()` | `app.js:389` |
| Tasa de asistencia | `getAttendanceRate()` | `app.js:399` |
| Promedio de notas | `getAvgGrade()` | `app.js:405` |
| Alerta automática | `checkAutoAlert(est, u)` | `app.js:423` |
| Render docente | `renderDocente(filter)` | `app.js:448` |
| Marcar asistió | `handleAsistio(id)` | `app.js:539` |
| Marcar faltó | `handleFalto(id)` | `app.js:553` |
| Registrar nota | `handleGrade(id, btn)` | `app.js:567` |
| Remitir a psicología | `handleReferir(id, motivo)` | `app.js:597` |
| Eliminar estudiante | `handleDelete(id)` | `app.js:615` |
| Dashboard psicólogo | `renderPsicDashboard()` | `app.js:636` |
| Render psicólogo | `renderPsicologo()` | `app.js:734` |
| Mostrar detalle caso | `showCaseDetail(id)` | `app.js:793` |
| Resolver caso | `handleResolver(id)` | `app.js:844` |
| Activar sección docente | `activarSeccionDocente(sec)` | `app.js:860` |
| Activar sección psicólogo | `activarSeccionPsicologo(sec)` | `app.js:872` |
| Guardar observación | `guardarObservacion()` | `app.js:1014` |
| Actualizar bitácora | `actualizarBitacora(id)` | `app.js:92` |
| Render notificaciones | `renderNotificaciones()` | `app.js:954` |
| Saludo por hora | `getSaludo()` | `app.js:1054` |

---

## Apéndice: Reglas de Alertas Automáticas

| Regla | Condición | Motivo |
|-------|-----------|--------|
| Asistencia baja | `asistencia.length > 0 && rate < umbral.asistenciaMin` | `desercion` |
| Faltas consecutivas | `getConsecutiveAbsences() >= umbral.faltasConsecutivas` | `desercion` |
| Promedio bajo | `avg !== null && parseFloat(avg) < umbral.notaMin` | `bajo_rendimiento` |

> **Nota**: Si el estudiante ya está en estado `'Alerta'`, no se generan nuevas alertas automáticas (`if (est.estado === 'Alerta') return`).

---

*Documento generado para exposición en clase. Proyecto: SeguiBecas — Obsidian Scholar.*
