# SeguiBecas

Sistema de seguimiento para estudiantes becados. Aplicación web de página única (SPA) con dos roles: **Docente** y **Psicólogo/a**, construida con HTML, CSS y JavaScript vanilla.

🔗 **Repositorio:** https://github.com/Aryom-dev/proyecto-final-logica-de-programacion

---

## 🚀 Cómo usar

1. Descarga o clona el repositorio
2. Abre `seguibecas/index.html` en tu navegador (doble clic, funciona con `file://`)
3. Registra un usuario con tu nombre y rol (Docente o Psicólogo/a)
4. ¡Listo! Todos los datos se guardan automáticamente en `localStorage`

No requiere instalación, servidor ni dependencias.

---

## ✨ Funcionalidades

| Funcionalidad | Descripción |
|--------------|-------------|
| **Registro de usuarios** | Crea cuentas con rol Docente o Psicólogo/a, inicio de sesión con un clic |
| **CRUD estudiantes** | Agregar, eliminar (doble clic para confirmar), listar estudiantes |
| **Asistencia** | Registrar asistencia/falta por día, cálculo automático de porcentaje |
| **Calificaciones** | Notas de 1 a 5, se muestran como chips con promedio calculado |
| **Alertas automáticas** | Se disparan cuando: asistencia < 60%, faltas consecutivas ≥ 3, o promedio < 3.0 |
| **Remisión a Psicología** | El docente remite casos con motivo (bajo rendimiento / deserción) |
| **Bitácora** | Línea de tiempo con todas las interacciones: alertas, remisiones, observaciones, resoluciones |
| **Notificaciones** | Panel desplegable con badge, notificaciones clickeables para navegar |
| **Panel Psicólogo** | Bandeja de casos, detalle expandible, observaciones, resolución de casos |
| **Exportar / Importar** | Respaldo y restauración de datos en JSON |
| **Configuración** | Umbrales de alerta personalizables (asistencia mínima, nota mínima, faltas consecutivas) |
| **Tema oscuro** | Diseño Obsidian dark con glassmorphism y fondo animado |
| **Responsive** | Adaptable a escritorio y móvil |

---

## 🏗️ Arquitectura

```
seguibecas/
├── index.html      # Estructura HTML (3 vistas + 5 modales)
├── style.css       # Sistema de diseño (tema oscuro + glassmorphism)
├── app.js          # Lógica completa (datos, UI, eventos)
└── WALKTHROUGH.md  # Documentación técnica para exposición
```

- **Modelo:** `localStorage` con 6 claves (estudiantes, usuarios, umbrales, notificaciones, sesión, versión)
- **Vista:** 3 vistas que alternan con clase `.active` (Home, Docente, Psicólogo)
- **Controlador:** JavaScript vanilla con eventos delegados y funciones globales

---

## 👤 Roles

### Docente
- Panel con estadísticas (total estudiantes, alertas activas, asistencia promedio)
- Tabla de estudiantes con acciones: asistencia, notas, remitir, eliminar
- Historial de remisiones
- Configuración de umbrales de alerta

### Psicólogo/a
- Dashboard con estudiantes en seguimiento
- Bandeja de casos con dos paneles (lista + detalle)
- Bitácora con línea de tiempo
- Agregar observaciones y resolver casos

---

## 💾 Persistencia

Todos los datos se almacenan en `localStorage` del navegador y persisten al recargar la página. Se incluye migración automática de datos entre versiones.

---

## 🎨 Diseño

- **Tema:** Obsidian dark (`#09090b` fondo, `#a78bfa` violeta, `#34d399` verde)
- **Efectos:** Glassmorphism con `backdrop-filter: blur()`
- **Animación:** Fondo con gradientes radiales en órbita
- **Tipografía:** Geist (Google Fonts)
- **Iconos:** Material Symbols (Google Fonts)

---

## 📦 Stack técnico

- HTML5
- CSS3 (variables, flexbox, grid, animaciones, media queries)
- JavaScript ES5/ES6 (sin frameworks, sin bundlers, sin dependencias)
- localStorage para persistencia
- Google Fonts CDN (Geist + Material Symbols)

---

## ©️ Créditos

**2026 — Iván Solarte** — Proyecto final de Lógica de Programación.
