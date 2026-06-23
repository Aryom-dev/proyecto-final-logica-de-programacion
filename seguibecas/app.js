const DATA_VERSION = 2;

function migrarDatos() {
  const ver = parseInt(localStorage.getItem('seguibecas_version') || '0');
  if (ver < DATA_VERSION) {
    localStorage.removeItem('seguibecas_estudiantes');
    localStorage.removeItem('seguibecas_notificaciones');
    localStorage.setItem('seguibecas_version', String(DATA_VERSION));
  }
}
migrarDatos();

const DATOS_INICIALES = [
  { id: 1, nombre: "Valentina Torres Ruiz", programa: "Ingeniería de Sistemas", semestre: 3, estado: "Normal", asistencia: [], calificaciones: [], bitacora: [], remisiones: [], notificaciones: [], motivoRemision: null, remitidoPor: null, fechaRemision: null, alertaAutomatica: false, motivoAlerta: null },
  { id: 2, nombre: "Carlos Andrés Mejía", programa: "Contaduría Pública", semestre: 2, estado: "Normal", asistencia: [], calificaciones: [], bitacora: [], remisiones: [], notificaciones: [], motivoRemision: null, remitidoPor: null, fechaRemision: null, alertaAutomatica: false, motivoAlerta: null },
  { id: 3, nombre: "Luisa Fernanda Ospina", programa: "Administración de Empresas", semestre: 4, estado: "Normal", asistencia: [], calificaciones: [], bitacora: [], remisiones: [], notificaciones: [], motivoRemision: null, remitidoPor: null, fechaRemision: null, alertaAutomatica: false, motivoAlerta: null },
  { id: 4, nombre: "Daniel Esteban Cárdenas", programa: "Psicología", semestre: 1, estado: "Normal", asistencia: [], calificaciones: [], bitacora: [], remisiones: [], notificaciones: [], motivoRemision: null, remitidoPor: null, fechaRemision: null, alertaAutomatica: false, motivoAlerta: null },
  { id: 5, nombre: "María Camila Delgado", programa: "Medicina", semestre: 5, estado: "Normal", asistencia: [], calificaciones: [], bitacora: [], remisiones: [], notificaciones: [], motivoRemision: null, remitidoPor: null, fechaRemision: null, alertaAutomatica: false, motivoAlerta: null },
  { id: 6, nombre: "Juan Pablo Herrera", programa: "Derecho", semestre: 2, estado: "Normal", asistencia: [], calificaciones: [], bitacora: [], remisiones: [], notificaciones: [], motivoRemision: null, remitidoPor: null, fechaRemision: null, alertaAutomatica: false, motivoAlerta: null }
];

let nextId = 7;
let selectedPsychId = null;
let docenteSortFilter = null; // null | "alertas" | "asistencia"
let notificacionesSistema = [];
let notifIdCounter = 1;

function getUmbrales() {
  try {
    const d = localStorage.getItem('seguibecas_umbrales');
    if (d) return JSON.parse(d);
  } catch {}
  return { asistenciaMin: 60, notaMin: 3.0, faltasConsecutivas: 3 };
}

function saveUmbrales(u) {
  localStorage.setItem('seguibecas_umbrales', JSON.stringify(u));
}

function getEstudiantes() {
  try {
    const data = localStorage.getItem('seguibecas_estudiantes');
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.map(migrarEstudiante);
    }
  } catch {}
  const init = JSON.parse(JSON.stringify(DATOS_INICIALES));
  saveEstudiantes(init);
  return init;
}

function migrarEstudiante(e) {
  if (!e.remisiones) e.remisiones = [];
  if (!e.notificaciones) e.notificaciones = [];
  if (!e.motivoRemision) e.motivoRemision = null;
  if (!e.remitidoPor) e.remitidoPor = null;
  if (!e.fechaRemision) e.fechaRemision = null;
  if (!e.alertaAutomatica) e.alertaAutomatica = false;
  if (!e.motivoAlerta) e.motivoAlerta = null;
  if (e.calificaciones && e.calificaciones.length > 0 && typeof e.calificaciones[0] === 'number') {
    e.calificaciones = e.calificaciones.map(n => ({ nota: n, fecha: '' }));
  }
  return e;
}

function saveEstudiantes(data) {
  localStorage.setItem('seguibecas_estudiantes', JSON.stringify(data));
}

function updateEstudiante(id, campos) {
  const lista = getEstudiantes();
  const idx = lista.findIndex(e => e.id === id);
  if (idx !== -1) { lista[idx] = { ...lista[idx], ...campos }; saveEstudiantes(lista); }
}

function addBitacora(id, nota, tipo) {
  const lista = getEstudiantes();
  const idx = lista.findIndex(e => e.id === id);
  if (idx !== -1) {
    lista[idx].bitacora.push({ fecha: new Date().toLocaleString('es-CO'), nota: nota.trim(), tipo: tipo || 'seguimiento' });
    saveEstudiantes(lista);
  }
}

function actualizarBitacora(id) {
  const estudiantes = getEstudiantes();
  const est = estudiantes.find(e => e.id === id);
  if (!est) return;
  const bitacoraList = document.getElementById('bitacora-list');
  if (!bitacoraList) return;
  bitacoraList.innerHTML = '';
  if (!est.bitacora || est.bitacora.length === 0) {
    bitacoraList.innerHTML = '<div style="padding:1rem;color:var(--color-on-surface-variant);font-size:var(--text-sm)">No hay registros en la bitácora.</div>';
  } else {
    est.bitacora.slice().reverse().forEach(function(entry) {
      const div = document.createElement('div');
      div.className = 'bitacora-entry';
      div.innerHTML =
        '<div class="bitacora-dot"></div>' +
        '<div class="bitacora-card">' +
          '<div class="bitacora-card-top">' +
            '<span class="label">' + (entry.tipo === 'alerta' ? 'Alerta' : entry.tipo === 'remision' ? 'Remisión' : entry.tipo === 'observacion' ? 'Observación' : entry.tipo === 'resolucion' ? 'Resolución' : 'Seguimiento') + '</span>' +
            '<span class="time">' + entry.fecha + '</span>' +
          '</div>' +
          '<p>' + entry.nota + '</p>' +
        '</div>';
      bitacoraList.appendChild(div);
    });
  }
}

function addNotificacionSistema(mensaje, tipo, linkView) {
  const n = { id: notifIdCounter++, mensaje, fecha: new Date().toLocaleString('es-CO'), leida: false, tipo: tipo || 'info', linkView: linkView || null };
  notificacionesSistema.unshift(n);
  if (notificacionesSistema.length > 50) notificacionesSistema = notificacionesSistema.slice(0, 50);
  localStorage.setItem('seguibecas_notificaciones', JSON.stringify(notificacionesSistema));
  actualizarBadgesNotif();
}

function getNotificaciones() {
  try {
    const d = localStorage.getItem('seguibecas_notificaciones');
    if (d) { notificacionesSistema = JSON.parse(d); notifIdCounter = notificacionesSistema.length + 1; }
  } catch {}
  return notificacionesSistema;
}

function marcarNotificacionesLeidas() {
  notificacionesSistema.forEach(n => n.leida = true);
  localStorage.setItem('seguibecas_notificaciones', JSON.stringify(notificacionesSistema));
  actualizarBadgesNotif();
}

function actualizarBadgesNotif() {
  const noLeidas = notificacionesSistema.filter(n => !n.leida).length;
  ['docente', 'psicologo'].forEach(r => {
    const badge = document.getElementById('notif-badge-' + r);
    if (badge) {
      if (noLeidas > 0) { badge.textContent = noLeidas; badge.style.display = 'flex'; }
      else { badge.style.display = 'none'; }
    }
  });
}

function getInitials(name) {
  return name.split(' ').filter(w => w.length > 0).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// ============================================================
// USER SYSTEM
// ============================================================
let sesionActual = null;

function getUsuarios() {
  try {
    const d = localStorage.getItem('seguibecas_usuarios');
    if (d) return JSON.parse(d);
  } catch {}
  return [];
}

function saveUsuarios(lista) {
  localStorage.setItem('seguibecas_usuarios', JSON.stringify(lista));
}

function registrarUsuario(nombre, email, rol) {
  const lista = getUsuarios();
  if (lista.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    showToast('Ya existe un usuario con ese correo.', 'error');
    return false;
  }
  const u = { id: Date.now(), nombre, email: email.toLowerCase(), rol, fechaRegistro: new Date().toISOString() };
  lista.push(u);
  saveUsuarios(lista);
  sesionActual = u;
  localStorage.setItem('seguibecas_sesion', JSON.stringify(u));
  showToast('Usuario registrado correctamente.', 'success');
  actualizarHome();
  return true;
}

function iniciarSesion(email) {
  const lista = getUsuarios();
  const u = lista.find(x => x.email.toLowerCase() === email.toLowerCase());
  if (!u) { showToast('Usuario no encontrado.', 'error'); return false; }
  sesionActual = u;
  localStorage.setItem('seguibecas_sesion', JSON.stringify(u));
  actualizarHome();
  showToast('Sesión iniciada como ' + u.nombre, 'success');
  return true;
}

function cerrarSesion() {
  sesionActual = null;
  localStorage.removeItem('seguibecas_sesion');
  showView('view-home');
  actualizarHome();
  showToast('Sesión cerrada.', 'info');
}

function cargarSesion() {
  try {
    const d = localStorage.getItem('seguibecas_sesion');
    if (d) { sesionActual = JSON.parse(d); actualizarHome(); }
  } catch {}
}

// ============================================================
// EXPORT / IMPORT
// ============================================================
function exportarDatosJSON() {
  const data = {
    estudiantes: getEstudiantes(),
    umbrales: getUmbrales(),
    notificaciones: getNotificaciones(),
    usuarios: getUsuarios(),
    fechaExportacion: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'seguibecas_datos_' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Datos exportados correctamente.', 'success');
}

function importarDatosJSON(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.estudiantes) { showToast('El archivo no contiene datos válidos.', 'error'); return; }
      const confirmar = confirm('Se reemplazarán todos los datos actuales. ¿Continuar?');
      if (!confirmar) return;
      saveEstudiantes(data.estudiantes);
      if (data.umbrales) saveUmbrales(data.umbrales);
      if (data.notificaciones) {
        notificacionesSistema = data.notificaciones;
        localStorage.setItem('seguibecas_notificaciones', JSON.stringify(data.notificaciones));
      }
      if (data.usuarios) saveUsuarios(data.usuarios);
      showToast('Datos importados correctamente.', 'success');
      cerrarModalImport();
      renderDocente();
      renderPsicDashboard();
      actualizarHome();
      actualizarBadgesNotif();
    } catch (err) {
      showToast('Error al leer el archivo: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

function cerrarModalImport() {
  document.getElementById('modal-import-overlay').style.display = 'none';
  document.getElementById('import-file-input').value = '';
  document.getElementById('btn-import-confirm').disabled = true;
}

// ============================================================
// HOME RENDERING
// ============================================================
function actualizarHome() {
  const loggedOut = document.getElementById('home-logged-out');
  const loggedIn = document.getElementById('home-logged-in');
  if (!loggedOut || !loggedIn) return;
  if (sesionActual) {
    loggedOut.style.display = 'none';
    loggedIn.style.display = 'block';
    document.getElementById('home-saludo').textContent = getSaludo() + ',';
    document.getElementById('home-user-name').textContent = sesionActual.nombre;
    const rolLabel = sesionActual.rol === 'docente' ? 'Docente' : 'Psicólogo/a';
    document.getElementById('home-user-role').textContent = 'Rol: ' + rolLabel;
    document.getElementById('home-btn-ir-panel').onclick = function() {
      showView(sesionActual.rol === 'docente' ? 'view-docente' : 'view-psicologo');
    };
    document.getElementById('docente-user-label').textContent = sesionActual.nombre;
    document.getElementById('docente-user-label').style.display = 'inline';
    document.getElementById('docente-avatar').textContent = getInitials(sesionActual.nombre);
    document.getElementById('psicologo-user-label').textContent = sesionActual.nombre;
    document.getElementById('psicologo-user-label').style.display = 'inline';
    // Dropdown user names
    document.getElementById('dropdown-user-name-docente').textContent = sesionActual.nombre;
    document.getElementById('dropdown-user-name-psicologo').textContent = sesionActual.nombre;
    const icon = sesionActual.rol === 'docente' ? 'local_library' : 'psychology';
    document.getElementById('dropdown-icon-docente').textContent = icon;
    document.getElementById('dropdown-icon-psicologo').textContent = icon;
  } else {
    loggedOut.style.display = 'block';
    loggedIn.style.display = 'none';
    document.getElementById('docente-user-label').style.display = 'none';
    document.getElementById('psicologo-user-label').style.display = 'none';
    renderizarUsuariosRegistrados();
  }
}

function renderizarUsuariosRegistrados() {
  const container = document.getElementById('home-users-list');
  const loggedOut = document.getElementById('home-logged-out');
  if (!container) return;
  const lista = getUsuarios();
  if (lista.length === 0) {
    loggedOut.classList.remove('has-users');
    container.innerHTML = '<p style="text-align:center;color:var(--color-on-surface-variant);font-size:var(--text-sm);padding:1rem 0">No hay usuarios registrados. Cree uno para comenzar.</p>';
    return;
  }
  loggedOut.classList.add('has-users');
  let html = '<h3 style="margin-bottom:0.75rem;font-size:var(--text-base);font-weight:500">Usuarios registrados</h3>';
  html += '<div style="display:flex;flex-direction:column;gap:0.5rem">';
  for (const u of lista) {
    const rolLabel = u.rol === 'docente' ? 'Docente' : 'Psicólogo/a';
    const icon = u.rol === 'docente' ? 'local_library' : 'psychology';
    html += '<button class="user-card" data-email="' + u.email + '" style="display:flex;align-items:center;gap:1rem;padding:0.85rem 1rem;background:rgba(12,12,15,0.45);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.06);border-radius:var(--radius-md);width:100%;text-align:left;cursor:pointer;transition:all 0.2s ease">';
    html += '<span class="material-symbols-outlined" style="font-size:1.5rem;color:' + (u.rol === 'docente' ? 'var(--color-primary)' : 'var(--color-tertiary)') + '">' + icon + '</span>';
    html += '<div style="flex:1"><strong style="font-size:var(--text-sm)">' + u.nombre + '</strong><br><span style="font-size:var(--text-xs);color:var(--color-on-surface-variant)">' + rolLabel + ' &middot; ' + u.email + '</span></div>';
    html += '<span class="material-symbols-outlined" style="color:var(--color-on-surface-variant);font-size:1.25rem">arrow_forward</span>';
    html += '</button>';
  }
  html += '</div>';
  container.innerHTML = html;
  container.querySelectorAll('.user-card').forEach(function(el) {
    el.addEventListener('click', function() {
      iniciarSesion(this.dataset.email);
    });
  });
}

const toastContainer = document.getElementById('toast-container');

function showToast(mensaje, tipo) {
  tipo = tipo || 'success';
  const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
  const classes = { success: 'toast-success', error: 'toast-error', warning: 'toast-warning', info: 'toast-info' };
  const toast = document.createElement('div');
  toast.className = 'toast ' + (classes[tipo] || 'toast-info');
  toast.innerHTML = '<span class="material-symbols-outlined" style="font-size:1.25rem">' + (icons[tipo] || 'info') + '</span> ' + mensaje;
  toastContainer.appendChild(toast);
  setTimeout(() => { toast.style.transition = 'all 0.3s ease'; toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)'; setTimeout(() => toast.remove(), 300); }, 3500);
}

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById(viewId);
  if (el) el.classList.add('active');
  window.scrollTo(0, 0);
  document.getElementById('sidebar-overlay').classList.remove('open');
  document.querySelectorAll('.sidebar').forEach(s => s.classList.remove('open'));
  document.getElementById('notif-panel').style.display = 'none';
  if (viewId === 'view-docente') {
    if (sesionActual) {
      document.getElementById('docente-user-label').textContent = sesionActual.nombre;
      document.getElementById('docente-user-label').style.display = 'inline';
      document.getElementById('docente-avatar').textContent = getInitials(sesionActual.nombre);
      document.getElementById('dropdown-user-name-docente').textContent = sesionActual.nombre;
      document.getElementById('dropdown-icon-docente').textContent = 'local_library';
    }
    docenteSortFilter = null; activarSeccionDocente('dashboard'); renderDocente();
  }
  if (viewId === 'view-psicologo') {
    if (sesionActual) {
      document.getElementById('psicologo-user-label').textContent = sesionActual.nombre;
      document.getElementById('psicologo-user-label').style.display = 'inline';
      document.getElementById('dropdown-user-name-psicologo').textContent = sesionActual.nombre;
      document.getElementById('dropdown-icon-psicologo').textContent = 'psychology';
    }
    activarSeccionPsicologo('dashboard'); renderPsicDashboard();
  }
  if (viewId === 'view-home') actualizarHome();
  getNotificaciones();
  actualizarBadgesNotif();
}

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function getConsecutiveAbsences(asistencia) {
  let count = 0;
  const sorted = [...asistencia].sort().reverse();
  for (const a of sorted) {
    if (a.includes(':falto')) count++;
    else break;
  }
  return count;
}

function getAttendanceRate(asistencia) {
  if (!asistencia.length) return 0;
  const attended = asistencia.filter(a => a.includes(':asistio')).length;
  return Math.round((attended / asistencia.length) * 100);
}

function getAvgGrade(calificaciones) {
  if (!calificaciones || !calificaciones.length) return null;
  const nums = calificaciones.map(c => typeof c === 'number' ? c : c.nota);
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}

function getMotivoText(motivo) {
  if (motivo === 'bajo_rendimiento') return 'Bajo rendimiento académico';
  if (motivo === 'desercion') return 'Riesgo de deserción';
  return motivo || 'No especificado';
}

function getMotivoIcon(motivo) {
  if (motivo === 'bajo_rendimiento') return 'school';
  if (motivo === 'desercion') return 'logout';
  return 'warning';
}

function checkAutoAlert(est, umbrales) {
  if (est.estado === 'Alerta') return;
  const rate = getAttendanceRate(est.asistencia);
  const avg = getAvgGrade(est.calificaciones);
  const consec = getConsecutiveAbsences(est.asistencia);
  let motivo = null;
  if (est.asistencia.length > 0 && rate < umbrales.asistenciaMin) motivo = 'desercion';
  else if (consec >= umbrales.faltasConsecutivas) motivo = 'desercion';
  else if (avg !== null && parseFloat(avg) < umbrales.notaMin) motivo = 'bajo_rendimiento';
  if (motivo) {
    const lista = getEstudiantes();
    const e = lista.find(x => x.id === est.id);
    if (!e || e.estado === 'Alerta') return;
    e.estado = 'Alerta';
    e.alertaAutomatica = true;
    e.motivoAlerta = motivo;
    e.fechaRemision = new Date().toISOString();
    e.remisiones.push({ fecha: new Date().toLocaleString('es-CO'), motivo, origen: 'automatico' });
    e.bitacora.push({ fecha: new Date().toLocaleString('es-CO'), nota: 'Alerta automática generada: ' + getMotivoText(motivo), tipo: 'alerta' });
    saveEstudiantes(lista);
    addNotificacionSistema('Alerta automática para ' + e.nombre + ': ' + getMotivoText(motivo), 'warning', 'view-docente');
    showToast('Alerta automática generada para ' + e.nombre, 'warning');
  }
}

function renderDocente(filter) {
  const estudiantes = getEstudiantes();
  const tbody = document.getElementById('docente-tbody');
  const umbrales = getUmbrales();
  const searchTerm = (filter || document.getElementById('search-docente').value || '').toLowerCase().trim();
  let filtered = searchTerm ? estudiantes.filter(e => e.nombre.toLowerCase().includes(searchTerm) || e.programa.toLowerCase().includes(searchTerm)) : [...estudiantes];
  if (docenteSortFilter === 'alertas') filtered = filtered.filter(e => e.estado === 'Alerta');
  else if (docenteSortFilter === 'asistencia') filtered.sort((a, b) => getAttendanceRate(a.asistencia) - getAttendanceRate(b.asistencia));

  document.getElementById('stat-total').textContent = filtered.length;
  const alertas = estudiantes.filter(e => e.estado === 'Alerta').length;
  document.getElementById('stat-alertas').textContent = alertas;
  document.getElementById('est-count').textContent = filtered.length + ' estudiantes';
  document.getElementById('table-info').textContent = 'Mostrando ' + filtered.length + ' estudiantes';

  let totalRate = 0;
  filtered.forEach(e => totalRate += getAttendanceRate(e.asistencia));
  const avgRate = filtered.length ? Math.round(totalRate / filtered.length) : 0;
  document.getElementById('stat-asistencia').textContent = avgRate + '%';
  document.getElementById('stat-bar').style.width = avgRate + '%';

  tbody.innerHTML = '';
  filtered.forEach(est => {
    const tr = document.createElement('tr');
    if (est.estado === 'Alerta') tr.className = 'alerta';
    const rate = getAttendanceRate(est.asistencia);
    const avg = getAvgGrade(est.calificaciones);
    const today = todayStr();
    const hasToday = est.asistencia.some(a => a.startsWith(today));

    let statusHtml = '';
    if (est.estado === 'Alerta') {
      const motivo = est.motivoAlerta || est.motivoRemision;
      const icon = getMotivoIcon(motivo);
      statusHtml = '<span class="badge badge-alerta"><span class="material-symbols-outlined">' + icon + '</span> Alerta</span>';
    } else {
      statusHtml = '<span class="badge badge-normal">Normal</span>';
    }

    let inReferral = est.estado === 'Alerta';
    let actionsHtml = '';
    if (inReferral) {
      const motivo = est.motivoRemision || est.motivoAlerta || '';
      actionsHtml = '<span class="badge badge-en-seguimiento">En seguimiento: ' + getMotivoText(motivo) + '</span>' +
        '<button class="btn-icon danger" data-action="delete" data-id="' + est.id + '" title="Eliminar estudiante"><span class="material-symbols-outlined">delete</span></button>';
    } else {
      const gradesHtml = (est.calificaciones && est.calificaciones.length) 
        ? est.calificaciones.map(g => '<span class="grade-item">' + (typeof g === 'number' ? g : g.nota) + '</span>').join('')
        : '<span style="color:var(--color-on-surface-variant);font-size:var(--text-xs)">Sin notas</span>';
      actionsHtml =
        '<button class="btn-icon success" data-action="asistio" data-id="' + est.id + '" title="Asistió"><span class="material-symbols-outlined">fact_check</span></button>' +
        '<button class="btn-icon danger" data-action="falto" data-id="' + est.id + '" title="Faltó"><span class="material-symbols-outlined">block</span></button>' +
        '<input type="number" class="grade-input" min="1" max="5" step="1" data-id="' + est.id + '" placeholder="1-5">' +
        '<button class="grade-submit" data-action="grade" data-id="' + est.id + '">Nota</button>' +
        '<button class="btn-icon refer" data-action="referir" data-id="' + est.id + '" title="Remitir a Psicología"><span class="material-symbols-outlined">flag</span></button>' +
        '<button class="btn-icon" data-action="delete" data-id="' + est.id + '" title="Eliminar estudiante"><span class="material-symbols-outlined">delete</span></button>';
    }

    tr.innerHTML =
      '<td><div class="student-cell"><div class="student-avatar">' + getInitials(est.nombre) + '</div><div><div class="student-name">' + est.nombre + '</div><div class="student-id">ID: ' + String(est.id).padStart(5, '0') + '</div></div></div></td>' +
      '<td style="color:var(--color-on-surface-variant)">' + est.programa + '</td>' +
      '<td><span style="' + (rate < 60 && est.asistencia.length > 0 ? 'color:var(--color-error)' : '') + '">' + rate + '%</span></td>' +
      '<td><div class="grade-list">' + (est.calificaciones && est.calificaciones.length ? est.calificaciones.map(g => '<span class="grade-item">' + (typeof g === 'number' ? g : g.nota) + '</span>').join('') : '<span style="color:var(--color-on-surface-variant);font-size:var(--text-xs)">N/A</span>') + '</div><span style="font-size:var(--text-xs);color:var(--color-on-surface-variant)">' + (avg !== null ? 'Prom: ' + avg : '') + '</span></td>' +
      '<td>' + statusHtml + '</td>' +
      '<td><div class="actions-cell">' + actionsHtml + '</div></td>';

    if (hasToday && !inReferral) {
      const todayAction = est.asistencia.find(a => a.startsWith(today));
      if (todayAction && todayAction.includes(':asistio')) {
        tr.querySelectorAll('[data-action]').forEach(b => { if (b.dataset.action === 'asistio') { b.style.background = 'var(--color-tertiary-container)'; b.style.color = 'var(--color-tertiary)'; b.style.borderColor = 'rgba(52,211,153,0.3)'; } });
      } else if (todayAction && todayAction.includes(':falto')) {
        tr.querySelectorAll('[data-action]').forEach(b => { if (b.dataset.action === 'falto') { b.style.background = 'var(--color-error-container)'; b.style.color = 'var(--color-error)'; b.style.borderColor = 'rgba(239,68,68,0.3)'; } });
      }
    }

    tbody.appendChild(tr);
  });

  document.querySelectorAll('#docente-tbody [data-action]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const action = this.dataset.action;
      const id = parseInt(this.dataset.id);
      if (action === 'asistio') handleAsistio(id);
      else if (action === 'falto') handleFalto(id);
      else if (action === 'grade') handleGrade(id, this);
      else if (action === 'referir') abrirModalReferir(id);
      else if (action === 'delete') handleDelete(id);
    });
  });
}

function handleAsistio(id) {
  const lista = getEstudiantes();
  const est = lista.find(e => e.id === id);
  if (!est) return;
  const today = todayStr();
  est.asistencia = est.asistencia.filter(a => !a.startsWith(today));
  est.asistencia.push(today + ':asistio');
  saveEstudiantes(lista);
  const umbrales = getUmbrales();
  checkAutoAlert(est, umbrales);
  showToast('Asistencia registrada para ' + est.nombre, 'success');
  renderDocente();
}

function handleFalto(id) {
  const lista = getEstudiantes();
  const est = lista.find(e => e.id === id);
  if (!est) return;
  const today = todayStr();
  est.asistencia = est.asistencia.filter(a => !a.startsWith(today));
  est.asistencia.push(today + ':falto');
  saveEstudiantes(lista);
  const umbrales = getUmbrales();
  checkAutoAlert(est, umbrales);
  showToast('Inasistencia registrada para ' + est.nombre, 'warning');
  renderDocente();
}

function handleGrade(id, btn) {
  const input = btn.parentElement.querySelector('.grade-input');
  if (!input) return;
  const val = parseInt(input.value);
  if (isNaN(val) || val < 1 || val > 5) {
    let err = input.parentElement.querySelector('.inline-error');
    if (!err) { err = document.createElement('div'); err.className = 'inline-error'; input.parentElement.appendChild(err); }
    err.textContent = 'Solo números enteros entre 1 y 5';
    return;
  }
  const lista = getEstudiantes();
  const est = lista.find(e => e.id === id);
  if (!est) return;
  if (!est.calificaciones) est.calificaciones = [];
  est.calificaciones.push({ nota: val, fecha: new Date().toLocaleString('es-CO') });
  saveEstudiantes(lista);
  const umbrales = getUmbrales();
  checkAutoAlert(est, umbrales);
  input.value = '';
  showToast('Nota ' + val + ' guardada para ' + est.nombre, 'success');
  renderDocente();
}

let pendingReferId = null;

function abrirModalReferir(id) {
  pendingReferId = id;
  document.getElementById('modal-referir-overlay').style.display = 'flex';
}

function handleReferir(id, motivo) {
  const lista = getEstudiantes();
  const est = lista.find(e => e.id === id);
  if (!est) return;
  est.estado = 'Alerta';
  est.motivoRemision = motivo;
  est.remitidoPor = 'docente';
  est.fechaRemision = new Date().toISOString();
  if (!est.remisiones) est.remisiones = [];
  est.remisiones.push({ fecha: new Date().toLocaleString('es-CO'), motivo, origen: 'docente' });
  est.bitacora.push({ fecha: new Date().toLocaleString('es-CO'), nota: 'Remitido a Psicología por: ' + getMotivoText(motivo), tipo: 'remision' });
  saveEstudiantes(lista);
  addNotificacionSistema(est.nombre + ' fue remitido a Psicología: ' + getMotivoText(motivo), 'warning', 'view-psicologo');
  showToast(est.nombre + ' remitido a Psicología', 'warning');
  pendingReferId = null;
  renderDocente();
}

function handleDelete(id) {
  const lista = getEstudiantes();
  const est = lista.find(e => e.id === id);
  if (!est) return;
  showToast('¿Eliminar a ' + est.nombre + '? Haz clic de nuevo para confirmar.', 'warning');
  const confirmBtn = document.querySelector('[data-action="delete"][data-id="' + id + '"]');
  if (confirmBtn && confirmBtn.dataset.confirming) {
    const idx = lista.findIndex(e => e.id === id);
    if (idx !== -1) { lista.splice(idx, 1); saveEstudiantes(lista); }
    showToast(est.nombre + ' eliminado del sistema', 'error');
    renderDocente();
    return;
  }
  if (confirmBtn) {
    confirmBtn.dataset.confirming = 'true';
    confirmBtn.style.background = 'var(--color-error-container)';
    confirmBtn.style.color = 'var(--color-error)';
    setTimeout(() => { if (confirmBtn) { delete confirmBtn.dataset.confirming; confirmBtn.style.background = ''; confirmBtn.style.color = ''; } }, 3000);
  }
}

function renderPsicDashboard() {
  const estudiantes = getEstudiantes();
  const alertas = estudiantes.filter(e => e.estado === 'Alerta');
  const list = document.getElementById('psic-dashboard-list');
  const count = document.getElementById('psic-seguimiento-count');
  count.textContent = alertas.length + ' estudiantes en seguimiento psicológico';
  list.innerHTML = '';
  if (!alertas.length) {
    list.innerHTML = '<div class="no-data"><span class="material-symbols-outlined">check_circle</span><h3>No hay estudiantes en seguimiento</h3><p>Todos los estudiantes están en estado normal.</p></div>';
    return;
  }
  alertas.forEach(est => {
    const rate = getAttendanceRate(est.asistencia);
    const avg = getAvgGrade(est.calificaciones);
    const motivo = est.motivoRemision || est.motivoAlerta;
    const origen = est.alertaAutomatica ? 'Automática' : 'Docente';
    const card = document.createElement('div');
    card.className = 'psic-dashboard-card';
    card.innerHTML =
      '<div class="top-row"><div><h3>' + est.nombre + '</h3><p class="subtitle">' + est.programa + ' • Sem ' + est.semestre + '</p></div><span class="badge badge-alerta"><span class="material-symbols-outlined">' + getMotivoIcon(motivo) + '</span> ' + getMotivoText(motivo) + '</span></div>' +
      '<div class="detail-row">' +
        '<div class="detail-item"><strong>Asistencia:</strong> ' + rate + '%</div>' +
        '<div class="detail-item"><strong>Promedio:</strong> ' + (avg !== null ? avg : 'N/A') + '</div>' +
        '<div class="detail-item"><strong>Origen:</strong> ' + origen + '</div>' +
        '<div class="detail-item"><strong>Remitido:</strong> ' + (est.fechaRemision ? new Date(est.fechaRemision).toLocaleDateString('es-CO') : 'N/A') + '</div>' +
      '</div>' +
      '<div style="margin-top:0.75rem;display:flex;gap:0.5rem">' +
        '<button class="btn btn-outline ver-caso-btn" data-id="' + est.id + '" style="font-size:var(--text-xs);padding:0.375rem 0.75rem"><span class="material-symbols-outlined" style="font-size:var(--text-sm)">open_in_new</span> Ver caso completo</button>' +
      '</div>';
    list.appendChild(card);
    card.querySelector('.ver-caso-btn').addEventListener('click', function() {
      selectedPsychId = est.id;
      activarSeccionPsicologo('alertas');
      renderPsicologo();
    });
  });
}

function renderHistorialDocente() {
  const estudiantes = getEstudiantes();
  const remitidos = estudiantes.filter(e => e.remisiones && e.remisiones.length > 0);
  const container = document.getElementById('docente-historial-content');
  container.innerHTML = '<h2 style="font-size:var(--text-2xl);font-weight:700;margin-bottom:0.5rem">Historial de Remisiones</h2><p style="color:var(--color-on-surface-variant);font-size:var(--text-sm);margin-bottom:1.5rem">Estudiantes que han sido remitidos a psicología.</p>';
  if (!remitidos.length) {
    container.innerHTML += '<div class="no-data"><span class="material-symbols-outlined">history</span><h3>Sin remisiones</h3><p>No hay estudiantes que hayan sido remitidos a psicología.</p></div>';
    return;
  }
  remitidos.forEach(est => {
    const card = document.createElement('div');
    card.className = 'historial-card';
    const remCount = est.remisiones.length;
    card.innerHTML =
      '<div class="historial-card-header"><div><h3>' + est.nombre + '</h3><p style="font-size:var(--text-xs);color:var(--color-on-surface-variant)">' + est.programa + ' • ' + remCount + ' remisión(es)</p></div><span class="material-symbols-outlined" style="color:var(--color-on-surface-variant)">expand_more</span></div>' +
      '<div class="historial-card-body">' +
        est.remisiones.slice().reverse().map(r =>
          '<div class="entry"><span class="date">' + r.fecha + '</span><br><strong>' + getMotivoText(r.motivo) + '</strong> (origen: ' + (r.origen === 'automatico' ? 'Automático' : 'Docente') + ')</div>'
        ).join('') +
      '</div>';
    container.appendChild(card);
    card.querySelector('.historial-card-header').addEventListener('click', function() {
      card.querySelector('.historial-card-body').classList.toggle('open');
      const icon = this.querySelector('.material-symbols-outlined');
      icon.textContent = icon.textContent === 'expand_more' ? 'expand_less' : 'expand_more';
    });
  });
}

function renderHistorialPsicologo() {
  const estudiantes = getEstudiantes();
  const conHistorial = estudiantes.filter(e => e.remisiones && e.remisiones.length > 0);
  const container = document.getElementById('psic-historial-content');
  container.innerHTML = '';
  if (!conHistorial.length) {
    container.innerHTML = '<div class="no-data"><span class="material-symbols-outlined">history</span><h3>Sin historial</h3><p>No hay registros de remisiones a psicología.</p></div>';
    return;
  }
  conHistorial.forEach(est => {
    const card = document.createElement('div');
    card.className = 'historial-card';
    card.innerHTML =
      '<div class="historial-card-header"><div><h3>' + est.nombre + '</h3><p style="font-size:var(--text-xs);color:var(--color-on-surface-variant)">' + est.programa + ' • Estado: ' + (est.estado === 'Alerta' ? 'En seguimiento' : 'Normal') + '</p></div><span class="material-symbols-outlined" style="color:var(--color-on-surface-variant)">expand_more</span></div>' +
      '<div class="historial-card-body">' +
        est.remisiones.slice().reverse().map(r =>
          '<div class="entry"><span class="date">' + r.fecha + '</span><br><strong>' + getMotivoText(r.motivo) + '</strong> (origen: ' + (r.origen === 'automatico' ? 'Automático' : 'Docente') + ')</div>'
        ).join('') +
        (est.bitacora && est.bitacora.length > 0 ? est.bitacora.slice().reverse().map(b =>
          '<div class="entry"><span class="date">' + b.fecha + '</span><br>' + b.nota + '</div>'
        ).join('') : '') +
      '</div>';
    container.appendChild(card);
    card.querySelector('.historial-card-header').addEventListener('click', function() {
      card.querySelector('.historial-card-body').classList.toggle('open');
      const icon = this.querySelector('.material-symbols-outlined');
      icon.textContent = icon.textContent === 'expand_more' ? 'expand_less' : 'expand_more';
    });
  });
}

function renderPsicologo() {
  const estudiantes = getEstudiantes();
  const alertas = estudiantes.filter(e => e.estado === 'Alerta');
  const list = document.getElementById('alertas-list');
  const count = document.getElementById('alerta-count');
  const empty = document.getElementById('psych-empty');
  const caseView = document.getElementById('psych-case-view');

  count.textContent = alertas.length + ' Casos Activos';

  list.innerHTML = '';
  if (alertas.length === 0) {
    list.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--color-on-surface-variant)"><span class="material-symbols-outlined" style="font-size:3rem;color:var(--color-outline-variant);display:block;margin-bottom:0.5rem">check_circle</span><p>No hay casos en alerta. Todo está en orden.</p></div>';
    selectedPsychId = null;
    empty.style.display = 'flex';
    caseView.style.display = 'none';
    return;
  }

  alertas.forEach(est => {
    const card = document.createElement('div');
    const isSelected = selectedPsychId === est.id;
    const rate = getAttendanceRate(est.asistencia);
    const motivo = est.motivoRemision || est.motivoAlerta;
    let priorityClass = 'alert-card-critical';
    let label = 'Alerta Crítica';
    let labelClass = 'critical';
    let riskTag = '';
    if (motivo === 'bajo_rendimiento') { priorityClass = 'alert-card-review'; label = 'Rendimiento'; labelClass = 'review'; riskTag = '<span class="alert-card-tag">Académico</span>'; }
    else if (motivo === 'desercion') { priorityClass = 'alert-card-critical'; label = 'Deserción'; labelClass = 'critical'; riskTag = '<span class="alert-card-tag danger">Riesgo Alto</span>'; }
    else { priorityClass = 'alert-card-followup'; label = 'Seguimiento'; labelClass = 'followup'; riskTag = '<span class="alert-card-tag">General</span>'; }
    if (isSelected) priorityClass += ' selected';
    card.className = 'alert-card ' + priorityClass;
    card.innerHTML =
      '<div class="alert-card-meta"><span class="alert-card-label ' + labelClass + '">' + label + '</span></div>' +
      '<h3>' + est.nombre + '</h3>' +
      '<p>' + est.programa + (est.semestre ? ' • Semestre ' + est.semestre : '') + '</p>' +
      '<div class="alert-card-tags">' +
        '<span class="alert-card-tag">Asistencia: ' + rate + '%</span>' +
        riskTag +
      '</div>';
    card.addEventListener('click', function() {
      selectedPsychId = est.id;
      renderPsicologo();
    });
    list.appendChild(card);
  });

  empty.style.display = 'none';
  caseView.style.display = 'flex';

  if (selectedPsychId && alertas.some(a => a.id === selectedPsychId)) {
    showCaseDetail(selectedPsychId);
  } else {
    showCaseDetail(alertas[0].id);
    selectedPsychId = alertas[0].id;
  }
}

function showCaseDetail(id) {
  const estudiantes = getEstudiantes();
  const est = estudiantes.find(e => e.id === id);
  if (!est) return;
  const caseView = document.getElementById('psych-case-view');
  caseView.style.display = 'flex';
  document.getElementById('psych-empty').style.display = 'none';

  document.getElementById('detail-name').textContent = est.nombre;
  document.getElementById('detail-meta').textContent = 'ID: Beca-' + String(est.id).padStart(4, '0') + ' • ' + est.programa + (est.semestre ? ' • ' + est.semestre + '° Semestre' : '');
  const motivo = est.motivoRemision || est.motivoAlerta;
  const origen = est.alertaAutomatica ? 'Automática' : 'Docente';
  document.getElementById('detail-motivo').textContent = 'Motivo: ' + getMotivoText(motivo) + ' (origen: ' + origen + ')';

  document.getElementById('btn-resolver').onclick = function() { handleResolver(est.id); };

  const rate = getAttendanceRate(est.asistencia);
  const avg = getAvgGrade(est.calificaciones);
  document.getElementById('ctx-academic').textContent = est.estado === 'Alerta' ? 'En Alerta' : 'Normal';
  document.getElementById('ctx-academic-status').textContent = est.estado === 'Alerta' ? 'Requiere atención' : 'Activo';
  document.getElementById('ctx-academic-status').style.color = est.estado === 'Alerta' ? 'var(--color-error)' : 'var(--color-tertiary)';
  document.getElementById('ctx-attendance').textContent = rate + '% Asistencia';
  document.getElementById('ctx-attendance-status').textContent = rate < 80 && est.asistencia.length > 0 ? 'Por debajo del 80%' : (est.asistencia.length === 0 ? 'Sin registro' : 'OK');
  document.getElementById('ctx-attendance-status').className = 'sub ' + (rate < 80 && est.asistencia.length > 0 ? 'error' : '');
  document.getElementById('ctx-grade').textContent = avg !== null ? avg + ' Prom' : 'N/A';
  document.getElementById('ctx-grade-status').textContent = avg !== null ? 'Registrado' : 'Sin notas';

  const bitacoraList = document.getElementById('bitacora-list');
  bitacoraList.innerHTML = '';
  if (!est.bitacora || est.bitacora.length === 0) {
    bitacoraList.innerHTML = '<div style="padding:1rem;color:var(--color-on-surface-variant);font-size:var(--text-sm)">No hay registros en la bitácora.</div>';
  } else {
    est.bitacora.slice().reverse().forEach((entry) => {
      const div = document.createElement('div');
      div.className = 'bitacora-entry';
      div.innerHTML =
        '<div class="bitacora-dot"></div>' +
        '<div class="bitacora-card">' +
          '<div class="bitacora-card-top">' +
            '<span class="label">' + (entry.tipo === 'alerta' ? 'Alerta' : entry.tipo === 'remision' ? 'Remisión' : entry.tipo === 'observacion' ? 'Observación' : entry.tipo === 'resolucion' ? 'Resolución' : 'Seguimiento') + '</span>' +
            '<span class="time">' + entry.fecha + '</span>' +
          '</div>' +
          '<p>' + entry.nota + '</p>' +
        '</div>';
      bitacoraList.appendChild(div);
    });
  }

  selectedPsychId = est.id;
}

function handleResolver(id) {
  const lista = getEstudiantes();
  const est = lista.find(e => e.id === id);
  if (!est) return;
  est.estado = 'Normal';
  est.bitacora.push({ fecha: new Date().toLocaleString('es-CO'), nota: 'Caso resuelto por Psicología', tipo: 'resolucion' });
  est.motivoRemision = null;
  est.alertaAutomatica = false;
  est.motivoAlerta = null;
  saveEstudiantes(lista);
  addNotificacionSistema('Caso resuelto: ' + est.nombre + ' fue dado de alta por Psicología', 'success', 'view-docente');
  showToast('Caso resuelto: ' + est.nombre, 'success');
  selectedPsychId = null;
  renderPsicologo();
}

function activarSeccionDocente(seccion) {
  document.querySelectorAll('[id^="docente-section-"]').forEach(s => s.style.display = 'none');
  document.querySelectorAll('#sidebar-docente .sidebar-nav a').forEach(a => a.classList.remove('active'));
  const secMap = { dashboard: 'docente-section-dashboard', historial: 'docente-section-historial', config: 'docente-section-config' };
  const el = document.getElementById(secMap[seccion]);
  if (el) el.style.display = seccion === 'alertas' ? 'flex' : 'block';
  const navLink = document.querySelector('#sidebar-docente .sidebar-nav a[data-section="' + seccion + '"]');
  if (navLink) navLink.classList.add('active');
  if (seccion === 'historial') renderHistorialDocente();
  if (seccion === 'dashboard') renderDocente();
}

function activarSeccionPsicologo(seccion) {
  document.querySelectorAll('[id^="psicologo-section-"]').forEach(s => s.style.display = 'none');
  document.querySelectorAll('#sidebar-psicologo .sidebar-nav a').forEach(a => a.classList.remove('active'));
  const secMap = { dashboard: 'psicologo-section-dashboard', historial: 'psicologo-section-historial', config: 'psicologo-section-config', alertas: 'psicologo-section-alertas' };
  const el = document.getElementById(secMap[seccion]);
  if (el) {
    el.style.display = seccion === 'alertas' ? 'flex' : 'block';
  }
  const navLink = document.querySelector('#sidebar-psicologo .sidebar-nav a[data-section="' + seccion + '"]');
  if (navLink) navLink.classList.add('active');
  if (seccion === 'historial') renderHistorialPsicologo();
  if (seccion === 'dashboard') renderPsicDashboard();
  if (seccion === 'alertas') renderPsicologo();
}

// --- MODAL REFERIR ---
document.getElementById('modal-referir-overlay').addEventListener('click', function(e) {
  if (e.target === this) { this.style.display = 'none'; pendingReferId = null; }
});
document.getElementById('modal-referir-close').addEventListener('click', function() {
  document.getElementById('modal-referir-overlay').style.display = 'none';
  pendingReferId = null;
});
document.querySelectorAll('.modal-option').forEach(btn => {
  btn.addEventListener('click', function() {
    const motivo = this.dataset.motivo;
    if (pendingReferId) {
      handleReferir(pendingReferId, motivo);
      document.getElementById('modal-referir-overlay').style.display = 'none';
    }
  });
});

// --- MODAL ADD STUDENT ---
document.getElementById('btn-add-student-open').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('modal-add-student-overlay').style.display = 'flex';
});
document.getElementById('btn-add-student-open2').addEventListener('click', function() {
  document.getElementById('modal-add-student-overlay').style.display = 'flex';
});
document.getElementById('modal-add-close').addEventListener('click', function() {
  document.getElementById('modal-add-student-overlay').style.display = 'none';
});
document.getElementById('modal-add-student-overlay').addEventListener('click', function(e) {
  if (e.target === this) this.style.display = 'none';
});
document.getElementById('btn-add-student').addEventListener('click', function() {
  const nombre = document.getElementById('add-nombre').value.trim();
  const programa = document.getElementById('add-programa').value.trim();
  const semestre = parseInt(document.getElementById('add-semestre').value) || 1;
  if (!nombre || !programa) { showToast('Completa todos los campos', 'error'); return; }
  const lista = getEstudiantes();
  const newId = Math.max(...lista.map(e => e.id), 0) + 1;
  lista.push({
    id: newId, nombre, programa, semestre, estado: "Normal",
    asistencia: [], calificaciones: [], bitacora: [], remisiones: [],
    notificaciones: [], motivoRemision: null, remitidoPor: null,
    fechaRemision: null, alertaAutomatica: false, motivoAlerta: null
  });
  saveEstudiantes(lista);
  document.getElementById('modal-add-student-overlay').style.display = 'none';
  document.getElementById('add-nombre').value = '';
  document.getElementById('add-programa').value = '';
  showToast(nombre + ' agregado como estudiante', 'success');
  renderDocente();
});

// --- NOTIFICATIONS ---
document.querySelectorAll('.notif-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    const panel = document.getElementById('notif-panel');
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    if (panel.style.display === 'flex') renderNotificaciones();
  });
});
document.getElementById('btn-mark-read').addEventListener('click', function() {
  marcarNotificacionesLeidas();
  renderNotificaciones();
});

function renderNotificaciones() {
  const list = document.getElementById('notif-list');
  const notifs = getNotificaciones();
  list.innerHTML = '';
  if (!notifs.length) {
    list.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--color-on-surface-variant);font-size:var(--text-sm)">Sin notificaciones.</div>';
    return;
  }
  notifs.forEach(n => {
    const div = document.createElement('div');
    div.className = 'notif-item' + (n.leida ? '' : ' unread');
    const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
    const colors = { success: 'var(--color-tertiary)', error: 'var(--color-error)', warning: 'var(--color-warn)', info: 'var(--color-primary)' };
    div.innerHTML =
      '<span class="material-symbols-outlined" style="color:' + (colors[n.tipo] || colors.info) + '">' + (icons[n.tipo] || 'info') + '</span>' +
      '<div style="flex:1"><div class="notif-text">' + n.mensaje + '</div><div class="notif-time">' + n.fecha + '</div></div>';
    if (n.linkView) {
      div.style.cursor = 'pointer';
      div.addEventListener('click', function() {
        document.getElementById('notif-panel').style.display = 'none';
        n.leida = true;
        localStorage.setItem('seguibecas_notificaciones', JSON.stringify(notificacionesSistema));
        actualizarBadgesNotif();
        showView(n.linkView);
      });
    }
    list.appendChild(div);
  });
}

// --- STAT CARDS CLICKABLE ---
document.getElementById('stat-alertas-card').addEventListener('click', function() {
  docenteSortFilter = docenteSortFilter === 'alertas' ? null : 'alertas';
  renderDocente();
});
document.getElementById('stat-asistencia-card').addEventListener('click', function() {
  docenteSortFilter = docenteSortFilter === 'asistencia' ? null : 'asistencia';
  renderDocente();
});
document.getElementById('stat-total-card').addEventListener('click', function() {
  docenteSortFilter = null;
  renderDocente();
});

// --- SIDEBAR NAV ---
document.querySelectorAll('#sidebar-docente .sidebar-nav a').forEach(a => {
  a.addEventListener('click', function(e) {
    e.preventDefault();
    const section = this.dataset.section;
    if (section) activarSeccionDocente(section);
  });
});
document.querySelectorAll('#sidebar-psicologo .sidebar-nav a').forEach(a => {
  a.addEventListener('click', function(e) {
    e.preventDefault();
    const section = this.dataset.section;
    if (section) activarSeccionPsicologo(section);
  });
});

// --- EVENTS ---
document.getElementById('btn-guardar-obs').addEventListener('click', function() {
  if (!selectedPsychId) { showToast('Selecciona un caso primero', 'warning'); return; }
  const textarea = document.getElementById('obs-textarea');
  const error = document.getElementById('obs-error');
  const nota = textarea.value.trim();
  if (!nota) { error.textContent = 'Escribe una observación antes de guardar.'; error.style.display = 'block'; return; }
  error.style.display = 'none';
  addBitacora(selectedPsychId, nota, 'observacion');
  textarea.value = '';
  showToast('Observación guardada', 'success');
  actualizarBitacora(selectedPsychId);
});
document.getElementById('obs-textarea').addEventListener('input', function() {
  document.getElementById('obs-error').style.display = 'none';
});
document.getElementById('search-docente').addEventListener('input', function() {
  renderDocente(this.value);
});
document.getElementById('search-psicologo').addEventListener('input', function() {
  const term = this.value.toLowerCase().trim();
  document.querySelectorAll('.alert-card').forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(term) ? 'block' : 'none';
  });
  document.querySelectorAll('.psic-dashboard-card').forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(term) ? 'block' : 'none';
  });
});
document.getElementById('btn-refresh-psic').addEventListener('click', function() {
  renderPsicDashboard();
});

function getSaludo() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

// --- USER DROPDOWN ---
document.querySelectorAll('.user-menu').forEach(function(menu) {
  menu.addEventListener('click', function(e) {
    e.stopPropagation();
    const dropdown = this.querySelector('.user-dropdown');
    if (!dropdown) return;
    const isOpen = dropdown.classList.contains('open');
    document.querySelectorAll('.user-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
    if (!isOpen) dropdown.classList.add('open');
  });
});
document.addEventListener('click', function() {
  document.querySelectorAll('.user-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
});
document.getElementById('dropdown-cerrar-docente').addEventListener('click', function(e) {
  e.stopPropagation();
  cerrarSesion();
});
document.getElementById('dropdown-cerrar-psicologo').addEventListener('click', function(e) {
  e.stopPropagation();
  cerrarSesion();
});
document.querySelectorAll('[data-view]').forEach(el => {
  el.addEventListener('click', function(e) {
    e.preventDefault();
    showView(this.dataset.view);
  });
});
document.getElementById('btn-home-docente').addEventListener('click', function(e) {
  e.preventDefault();
  showView('view-home');
});
document.getElementById('btn-home-psicologo').addEventListener('click', function(e) {
  e.preventDefault();
  showView('view-home');
});
document.getElementById('sidebar-toggle').addEventListener('click', function() {
  const activeView = document.querySelector('.view.active');
  if (!activeView) return;
  const sidebar = activeView.querySelector('.sidebar');
  if (sidebar) { sidebar.classList.toggle('open'); document.getElementById('sidebar-overlay').classList.toggle('open'); }
});
document.getElementById('sidebar-overlay').addEventListener('click', function() {
  document.querySelectorAll('.sidebar').forEach(s => s.classList.remove('open'));
  this.classList.remove('open');
});
document.addEventListener('click', function(e) {
  const panel = document.getElementById('notif-panel');
  if (panel.style.display === 'flex' && !e.target.closest('.notif-btn') && !e.target.closest('#notif-panel')) {
    panel.style.display = 'none';
  }
  if (e.target.closest('.grade-submit, .grade-input')) return;
  document.querySelectorAll('.inline-error').forEach(err => err.remove());
});

// --- UMBRALES ---
document.getElementById('btn-guardar-umbrales').addEventListener('click', function() {
  const u = {
    asistenciaMin: parseInt(document.getElementById('umbral-asistencia').value) || 60,
    notaMin: parseFloat(document.getElementById('umbral-notas').value) || 3.0,
    faltasConsecutivas: parseInt(document.getElementById('umbral-faltas').value) || 3
  };
  saveUmbrales(u);
  showToast('Configuración guardada', 'success');
});

function cargarUmbrales() {
  const u = getUmbrales();
  document.getElementById('umbral-asistencia').value = u.asistenciaMin;
  document.getElementById('umbral-notas').value = u.notaMin;
  document.getElementById('umbral-faltas').value = u.faltasConsecutivas;
}

// --- REGISTRO MODAL ---
document.getElementById('btn-registro-open').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('modal-registro-overlay').style.display = 'flex';
});
document.getElementById('modal-registro-close').addEventListener('click', function() {
  document.getElementById('modal-registro-overlay').style.display = 'none';
});
document.getElementById('modal-registro-overlay').addEventListener('click', function(e) {
  if (e.target === this) this.style.display = 'none';
});
document.querySelectorAll('.rol-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.rol-btn').forEach(function(b) { b.style.borderColor = 'var(--color-outline-variant)'; b.style.background = 'var(--color-surface-container-low)'; });
    this.style.borderColor = 'var(--color-primary)';
    this.style.background = 'var(--color-surface-container-high)';
    document.getElementById('reg-rol').value = this.dataset.rol;
    const rolLabel = this.dataset.rol === 'docente' ? 'Docente' : 'Psicólogo/a';
    document.getElementById('reg-rol-selected').textContent = 'Rol seleccionado: ' + rolLabel;
    document.getElementById('reg-rol-selected').style.display = 'block';
    document.getElementById('btn-registrar').disabled = false;
  });
});
document.getElementById('btn-registrar').addEventListener('click', function() {
  const nombre = document.getElementById('reg-nombre').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const rol = document.getElementById('reg-rol').value;
  if (!nombre || !email || !rol) { showToast('Complete todos los campos.', 'warning'); return; }
  if (!email.includes('@')) { showToast('Correo inválido.', 'error'); return; }
  if (registrarUsuario(nombre, email, rol)) {
    document.getElementById('modal-registro-overlay').style.display = 'none';
    document.getElementById('reg-nombre').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-rol').value = '';
    document.getElementById('reg-rol-selected').style.display = 'none';
    document.getElementById('btn-registrar').disabled = true;
    document.querySelectorAll('.rol-btn').forEach(function(b) { b.style.borderColor = 'var(--color-outline-variant)'; b.style.background = 'var(--color-surface-container-low)'; });
  }
});
// --- CERRAR SESIÓN ---
document.getElementById('home-btn-cerrar-sesion').addEventListener('click', function() {
  cerrarSesion();
});
// --- EXPORT ---
document.getElementById('btn-export-docente').addEventListener('click', function() {
  exportarDatosJSON();
});
document.getElementById('btn-export-psicologo').addEventListener('click', function() {
  exportarDatosJSON();
});
// --- IMPORT ---
document.querySelectorAll('#btn-import-open').forEach(function(el) {
  el.addEventListener('click', function() {
    document.getElementById('modal-import-overlay').style.display = 'flex';
  });
});
document.getElementById('modal-import-close').addEventListener('click', function() {
  cerrarModalImport();
});
document.getElementById('modal-import-overlay').addEventListener('click', function(e) {
  if (e.target === this) cerrarModalImport();
});
document.getElementById('import-file-input').addEventListener('change', function() {
  document.getElementById('btn-import-confirm').disabled = !this.files || !this.files.length;
});
document.getElementById('btn-import-confirm').addEventListener('click', function() {
  const input = document.getElementById('import-file-input');
  if (input.files && input.files.length) importarDatosJSON(input.files[0]);
});

cargarSesion();
getNotificaciones();
cargarUmbrales();
if (sesionActual) {
  showView(sesionActual.rol === 'docente' ? 'view-docente' : 'view-psicologo');
} else {
  showView('view-home');
}
