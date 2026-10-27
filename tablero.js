// =====================================================================
// Tablero de inicio configurable por usuario.
// El Administrador elige en Usuarios qué tarjetas ve cada persona (app_metadata.tablero).
// Cada tarjeta solo se muestra si el usuario tiene acceso a la pantalla de ese módulo.
// =====================================================================

const TB_CONDICIONES_EN_TRAMITE = ["S/ASIGNAR", "EN ESTUDIO", "OBSERVADO", "NOTIFICADO", "PROYECTO DISPO", "PROYECTO EN DISPO", "PROCESO SUMARIAL", "PASE A JURIDICO"];
const TB_ETIQUETA_CONDICION = { "S/ASIGNAR": "Sin asignar", "EN ESTUDIO": "En estudio", "OBSERVADO": "Observado", "NOTIFICADO": "Notificado", "PROYECTO DISPO": "Proyecto de disposición", "PROYECTO EN DISPO": "Proyecto de disposición", "PROCESO SUMARIAL": "Proceso sumarial", "PASE A JURIDICO": "Pase a Jurídico" };
const TB_AU_ESTADOS = ["Orden cargada", "1º visita realizada", "Esperando documentación", "Documentación recibida", "2º visita", "Informe en borrador", "Informe emitido"];

const TB_ANIO = String(new Date().getFullYear());

const TABLERO_TARJETAS = [
  { id: "pma-estado", modulo: "Presentaciones", tema: "pma", titulo: "PMA", detalle: `Ingresados en ${TB_ANIO}, por condición`, vista: "pma" },
  { id: "cartillas-estado", modulo: "Presentaciones", tema: "cartilla", titulo: "Cartillas", detalle: `Ingresadas en ${TB_ANIO}, por condición`, vista: "cartillas" },
  { id: "up", modulo: "Urgencias Prestacionales", titulo: "Urgencias Prestacionales", detalle: "Abiertos, vencidos y tiempo de resolución", vista: "up-reportes", alt: ["up-expedientes"] },
  { id: "px", modulo: "Preexistencias", titulo: "Preexistencias", detalle: "Abiertas y cerradas", vista: "px-preexistencias" },
  { id: "au", modulo: "Auditorías", tema: "auditorias", titulo: `Auditorías ${TB_ANIO}`, detalle: `Del año ${TB_ANIO}: abiertas y cerradas`, vista: "au-auditorias" },
  { id: "oficios", modulo: "Prestaciones", tema: "oficios", titulo: "Oficios", detalle: `Ingresados en ${TB_ANIO}, por estado`, vista: "ju-oficios" },
  { id: "reclamos", modulo: "Prestaciones", tema: "reclamos", titulo: "Reclamos", detalle: `Ingresados en ${TB_ANIO}, por estado`, vista: "ju-reclamos" }
];

// Tarjetas que cambiaron de nombre: se traducen para no perder lo ya configurado.
const TB_IDS_ANTERIORES = { ju: ["oficios", "reclamos"] };
function tbNormalizarIds(ids) {
  return [...new Set((ids || []).flatMap(id => TB_IDS_ANTERIORES[id] || [id]))];
}

// Pantalla de la que depende la tarjeta (la primera a la que tenga acceso).
function tbVistaTarjeta(t, puede) {
  return [t.vista, ...(t.alt || [])].find(v => puede(v)) || "";
}

// Tarjetas que puede tener un usuario según sus accesos (para Usuarios y para la sesión).
function tbTarjetasDisponibles(perfil, accesos) {
  const puede = v => nivelAccesoPerfil(perfil, accesos, v) !== "";
  return TABLERO_TARJETAS.filter(t => tbVistaTarjeta(t, puede));
}

function tableroConfiguradoSesion() {
  if (!authSession?.access_token) return [];
  const payload = decodeJwtPayload(authSession.access_token);
  const appMetadata = authSession?.user?.app_metadata || payload.app_metadata || {};
  return Array.isArray(appMetadata.tablero) ? appMetadata.tablero : [];
}

function tableroTarjetasSesion() {
  const elegidas = new Set(tbNormalizarIds(tableroConfiguradoSesion()));
  if (!elegidas.size) return [];
  return tbTarjetasDisponibles(perfilSesionActual(), accesosSesionActual()).filter(t => elegidas.has(t.id));
}

// ---------- Datos ----------

async function tbTraerTodo(tabla, select, extra = {}) {
  const todo = [];
  // Algunas tablas (Auditorías, Reclamos) solo se leen con la sesión del usuario.
  const session = await asegurarSesionVigente().catch(() => null);
  const headers = session?.access_token ? { ...authHeaders(session.access_token), Accept: "application/json" } : { Accept: "application/json" };
  for (let offset = 0; ; offset += 1000) {
    const r = await fetchConTimeout(buildTableUrl(tabla, { select, limit: "1000", offset: String(offset), ...extra }), { method: "GET", headers, cache: "no-store" }, 15000);
    if (!r.ok) throw new Error((await leerErrorApi(r)) || `Supabase respondió ${r.status}.`);
    const pagina = await r.json();
    todo.push(...pagina);
    if (pagina.length < 1000) break;
  }
  return todo;
}

function tbHoyIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function tbSumarDias(iso, n) {
  const d = new Date(`${iso}T00:00:00`); d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function tbContar(lista, campo) {
  const m = new Map();
  lista.forEach(x => { const k = x[campo] || ""; m.set(k, (m.get(k) || 0) + 1); });
  return m;
}

const tbCache = {};
function tbDatos(clave, fn) {
  if (!tbCache[clave]) tbCache[clave] = fn().catch(e => { delete tbCache[clave]; throw e; });
  return tbCache[clave];
}

// ---------- Render de cada tarjeta ----------

function tbFila(etiqueta, valor, accion, clase = "") {
  return `<button type="button" class="tb-fila ${clase}" ${accion ? `data-tb-accion='${escaparHtml(JSON.stringify(accion))}'` : "disabled"}>
    <span class="tb-fila-etq">${escaparHtml(etiqueta)}</span><span class="tb-fila-num">${valor}</span></button>`;
}

function tbVacio(texto) {
  return `<p class="tb-vacio">${escaparHtml(texto)}</p>`;
}

const TB_RENDER = {
  async "pma-estado"() { return tbRenderCondiciones("pma"); },
  async "cartillas-estado"() { return tbRenderCondiciones("cartillas"); },

  async up() {
    const filas = await tbDatos("up", () => tbTraerTodo("expedientes", "estado,fecha_ingreso,fecha_cierre,fecha_limite"));
    const hoy = tbHoyIso();
    const abiertos = filas.filter(f => f.estado !== "Cerrado");
    const vencidos = abiertos.filter(f => f.fecha_limite && f.fecha_limite < hoy);
    const cerradosConFecha = filas.filter(f => f.estado === "Cerrado" && f.fecha_cierre && f.fecha_ingreso);
    const dias = cerradosConFecha.map(f => upDiasEntre(f.fecha_ingreso, f.fecha_cierre));
    const prom = dias.length ? (dias.reduce((s, d) => s + d, 0) / dias.length).toFixed(1).replace(".", ",") : "—";
    const fuera = cerradosConFecha.filter(f => f.fecha_limite && f.fecha_cierre > f.fecha_limite).length;
    return `<div class="tb-destacado"><b>${prom}</b><span>días promedio de resolución</span></div>` +
      tbFila("Abiertos", abiertos.length, { ir: "up-tiempos", grupo: "abierto" }) +
      tbFila("Abiertos con la fecha límite vencida", vencidos.length, { ir: "up-tiempos", grupo: "abierto", plazo: "posterior" }, vencidos.length ? "alerta" : "") +
      tbFila("Cerrados", filas.length - abiertos.length, { ir: "up-tiempos", grupo: "cerrado" }) +
      tbFila("Cerrados después de la fecha límite", fuera, { ir: "up-tiempos", grupo: "cerrado", plazo: "posterior" });
  },

  async px() {
    const filas = await tbDatos("px", () => tbTraerTodo("preexistencias", "estado"));
    const abiertas = filas.filter(f => f.estado !== "Cerrado").length;
    return tbFila("Abiertas", abiertas, { ir: "px-preexistencias" }, abiertas ? "" : "") +
      tbFila("Cerradas", filas.length - abiertas, { ir: "px-preexistencias" }) +
      tbFila("Total", filas.length, { ir: "px-preexistencias" });
  },

  async au() {
    const todas = await tbDatos("au", () => tbTraerTodo("auditorias", "estado,fecha_visita_1,created_at"));
    // Año de la auditoría: el de la 1º visita; si todavía no tiene, el de la carga.
    const filas = todas.filter(a => String(a.fecha_visita_1 || a.created_at || "").startsWith(TB_ANIO));
    if (!filas.length) return tbVacio(`No hay auditorías de ${TB_ANIO}.`);
    const cerradas = filas.filter(a => a.estado === "Cerrada").length;
    return `<div class="tb-destacado"><b>${filas.length}</b><span>auditoría${filas.length === 1 ? "" : "s"} de ${TB_ANIO}</span></div>` +
      tbFila("Abiertas", filas.length - cerradas, { ir: "au-auditorias", auTab: "activas" }) +
      tbFila("Cerradas", cerradas, { ir: "au-auditorias", auTab: "cerradas" });
  },

  async oficios() {
    const filas = (await tbDatos("ju-of", () => tbTraerTodo("oficio_ingresos", "fecha_ingreso,estado"))).filter(x => String(x.fecha_ingreso || "").startsWith(TB_ANIO));
    return tbRenderPorEstado(filas, "estado", ["En trámite", "Finalizado"], "ju-oficios", `ingresados en ${TB_ANIO}`);
  },

  async reclamos() {
    const filas = (await tbDatos("ju-rec", () => tbTraerTodo("reclamo_ingresos", "fecha_ingreso,estado"))).filter(x => String(x.fecha_ingreso || "").startsWith(TB_ANIO));
    return tbRenderPorEstado(filas, "estado", ["Asignado", "Devuelto", "Finalizado"], "ju-reclamos", `ingresados en ${TB_ANIO}`);
  }
};

const TB_ORDEN_CONDICIONES = ["S/ASIGNAR", "EN ESTUDIO", "OBSERVADO", "NOTIFICADO", "PROYECTO DISPO", "PROYECTO EN DISPO", "PROCESO SUMARIAL", "PASE A JURIDICO", "APROBADO", "ARCHIVO"];

// Total del año y detalle por estado/condición, en el orden dado (los que no figuran van al final).
function tbRenderPorEstado(filas, campo, orden, vista, leyenda, etiquetas = {}, conFiltro = false) {
  if (!filas.length) return tbVacio(`No hay registros ${leyenda}.`);
  const conteo = tbContar(filas, campo);
  const claves = [...orden.filter(c => conteo.get(c)), ...[...conteo.keys()].filter(c => !orden.includes(c)).sort()];
  return `<div class="tb-destacado"><b>${filas.length}</b><span>${escaparHtml(leyenda)}</span></div>` +
    claves.map(c => tbFila(etiquetas[c] || c || "Sin dato", conteo.get(c), conFiltro && c ? { ir: vista, condicion: c } : { ir: vista }, c === "S/ASIGNAR" ? "alerta" : "")).join("");
}

async function tbRenderCondiciones(tabla) {
  const filas = (await tbDatos(tabla, () => tbTraerTodo(tabla, "condicion,fecha_ingreso"))).filter(x => String(x.fecha_ingreso || "").startsWith(TB_ANIO));
  const etiquetas = { ...TB_ETIQUETA_CONDICION, APROBADO: "Aprobado", ARCHIVO: "Archivo" };
  return tbRenderPorEstado(filas, "condicion", TB_ORDEN_CONDICIONES, tabla, `${tabla === "pma" ? "ingresados" : "ingresadas"} en ${TB_ANIO}`, etiquetas, true);
}

// ---------- Pantalla ----------

async function renderTablero() {
  const cont = document.getElementById("tablero-grid");
  if (!cont) return;
  Object.keys(tbCache).forEach(k => delete tbCache[k]);
  const tarjetas = tableroTarjetasSesion();
  const nombre = getSessionIdentity(authSession).nombre;
  const saludo = document.getElementById("tablero-saludo");
  if (saludo) saludo.textContent = nombre && nombre !== "Usuario autorizado" ? `Hola, ${nombre.split(" ")[0]}` : "Mi tablero";
  const fecha = document.getElementById("tablero-fecha");
  if (fecha) fecha.textContent = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  if (!tarjetas.length) {
    cont.innerHTML = tbVacio("Todavía no tenés tarjetas en el tablero. Pedile al Administrador que te las configure desde Usuarios.");
    return;
  }
  cont.innerHTML = tarjetas.map(t => `<article class="tb-card${t.tema ? ` tb-tema-${t.tema}` : ""}" data-tb-card="${t.id}">
    <header><span class="tb-modulo">${escaparHtml(t.modulo)}</span><h3>${escaparHtml(t.titulo)}</h3></header>
    <div class="tb-cuerpo"><p class="tb-cargando">Cargando...</p></div></article>`).join("");
  await Promise.all(tarjetas.map(async t => {
    const cuerpo = cont.querySelector(`[data-tb-card="${t.id}"] .tb-cuerpo`);
    try { cuerpo.innerHTML = await TB_RENDER[t.id](); }
    catch (error) { cuerpo.innerHTML = tbVacio(`No se pudieron cargar los datos. ${error?.message || ""}`); }
    cuerpo.querySelectorAll("[data-tb-accion]").forEach(b => b.addEventListener("click", () => tbIr(JSON.parse(b.dataset.tbAccion))));
  }));
}

// Espera a que aparezca una opción en un select (las listas se cargan de forma asíncrona).
function tbEsperar(cond, ms = 15000) {
  return new Promise(resolve => {
    const inicio = Date.now();
    const paso = () => { if (cond()) return resolve(true); if (Date.now() - inicio > ms) return resolve(false); setTimeout(paso, 150); };
    paso();
  });
}

async function tbIr(a) {
  if (a.ir === "up-tiempos") {
    showView("up-reportes");
    upReporteModo = "tiempos"; upReporteDrill = null;
    upTiemposSel = { grupo: a.grupo || null, plazo: a.plazo || null };
    ["up-reporte-tab-os", "up-reporte-tab-patologia", "up-reporte-tab-tiempos"].forEach(t => document.getElementById(t)?.classList.toggle("active", t === "up-reporte-tab-tiempos"));
    const d = document.getElementById("up-tiempos-desde"), h = document.getElementById("up-tiempos-hasta");
    if (d) d.value = ""; if (h) h.value = "";
    await tbEsperar(() => upReportesCargado);
    renderUpReportes();
    return;
  }
  showView(a.ir);
  if (a.auTab && typeof auCambiarTab === "function") { auCambiarTab(a.auTab); return; }
  if (a.condicion) {
    const idSel = a.ir === "pma" ? "pma-condicion-filter" : "cartilla-condicion-filter";
    const sel = document.getElementById(idSel);
    const ok = await tbEsperar(() => [...(sel?.options || [])].some(o => o.value === a.condicion));
    if (ok) { sel.value = a.condicion; sel.dispatchEvent(new Event("change")); }
  }
  if (a.buscar) {
    const input = document.getElementById("expediente-search");
    if (input) { await tbEsperar(() => typeof expedientes !== "undefined" && expedientes.length > 0, 8000); input.value = a.buscar; input.dispatchEvent(new Event("input")); }
  }
}

// ---------- Configuración en Usuarios ----------

let usTablero = [];

function usRenderTablero() {
  usTablero = tbNormalizarIds(usTablero);
  const bloque = document.getElementById("us-tablero-bloque");
  const cont = document.getElementById("us-tablero");
  if (!bloque || !cont) return;
  const perfil = document.getElementById("us-perfil").value;
  const tipo = tipoPerfil(perfil);
  bloque.hidden = !perfil || tipo === "obra social";
  if (bloque.hidden) return;
  const accesos = tipo === "interno" ? usAccesosLimpios() : null;
  const disponibles = new Set(tbTarjetasDisponibles(perfil, accesos).map(t => t.id));
  const modulos = [...new Set(TABLERO_TARJETAS.map(t => t.modulo))];
  cont.innerHTML = modulos.map(m => `<div class="us-tb-modulo"><span class="us-tb-modulo-nombre">${escaparHtml(m)}</span>
    ${TABLERO_TARJETAS.filter(t => t.modulo === m).map(t => {
      const ok = disponibles.has(t.id);
      return `<label class="us-tb-item ${ok ? "" : "deshabilitado"}" title="${ok ? escaparHtml(t.detalle) : `Sin acceso a ${escaparHtml(m)}: habilitalo arriba, en Accesos a módulos`}">
        <input type="checkbox" data-us-tb="${t.id}" ${ok && usTablero.includes(t.id) ? "checked" : ""} ${ok ? "" : "disabled"}>
        <span><strong>${escaparHtml(t.titulo)}</strong><small>${ok ? escaparHtml(t.detalle) : "Sin acceso a este módulo"}</small></span></label>`;
    }).join("")}</div>`).join("");
  cont.querySelectorAll("[data-us-tb]").forEach(chk => chk.addEventListener("change", () => {
    const id = chk.dataset.usTb;
    usTablero = chk.checked ? [...new Set([...usTablero, id])] : usTablero.filter(x => x !== id);
  }));
}

function usTableroLimpio() {
  const perfil = document.getElementById("us-perfil").value;
  const accesos = tipoPerfil(perfil) === "interno" ? usAccesosLimpios() : null;
  const disponibles = new Set(tbTarjetasDisponibles(perfil, accesos).map(t => t.id));
  return usTablero.filter(id => disponibles.has(id));
}

function usTableroTodas(marcar) {
  const perfil = document.getElementById("us-perfil").value;
  const accesos = tipoPerfil(perfil) === "interno" ? usAccesosLimpios() : null;
  usTablero = marcar ? tbTarjetasDisponibles(perfil, accesos).map(t => t.id) : [];
  usRenderTablero();
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => document.getElementById("tablero-actualizar")?.addEventListener("click", renderTablero));
  if (document.readyState !== "loading") document.getElementById("tablero-actualizar")?.addEventListener("click", renderTablero);
}
