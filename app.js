const SUPABASE_URL = "https://kvevhmqxfjorwgydgaqd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_PmqcH16HogW-iFZMqmX3cQ_PbKyQxKc";
const SESSION_KEY = "gcp-auth-session-v1";

const views = {
  inicio: { title: "", subtitle: "" },
  "obras-sociales": { title: "Agentes de Seguro", subtitle: "Maestro único de RNAS y denominaciones" },
  prestadores: { title: "Prestadores", subtitle: "Red de prestadores de cada Obra Social (Anexo III de Cartilla)" },
  cobertura: { title: "Cobertura", subtitle: "Especialidades básicas obligatorias cubiertas por provincia con afiliados" },
  afiliados: { title: "Afiliados", subtitle: "Total y distribución geográfica de afiliados por Obra Social" },
  pma: { title: "PMA", subtitle: "Seguimiento de presentaciones" },
  cartillas: { title: "Cartillas", subtitle: "Presentaciones y cumplimiento del plazo de 90 días" },
  reportes: { title: "Reportes", subtitle: "Consultas e indicadores de gestión" },
  criticidad: { title: "Criticidad", subtitle: "Cumplimiento trimestral de PMA/Cartillas por Obra Social" },
  "notificaciones-reporte": { title: "Notificaciones", subtitle: "Obras Sociales que no respondieron a la notificación de Cartilla" },
  "metas-fisicas": { title: "Metas Físicas", subtitle: "Cantidad de trámites de PMA y Cartillas por trimestre calendario" },
  "up-patologias": { title: "Patologías", subtitle: "Catálogo de patologías para Urgencias Prestacionales" },
  "up-drogas": { title: "Catálogo de drogas", subtitle: "Drogas, marcas comerciales y fundamentación por patología" },
  "up-plantillas": { title: "Plantillas de informe", subtitle: "Textos de apertura y cierre técnico" },
  "up-expedientes": { title: "Expedientes", subtitle: "Urgencias Prestacionales" },
  "up-reportes": { title: "Reportes", subtitle: "Cantidad de expedientes por Obra Social/EMP y patología" },
  "px-preexistencias": { title: "Expedientes", subtitle: "Casos de preexistencia por EMP" },
  "px-emp": { title: "Reportes", subtitle: "Cantidad de preexistencias por EMP y patología" },
  "px-patologias": { title: "Patologías", subtitle: "Catálogo de patologías de Preexistencias" },
  "px-plantillas": { title: "Plantillas", subtitle: "Párrafo legal de apertura del informe INFFC" }
};

const manualesSeccion = {
  "obras-sociales": `<strong>Qué hacer en Agentes de Seguro</strong><ul><li>Buscá por RNAS, denominación o sigla.</li><li>Usá los filtros de estado e Inicio ejercicio.</li><li>Hacé clic en una fila para consultar o modificar los datos del agente.</li><li>El Inicio ejercicio se utiliza para determinar los períodos de control de las presentaciones.</li></ul>`,
  pma: `<strong>Qué hacer en PMA</strong><ul><li>Usá el buscador o seleccioná uno o varios ejercicios.</li><li>Podés filtrar además por Condición, Fecha de ingreso y Fecha límite.</li><li>Hacé clic en una presentación para verla o editarla.</li><li>“Nueva presentación” registra un nuevo trámite. “Exportar Excel” descarga todos los campos de los registros filtrados.</li></ul>`,
  cartillas: `<strong>Qué hacer en Cartillas</strong><ul><li>Usá el buscador o seleccioná uno o varios ejercicios.</li><li>El filtro Plazo permite ver presentaciones en término o fuera de término y también podés buscar por Fecha de ingreso y Fecha límite.</li><li>El plazo se calcula tomando como límite 90 días antes del Inicio ejercicio.</li><li>Hacé clic en una presentación para verla o editarla. El Excel incluye todos los campos.</li></ul>`,
  reportes: `<strong>Qué hacer en Reportes</strong><ul><li>Elegí el reporte de Cartillas o PMA. También podés identificar los Agentes que nunca presentaron.</li><li>Seleccioná uno o varios ejercicios, por ejemplo 2026 y 2025/26.</li><li>✓ indica que presentó y ✕ que no presentó en ese ejercicio.</li><li>Hacé clic sobre un Agente de Seguro para abrir su historial completo en los reportes de Presentaciones. En “Nunca presentaron” no hay historial porque no existen presentaciones cargadas. Podés ordenar por RNAS y exportar a Excel.</li></ul>`,
  "up-patologias": `<strong>Qué hacer en Patologías</strong><ul><li>Buscá por nombre.</li><li>Hacé clic en una fila para editarla o eliminarla.</li></ul>`,
  "up-drogas": `<strong>Qué hacer en Catálogo de drogas</strong><ul><li>Cada droga puede tener varias marcas comerciales y, si no es de soporte, una fundamentación distinta por cada patología a la que se asocia.</li><li>Las drogas de soporte (por ejemplo antieméticos) usan una única fundamentación general, sin asociar a patologías puntuales.</li><li>Hacé clic en una fila para editarla o eliminarla.</li></ul>`,
  "up-plantillas": `<strong>Qué hacer en Plantillas</strong><ul><li>El texto de apertura y el de cierre técnico se usan al generar los informes IFSOL/IFDER de un expediente.</li><li>Hacé clic en una fila para editarla o eliminarla.</li></ul>`,
  "up-expedientes": `<strong>Qué hacer en Expedientes</strong><ul><li>Buscá por Nº EE, paciente o DNI.</li><li>El formulario tiene varias secciones plegables; hacé clic en el título de cada una para abrirla.</li><li>Escribí en el campo de Obra Social/EMP para buscarla y elegí una opción de la lista que aparece.</li><li>Hacé clic en una fila para editar ese expediente.</li></ul>`,
  "up-reportes": `<strong>Qué hacer en Reportes</strong><ul><li>Muestra cuántos expedientes se cargaron, agrupados por Obra Social/EMP y por patología.</li><li>Buscá por nombre de Obra Social/EMP o de patología.</li></ul>`,
  "px-patologias": `<strong>Qué hacer en Patologías de Preexistencias</strong><ul><li>El carácter y el texto médico/legal se cargan una sola vez acá y salen automáticos en cada informe INFFC de esa patología.</li><li>Hacé clic en una fila para editarla o eliminarla.</li></ul>`,
  "px-plantillas": `<strong>Qué hacer en Plantillas de Preexistencias</strong><ul><li>El párrafo legal (Ley 26.682) que abre cada informe INFFC se elige acá.</li><li>Hacé clic en una fila para editarla o eliminarla.</li></ul>`,
  "px-preexistencias": `<strong>Qué hacer en Preexistencias</strong><ul><li>Siempre se asocia a una EMP (nunca a una Obra Social).</li><li>La declaración jurada, el esquema propuesto y las prestaciones a desestimar los completa el auditor para cada caso.</li><li>El informe INFFC junta esto con el texto fijo de la patología elegida.</li><li>Hacé clic en una fila para editar esa preexistencia.</li></ul>`,
  "px-emp": `<strong>Qué hacer en Reportes</strong><ul><li>Dos pestañas: por EMP o por Patología. Hacé clic en una fila para ver el detalle discriminado.</li><li>Gráfico de barras arriba, y botones para exportar a Excel o PDF.</li></ul>`
};

let obrasSociales = [];
let rnosSortDirection = "asc";
let reportCartillasRnasSortDirection = "asc";
let reportPmaRnasSortDirection = "asc";
let pmaSortField = "rnas";
let pmaSortDirection = "asc";
let cartillaSortField = "rnas";
let cartillaSortDirection = "asc";
let authSession = null;
let accionPendienteTrasLogin = null;
let passwordRecoveryPending = false;
let cartillas = [];
let cartillasCargadas = false;
let cartillasCompleta = false; // true solo cuando `cartillas` tiene TODO el histórico (no solo el período vigente)
let reporteCartillasCargado = false;
let reporteActivo = "cartillas";
let pma = [];
let pmaCargadas = false;
let pmaCompleta = false; // true solo cuando `pma` tiene TODO el histórico (no solo el período vigente)
let reportePmaCargado = false;
const PAGE_SIZE = 30;
let pmaPage = 1;
let cartillaPage = 1;
let reportCartillasPage = 1;
let reportPmaPage = 1;
let patologias = [];
let patologiasCargadas = false;
let drogas = [];
let drogasCargadas = false;
let modalMarcas = [];
let modalMarcasOriginales = [];
let modalFundamentaciones = [];
let modalFundamentacionesOriginales = [];
let modalPatologiaExpandida = new Set();
let plantillas = [];
let plantillasCargadas = false;
let pxPatologias = [];
let pxPatologiasCargadas = false;
let pxPlantillas = [];
let pxPlantillasCargadas = false;
let expedientes = [];
let expedienteVistaEstado = "activos";
let expedientesCargadas = false;
let obrasSocialesTodas = [];
let obrasSocialesTodasCargadas = false;
let obrasSocialesTodasPorEtiqueta = new Map();
let modalDrogasExpediente = [];
let modalDrogasExpedienteOriginales = [];


function paginarRegistros(registros, pagina = 1, pageSize = PAGE_SIZE) {
  const rows = Array.isArray(registros) ? registros : [];
  const size = Math.max(1, Number(pageSize) || PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(rows.length / size));
  const page = Math.min(Math.max(1, Number(pagina) || 1), totalPages);
  const start = (page - 1) * size;
  return { items: rows.slice(start, start + size), page, totalPages, total: rows.length };
}

function renderPaginacion(containerId, pageInfo, onPageChange) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!pageInfo || pageInfo.totalPages <= 1) { el.innerHTML = ""; return; }
  const opciones = Array.from({ length: pageInfo.totalPages }, (_, i) => i + 1)
    .map(page => `<option value="${page}" ${page === pageInfo.page ? "selected" : ""}>${page}</option>`)
    .join("");
  el.innerHTML = `<button type="button" data-page-action="prev" ${pageInfo.page <= 1 ? "disabled" : ""}>‹ Anterior</button>
    <label class="page-jump">Página <select data-page-select aria-label="Ir a página">${opciones}</select> de ${pageInfo.totalPages}</label>
    <button type="button" data-page-action="next" ${pageInfo.page >= pageInfo.totalPages ? "disabled" : ""}>Siguiente ›</button>`;
  el.querySelector('[data-page-action="prev"]')?.addEventListener("click", () => onPageChange(pageInfo.page - 1));
  el.querySelector('[data-page-action="next"]')?.addEventListener("click", () => onPageChange(pageInfo.page + 1));
  el.querySelector('[data-page-select]')?.addEventListener("change", event => onPageChange(Number(event.target.value)));
}

function simboloCumplimientoPresentacion(estado) {
  if (estado === "EN_TERMINO") return "✓";
  if (estado === "FUERA_DE_TERMINO") return "✕";
  return "—";
}

function claseCumplimientoPresentacion(estado) {
  if (estado === "EN_TERMINO") return "ok";
  if (estado === "FUERA_DE_TERMINO") return "missing";
  return "neutral";
}


function claveOrdenEjercicio(valor) {
  const canonico = ejercicioCanonico(valor) || String(valor || "").trim();
  const m = canonico.match(/^(\d{4})(?:\/(\d{2}))?$/);
  if (!m) return -1;
  return Number(m[1]) * 10 + (m[2] ? 5 : 0);
}

function ordenarEjercicios(valores, desc = true) {
  return [...new Set((valores || []).map(v => ejercicioCanonico(v) || String(v || "").trim()).filter(Boolean))]
    .sort((a,b) => desc ? claveOrdenEjercicio(b) - claveOrdenEjercicio(a) : claveOrdenEjercicio(a) - claveOrdenEjercicio(b));
}

function generarReporteFaltantesPorEjercicio(obras, registrosPresentaciones, ejercicios) {
  const ejerciciosValidos = ordenarEjercicios(ejercicios, false);
  const index = new Set(
    (registrosPresentaciones || [])
      .filter(r => r && r.obra_social_id !== null && r.obra_social_id !== undefined)
      .map(r => `${Number(r.obra_social_id)}|${ejercicioCanonico(r.ejercicio) || String(r.ejercicio || "").trim()}`)
  );
  return (obras || [])
    .filter(os => String(os?.estado || "ACTIVA").toUpperCase() !== "INACTIVA")
    .map(os => {
      const periodos = {};
      for (const ejercicio of ejerciciosValidos) {
        const presento = index.has(`${Number(os.id)}|${ejercicio}`);
        periodos[ejercicio] = { estado: presento ? "PRESENTO" : "NO_PRESENTO", ejercicioEsperado: ejercicio };
      }
      return { id: os.id, rnos: os.rnos || "", denominacion: os.denominacion || "", inicioEjercicio: os.inicio_ejercicio || "", periodos };
    })
    .sort((a,b) => (Number(String(a.rnos).replace(/\D/g,""))||0) - (Number(String(b.rnos).replace(/\D/g,""))||0));
}

const periodosEstadisticasInicio = [
  { key: "2027", ejercicios: ["2026/27", "2027"] },
  { key: "2026", ejercicios: ["2025/26", "2026"] },
  { key: "2025", ejercicios: ["2024/25", "2025"] },
  { key: "2024", ejercicios: ["2023/24", "2024"] }
];

function resumirInicioPorParEjercicios(obras, registros, ejercicios) {
  const activas = (obras || []).filter(os => String(os?.estado || "ACTIVA").toUpperCase() !== "INACTIVA");
  const idsActivos = new Set(activas.map(os => String(os?.id ?? "")).filter(Boolean));
  const esperados = new Set((ejercicios || []).map(e => ejercicioCanonico(e) || String(e || "").trim()).filter(Boolean));
  const conPresentacion = new Set();
  for (const row of registros || []) {
    const id = String(row?.obra_social_id ?? "");
    if (!idsActivos.has(id)) continue;
    const ejercicio = ejercicioCanonico(row?.ejercicio) || String(row?.ejercicio || "").trim();
    if (esperados.has(ejercicio)) conPresentacion.add(id);
  }
  const presentaron = conPresentacion.size;
  const totalActivas = activas.length;
  return { presentaron, noPresentaron: Math.max(0, totalActivas - presentaron), totalActivas, ids: conPresentacion };
}

function pintarResumenInicio(key, tipo, resumen) {
  if (typeof document === "undefined") return;
  const presentaron = document.getElementById(`home-${key}-${tipo}-presentaron`);
  const noPresentaron = document.getElementById(`home-${key}-${tipo}-no-presentaron`);
  if (presentaron) presentaron.textContent = String(resumen?.presentaron ?? "—");
  if (noPresentaron) noPresentaron.textContent = String(resumen?.noPresentaron ?? "—");
}

function resumirAgentesInicioPeriodoVigente(obras, pmaRegistros, cartillasRegistros, ejercicios) {
  const r1 = resumirInicioPorParEjercicios(obras, pmaRegistros, ejercicios);
  const r2 = resumirInicioPorParEjercicios(obras, cartillasRegistros, ejercicios);
  const ids = new Set([...(r1.ids || []), ...(r2.ids || [])]);
  return ids.size;
}

function renderEstadisticasInicio() {
  if (typeof document === "undefined") return;
  const kpiUniverso = document.getElementById("home-kpi-universo");
  const kpiPma = document.getElementById("home-kpi-pma");
  const kpiCartillas = document.getElementById("home-kpi-cartillas");
  const periodoVigente = periodosEstadisticasInicio.find(periodo => periodo.key === "2027") || { ejercicios: ["2026/27", "2027"] };
  const resumenPmaVigente = resumirInicioPorParEjercicios(obrasSociales, pma, periodoVigente.ejercicios);
  const resumenCartillasVigente = resumirInicioPorParEjercicios(obrasSociales, cartillas, periodoVigente.ejercicios);
  if (kpiUniverso) kpiUniverso.textContent = String(resumenPmaVigente.totalActivas || resumenCartillasVigente.totalActivas || 0);
  if (kpiPma) kpiPma.textContent = String(resumenPmaVigente.presentaron || 0);
  if (kpiCartillas) kpiCartillas.textContent = String(resumenCartillasVigente.presentaron || 0);
  for (const periodo of periodosEstadisticasInicio.filter(periodo => periodo.key !== "2027")) {
    pintarResumenInicio(periodo.key, "pma", resumirInicioPorParEjercicios(obrasSociales, pma, periodo.ejercicios));
    pintarResumenInicio(periodo.key, "cartillas", resumirInicioPorParEjercicios(obrasSociales, cartillas, periodo.ejercicios));
  }
}

async function cargarYRenderizarEstadisticasInicio() {
  if (typeof document === "undefined") return;
  const base = document.getElementById("home-stats-base");
  if (base) base.textContent = "Cargando estadísticas...";
  try {
    const tareas = [];
    if (!obrasSociales.length) tareas.push(cargarObrasSocialesDesdeSupabase().then(rows => { obrasSociales = rows; }));
    if (!pmaCompleta) tareas.push(cargarPmaDesdeSupabase().then(rows => { pma = rows; pmaCargadas = true; pmaCompleta = true; llenarFiltrosPma(); }));
    if (!cartillasCompleta) tareas.push(cargarCartillasDesdeSupabase().then(rows => { cartillas = rows; cartillasCargadas = true; cartillasCompleta = true; llenarFiltroEjercicios(); }));
    if (tareas.length) await Promise.all(tareas);
    renderEstadisticasInicio();
  } catch (error) {
    if (base) base.textContent = "No se pudieron cargar las estadísticas";
  }
}

function getInitialView(hash) {
  const id = String(hash || "").replace(/^#/, "");
  return Object.prototype.hasOwnProperty.call(views, id) ? id : "inicio";
}

function normalizarPerfilAcceso(perfil) {
  return normalizar(perfil).replace(/\s+/g, " ");
}

function perfilPuedeVerVista(perfil, vista) {
  const id = Object.prototype.hasOwnProperty.call(views, vista) ? vista : "inicio";
  const p = normalizarPerfilAcceso(perfil);
  const esAdministrador = ["administrador", "admin"].includes(p);

  // Urgencias Prestacionales: exclusivo del perfil "Administrador", ni siquiera "Admin Prestacional" entra.
  if (id.startsWith("up-")) return esAdministrador;

  // Preexistencias: Administrador ve todo; "Admin Preexistencias" ve Preexistencias y EMP, pero no el catálogo de Patologías.
  if (id.startsWith("px-")) {
    if (id === "px-patologias" || id === "px-plantillas") return esAdministrador;
    return esAdministrador || p === "admin preexistencias";
  }

  if (["admin prestacional", "administrador", "admin"].includes(p)) return true;
  if (p === "admin presentaciones") return ["obras-sociales", "prestadores", "cobertura", "afiliados", "pma", "cartillas", "reportes", "criticidad", "notificaciones-reporte", "metas-fisicas"].includes(id);
  if (p === "carga presentaciones") return ["pma", "cartillas", "reportes", "criticidad", "notificaciones-reporte", "metas-fisicas"].includes(id);
  if (p === "administrativo") return ["obras-sociales", "pma", "cartillas", "reportes", "criticidad", "notificaciones-reporte", "metas-fisicas"].includes(id);
  if (p === "cartilla os") return ["prestadores", "afiliados"].includes(id);
  return false;
}

function primeraVistaPermitida(perfil) {
  const p = normalizarPerfilAcceso(perfil);
  if (p === "admin presentaciones") return "obras-sociales";
  if (p === "carga presentaciones") return "pma";
  if (p === "administrativo") return "obras-sociales";
  if (p === "cartilla os") return "prestadores";
  return "inicio";
}

function perfilSesionActual() {
  // OJO: usar el perfil "crudo" de app_metadata, no el de getSessionIdentity(),
  // que ya viene simplificado para mostrar en pantalla (Administrador y Admin
  // Prestacional se muestran ambos como "Admin Prestacional"). Los chequeos de
  // acceso (por ejemplo, Urgencias Prestacionales exclusivo de Administrador)
  // necesitan distinguir el valor real.
  if (!authSession?.access_token) return "";
  const payload = decodeJwtPayload(authSession.access_token);
  const user = authSession?.user || {};
  const appMetadata = user.app_metadata || payload.app_metadata || {};
  return appMetadata.perfil || appMetadata.role_name || "";
}

function obraSocialIdSesionActual() {
  if (!authSession?.access_token) return null;
  const payload = decodeJwtPayload(authSession.access_token);
  const user = authSession?.user || {};
  const appMetadata = user.app_metadata || payload.app_metadata || {};
  const valor = appMetadata.obra_social_id;
  return valor ? Number(valor) : null;
}

function vistaPermitidaParaSesion(vista) {
  return perfilPuedeVerVista(perfilSesionActual(), vista);
}

function aplicarPermisosNavegacion() {
  if (typeof document === "undefined") return;
  const p = normalizarPerfilAcceso(perfilSesionActual());
  const esAdminPrestacional = ["admin prestacional", "administrador", "admin"].includes(p);
  const esAdminPresentaciones = p === "admin presentaciones";
  const esCargaPresentaciones = p === "carga presentaciones";
  const esAdministrativo = p === "administrativo";
  const esAdministrador = ["administrador", "admin"].includes(p);
  const esAdminPreexistencias = p === "admin preexistencias";
  const esCartillaOs = p === "cartilla os";

  document.querySelector('[data-nav-access="inicio"]')?.toggleAttribute("hidden", !esAdminPrestacional);
  document.querySelector('[data-nav-access="obras-sociales"]')?.toggleAttribute("hidden", !(esAdminPrestacional || esAdminPresentaciones || esAdministrativo));
  document.querySelector('[data-nav-access="prestadores"]')?.toggleAttribute("hidden", !(esAdminPrestacional || esAdminPresentaciones || esCartillaOs));
  document.querySelector('[data-nav-access="cobertura"]')?.toggleAttribute("hidden", !(esAdminPrestacional || esAdminPresentaciones));
  document.querySelector('[data-nav-access="afiliados"]')?.toggleAttribute("hidden", !(esAdminPrestacional || esAdminPresentaciones || esCartillaOs));
  document.querySelector('[data-nav-access="analisis-cartilla"]')?.toggleAttribute("hidden", !(esAdminPrestacional || esAdminPresentaciones || esCartillaOs));
  const labelAnalisisCartilla = document.getElementById("analisis-cartilla-label");
  if (labelAnalisisCartilla) labelAnalisisCartilla.textContent = esCartillaOs ? "Presentación de Cartilla" : "Análisis de Cartilla";
  document.querySelector('[data-nav-access="presentaciones"]')?.toggleAttribute("hidden", !(esAdminPrestacional || esAdminPresentaciones || esCargaPresentaciones || esAdministrativo));
  document.querySelector('[data-nav-access="normativa"]')?.toggleAttribute("hidden", !(esAdminPrestacional || esAdminPresentaciones || esCargaPresentaciones || esAdministrativo));
  document.querySelector('[data-nav-access="urgencias-prestacionales"]')?.toggleAttribute("hidden", !esAdministrador);
  document.querySelector('[data-nav-access="preexistencias"]')?.toggleAttribute("hidden", !(esAdministrador || esAdminPreexistencias));
  document.querySelector('[data-view="px-patologias"]')?.toggleAttribute("hidden", !esAdministrador);
  document.querySelector('[data-view="px-plantillas"]')?.toggleAttribute("hidden", !esAdministrador);
}

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizarDiaMes(valor) {
  const texto = String(valor || "").trim();
  const match = texto.match(/^(\d{1,2})[-/](\d{1,2})$/);
  if (!match) return "";

  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const diasPorMes = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (mes < 1 || mes > 12) return "";
  if (dia < 1 || dia > diasPorMes[mes - 1]) return "";

  return `${String(dia).padStart(2, "0")}-${String(mes).padStart(2, "0")}`;
}

function mostrarDiaMes(valor) {
  return normalizarDiaMes(valor) || "—";
}

function parseIsoDateUtc(valor) {
  const match = String(valor || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
  return d;
}

function formatIsoDateUtc(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function formatFechaPantalla(valor) {
  const d = parseIsoDateUtc(valor);
  if (!d) return "—";
  return `${String(d.getUTCDate()).padStart(2, "0")}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${d.getUTCFullYear()}`;
}

function fechaInicioEjercicioDesdeDiaMes(inicioEjercicio, anioInicio) {
  const normalizado = normalizarDiaMes(inicioEjercicio);
  const year = Number(anioInicio);
  if (!normalizado || !Number.isInteger(year) || year < 2000 || year > 2100) return "";
  const [dia, mes] = normalizado.split("-").map(Number);
  const d = new Date(Date.UTC(year, mes - 1, dia));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return "";
  return formatIsoDateUtc(d);
}

function derivarEjercicio(inicioEjercicio, anioInicio) {
  const normalizado = normalizarDiaMes(inicioEjercicio);
  const year = Number(anioInicio);
  if (!normalizado || !Number.isInteger(year)) return "";
  return normalizado === "01-01" ? String(year) : `${year}/${String(year + 1).slice(-2)}`;
}

function anioInicioVigenteParaOs(os) {
  const normalizado = normalizarDiaMes(os?.inicio_ejercicio || "");
  if (!normalizado) return null;
  const [dia, mes] = normalizado.split("-").map(Number);
  const hoy = new Date();
  const inicioEsteAnio = new Date(hoy.getFullYear(), mes - 1, dia);
  // El ciclo "en curso" es el que ya arrancó (o el del año pasado, si este año todavía no arrancó).
  const anioEnCurso = hoy >= inicioEsteAnio ? hoy.getFullYear() : hoy.getFullYear() - 1;
  // Recién habilitamos el ciclo siguiente cuando faltan 120 días o menos para que arranque.
  const inicioProximo = new Date(anioEnCurso + 1, mes - 1, dia);
  const diasHastaProximo = (inicioProximo - hoy) / 86400000;
  return diasHastaProximo <= 120 ? anioEnCurso + 1 : anioEnCurso;
}

function ejercicioVigenteParaOs(os) {
  const anioInicio = anioInicioVigenteParaOs(os);
  if (!anioInicio) return "";
  return derivarEjercicio(os.inicio_ejercicio, anioInicio);
}

function ejercicioAnteriorParaOs(os) {
  const anioInicio = anioInicioVigenteParaOs(os);
  if (!anioInicio) return "";
  return derivarEjercicio(os.inicio_ejercicio, anioInicio - 1);
}

function ejercicioCanonico(valor) {
  const texto = String(valor || "").trim();
  const simple = texto.match(/^(\d{4})$/);
  if (simple) return simple[1];
  const rango = texto.match(/^(\d{4})\s*\/\s*(\d{2}|\d{4})$/);
  if (!rango) return "";
  const inicio = Number(rango[1]);
  const fin = Number(rango[2].length === 2 ? `${String(inicio).slice(0, 2)}${rango[2]}` : rango[2]);
  if (fin !== inicio + 1) return "";
  return `${inicio}/${String(fin).slice(-2)}`;
}

function ejercicioVisible(valor) {
  const canonico = ejercicioCanonico(valor);
  if (!canonico || !canonico.includes("/")) return canonico;
  const [inicio, finCorto] = canonico.split("/");
  const fin = Number(inicio) + 1;
  return `${inicio}/${fin}`;
}

function anioInicioDesdeEjercicio(valor) {
  const canonico = ejercicioCanonico(valor);
  if (!canonico) return null;
  const anio = Number(canonico.slice(0, 4));
  return Number.isInteger(anio) ? anio : null;
}

function opcionesEjercicioParaInicio(inicioEjercicio, anioReferencia = new Date().getFullYear(), atras = 10, adelante = 3) {
  const inicio = normalizarDiaMes(inicioEjercicio);
  const ref = Number(anioReferencia);
  if (!inicio || !Number.isInteger(ref)) return [];
  const opciones = [];
  for (let anio = ref - atras; anio <= ref + adelante; anio += 1) {
    const value = derivarEjercicio(inicio, anio);
    opciones.push({ value, label: ejercicioVisible(value), anioInicio: anio });
  }
  return opciones;
}

function poblarSelectorEjercicio(prefix, inicioEjercicio, seleccionado = "") {
  if (typeof document === "undefined") return;
  const select = document.getElementById(`${prefix}-ejercicio`);
  if (!select) return;
  const canonicoSeleccionado = ejercicioCanonico(seleccionado);
  const anioSeleccionado = anioInicioDesdeEjercicio(canonicoSeleccionado);
  const referencia = anioSeleccionado || new Date().getFullYear();
  const opciones = opcionesEjercicioParaInicio(inicioEjercicio, referencia, 10, 3);
  if (!opciones.length) {
    select.innerHTML = '<option value="">Seleccioná un agente</option>';
    select.disabled = true;
    return;
  }
  if (canonicoSeleccionado && !opciones.some(o => o.value === canonicoSeleccionado)) {
    opciones.push({ value: canonicoSeleccionado, label: ejercicioVisible(canonicoSeleccionado), anioInicio: anioSeleccionado });
  }
  opciones.sort((a, b) => a.anioInicio - b.anioInicio);
  select.innerHTML = opciones.map(o => `<option value="${o.value}">${o.label}</option>`).join("");
  select.disabled = false;
  select.value = canonicoSeleccionado && opciones.some(o => o.value === canonicoSeleccionado)
    ? canonicoSeleccionado
    : derivarEjercicio(inicioEjercicio, new Date().getFullYear());
}

function finPeriodoDesdeInicio(inicioEjercicio, anioInicio) {
  const fechaInicio = fechaInicioEjercicioDesdeDiaMes(inicioEjercicio, anioInicio);
  const inicio = parseIsoDateUtc(fechaInicio);
  if (!inicio) return "";
  const fin = new Date(Date.UTC(inicio.getUTCFullYear() + 1, inicio.getUTCMonth(), inicio.getUTCDate()));
  fin.setUTCDate(fin.getUTCDate() - 1);
  return formatIsoDateUtc(fin);
}
function diaMesDesdeFechaIso(fechaIso) {
  const d = parseIsoDateUtc(fechaIso);
  if (!d) return "";
  return `${String(d.getUTCDate()).padStart(2,"0")}-${String(d.getUTCMonth()+1).padStart(2,"0")}`;
}


function ejercicioEsperadoPeriodoControl(inicioEjercicio, periodoControl) {
  const normalizado = normalizarDiaMes(inicioEjercicio);
  const periodo = Number(periodoControl);

  if (!normalizado || !Number.isInteger(periodo)) return null;

  if (normalizado === "01-01") {
    return { anioInicio: periodo, ejercicio: String(periodo) };
  }

  const anioInicio = periodo - 1;
  return {
    anioInicio,
    ejercicio: `${anioInicio}/${String(periodo).slice(-2)}`
  };
}

function generarReporteFaltantesPresentaciones(obras, registrosPresentaciones, periodos) {
  const periodosValidos = [...new Set((periodos || []).map(Number).filter(Number.isInteger))].sort((a, b) => a - b);
  const indexPresentaciones = new Set(
    (registrosPresentaciones || [])
      .filter(c => c && c.obra_social_id !== null && c.obra_social_id !== undefined && Number.isInteger(Number(c.anio_inicio)))
      .map(c => `${Number(c.obra_social_id)}|${Number(c.anio_inicio)}`)
  );

  return (obras || [])
    .filter(os => String(os?.estado || "ACTIVA").toUpperCase() !== "INACTIVA")
    .map(os => {
      const periodosResultado = {};
      for (const periodo of periodosValidos) {
        const esperado = ejercicioEsperadoPeriodoControl(os?.inicio_ejercicio || "", periodo);
        if (!esperado) {
          periodosResultado[periodo] = { estado: "NO_PRESENTO", ejercicioEsperado: periodo };
          continue;
        }
        const presento = indexPresentaciones.has(`${Number(os.id)}|${esperado.anioInicio}`);
        periodosResultado[periodo] = {
          estado: presento ? "PRESENTO" : "NO_PRESENTO",
          ejercicioEsperado: esperado.ejercicio
        };
      }
      return {
        id: os.id,
        rnos: os.rnos || "",
        denominacion: os.denominacion || "",
        inicioEjercicio: os.inicio_ejercicio || "",
        periodos: periodosResultado
      };
    })
    .sort((a, b) => {
      const ar = Number(String(a.rnos).replace(/\D/g, "")) || 0;
      const br = Number(String(b.rnos).replace(/\D/g, "")) || 0;
      return ar - br;
    });
}

function generarReporteFaltantesCartillas(obras, registrosCartillas, periodos) {
  return generarReporteFaltantesPresentaciones(obras, registrosCartillas, periodos);
}

function simboloEstadoReporte(estado) {
  if (estado === "PRESENTO") return "✓";
  if (estado === "NO_PRESENTO") return "✕";
  return "?";
}

function resumirPresentacionesPorPeriodo(reporte, periodos) {
  const periodosValidos = ordenarEjercicios(periodos, false);
  return periodosValidos.map(periodo => {
    let presentaron = 0;
    let noPresentaron = 0;
    for (const row of reporte || []) {
      const estado = row?.periodos?.[periodo]?.estado;
      if (estado === "PRESENTO") presentaron += 1;
      else noPresentaron += 1;
    }
    return { periodo, presentaron, noPresentaron, sinInicio: 0 };
  });
}

function resumirCartillasPorPeriodo(reporte, periodos) {
  return resumirPresentacionesPorPeriodo(reporte, periodos);
}

// Combina varios ejercicios en un solo resultado: "presentó" si presentó en AL MENOS UNO
// de los ejercicios seleccionados, "no presentó" si no presentó en NINGUNO de ellos.
function resumirCombinadoPeriodos(reporte, periodos) {
  const periodosValidos = ordenarEjercicios(periodos, false);
  if (!periodosValidos.length) return null;
  let presentaron = 0, noPresentaron = 0;
  for (const row of reporte || []) {
    const presentoAlguno = periodosValidos.some(p => row?.periodos?.[p]?.estado === "PRESENTO");
    if (presentoAlguno) presentaron += 1; else noPresentaron += 1;
  }
  return { periodo: periodosValidos.join(" + "), presentaron, noPresentaron };
}

function obtenerResumenPeriodoGrafico(resumen, periodo) {
  const objetivo = ejercicioCanonico(periodo) || String(periodo || "").trim();
  if (!objetivo) return null;
  return (resumen || []).find(item => String(item?.periodo) === objetivo) || null;
}

function construirMatrizExcelPresentaciones(filas, periodos, metadata = {}) {
  const periodosValidos = [...new Set((periodos || []).map(Number).filter(Number.isInteger))].sort((a, b) => a - b);
  const matriz = [
    ["Reporte", metadata.reporte || "Presentaciones"],
    ["Ejercicios", periodosValidos.join(", ")],
    ["Generado", metadata.generado || ""],
    ["Leyenda", "✓ Presentó | ✕ No presentó"],
    ["RNAS", "Denominación", "Inicio ejercicio", ...periodosValidos.map(String)]
  ];
  for (const row of filas || []) {
    matriz.push([
      String(row?.rnos || ""),
      String(row?.denominacion || ""),
      String(row?.inicioEjercicio || ""),
      ...periodosValidos.map(periodo => simboloEstadoReporte(row?.periodos?.[periodo]?.estado))
    ]);
  }
  return matriz;
}

function construirMatrizExcelCartillas(filas, periodos, metadata = {}) {
  return construirMatrizExcelPresentaciones(filas, periodos, {
    reporte: metadata.reporte || "Cartillas - Presentaciones",
    generado: metadata.generado || ""
  });
}

function periodosControlDisponibles(registrosCartillas, anioActual = new Date().getFullYear()) {
  const periodos = new Set([Number(anioActual)]);

  for (const c of registrosCartillas || []) {
    const anioInicio = Number(c?.anio_inicio);
    if (!Number.isInteger(anioInicio)) continue;

    const inicio = normalizarDiaMes(c?.obras_sociales?.inicio_ejercicio || "");
    const periodo = inicio === "01-01" ? anioInicio : anioInicio + 1;
    if (Number.isInteger(periodo)) periodos.add(periodo);
  }

  const values = [...periodos].filter(Number.isInteger);
  if (!values.length) return [Number(anioActual)];

  const min = Math.min(...values);
  const max = Math.max(Math.max(...values), Number(anioActual));
  const result = [];
  for (let y = min; y <= max; y += 1) result.push(y);
  return result.sort((a, b) => b - a);
}

function calcularCumplimiento90(fechaInicioEjercicio, fechaIngreso) {
  const inicio = parseIsoDateUtc(fechaInicioEjercicio);
  const ingreso = parseIsoDateUtc(fechaIngreso);
  let limite = null;

  if (inicio) {
    // Criterio operativo de Cartillas: el vencimiento es el día anterior
    // al comienzo de los tres meses previos al Inicio ejercicio.
    // Ej.: Inicio 01/01/2026 => fecha límite 30/09/2025.
    limite = new Date(inicio.getTime());
    limite.setUTCMonth(limite.getUTCMonth() - 3);
    limite.setUTCDate(limite.getUTCDate() - 1);
  }

  if (!inicio || !ingreso) {
    return { estado: "SIN_DATOS", fechaLimite: limite ? formatIsoDateUtc(limite) : "", diasAnticipacion: null, diferenciaLimite: null };
  }

  const diasAnticipacion = Math.round((inicio.getTime() - ingreso.getTime()) / 86400000);
  const diferenciaLimite = Math.round((limite.getTime() - ingreso.getTime()) / 86400000);
  return {
    estado: ingreso.getTime() <= limite.getTime() ? "EN_TERMINO" : "FUERA_DE_TERMINO",
    fechaLimite: formatIsoDateUtc(limite),
    diasAnticipacion,
    diferenciaLimite
  };
}

function textoCumplimiento90(resultado) {
  if (!resultado || resultado.estado === "SIN_DATOS") return "Sin datos para calcular el plazo.";
  if (resultado.estado === "EN_TERMINO") {
    const margen = Math.max(0, resultado.diferenciaLimite || 0);
    return margen === 0 ? "Presentada exactamente en la fecha límite." : `Presentada en término, ${margen} ${margen === 1 ? "día" : "días"} antes de la fecha límite.`;
  }
  const tarde = Math.abs(resultado.diferenciaLimite || 0);
  return `Fuera de término, ${tarde} ${tarde === 1 ? "día" : "días"} después de la fecha límite.`;
}

function separarLocalidadDomicilio(localidad, domicilio) {
  const localidadTexto = String(localidad || "").trim();
  const domicilioTexto = String(domicilio || "").trim();
  const separador = " - ";
  const pos = localidadTexto.indexOf(separador);

  if (pos === -1) {
    return {
      localidad: localidadTexto,
      domicilio: domicilioTexto
    };
  }

  const localidadLimpia = localidadTexto.slice(0, pos).trim();
  const detalle = localidadTexto.slice(pos + separador.length).trim();

  return {
    localidad: localidadLimpia,
    domicilio: domicilioTexto || detalle
  };
}

function filtrarObrasSociales(lista, busqueda, estado, inicioEstado = "TODOS") {
  const termino = normalizar(busqueda);
  return lista.filter(os => {
    const coincideEstado = estado === "TODAS" || os.estado === estado;
    if (!coincideEstado) return false;
    const tieneInicio = Boolean(normalizarDiaMes(os.inicio_ejercicio));
    if (inicioEstado === "INFORMADO" && !tieneInicio) return false;
    if (inicioEstado === "SIN_INICIO" && tieneInicio) return false;
    if (!termino) return true;
    return normalizar([os.rnos,os.denominacion,os.sigla,os.domicilio,os.localidad,os.provincia,os.telefono,os.email,os.web].join(" ")).includes(termino);
  });
}

function rnosNumerico(valor) {
  const limpio = String(valor || "").replace(/\D/g, "");
  return limpio ? Number(limpio) : Number.MAX_SAFE_INTEGER;
}

function ordenarObrasSocialesPorRnos(lista, direction = "asc") {
  const factor = direction === "desc" ? -1 : 1;
  return [...lista].sort((a, b) => {
    const numDiff = rnosNumerico(a.rnos) - rnosNumerico(b.rnos);
    if (numDiff !== 0) return numDiff * factor;
    return String(a.rnos || "").localeCompare(String(b.rnos || ""), "es") * factor;
  });
}

function buildObrasSocialesUrl() {
  const fields = [
    "id", "rnos", "denominacion", "sigla", "domicilio", "localidad", "provincia",
    "telefono", "email", "web", "inicio_ejercicio", "estado", "observaciones"
  ].join(",");

  const params = new URLSearchParams();
  params.set("select", fields);
  // Esta tabla ahora también contiene EMP (para Urgencias Prestacionales), pero
  // Agentes de Seguro / PMA / Cartillas / Reportes / KPIs de Inicio son
  // exclusivamente de Obras Sociales: PMA y Cartilla nunca las presentan las EMP.
  params.set("tipo", "eq.Obra Social");
  params.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  return `${SUPABASE_URL}/rest/v1/obras_sociales?${params.toString()}`;
}

async function fetchConTimeout(url, options = {}, timeoutMs = 10000, fetchImpl = fetch) {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  let timer;

  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      if (controller) controller.abort();
      const error = new Error(`Tiempo de espera agotado después de ${timeoutMs / 1000} segundos.`);
      error.name = "TimeoutError";
      reject(error);
    }, timeoutMs);
  });

  try {
    return await Promise.race([
      fetchImpl(url, { ...options, ...(controller ? { signal: controller.signal } : {}) }),
      timeoutPromise
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function leerErrorApi(response) {
  try {
    const data = await response.clone().json();
    return data?.msg || data?.message || data?.error_description || data?.error || JSON.stringify(data);
  } catch (_) {
    try { return await response.text(); } catch (_) { return ""; }
  }
}

async function cargarObrasSocialesDesdeSupabase(fetchImpl = fetch) {
  const response = await fetchConTimeout(
    buildObrasSocialesUrl(),
    { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" },
    10000,
    fetchImpl
  );

  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    throw new Error(`Supabase respondió ${response.status}${detalle ? `: ${detalle}` : ""}`);
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

function authHeaders(accessToken = "") {
  const headers = {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    "Content-Type": "application/json",
    Accept: "application/json"
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

async function authSignIn(email, password, fetchImpl = fetch) {
  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
  const response = await fetchConTimeout(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password })
  }, 10000, fetchImpl);

  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    const mensaje = /invalid login credentials/i.test(detalle || "")
      ? "Usuario o contraseña incorrectos."
      : (detalle || "No se pudo iniciar sesión.");
    throw new Error(mensaje);
  }

  const session = await response.json();
  return normalizarSesion(session);
}

async function authGetUser(accessToken, fetchImpl = fetch) {
  const response = await fetchConTimeout(`${SUPABASE_URL}/auth/v1/user`, {
    method: "GET",
    headers: authHeaders(accessToken),
    cache: "no-store"
  }, 10000, fetchImpl);

  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    throw new Error(detalle || "No se pudieron obtener los datos del usuario.");
  }

  return response.json();
}

async function authRefresh(refreshToken, fetchImpl = fetch) {
  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`;
  const response = await fetchConTimeout(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ refresh_token: refreshToken })
  }, 10000, fetchImpl);

  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    throw new Error(detalle || "No se pudo renovar la sesión.");
  }

  return normalizarSesion(await response.json());
}

async function authLogout(accessToken, fetchImpl = fetch) {
  if (!accessToken) return;
  const response = await fetchConTimeout(`${SUPABASE_URL}/auth/v1/logout`, {
    method: "POST",
    headers: authHeaders(accessToken)
  }, 10000, fetchImpl);

  if (!response.ok && response.status !== 401) {
    const detalle = await leerErrorApi(response);
    throw new Error(detalle || "No se pudo cerrar la sesión.");
  }
}

async function authRecover(email, redirectTo, fetchImpl = fetch) {
  const url = `${SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`;
  const response = await fetchConTimeout(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email })
  }, 10000, fetchImpl);

  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    throw new Error(detalle || "No se pudo enviar el correo de recuperación.");
  }
  return true;
}

async function authUpdatePassword(accessToken, password, fetchImpl = fetch) {
  const response = await fetchConTimeout(`${SUPABASE_URL}/auth/v1/user`, {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ password })
  }, 10000, fetchImpl);

  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    throw new Error(detalle || "No se pudo actualizar la contraseña.");
  }
  return response.json();
}

function decodeJwtPayload(token) {
  try {
    const part = String(token || "").split(".")[1];
    if (!part) return {};
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
    const json = typeof atob === "function"
      ? decodeURIComponent(Array.from(atob(padded)).map(c => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`).join(""))
      : Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json);
  } catch (_) {
    return {};
  }
}

function normalizarSesion(session) {
  if (!session || !session.access_token) return null;
  const payload = decodeJwtPayload(session.access_token);
  return {
    ...session,
    expires_at: session.expires_at || payload.exp || (Math.floor(Date.now() / 1000) + Number(session.expires_in || 3600)),
    user: session.user || { email: payload.email || "" }
  };
}

function getSessionIdentity(session) {
  const payload = decodeJwtPayload(session?.access_token);
  const user = session?.user || {};
  const userMetadata = user.user_metadata || payload.user_metadata || {};
  const appMetadata = user.app_metadata || payload.app_metadata || {};

  const perfilOriginal = appMetadata.perfil || appMetadata.role_name || "Perfil no definido";
  const perfilNormalizado = normalizarPerfilAcceso(perfilOriginal);
  const perfilVisible = ["administrador", "admin", "admin prestacional"].includes(perfilNormalizado)
    ? "Admin Prestacional"
    : perfilNormalizado === "admin presentaciones"
      ? "Admin Presentaciones"
      : perfilNormalizado === "carga presentaciones"
        ? "Carga Presentaciones"
        : perfilOriginal;

  return {
    nombre:
      userMetadata.nombre ||
      userMetadata.full_name ||
      userMetadata.name ||
      "Usuario autorizado",
    perfil: perfilVisible
  };
}

function guardarSesion(session) {
  authSession = normalizarSesion(session);
  if (typeof sessionStorage !== "undefined") {
    if (authSession) sessionStorage.setItem(SESSION_KEY, JSON.stringify(authSession));
    else sessionStorage.removeItem(SESSION_KEY);
  }
  actualizarAuthUI();
}

function cargarSesionGuardada() {
  if (typeof sessionStorage === "undefined") return null;
  try {
    return normalizarSesion(JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"));
  } catch (_) {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function sessionNecesitaRefresh(session) {
  if (!session?.access_token) return false;
  const exp = Number(session.expires_at || decodeJwtPayload(session.access_token).exp || 0);
  return exp > 0 && exp <= Math.floor(Date.now() / 1000) + 60;
}

async function asegurarSesionVigente() {
  if (!authSession?.access_token) throw new Error("Necesitás iniciar sesión para realizar esta acción.");
  if (!sessionNecesitaRefresh(authSession)) return authSession;
  if (!authSession.refresh_token) throw new Error("La sesión venció. Volvé a ingresar.");

  try {
    guardarSesion(await authRefresh(authSession.refresh_token));
    return authSession;
  } catch (error) {
    guardarSesion(null);
    throw new Error("La sesión venció. Volvé a ingresar.");
  }
}

function parseRecoveryHash(hash) {
  const params = new URLSearchParams(String(hash || "").replace(/^#/, ""));
  if (params.get("type") !== "recovery" || !params.get("access_token")) return null;
  return normalizarSesion({
    access_token: params.get("access_token"),
    refresh_token: params.get("refresh_token") || "",
    expires_in: Number(params.get("expires_in") || 3600),
    token_type: params.get("token_type") || "bearer"
  });
}

function buildWriteUrl(id = null) {
  const params = new URLSearchParams();
  params.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  if (id !== null && id !== undefined && id !== "") params.set("id", `eq.${id}`);
  return `${SUPABASE_URL}/rest/v1/obras_sociales?${params.toString()}`;
}

async function guardarObraSocialEnSupabase(registro, id, accessToken, fetchImpl = fetch) {
  const editando = id !== null && id !== undefined && id !== "";
  const payload = editando ? { ...registro, updated_at: new Date().toISOString() } : registro;
  const response = await fetchConTimeout(buildWriteUrl(editando ? id : null), {
    method: editando ? "PATCH" : "POST",
    headers: {
      ...authHeaders(accessToken),
      Prefer: "return=representation"
    },
    body: JSON.stringify(payload)
  }, 10000, fetchImpl);

  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    const error = new Error(detalle || `Supabase respondió ${response.status}.`);
    error.status = response.status;
    throw error;
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : rows;
}

function buildPatologiasUrl(id = null) {
  const params = new URLSearchParams();
  params.set("select", "id,nombre,created_at");
  params.set("order", "nombre.asc");
  params.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  if (id) params.set("id", `eq.${id}`);
  return `${SUPABASE_URL}/rest/v1/patologias?${params.toString()}`;
}

async function cargarPatologiasDesdeSupabase(fetchImpl = fetch) {
  const response = await fetchConTimeout(
    buildPatologiasUrl(),
    { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" },
    10000,
    fetchImpl
  );
  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    throw new Error(`Supabase respondió ${response.status}${detalle ? `: ${detalle}` : ""}`);
  }
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

async function guardarPatologiaEnSupabase(registro, id, accessToken, fetchImpl = fetch) {
  const editando = id !== null && id !== undefined && id !== "";
  const response = await fetchConTimeout(buildPatologiasUrl(editando ? id : null), {
    method: editando ? "PATCH" : "POST",
    headers: { ...authHeaders(accessToken), Prefer: "return=representation" },
    body: JSON.stringify(registro)
  }, 10000, fetchImpl);
  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    const error = new Error(detalle || `Supabase respondió ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : rows;
}

async function eliminarPatologiaEnSupabase(id, accessToken, fetchImpl = fetch) {
  const response = await fetchConTimeout(buildPatologiasUrl(id), {
    method: "DELETE",
    headers: authHeaders(accessToken)
  }, 10000, fetchImpl);
  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    throw new Error(detalle || `Supabase respondió ${response.status}.`);
  }
}

function filtrarPatologias(lista, busqueda) {
  const termino = normalizar(busqueda || "");
  if (!termino) return lista;
  return lista.filter(p => normalizar(p.nombre || "").includes(termino));
}

function renderPatologias() {
  if (typeof document === "undefined") return;
  const tbody = document.getElementById("patologia-table-body");
  if (!tbody) return;
  const busqueda = document.getElementById("patologia-search")?.value || "";
  const filtradas = filtrarPatologias(patologias, busqueda);

  tbody.innerHTML = filtradas.map(p => `
    <tr class="os-row" data-edit-patologia="${p.id}" tabindex="0" role="button" title="Clic para editar o eliminar">
      <td><strong>${escaparHtml(p.nombre)}</strong></td>
      <td></td>
    </tr>
  `).join("");

  const count = document.getElementById("patologia-count");
  if (count) count.textContent = `${filtradas.length} patología${filtradas.length === 1 ? "" : "s"}`;
  const empty = document.getElementById("patologia-empty");
  if (empty) empty.hidden = filtradas.length !== 0;

  document.querySelectorAll(".os-row[data-edit-patologia]").forEach(row => {
    const editar = () => requiereAutenticacion(() => abrirModalEdicionPatologia(row.dataset.editPatologia));
    row.addEventListener("click", editar);
    row.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editar(); }
    });
  });
}

async function cargarYRenderizarPatologias() {
  if (typeof document === "undefined") return;
  const count = document.getElementById("patologia-count");
  if (count) count.textContent = "Cargando patologías...";
  try {
    patologias = await cargarPatologiasDesdeSupabase();
    patologiasCargadas = true;
    renderPatologias();
  } catch (error) {
    if (count) count.textContent = `No se pudieron cargar las patologías.${error?.message ? " " + error.message : ""}`;
    console.error("Error cargando patologías:", error);
  }
}

function resetFormularioPatologia() {
  document.getElementById("patologia-form")?.reset();
  const id = document.getElementById("patologia-id");
  if (id) id.value = "";
  document.getElementById("patologia-eliminar")?.setAttribute("hidden", "");
  setFormMessage("patologia-form-message");
}

function abrirModalNuevaPatologia() {
  resetFormularioPatologia();
  document.getElementById("patologia-modal-title").textContent = "Nueva patología";
  abrirModal("patologia-modal");
  setTimeout(() => document.getElementById("patologia-nombre")?.focus(), 0);
}

function abrirModalEdicionPatologia(id) {
  const p = patologias.find(item => String(item.id) === String(id));
  if (!p) return;
  resetFormularioPatologia();
  document.getElementById("patologia-id").value = p.id;
  document.getElementById("patologia-nombre").value = p.nombre || "";
  document.getElementById("patologia-eliminar")?.removeAttribute("hidden");
  document.getElementById("patologia-modal-title").textContent = "Editar patología";
  abrirModal("patologia-modal");
}

async function handlePatologiaSubmit(event) {
  event.preventDefault();
  const save = document.getElementById("patologia-save");
  setFormMessage("patologia-form-message");

  const id = document.getElementById("patologia-id")?.value || "";
  const nombre = document.getElementById("patologia-nombre")?.value.trim() || "";
  if (!nombre) {
    setFormMessage("patologia-form-message", "El nombre es obligatorio.");
    return;
  }

  try {
    if (save) save.disabled = true;
    const session = await asegurarSesionVigente();
    await guardarPatologiaEnSupabase({ nombre }, id || null, session.access_token);
    cerrarModal("patologia-modal");
    mostrarToast(id ? "Patología actualizada." : "Patología creada.");
    patologiasCargadas = false;
    await cargarYRenderizarPatologias();
  } catch (error) {
    const mensaje = /duplicate|unique|23505/i.test(error.message || "")
      ? "Ya existe una patología con ese nombre."
      : error.message || "No se pudo guardar la patología.";
    setFormMessage("patologia-form-message", mensaje);
  } finally {
    if (save) save.disabled = false;
  }
}

async function handleEliminarPatologia() {
  const id = document.getElementById("patologia-id")?.value || "";
  if (!id) return;
  if (!confirm("¿Eliminar esta patología? Esta acción no se puede deshacer.")) return;
  try {
    const session = await asegurarSesionVigente();
    try {
      await eliminarPatologiaEnSupabase(id, session.access_token);
    } catch (errorPrimerIntento) {
      if (!/foreign key|23503/i.test(errorPrimerIntento.message || "")) throw errorPrimerIntento;

      const expResp = await fetchConTimeout(buildTableUrl("expedientes", { patologia_id: `eq.${id}`, select: "id,numero_ee,nombre_paciente" }), { method: "GET", headers: { Accept: "application/json" } }, 10000);
      const expedientesUsan = expResp.ok ? await expResp.json() : [];
      const detalleExp = expedientesUsan.map(e => `${e.numero_ee} (${e.nombre_paciente})`).join("\n");
      const mensaje = expedientesUsan.length
        ? `Esta patología está en uso en ${expedientesUsan.length} expediente(s):\n${detalleExp}\n\n¿Querés borrarlos también (junto con sus adjuntos e informes), quitar la fundamentación de drogas asociada, y eliminar la patología?`
        : `Esta patología tiene fundamentaciones de drogas asociadas.\n\n¿Querés quitarlas y eliminar la patología?`;
      if (!confirm(mensaje)) throw new Error("No se pudo eliminar: está en uso.");

      for (const e of expedientesUsan) {
        await fetchConTimeout(buildTableUrl("expedientes", { id: `eq.${e.id}` }), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
      }
      await fetchConTimeout(buildTableUrl("droga_patologia", { patologia_id: `eq.${id}` }), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
      await eliminarPatologiaEnSupabase(id, session.access_token);
      expedientesCargadas = false;
    }
    cerrarModal("patologia-modal");
    mostrarToast("Patología eliminada.");
    patologiasCargadas = false;
    drogasCargadas = false;
    await cargarYRenderizarPatologias();
  } catch (error) {
    setFormMessage("patologia-form-message", error.message || "No se pudo eliminar la patología.");
  }
}

function buildTableUrl(table, params = {}) {
  const search = new URLSearchParams(params);
  search.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  return `${SUPABASE_URL}/rest/v1/${table}?${search.toString()}`;
}

// ---------- Drogas ----------

function buildDrogasUrl(id = null) {
  const params = {
    select: "id,nombre,codigo_atc,descripcion_anmat,es_soporte,fundamentacion_general,created_at," +
      "marcas_comerciales(id,nombre_comercial,numero_anmat,laboratorio)," +
      "droga_patologia(id,patologia_id,fundamentacion_texto,patologias(nombre))",
    order: "nombre.asc"
  };
  if (id) params.id = `eq.${id}`;
  return buildTableUrl("drogas", params);
}

async function cargarDrogasDesdeSupabase() {
  const response = await fetchConTimeout(buildDrogasUrl(), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 10000);
  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    throw new Error(`Supabase respondió ${response.status}${detalle ? `: ${detalle}` : ""}`);
  }
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

async function cargarYRenderizarDrogas() {
  const count = document.getElementById("droga-count");
  if (count) count.textContent = "Cargando drogas...";
  try {
    drogas = await cargarDrogasDesdeSupabase();
    drogasCargadas = true;
    renderDrogas();
  } catch (error) {
    if (count) count.textContent = `No se pudieron cargar las drogas.${error?.message ? " " + error.message : ""}`;
    console.error("Error cargando drogas:", error);
  }
}

async function asegurarPatologiasCargadas() {
  if (!patologiasCargadas) {
    try { patologias = await cargarPatologiasDesdeSupabase(); patologiasCargadas = true; }
    catch (error) { console.error("Error cargando patologías:", error); }
  }
}

function filtrarDrogas(lista, busqueda) {
  const termino = normalizar(busqueda || "");
  if (!termino) return lista;
  return lista.filter(d => normalizar(d.nombre || "").includes(termino) || normalizar(d.codigo_atc || "").includes(termino));
}

function renderDrogas() {
  const tbody = document.getElementById("droga-table-body");
  if (!tbody) return;
  const busqueda = document.getElementById("droga-search")?.value || "";
  const filtradas = filtrarDrogas(drogas, busqueda);

  tbody.innerHTML = filtradas.map(d => `
    <tr class="os-row" data-edit-droga="${d.id}" tabindex="0" role="button" title="Clic para editar o eliminar">
      <td><strong>${escaparHtml(d.nombre)}</strong></td>
      <td>${escaparHtml(d.codigo_atc || "—")}</td>
      <td>${d.es_soporte ? "Soporte" : "Oncológica"}</td>
      <td>${(d.marcas_comerciales || []).length}</td>
      <td>${d.es_soporte ? "—" : (d.droga_patologia || []).length}</td>
    </tr>
  `).join("");

  const count = document.getElementById("droga-count");
  if (count) count.textContent = `${filtradas.length} droga${filtradas.length === 1 ? "" : "s"}`;
  const empty = document.getElementById("droga-empty");
  if (empty) empty.hidden = filtradas.length !== 0;

  document.querySelectorAll(".os-row[data-edit-droga]").forEach(row => {
    const editar = () => requiereAutenticacion(() => abrirModalEdicionDroga(row.dataset.editDroga));
    row.addEventListener("click", editar);
    row.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editar(); }
    });
  });
}

function renderMarcasSubform() {
  const cont = document.getElementById("droga-marcas-list");
  if (!cont) return;
  cont.innerHTML = modalMarcas.map((m, i) => `
    <div class="subform-item">
      <div class="subform-item-text"><strong>${escaparHtml(m.nombre_comercial)}</strong>
        ${m.numero_anmat ? `N° ANMAT: ${escaparHtml(m.numero_anmat)}` : ""}${m.laboratorio ? ` · ${escaparHtml(m.laboratorio)}` : ""}</div>
      <button type="button" class="subform-item-remove" data-quitar-marca="${i}" aria-label="Quitar">×</button>
    </div>
  `).join("") || `<p style="color:var(--muted);font-size:13px;margin:0">Sin marcas cargadas.</p>`;

  cont.querySelectorAll("[data-quitar-marca]").forEach(btn => {
    btn.addEventListener("click", () => {
      modalMarcas.splice(Number(btn.dataset.quitarMarca), 1);
      renderMarcasSubform();
    });
  });
}

function renderPatologiasSubform() {
  const cont = document.getElementById("droga-patologias-list");
  if (!cont) return;
  cont.innerHTML = modalFundamentaciones.map((f, i) => {
    const p = patologias.find(item => String(item.id) === String(f.patologia_id));
    const clave = String(f.patologia_id);
    const abierta = modalPatologiaExpandida.has(clave);
    return `
    <div class="subform-item">
      <div class="subform-item-text">
        <button type="button" class="subform-item-toggle" data-toggle-patologia="${clave}">
          <span class="subform-item-toggle-icon">${abierta ? "▾" : "▸"}</span>
          <strong>${escaparHtml(p ? p.nombre : "(patología)")}</strong>
        </button>
        ${abierta ? `<textarea data-fundamentacion="${i}" rows="3" placeholder="Fundamentación para esta patología...">${escaparHtml(f.fundamentacion_texto || "")}</textarea>` : ""}
      </div>
      <button type="button" class="subform-item-remove" data-quitar-patologia="${i}" aria-label="Quitar">×</button>
    </div>`;
  }).join("") || `<p style="color:var(--muted);font-size:13px;margin:0">Sin patologías asociadas.</p>`;

  cont.querySelectorAll("[data-toggle-patologia]").forEach(btn => {
    btn.addEventListener("click", () => {
      const clave = btn.dataset.togglePatologia;
      if (modalPatologiaExpandida.has(clave)) modalPatologiaExpandida.delete(clave);
      else modalPatologiaExpandida.add(clave);
      renderPatologiasSubform();
    });
  });
  cont.querySelectorAll("[data-quitar-patologia]").forEach(btn => {
    btn.addEventListener("click", () => {
      modalFundamentaciones.splice(Number(btn.dataset.quitarPatologia), 1);
      renderPatologiasSubform();
    });
  });
  cont.querySelectorAll("[data-fundamentacion]").forEach(ta => {
    ta.addEventListener("input", () => { modalFundamentaciones[Number(ta.dataset.fundamentacion)].fundamentacion_texto = ta.value; });
  });
}

function poblarSelectPatologias() {
  const select = document.getElementById("droga-patologia-select");
  if (!select) return;
  const yaAsociadas = new Set(modalFundamentaciones.map(f => String(f.patologia_id)));
  const disponibles = patologias.filter(p => !yaAsociadas.has(String(p.id)));
  select.innerHTML = `<option value="">Elegir patología...</option>` +
    disponibles.map(p => `<option value="${p.id}">${escaparHtml(p.nombre)}</option>`).join("");
}

function actualizarVisibilidadSoporte() {
  const esSoporte = document.getElementById("droga-es-soporte")?.checked;
  document.getElementById("droga-fundamentacion-general-wrap")?.toggleAttribute("hidden", !esSoporte);
  document.getElementById("droga-patologias-block")?.toggleAttribute("hidden", esSoporte);
}

function resetFormularioDroga() {
  document.getElementById("droga-form")?.reset();
  document.getElementById("droga-id").value = "";
  document.getElementById("droga-eliminar")?.setAttribute("hidden", "");
  modalMarcas = [];
  modalMarcasOriginales = [];
  modalFundamentaciones = [];
  modalFundamentacionesOriginales = [];
  modalPatologiaExpandida = new Set();
  renderMarcasSubform();
  renderPatologiasSubform();
  poblarSelectPatologias();
  actualizarVisibilidadSoporte();
  setFormMessage("droga-form-message");
}

async function abrirModalNuevaDroga() {
  await asegurarPatologiasCargadas();
  resetFormularioDroga();
  document.getElementById("droga-modal-title").textContent = "Nueva droga";
  abrirModal("droga-modal");
  setTimeout(() => document.getElementById("droga-nombre")?.focus(), 0);
}

async function abrirModalEdicionDroga(id) {
  await asegurarPatologiasCargadas();
  const d = drogas.find(item => String(item.id) === String(id));
  if (!d) return;
  resetFormularioDroga();
  document.getElementById("droga-id").value = d.id;
  document.getElementById("droga-nombre").value = d.nombre || "";
  document.getElementById("droga-atc").value = d.codigo_atc || "";
  document.getElementById("droga-descripcion-anmat").value = d.descripcion_anmat || "";
  document.getElementById("droga-es-soporte").checked = !!d.es_soporte;
  document.getElementById("droga-fundamentacion-general").value = d.fundamentacion_general || "";
  modalMarcas = (d.marcas_comerciales || []).map(m => ({ id: m.id, nombre_comercial: m.nombre_comercial, numero_anmat: m.numero_anmat, laboratorio: m.laboratorio }));
  modalMarcasOriginales = modalMarcas.map(m => m.id);
  modalFundamentaciones = (d.droga_patologia || []).map(f => ({ id: f.id, patologia_id: f.patologia_id, fundamentacion_texto: f.fundamentacion_texto }));
  modalFundamentacionesOriginales = modalFundamentaciones.map(f => f.id);
  renderMarcasSubform();
  renderPatologiasSubform();
  poblarSelectPatologias();
  actualizarVisibilidadSoporte();
  document.getElementById("droga-eliminar")?.removeAttribute("hidden");
  document.getElementById("droga-modal-title").textContent = "Editar droga";
  abrirModal("droga-modal");
}

function agregarMarcaTemporal() {
  const nombre = document.getElementById("droga-marca-nombre")?.value.trim();
  if (!nombre) { document.getElementById("droga-marca-nombre")?.focus(); return; }
  modalMarcas.push({
    nombre_comercial: nombre,
    numero_anmat: document.getElementById("droga-marca-anmat")?.value.trim() || null,
    laboratorio: document.getElementById("droga-marca-laboratorio")?.value.trim() || null
  });
  document.getElementById("droga-marca-nombre").value = "";
  document.getElementById("droga-marca-anmat").value = "";
  document.getElementById("droga-marca-laboratorio").value = "";
  renderMarcasSubform();
}

function agregarPatologiaTemporal() {
  const patologiaId = document.getElementById("droga-patologia-select")?.value;
  if (!patologiaId) return;
  modalFundamentaciones.push({ patologia_id: patologiaId, fundamentacion_texto: "" });
  modalPatologiaExpandida.add(String(patologiaId));
  renderPatologiasSubform();
  poblarSelectPatologias();
}

async function handleDrogaSubmit(event) {
  event.preventDefault();
  const save = document.getElementById("droga-save");
  setFormMessage("droga-form-message");

  const id = document.getElementById("droga-id")?.value || "";
  const nombre = document.getElementById("droga-nombre")?.value.trim() || "";
  if (!nombre) { setFormMessage("droga-form-message", "El nombre es obligatorio."); return; }

  const esSoporte = document.getElementById("droga-es-soporte")?.checked || false;
  const registro = {
    nombre,
    codigo_atc: document.getElementById("droga-atc")?.value.trim() || null,
    descripcion_anmat: document.getElementById("droga-descripcion-anmat")?.value.trim() || null,
    es_soporte: esSoporte,
    fundamentacion_general: esSoporte ? (document.getElementById("droga-fundamentacion-general")?.value.trim() || null) : null
  };

  try {
    if (save) save.disabled = true;
    const session = await asegurarSesionVigente();
    const headers = { ...authHeaders(session.access_token), Prefer: "return=representation" };

    const editando = !!id;
    const response = await fetchConTimeout(buildDrogasUrl(editando ? id : null).replace(/&select=[^&]+/, "&select=id"), {
      method: editando ? "PATCH" : "POST",
      headers,
      body: JSON.stringify(registro)
    }, 10000);
    if (!response.ok) throw new Error((await leerErrorApi(response)) || `Supabase respondió ${response.status}.`);
    const filas = await response.json();
    const drogaId = editando ? id : filas[0]?.id;
    if (!drogaId) throw new Error("No se pudo obtener el id de la droga guardada.");

    // Sincronizar marcas comerciales por diferencia (no borrar todo y reinsertar:
    // una marca puede estar en uso en un expediente y no debe duplicarse ni fallar en silencio).
    const marcasActualesIds = modalMarcas.filter(m => m.id).map(m => m.id);
    const marcasABorrar = modalMarcasOriginales.filter(id => !marcasActualesIds.includes(id));
    const erroresSync = [];
    for (const marcaId of marcasABorrar) {
      const r = await fetchConTimeout(buildTableUrl("marcas_comerciales", { id: `eq.${marcaId}` }), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
      if (!r.ok) {
        const detalle = await leerErrorApi(r);
        erroresSync.push(/foreign key|23503/i.test(detalle || "") ? "No se pudo quitar una marca: está en uso en un expediente." : (detalle || "No se pudo quitar una marca."));
      }
    }
    for (const m of modalMarcas) {
      if (m.id) {
        const r = await fetchConTimeout(buildTableUrl("marcas_comerciales", { id: `eq.${m.id}` }), {
          method: "PATCH", headers: authHeaders(session.access_token),
          body: JSON.stringify({ nombre_comercial: m.nombre_comercial, numero_anmat: m.numero_anmat, laboratorio: m.laboratorio })
        }, 10000);
        if (!r.ok) erroresSync.push((await leerErrorApi(r)) || "No se pudo actualizar una marca.");
      } else {
        const r = await fetchConTimeout(buildTableUrl("marcas_comerciales", {}), {
          method: "POST", headers: authHeaders(session.access_token),
          body: JSON.stringify({ droga_id: drogaId, nombre_comercial: m.nombre_comercial, numero_anmat: m.numero_anmat, laboratorio: m.laboratorio })
        }, 10000);
        if (!r.ok) erroresSync.push((await leerErrorApi(r)) || "No se pudo agregar una marca nueva.");
      }
    }

    // Sincronizar fundamentación por patología, mismo criterio (solo aplica si no es droga de soporte)
    const fundamentacionesActualesIds = esSoporte ? [] : modalFundamentaciones.filter(f => f.id).map(f => f.id);
    const fundamentacionesABorrar = esSoporte
      ? modalFundamentacionesOriginales
      : modalFundamentacionesOriginales.filter(id => !fundamentacionesActualesIds.includes(id));
    for (const fId of fundamentacionesABorrar) {
      const r = await fetchConTimeout(buildTableUrl("droga_patologia", { id: `eq.${fId}` }), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
      if (!r.ok) {
        const detalle = await leerErrorApi(r);
        erroresSync.push(/foreign key|23503/i.test(detalle || "") ? "No se pudo quitar una fundamentación en uso." : (detalle || "No se pudo quitar una fundamentación."));
      }
    }
    if (!esSoporte) {
      for (const f of modalFundamentaciones) {
        if (f.id) {
          const r = await fetchConTimeout(buildTableUrl("droga_patologia", { id: `eq.${f.id}` }), {
            method: "PATCH", headers: authHeaders(session.access_token),
            body: JSON.stringify({ fundamentacion_texto: f.fundamentacion_texto || "" })
          }, 10000);
          if (!r.ok) erroresSync.push((await leerErrorApi(r)) || "No se pudo actualizar una fundamentación.");
        } else {
          const r = await fetchConTimeout(buildTableUrl("droga_patologia", {}), {
            method: "POST", headers: authHeaders(session.access_token),
            body: JSON.stringify({ droga_id: drogaId, patologia_id: f.patologia_id, fundamentacion_texto: f.fundamentacion_texto || "" })
          }, 10000);
          if (!r.ok) erroresSync.push((await leerErrorApi(r)) || "No se pudo agregar una fundamentación nueva.");
        }
      }
    }

    cerrarModal("droga-modal");
    mostrarToast(erroresSync.length ? `Droga guardada, con avisos: ${erroresSync.join(" ")}` : (editando ? "Droga actualizada." : "Droga creada."));
    drogasCargadas = false;
    await cargarYRenderizarDrogas();
  } catch (error) {
    setFormMessage("droga-form-message", error.message || "No se pudo guardar la droga.");
  } finally {
    if (save) save.disabled = false;
  }
}

async function handleEliminarDroga() {
  const id = document.getElementById("droga-id")?.value || "";
  if (!id) return;
  if (!confirm("¿Eliminar esta droga? Se van a borrar también sus marcas comerciales y fundamentaciones asociadas.")) return;
  try {
    const session = await asegurarSesionVigente();
    await fetchConTimeout(buildTableUrl("marcas_comerciales", { droga_id: `eq.${id}` }), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
    await fetchConTimeout(buildTableUrl("droga_patologia", { droga_id: `eq.${id}` }), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
    const response = await fetchConTimeout(buildTableUrl("drogas", { id: `eq.${id}` }), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
    if (!response.ok) {
      const detalle = await leerErrorApi(response);
      throw new Error(/foreign key|23503/i.test(detalle || "") ? "No se puede eliminar: esta droga está usada en uno o más expedientes." : (detalle || `Supabase respondió ${response.status}.`));
    }
    cerrarModal("droga-modal");
    mostrarToast("Droga eliminada.");
    drogasCargadas = false;
    await cargarYRenderizarDrogas();
  } catch (error) {
    setFormMessage("droga-form-message", error.message || "No se pudo eliminar la droga.");
  }
}

// ---------- Plantillas de informe ----------

function buildPlantillasUrl(id = null) {
  const params = { select: "id,nombre,texto_apertura,texto_cierre_tecnico,created_at", order: "nombre.asc" };
  if (id) params.id = `eq.${id}`;
  return buildTableUrl("plantillas_informe", params);
}

async function cargarPlantillasDesdeSupabase() {
  const response = await fetchConTimeout(buildPlantillasUrl(), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 10000);
  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    throw new Error(`Supabase respondió ${response.status}${detalle ? `: ${detalle}` : ""}`);
  }
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

async function cargarYRenderizarPlantillas() {
  const count = document.getElementById("plantilla-count");
  if (count) count.textContent = "Cargando plantillas...";
  try {
    plantillas = await cargarPlantillasDesdeSupabase();
    plantillasCargadas = true;
    renderPlantillas();
  } catch (error) {
    if (count) count.textContent = `No se pudieron cargar las plantillas.${error?.message ? " " + error.message : ""}`;
    console.error("Error cargando plantillas:", error);
  }
}

function renderPlantillas() {
  const tbody = document.getElementById("plantilla-table-body");
  if (!tbody) return;
  tbody.innerHTML = plantillas.map(p => `
    <tr class="os-row" data-edit-plantilla="${p.id}" tabindex="0" role="button" title="Clic para editar o eliminar">
      <td><strong>${escaparHtml(p.nombre)}</strong></td>
      <td></td>
    </tr>
  `).join("");

  const count = document.getElementById("plantilla-count");
  if (count) count.textContent = `${plantillas.length} plantilla${plantillas.length === 1 ? "" : "s"}`;
  const empty = document.getElementById("plantilla-empty");
  if (empty) empty.hidden = plantillas.length !== 0;

  document.querySelectorAll(".os-row[data-edit-plantilla]").forEach(row => {
    const editar = () => requiereAutenticacion(() => abrirModalEdicionPlantilla(row.dataset.editPlantilla));
    row.addEventListener("click", editar);
    row.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editar(); }
    });
  });
}

function resetFormularioPlantilla() {
  document.getElementById("plantilla-form")?.reset();
  document.getElementById("plantilla-id").value = "";
  document.getElementById("plantilla-eliminar")?.setAttribute("hidden", "");
  setFormMessage("plantilla-form-message");
}

function abrirModalNuevaPlantilla() {
  resetFormularioPlantilla();
  document.getElementById("plantilla-modal-title").textContent = "Nueva plantilla";
  abrirModal("plantilla-modal");
  setTimeout(() => document.getElementById("plantilla-nombre")?.focus(), 0);
}

function abrirModalEdicionPlantilla(id) {
  const p = plantillas.find(item => String(item.id) === String(id));
  if (!p) return;
  resetFormularioPlantilla();
  document.getElementById("plantilla-id").value = p.id;
  document.getElementById("plantilla-nombre").value = p.nombre || "";
  document.getElementById("plantilla-apertura").value = p.texto_apertura || "";
  document.getElementById("plantilla-cierre").value = p.texto_cierre_tecnico || "";
  document.getElementById("plantilla-eliminar")?.removeAttribute("hidden");
  document.getElementById("plantilla-modal-title").textContent = "Editar plantilla";
  abrirModal("plantilla-modal");
}

async function handlePlantillaSubmit(event) {
  event.preventDefault();
  const save = document.getElementById("plantilla-save");
  setFormMessage("plantilla-form-message");

  const id = document.getElementById("plantilla-id")?.value || "";
  const nombre = document.getElementById("plantilla-nombre")?.value.trim() || "";
  if (!nombre) { setFormMessage("plantilla-form-message", "El nombre es obligatorio."); return; }

  const registro = {
    nombre,
    texto_apertura: document.getElementById("plantilla-apertura")?.value || "",
    texto_cierre_tecnico: document.getElementById("plantilla-cierre")?.value || ""
  };

  try {
    if (save) save.disabled = true;
    const session = await asegurarSesionVigente();
    const editando = !!id;
    const response = await fetchConTimeout(buildPlantillasUrl(editando ? id : null), {
      method: editando ? "PATCH" : "POST",
      headers: { ...authHeaders(session.access_token), Prefer: "return=representation" },
      body: JSON.stringify(registro)
    }, 10000);
    if (!response.ok) throw new Error((await leerErrorApi(response)) || `Supabase respondió ${response.status}.`);

    cerrarModal("plantilla-modal");
    mostrarToast(editando ? "Plantilla actualizada." : "Plantilla creada.");
    plantillasCargadas = false;
    await cargarYRenderizarPlantillas();
  } catch (error) {
    const mensaje = /duplicate|unique|23505/i.test(error.message || "") ? "Ya existe una plantilla con ese nombre." : (error.message || "No se pudo guardar la plantilla.");
    setFormMessage("plantilla-form-message", mensaje);
  } finally {
    if (save) save.disabled = false;
  }
}

async function handleEliminarPlantilla() {
  const id = document.getElementById("plantilla-id")?.value || "";
  if (!id) return;
  if (!confirm("¿Eliminar esta plantilla? Esta acción no se puede deshacer.")) return;
  try {
    const session = await asegurarSesionVigente();
    const response = await fetchConTimeout(buildTableUrl("plantillas_informe", { id: `eq.${id}` }), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
    if (!response.ok) {
      const detalle = await leerErrorApi(response);
      throw new Error(/foreign key|23503/i.test(detalle || "") ? "No se puede eliminar: esta plantilla está usada en uno o más expedientes." : (detalle || `Supabase respondió ${response.status}.`));
    }
    cerrarModal("plantilla-modal");
    mostrarToast("Plantilla eliminada.");
    plantillasCargadas = false;
    await cargarYRenderizarPlantillas();
  } catch (error) {
    setFormMessage("plantilla-form-message", error.message || "No se pudo eliminar la plantilla.");
  }
}

// ---------- Expedientes ----------

function buildObrasSocialesTodasUrl() {
  const params = { select: "id,tipo,rnos,rnemp,denominacion", order: "denominacion.asc" };
  return buildTableUrl("obras_sociales", params);
}

async function asegurarObrasSocialesTodasCargadas() {
  if (obrasSocialesTodasCargadas) return;
  let todas = [];
  let offset = 0;
  const paginaSize = 1000;
  while (true) {
    const url = `${buildObrasSocialesTodasUrl()}&limit=${paginaSize}&offset=${offset}`;
    const response = await fetchConTimeout(url, { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 15000);
    if (!response.ok) { console.error("Error cargando Obras Sociales/EMP:", await leerErrorApi(response)); break; }
    const rows = await response.json();
    if (!Array.isArray(rows) || !rows.length) break;
    todas = todas.concat(rows);
    if (rows.length < paginaSize) break;
    offset += paginaSize;
  }
  obrasSocialesTodas = todas;
  obrasSocialesTodasCargadas = true;
  obrasSocialesTodasPorEtiqueta = new Map();
  obrasSocialesTodas.forEach(o => {
    const codigo = o.tipo === "Obra Social" ? o.rnos : o.rnemp;
    const etiqueta = `${o.denominacion}${codigo ? ` (${codigo})` : ""}`;
    obrasSocialesTodasPorEtiqueta.set(etiqueta, o.id);
  });
}

function poblarDatalistObrasSociales() {
  const datalist = document.getElementById("expediente-os-datalist");
  if (!datalist) return;
  datalist.innerHTML = [...obrasSocialesTodasPorEtiqueta.keys()].map(etiqueta => `<option value="${escaparHtml(etiqueta)}"></option>`).join("");
}

function etiquetaObraSocial(id) {
  const o = obrasSocialesTodas.find(item => String(item.id) === String(id));
  if (!o) return "";
  const codigo = o.tipo === "Obra Social" ? o.rnos : o.rnemp;
  return `${o.denominacion}${codigo ? ` (${codigo})` : ""}`;
}

// ---------- Modal de datos de contacto (usado desde Expedientes y Preexistencias) ----------

async function abrirModalContactoOs(id, etiquetaEntidad = "Obra Social/EMP") {
  if (!id) { mostrarToast(`Elegí primero una ${etiquetaEntidad} de la lista para ver su contacto.`); return; }
  setFormMessage("contacto-os-form-message");
  document.getElementById("contacto-os-id").value = id;
  document.getElementById("contacto-os-modal-title").textContent = "Datos de contacto";
  document.getElementById("contacto-os-form")?.reset();
  abrirModal("contacto-os-modal");

  const params = { id: `eq.${id}`, select: "denominacion,sigla,domicilio,localidad,provincia,telefono,email,web,dg_nombre,dg_cargo,dg_telefono,dg_movil,dg_email,dg_notas,am_nombre,am_cargo,am_telefono,am_movil,am_email,am_notas,ad_nombre,ad_cargo,ad_telefono,ad_movil,ad_email,ad_notas,info_adicional" };
  const response = await fetchConTimeout(buildTableUrl("obras_sociales", params), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 10000);
  const filas = response.ok ? await response.json() : [];
  const o = filas[0];
  if (!o) { setFormMessage("contacto-os-form-message", "No se encontró esa Obra Social/EMP."); return; }

  document.getElementById("contacto-os-modal-title").textContent = o.denominacion || "Datos de contacto";
  const campos = ["domicilio", "localidad", "provincia", "telefono", "email", "web",
    "dg_nombre", "dg_cargo", "dg_telefono", "dg_movil", "dg_email", "dg_notas",
    "am_nombre", "am_cargo", "am_telefono", "am_movil", "am_email", "am_notas",
    "ad_nombre", "ad_cargo", "ad_telefono", "ad_movil", "ad_email", "ad_notas"];
  campos.forEach(campo => {
    const el = document.getElementById(`contacto-os-${campo.replace(/_/g, "-")}`);
    if (el) el.value = o[campo] || "";
  });
  document.getElementById("contacto-os-info-adicional").value = o.info_adicional || "";
}

async function handleContactoOsSubmit(event) {
  event.preventDefault();
  const save = document.getElementById("contacto-os-save");
  setFormMessage("contacto-os-form-message");
  const id = document.getElementById("contacto-os-id")?.value || "";
  if (!id) return;

  const registro = {
    domicilio: document.getElementById("contacto-os-domicilio")?.value.trim() || null,
    localidad: document.getElementById("contacto-os-localidad")?.value.trim() || null,
    provincia: document.getElementById("contacto-os-provincia")?.value.trim() || null,
    telefono: document.getElementById("contacto-os-telefono")?.value.trim() || null,
    email: document.getElementById("contacto-os-email")?.value.trim() || null,
    web: document.getElementById("contacto-os-web")?.value.trim() || null,
    dg_nombre: document.getElementById("contacto-os-dg-nombre")?.value.trim() || null,
    dg_cargo: document.getElementById("contacto-os-dg-cargo")?.value.trim() || null,
    dg_telefono: document.getElementById("contacto-os-dg-telefono")?.value.trim() || null,
    dg_movil: document.getElementById("contacto-os-dg-movil")?.value.trim() || null,
    dg_email: document.getElementById("contacto-os-dg-email")?.value.trim() || null,
    dg_notas: document.getElementById("contacto-os-dg-notas")?.value.trim() || null,
    am_nombre: document.getElementById("contacto-os-am-nombre")?.value.trim() || null,
    am_cargo: document.getElementById("contacto-os-am-cargo")?.value.trim() || null,
    am_telefono: document.getElementById("contacto-os-am-telefono")?.value.trim() || null,
    am_movil: document.getElementById("contacto-os-am-movil")?.value.trim() || null,
    am_email: document.getElementById("contacto-os-am-email")?.value.trim() || null,
    am_notas: document.getElementById("contacto-os-am-notas")?.value.trim() || null,
    ad_nombre: document.getElementById("contacto-os-ad-nombre")?.value.trim() || null,
    ad_cargo: document.getElementById("contacto-os-ad-cargo")?.value.trim() || null,
    ad_telefono: document.getElementById("contacto-os-ad-telefono")?.value.trim() || null,
    ad_movil: document.getElementById("contacto-os-ad-movil")?.value.trim() || null,
    ad_email: document.getElementById("contacto-os-ad-email")?.value.trim() || null,
    ad_notas: document.getElementById("contacto-os-ad-notas")?.value.trim() || null,
    info_adicional: document.getElementById("contacto-os-info-adicional")?.value.trim() || null
  };

  try {
    if (save) save.disabled = true;
    const session = await asegurarSesionVigente();
    const response = await fetchConTimeout(buildTableUrl("obras_sociales", { id: `eq.${id}` }), {
      method: "PATCH", headers: authHeaders(session.access_token), body: JSON.stringify(registro)
    }, 10000);
    if (!response.ok) throw new Error((await leerErrorApi(response)) || `Supabase respondió ${response.status}.`);
    mostrarToast("Datos de contacto guardados.");
    cerrarModal("contacto-os-modal");
  } catch (error) {
    setFormMessage("contacto-os-form-message", error.message || "No se pudo guardar el contacto.");
  } finally {
    if (save) save.disabled = false;
  }
}

function buildFilialesUrl(params = {}) {
  return buildTableUrl("filiales", { select: "id,nombre,localidad,provincia", order: "nombre.asc", ...params });
}

async function poblarSelectFiliales(obraSocialId, seleccionarId = "") {
  const select = document.getElementById("expediente-filial-select");
  if (!select) return;
  if (!obraSocialId) {
    select.innerHTML = `<option value="">Sin filial específica</option>`;
    select.disabled = true;
    return;
  }
  select.disabled = false;
  const response = await fetchConTimeout(buildFilialesUrl({ obra_social_id: `eq.${obraSocialId}` }), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 10000);
  const filiales = response.ok ? await response.json() : [];
  select.innerHTML = `<option value="">Sin filial específica</option>` + filiales.map(f => `<option value="${f.id}">${escaparHtml(f.nombre)}${f.localidad ? ` (${escaparHtml(f.localidad)})` : ""}</option>`).join("");
  if (seleccionarId) select.value = seleccionarId;
}

async function handleAgregarFilial() {
  const osInput = document.getElementById("expediente-os-input");
  const obraSocialId = osInput?.dataset.selectedId;
  if (!obraSocialId) { setFormMessage("expediente-form-message", "Elegí primero la Obra Social/EMP para poder agregarle una filial."); return; }
  const nombre = prompt("Nombre de la nueva filial:");
  if (!nombre || !nombre.trim()) return;
  try {
    const session = await asegurarSesionVigente();
    const response = await fetchConTimeout(buildTableUrl("filiales", {}), {
      method: "POST", headers: { ...authHeaders(session.access_token), Prefer: "return=representation" },
      body: JSON.stringify({ obra_social_id: obraSocialId, nombre: nombre.trim() })
    }, 10000);
    if (!response.ok) throw new Error((await leerErrorApi(response)) || "No se pudo crear la filial.");
    const filas = await response.json();
    mostrarToast("Filial agregada.");
    await poblarSelectFiliales(obraSocialId, filas[0]?.id);
  } catch (error) {
    setFormMessage("expediente-form-message", error.message || "No se pudo crear la filial.");
  }
}

async function asegurarCatalogosExpedienteCargados() {
  await Promise.all([
    asegurarPatologiasCargadas(),
    (async () => { if (!plantillasCargadas) { try { plantillas = await cargarPlantillasDesdeSupabase(); plantillasCargadas = true; } catch (e) { console.error(e); } } })(),
    (async () => { if (!drogasCargadas) { try { drogas = await cargarDrogasDesdeSupabase(); drogasCargadas = true; } catch (e) { console.error(e); } } })(),
    asegurarObrasSocialesTodasCargadas()
  ]);
}

function buildExpedientesUrl(id = null) {
  const params = {
    select: "id,numero_ee,fecha_ingreso,fecha_cierre,fecha_limite,nombre_paciente,telefono_paciente,email_paciente," +
      "patologia_id,diagnostico_detalle,resumen_hc,obra_social_id,pasos_resolucion,dni_cuit_paciente," +
      "denunciante_nombre,denunciante_dni_cuit,motivo_denuncia,plantilla_id,estado,filial_id," +
      "patologias(nombre)," +
      "expediente_medicamentos(id,droga_id,marca_id,dosis,drogas(nombre),marcas_comerciales(nombre_comercial))",
    order: "fecha_ingreso.desc"
  };
  if (id) params.id = `eq.${id}`;
  return buildTableUrl("expedientes", params);
}

async function cargarExpedientesDesdeSupabase() {
  const response = await fetchConTimeout(buildExpedientesUrl(), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 15000);
  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    throw new Error(`Supabase respondió ${response.status}${detalle ? `: ${detalle}` : ""}`);
  }
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

async function cargarYRenderizarExpedientes() {
  const count = document.getElementById("expediente-count");
  if (count) count.textContent = "Cargando expedientes...";
  try {
    const [filas] = await Promise.all([cargarExpedientesDesdeSupabase(), asegurarObrasSocialesTodasCargadas()]);
    expedientes = filas;
    expedientesCargadas = true;
    renderExpedientes();
  } catch (error) {
    if (count) count.textContent = `No se pudieron cargar los expedientes.${error?.message ? " " + error.message : ""}`;
    console.error("Error cargando expedientes:", error);
  }
}

function filtrarExpedientes(lista, busqueda) {
  const porEstado = lista.filter(e => expedienteVistaEstado === "cerrados" ? e.estado === "Cerrado" : e.estado !== "Cerrado");
  const termino = normalizar(busqueda || "");
  if (!termino) return porEstado;
  return porEstado.filter(e =>
    normalizar(e.numero_ee || "").includes(termino) ||
    normalizar(e.nombre_paciente || "").includes(termino) ||
    normalizar(e.dni_cuit_paciente || "").includes(termino)
  );
}

function formatearFecha(f) {
  if (!f) return "—";
  const [a, m, d] = f.split("-");
  return d && m && a ? `${d}/${m}/${a}` : f;
}

function renderExpedientes() {
  const tbody = document.getElementById("expediente-table-body");
  if (!tbody) return;
  const busqueda = document.getElementById("expediente-search")?.value || "";
  const filtradas = filtrarExpedientes(expedientes, busqueda);

  tbody.innerHTML = filtradas.map(e => `
    <tr class="os-row" data-edit-expediente="${e.id}" tabindex="0" role="button" title="Clic para editar">
      <td class="ellipsis-cell" style="max-width:140px" title="${escaparHtml(e.numero_ee)}"><strong>${escaparHtml(e.numero_ee)}</strong></td>
      <td class="ellipsis-cell" style="max-width:130px" title="${escaparHtml(e.nombre_paciente || "")}">${escaparHtml(e.nombre_paciente || "—")}</td>
      <td class="ellipsis-cell" style="max-width:150px" title="${escaparHtml(e.patologias?.nombre || "")}">${escaparHtml(e.patologias?.nombre || "—")}</td>
      <td class="ellipsis-cell" style="max-width:170px" title="${escaparHtml(etiquetaObraSocial(e.obra_social_id) || "")}">${escaparHtml(etiquetaObraSocial(e.obra_social_id) || "—")}</td>
      <td>${escaparHtml(e.estado || "—")}</td>
      <td class="date-cell">${formatearFecha(e.fecha_ingreso)}</td>
      <td class="date-cell">${formatearFecha(e.fecha_limite)}</td>
    </tr>
  `).join("");

  const count = document.getElementById("expediente-count");
  if (count) count.textContent = `${filtradas.length} expediente${filtradas.length === 1 ? "" : "s"}`;
  const empty = document.getElementById("expediente-empty");
  if (empty) empty.hidden = filtradas.length !== 0;

  document.querySelectorAll(".os-row[data-edit-expediente]").forEach(row => {
    const editar = () => requiereAutenticacion(() => abrirModalEdicionExpediente(row.dataset.editExpediente));
    row.addEventListener("click", editar);
    row.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editar(); }
    });
  });
}

function poblarSelectPatologiasExpediente() {
  const select = document.getElementById("expediente-patologia");
  if (!select) return;
  const actual = select.value;
  select.innerHTML = `<option value="">Elegir patología...</option>` + patologias.map(p => `<option value="${p.id}">${escaparHtml(p.nombre)}</option>`).join("");
  select.value = actual;
}

function poblarSelectPlantillasExpediente() {
  const select = document.getElementById("expediente-plantilla");
  if (!select) return;
  const actual = select.value;
  select.innerHTML = `<option value="">Elegir plantilla...</option>` + plantillas.map(p => `<option value="${p.id}">${escaparHtml(p.nombre)}</option>`).join("");
  select.value = actual;
}

function poblarSelectDrogasExpediente() {
  const select = document.getElementById("expediente-droga-select");
  if (!select) return;
  select.innerHTML = `<option value="">Elegir droga...</option>` + drogas.map(d => `<option value="${d.id}">${escaparHtml(d.nombre)}</option>`).join("");
  poblarSelectMarcasParaDroga();
}

function poblarSelectMarcasParaDroga() {
  const drogaId = document.getElementById("expediente-droga-select")?.value;
  const select = document.getElementById("expediente-marca-select");
  if (!select) return;
  const droga = drogas.find(d => String(d.id) === String(drogaId));
  const marcas = droga?.marcas_comerciales || [];
  select.innerHTML = `<option value="">Marca (opcional)...</option>` + marcas.map(m => `<option value="${m.id}">${escaparHtml(m.nombre_comercial)}</option>`).join("");
}

function renderDrogasExpedienteSubform() {
  const cont = document.getElementById("expediente-drogas-list");
  if (!cont) return;
  cont.innerHTML = modalDrogasExpediente.map((item, i) => {
    const droga = drogas.find(d => String(d.id) === String(item.droga_id));
    const marca = (droga?.marcas_comerciales || []).find(m => String(m.id) === String(item.marca_id));
    const detalle = [marca?.nombre_comercial, item.dosis ? `Dosis: ${item.dosis}` : null].filter(Boolean).join(" · ");
    return `
    <div class="subform-item subform-item-compact" title="${escaparHtml(droga ? droga.nombre : "")}${detalle ? " — " + escaparHtml(detalle) : ""}">
      <div class="subform-item-text"><strong>${escaparHtml(droga ? droga.nombre : "(droga)")}</strong>${detalle ? ` — ${escaparHtml(detalle)}` : ""}</div>
      <button type="button" class="subform-item-remove" data-quitar-droga-exp="${i}" aria-label="Quitar">×</button>
    </div>`;
  }).join("") || `<p style="color:var(--muted);font-size:13px;margin:0">Sin drogas cargadas.</p>`;

  cont.querySelectorAll("[data-quitar-droga-exp]").forEach(btn => {
    btn.addEventListener("click", () => {
      modalDrogasExpediente.splice(Number(btn.dataset.quitarDrogaExp), 1);
      renderDrogasExpedienteSubform();
    });
  });
}

function agregarDrogaTemporalExpediente() {
  const drogaId = document.getElementById("expediente-droga-select")?.value;
  if (!drogaId) return;
  const marcaId = document.getElementById("expediente-marca-select")?.value || null;
  const dosis = document.getElementById("expediente-dosis-input")?.value.trim() || null;
  modalDrogasExpediente.push({ droga_id: drogaId, marca_id: marcaId, dosis });
  document.getElementById("expediente-dosis-input").value = "";
  renderDrogasExpedienteSubform();
}

function actualizarVisibilidadDenunciante() {
  const esDenunciante = document.getElementById("expediente-es-denunciante")?.checked;
  document.getElementById("expediente-denunciante-nombre-wrap")?.toggleAttribute("hidden", esDenunciante);
  document.getElementById("expediente-denunciante-dni-wrap")?.toggleAttribute("hidden", esDenunciante);
}

function resetFormularioExpediente() {
  document.getElementById("expediente-form")?.reset();
  document.getElementById("expediente-id").value = "";
  document.getElementById("expediente-pasos").innerHTML = "";
  document.getElementById("expediente-eliminar")?.setAttribute("hidden", "");
  document.getElementById("expediente-informe-actions")?.setAttribute("hidden", "");
  document.getElementById("expediente-informe-hint")?.removeAttribute("hidden");
  document.getElementById("expediente-informes-historial").innerHTML = "";
  document.getElementById("expediente-adjuntos-add")?.setAttribute("hidden", "");
  document.getElementById("expediente-adjuntos-hint")?.removeAttribute("hidden");
  document.getElementById("expediente-adjuntos-list").innerHTML = "";
  document.getElementById("expediente-os-input").value = "";
  document.getElementById("expediente-os-input").dataset.selectedId = "";
  poblarSelectFiliales("");
  modalDrogasExpediente = [];
  modalDrogasExpedienteOriginales = [];
  poblarSelectPatologiasExpediente();
  poblarSelectPlantillasExpediente();
  poblarSelectDrogasExpediente();
  poblarDatalistObrasSociales();
  renderDrogasExpedienteSubform();
  document.getElementById("expediente-es-denunciante").checked = true;
  actualizarVisibilidadDenunciante();
  setFormMessage("expediente-form-message");
  // Solo la sección "Expediente" abierta por defecto.
  document.querySelectorAll("#expediente-form .form-section").forEach(sec => {
    sec.classList.toggle("collapsed", sec.dataset.section !== "expediente");
  });
}

async function abrirModalNuevoExpediente() {
  await asegurarCatalogosExpedienteCargados();
  resetFormularioExpediente();
  document.getElementById("expediente-modal-title").textContent = "Nuevo expediente";
  abrirModal("expediente-modal");
  setTimeout(() => document.getElementById("expediente-numero-ee")?.focus(), 0);
}

async function abrirModalEdicionExpediente(id) {
  await asegurarCatalogosExpedienteCargados();
  const e = expedientes.find(item => String(item.id) === String(id));
  if (!e) return;
  resetFormularioExpediente();

  document.getElementById("expediente-id").value = e.id;
  document.getElementById("expediente-numero-ee").value = e.numero_ee || "";
  document.getElementById("expediente-estado").value = e.estado || "Abierto";
  document.getElementById("expediente-fecha-ingreso").value = e.fecha_ingreso || "";
  document.getElementById("expediente-fecha-limite").value = e.fecha_limite || "";
  document.getElementById("expediente-fecha-cierre").value = e.fecha_cierre || "";
  document.getElementById("expediente-nombre-paciente").value = e.nombre_paciente || "";
  document.getElementById("expediente-dni-paciente").value = e.dni_cuit_paciente || "";
  document.getElementById("expediente-telefono-paciente").value = e.telefono_paciente || "";
  document.getElementById("expediente-email-paciente").value = e.email_paciente || "";
  const esDenunciante = !e.denunciante_nombre && !e.denunciante_dni_cuit;
  document.getElementById("expediente-es-denunciante").checked = esDenunciante;
  document.getElementById("expediente-denunciante-nombre").value = e.denunciante_nombre || "";
  document.getElementById("expediente-denunciante-dni").value = e.denunciante_dni_cuit || "";
  actualizarVisibilidadDenunciante();

  const osInput = document.getElementById("expediente-os-input");
  osInput.value = etiquetaObraSocial(e.obra_social_id);
  osInput.dataset.selectedId = e.obra_social_id || "";
  await poblarSelectFiliales(e.obra_social_id, e.filial_id);

  document.getElementById("expediente-patologia").value = e.patologia_id || "";
  document.getElementById("expediente-motivo").value = e.motivo_denuncia || "";
  document.getElementById("expediente-diagnostico").value = e.diagnostico_detalle || "";
  document.getElementById("expediente-resumen-hc").value = e.resumen_hc || "";
  document.getElementById("expediente-plantilla").value = e.plantilla_id || "";
  document.getElementById("expediente-pasos").innerHTML = e.pasos_resolucion || "";

  modalDrogasExpediente = (e.expediente_medicamentos || []).map(m => ({ id: m.id, droga_id: m.droga_id, marca_id: m.marca_id, dosis: m.dosis }));
  modalDrogasExpedienteOriginales = modalDrogasExpediente.map(m => m.id);
  renderDrogasExpedienteSubform();

  document.getElementById("expediente-eliminar")?.removeAttribute("hidden");
  document.getElementById("expediente-informe-actions")?.removeAttribute("hidden");
  document.getElementById("expediente-informe-hint")?.setAttribute("hidden", "");
  actualizarHistorialInformes(e.id);
  document.getElementById("expediente-adjuntos-add")?.removeAttribute("hidden");
  document.getElementById("expediente-adjuntos-hint")?.setAttribute("hidden", "");
  actualizarAdjuntosExpediente(e.id);
  document.getElementById("expediente-modal-title").textContent = "Editar expediente";
  abrirModal("expediente-modal");
}

async function handleExpedienteSubmit(event) {
  event.preventDefault();
  const save = document.getElementById("expediente-save");
  setFormMessage("expediente-form-message");

  const id = document.getElementById("expediente-id")?.value || "";
  const numeroEe = document.getElementById("expediente-numero-ee")?.value.trim() || "";
  const fechaIngreso = document.getElementById("expediente-fecha-ingreso")?.value || "";
  const nombrePaciente = document.getElementById("expediente-nombre-paciente")?.value.trim() || "";
  const diagnostico = document.getElementById("expediente-diagnostico")?.value.trim() || "";
  if (!numeroEe || !fechaIngreso || !nombrePaciente || !diagnostico) {
    setFormMessage("expediente-form-message", "Nº EE, fecha de ingreso, paciente y diagnóstico son obligatorios.");
    return;
  }

  const osInput = document.getElementById("expediente-os-input");
  if (osInput.value && !obrasSocialesTodasPorEtiqueta.has(osInput.value)) {
    setFormMessage("expediente-form-message", "Elegí una Obra Social/EMP de la lista desplegable (no coincide ninguna con lo escrito).");
    return;
  }
  const obraSocialId = osInput.value ? obrasSocialesTodasPorEtiqueta.get(osInput.value) : null;

  const esDenunciante = document.getElementById("expediente-es-denunciante")?.checked;
  const registro = {
    numero_ee: numeroEe,
    estado: document.getElementById("expediente-estado")?.value || "Abierto",
    fecha_ingreso: fechaIngreso,
    fecha_limite: document.getElementById("expediente-fecha-limite")?.value || null,
    fecha_cierre: document.getElementById("expediente-fecha-cierre")?.value || null,
    nombre_paciente: nombrePaciente,
    dni_cuit_paciente: document.getElementById("expediente-dni-paciente")?.value.trim() || null,
    telefono_paciente: document.getElementById("expediente-telefono-paciente")?.value.trim() || null,
    email_paciente: document.getElementById("expediente-email-paciente")?.value.trim() || null,
    denunciante_nombre: esDenunciante ? "" : (document.getElementById("expediente-denunciante-nombre")?.value.trim() || ""),
    denunciante_dni_cuit: esDenunciante ? "" : (document.getElementById("expediente-denunciante-dni")?.value.trim() || ""),
    obra_social_id: obraSocialId,
    patologia_id: document.getElementById("expediente-patologia")?.value || null,
    filial_id: document.getElementById("expediente-filial-select")?.value || null,
    motivo_denuncia: document.getElementById("expediente-motivo")?.value.trim() || null,
    diagnostico_detalle: diagnostico,
    resumen_hc: document.getElementById("expediente-resumen-hc")?.value || null,
    plantilla_id: document.getElementById("expediente-plantilla")?.value || null,
    pasos_resolucion: document.getElementById("expediente-pasos")?.innerHTML || null
  };

  try {
    if (save) save.disabled = true;
    const session = await asegurarSesionVigente();
    const editando = !!id;
    const response = await fetchConTimeout(buildTableUrl("expedientes", editando ? { id: `eq.${id}` } : {}), {
      method: editando ? "PATCH" : "POST",
      headers: { ...authHeaders(session.access_token), Prefer: "return=representation" },
      body: JSON.stringify(registro)
    }, 10000);
    if (!response.ok) {
      const detalle = await leerErrorApi(response);
      throw new Error(/duplicate|unique|23505/i.test(detalle || "") ? "Ya existe un expediente con ese Nº EE." : (detalle || `Supabase respondió ${response.status}.`));
    }
    const filas = await response.json();
    const expedienteId = editando ? id : filas[0]?.id;
    if (!expedienteId) throw new Error("No se pudo obtener el id del expediente guardado.");

    // Sincronizar drogas por diferencia, mismo criterio que en Catálogo de drogas.
    const actualesIds = modalDrogasExpediente.filter(m => m.id).map(m => m.id);
    const aBorrar = modalDrogasExpedienteOriginales.filter(mid => !actualesIds.includes(mid));
    const erroresSync = [];
    for (const mid of aBorrar) {
      const r = await fetchConTimeout(buildTableUrl("expediente_medicamentos", { id: `eq.${mid}` }), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
      if (!r.ok) erroresSync.push((await leerErrorApi(r)) || "No se pudo quitar una droga.");
    }
    for (const m of modalDrogasExpediente) {
      if (m.id) {
        const r = await fetchConTimeout(buildTableUrl("expediente_medicamentos", { id: `eq.${m.id}` }), {
          method: "PATCH", headers: authHeaders(session.access_token),
          body: JSON.stringify({ droga_id: m.droga_id, marca_id: m.marca_id, dosis: m.dosis })
        }, 10000);
        if (!r.ok) erroresSync.push((await leerErrorApi(r)) || "No se pudo actualizar una droga.");
      } else {
        const r = await fetchConTimeout(buildTableUrl("expediente_medicamentos", {}), {
          method: "POST", headers: authHeaders(session.access_token),
          body: JSON.stringify({ expediente_id: expedienteId, droga_id: m.droga_id, marca_id: m.marca_id, dosis: m.dosis })
        }, 10000);
        if (!r.ok) erroresSync.push((await leerErrorApi(r)) || "No se pudo agregar una droga nueva.");
      }
    }

    cerrarModal("expediente-modal");
    mostrarToast(erroresSync.length ? `Expediente guardado, con avisos: ${erroresSync.join(" ")}` : (editando ? "Expediente actualizado." : "Expediente creado."));
    expedientesCargadas = false;
    await cargarYRenderizarExpedientes();
  } catch (error) {
    setFormMessage("expediente-form-message", error.message || "No se pudo guardar el expediente.");
  } finally {
    if (save) save.disabled = false;
  }
}

async function handleEliminarExpediente() {
  const id = document.getElementById("expediente-id")?.value || "";
  if (!id) return;
  if (!confirm("¿Eliminar este expediente? Se van a borrar también sus drogas, informes y adjuntos asociados. Esta acción no se puede deshacer.")) return;
  try {
    const session = await asegurarSesionVigente();
    const response = await fetchConTimeout(buildTableUrl("expedientes", { id: `eq.${id}` }), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
    if (!response.ok) throw new Error((await leerErrorApi(response)) || `Supabase respondió ${response.status}.`);
    cerrarModal("expediente-modal");
    mostrarToast("Expediente eliminado.");
    expedientesCargadas = false;
    await cargarYRenderizarExpedientes();
  } catch (error) {
    setFormMessage("expediente-form-message", error.message || "No se pudo eliminar el expediente.");
  }
}

// ---------- Generación de informes (.docx) ----------

function extraerLineasDesdeHtml(html) {
  if (!html) return [];
  const texto = html
    .replace(/<li[^>]*>/gi, "\u0001LI\u0001")
    .replace(/<\/(li|p|div)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&");
  return texto.split("\n")
    .map(linea => ({
      esVineta: linea.includes("\u0001LI\u0001"),
      texto: linea.replace(/\u0001LI\u0001/g, "").replace(/[ \t]+/g, " ").trim()
    }))
    .filter(l => l.texto);
}

function runsConNegritaAntesDeDosPuntos(texto, size) {
  const { TextRun } = window.docx;
  const m = texto.match(/^([^:]{1,70}):\s*(.+)$/);
  if (m) return [new TextRun({ text: `${m[1]}:`, bold: true, size }), new TextRun({ text: ` ${m[2]}`, size })];
  return [new TextRun({ text: texto, size })];
}

function parrafosDesdeHtml(html, size) {
  const { Paragraph } = window.docx;
  return extraerLineasDesdeHtml(html).map(({ texto, esVineta }) => new Paragraph({
    bullet: esVineta ? { level: 0 } : undefined,
    spacing: { after: 140 },
    children: runsConNegritaAntesDeDosPuntos(texto, size)
  }));
}

function fundamentacionParaExpediente(drogaId, patologiaId) {
  const droga = drogas.find(d => String(d.id) === String(drogaId));
  if (!droga) return "";
  if (droga.es_soporte) return droga.fundamentacion_general || "";
  const fp = (droga.droga_patologia || []).find(item => String(item.patologia_id) === String(patologiaId));
  return fp?.fundamentacion_texto || "";
}

function dataUrlABytes(dataUrl) {
  const base64 = (dataUrl || "").split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function obtenerDimensionesImagen(dataUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || 400, height: img.naturalHeight || 300 });
    img.onerror = () => resolve({ width: 400, height: 300 });
    img.src = dataUrl;
  });
}

// Igual que parrafosDesdeHtml, pero además convierte cada <img> (pegada por el usuario) en una imagen real dentro del Word.
async function parrafosConImagenes(html, size) {
  const { Paragraph, ImageRun } = window.docx;
  if (!html) return [];
  const ANCHO_MAX = 450;
  const contenedor = document.createElement("div");
  contenedor.innerHTML = html;

  const partes = [];
  contenedor.querySelectorAll("img").forEach(img => {
    const marcador = document.createTextNode("\u0002IMG:" + img.getAttribute("src") + "\u0002");
    img.replaceWith(marcador);
  });
  const textoConMarcadores = contenedor.innerHTML
    .replace(/<\/(p|div|li|br)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ");

  const trozos = textoConMarcadores.split(/\u0002/);
  for (const trozo of trozos) {
    if (trozo.startsWith("IMG:")) {
      const src = trozo.slice(4);
      if (src.startsWith("data:image")) {
        try {
          const dims = await obtenerDimensionesImagen(src);
          const escala = Math.min(1, ANCHO_MAX / dims.width);
          partes.push(new Paragraph({
            spacing: { after: 200 },
            children: [new ImageRun({ data: dataUrlABytes(src), transformation: { width: Math.round(dims.width * escala), height: Math.round(dims.height * escala) } })]
          }));
        } catch (error) { console.error("No se pudo incluir una imagen en el informe:", error); }
      }
    } else {
      trozo.split("\n").map(l => l.trim()).filter(Boolean).forEach(linea => {
        partes.push(new Paragraph({ spacing: { after: 140 }, children: runsConNegritaAntesDeDosPuntos(linea, size) }));
      });
    }
  }
  return partes;
}

async function generarInformeDocx(expediente, tipo) {
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = window.docx;
  const plantilla = plantillas.find(p => String(p.id) === String(expediente.plantilla_id));
  const patologiaNombre = expediente.patologias?.nombre || patologias.find(p => String(p.id) === String(expediente.patologia_id))?.nombre || "—";
  const osEtiqueta = etiquetaObraSocial(expediente.obra_social_id) || "—";
  const medicamentos = expediente.expediente_medicamentos || [];
  const P = 24; // 12pt

  const parrafos = [];
  parrafos.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: `INFORME TÉCNICO — ${tipo}`, bold: true, size: 28 })] }));
  parrafos.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Expediente Nº ${expediente.numero_ee}`, bold: true, size: P })] }));
  parrafos.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Paciente: ", bold: true, size: P }), new TextRun({ text: expediente.nombre_paciente || "", size: P })] }));
  if (expediente.dni_cuit_paciente) parrafos.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "DNI / CUIT: ", bold: true, size: P }), new TextRun({ text: expediente.dni_cuit_paciente, size: P })] }));
  parrafos.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Obra Social / EMP: ", bold: true, size: P }), new TextRun({ text: osEtiqueta, size: P })] }));
  parrafos.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Patología: ", bold: true, size: P }), new TextRun({ text: patologiaNombre, size: P })] }));
  parrafos.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Diagnóstico: ", bold: true, size: P }), new TextRun({ text: expediente.diagnostico_detalle || "", size: P })] }));

  if (plantilla?.texto_apertura) {
    parrafos.push(...parrafosDesdeHtml(plantilla.texto_apertura, P));
  }

  parrafos.push(new Paragraph({ spacing: { after: 140 }, keepNext: true, children: [new TextRun({ text: "Medicación solicitada:", bold: true, size: P })] }));
  medicamentos.forEach((m, i) => {
    const droga = drogas.find(d => String(d.id) === String(m.droga_id));
    const marca = (droga?.marcas_comerciales || []).find(mc => String(mc.id) === String(m.marca_id));
    const encabezado = medicamentos.length > 1 ? `${i + 1}) ${droga?.nombre || ""}` : (droga?.nombre || "");
    parrafos.push(new Paragraph({ spacing: { after: 60 }, keepNext: true, children: [new TextRun({ text: encabezado, bold: true, size: P })] }));
    if (marca) {
      parrafos.push(new Paragraph({ spacing: { after: 60 }, keepNext: true, children: runsConNegritaAntesDeDosPuntos(`Marca comercial: ${marca.nombre_comercial}`, P) }));
      if (marca.numero_anmat) parrafos.push(new Paragraph({ spacing: { after: 60 }, keepNext: true, children: runsConNegritaAntesDeDosPuntos(`Certificado ANMAT: Nº ${marca.numero_anmat}`, P) }));
    }
    if (m.dosis) parrafos.push(new Paragraph({ spacing: { after: 60 }, keepNext: true, children: runsConNegritaAntesDeDosPuntos(`Dosis: ${m.dosis}`, P) }));
    parrafos.push(...parrafosDesdeHtml(fundamentacionParaExpediente(m.droga_id, expediente.patologia_id), P));
  });

  if (plantilla?.texto_cierre_tecnico) {
    parrafos.push(...parrafosDesdeHtml(plantilla.texto_cierre_tecnico, P));
  }

  if (expediente.pasos_resolucion && expediente.pasos_resolucion.trim()) {
    parrafos.push(new Paragraph({ spacing: { before: 100, after: 140 }, keepNext: true, children: [new TextRun({ text: "Pasos de resolución / seguimiento:", bold: true, size: P })] }));
    parrafos.push(...(await parrafosConImagenes(expediente.pasos_resolucion, P)));
  }

  const cierre = tipo === "IFSOL"
    ? "En virtud de lo expuesto, y habiéndose podido garantizar la cobertura de la medicación solicitada conforme a la normativa vigente, esta área técnica considera que corresponde su otorgamiento."
    : "En virtud de lo expuesto, y no habiéndose podido garantizar la cobertura de la medicación solicitada conforme a la normativa vigente, esta área técnica recomienda continuar con las gestiones pertinentes ante el Agente del Seguro de Salud.";
  parrafos.push(new Paragraph({ children: [new TextRun({ text: cierre, bold: true, underline: {}, size: P })] }));

  const doc = new Document({
    sections: [{ properties: {}, children: parrafos }],
    styles: { default: { document: { run: { font: "Calibri", size: P } } } } }
  );
  return Packer.toBlob(doc);
}

function descargarBlob(blob, nombreArchivo) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function subirInformeYRegistrar(expedienteId, tipo, blob, session) {
  const nombreArchivo = `${tipo}_${Date.now()}.docx`;
  const path = `informes/${expedienteId}/${nombreArchivo}`;
  const uploadResp = await fetch(`${SUPABASE_URL}/storage/v1/object/adjuntos/${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    },
    body: blob
  });
  if (!uploadResp.ok) throw new Error("El informe se descargó, pero no se pudo guardar en el historial (subida al almacenamiento falló).");
  const archivoUrl = `${SUPABASE_URL}/storage/v1/object/public/adjuntos/${path}`;

  // Solo se conserva el último informe generado de cada tipo (IFSOL/IFDER) por expediente:
  // se borran los anteriores del mismo tipo, tanto de la tabla como del almacenamiento.
  const anterioresResp = await fetch(buildTableUrl("informes", { expediente_id: `eq.${expedienteId}`, tipo: `eq.${tipo}`, select: "id,archivo_url" }), { headers: { Accept: "application/json" } });
  const anteriores = anterioresResp.ok ? await anterioresResp.json() : [];
  for (const anterior of anteriores) {
    await fetch(buildTableUrl("informes", { id: `eq.${anterior.id}` }), { method: "DELETE", headers: authHeaders(session.access_token) });
    const pathAnterior = anterior.archivo_url?.split("/storage/v1/object/public/adjuntos/")[1];
    if (pathAnterior) await fetch(`${SUPABASE_URL}/storage/v1/object/adjuntos/${pathAnterior}`, { method: "DELETE", headers: authHeaders(session.access_token) });
  }

  const insertResp = await fetch(buildTableUrl("informes", {}), {
    method: "POST",
    headers: { ...authHeaders(session.access_token), Prefer: "return=representation" },
    body: JSON.stringify({ expediente_id: expedienteId, tipo, fecha_generacion: new Date().toISOString().slice(0, 10), archivo_url: archivoUrl })
  });
  if (!insertResp.ok) throw new Error("El informe se descargó y se subió, pero no se pudo registrar en el historial.");
  return archivoUrl;
}

async function cargarHistorialInformes(expedienteId) {
  const response = await fetchConTimeout(buildTableUrl("informes", { expediente_id: `eq.${expedienteId}`, select: "id,tipo,fecha_generacion,archivo_url", order: "created_at.desc" }), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 10000);
  if (!response.ok) return [];
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

function renderHistorialInformesList(lista) {
  const cont = document.getElementById("expediente-informes-historial");
  if (!cont) return;
  cont.innerHTML = lista.length
    ? lista.map((i, idx) => `
      <div class="subform-item">
        <div class="subform-item-text"><strong>${escaparHtml(i.tipo)}</strong> — ${formatearFecha(i.fecha_generacion)}</div>
        <button type="button" class="secondary" data-descargar-informe="${idx}" style="padding:4px 10px;border-radius:8px;font-size:12px;white-space:nowrap">Descargar</button>
      </div>`).join("")
    : `<p style="color:var(--muted);font-size:13px;margin:0">Todavía no se generó ningún informe para este expediente.</p>`;

  cont.querySelectorAll("[data-descargar-informe]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const item = lista[Number(btn.dataset.descargarInforme)];
      const original = btn.textContent;
      btn.disabled = true; btn.textContent = "Descargando...";
      try {
        const response = await fetch(item.archivo_url);
        if (!response.ok) throw new Error();
        const blob = await response.blob();
        descargarBlob(blob, `${item.tipo}_${formatearFecha(item.fecha_generacion).replace(/\//g, "-")}.docx`);
      } catch {
        mostrarToast("No se pudo descargar el archivo. Probá abrir el link directamente: " + item.archivo_url);
      } finally {
        btn.disabled = false; btn.textContent = original;
      }
    });
  });
}

async function actualizarHistorialInformes(expedienteId) {
  renderHistorialInformesList(await cargarHistorialInformes(expedienteId));
}

async function handleGenerarInforme(tipo) {
  const id = document.getElementById("expediente-id")?.value || "";
  const expediente = expedientes.find(e => String(e.id) === String(id));
  if (!expediente) { setFormMessage("expediente-form-message", "Guardá el expediente antes de generar el informe."); return; }
  setFormMessage("expediente-form-message");
  try {
    const session = await asegurarSesionVigente();
    const blob = await generarInformeDocx(expediente, tipo);
    descargarBlob(blob, `${tipo}_${expediente.numero_ee}.docx`);
    await subirInformeYRegistrar(id, tipo, blob, session);
    mostrarToast(`Informe ${tipo} generado y descargado.`);
    await actualizarHistorialInformes(id);
  } catch (error) {
    setFormMessage("expediente-form-message", error.message || "No se pudo generar el informe.");
  }
}

// ---------- Generación de mails ----------

function b(texto) { return `<strong>${escaparHtml(texto)}</strong>`; }

function htmlMailObraSocial(expediente, tratamiento) {
  const o = obrasSocialesTodas.find(item => String(item.id) === String(expediente.obra_social_id));
  const codigoLabel = o ? (o.tipo === "Obra Social" ? `RNAS Nº ${o.rnos || "—"}` : `RNEMP Nº ${o.rnemp || "—"}`) : "";
  const nombreEntidad = o ? `${o.denominacion}${o.sigla ? ` (${o.sigla})` : ""}` : "la Obra Social/EMP";
  const medicamentos = expediente.expediente_medicamentos || [];
  const listaDrogas = medicamentos.map(m => {
    const droga = drogas.find(d => String(d.id) === String(m.droga_id));
    const nombre = (droga?.nombre || "").toUpperCase();
    return `- ${b(`${nombre}${m.dosis ? ` ${m.dosis}` : ""}`)}`;
  }).join("\n") || "- (sin drogas cargadas)";
  const email = "urgenciasprestacionales@sssalud.org.ar";

  return `Se envía por vía mail desde el área de Urgencias Prestacionales de la Gerencia de Control Prestacional (GCP) el trámite de resolución urgente.

La misma fue notificada vía formal x TAD a la obra social. Se reitera la misma y se adjunta la denuncia de la beneficiaria afectada con la correspondiente historia clínica e indicaciones médicas.

${b("POR FAVOR ENVIAR respuesta al mail de la SSS:")} ${escaparHtml(email)}

${b("REFERENCIA:")} ${b(nombreEntidad)} ${b(expediente.numero_ee)}.

En atención a la denuncia presentada por el/la Sr./Sra. ${b((expediente.nombre_paciente || "").toUpperCase())} (${b(`CUIL ${expediente.dni_cuit_paciente || "—"}`)}) contra la ${b(nombreEntidad)} (${b(codigoLabel)}), con motivo de ${b(expediente.motivo_denuncia || "—")}, se confiere traslado a la entidad denunciada para que, dentro del plazo de DOS (2) días hábiles contados NOTIFIQUE RESOLUCIÓN DE LA MISMA.

Notifíquese a la ${b(nombreEntidad)} (${b(codigoLabel)}), acompañando copia de la denuncia y de toda la documental respaldatoria correspondiente.

${b("DIAGNÓSTICO:")} ${b((expediente.diagnostico_detalle || "").toUpperCase())}
${tratamiento ? `\n${b(`TRATAMIENTO ${tratamiento.toUpperCase()}`)}\n` : ""}
${b("Medicación Indicada:")}
${listaDrogas}

${b("POR FAVOR ENVIAR respuesta al mail de la SSS:")} ${escaparHtml(email)}
UNA VEZ RESUELTA LA DENUNCIA/RECLAMO.`;
}

function htmlMailAfiliado(expediente) {
  const medicamentos = expediente.expediente_medicamentos || [];
  const listaDrogas = medicamentos.map(m => {
    const droga = drogas.find(d => String(d.id) === String(m.droga_id));
    return `- ${b(`${droga?.nombre || ""}${m.dosis ? ` (Dosis: ${m.dosis})` : ""}`)}`;
  }).join("\n") || "- (sin drogas cargadas)";

  return `Estimado/a ${b(expediente.nombre_paciente || "")},

Para dar continuidad al trámite del expediente ${b(`Nº ${expediente.numero_ee}`)}, referido a la medicación:

${listaDrogas}

Le solicitamos nos brinde la siguiente información:

a) ¿Recibió alguna respuesta de su Obra Social/EMP respecto a la cobertura solicitada?
b) En caso afirmativo, ¿cuál fue la respuesta y en qué fecha la recibió?
c) ¿El tratamiento indicado por su médico tratante continúa vigente?
d) ¿Tuvo alguna internación o cambio relevante en su estado de salud desde la última comunicación?
e) ¿Desea agregar alguna documentación adicional al expediente?

Quedamos a la espera de su respuesta a la brevedad.

Saludos cordiales.`;
}

function abrirModalMail(tipo) {
  const id = document.getElementById("expediente-id")?.value || "";
  const expediente = expedientes.find(e => String(e.id) === String(id));
  if (!expediente) return;

  document.getElementById("mail-modal-title").textContent = tipo === "os" ? "Mail a Obra Social / EMP" : "Mail al afiliado";
  document.getElementById("mail-tratamiento-wrap")?.toggleAttribute("hidden", tipo !== "os");
  const tratamientoInput = document.getElementById("mail-tratamiento-input");
  tratamientoInput.value = "";

  const regenerar = () => {
    const html = tipo === "os"
      ? htmlMailObraSocial(expediente, tratamientoInput.value.trim())
      : htmlMailAfiliado(expediente);
    document.getElementById("mail-texto").innerHTML = html.replace(/\n/g, "<br>");
  };
  regenerar();
  tratamientoInput.oninput = regenerar;
  abrirModal("mail-modal");
}

// ---------- Adjuntos ----------

function esImagen(nombreArchivo) {
  return /\.(png|jpe?g|gif|webp|bmp)$/i.test(nombreArchivo || "");
}

async function cargarAdjuntosExpediente(expedienteId) {
  const response = await fetchConTimeout(buildTableUrl("expediente_adjuntos", { expediente_id: `eq.${expedienteId}`, select: "id,archivo_url,nombre_archivo,descripcion,created_at", order: "created_at.desc" }), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 10000);
  if (!response.ok) return [];
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

function renderAdjuntosList(lista) {
  const cont = document.getElementById("expediente-adjuntos-list");
  if (!cont) return;
  cont.innerHTML = lista.length
    ? lista.map(a => `
      <div class="subform-item">
        ${esImagen(a.nombre_archivo) ? `<img src="${escaparHtml(a.archivo_url)}" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:6px;flex-shrink:0">` : `<div style="width:56px;height:56px;border-radius:6px;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--muted);flex-shrink:0">PDF</div>`}
        <div class="subform-item-text" style="margin-left:4px">
          <strong><a href="${escaparHtml(a.archivo_url)}" target="_blank" rel="noopener" style="color:inherit">${escaparHtml(a.nombre_archivo)}</a></strong>
          ${a.descripcion ? escaparHtml(a.descripcion) : ""}
        </div>
        <button type="button" class="subform-item-remove" data-quitar-adjunto="${a.id}" aria-label="Quitar">×</button>
      </div>`).join("")
    : `<p style="color:var(--muted);font-size:13px;margin:0">Sin adjuntos cargados.</p>`;

  cont.querySelectorAll("[data-quitar-adjunto]").forEach(btn => {
    btn.addEventListener("click", () => handleEliminarAdjunto(btn.dataset.quitarAdjunto));
  });
}

async function actualizarAdjuntosExpediente(expedienteId) {
  renderAdjuntosList(await cargarAdjuntosExpediente(expedienteId));
}

async function handleAgregarAdjunto() {
  const id = document.getElementById("expediente-id")?.value || "";
  if (!id) return;
  const fileInput = document.getElementById("expediente-adjunto-file");
  const file = fileInput?.files?.[0];
  if (!file) { setFormMessage("expediente-form-message", "Elegí un archivo para subir."); return; }
  if (file.size > 10 * 1024 * 1024) { setFormMessage("expediente-form-message", "El archivo no puede superar los 10 MB."); return; }

  const boton = document.getElementById("expediente-adjunto-agregar");
  try {
    if (boton) boton.disabled = true;
    const session = await asegurarSesionVigente();
    const nombreArchivo = `${Date.now()}_${file.name}`;
    const path = `${id}/${nombreArchivo}`;
    const uploadResp = await fetch(`${SUPABASE_URL}/storage/v1/object/adjuntos/${path}`, {
      method: "POST",
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${session.access_token}`, "Content-Type": file.type || "application/octet-stream" },
      body: file
    });
    if (!uploadResp.ok) throw new Error("No se pudo subir el archivo.");
    const archivoUrl = `${SUPABASE_URL}/storage/v1/object/public/adjuntos/${path}`;
    const descripcion = document.getElementById("expediente-adjunto-descripcion")?.value.trim() || null;
    const insertResp = await fetch(buildTableUrl("expediente_adjuntos", {}), {
      method: "POST", headers: { ...authHeaders(session.access_token), Prefer: "return=representation" },
      body: JSON.stringify({ expediente_id: id, archivo_url: archivoUrl, nombre_archivo: file.name, descripcion })
    });
    if (!insertResp.ok) throw new Error("El archivo se subió pero no se pudo registrar.");

    fileInput.value = "";
    document.getElementById("expediente-adjunto-descripcion").value = "";
    mostrarToast("Adjunto subido.");
    await actualizarAdjuntosExpediente(id);
  } catch (error) {
    setFormMessage("expediente-form-message", error.message || "No se pudo subir el adjunto.");
  } finally {
    if (boton) boton.disabled = false;
  }
}

async function handleEliminarAdjunto(adjuntoId) {
  if (!confirm("¿Eliminar este adjunto?")) return;
  const id = document.getElementById("expediente-id")?.value || "";
  try {
    const session = await asegurarSesionVigente();
    const filaResp = await fetchConTimeout(buildTableUrl("expediente_adjuntos", { id: `eq.${adjuntoId}`, select: "archivo_url" }), { method: "GET", headers: { Accept: "application/json" } }, 10000);
    const filas = filaResp.ok ? await filaResp.json() : [];
    const response = await fetchConTimeout(buildTableUrl("expediente_adjuntos", { id: `eq.${adjuntoId}` }), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
    if (!response.ok) throw new Error((await leerErrorApi(response)) || "No se pudo eliminar el adjunto.");
    const url = filas[0]?.archivo_url;
    if (url) {
      const path = url.split("/storage/v1/object/public/adjuntos/")[1];
      if (path) await fetchConTimeout(`${SUPABASE_URL}/storage/v1/object/adjuntos/${path}`, { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
    }
    mostrarToast("Adjunto eliminado.");
    await actualizarAdjuntosExpediente(id);
  } catch (error) {
    setFormMessage("expediente-form-message", error.message || "No se pudo eliminar el adjunto.");
  }
}

// ---------- Preexistencias: Patologías ----------

function buildPxPatologiasUrl(id = null) {
  const params = { select: "id,nombre,caracter,texto_desarrollo,referencias,plantilla_id,created_at", order: "nombre.asc" };
  if (id) params.id = `eq.${id}`;
  return buildTableUrl("preexistencias_patologias", params);
}

async function cargarPxPatologiasDesdeSupabase() {
  const response = await fetchConTimeout(buildPxPatologiasUrl(), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 10000);
  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    throw new Error(`Supabase respondió ${response.status}${detalle ? `: ${detalle}` : ""}`);
  }
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

async function asegurarPxPatologiasCargadas() {
  if (!pxPatologiasCargadas) {
    try { pxPatologias = await cargarPxPatologiasDesdeSupabase(); pxPatologiasCargadas = true; }
    catch (error) { console.error("Error cargando patologías de preexistencias:", error); }
  }
}

async function cargarYRenderizarPxPatologias() {
  const count = document.getElementById("px-patologia-count");
  if (count) count.textContent = "Cargando patologías...";
  try {
    pxPatologias = await cargarPxPatologiasDesdeSupabase();
    pxPatologiasCargadas = true;
    renderPxPatologias();
  } catch (error) {
    if (count) count.textContent = `No se pudieron cargar las patologías.${error?.message ? " " + error.message : ""}`;
    console.error(error);
  }
}

function filtrarPxPatologias(lista, busqueda) {
  const termino = normalizar(busqueda || "");
  if (!termino) return lista;
  return lista.filter(p => normalizar(p.nombre || "").includes(termino));
}

function renderPxPatologias() {
  const tbody = document.getElementById("px-patologia-table-body");
  if (!tbody) return;
  const busqueda = document.getElementById("px-patologia-search")?.value || "";
  const filtradas = filtrarPxPatologias(pxPatologias, busqueda);

  tbody.innerHTML = filtradas.map(p => `
    <tr class="os-row" data-edit-px-patologia="${p.id}" tabindex="0" role="button" title="Clic para editar o eliminar">
      <td><strong>${escaparHtml(p.nombre)}</strong></td>
      <td>${escaparHtml(p.caracter)}</td>
    </tr>
  `).join("");

  const count = document.getElementById("px-patologia-count");
  if (count) count.textContent = `${filtradas.length} patología${filtradas.length === 1 ? "" : "s"}`;
  const empty = document.getElementById("px-patologia-empty");
  if (empty) empty.hidden = filtradas.length !== 0;

  document.querySelectorAll(".os-row[data-edit-px-patologia]").forEach(row => {
    const editar = () => requiereAutenticacion(() => abrirModalEdicionPxPatologia(row.dataset.editPxPatologia));
    row.addEventListener("click", editar);
    row.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editar(); }
    });
  });
}

function poblarSelectPxPlantillasPatologia() {
  const select = document.getElementById("px-patologia-plantilla");
  if (!select) return;
  const actual = select.value;
  select.innerHTML = `<option value="">Sin plantilla por defecto</option>` + pxPlantillas.map(p => `<option value="${p.id}">${escaparHtml(p.nombre)}</option>`).join("");
  select.value = actual;
}

function resetFormularioPxPatologia() {
  document.getElementById("px-patologia-form")?.reset();
  document.getElementById("px-patologia-id").value = "";
  document.getElementById("px-patologia-eliminar")?.setAttribute("hidden", "");
  poblarSelectPxPlantillasPatologia();
  setFormMessage("px-patologia-form-message");
}

async function abrirModalNuevaPxPatologia() {
  await asegurarPxPlantillasCargadas();
  resetFormularioPxPatologia();
  document.getElementById("px-patologia-modal-title").textContent = "Nueva patología";
  abrirModal("px-patologia-modal");
  setTimeout(() => document.getElementById("px-patologia-nombre")?.focus(), 0);
}

async function abrirModalEdicionPxPatologia(id) {
  await asegurarPxPlantillasCargadas();
  const p = pxPatologias.find(item => String(item.id) === String(id));
  if (!p) return;
  resetFormularioPxPatologia();
  document.getElementById("px-patologia-id").value = p.id;
  document.getElementById("px-patologia-nombre").value = p.nombre || "";
  document.getElementById("px-patologia-caracter").value = p.caracter || "CRÓNICO";
  document.getElementById("px-patologia-plantilla").value = p.plantilla_id || "";
  document.getElementById("px-patologia-desarrollo").value = p.texto_desarrollo || "";
  document.getElementById("px-patologia-referencias").value = p.referencias || "";
  document.getElementById("px-patologia-eliminar")?.removeAttribute("hidden");
  document.getElementById("px-patologia-modal-title").textContent = "Editar patología";
  abrirModal("px-patologia-modal");
}

async function handlePxPatologiaSubmit(event) {
  event.preventDefault();
  const save = document.getElementById("px-patologia-save");
  setFormMessage("px-patologia-form-message");

  const id = document.getElementById("px-patologia-id")?.value || "";
  const nombre = document.getElementById("px-patologia-nombre")?.value.trim() || "";
  if (!nombre) { setFormMessage("px-patologia-form-message", "El nombre es obligatorio."); return; }

  const registro = {
    nombre,
    caracter: document.getElementById("px-patologia-caracter")?.value || "CRÓNICO",
    plantilla_id: document.getElementById("px-patologia-plantilla")?.value || null,
    texto_desarrollo: document.getElementById("px-patologia-desarrollo")?.value || "",
    referencias: document.getElementById("px-patologia-referencias")?.value || ""
  };

  try {
    if (save) save.disabled = true;
    const session = await asegurarSesionVigente();
    const editando = !!id;
    const response = await fetchConTimeout(buildPxPatologiasUrl(editando ? id : null), {
      method: editando ? "PATCH" : "POST",
      headers: { ...authHeaders(session.access_token), Prefer: "return=representation" },
      body: JSON.stringify(registro)
    }, 10000);
    if (!response.ok) throw new Error((await leerErrorApi(response)) || `Supabase respondió ${response.status}.`);

    cerrarModal("px-patologia-modal");
    mostrarToast(editando ? "Patología actualizada." : "Patología creada.");
    pxPatologiasCargadas = false;
    await cargarYRenderizarPxPatologias();
  } catch (error) {
    const mensaje = /duplicate|unique|23505/i.test(error.message || "") ? "Ya existe una patología con ese nombre." : (error.message || "No se pudo guardar la patología.");
    setFormMessage("px-patologia-form-message", mensaje);
  } finally {
    if (save) save.disabled = false;
  }
}

async function handleEliminarPxPatologia() {
  const id = document.getElementById("px-patologia-id")?.value || "";
  if (!id) return;
  if (!confirm("¿Eliminar esta patología? Esta acción no se puede deshacer.")) return;
  try {
    const session = await asegurarSesionVigente();
    let response = await fetchConTimeout(buildTableUrl("preexistencias_patologias", { id: `eq.${id}` }), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
    if (!response.ok) {
      const detalle = await leerErrorApi(response);
      if (!/foreign key|23503/i.test(detalle || "")) throw new Error(detalle || `Supabase respondió ${response.status}.`);

      const usadasResp = await fetchConTimeout(buildTableUrl("preexistencias", { patologia_id: `eq.${id}`, select: "id,numero_ex,nombre_afiliado" }), { method: "GET", headers: { Accept: "application/json" } }, 10000);
      const usadas = usadasResp.ok ? await usadasResp.json() : [];
      const detalleUsadas = usadas.map(u => `${u.numero_ex} (${u.nombre_afiliado})`).join("\n");
      if (!usadas.length || !confirm(`Esta patología está en uso en ${usadas.length} preexistencia(s):\n${detalleUsadas}\n\n¿Querés borrarlas también (junto con sus adjuntos e informes) y eliminar la patología?`)) {
        throw new Error("No se pudo eliminar: está usada en una o más preexistencias.");
      }
      for (const u of usadas) {
        await fetchConTimeout(buildTableUrl("preexistencias", { id: `eq.${u.id}` }), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
      }
      response = await fetchConTimeout(buildTableUrl("preexistencias_patologias", { id: `eq.${id}` }), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
      if (!response.ok) throw new Error((await leerErrorApi(response)) || "No se pudo eliminar la patología.");
      preexistenciasCargadas = false;
    }
    cerrarModal("px-patologia-modal");
    mostrarToast("Patología eliminada.");
    pxPatologiasCargadas = false;
    await cargarYRenderizarPxPatologias();
  } catch (error) {
    setFormMessage("px-patologia-form-message", error.message || "No se pudo eliminar la patología.");
  }
}

// ---------- Preexistencias: Plantillas ----------

function buildPxPlantillasUrl(id = null) {
  const params = { select: "id,nombre,texto_legal,created_at", order: "nombre.asc" };
  if (id) params.id = `eq.${id}`;
  return buildTableUrl("preexistencias_plantillas", params);
}

async function cargarPxPlantillasDesdeSupabase() {
  const response = await fetchConTimeout(buildPxPlantillasUrl(), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 10000);
  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    throw new Error(`Supabase respondió ${response.status}${detalle ? `: ${detalle}` : ""}`);
  }
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

async function asegurarPxPlantillasCargadas() {
  if (!pxPlantillasCargadas) {
    try { pxPlantillas = await cargarPxPlantillasDesdeSupabase(); pxPlantillasCargadas = true; }
    catch (error) { console.error("Error cargando plantillas de preexistencias:", error); }
  }
}

async function cargarYRenderizarPxPlantillas() {
  const count = document.getElementById("px-plantilla-count");
  if (count) count.textContent = "Cargando plantillas...";
  try {
    pxPlantillas = await cargarPxPlantillasDesdeSupabase();
    pxPlantillasCargadas = true;
    renderPxPlantillas();
  } catch (error) {
    if (count) count.textContent = `No se pudieron cargar las plantillas.${error?.message ? " " + error.message : ""}`;
    console.error(error);
  }
}

function renderPxPlantillas() {
  const tbody = document.getElementById("px-plantilla-table-body");
  if (!tbody) return;
  tbody.innerHTML = pxPlantillas.map(p => `
    <tr class="os-row" data-edit-px-plantilla="${p.id}" tabindex="0" role="button" title="Clic para editar o eliminar">
      <td><strong>${escaparHtml(p.nombre)}</strong></td>
      <td></td>
    </tr>
  `).join("");

  const count = document.getElementById("px-plantilla-count");
  if (count) count.textContent = `${pxPlantillas.length} plantilla${pxPlantillas.length === 1 ? "" : "s"}`;
  const empty = document.getElementById("px-plantilla-empty");
  if (empty) empty.hidden = pxPlantillas.length !== 0;

  document.querySelectorAll(".os-row[data-edit-px-plantilla]").forEach(row => {
    const editar = () => requiereAutenticacion(() => abrirModalEdicionPxPlantilla(row.dataset.editPxPlantilla));
    row.addEventListener("click", editar);
    row.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editar(); }
    });
  });
}

function resetFormularioPxPlantilla() {
  document.getElementById("px-plantilla-form")?.reset();
  document.getElementById("px-plantilla-id").value = "";
  document.getElementById("px-plantilla-eliminar")?.setAttribute("hidden", "");
  setFormMessage("px-plantilla-form-message");
}

function abrirModalNuevaPxPlantilla() {
  resetFormularioPxPlantilla();
  document.getElementById("px-plantilla-modal-title").textContent = "Nueva plantilla";
  abrirModal("px-plantilla-modal");
  setTimeout(() => document.getElementById("px-plantilla-nombre")?.focus(), 0);
}

function abrirModalEdicionPxPlantilla(id) {
  const p = pxPlantillas.find(item => String(item.id) === String(id));
  if (!p) return;
  resetFormularioPxPlantilla();
  document.getElementById("px-plantilla-id").value = p.id;
  document.getElementById("px-plantilla-nombre").value = p.nombre || "";
  document.getElementById("px-plantilla-texto-legal").value = p.texto_legal || "";
  document.getElementById("px-plantilla-eliminar")?.removeAttribute("hidden");
  document.getElementById("px-plantilla-modal-title").textContent = "Editar plantilla";
  abrirModal("px-plantilla-modal");
}

async function handlePxPlantillaSubmit(event) {
  event.preventDefault();
  const save = document.getElementById("px-plantilla-save");
  setFormMessage("px-plantilla-form-message");

  const id = document.getElementById("px-plantilla-id")?.value || "";
  const nombre = document.getElementById("px-plantilla-nombre")?.value.trim() || "";
  if (!nombre) { setFormMessage("px-plantilla-form-message", "El nombre es obligatorio."); return; }

  const registro = { nombre, texto_legal: document.getElementById("px-plantilla-texto-legal")?.value || "" };

  try {
    if (save) save.disabled = true;
    const session = await asegurarSesionVigente();
    const editando = !!id;
    const response = await fetchConTimeout(buildPxPlantillasUrl(editando ? id : null), {
      method: editando ? "PATCH" : "POST",
      headers: { ...authHeaders(session.access_token), Prefer: "return=representation" },
      body: JSON.stringify(registro)
    }, 10000);
    if (!response.ok) throw new Error((await leerErrorApi(response)) || `Supabase respondió ${response.status}.`);

    cerrarModal("px-plantilla-modal");
    mostrarToast(editando ? "Plantilla actualizada." : "Plantilla creada.");
    pxPlantillasCargadas = false;
    await cargarYRenderizarPxPlantillas();
  } catch (error) {
    const mensaje = /duplicate|unique|23505/i.test(error.message || "") ? "Ya existe una plantilla con ese nombre." : (error.message || "No se pudo guardar la plantilla.");
    setFormMessage("px-plantilla-form-message", mensaje);
  } finally {
    if (save) save.disabled = false;
  }
}

async function handleEliminarPxPlantilla() {
  const id = document.getElementById("px-plantilla-id")?.value || "";
  if (!id) return;
  if (!confirm("¿Eliminar esta plantilla? Esta acción no se puede deshacer.")) return;
  try {
    const session = await asegurarSesionVigente();
    const response = await fetchConTimeout(buildTableUrl("preexistencias_plantillas", { id: `eq.${id}` }), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
    if (!response.ok) {
      const detalle = await leerErrorApi(response);
      throw new Error(/foreign key|23503/i.test(detalle || "") ? "No se puede eliminar: está usada en una o más preexistencias." : (detalle || `Supabase respondió ${response.status}.`));
    }
    cerrarModal("px-plantilla-modal");
    mostrarToast("Plantilla eliminada.");
    pxPlantillasCargadas = false;
    await cargarYRenderizarPxPlantillas();
  } catch (error) {
    setFormMessage("px-plantilla-form-message", error.message || "No se pudo eliminar la plantilla.");
  }
}

// ---------- Preexistencias ----------

let preexistencias = [];
let preexistenciaVistaEstado = "activos";
let preexistenciasCargadas = false;
let empSoloPorEtiqueta = new Map();
let modalProfesionalesPx = [];
let modalProfesionalesPxOriginales = [];

function poblarDatalistEmp() {
  const datalist = document.getElementById("preexistencia-emp-datalist");
  if (!datalist) return;
  empSoloPorEtiqueta = new Map();
  obrasSocialesTodas.filter(o => o.tipo === "Empresa de Medicina Prepaga").forEach(o => {
    const etiqueta = `${o.denominacion}${o.rnemp ? ` (${o.rnemp})` : ""}`;
    empSoloPorEtiqueta.set(etiqueta, o.id);
  });
  datalist.innerHTML = [...empSoloPorEtiqueta.keys()].map(etiqueta => `<option value="${escaparHtml(etiqueta)}"></option>`).join("");
}

function buildPreexistenciasUrl(id = null) {
  const params = {
    select: "id,numero_ex,emp_id,nombre_afiliado,dni_cuit_afiliado,patologia_id,fecha_ingreso,estado," +
      "texto_declaracion_jurada,esquema_propuesto,prestaciones_desestimadas," +
      "preexistencias_patologias(nombre,caracter,texto_desarrollo,referencias)," +
      "preexistencias_profesionales(id,nombre,profesion)," +
      "preexistencias_plantillas(texto_legal)",
    order: "fecha_ingreso.desc"
  };
  if (id) params.id = `eq.${id}`;
  return buildTableUrl("preexistencias", params);
}

async function cargarPreexistenciasDesdeSupabase() {
  const response = await fetchConTimeout(buildPreexistenciasUrl(), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 15000);
  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    throw new Error(`Supabase respondió ${response.status}${detalle ? `: ${detalle}` : ""}`);
  }
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

async function cargarYRenderizarPreexistencias() {
  const count = document.getElementById("preexistencia-count");
  if (count) count.textContent = "Cargando preexistencias...";
  try {
    const [filas] = await Promise.all([cargarPreexistenciasDesdeSupabase(), asegurarObrasSocialesTodasCargadas()]);
    preexistencias = filas;
    preexistenciasCargadas = true;
    renderPreexistencias();
  } catch (error) {
    if (count) count.textContent = `No se pudieron cargar las preexistencias.${error?.message ? " " + error.message : ""}`;
    console.error(error);
  }
}

function filtrarPreexistencias(lista, busqueda) {
  const porEstado = lista.filter(p => preexistenciaVistaEstado === "cerrados" ? p.estado === "Cerrado" : p.estado !== "Cerrado");
  const termino = normalizar(busqueda || "");
  if (!termino) return porEstado;
  return porEstado.filter(p =>
    normalizar(p.numero_ex || "").includes(termino) ||
    normalizar(p.nombre_afiliado || "").includes(termino) ||
    normalizar(p.dni_cuit_afiliado || "").includes(termino)
  );
}

function renderPreexistencias() {
  const tbody = document.getElementById("preexistencia-table-body");
  if (!tbody) return;
  const busqueda = document.getElementById("preexistencia-search")?.value || "";
  const filtradas = filtrarPreexistencias(preexistencias, busqueda);

  tbody.innerHTML = filtradas.map(p => `
    <tr class="os-row" data-edit-preexistencia="${p.id}" tabindex="0" role="button" title="Clic para editar">
      <td class="ellipsis-cell" style="max-width:140px" title="${escaparHtml(p.numero_ex)}"><strong>${escaparHtml(p.numero_ex)}</strong></td>
      <td class="ellipsis-cell" style="max-width:160px" title="${escaparHtml(etiquetaObraSocial(p.emp_id) || "")}">${escaparHtml(etiquetaObraSocial(p.emp_id) || "—")}</td>
      <td class="ellipsis-cell" style="max-width:130px" title="${escaparHtml(p.nombre_afiliado || "")}">${escaparHtml(p.nombre_afiliado || "—")}</td>
      <td class="ellipsis-cell" style="max-width:150px" title="${escaparHtml(p.preexistencias_patologias?.nombre || "")}">${escaparHtml(p.preexistencias_patologias?.nombre || "—")}</td>
      <td>${escaparHtml(p.estado || "—")}</td>
      <td class="date-cell">${formatearFecha(p.fecha_ingreso)}</td>
    </tr>
  `).join("");

  const count = document.getElementById("preexistencia-count");
  if (count) count.textContent = `${filtradas.length} preexistencia${filtradas.length === 1 ? "" : "s"}`;
  const empty = document.getElementById("preexistencia-empty");
  if (empty) empty.hidden = filtradas.length !== 0;

  document.querySelectorAll(".os-row[data-edit-preexistencia]").forEach(row => {
    const editar = () => requiereAutenticacion(() => abrirModalEdicionPreexistencia(row.dataset.editPreexistencia));
    row.addEventListener("click", editar);
    row.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editar(); }
    });
  });
}

function poblarSelectPxPatologias() {
  const select = document.getElementById("preexistencia-patologia");
  if (!select) return;
  const actual = select.value;
  select.innerHTML = `<option value="">Elegir patología...</option>` + pxPatologias.map(p => `<option value="${p.id}">${escaparHtml(p.nombre)}</option>`).join("");
  select.value = actual;
}

function poblarSelectPxPlantillasPreexistencia() {
  const select = document.getElementById("preexistencia-plantilla");
  if (!select) return;
  const actual = select.value;
  select.innerHTML = `<option value="">Elegir plantilla...</option>` + pxPlantillas.map(p => `<option value="${p.id}">${escaparHtml(p.nombre)}</option>`).join("");
  select.value = actual || (pxPlantillas[0]?.id || "");
}

function resetFormularioPreexistencia() {
  document.getElementById("preexistencia-form")?.reset();
  document.getElementById("preexistencia-id").value = "";
  document.getElementById("preexistencia-eliminar")?.setAttribute("hidden", "");
  document.getElementById("preexistencia-emp-input").value = "";
  document.getElementById("preexistencia-emp-input").dataset.selectedId = "";
  modalProfesionalesPx = [];
  modalProfesionalesPxOriginales = [];
  renderProfesionalesPxSubform();
  document.getElementById("preexistencia-fecha-ingreso").value = new Date().toISOString().slice(0, 10);
  poblarSelectPxPatologias();
  poblarSelectPxPlantillasPreexistencia();
  poblarDatalistEmp();
  document.getElementById("preexistencia-informe-actions")?.setAttribute("hidden", "");
  document.getElementById("preexistencia-informe-hint")?.removeAttribute("hidden");
  document.getElementById("preexistencia-informes-historial").innerHTML = "";
  document.getElementById("preexistencia-adjuntos-add")?.setAttribute("hidden", "");
  document.getElementById("preexistencia-adjuntos-hint")?.removeAttribute("hidden");
  document.getElementById("preexistencia-adjuntos-list").innerHTML = "";
  setFormMessage("preexistencia-form-message");
  document.querySelectorAll("#preexistencia-form .form-section").forEach(sec => {
    sec.classList.toggle("collapsed", sec.dataset.section !== "px-datos");
  });
}

async function abrirModalNuevaPreexistencia() {
  await Promise.all([asegurarPxPatologiasCargadas(), asegurarObrasSocialesTodasCargadas(), asegurarPxPlantillasCargadas()]);
  resetFormularioPreexistencia();
  document.getElementById("preexistencia-modal-title").textContent = "Nueva preexistencia";
  abrirModal("preexistencia-modal");
  setTimeout(() => document.getElementById("preexistencia-numero-ex")?.focus(), 0);
}

async function abrirModalEdicionPreexistencia(id) {
  await Promise.all([asegurarPxPatologiasCargadas(), asegurarObrasSocialesTodasCargadas(), asegurarPxPlantillasCargadas()]);
  const p = preexistencias.find(item => String(item.id) === String(id));
  if (!p) return;
  resetFormularioPreexistencia();

  document.getElementById("preexistencia-id").value = p.id;
  document.getElementById("preexistencia-numero-ex").value = p.numero_ex || "";
  document.getElementById("preexistencia-estado").value = p.estado || "Abierto";
  document.getElementById("preexistencia-fecha-ingreso").value = p.fecha_ingreso || "";
  document.getElementById("preexistencia-plantilla").value = p.plantilla_id || "";

  const empInput = document.getElementById("preexistencia-emp-input");
  empInput.value = etiquetaObraSocial(p.emp_id);
  empInput.dataset.selectedId = p.emp_id || "";

  document.getElementById("preexistencia-nombre-afiliado").value = p.nombre_afiliado || "";
  document.getElementById("preexistencia-dni-afiliado").value = p.dni_cuit_afiliado || "";
  document.getElementById("preexistencia-patologia").value = p.patologia_id || "";
  document.getElementById("preexistencia-declaracion").value = p.texto_declaracion_jurada || "";
  modalProfesionalesPx = (p.preexistencias_profesionales || []).map(pr => ({ id: pr.id, nombre: pr.nombre, profesion: pr.profesion }));
  modalProfesionalesPxOriginales = modalProfesionalesPx.map(pr => pr.id);
  renderProfesionalesPxSubform();
  document.getElementById("preexistencia-esquema").value = p.esquema_propuesto || "";
  document.getElementById("preexistencia-desestimadas").value = p.prestaciones_desestimadas || "";

  document.getElementById("preexistencia-eliminar")?.removeAttribute("hidden");
  document.getElementById("preexistencia-informe-actions")?.removeAttribute("hidden");
  document.getElementById("preexistencia-informe-hint")?.setAttribute("hidden", "");
  actualizarHistorialInformesPx(p.id);
  document.getElementById("preexistencia-adjuntos-add")?.removeAttribute("hidden");
  document.getElementById("preexistencia-adjuntos-hint")?.setAttribute("hidden", "");
  actualizarAdjuntosPreexistencia(p.id);

  document.getElementById("preexistencia-modal-title").textContent = "Editar preexistencia";
  abrirModal("preexistencia-modal");
}

async function handlePreexistenciaSubmit(event) {
  event.preventDefault();
  const save = document.getElementById("preexistencia-save");
  setFormMessage("preexistencia-form-message");

  const id = document.getElementById("preexistencia-id")?.value || "";
  const numeroEx = document.getElementById("preexistencia-numero-ex")?.value.trim() || "";
  const fechaIngreso = document.getElementById("preexistencia-fecha-ingreso")?.value || "";
  const nombreAfiliado = document.getElementById("preexistencia-nombre-afiliado")?.value.trim() || "";
  if (!numeroEx || !fechaIngreso || !nombreAfiliado) {
    setFormMessage("preexistencia-form-message", "Nº EX, fecha de ingreso y nombre del afiliado son obligatorios.");
    return;
  }

  const empInput = document.getElementById("preexistencia-emp-input");
  if (empInput.value && !empSoloPorEtiqueta.has(empInput.value)) {
    setFormMessage("preexistencia-form-message", "Elegí una EMP de la lista desplegable (no coincide ninguna con lo escrito).");
    return;
  }
  const empId = empInput.value ? empSoloPorEtiqueta.get(empInput.value) : null;

  const registro = {
    numero_ex: numeroEx,
    estado: document.getElementById("preexistencia-estado")?.value || "Abierto",
    fecha_ingreso: fechaIngreso,
    emp_id: empId,
    nombre_afiliado: nombreAfiliado,
    dni_cuit_afiliado: document.getElementById("preexistencia-dni-afiliado")?.value.trim() || null,
    patologia_id: document.getElementById("preexistencia-patologia")?.value || null,
    plantilla_id: document.getElementById("preexistencia-plantilla")?.value || null,
    texto_declaracion_jurada: document.getElementById("preexistencia-declaracion")?.value || null,
    esquema_propuesto: document.getElementById("preexistencia-esquema")?.value || null,
    prestaciones_desestimadas: document.getElementById("preexistencia-desestimadas")?.value || null
  };

  try {
    if (save) save.disabled = true;
    const session = await asegurarSesionVigente();
    const editando = !!id;
    const response = await fetchConTimeout(buildTableUrl("preexistencias", editando ? { id: `eq.${id}` } : {}), {
      method: editando ? "PATCH" : "POST",
      headers: { ...authHeaders(session.access_token), Prefer: "return=representation" },
      body: JSON.stringify(registro)
    }, 10000);
    if (!response.ok) {
      const detalle = await leerErrorApi(response);
      throw new Error(/duplicate|unique|23505/i.test(detalle || "") ? "Ya existe una preexistencia con ese Nº EX." : (detalle || `Supabase respondió ${response.status}.`));
    }
    const filas = await response.json();
    const preexistenciaId = editando ? id : filas[0]?.id;
    if (!preexistenciaId) throw new Error("No se pudo obtener el id de la preexistencia guardada.");

    // Sincronizar profesionales por diferencia (mismo patrón que marcas comerciales en Catálogo de drogas).
    const actualesIds = modalProfesionalesPx.filter(p => p.id).map(p => p.id);
    const aBorrar = modalProfesionalesPxOriginales.filter(pid => !actualesIds.includes(pid));
    for (const pid of aBorrar) {
      await fetch(buildTableUrl("preexistencias_profesionales", { id: `eq.${pid}` }), { method: "DELETE", headers: authHeaders(session.access_token) });
    }
    for (const p of modalProfesionalesPx) {
      if (p.id) {
        await fetch(buildTableUrl("preexistencias_profesionales", { id: `eq.${p.id}` }), {
          method: "PATCH", headers: authHeaders(session.access_token),
          body: JSON.stringify({ nombre: p.nombre, profesion: p.profesion })
        });
      } else {
        await fetch(buildTableUrl("preexistencias_profesionales", {}), {
          method: "POST", headers: authHeaders(session.access_token),
          body: JSON.stringify({ preexistencia_id: preexistenciaId, nombre: p.nombre, profesion: p.profesion })
        });
      }
    }

    cerrarModal("preexistencia-modal");
    mostrarToast(editando ? "Preexistencia actualizada." : "Preexistencia creada.");
    preexistenciasCargadas = false;
    await cargarYRenderizarPreexistencias();
  } catch (error) {
    setFormMessage("preexistencia-form-message", error.message || "No se pudo guardar la preexistencia.");
  } finally {
    if (save) save.disabled = false;
  }
}

async function handleEliminarPreexistencia() {
  const id = document.getElementById("preexistencia-id")?.value || "";
  if (!id) return;
  if (!confirm("¿Eliminar esta preexistencia? Se van a borrar también sus informes y adjuntos asociados. Esta acción no se puede deshacer.")) return;
  try {
    const session = await asegurarSesionVigente();
    const response = await fetchConTimeout(buildTableUrl("preexistencias", { id: `eq.${id}` }), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
    if (!response.ok) throw new Error((await leerErrorApi(response)) || `Supabase respondió ${response.status}.`);
    cerrarModal("preexistencia-modal");
    mostrarToast("Preexistencia eliminada.");
    preexistenciasCargadas = false;
    await cargarYRenderizarPreexistencias();
  } catch (error) {
    setFormMessage("preexistencia-form-message", error.message || "No se pudo eliminar la preexistencia.");
  }
}

// ---------- Preexistencias: generación del informe INFFC ----------

function parrafosDesdeTexto(texto, size, vineta = false) {
  const { Paragraph } = window.docx;
  return (texto || "").split("\n").map(l => l.trim()).filter(Boolean).map(linea => new Paragraph({
    bullet: vineta ? { level: 0 } : undefined,
    spacing: { after: 140 },
    children: runsConNegritaAntesDeDosPuntos(linea, size)
  }));
}

// Primera línea = párrafo de introducción sin viñeta; el resto de las líneas, todas con viñeta.
function parrafosConIntroYVinetas(texto, size) {
  const { Paragraph } = window.docx;
  const lineas = (texto || "").split("\n").map(l => l.trim()).filter(Boolean);
  return lineas.map((linea, i) => new Paragraph({
    bullet: i === 0 ? undefined : { level: 0 },
    spacing: { after: 140 },
    children: runsConNegritaAntesDeDosPuntos(linea, size)
  }));
}

// Para textos mixtos (párrafos normales + ítems de lista): una línea es viñeta solo si arranca con "- ".
function parrafosConVinetaAutoDetectada(texto, size) {
  const { Paragraph } = window.docx;
  return (texto || "").split("\n").map(l => l.trim()).filter(Boolean).map(linea => {
    const esVineta = linea.startsWith("- ");
    const contenido = esVineta ? linea.slice(2).trim() : linea;
    return new Paragraph({
      bullet: esVineta ? { level: 0 } : undefined,
      spacing: { after: 140 },
      children: runsConNegritaAntesDeDosPuntos(contenido, size)
    });
  });
}

async function generarInformeInffcDocx(px) {
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = window.docx;
  const patologia = px.preexistencias_patologias || pxPatologias.find(p => String(p.id) === String(px.patologia_id));
  const empEtiqueta = etiquetaObraSocial(px.emp_id) || "—";
  const firmante = getSessionIdentity(authSession)?.nombre || "";
  const P = 24;

  const parrafos = [];
  parrafos.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "INFORME TÉCNICO", bold: true, size: 28 })] }));
  parrafos.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: px.numero_ex || "", bold: true, size: P })] }));
  parrafos.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: (empEtiqueta || "").toUpperCase(), bold: true, size: P })] }));
  parrafos.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "REF: ", bold: true, size: P }), new TextRun({ text: (px.nombre_afiliado || "").toUpperCase(), bold: true, size: P })] }));
  parrafos.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "PREEX: ", bold: true, size: P }), new TextRun({ text: (patologia?.nombre || "").toUpperCase(), bold: true, size: P })] }));

  const legal = px.preexistencias_plantillas?.texto_legal || "Según surge de los presentes actuados, y en base a lo determinado en el artículo Nº 10 de la Ley 26.682 y su Decreto Reglamentario 1993 del año 2011, donde se define que la Superintendencia de Servicios de Salud establecerá y determinará las situaciones de preexistencia que podrán ser de carácter temporario, crónico o de alto costo, puede manifestarse lo siguiente:";
  parrafos.push(new Paragraph({ spacing: { after: 140 }, children: [new TextRun({ text: legal, size: P })] }));

  const listaProfesionales = (px.preexistencias_profesionales || []).map(p => `${p.nombre}, ${p.profesion}`).join("; ");
  const declaracionCompleta = [
    listaProfesionales ? `Según consta en Declaración Jurada e Informe Profesional de ${listaProfesionales}, el/la beneficiario/a ${px.nombre_afiliado || ""} presenta ${px.texto_declaracion_jurada || ""}` : (px.texto_declaracion_jurada || "")
  ].join("");
  parrafos.push(...parrafosConVinetaAutoDetectada(declaracionCompleta, P));

  if (patologia) {
    parrafos.push(new Paragraph({ spacing: { after: 200 }, children: [
      new TextRun({ text: `La preexistencia ${patologia.nombre} debe ser considerada como de carácter `, size: P }),
      new TextRun({ text: patologia.caracter || "", bold: true, size: P }),
      new TextRun({ text: ".", size: P })
    ] }));
  }

  parrafos.push(...parrafosConVinetaAutoDetectada(patologia?.texto_desarrollo, P));

  parrafos.push(new Paragraph({ spacing: { after: 140 }, keepNext: true, children: [new TextRun({ text: "Respecto de este caso puntual y basándonos en la documental aportada, esta Gerencia estima razonable considerar que el siguiente esquema podría ajustarse a las necesidades del solicitante:", size: P })] }));
  parrafos.push(...parrafosConIntroYVinetas(px.esquema_propuesto, P));

  parrafos.push(new Paragraph({ spacing: { after: 140 }, keepNext: true, children: [new TextRun({ text: "Cabe señalar, respecto al tratamiento propuesto por la Entidad de Medicina Prepaga, esta Gerencia señala que atento a que no obra en el expediente documentación que avale su indicación actual y por fuera del PMO (Plan Médico Obligatorio), deberán desestimarse las siguientes prestaciones:", size: P })] }));
  parrafos.push(...parrafosDesdeTexto(px.prestaciones_desestimadas, P, true));

  if (firmante) parrafos.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: firmante, bold: true, size: P })] }));

  if (patologia?.referencias) {
    parrafos.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Referencias", italics: true, size: P })] }));
    (patologia.referencias || "").split("\n").map(l => l.trim()).filter(Boolean).forEach(linea => {
      parrafos.push(new Paragraph({ bullet: { level: 0 }, spacing: { after: 100 }, children: [new TextRun({ text: linea, italics: true, size: P })] }));
    });
  }

  const doc = new Document({ sections: [{ properties: {}, children: parrafos }], styles: { default: { document: { run: { font: "Calibri", size: P } } } } });
  return Packer.toBlob(doc);
}

async function subirInformePxYRegistrar(preexistenciaId, blob, session) {
  const nombreArchivo = `INFFC_${Date.now()}.docx`;
  const path = `preexistencias/${preexistenciaId}/${nombreArchivo}`;
  const uploadResp = await fetch(`${SUPABASE_URL}/storage/v1/object/adjuntos/${path}`, {
    method: "POST",
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    body: blob
  });
  if (!uploadResp.ok) throw new Error("El informe se descargó, pero no se pudo guardar en el historial.");
  const archivoUrl = `${SUPABASE_URL}/storage/v1/object/public/adjuntos/${path}`;

  const anterioresResp = await fetch(buildTableUrl("preexistencias_informes", { preexistencia_id: `eq.${preexistenciaId}`, select: "id,archivo_url" }), { headers: { Accept: "application/json" } });
  const anteriores = anterioresResp.ok ? await anterioresResp.json() : [];
  for (const anterior of anteriores) {
    await fetch(buildTableUrl("preexistencias_informes", { id: `eq.${anterior.id}` }), { method: "DELETE", headers: authHeaders(session.access_token) });
    const pathAnterior = anterior.archivo_url?.split("/storage/v1/object/public/adjuntos/")[1];
    if (pathAnterior) await fetch(`${SUPABASE_URL}/storage/v1/object/adjuntos/${pathAnterior}`, { method: "DELETE", headers: authHeaders(session.access_token) });
  }

  const insertResp = await fetch(buildTableUrl("preexistencias_informes", {}), {
    method: "POST",
    headers: { ...authHeaders(session.access_token), Prefer: "return=representation" },
    body: JSON.stringify({ preexistencia_id: preexistenciaId, fecha_generacion: new Date().toISOString().slice(0, 10), generado_por: getSessionIdentity(session)?.nombre || null, archivo_url: archivoUrl })
  });
  if (!insertResp.ok) throw new Error("El informe se descargó y se subió, pero no se pudo registrar en el historial.");
  return archivoUrl;
}

async function cargarHistorialInformesPx(preexistenciaId) {
  const response = await fetchConTimeout(buildTableUrl("preexistencias_informes", { preexistencia_id: `eq.${preexistenciaId}`, select: "id,fecha_generacion,generado_por,archivo_url", order: "created_at.desc" }), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 10000);
  if (!response.ok) return [];
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

function renderHistorialInformesPxList(lista) {
  const cont = document.getElementById("preexistencia-informes-historial");
  if (!cont) return;
  cont.innerHTML = lista.length
    ? lista.map((i, idx) => `
      <div class="subform-item">
        <div class="subform-item-text"><strong>INFFC</strong> — ${formatearFecha(i.fecha_generacion)}${i.generado_por ? ` · ${escaparHtml(i.generado_por)}` : ""}</div>
        <button type="button" class="secondary" data-descargar-informe-px="${idx}" style="padding:4px 10px;border-radius:8px;font-size:12px;white-space:nowrap">Descargar</button>
      </div>`).join("")
    : `<p style="color:var(--muted);font-size:13px;margin:0">Todavía no se generó ningún informe para esta preexistencia.</p>`;

  cont.querySelectorAll("[data-descargar-informe-px]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const item = lista[Number(btn.dataset.descargarInformePx)];
      const original = btn.textContent;
      btn.disabled = true; btn.textContent = "Descargando...";
      try {
        const response = await fetch(item.archivo_url);
        if (!response.ok) throw new Error();
        const blob = await response.blob();
        descargarBlob(blob, `INFFC_${formatearFecha(item.fecha_generacion).replace(/\//g, "-")}.docx`);
      } catch { mostrarToast("No se pudo descargar el archivo."); }
      finally { btn.disabled = false; btn.textContent = original; }
    });
  });
}

async function actualizarHistorialInformesPx(preexistenciaId) {
  renderHistorialInformesPxList(await cargarHistorialInformesPx(preexistenciaId));
}

async function handleGenerarInformeInffc() {
  const id = document.getElementById("preexistencia-id")?.value || "";
  const px = preexistencias.find(item => String(item.id) === String(id));
  if (!px) { setFormMessage("preexistencia-form-message", "Guardá la preexistencia antes de generar el informe."); return; }
  setFormMessage("preexistencia-form-message");
  try {
    const session = await asegurarSesionVigente();
    const blob = await generarInformeInffcDocx(px);
    descargarBlob(blob, `INFFC_${px.numero_ex}.docx`);
    await subirInformePxYRegistrar(id, blob, session);
    mostrarToast("Informe INFFC generado y descargado.");
    await actualizarHistorialInformesPx(id);
  } catch (error) {
    setFormMessage("preexistencia-form-message", error.message || "No se pudo generar el informe.");
  }
}

function renderProfesionalesPxSubform() {
  const cont = document.getElementById("preexistencia-profesionales-list");
  if (!cont) return;
  cont.innerHTML = modalProfesionalesPx.map((p, i) => `
    <div class="subform-item subform-item-compact" title="${escaparHtml(p.nombre)} — ${escaparHtml(p.profesion)}">
      <div class="subform-item-text"><strong>${escaparHtml(p.nombre)}</strong> — ${escaparHtml(p.profesion)}</div>
      <button type="button" class="subform-item-remove" data-quitar-profesional-px="${i}" aria-label="Quitar">×</button>
    </div>
  `).join("") || `<p style="color:var(--muted);font-size:13px;margin:0">Sin profesionales cargados.</p>`;

  cont.querySelectorAll("[data-quitar-profesional-px]").forEach(btn => {
    btn.addEventListener("click", () => {
      modalProfesionalesPx.splice(Number(btn.dataset.quitarProfesionalPx), 1);
      renderProfesionalesPxSubform();
    });
  });
}

function agregarProfesionalPxTemporal() {
  const nombre = document.getElementById("preexistencia-profesional-nombre")?.value.trim();
  const profesion = document.getElementById("preexistencia-profesional-profesion")?.value.trim();
  if (!nombre || !profesion) { setFormMessage("preexistencia-form-message", "Completá nombre y profesión para agregar un profesional."); return; }
  setFormMessage("preexistencia-form-message");
  modalProfesionalesPx.push({ nombre, profesion });
  document.getElementById("preexistencia-profesional-nombre").value = "";
  document.getElementById("preexistencia-profesional-profesion").value = "";
  renderProfesionalesPxSubform();
}

// ---------- Preexistencias: adjuntos ----------

async function cargarAdjuntosPreexistencia(preexistenciaId) {
  const response = await fetchConTimeout(buildTableUrl("preexistencias_adjuntos", { preexistencia_id: `eq.${preexistenciaId}`, select: "id,archivo_url,nombre_archivo,descripcion,created_at", order: "created_at.desc" }), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 10000);
  if (!response.ok) return [];
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

function renderAdjuntosPreexistenciaList(lista) {
  const cont = document.getElementById("preexistencia-adjuntos-list");
  if (!cont) return;
  cont.innerHTML = lista.length
    ? lista.map(a => `
      <div class="subform-item">
        ${esImagen(a.nombre_archivo) ? `<img src="${escaparHtml(a.archivo_url)}" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:6px;flex-shrink:0">` : `<div style="width:56px;height:56px;border-radius:6px;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--muted);flex-shrink:0">PDF</div>`}
        <div class="subform-item-text" style="margin-left:4px">
          <strong><a href="${escaparHtml(a.archivo_url)}" target="_blank" rel="noopener" style="color:inherit">${escaparHtml(a.nombre_archivo)}</a></strong>
          ${a.descripcion ? escaparHtml(a.descripcion) : ""}
        </div>
        <button type="button" class="subform-item-remove" data-quitar-adjunto-px="${a.id}" aria-label="Quitar">×</button>
      </div>`).join("")
    : `<p style="color:var(--muted);font-size:13px;margin:0">Sin adjuntos cargados.</p>`;

  cont.querySelectorAll("[data-quitar-adjunto-px]").forEach(btn => {
    btn.addEventListener("click", () => handleEliminarAdjuntoPx(btn.dataset.quitarAdjuntoPx));
  });
}

async function actualizarAdjuntosPreexistencia(preexistenciaId) {
  renderAdjuntosPreexistenciaList(await cargarAdjuntosPreexistencia(preexistenciaId));
}

async function handleAgregarAdjuntoPx() {
  const id = document.getElementById("preexistencia-id")?.value || "";
  if (!id) return;
  const fileInput = document.getElementById("preexistencia-adjunto-file");
  const file = fileInput?.files?.[0];
  if (!file) { setFormMessage("preexistencia-form-message", "Elegí un archivo para subir."); return; }
  if (file.size > 10 * 1024 * 1024) { setFormMessage("preexistencia-form-message", "El archivo no puede superar los 10 MB."); return; }

  const boton = document.getElementById("preexistencia-adjunto-agregar");
  try {
    if (boton) boton.disabled = true;
    const session = await asegurarSesionVigente();
    const nombreArchivo = `${Date.now()}_${file.name}`;
    const path = `preexistencias/${id}/${nombreArchivo}`;
    const uploadResp = await fetch(`${SUPABASE_URL}/storage/v1/object/adjuntos/${path}`, {
      method: "POST",
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${session.access_token}`, "Content-Type": file.type || "application/octet-stream" },
      body: file
    });
    if (!uploadResp.ok) throw new Error("No se pudo subir el archivo.");
    const archivoUrl = `${SUPABASE_URL}/storage/v1/object/public/adjuntos/${path}`;
    const descripcion = document.getElementById("preexistencia-adjunto-descripcion")?.value.trim() || null;
    const insertResp = await fetch(buildTableUrl("preexistencias_adjuntos", {}), {
      method: "POST", headers: { ...authHeaders(session.access_token), Prefer: "return=representation" },
      body: JSON.stringify({ preexistencia_id: id, archivo_url: archivoUrl, nombre_archivo: file.name, descripcion })
    });
    if (!insertResp.ok) throw new Error("El archivo se subió pero no se pudo registrar.");

    fileInput.value = "";
    document.getElementById("preexistencia-adjunto-descripcion").value = "";
    mostrarToast("Adjunto subido.");
    await actualizarAdjuntosPreexistencia(id);
  } catch (error) {
    setFormMessage("preexistencia-form-message", error.message || "No se pudo subir el adjunto.");
  } finally {
    if (boton) boton.disabled = false;
  }
}

async function handleEliminarAdjuntoPx(adjuntoId) {
  if (!confirm("¿Eliminar este adjunto?")) return;
  const id = document.getElementById("preexistencia-id")?.value || "";
  try {
    const session = await asegurarSesionVigente();
    const filaResp = await fetchConTimeout(buildTableUrl("preexistencias_adjuntos", { id: `eq.${adjuntoId}`, select: "archivo_url" }), { method: "GET", headers: { Accept: "application/json" } }, 10000);
    const filas = filaResp.ok ? await filaResp.json() : [];
    const response = await fetchConTimeout(buildTableUrl("preexistencias_adjuntos", { id: `eq.${adjuntoId}` }), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
    if (!response.ok) throw new Error((await leerErrorApi(response)) || "No se pudo eliminar el adjunto.");
    const url = filas[0]?.archivo_url;
    if (url) {
      const path = url.split("/storage/v1/object/public/adjuntos/")[1];
      if (path) await fetchConTimeout(`${SUPABASE_URL}/storage/v1/object/adjuntos/${path}`, { method: "DELETE", headers: authHeaders(session.access_token) }, 10000);
    }
    mostrarToast("Adjunto eliminado.");
    await actualizarAdjuntosPreexistencia(id);
  } catch (error) {
    setFormMessage("preexistencia-form-message", error.message || "No se pudo eliminar el adjunto.");
  }
}

// ---------- Preexistencias: reporte EMP ----------

let pxEmpReporte = [];
let pxEmpReporteCargado = false;
let pxReporteModo = "emp";
let pxReporteDrill = null;

async function cargarYRenderizarPxEmp() {
  const count = document.getElementById("px-emp-count");
  if (count) count.textContent = "Cargando...";
  try {
    const params = { select: "emp_id,obras_sociales(denominacion,rnemp),preexistencias_patologias(nombre)" };
    const response = await fetchConTimeout(buildTableUrl("preexistencias", params), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 15000);
    if (!response.ok) throw new Error((await leerErrorApi(response)) || `Supabase respondió ${response.status}.`);
    const filas = await response.json();

    const agrupado = new Map();
    filas.forEach(f => {
      const empNombre = f.obras_sociales ? `${f.obras_sociales.denominacion}${f.obras_sociales.rnemp ? ` (${f.obras_sociales.rnemp})` : ""}` : "(sin EMP asignada)";
      const patologiaNombre = f.preexistencias_patologias?.nombre || "(sin patología asignada)";
      const clave = `${empNombre}\u0001${patologiaNombre}`;
      agrupado.set(clave, (agrupado.get(clave) || 0) + 1);
    });

    pxEmpReporte = [...agrupado.entries()]
      .map(([clave, cantidad]) => {
        const [emp, patologia] = clave.split("\u0001");
        return { emp, patologia, cantidad };
      })
      .sort((a, b) => a.emp.localeCompare(b.emp) || a.patologia.localeCompare(b.patologia));

    pxEmpReporteCargado = true;
    renderPxEmp();
  } catch (error) {
    if (count) count.textContent = `No se pudo cargar el reporte.${error?.message ? " " + error.message : ""}`;
    console.error(error);
  }
}

function renderPxEmp() {
  const thead = document.getElementById("px-emp-thead");
  const tbody = document.getElementById("px-emp-table-body");
  const count = document.getElementById("px-emp-count");
  const empty = document.getElementById("px-emp-empty");
  const breadcrumb = document.getElementById("px-reporte-breadcrumb");
  const drillTitulo = document.getElementById("px-reporte-drill-titulo");
  if (!thead || !tbody) return;

  const campoAgrupador = pxReporteModo === "emp" ? "emp" : "patologia";
  const campoDetalle = pxReporteModo === "emp" ? "patologia" : "emp";
  const etiquetaColumna = pxReporteModo === "emp" ? "EMP" : "Patología";
  const etiquetaDetalle = pxReporteModo === "emp" ? "Patología" : "EMP";

  if (pxReporteDrill) {
    breadcrumb?.removeAttribute("hidden");
    if (drillTitulo) drillTitulo.textContent = pxReporteDrill;
    const filas = pxEmpReporte.filter(f => f[campoAgrupador] === pxReporteDrill)
      .map(f => ({ clave: f[campoDetalle], cantidad: f.cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad || a.clave.localeCompare(b.clave));

    thead.innerHTML = `<tr><th>${etiquetaDetalle}</th><th>Cantidad de preexistencias</th></tr>`;
    tbody.innerHTML = filas.map(f => `
      <tr><td class="ellipsis-cell" style="max-width:320px" title="${escaparHtml(f.clave)}">${escaparHtml(f.clave)}</td><td><strong>${f.cantidad}</strong></td></tr>
    `).join("");
    if (count) count.textContent = `${filas.length} ${etiquetaDetalle.toLowerCase()}${filas.length === 1 ? "" : "s"} para ${pxReporteDrill}`;
    if (empty) empty.hidden = filas.length !== 0;
    renderBarChart("px-reporte-chart", filas.map(f => ({ etiqueta: f.clave, valor: f.cantidad })));
  } else {
    breadcrumb?.setAttribute("hidden", "");
    const agrupado = agruparUpReportesPor(pxEmpReporte, campoAgrupador);

    thead.innerHTML = `<tr><th>${etiquetaColumna}</th><th>Cantidad de preexistencias</th></tr>`;
    tbody.innerHTML = agrupado.map(f => `
      <tr class="os-row" data-drill-px-reporte="${escaparHtml(f.clave)}" tabindex="0" role="button" title="Clic para ver el detalle por ${etiquetaDetalle.toLowerCase()}">
        <td class="ellipsis-cell" style="max-width:320px" title="${escaparHtml(f.clave)}">${escaparHtml(f.clave)}</td><td><strong>${f.cantidad}</strong></td>
      </tr>
    `).join("");
    if (count) count.textContent = `${agrupado.length} ${etiquetaColumna.toLowerCase()}${agrupado.length === 1 ? "" : "s"}`;
    if (empty) empty.hidden = agrupado.length !== 0;
    renderBarChart("px-reporte-chart", agrupado.map(f => ({ etiqueta: f.clave, valor: f.cantidad })));

    tbody.querySelectorAll("[data-drill-px-reporte]").forEach(row => {
      const drill = () => { pxReporteDrill = row.dataset.drillPxReporte; renderPxEmp(); };
      row.addEventListener("click", drill);
      row.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); drill(); } });
    });
  }
}

function exportarPxReporteExcel() {
  const filas = [...document.querySelectorAll("#px-emp-table-body tr")].map(tr => [...tr.children].map(td => td.textContent.trim()));
  const encabezado = [...document.querySelectorAll("#px-emp-thead th")].map(th => th.textContent.trim());
  const hoja = window.XLSX.utils.aoa_to_sheet([encabezado, ...filas]);
  const libro = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(libro, hoja, "Reporte");
  const nombre = pxReporteDrill ? `reporte_${pxReporteDrill}` : `reporte_preexistencias_${pxReporteModo}`;
  window.XLSX.writeFile(libro, `${nombre.replace(/[^\w-]+/g, "_").slice(0, 60)}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function exportarPxReportePdf() {
  window.print();
}


// ---------- Urgencias Prestacionales: reporte por Obra Social/EMP y patología ----------

let upReportes = [];
let upReportesCargado = false;
let upReporteModo = "os";
let upReporteDrill = null;

async function cargarYRenderizarUpReportes() {
  const count = document.getElementById("up-reportes-count");
  if (count) count.textContent = "Cargando...";
  try {
    const params = { select: "obra_social_id,obras_sociales(denominacion,tipo,rnos,rnemp),patologias(nombre)" };
    const response = await fetchConTimeout(buildTableUrl("expedientes", params), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 15000);
    if (!response.ok) throw new Error((await leerErrorApi(response)) || `Supabase respondió ${response.status}.`);
    const filas = await response.json();

    const agrupado = new Map();
    filas.forEach(f => {
      let osNombre = "(sin Obra Social/EMP asignada)";
      if (f.obras_sociales) {
        const codigo = f.obras_sociales.tipo === "Obra Social" ? f.obras_sociales.rnos : f.obras_sociales.rnemp;
        osNombre = `${f.obras_sociales.denominacion}${codigo ? ` (${codigo})` : ""}`;
      }
      const patologiaNombre = f.patologias?.nombre || "(sin patología asignada)";
      const clave = `${osNombre}\u0001${patologiaNombre}`;
      agrupado.set(clave, (agrupado.get(clave) || 0) + 1);
    });

    upReportes = [...agrupado.entries()]
      .map(([clave, cantidad]) => {
        const [os, patologia] = clave.split("\u0001");
        return { os, patologia, cantidad };
      })
      .sort((a, b) => a.os.localeCompare(b.os) || a.patologia.localeCompare(b.patologia));

    upReportesCargado = true;
    renderUpReportes();
  } catch (error) {
    if (count) count.textContent = `No se pudo cargar el reporte.${error?.message ? " " + error.message : ""}`;
    console.error(error);
  }
}

function colorSegunCantidad(ratio) {
  // Verde (valores bajos) -> amarillo -> naranja -> rojo (valores altos), como un semáforo.
  const hue = Math.round(130 - ratio * 130); // 130° verde -> 0° rojo
  return `hsl(${hue}, 65%, 45%)`;
}

function renderBarChart(containerId, items) {
  const cont = document.getElementById(containerId);
  if (!cont) return;
  const top = items.slice(0, 12);
  const max = Math.max(1, ...top.map(i => i.valor));
  cont.innerHTML = top.map(i => `
    <div class="report-chart-row">
      <div class="report-chart-label" title="${escaparHtml(i.etiqueta)}">${escaparHtml(i.etiqueta)}</div>
      <div class="report-chart-bar-track"><div class="report-chart-bar-fill" style="width:${Math.round((i.valor / max) * 100)}%;background:${colorSegunCantidad(i.valor / max)}"></div></div>
      <div class="report-chart-value">${i.valor}</div>
    </div>
  `).join("") || `<p style="color:var(--muted);font-size:13px;margin:0">Sin datos para graficar.</p>`;
}

function agruparUpReportesPor(lista, campo) {
  const mapa = new Map();
  lista.forEach(f => mapa.set(f[campo], (mapa.get(f[campo]) || 0) + f.cantidad));
  return [...mapa.entries()].map(([clave, cantidad]) => ({ clave, cantidad })).sort((a, b) => b.cantidad - a.cantidad || a.clave.localeCompare(b.clave));
}

function renderUpReportes() {
  const thead = document.getElementById("up-reportes-thead");
  const tbody = document.getElementById("up-reportes-table-body");
  const count = document.getElementById("up-reportes-count");
  const empty = document.getElementById("up-reportes-empty");
  const breadcrumb = document.getElementById("up-reporte-breadcrumb");
  const drillTitulo = document.getElementById("up-reporte-drill-titulo");
  if (!thead || !tbody) return;

  const campoAgrupador = upReporteModo === "os" ? "os" : "patologia";
  const campoDetalle = upReporteModo === "os" ? "patologia" : "os";
  const etiquetaColumna = upReporteModo === "os" ? "Obra Social / EMP" : "Patología";
  const etiquetaDetalle = upReporteModo === "os" ? "Patología" : "Obra Social / EMP";

  if (upReporteDrill) {
    breadcrumb?.removeAttribute("hidden");
    if (drillTitulo) drillTitulo.textContent = upReporteDrill;
    const filas = upReportes.filter(f => f[campoAgrupador] === upReporteDrill)
      .map(f => ({ clave: f[campoDetalle], cantidad: f.cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad || a.clave.localeCompare(b.clave));

    thead.innerHTML = `<tr><th>${etiquetaDetalle}</th><th>Cantidad de expedientes</th></tr>`;
    tbody.innerHTML = filas.map(f => `
      <tr><td class="ellipsis-cell" style="max-width:320px" title="${escaparHtml(f.clave)}">${escaparHtml(f.clave)}</td><td><strong>${f.cantidad}</strong></td></tr>
    `).join("");
    if (count) count.textContent = `${filas.length} ${etiquetaDetalle.toLowerCase()}${filas.length === 1 ? "" : "s"} para ${upReporteDrill}`;
    if (empty) empty.hidden = filas.length !== 0;
    renderBarChart("up-reporte-chart", filas.map(f => ({ etiqueta: f.clave, valor: f.cantidad })));
  } else {
    breadcrumb?.setAttribute("hidden", "");
    const agrupado = agruparUpReportesPor(upReportes, campoAgrupador);

    thead.innerHTML = `<tr><th>${etiquetaColumna}</th><th>Cantidad de expedientes</th></tr>`;
    tbody.innerHTML = agrupado.map(f => `
      <tr class="os-row" data-drill-up-reporte="${escaparHtml(f.clave)}" tabindex="0" role="button" title="Clic para ver el detalle por ${etiquetaDetalle.toLowerCase()}">
        <td class="ellipsis-cell" style="max-width:320px" title="${escaparHtml(f.clave)}">${escaparHtml(f.clave)}</td><td><strong>${f.cantidad}</strong></td>
      </tr>
    `).join("");
    if (count) count.textContent = `${agrupado.length} ${etiquetaColumna.toLowerCase()}${agrupado.length === 1 ? "" : "s"}`;
    if (empty) empty.hidden = agrupado.length !== 0;
    renderBarChart("up-reporte-chart", agrupado.map(f => ({ etiqueta: f.clave, valor: f.cantidad })));

    tbody.querySelectorAll("[data-drill-up-reporte]").forEach(row => {
      const drill = () => { upReporteDrill = row.dataset.drillUpReporte; renderUpReportes(); };
      row.addEventListener("click", drill);
      row.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); drill(); } });
    });
  }
}

function exportarUpReporteExcel() {
  const filas = [...document.querySelectorAll("#up-reportes-table-body tr")].map(tr => [...tr.children].map(td => td.textContent.trim()));
  const encabezado = [...document.querySelectorAll("#up-reportes-thead th")].map(th => th.textContent.trim());
  const hoja = window.XLSX.utils.aoa_to_sheet([encabezado, ...filas]);
  const libro = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(libro, hoja, "Reporte");
  const nombre = upReporteDrill ? `reporte_${upReporteDrill}` : `reporte_urgencias_prestacionales_${upReporteModo}`;
  window.XLSX.writeFile(libro, `${nombre.replace(/[^\w-]+/g, "_").slice(0, 60)}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function exportarUpReportePdf() {
  window.print();
}

// ---------- Criticidad (PMA + Cartillas) ----------

function trimestresCriticidad(anio) {
  const bisiesto = (a) => (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;
  return [
    { etiqueta: `1/12/${anio - 1} al ${bisiesto(anio) ? "29" : "28"}/02/${anio}`, inicio: `${anio - 1}-12-01`, fin: `${anio}-02-${bisiesto(anio) ? "29" : "28"}` },
    { etiqueta: `1/03/${anio} al 31/05/${anio}`, inicio: `${anio}-03-01`, fin: `${anio}-05-31` },
    { etiqueta: `1/06/${anio} al 31/08/${anio}`, inicio: `${anio}-06-01`, fin: `${anio}-08-31` },
    { etiqueta: `1/09/${anio} al 30/11/${anio}`, inicio: `${anio}-09-01`, fin: `${anio}-11-30` }
  ];
}

async function asegurarPmaYCartillasCargadas() {
  await Promise.all([
    (async () => { if (!pmaCompleta) { pma = await cargarPmaDesdeSupabase(); pmaCargadas = true; pmaCompleta = true; } })(),
    (async () => { if (!cartillasCompleta) { cartillas = await cargarCartillasDesdeSupabase(); cartillasCargadas = true; cartillasCompleta = true; } })(),
    (async () => { if (!obrasSociales.length) await cargarYRenderizarObrasSociales(); })()
  ]);
}

let criticidadDatos = [];
let criticidadTrimestres = [];

async function handleGenerarCriticidad() {
  const anio = Number(document.getElementById("criticidad-anio")?.value);
  if (!anio) { mostrarToast("Elegí un año para generar el reporte."); return; }
  const boton = document.getElementById("criticidad-generar");
  if (boton) { boton.disabled = true; boton.textContent = "Generando..."; }
  try {
    await asegurarPmaYCartillasCargadas();
    criticidadTrimestres = trimestresCriticidad(anio);

    // Cada ciclo de Criticidad (Dic Y-1 a Nov Y) evalúa exclusivamente la presentación
    // correspondiente a ESE ejercicio (anio_inicio === Y), sin importar cuándo se haya
    // presentado. Una presentación anticipada para el ejercicio siguiente (anio_inicio Y+1)
    // no cuenta para el ciclo Y: si no presentó el ejercicio Y, el ciclo Y queda en 1 aunque
    // ya haya presentado el Y+1 (eso resuelve su propio ciclo Y+1, incluso antes de que empiece).
    function primeraFechaPorOs(lista) {
      const mapa = new Map();
      lista.forEach(p => {
        if (!p.fecha_ingreso || !p.obra_social_id) return;
        if (Number(p.anio_inicio) !== anio) return;
        const actual = mapa.get(p.obra_social_id);
        if (!actual || p.fecha_ingreso < actual) mapa.set(p.obra_social_id, p.fecha_ingreso);
      });
      return mapa;
    }
    const primeraPmaPorOs = primeraFechaPorOs(pma);
    const primeraCartillaPorOs = primeraFechaPorOs(cartillas);

    criticidadDatos = obrasSociales
      .filter(os => !String(os.rnos || "").trim().startsWith("9"))
      .map(os => {
      const fechaPma = primeraPmaPorOs.get(os.id);
      const fechaCartilla = primeraCartillaPorOs.get(os.id);
      const valoresPma = criticidadTrimestres.map(t => (fechaPma && fechaPma <= t.fin) ? 0 : 1);
      const valoresCartilla = criticidadTrimestres.map(t => (fechaCartilla && fechaCartilla <= t.fin) ? 0 : 1);
      return { rnos: os.rnos || "—", denominacion: os.denominacion || "—", valoresPma, valoresCartilla };
    }).sort((a, b) => (a.rnos || "").localeCompare(b.rnos || ""));

    criticidadTrimestres.forEach((t, i) => {
      document.getElementById(`criticidad-th-t${i + 1}-pma`).textContent = `${i + 1} PMA`;
      document.getElementById(`criticidad-th-t${i + 1}-pma`).title = t.etiqueta;
      document.getElementById(`criticidad-th-t${i + 1}-cartilla`).textContent = `${i + 1} CARTILLA`;
      document.getElementById(`criticidad-th-t${i + 1}-cartilla`).title = t.etiqueta;
    });

    const tbody = document.getElementById("criticidad-table-body");
    tbody.innerHTML = criticidadDatos.map(d => {
      const celdas = [];
      for (let i = 0; i < 4; i++) {
        celdas.push(`<td style="text-align:center;font-weight:800;color:${d.valoresPma[i] === 0 ? "#278664" : "#c0392b"}">${d.valoresPma[i]}</td>`);
        celdas.push(`<td style="text-align:center;font-weight:800;color:${d.valoresCartilla[i] === 0 ? "#278664" : "#c0392b"}">${d.valoresCartilla[i]}</td>`);
      }
      return `<tr><td><strong>${escaparHtml(d.rnos)}</strong></td><td class="denominacion-cell">${escaparHtml(d.denominacion)}</td>${celdas.join("")}</tr>`;
    }).join("");
    document.getElementById("criticidad-count").textContent = `${criticidadDatos.length} Obras Sociales — ciclo ${anio}`;
    document.getElementById("criticidad-resultado")?.removeAttribute("hidden");
    ["criticidad-exportar-t1", "criticidad-exportar-t2", "criticidad-exportar-t3", "criticidad-exportar-t4"].forEach(id => document.getElementById(id)?.removeAttribute("hidden"));
  } catch (error) {
    mostrarToast("No se pudo generar el reporte de Criticidad.");
    console.error(error);
  } finally {
    if (boton) { boton.disabled = false; boton.textContent = "Generar"; }
  }
}

function exportarCriticidadTrimestre(indiceTrimestre) {
  if (!criticidadDatos.length) return;
  const t = criticidadTrimestres[indiceTrimestre];
  const filas = criticidadDatos.map(d => [d.rnos, d.denominacion, d.valoresPma[indiceTrimestre], d.valoresCartilla[indiceTrimestre]]);
  const hoja = window.XLSX.utils.aoa_to_sheet([["RNAS", "Obra Social", `${indiceTrimestre + 1} PMA`, `${indiceTrimestre + 1} CARTILLA`], ...filas]);
  const libro = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(libro, hoja, `Trimestre ${indiceTrimestre + 1}`);
  window.XLSX.writeFile(libro, `criticidad_trimestre${indiceTrimestre + 1}_${document.getElementById("criticidad-anio")?.value}.xlsx`);
}

// ---------- Metas físicas (PMA + Cartillas) ----------

function trimestresMetasFisicas(anio) {
  return [
    { etiqueta: `1/01/${anio} al 31/03/${anio}`, inicio: `${anio}-01-01`, fin: `${anio}-03-31` },
    { etiqueta: `1/04/${anio} al 30/06/${anio}`, inicio: `${anio}-04-01`, fin: `${anio}-06-30` },
    { etiqueta: `1/07/${anio} al 30/09/${anio}`, inicio: `${anio}-07-01`, fin: `${anio}-09-30` },
    { etiqueta: `1/10/${anio} al 31/12/${anio}`, inicio: `${anio}-10-01`, fin: `${anio}-12-31` }
  ];
}

let metasDatos = [];

async function handleGenerarMetasFisicas() {
  const anio = Number(document.getElementById("metas-anio")?.value);
  if (!anio) { mostrarToast("Elegí un año para generar el reporte."); return; }
  const boton = document.getElementById("metas-generar");
  if (boton) { boton.disabled = true; boton.textContent = "Generando..."; }
  try {
    await asegurarPmaYCartillasCargadas();
    const trimestres = trimestresMetasFisicas(anio);

    function contarEnRango(lista, inicio, fin) {
      return lista.filter(p => p.fecha_ingreso && p.fecha_ingreso >= inicio && p.fecha_ingreso <= fin).length;
    }

    metasDatos = trimestres.map((t, i) => ({
      trimestre: `Trimestre ${i + 1} (${t.etiqueta})`,
      pma: contarEnRango(pma, t.inicio, t.fin),
      cartilla: contarEnRango(cartillas, t.inicio, t.fin)
    }));

    const tbody = document.getElementById("metas-table-body");
    tbody.innerHTML = metasDatos.map(d => `
      <tr><td><strong>${escaparHtml(d.trimestre)}</strong></td><td style="text-align:center;font-weight:800">${d.pma}</td><td style="text-align:center;font-weight:800">${d.cartilla}</td></tr>
    `).join("");
    const totalPma = metasDatos.reduce((a, d) => a + d.pma, 0);
    const totalCartilla = metasDatos.reduce((a, d) => a + d.cartilla, 0);
    document.getElementById("metas-count").textContent = `Año ${anio} — Total PMA: ${totalPma} · Total Cartillas: ${totalCartilla}`;
    document.getElementById("metas-resultado")?.removeAttribute("hidden");
    document.getElementById("metas-exportar")?.removeAttribute("hidden");
  } catch (error) {
    mostrarToast("No se pudo generar el reporte de Metas Físicas.");
    console.error(error);
  } finally {
    if (boton) { boton.disabled = false; boton.textContent = "Generar"; }
  }
}

function exportarMetasFisicasExcel() {
  if (!metasDatos.length) return;
  const filas = metasDatos.map(d => [d.trimestre, d.pma, d.cartilla]);
  const hoja = window.XLSX.utils.aoa_to_sheet([["Trimestre", "PMA", "CARTILLA"], ...filas]);
  const libro = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(libro, hoja, "Metas Físicas");
  window.XLSX.writeFile(libro, `metas_fisicas_${document.getElementById("metas-anio")?.value}.xlsx`);
}

function showView(id, updateHistory = true) {
  if (typeof document === "undefined") return;
  const requested = Object.prototype.hasOwnProperty.call(views, id) ? id : "inicio";
  const resolved = vistaPermitidaParaSesion(requested) ? requested : primeraVistaPermitida(perfilSesionActual());

  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll(".nav-item,.nav-subitem").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".nav-group").forEach(g => g.classList.remove("active"));
  document.getElementById(resolved)?.classList.add("active");
  document.querySelector(`[data-view="${resolved}"]`)?.classList.add("active");

  // Colapsar todos los submenús salvo el de la sección donde estamos parados.
  document.querySelectorAll(".nav-group").forEach(group => {
    const esGrupoDeLaVistaActual =
      (["pma", "cartillas", "reportes", "notificaciones-reporte"].includes(resolved) && group.dataset.navGroup === "presentaciones") ||
      (["criticidad", "metas-fisicas"].includes(resolved) && group.dataset.navGroup === "normativa") ||
      (["afiliados", "prestadores", "cobertura"].includes(resolved) && group.dataset.navGroup === "analisis-cartilla") ||
      (resolved.startsWith("up-") && group.dataset.navGroup === "urgencias-prestacionales") ||
      (resolved.startsWith("px-") && group.dataset.navGroup === "preexistencias");
    group.classList.toggle("collapsed", !esGrupoDeLaVistaActual);
    group.querySelector(".nav-group-toggle")?.setAttribute("aria-expanded", String(esGrupoDeLaVistaActual));
  });
  if (["pma", "cartillas", "reportes", "notificaciones-reporte"].includes(resolved)) {
    document.querySelector('[data-nav-group="presentaciones"]')?.classList.add("active");
  }
  if (["criticidad", "metas-fisicas"].includes(resolved)) {
    document.querySelector('[data-nav-group="normativa"]')?.classList.add("active");
  }
  if (["afiliados", "prestadores", "cobertura"].includes(resolved)) {
    document.querySelector('[data-nav-group="analisis-cartilla"]')?.classList.add("active");
  }
  if (resolved.startsWith("up-")) {
    document.querySelector('[data-nav-group="urgencias-prestacionales"]')?.classList.add("active");
  }
  if (resolved.startsWith("px-")) {
    document.querySelector('[data-nav-group="preexistencias"]')?.classList.add("active");
  }

  const meta = views[resolved];
  const topbar = document.getElementById("topbar");
  const copy = document.getElementById("topbar-copy");
  const title = document.getElementById("page-title");
  const subtitle = document.getElementById("page-subtitle");

  if (resolved === "inicio") {
    topbar?.classList.add("is-home");
    if (copy) copy.hidden = true;
    cargarYRenderizarEstadisticasInicio();
  } else {
    topbar?.classList.remove("is-home");
    if (copy) copy.hidden = false;
    if (title) title.textContent = meta.title;
    if (subtitle) subtitle.textContent = meta.subtitle;
    if (!["prestadores", "afiliados", "cobertura"].includes(resolved)) mostrarOsActualEnCabecera(null);
    const helpContent = document.getElementById("section-help-content");
    const help = document.getElementById("section-help");
    if (helpContent) helpContent.innerHTML = manualesSeccion[resolved] || "";
    if (help) help.hidden = !manualesSeccion[resolved];
  }

  if (updateHistory && typeof history !== "undefined") history.pushState(null, "", `#${resolved}`);
  if (resolved === "pma" && !pmaCargadas) cargarYRenderizarPma();
  if (resolved === "cartillas" && !cartillasCargadas) cargarYRenderizarCartillas();
  if (resolved === "reportes") cargarReporteActivo();
  if (resolved === "criticidad" && !document.getElementById("criticidad-anio").value) {
    document.getElementById("criticidad-anio").value = new Date().getFullYear();
  }
  if (resolved === "metas-fisicas" && !document.getElementById("metas-anio").value) {
    document.getElementById("metas-anio").value = new Date().getFullYear();
  }
  if (resolved === "notificaciones-reporte") cargarYRenderizarReporteNotificaciones();
  if (resolved === "prestadores") inicializarVistaPrestadores();
  if (resolved === "cobertura") inicializarVistaCobertura();
  if (resolved === "afiliados") inicializarVistaAfiliados();
  if (resolved === "up-patologias" && !patologiasCargadas) cargarYRenderizarPatologias();
  if (resolved === "up-drogas" && !drogasCargadas) cargarYRenderizarDrogas();
  if (resolved === "up-plantillas" && !plantillasCargadas) cargarYRenderizarPlantillas();
  if (resolved === "up-expedientes" && !expedientesCargadas) cargarYRenderizarExpedientes();
  if (resolved === "up-reportes") {
    upReporteDrill = null;
    if (!upReportesCargado) cargarYRenderizarUpReportes(); else renderUpReportes();
  }
  if (resolved === "px-patologias" && !pxPatologiasCargadas) cargarYRenderizarPxPatologias();
  if (resolved === "px-plantillas" && !pxPlantillasCargadas) cargarYRenderizarPxPlantillas();
  if (resolved === "px-preexistencias" && !preexistenciasCargadas) cargarYRenderizarPreexistencias();
  if (resolved === "px-emp") {
    pxReporteDrill = null;
    if (!pxEmpReporteCargado) cargarYRenderizarPxEmp(); else renderPxEmp();
  }
}

function renderObrasSociales() {
  if (typeof document === "undefined") return;
  const tbody = document.getElementById("os-table-body");
  if (!tbody) return;

  const busqueda = document.getElementById("os-search")?.value || "";
  const estado = document.getElementById("os-estado-filter")?.value || "TODAS";
  const inicioEstado = document.getElementById("os-inicio-filter")?.value || "TODOS";
  const filtradas = ordenarObrasSocialesPorRnos(
    filtrarObrasSociales(obrasSociales, busqueda, estado, inicioEstado),
    rnosSortDirection
  );

  tbody.innerHTML = filtradas.map(os => `
    <tr class="os-row" data-edit-os="${os.id}" tabindex="0" role="button" title="Clic para ver o editar todos los datos">
      <td><strong>${escaparHtml(os.rnos)}</strong></td>
      <td class="denominacion-cell" title="${escaparHtml(os.denominacion)}">${escaparHtml(os.denominacion)}</td>
      <td>${escaparHtml(os.sigla || "—")}</td>
      <td class="date-cell">${mostrarDiaMes(os.inicio_ejercicio)}</td>
    </tr>
  `).join("");

  const count = document.getElementById("os-count");
  if (count) count.textContent = `${filtradas.length} ${filtradas.length === 1 ? "Agente de Seguro" : "Agentes de Seguro"}`;

  const empty = document.getElementById("os-empty");
  if (empty) {
    empty.hidden = filtradas.length !== 0;
    if (!filtradas.length) empty.textContent = "No se encontraron Agentes de Seguro con ese criterio.";
  }

  document.querySelectorAll(".os-row[data-edit-os]").forEach(row => {
    const editar = () => requiereAutenticacion(() => abrirModalEdicion(Number(row.dataset.editOs)));

    row.addEventListener("click", editar);
    row.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        editar();
      }
    });
  });

  actualizarIndicadorOrden();
}

function actualizarIndicadorOrden() {
  const arrow = document.getElementById("rnos-sort-arrow");
  const btn = document.getElementById("rnos-sort");
  if (arrow) arrow.textContent = rnosSortDirection === "asc" ? "↑" : "↓";
  if (btn) btn.title = rnosSortDirection === "asc"
    ? "Orden actual: menor a mayor. Clic para invertir."
    : "Orden actual: mayor a menor. Clic para invertir.";
}

function toggleRnosSort() {
  rnosSortDirection = rnosSortDirection === "asc" ? "desc" : "asc";
  renderObrasSociales();
}

function setEstadoCarga(texto) {
  const el = document.getElementById("os-source-status");
  if (el) el.textContent = texto;
}

async function cargarYRenderizarObrasSociales() {
  if (typeof document === "undefined") return;
  const count = document.getElementById("os-count");
  if (count) count.textContent = "Cargando Agentes de Seguro...";


  try {
    obrasSociales = await cargarObrasSocialesDesdeSupabase();
    renderObrasSociales();
    poblarObrasSocialesCartilla();
    poblarObrasSocialesPma();
    poblarObrasSocialesPrestadores();

  } catch (error) {
    obrasSociales = [];
    renderObrasSociales();
    if (count) count.textContent = "0 Agentes de Seguro";
    const esTimeout = error?.name === "TimeoutError";
    setEstadoCarga(esTimeout ? "Supabase no respondió en 10 segundos" : "Error de conexión con Supabase");
    const empty = document.getElementById("os-empty");
    if (empty) {
      empty.hidden = false;
      empty.textContent = esTimeout
        ? "Supabase no respondió dentro del tiempo esperado. Actualizá la página o revisá la conexión."
        : `No se pudieron cargar las Agentes de Seguro.${error?.message ? " " + error.message : ""}`;
    }
    console.error("Error cargando Agentes de Seguro:", error);
  }
}

function setFormMessage(id, texto = "", tipo = "error") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = texto;
  el.hidden = !texto;
  el.classList.toggle("neutral", tipo === "neutral");
  el.classList.toggle("success", tipo === "success");
}

function abrirModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add("modal-open");
}

function cerrarModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.hidden = true;
  if (![...document.querySelectorAll(".modal-backdrop")].some(m => !m.hidden)) {
    document.body.classList.remove("modal-open");
  }
}

// Reemplazan a window.confirm / window.prompt con el mismo estilo del sitio.
function mostrarConfirmacion(mensaje, opciones = {}) {
  return new Promise(resolve => {
    document.getElementById("confirm-modal-title").textContent = opciones.titulo || "Confirmar";
    document.getElementById("confirm-modal-mensaje").textContent = mensaje;
    document.getElementById("confirm-modal-input").hidden = true;
    const btnAceptar = document.getElementById("confirm-modal-aceptar");
    const btnCancelar = document.getElementById("confirm-modal-cancelar");
    btnAceptar.textContent = opciones.textoAceptar || "Aceptar";
    btnCancelar.hidden = false;
    btnCancelar.textContent = opciones.textoCancelar || "Cancelar";
    const finalizar = resultado => {
      cerrarModal("confirm-modal");
      btnAceptar.removeEventListener("click", onAceptar);
      btnCancelar.removeEventListener("click", onCancelar);
      document.getElementById("confirm-modal-x").removeEventListener("click", onCancelar);
      resolve(resultado);
    };
    const onAceptar = () => finalizar(true);
    const onCancelar = () => finalizar(false);
    btnAceptar.addEventListener("click", onAceptar);
    btnCancelar.addEventListener("click", onCancelar);
    document.getElementById("confirm-modal-x").addEventListener("click", onCancelar);
    abrirModal("confirm-modal");
  });
}

function mostrarPrompt(mensaje, valorInicial = "", opciones = {}) {
  return new Promise(resolve => {
    document.getElementById("confirm-modal-title").textContent = opciones.titulo || "Ingresar valor";
    document.getElementById("confirm-modal-mensaje").textContent = mensaje;
    const input = document.getElementById("confirm-modal-input");
    input.hidden = false;
    input.type = opciones.tipo || "text";
    input.value = valorInicial ?? "";
    const btnAceptar = document.getElementById("confirm-modal-aceptar");
    const btnCancelar = document.getElementById("confirm-modal-cancelar");
    btnAceptar.textContent = opciones.textoAceptar || "Aceptar";
    btnCancelar.hidden = false;
    btnCancelar.textContent = "Cancelar";
    const finalizar = resultado => {
      cerrarModal("confirm-modal");
      btnAceptar.removeEventListener("click", onAceptar);
      btnCancelar.removeEventListener("click", onCancelar);
      document.getElementById("confirm-modal-x").removeEventListener("click", onCancelar);
      input.removeEventListener("keydown", onKeydown);
      resolve(resultado);
    };
    const onAceptar = () => finalizar(input.value);
    const onCancelar = () => finalizar(null);
    const onKeydown = event => { if (event.key === "Enter") { event.preventDefault(); onAceptar(); } };
    btnAceptar.addEventListener("click", onAceptar);
    btnCancelar.addEventListener("click", onCancelar);
    document.getElementById("confirm-modal-x").addEventListener("click", onCancelar);
    input.addEventListener("keydown", onKeydown);
    abrirModal("confirm-modal");
    setTimeout(() => { input.focus(); input.select(); }, 50);
  });
}

function cerrarTodosLosModales() {
  document.querySelectorAll(".modal-backdrop").forEach(m => m.hidden = true);
  document.body.classList.remove("modal-open");
}

function resetFormularioOS() {
  document.getElementById("os-form")?.reset();
  const id = document.getElementById("os-id");
  if (id) id.value = "";
  const estado = document.getElementById("os-estado");
  if (estado) estado.value = "ACTIVA";
  setFormMessage("os-form-message");
}

function abrirModalNueva() {
  resetFormularioOS();
  document.getElementById("os-modal-title").textContent = "Nuevo Agente de Seguro";
  abrirModal("os-modal");
  setTimeout(() => document.getElementById("os-rnos")?.focus(), 0);
}

function abrirModalEdicion(id) {
  const os = obrasSociales.find(item => Number(item.id) === Number(id));
  if (!os) return;

  const ubicacion = separarLocalidadDomicilio(os.localidad, os.domicilio);
  const values = {
    "os-id": os.id,
    "os-rnos": os.rnos,
    "os-denominacion": os.denominacion,
    "os-sigla": os.sigla,
    "os-domicilio": ubicacion.domicilio,
    "os-localidad": ubicacion.localidad,
    "os-provincia": os.provincia,
    "os-telefono": os.telefono,
    "os-email": os.email,
    "os-web": os.web,
    "os-inicio-ejercicio": os.inicio_ejercicio,
    "os-estado": os.estado,
    "os-observaciones": os.observaciones
  };

  Object.entries(values).forEach(([idCampo, value]) => {
    const campo = document.getElementById(idCampo);
    if (campo) campo.value = value ?? "";
  });
  setFormMessage("os-form-message");
  document.getElementById("os-modal-title").textContent = "Editar Agente de Seguro";
  abrirModal("os-modal");
}

function requiereAutenticacion(accion) {
  if (authSession?.access_token) {
    accion();
    return;
  }
  accionPendienteTrasLogin = accion;
  abrirLogin();
}

function abrirLogin() {
  setFormMessage("login-message");
  const gate = document.getElementById("login-gate");
  const shell = document.getElementById("app-shell");
  if (gate) gate.hidden = false;
  if (shell) shell.hidden = true;
  setTimeout(() => document.getElementById("auth-user")?.focus(), 0);
}

function actualizarAuthUI() {
  if (typeof document === "undefined") return;
  const login = document.getElementById("btn-login");
  const sessionBox = document.getElementById("auth-session");
  const nombre = document.getElementById("auth-user-name");
  const perfil = document.getElementById("auth-user-profile");
  const gate = document.getElementById("login-gate");
  const shell = document.getElementById("app-shell");

  const conectado = Boolean(authSession?.access_token);
  if (login) login.hidden = conectado;
  if (sessionBox) sessionBox.hidden = !conectado;
  if (gate) gate.hidden = conectado;
  if (shell) shell.hidden = !conectado;

  if (conectado) {
    const identidad = getSessionIdentity(authSession);
    // Para el perfil Cartilla OS el nombre ya se repite debajo del subtítulo de cada
    // pantalla (Prestadores/Afiliados/Cobertura), así que acá alcanza con el rol.
    const esCartillaOsIdentidad = normalizarPerfilAcceso(perfilSesionActual()) === "cartilla os";
    if (nombre) nombre.textContent = esCartillaOsIdentidad ? "" : identidad.nombre;
    if (perfil) perfil.textContent = identidad.perfil;
  } else {
    if (nombre) nombre.textContent = "";
    if (perfil) perfil.textContent = "";
  }

  aplicarPermisosNavegacion();
  if (conectado) {
    const vistaActiva = document.querySelector(".view.active")?.id || "inicio";
    if (!vistaPermitidaParaSesion(vistaActiva)) showView(primeraVistaPermitida(perfilSesionActual()), false);
    renderObrasSociales();
  }
}

async function refrescarDatosUsuarioSesion() {
  if (!authSession?.access_token) return authSession;

  try {
    const user = await authGetUser(authSession.access_token);
    authSession = normalizarSesion({ ...authSession, user });
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(authSession));
    }
    actualizarAuthUI();
  } catch (error) {
    console.warn("No se pudieron refrescar los datos del usuario:", error);
  }

  return authSession;
}

function mostrarToast(texto, tipo = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = texto;
  toast.className = `toast ${tipo}`;
  toast.hidden = false;
  clearTimeout(mostrarToast.timer);
  mostrarToast.timer = setTimeout(() => { toast.hidden = true; }, 3500);
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const email = document.getElementById("auth-user")?.value.trim() || "";
  const password = document.getElementById("auth-password")?.value || "";
  const submit = document.getElementById("login-submit");
  setFormMessage("login-message");

  if (!email || !password) {
    setFormMessage("login-message", "Completá Usuario y Contraseña.");
    return;
  }

  try {
    if (submit) submit.disabled = true;
    guardarSesion(await authSignIn(email, password));
    await refrescarDatosUsuarioSesion();
    document.getElementById("login-form")?.reset();
    await cargarYRenderizarObrasSociales();
    mostrarToast("Sesión iniciada.");

    const accion = accionPendienteTrasLogin;
    accionPendienteTrasLogin = null;
    if (accion) accion();
  } catch (error) {
    setFormMessage("login-message", error.message || "No se pudo iniciar sesión.");
  } finally {
    if (submit) submit.disabled = false;
  }
}

async function handleLogout() {
  try {
    await authLogout(authSession?.access_token);
  } catch (error) {
    console.warn(error);
  } finally {
    guardarSesion(null);
    accionPendienteTrasLogin = null;
    cerrarTodosLosModales();
    abrirLogin();
  }
}

function recoveryRedirectUrl() {
  if (typeof location === "undefined") return "";
  return `${location.origin}${location.pathname}?recovery=1`;
}

async function handleForgotSubmit(event) {
  event.preventDefault();
  const email = document.getElementById("forgot-email")?.value.trim() || "";
  const submit = document.getElementById("forgot-submit");
  setFormMessage("forgot-message");

  if (!email) {
    setFormMessage("forgot-message", "Ingresá el correo registrado.");
    return;
  }

  try {
    if (submit) submit.disabled = true;
    await authRecover(email, recoveryRedirectUrl());
    setFormMessage("forgot-message", "Te enviamos un enlace para cambiar la contraseña. Revisá tu correo.", "success");
  } catch (error) {
    setFormMessage("forgot-message", error.message || "No se pudo enviar el correo.");
  } finally {
    if (submit) submit.disabled = false;
  }
}

function abrirCambioPassword(esRecuperacion = false) {
  passwordRecoveryPending = esRecuperacion;
  document.getElementById("password-form")?.reset();
  setFormMessage("password-message");
  document.getElementById("password-title").textContent = esRecuperacion ? "Crear nueva contraseña" : "Cambiar contraseña";
  abrirModal("password-modal");
  setTimeout(() => document.getElementById("new-password")?.focus(), 0);
}

async function handlePasswordSubmit(event) {
  event.preventDefault();
  const nueva = document.getElementById("new-password")?.value || "";
  const repetir = document.getElementById("confirm-password")?.value || "";
  const submit = document.getElementById("password-submit");
  setFormMessage("password-message");

  if (nueva.length < 6) {
    setFormMessage("password-message", "La contraseña debe tener al menos 6 caracteres.");
    return;
  }
  if (nueva !== repetir) {
    setFormMessage("password-message", "Las contraseñas no coinciden.");
    return;
  }

  try {
    if (submit) submit.disabled = true;
    const session = await asegurarSesionVigente();
    await authUpdatePassword(session.access_token, nueva);
    cerrarModal("password-modal");
    passwordRecoveryPending = false;
    mostrarToast("Contraseña actualizada.");
  } catch (error) {
    setFormMessage("password-message", error.message || "No se pudo actualizar la contraseña.");
  } finally {
    if (submit) submit.disabled = false;
  }
}

function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const mostrar = input.type === "password";
  input.type = mostrar ? "text" : "password";
  if (button) button.setAttribute("aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña");
}

async function handleOsSubmit(event) {
  event.preventDefault();
  const save = document.getElementById("os-save");
  setFormMessage("os-form-message");

  const id = document.getElementById("os-id")?.value || "";
  const rnos = (document.getElementById("os-rnos")?.value || "").replace(/\D/g, "");
  const denominacion = document.getElementById("os-denominacion")?.value.trim() || "";
  const sigla = document.getElementById("os-sigla")?.value.trim().toUpperCase() || "";
  const inicioEjercicioRaw = document.getElementById("os-inicio-ejercicio")?.value.trim() || "";

  if (!rnos || !denominacion) {
    setFormMessage("os-form-message", "RNAS y Denominación son obligatorios.");
    return;
  }
  if (inicioEjercicioRaw && !normalizarDiaMes(inicioEjercicioRaw)) {
    setFormMessage("os-form-message", "Inicio ejercicio debe tener formato DD-MM, por ejemplo 01-07.");
    return;
  }

  const registro = {
    rnos,
    denominacion,
    sigla: sigla || null,
    domicilio: document.getElementById("os-domicilio")?.value.trim() || null,
    localidad: document.getElementById("os-localidad")?.value.trim() || null,
    provincia: document.getElementById("os-provincia")?.value.trim() || null,
    telefono: document.getElementById("os-telefono")?.value.trim() || null,
    email: document.getElementById("os-email")?.value.trim() || null,
    web: document.getElementById("os-web")?.value.trim() || null,
    inicio_ejercicio: inicioEjercicioRaw ? normalizarDiaMes(inicioEjercicioRaw) : null,
    estado: document.getElementById("os-estado")?.value || "ACTIVA",
    observaciones: document.getElementById("os-observaciones")?.value.trim() || null
  };

  try {
    if (save) save.disabled = true;
    const session = await asegurarSesionVigente();
    await guardarObraSocialEnSupabase(registro, id || null, session.access_token);
    cerrarModal("os-modal");
    mostrarToast(id ? "Agente de Seguro actualizada." : "Agente de Seguro creada.");
    await cargarYRenderizarObrasSociales();
  } catch (error) {
    const mensaje = /duplicate|unique|23505/i.test(error.message || "")
      ? "Ya existe una Agente de Seguro con ese RNAS."
      : error.message || "No se pudo guardar la Agente de Seguro.";
    setFormMessage("os-form-message", mensaje);
  } finally {
    if (save) save.disabled = false;
  }
}


function mostrarOsActualEnCabecera(os) {
  const el = document.getElementById("page-os-actual");
  if (!el) return;
  if (!os) { el.hidden = true; el.textContent = ""; return; }
  let texto = `${os.denominacion || os.sigla || ""} · RNAS ${os.rnos || "—"}`;
  if (normalizarPerfilAcceso(perfilSesionActual()) === "cartilla os") {
    const periodo = ejercicioVigenteParaOs(os);
    if (periodo) texto += ` · Preparando la Cartilla del período ${periodo}`;
  }
  el.textContent = texto;
  el.hidden = false;
}

function getObraSocialDisplay(os) {
  return os ? `${os.rnos || ""} · ${os.sigla || "S/S"} · ${os.denominacion || ""}` : "";
}

function poblarObrasSocialesCartilla() {
  if (typeof document === "undefined") return;
  const list = document.getElementById("cartilla-os-list");
  if (!list) return;
  list.innerHTML = obrasSociales.filter(os => os.estado !== "INACTIVA").map(os => `<option value="${escaparHtml(getObraSocialDisplay(os))}"></option>`).join("");
}

function resolverObraSocialCartilla(valor) {
  const texto = normalizar(valor);
  if (!texto) return null;
  return obrasSociales.find(os => normalizar(getObraSocialDisplay(os)) === texto || normalizar(os.rnos) === texto || normalizar(os.sigla) === texto) || null;
}

function actualizarMasterInfo(prefix, os) {
  if (typeof document === "undefined") return;
  const node = document.getElementById(`${prefix}-master-inicio`);
  if (node) node.textContent = os?.inicio_ejercicio || "—";
}
function actualizarMasterInfoCartilla(os) { actualizarMasterInfo("cartilla", os); }
function actualizarMasterInfoPma(os) { actualizarMasterInfo("pma", os); }

function actualizarAlertaCartilla() {
  if (typeof document === "undefined") return calcularCumplimiento90("", "");
  const fechaInicio = document.getElementById("cartilla-fecha-inicio-ejercicio")?.value || "";
  const fechaIngreso = document.getElementById("cartilla-fecha-ingreso")?.value || "";
  const resultado = calcularCumplimiento90(fechaInicio, fechaIngreso);
  const limite = document.getElementById("cartilla-fecha-limite");
  if (limite) {
    limite.textContent = formatFechaPantalla(resultado.fechaLimite);
    limite.classList.remove("success", "danger", "neutral");
    limite.classList.add(resultado.estado === "EN_TERMINO" ? "success" : resultado.estado === "FUERA_DE_TERMINO" ? "danger" : "neutral");
  }
  const cumplimiento = document.getElementById("cartilla-cumplimiento");
  if (cumplimiento) {
    const texto = resultado.estado === "EN_TERMINO"
      ? "EN TÉRMINO"
      : resultado.estado === "FUERA_DE_TERMINO"
        ? "FUERA DE TÉRMINO"
        : "—";
    cumplimiento.textContent = texto;
    cumplimiento.classList.remove("success", "danger", "neutral");
    cumplimiento.classList.add(resultado.estado === "EN_TERMINO" ? "success" : resultado.estado === "FUERA_DE_TERMINO" ? "danger" : "neutral");
  }
  return resultado;
}

function recalcularDatosCartilla() {
  if (typeof document === "undefined") return;
  const os = resolverObraSocialCartilla(document.getElementById("cartilla-os-search")?.value || "");
  const inicio = os?.inicio_ejercicio || "";
  const ejercicioIngresado = document.getElementById("cartilla-ejercicio")?.value || "";
  const ejercicio = ejercicioCanonico(ejercicioIngresado);
  const anio = anioInicioDesdeEjercicio(ejercicio);

  document.getElementById("cartilla-os-id").value = os?.id || "";
  document.getElementById("cartilla-inicio-ejercicio").value = inicio;
  document.getElementById("cartilla-anio-inicio").value = anio || "";
  document.getElementById("cartilla-fecha-inicio-ejercicio").value =
    anio ? fechaInicioEjercicioDesdeDiaMes(inicio, anio) : "";

  actualizarMasterInfoCartilla(os);
  actualizarAlertaCartilla();
}

// Año a partir del cual se considera "vigente" un ejercicio para la carga rápida
// de las pantallas de Cartillas/PMA. Se recalcula solo (currentYear - 1, por si
// una OS con ejercicio fiscal todavía está corriendo el período que arrancó el año anterior).
function anioMinimoVigente() {
  return new Date().getFullYear() - 1;
}

function buildCartillasUrl(offset = 0, limit = 1000, soloVigente = false) {
  const fields = [
    "id","obra_social_id","anio_inicio","ejercicio","fecha_inicio_ejercicio","analista","numero_ee","condicion",
    "fecha_ingreso","res_170_2009","numero_disposicion","fecha_disposicion","observaciones","created_at","updated_at",
    "obras_sociales(rnos,denominacion,sigla,inicio_ejercicio,domicilio,localidad,provincia)"
  ].join(",");
  const params = new URLSearchParams();
  params.set("select", fields);
  params.set("order", "fecha_ingreso.desc.nullslast,id.desc");
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  params.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  if (soloVigente) params.set("anio_inicio", `gte.${anioMinimoVigente()}`);
  return `${SUPABASE_URL}/rest/v1/cartillas?${params.toString()}`;
}

async function cargarCartillasDesdeSupabase(fetchImpl = fetch, soloVigente = false) {
  const pageSize = 1000;
  const all = [];
  for (let offset = 0; ; offset += pageSize) {
    const response = await fetchConTimeout(buildCartillasUrl(offset, pageSize, soloVigente), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 10000, fetchImpl);
    if (!response.ok) {
      const detalle = await leerErrorApi(response);
      throw new Error(`Supabase respondió ${response.status}${detalle ? `: ${detalle}` : ""}`);
    }
    const rows = await response.json();
    const page = Array.isArray(rows) ? rows : [];
    all.push(...page);
    if (page.length < pageSize) break;
  }
  return all;
}

function buildPmaUrl(offset = 0, limit = 1000, soloVigente = false) {
  const fields = [
    "id","obra_social_id","anio_inicio","ejercicio","inicio_periodo","fin_periodo","fecha_inicio_ejercicio","fecha_fin_ejercicio",
    "analista","numero_ee","condicion","fecha_ingreso","res_170_2009","numero_disposicion","fecha_disposicion","observaciones","created_at","updated_at",
    "obras_sociales(rnos,denominacion,sigla,inicio_ejercicio,domicilio,localidad,provincia)"
  ].join(",");
  const params = new URLSearchParams();
  params.set("select", fields);
  params.set("order", "fecha_ingreso.desc.nullslast,id.desc");
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  params.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  if (soloVigente) params.set("anio_inicio", `gte.${anioMinimoVigente()}`);
  return `${SUPABASE_URL}/rest/v1/pma?${params.toString()}`;
}

async function cargarPmaDesdeSupabase(fetchImpl = fetch, soloVigente = false) {
  const pageSize = 1000;
  const all = [];
  for (let offset = 0; ; offset += pageSize) {
    const response = await fetchConTimeout(buildPmaUrl(offset, pageSize, soloVigente), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 10000, fetchImpl);
    if (!response.ok) {
      const detalle = await leerErrorApi(response);
      throw new Error(`Supabase respondió ${response.status}${detalle ? `: ${detalle}` : ""}`);
    }
    const rows = await response.json();
    const page = Array.isArray(rows) ? rows : [];
    all.push(...page);
    if (page.length < pageSize) break;
  }
  return all;
}



function ejerciciosFiltroSeleccionados(prefix) {
  if (typeof document === "undefined") return [];
  return [...document.querySelectorAll(`input[name="${prefix}-ejercicio-opcion"]:checked`)].map(input => input.value);
}

function actualizarResumenEjercicios(prefix) {
  if (typeof document === "undefined") return;
  const inputs = [...document.querySelectorAll(`input[name="${prefix}-ejercicio-opcion"]`)];
  const seleccionados = inputs.filter(input => input.checked).map(input => input.value);
  const resumen = document.getElementById(`${prefix}-ejercicio-summary`);
  if (!resumen) return;
  if (!inputs.length || !seleccionados.length || seleccionados.length === inputs.length) resumen.textContent = "Ejercicio: Todos";
  else if (seleccionados.length === 1) resumen.textContent = `Ejercicio: ${seleccionados[0]}`;
  else resumen.textContent = `${seleccionados.length} ejercicios`;
}

function seleccionarEjerciciosFiltro(prefix, seleccionar, renderFn) {
  if (typeof document === "undefined") return;
  document.querySelectorAll(`input[name="${prefix}-ejercicio-opcion"]`).forEach(input => { input.checked = Boolean(seleccionar); });
  actualizarResumenEjercicios(prefix);
  if (typeof renderFn === "function") renderFn();
}

function poblarSelectorMultipleEjercicios(prefix, valores, renderFn) {
  if (typeof document === "undefined") return;
  const container = document.getElementById(`${prefix}-ejercicio-options`);
  if (!container) return;
  const anteriores = new Set(ejerciciosFiltroSeleccionados(prefix));
  const teniaOpciones = container.querySelectorAll('input').length > 0;
  const ejercicios = [...new Set((valores || []).filter(Boolean).map(String))]
    .sort((a,b) => String(b).localeCompare(String(a), "es", {numeric:true}));
  container.innerHTML = ejercicios.map(e => {
    const checked = teniaOpciones ? anteriores.has(e) : true;
    return `<label class="period-check"><input type="checkbox" name="${prefix}-ejercicio-opcion" value="${escaparHtml(e)}" ${checked ? "checked" : ""}><span>${escaparHtml(e)}</span></label>`;
  }).join("");
  container.querySelectorAll(`input[name="${prefix}-ejercicio-opcion"]`).forEach(input => {
    input.addEventListener("change", () => { actualizarResumenEjercicios(prefix); if (typeof renderFn === "function") renderFn(); });
  });
  const all = document.getElementById(`${prefix}-ejercicio-all`);
  const clear = document.getElementById(`${prefix}-ejercicio-clear`);
  if (all) all.onclick = () => seleccionarEjerciciosFiltro(prefix, true, renderFn);
  if (clear) clear.onclick = () => seleccionarEjerciciosFiltro(prefix, false, renderFn);
  actualizarResumenEjercicios(prefix);
}

function normalizarBusquedaFecha(valor = "") {
  return String(valor || "").trim().replace(/\s+/g, "").replace(/[./]/g, "-").toLowerCase();
}

function fechaCoincideFiltro(fechaIso, filtro = "") {
  const termino = String(filtro || "").trim();
  if (!termino) return true;
  const iso = String(fechaIso || "").trim();
  if (!iso) return false;
  const terminoNormalizado = normalizarBusquedaFecha(termino);
  const terminoNumerico = termino.replace(/\D/g, "");
  const candidatos = [
    normalizarBusquedaFecha(iso),
    normalizarBusquedaFecha(formatFechaPantalla(iso)),
    String(iso || "").replace(/\D/g, ""),
    String(formatFechaPantalla(iso) || "").replace(/\D/g, "")
  ].filter(Boolean);
  return candidatos.some(candidato => {
    if (!candidato) return false;
    if (terminoNormalizado && candidato.includes(terminoNormalizado)) return true;
    if (terminoNumerico && candidato.includes(terminoNumerico)) return true;
    return false;
  });
}

function valorOrdenEjercicio(ejercicio = "") {
  const texto = String(ejercicio || "").trim();
  const match = texto.match(/^(\d{4})(?:\/(\d{2,4}))?$/);
  if (!match) return { inicio: 0, fin: 0, texto };
  const inicio = Number(match[1]) || 0;
  let fin = inicio;
  if (match[2]) {
    fin = match[2].length === 2 ? Number(String(inicio).slice(0, 2) + match[2]) : Number(match[2]);
  }
  return { inicio, fin, texto };
}

function filtrarCartillasRegistros(lista, filtros = {}) {
  const busqueda = normalizar(filtros.busqueda || "");
  const ejercicios = new Set((Array.isArray(filtros.ejercicios) ? filtros.ejercicios : []).map(String));
  const plazo = filtros.plazo || "TODOS";
  const condicion = filtros.condicion || "TODOS";
  const fechaIngreso = filtros.fechaIngreso || "";
  const fechaLimite = filtros.fechaLimite || "";
  return (lista || []).filter(c => {
    const os = c.obras_sociales || {};
    if (ejercicios.size && !ejercicios.has(String(c.ejercicio || ""))) return false;
    const cumplimiento = calcularCumplimiento90(c?.fecha_inicio_ejercicio || "", c?.fecha_ingreso || "");
    if (plazo !== "TODOS" && cumplimiento !== plazo) return false;
    if (condicion !== "TODOS" && (c.condicion || "") !== condicion) return false;
    if (!fechaCoincideFiltro(c?.fecha_ingreso || "", fechaIngreso)) return false;
    if (!fechaCoincideFiltro(cumplimiento?.fechaLimite || "", fechaLimite)) return false;
    if (!busqueda) return true;
    return normalizar([os.rnos,os.denominacion,os.sigla,c.ejercicio,c.analista,c.numero_ee,c.condicion,c.numero_disposicion,c.observaciones].join(" ")).includes(busqueda);
  });
}

function ordenarReportePorRnas(filas, direccion = "asc") {
  const mult = direccion === "desc" ? -1 : 1;
  return [...(filas || [])].sort((a,b) => {
    const ar = Number(String(a?.rnos || "").replace(/\D/g,"")) || 0;
    const br = Number(String(b?.rnos || "").replace(/\D/g,"")) || 0;
    return (ar - br) * mult;
  });
}


function iconoOrdenTabla(campoActivo, campo, direccion) {
  if (campoActivo !== campo) return "↕";
  return direccion === "desc" ? "↓" : "↑";
}

function compararTextoOrden(a, b, factor = 1) {
  return String(a || "").localeCompare(String(b || ""), "es", { numeric: true, sensitivity: "base" }) * factor;
}

function ordenarPresentacionesPorCampo(lista, campo = "rnas", direccion = "asc") {
  const factor = direccion === "desc" ? -1 : 1;
  return [...(lista || [])].sort((a, b) => {
    if (campo === "rnas") {
      const diff = rnosNumerico(a?.obras_sociales?.rnos) - rnosNumerico(b?.obras_sociales?.rnos);
      if (diff !== 0) return diff * factor;
      return compararTextoOrden(a?.obras_sociales?.rnos, b?.obras_sociales?.rnos, factor);
    }
    if (campo === "ejercicio") {
      const av = valorOrdenEjercicio(a?.ejercicio || "");
      const bv = valorOrdenEjercicio(b?.ejercicio || "");
      if (av.inicio !== bv.inicio) return (av.inicio - bv.inicio) * factor;
      if (av.fin !== bv.fin) return (av.fin - bv.fin) * factor;
      return compararTextoOrden(a?.obras_sociales?.denominacion, b?.obras_sociales?.denominacion, factor);
    }
    if (campo === "ingreso") {
      const av = String(a?.fecha_ingreso || "");
      const bv = String(b?.fecha_ingreso || "");
      if (av !== bv) return av.localeCompare(bv, "es") * factor;
      return compararTextoOrden(a?.obras_sociales?.denominacion, b?.obras_sociales?.denominacion, factor);
    }
    if (campo === "fecha_limite") {
      const av = String(calcularCumplimiento90(a?.fecha_inicio_ejercicio || "", a?.fecha_ingreso || "")?.fechaLimite || "");
      const bv = String(calcularCumplimiento90(b?.fecha_inicio_ejercicio || "", b?.fecha_ingreso || "")?.fechaLimite || "");
      if (av !== bv) return av.localeCompare(bv, "es") * factor;
      return compararTextoOrden(a?.obras_sociales?.denominacion, b?.obras_sociales?.denominacion, factor);
    }
    return 0;
  });
}

function cambiarOrdenPresentaciones(modulo, campo) {
  const direccionInicial = campo === "rnas" ? "asc" : "desc";
  if (modulo === "pma") {
    if (pmaSortField === campo) {
      pmaSortDirection = pmaSortDirection === "asc" ? "desc" : "asc";
    } else {
      pmaSortField = campo;
      pmaSortDirection = direccionInicial;
    }
    pmaPage = 1;
    renderPma();
    return;
  }
  if (cartillaSortField === campo) {
    cartillaSortDirection = cartillaSortDirection === "asc" ? "desc" : "asc";
  } else {
    cartillaSortField = campo;
    cartillaSortDirection = direccionInicial;
  }
  cartillaPage = 1;
  renderCartillas();
}

function construirHistorialPresentaciones(lista, obraSocialId) {
  const objetivo = String(obraSocialId ?? "");
  return (lista || [])
    .filter(row => String(row?.obra_social_id ?? "") === objetivo)
    .map(row => {
      const cumplimiento = calcularCumplimiento90(row?.fecha_inicio_ejercicio || "", row?.fecha_ingreso || "");
      const plazoTexto = cumplimiento.estado === "EN_TERMINO" ? "EN TÉRMINO" : cumplimiento.estado === "FUERA_DE_TERMINO" ? "FUERA DE TÉRMINO" : "SIN DATOS";
      return { ...row, plazoEstado: cumplimiento.estado, plazoTexto, fechaLimite: cumplimiento.fechaLimite || "" };
    })
    .sort((a,b) => {
      const ay = Number(String(a?.ejercicio || "").slice(0,4)) || 0;
      const by = Number(String(b?.ejercicio || "").slice(0,4)) || 0;
      if (ay !== by) return by - ay;
      return String(b?.fecha_ingreso || "").localeCompare(String(a?.fecha_ingreso || ""));
    });
}

function identificarNuncaPresentaron(obras, registros) {
  const conPresentacion = new Set((registros || []).map(row => String(row?.obra_social_id ?? "")).filter(Boolean));
  return (obras || [])
    .filter(os => String(os?.estado || "ACTIVA").toUpperCase() !== "INACTIVA")
    .filter(os => !String(os?.rnos || "").trim().startsWith("9"))
    .filter(os => !conPresentacion.has(String(os?.id ?? "")))
    .map(os => ({ ...os }))
    .sort((a, b) => {
      const ar = Number(String(a?.rnos || "").replace(/\D/g, "")) || 0;
      const br = Number(String(b?.rnos || "").replace(/\D/g, "")) || 0;
      return ar - br;
    });
}

function construirEvolucionPresentaciones(os, lista, anioActual = new Date().getFullYear()) {
  if (!os) return [];
  const objetivo = String(os.id ?? "");
  const inicio = normalizarDiaMes(os.inicio_ejercicio || "");
  if (!inicio) return [];
  const registros = (lista || []).filter(row => String(row?.obra_social_id ?? "") === objetivo);
  if (!registros.length) return [];
  const periodosRegistrados = registros.map(row => {
    const anioInicio = Number(row?.anio_inicio);
    if (!Number.isInteger(anioInicio)) return null;
    return inicio === "01-01" ? anioInicio : anioInicio + 1;
  }).filter(Number.isInteger);
  if (!periodosRegistrados.length) return [];
  const min = Math.min(...periodosRegistrados);
  const max = Math.max(Number(anioActual) || min, ...periodosRegistrados);
  const resultado = [];
  for (let periodo = min; periodo <= max; periodo += 1) {
    const esperado = ejercicioEsperadoPeriodoControl(inicio, periodo);
    const registro = esperado ? registros.find(row => Number(row?.anio_inicio) === Number(esperado.anioInicio)) : null;
    if (!registro) {
      resultado.push({ periodo, ejercicio: esperado?.ejercicio || "", estado: "NO_PRESENTO", etiqueta: "No presentó" });
      continue;
    }
    const cumplimiento = calcularCumplimiento90(registro.fecha_inicio_ejercicio || "", registro.fecha_ingreso || "");
    const estado = cumplimiento.estado === "EN_TERMINO" ? "EN_TERMINO" : cumplimiento.estado === "FUERA_DE_TERMINO" ? "FUERA_DE_TERMINO" : "PRESENTO";
    const etiqueta = estado === "EN_TERMINO" ? "En término" : estado === "FUERA_DE_TERMINO" ? "Fuera de término" : "Presentó";
    resultado.push({ periodo, ejercicio: registro.ejercicio || esperado?.ejercicio || "", estado, etiqueta });
  }
  return resultado;
}

function textoContextoPeriodos(periodos) {
  const validos = [...new Set((periodos || []).map(Number).filter(Number.isInteger))].sort((a,b)=>a-b);
  if (!validos.length) return "";
  if (validos.length === 1) {
    const p = validos[0];
    return `Período ${p}: no significa solamente Ejercicio ${p}. Para informar todo el período ${p}, el sistema considera Ejercicio ${p} cuando el Inicio ejercicio es 01-01 y Ejercicio ${p-1}/${String(p).slice(-2)} cuando inicia en otra fecha.`;
  }
  return "Cada período de control reúne el ejercicio calendario y, cuando corresponde por el Inicio ejercicio del Agente, el ejercicio que comenzó el año anterior.";
}

function esReporteNunca(tipo = reporteActivo) {
  return String(tipo || "").endsWith("-nunca");
}

function tipoBaseReporte(tipo = reporteActivo) {
  return String(tipo || "").startsWith("pma") ? "pma" : "cartillas";
}

function filtrarNuncaPresentaron(lista, tipo) {
  if (typeof document === "undefined") return lista || [];
  const base = tipo === "pma" ? "pma" : "cartillas";
  const termino = normalizar(document.getElementById(`report-${base}-search`)?.value || "");
  if (!termino) return lista || [];
  return (lista || []).filter(row => normalizar(`${row.rnos || ""} ${row.denominacion || ""} ${row.sigla || ""}`).includes(termino));
}

function matrizExcelNuncaPresentaron(filas, titulo) {
  const matriz = [[titulo],["Generado",formatearFechaHoraExportacion()],[],["RNAS","DENOMINACIÓN","SIGLA","INICIO EJERCICIO","DOMICILIO","LOCALIDAD","PROVINCIA","TELÉFONO","E-MAIL","WEB","ESTADO","OBSERVACIONES"]];
  for (const os of filas || []) matriz.push([
    String(os.rnos || ""), String(os.denominacion || ""), String(os.sigla || ""), String(os.inicio_ejercicio || ""),
    String(os.domicilio || ""), String(os.localidad || ""), String(os.provincia || ""), String(os.telefono || ""),
    String(os.email || ""), String(os.web || ""), String(os.estado || ""), String(os.observaciones || "")
  ]);
  return matriz;
}

function construirMatrizExcelDetallePresentaciones(filas, metadata = {}) {
  const tipo = metadata.tipo || "Presentaciones";
  const generado = metadata.generado || "";
  const filtros = metadata.filtros || "Todos los registros filtrados";
  const esPma = /^PMA\b/i.test(tipo);
  const encabezados = esPma
    ? ["RNAS","DENOMINACIÓN","EJERCICIO","INICIO PERÍODO","FECHA INGRESO","FECHA LÍMITE","PLAZO","CONDICIÓN","Nº EE","FECHA DISPOSICIÓN","Nº DISPO","OBSERVACIONES"]
    : ["RNAS","DENOMINACIÓN","EJERCICIO","FECHA INGRESO","FECHA LÍMITE","PLAZO","CONDICIÓN","Nº EE","FECHA DISPOSICIÓN","Nº DISPO","OBSERVACIONES"];
  const matriz = [
    [tipo],
    ["Generado", generado],
    ["Filtros aplicados", filtros],
    encabezados
  ];
  for (const row of filas || []) {
    const os = row?.obras_sociales || {};
    const cumplimiento = calcularCumplimiento90(row?.fecha_inicio_ejercicio || "", row?.fecha_ingreso || "");
    const plazo = cumplimiento.estado === "EN_TERMINO" ? "EN TÉRMINO" : cumplimiento.estado === "FUERA_DE_TERMINO" ? "FUERA DE TÉRMINO" : "—";
    const comunes = [
      String(os.rnos || ""),
      String(os.denominacion || ""),
      String(row.ejercicio || "")
    ];
    const detalle = [
      formatFechaPantalla(row.fecha_ingreso),
      formatFechaPantalla(cumplimiento.fechaLimite),
      plazo,
      String(row.condicion || ""),
      String(row.numero_ee || ""),
      formatFechaPantalla(row.fecha_disposicion),
      String(row.numero_disposicion || ""),
      String(row.observaciones || "")
    ];
    matriz.push(esPma ? [...comunes, String(row.inicio_periodo || ""), ...detalle] : [...comunes, ...detalle]);
  }
  return matriz;
}

function crearHojaExcelConDiseno(matriz, titulo = "Reporte", filaEncabezado = 3) {
  if (typeof window === "undefined" || !window.XLSX) return null;
  const hoja = window.XLSX.utils.aoa_to_sheet(matriz);
  const maxCols = Math.max(1, ...(matriz || []).map(r => r.length));
  const lastRow = Math.max(filaEncabezado, (matriz || []).length - 1);
  const headers = matriz?.[filaEncabezado] || [];
  const widths = {
    "RNAS": 11, "DENOMINACIÓN": 48, "EJERCICIO": 12, "INICIO PERÍODO": 15,
    "FECHA INGRESO": 15, "FECHA LÍMITE": 15, "PLAZO": 18, "CONDICIÓN": 18,
    "Nº EE": 35, "FECHA DISPOSICIÓN": 18, "Nº DISPO": 34, "OBSERVACIONES": 46
  };
  hoja["!merges"] = [{ s:{r:0,c:0}, e:{r:0,c:Math.max(0,maxCols-1)} }];
  hoja["!cols"] = headers.map(h => ({ wch: widths[String(h)] || 18 }));
  hoja["!rows"] = [
    { hpt: 28 }, { hpt: 21 }, { hpt: 24 }, { hpt: 28 },
    ...Array.from({length:Math.max(0,lastRow-filaEncabezado)}, () => ({ hpt: 30 }))
  ];
  hoja["!autofilter"] = { ref: window.XLSX.utils.encode_range({s:{r:filaEncabezado,c:0},e:{r:lastRow,c:maxCols-1}}) };
  hoja["!freeze"] = { xSplit: 0, ySplit: filaEncabezado + 1, topLeftCell: `A${filaEncabezado+2}`, activePane: "bottomLeft", state: "frozen" };

  const border = {
    top:{style:"thin",color:{rgb:"D9E2EC"}}, bottom:{style:"thin",color:{rgb:"D9E2EC"}},
    left:{style:"thin",color:{rgb:"D9E2EC"}}, right:{style:"thin",color:{rgb:"D9E2EC"}}
  };
  const titleCell = hoja.A1;
  if (titleCell) titleCell.s = {
    font:{bold:true,sz:17,color:{rgb:"FFFFFF"}}, fill:{fgColor:{rgb:"183153"}},
    alignment:{horizontal:"left",vertical:"center"}
  };
  for (let c=0;c<maxCols;c++) {
    const meta1 = hoja[window.XLSX.utils.encode_cell({r:1,c})];
    const meta2 = hoja[window.XLSX.utils.encode_cell({r:2,c})];
    if (meta1) meta1.s = {font:{sz:10,color:{rgb:c===0?"183153":"52647A"},bold:c===0},alignment:{vertical:"center",wrapText:true}};
    if (meta2) meta2.s = {font:{sz:10,color:{rgb:c===0?"183153":"52647A"},bold:c===0},fill:{fgColor:{rgb:"F4F7FB"}},alignment:{vertical:"center",wrapText:true}};
    const addr = window.XLSX.utils.encode_cell({r:filaEncabezado,c});
    if (hoja[addr]) hoja[addr].s = {
      font:{bold:true,sz:10,color:{rgb:"FFFFFF"}}, fill:{fgColor:{rgb:"23476B"}}, border,
      alignment:{vertical:"center",horizontal:"left",wrapText:true}
    };
  }
  for (let r=filaEncabezado+1;r<=lastRow;r++) {
    for (let c=0;c<maxCols;c++) {
      const addr = window.XLSX.utils.encode_cell({r,c});
      const cell = hoja[addr];
      if (!cell) continue;
      cell.s = {
        font:{sz:9.5,color:{rgb:"172B4D"}}, border,
        fill:{fgColor:{rgb:r%2===0?"F8FAFC":"FFFFFF"}},
        alignment:{vertical:"top",wrapText:true}
      };
      const header = String(headers[c] || "");
      if (["RNAS","EJERCICIO","PLAZO"].includes(header)) cell.s.font.bold = true;
      if (header === "PLAZO" && String(cell.v || "").includes("FUERA")) {
        cell.s.fill = {fgColor:{rgb:"FCE8EA"}}; cell.s.font.color = {rgb:"9A3441"};
      } else if (header === "PLAZO" && String(cell.v || "").includes("EN TÉRMINO")) {
        cell.s.fill = {fgColor:{rgb:"E5F3ED"}}; cell.s.font.color = {rgb:"236B50"};
      }
    }
  }
  return hoja;
}

function filtrarPmaRegistros(lista, filtros = {}) {
  const busqueda = normalizar(filtros.busqueda || "");
  const ejercicios = new Set((Array.isArray(filtros.ejercicios) ? filtros.ejercicios : (filtros.ejercicio && filtros.ejercicio !== "TODOS" ? [filtros.ejercicio] : [])).map(String));
  const condicion = filtros.condicion || "TODOS";
  const fechaIngreso = filtros.fechaIngreso || "";
  const fechaLimite = filtros.fechaLimite || "";
  return (lista || []).filter(x => {
    const os = x.obras_sociales || {};
    if (ejercicios.size && !ejercicios.has(String(x.ejercicio || ""))) return false;
    if (condicion !== "TODOS" && String(x.condicion || "") !== condicion) return false;
    const cumplimiento = calcularCumplimiento90(x?.fecha_inicio_ejercicio || "", x?.fecha_ingreso || "");
    if (!fechaCoincideFiltro(x?.fecha_ingreso || "", fechaIngreso)) return false;
    if (!fechaCoincideFiltro(cumplimiento?.fechaLimite || "", fechaLimite)) return false;
    if (!busqueda) return true;
    return normalizar([os.rnos, os.denominacion, os.sigla, x.ejercicio, x.analista, x.numero_ee, x.numero_disposicion, x.condicion, x.observaciones].join(" ")).includes(busqueda);
  });
}
function llenarFiltrosPma() {
  if (typeof document === "undefined") return;
  poblarSelectorMultipleEjercicios("pma", pma.map(x => x.ejercicio).filter(Boolean), () => { pmaPage = 1; renderPma(); });
  const fill = (id, label, vals) => {
    const select = document.getElementById(id); if (!select) return;
    const prev = select.value || "TODOS";
    select.innerHTML = `<option value="TODOS">${label}: Todos</option>` + vals.map(v => `<option value="${escaparHtml(v)}">${escaparHtml(v)}</option>`).join("");
    select.value = vals.includes(prev) ? prev : "TODOS";
  };
  fill("pma-condicion-filter","Condición",[...new Set(pma.map(x=>x.condicion).filter(Boolean))].sort());
}
function obtenerPmaFiltradas() {
  let base = filtrarPmaRegistros(pma,{
    busqueda:document.getElementById("pma-search")?.value||"",
    ejercicios:ejerciciosFiltroSeleccionados("pma"),
    condicion:document.getElementById("pma-condicion-filter")?.value||"TODOS",
    fechaIngreso:document.getElementById("pma-ingreso-search")?.value||"",
    fechaLimite:document.getElementById("pma-limite-search")?.value||""
  });
  const notifFiltro = document.getElementById("pma-notificadas-filter")?.value || "TODOS";
  if (notifFiltro !== "TODOS") {
    base = base.filter(r => estadoNotificacionesPma(r.id).estado === notifFiltro);
  }
  return base;
}
function cumplimientoPmaRegistro(row) {
  return calcularCumplimiento90(row?.fecha_inicio_ejercicio || "", row?.fecha_ingreso || "");
}

function colorCondicion(condicion) {
  const mapa = {
    "S/ASIGNAR": "#c0392b",
    "EN ESTUDIO": "#1ca9e6",
    "NOTIFICADO": "#7b4fa3",
    "PROYECTO DE DISPO": "#d9770a",
    "PROYECTO DISPO": "#d9770a",
    "PROCESO SUMARIAL": "#1c9ab8",
    "APROBADO": "#278664",
    "APROBADA": "#278664",
    "OBSERVADO": "#c0392b",
    "PASE A JURIDICO": "#7b4fa3",
    "ARCHIVO": "#6b7280"
  };
  return mapa[condicion] || "inherit";
}

function renderPma() {
  if (typeof document === "undefined") return;
  const tbody = document.getElementById("pma-table-body"); if (!tbody) return;
  const head = document.getElementById("pma-table-head");
  const rows = ordenarPresentacionesPorCampo(obtenerPmaFiltradas(), pmaSortField, pmaSortDirection);
  if (head) {
    head.innerHTML = `<th><button class="sort-button" id="pma-sort-rnas" type="button" title="Ordenar por RNAS">RNAS <span aria-hidden="true">${iconoOrdenTabla(pmaSortField, "rnas", pmaSortDirection)}</span></button></th><th>Denominación</th><th><button class="sort-button" id="pma-sort-ejercicio" type="button" title="Ordenar por ejercicio">Ejercicio <span aria-hidden="true">${iconoOrdenTabla(pmaSortField, "ejercicio", pmaSortDirection)}</span></button></th><th><button class="sort-button" id="pma-sort-ingreso" type="button" title="Ordenar por fecha de ingreso">Ingreso <span aria-hidden="true">${iconoOrdenTabla(pmaSortField, "ingreso", pmaSortDirection)}</span></button></th><th><button class="sort-button" id="pma-sort-fecha-limite" type="button" title="Ordenar por fecha límite">Fecha límite <span aria-hidden="true">${iconoOrdenTabla(pmaSortField, "fecha_limite", pmaSortDirection)}</span></button></th><th>Plazo</th><th>Notif.</th><th>Condición</th><th>Nº EE</th><th>Nº DISPO</th>`;
    head.querySelector("#pma-sort-rnas")?.addEventListener("click", () => cambiarOrdenPresentaciones("pma", "rnas"));
    head.querySelector("#pma-sort-ejercicio")?.addEventListener("click", () => cambiarOrdenPresentaciones("pma", "ejercicio"));
    head.querySelector("#pma-sort-ingreso")?.addEventListener("click", () => cambiarOrdenPresentaciones("pma", "ingreso"));
    head.querySelector("#pma-sort-fecha-limite")?.addEventListener("click", () => cambiarOrdenPresentaciones("pma", "fecha_limite"));
  }
  const pageInfo = paginarRegistros(rows, pmaPage, PAGE_SIZE);
  pmaPage = pageInfo.page;
  tbody.innerHTML = pageInfo.items.map(r => {
    const plazo = cumplimientoPmaRegistro(r);
    const simbolo = simboloCumplimientoPresentacion(plazo.estado);
    const clase = claseCumplimientoPresentacion(plazo.estado);
    const titulo = plazo.estado === "EN_TERMINO" ? "En término" : plazo.estado === "FUERA_DE_TERMINO" ? "Fuera de término" : "Sin datos";
    const notif = estadoNotificacionesPma(r.id);
    const notifCelda = notif.estado === "SIN_NOTIFICAR"
      ? `<span class="notificacion-dot gris" title="Sin notificar"></span>`
      : `<span class="notificacion-dot ${notif.color}" title="${textoEstadoNotificacion(notif.ultima)} · ${notif.ultima.numero}ª notificación"></span>`;
    return `<tr class="pma-row" data-pma-id="${r.id}" tabindex="0" role="button" title="Clic para ver o editar la presentación">
      <td><strong>${escaparHtml(r.obras_sociales?.rnos||"—")}</strong></td>
      <td class="denominacion-cell">${escaparHtml(r.obras_sociales?.denominacion||"—")}</td>
      <td>${escaparHtml(r.ejercicio||"—")}</td>
      <td class="date-cell">${formatFechaPantalla(r.fecha_ingreso)}</td>
      <td class="date-cell">${formatFechaPantalla(plazo.fechaLimite)}</td>
      <td class="deadline-cell"><span class="deadline-icon ${clase}" title="${titulo}" aria-label="${titulo}">${simbolo}</span></td>
      <td class="deadline-cell">${notifCelda}</td>
      <td><strong style="color:${colorCondicion(r.condicion)}">${escaparHtml(r.condicion||"—")}</strong></td>
      <td>${escaparHtml(r.numero_ee||"—")}</td>
      <td>${escaparHtml(r.numero_disposicion||"—")}</td>
    </tr>`;
  }).join("");
  const count=document.getElementById("pma-count");
  if(count) count.textContent=`${rows.length} ${rows.length===1?"presentación":"presentaciones"} · Página ${pageInfo.page} de ${pageInfo.totalPages}`;
  renderPaginacion("pma-pagination", pageInfo, page => { pmaPage = page; renderPma(); });
  const empty=document.getElementById("pma-empty"); if(empty) empty.hidden=rows.length!==0;
  document.querySelectorAll(".pma-row[data-pma-id]").forEach(tr=>{
    const edit=()=>requiereAutenticacion(()=>abrirModalPmaEdicion(Number(tr.dataset.pmaId)));
    tr.addEventListener("click",edit); tr.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();edit();}});
  });
}
async function cargarYRenderizarPma() {
  if(typeof document==="undefined")return;
  const status=document.getElementById("pma-source-status"), count=document.getElementById("pma-count");
  if(count)count.textContent="Cargando presentaciones...";
  try{
    if (!pmaCompleta) { pma = await cargarPmaDesdeSupabase(fetch, true); pmaCargadas = true; }
    try { if (!pmaNotificacionesTodasCargadas) await cargarTodasLasNotificacionesPma(); } catch (error) { console.error("No se pudieron cargar las notificaciones de PMA:", error); }
    llenarFiltrosPma();renderPma();actualizarAvisoHistoricoPma();
  }
  catch(error){pma=[];pmaCargadas=false;renderPma();if(count)count.textContent="0 presentaciones";if(status)status.textContent="Error de conexión con Supabase";
    const empty=document.getElementById("pma-empty");if(empty){empty.hidden=false;empty.textContent=error?.message||"No se pudieron cargar las presentaciones de PMA.";}}
}

function actualizarAvisoHistoricoPma() {
  if (typeof document === "undefined") return;
  const aviso = document.getElementById("pma-historico-aviso");
  if (!aviso) return;
  aviso.hidden = pmaCompleta;
}

async function cargarHistoricoCompletoPma() {
  if (typeof document === "undefined" || pmaCompleta) return;
  const boton = document.getElementById("pma-historico-btn");
  if (boton) { boton.disabled = true; boton.textContent = "Cargando..."; }
  try {
    pma = await cargarPmaDesdeSupabase();
    pmaCargadas = true;
    pmaCompleta = true;
    llenarFiltrosPma();
    renderPma();
    actualizarAvisoHistoricoPma();
  } catch (error) {
    mostrarToast("No se pudo cargar el histórico completo.");
    if (boton) { boton.disabled = false; boton.textContent = "Ver historial completo"; }
  }
}

function cumplimientoCartillaRegistro(row) {
  return calcularCumplimiento90(row?.fecha_inicio_ejercicio || "", row?.fecha_ingreso || "");
}

function llenarFiltroEjercicios() {
  if (typeof document === "undefined") return;
  poblarSelectorMultipleEjercicios("cartilla", cartillas.map(c => c.ejercicio).filter(Boolean), () => { cartillaPage = 1; renderCartillas(); });
  const select = document.getElementById("cartilla-condicion-filter");
  if (select) {
    const prev = select.value || "TODOS";
    const vals = [...new Set(cartillas.map(c => c.condicion).filter(Boolean))].sort();
    select.innerHTML = `<option value="TODOS">Condición: Todas</option>` + vals.map(v => `<option value="${escaparHtml(v)}">${escaparHtml(v)}</option>`).join("");
    select.value = vals.includes(prev) ? prev : "TODOS";
  }
}

function filtrarCartillas() {
  if (typeof document === "undefined") return cartillas;
  let base = filtrarCartillasRegistros(cartillas, {
    busqueda: document.getElementById("cartilla-search")?.value || "",
    ejercicios: ejerciciosFiltroSeleccionados("cartilla"),
    plazo: document.getElementById("cartilla-plazo-filter")?.value || "TODOS",
    condicion: document.getElementById("cartilla-condicion-filter")?.value || "TODOS",
    fechaIngreso: document.getElementById("cartilla-ingreso-search")?.value || "",
    fechaLimite: document.getElementById("cartilla-limite-search")?.value || ""
  });
  const notifFiltro = document.getElementById("cartilla-notificadas-filter")?.value || "TODOS";
  if (notifFiltro !== "TODOS") {
    base = base.filter(c => estadoNotificacionesCartilla(c.id).estado === notifFiltro);
  }
  return base;
}

function renderCartillas() {
  if (typeof document === "undefined") return;
  const tbody = document.getElementById("cartilla-table-body");
  if (!tbody) return;
  const head = document.getElementById("cartilla-table-head");
  const filtradas = ordenarPresentacionesPorCampo(filtrarCartillas(), cartillaSortField, cartillaSortDirection);
  if (head) {
    head.innerHTML = `<th><button class="sort-button" id="cartilla-sort-rnas" type="button" title="Ordenar por RNAS">RNAS <span aria-hidden="true">${iconoOrdenTabla(cartillaSortField, "rnas", cartillaSortDirection)}</span></button></th><th>Denominación</th><th><button class="sort-button" id="cartilla-sort-ejercicio" type="button" title="Ordenar por ejercicio">Ejercicio <span aria-hidden="true">${iconoOrdenTabla(cartillaSortField, "ejercicio", cartillaSortDirection)}</span></button></th><th><button class="sort-button" id="cartilla-sort-ingreso" type="button" title="Ordenar por fecha de ingreso">Ingreso <span aria-hidden="true">${iconoOrdenTabla(cartillaSortField, "ingreso", cartillaSortDirection)}</span></button></th><th><button class="sort-button" id="cartilla-sort-fecha-limite" type="button" title="Ordenar por fecha límite">Fecha límite <span aria-hidden="true">${iconoOrdenTabla(cartillaSortField, "fecha_limite", cartillaSortDirection)}</span></button></th><th>Plazo</th><th>Notif.</th><th>Condición</th><th>Nº EE</th><th>Nº DISPO</th>`;
    head.querySelector("#cartilla-sort-rnas")?.addEventListener("click", () => cambiarOrdenPresentaciones("cartilla", "rnas"));
    head.querySelector("#cartilla-sort-ejercicio")?.addEventListener("click", () => cambiarOrdenPresentaciones("cartilla", "ejercicio"));
    head.querySelector("#cartilla-sort-ingreso")?.addEventListener("click", () => cambiarOrdenPresentaciones("cartilla", "ingreso"));
    head.querySelector("#cartilla-sort-fecha-limite")?.addEventListener("click", () => cambiarOrdenPresentaciones("cartilla", "fecha_limite"));
  }
  const pageInfo = paginarRegistros(filtradas, cartillaPage, PAGE_SIZE);
  cartillaPage = pageInfo.page;
  tbody.innerHTML = pageInfo.items.map(c => {
    const os = c.obras_sociales || {};
    const plazo = cumplimientoCartillaRegistro(c);
    const simbolo = simboloCumplimientoPresentacion(plazo.estado);
    const clase = claseCumplimientoPresentacion(plazo.estado);
    const titulo = plazo.estado === "EN_TERMINO" ? "En término" : plazo.estado === "FUERA_DE_TERMINO" ? "Fuera de término" : "Sin datos";
    const notif = estadoNotificacionesCartilla(c.id);
    const notifCelda = notif.estado === "SIN_NOTIFICAR"
      ? `<span class="notificacion-dot gris" title="Sin notificar"></span>`
      : `<span class="notificacion-dot ${notif.color}" title="${textoEstadoNotificacion(notif.ultima)} · ${notif.ultima.numero}ª notificación"></span>`;
    return `<tr class="cartilla-row" data-cartilla-id="${c.id}" tabindex="0" role="button" title="Clic para ver o editar la presentación">
      <td><strong>${escaparHtml(os.rnos || "—")}</strong></td>
      <td class="denominacion-cell">${escaparHtml(os.denominacion || "—")}</td>
      <td>${escaparHtml(c.ejercicio || "—")}</td>
      <td class="date-cell">${formatFechaPantalla(c.fecha_ingreso)}</td>
      <td class="date-cell">${formatFechaPantalla(plazo.fechaLimite)}</td>
      <td class="deadline-cell"><span class="deadline-icon ${clase}" title="${titulo}" aria-label="${titulo}">${simbolo}</span></td>
      <td class="deadline-cell">${notifCelda}</td>
      <td><strong style="color:${colorCondicion(c.condicion)}">${escaparHtml(c.condicion || "—")}</strong></td>
      <td>${escaparHtml(c.numero_ee || "—")}</td>
      <td>${escaparHtml(c.numero_disposicion || "—")}</td>
    </tr>`;
  }).join("");
  const count = document.getElementById("cartilla-count");
  if (count) count.textContent = `${filtradas.length} ${filtradas.length === 1 ? "presentación" : "presentaciones"} · Página ${pageInfo.page} de ${pageInfo.totalPages}`;
  renderPaginacion("cartilla-pagination", pageInfo, page => { cartillaPage = page; renderCartillas(); });
  const empty = document.getElementById("cartilla-empty");
  if (empty) empty.hidden = filtradas.length !== 0;
  document.querySelectorAll(".cartilla-row[data-cartilla-id]").forEach(row => {
    const editar = () => requiereAutenticacion(() => abrirModalCartillaEdicion(Number(row.dataset.cartillaId)));
    row.addEventListener("click", editar);
    row.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editar(); } });
  });
}

async function cargarYRenderizarCartillas() {
  if (typeof document === "undefined") return;
  const status = document.getElementById("cartilla-source-status");

  try {
    if (!cartillasCompleta) {
      cartillas = await cargarCartillasDesdeSupabase(fetch, true);
      cartillasCargadas = true;
    }
  } catch (error) {
    cartillas = [];
    cartillasCargadas = false;
    renderCartillas();
    if (status) status.textContent = "Error de conexión con Supabase";
    const empty = document.getElementById("cartilla-empty");
    if (empty) { empty.hidden = false; empty.textContent = error?.message || "No se pudieron cargar las presentaciones."; }
    return;
  }

  try {
    if (!cartillaNotificacionesTodasCargadas) await cargarTodasLasNotificacionesCartillas();
  } catch (error) {
    console.error("No se pudieron cargar las notificaciones:", error);
  }

  llenarFiltroEjercicios();
  renderCartillas();
  actualizarAvisoHistoricoCartillas();
}

function actualizarAvisoHistoricoCartillas() {
  if (typeof document === "undefined") return;
  const aviso = document.getElementById("cartilla-historico-aviso");
  if (!aviso) return;
  aviso.hidden = cartillasCompleta;
}

async function cargarHistoricoCompletoCartillas() {
  if (typeof document === "undefined" || cartillasCompleta) return;
  const boton = document.getElementById("cartilla-historico-btn");
  if (boton) { boton.disabled = true; boton.textContent = "Cargando..."; }
  try {
    cartillas = await cargarCartillasDesdeSupabase();
    cartillasCargadas = true;
    cartillasCompleta = true;
    llenarFiltroEjercicios();
    renderCartillas();
    actualizarAvisoHistoricoCartillas();
  } catch (error) {
    mostrarToast("No se pudo cargar el histórico completo.");
    if (boton) { boton.disabled = false; boton.textContent = "Ver historial completo"; }
  }
}


function resumenPeriodosSeleccionados(periodosSeleccionados, periodosDisponibles = []) {
  const seleccionados = ordenarEjercicios(periodosSeleccionados, true);
  const disponibles = ordenarEjercicios(periodosDisponibles, true);
  if (!seleccionados.length) return "Seleccionar ejercicios";
  if (disponibles.length && seleccionados.length === disponibles.length) return "Todos los ejercicios seleccionados";
  if (seleccionados.length === 1) return `Ejercicio: ${seleccionados[0]}`;
  return `${seleccionados.length} ejercicios`;
}

function getPeriodosReporteSeleccionados() {
  if (typeof document === "undefined") return [];
  return ordenarEjercicios([...document.querySelectorAll('input[name="report-periodo"]:checked')].map(input => input.value), true);
}

function actualizarResumenPeriodosReporte() {
  if (typeof document === "undefined") return;
  const resumen = document.getElementById("report-period-summary");
  const disponibles = [...document.querySelectorAll('input[name="report-periodo"]')].map(input => input.value);
  if (resumen) resumen.textContent = resumenPeriodosSeleccionados(getPeriodosReporteSeleccionados(), disponibles);
}

function seleccionarTodosPeriodosReporte(seleccionar) {
  if (typeof document === "undefined") return;
  document.querySelectorAll('input[name="report-periodo"]').forEach(input => {
    input.checked = Boolean(seleccionar);
  });
  reportCartillasPage = 1;
  actualizarResumenPeriodosReporte();
  renderReporteFaltantesCartillas();
}

function poblarPeriodosReporte() {
  if (typeof document === "undefined") return;
  const container = document.getElementById("report-periodos");
  if (!container) return;
  const seleccionadosAntes = new Set(getPeriodosReporteSeleccionados());
  const ejercicios = ordenarEjercicios(cartillas.map(c => c.ejercicio).filter(Boolean), true);
  const preferido = ejercicios.find(e => e === String(new Date().getFullYear())) || ejercicios[0] || "";
  container.innerHTML = ejercicios.map(ejercicio => {
    const checked = seleccionadosAntes.size ? seleccionadosAntes.has(ejercicio) : ejercicio === preferido;
    return `<label class="period-check"><input type="checkbox" name="report-periodo" value="${escaparHtml(ejercicio)}" ${checked ? "checked" : ""}><span>${escaparHtml(ejercicio)}</span></label>`;
  }).join("");
  container.querySelectorAll('input[name="report-periodo"]').forEach(input => input.addEventListener("change", () => {
    reportCartillasPage = 1;
    actualizarResumenPeriodosReporte();
    renderReporteFaltantesCartillas();
  }));
  actualizarResumenPeriodosReporte();
}

function reporteTieneFaltante(row, periodos) {
  return periodos.some(periodo => {
    const estado = row?.periodos?.[periodo]?.estado;
    return estado === "NO_PRESENTO" || estado === "SIN_INICIO";
  });
}

function obtenerFilasReporteCartillas(reporte, periodos) {
  if (typeof document === "undefined") return ordenarReportePorRnas(reporte || [], reportCartillasRnasSortDirection);
  const termino = normalizar(document.getElementById("report-cartillas-search")?.value || "");
  const soloFaltantes = Boolean(document.getElementById("report-solo-faltantes")?.checked);
  const filtradas = (reporte || []).filter(row => {
    if (soloFaltantes && !reporteTieneFaltante(row, periodos)) return false;
    if (!termino) return true;
    return normalizar(`${row.rnos} ${row.denominacion}`).includes(termino);
  });
  return ordenarReportePorRnas(filtradas, reportCartillasRnasSortDirection);
}

function etiquetaEstadoReporte(estado) {
  if (estado === "PRESENTO") return "Presentó";
  if (estado === "NO_PRESENTO") return "No presentó";
  return "Sin Inicio ejercicio";
}

function claseEstadoReporte(estado) {
  if (estado === "PRESENTO") return "ok";
  if (estado === "NO_PRESENTO") return "missing";
  return "unknown";
}

function renderGraficoUnPeriodo(containerId, item) {
  if (typeof document === "undefined") return;
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!item) {
    container.innerHTML = '<div class="chart-empty">Seleccioná un período para ver el gráfico.</div>';
    return;
  }

  const valores = [
    { etiqueta: "Presentaron", valor: Number(item.presentaron) || 0, clase: "presented" },
    { etiqueta: "No presentaron", valor: Number(item.noPresentaron) || 0, clase: "missing" }
  ];
  const maximo = Math.max(1, ...valores.map(x => x.valor));

  container.innerHTML = `<div class="single-chart-title">Ejercicio ${item.periodo}</div>
    <div class="single-chart-bars">
      ${valores.map(x => `<div class="single-chart-row">
        <span class="single-chart-label">${escaparHtml(x.etiqueta)}</span>
        <div class="single-chart-track"><div class="single-chart-fill ${x.clase}" style="width:${Math.max(1, Math.round((x.valor / maximo) * 100))}%"></div></div>
        <strong>${x.valor}</strong>
      </div>`).join("")}
    </div>`;
}

function sincronizarPeriodoGrafico(selectId, periodos) {
  if (typeof document === "undefined") return null;
  const select = document.getElementById(selectId);
  if (!select) return null;
  const validos = ordenarEjercicios(periodos, true);
  const anterior = ejercicioCanonico(select.value) || select.value;
  select.innerHTML = validos.map(p => `<option value="${escaparHtml(p)}">${escaparHtml(p)}</option>`).join("");
  const elegido = validos.includes(anterior) ? anterior : (validos[0] || null);
  if (elegido !== null) select.value = elegido;
  return elegido;
}

function renderGraficoCartillas(reporte) {
  const periodos = getPeriodosReporteSeleccionados();
  renderGraficoUnPeriodo("report-cartillas-chart", resumirCombinadoPeriodos(reporte, periodos));
}


function abrirHistorialPresentaciones(tipo, obraSocialId) {
  if (typeof document === "undefined") return;
  const esPma = tipo === "pma";
  const fuente = esPma ? pma : cartillas;
  const os = obrasSociales.find(item => String(item?.id) === String(obraSocialId));
  if (!os) return;
  const historial = construirHistorialPresentaciones(fuente, obraSocialId);
  const evolucion = construirEvolucionPresentaciones(os, fuente);
  const title = document.getElementById("history-title");
  const meta = document.getElementById("history-agent-meta");
  const count = document.getElementById("history-count");
  const body = document.getElementById("history-table-body");
  const empty = document.getElementById("history-empty");
  const evolution = document.getElementById("history-evolution");
  if (title) title.textContent = esPma ? "Presentación de PMA" : "Presentación de Cartilla";
  const sigla = os.sigla ? ` (${os.sigla})` : "";
  if (meta) meta.innerHTML = `<b>RNAS ${escaparHtml(os.rnos || "—")}</b> · ${escaparHtml(os.denominacion || "—")}${escaparHtml(sigla)} · <b>Inicio ejercicio:</b> ${escaparHtml(os.inicio_ejercicio || "—")}`;
  if (count) count.textContent = `${historial.length} ${historial.length === 1 ? "presentación realizada" : "presentaciones realizadas"}`;
  if (evolution) {
    evolution.innerHTML = evolucion.length ? `<div class="history-evolution-title">Evolución de presentaciones</div><div class="history-timeline">${evolucion.map(item => `<div class="history-evolution-item ${item.estado.toLowerCase()}"><span class="history-evolution-year">${item.periodo}</span><span class="history-evolution-dot" aria-hidden="true"></span><span class="history-evolution-label">${escaparHtml(item.etiqueta)}</span></div>`).join("")}</div>` : "";
    evolution.hidden = !evolucion.length;
  }
  if (body) body.innerHTML = historial.map(row => {
    const clase = row.plazoEstado === "EN_TERMINO" ? "active" : row.plazoEstado === "FUERA_DE_TERMINO" ? "inactive" : "neutral-badge";
    return `<tr><td><strong>${escaparHtml(row.ejercicio || "—")}</strong></td><td class="history-wrap-cell">${escaparHtml(row.numero_ee || "—")}</td><td class="date-cell">${formatFechaPantalla(row.fecha_ingreso)}</td><td class="date-cell">${formatFechaPantalla(row.fecha_disposicion)}</td><td class="history-wrap-cell">${escaparHtml(row.numero_disposicion || "—")}</td><td><span class="badge ${clase}">${escaparHtml(row.plazoTexto)}</span></td></tr>`;
  }).join("");
  if (empty) empty.hidden = historial.length !== 0;
  abrirModal("history-modal");
}

function activarFilasHistorialReporte(tipo, selector) {
  if (typeof document === "undefined") return;
  document.querySelectorAll(selector).forEach(row => {
    const abrir = () => abrirHistorialPresentaciones(tipo, row.dataset.historyOsId);
    row.addEventListener("click", abrir);
    row.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); abrir(); } });
  });
}

function registrosDetalleParaReporte(tipo, filasReporte, periodos) {
  const fuente = tipo === "pma" ? pma : cartillas;
  const ids = new Set((filasReporte || []).map(row => String(row?.id)));
  const ejercicios = new Set(ordenarEjercicios(periodos, false));
  return fuente.filter(reg => ids.has(String(reg.obra_social_id)) && ejercicios.has(ejercicioCanonico(reg.ejercicio) || String(reg.ejercicio || "").trim()));
}

function matrizResumenReporte(filas, periodos, titulo) {
  const matriz = [[titulo],["Generado",formatearFechaHoraExportacion()],[],["RNAS","DENOMINACIÓN","SIGLA","INICIO EJERCICIO",...(periodos||[]).map(String)]];
  for (const row of filas || []) {
    const os = obrasSociales.find(item => String(item?.id) === String(row?.id)) || {};
    matriz.push([String(row.rnos||""),String(row.denominacion||""),String(os.sigla||""),String(os.inicio_ejercicio||""),...(periodos||[]).map(p=>etiquetaEstadoReporte(row?.periodos?.[p]?.estado))]);
  }
  return matriz;
}

function resumenFiltrosModulo(tipo) {
  if (typeof document === "undefined") return "Filtros actuales";
  const esPma = tipo === "pma";
  const prefix = esPma ? "pma" : "cartilla";
  const ejercicios = ejerciciosFiltroSeleccionados(prefix);
  const totalOpciones = document.querySelectorAll(`input[name="${prefix}-ejercicio-opcion"]`).length;
  const partes = [];
  partes.push(!ejercicios.length || ejercicios.length === totalOpciones ? "Ejercicios: Todos" : `Ejercicios: ${ejercicios.join(", ")}`);
  const busqueda = document.getElementById(esPma ? "pma-search" : "cartilla-search")?.value?.trim();
  if (busqueda) partes.push(`Búsqueda: ${busqueda}`);
  if (esPma) {
    const condicion = document.getElementById("pma-condicion-filter")?.value || "TODOS";
    if (condicion !== "TODOS") partes.push(`Condición: ${condicion}`);
  } else {
    const plazo = document.getElementById("cartilla-plazo-filter")?.value || "TODOS";
    if (plazo !== "TODOS") partes.push(`Plazo: ${plazo === "EN_TERMINO" ? "En término" : "Fuera de término"}`);
  }
  return partes.join(" · ");
}

function exportarModuloPresentacionesExcel(tipo) {
  if (typeof document === "undefined") return;
  if (!window.XLSX) { mostrarToast("No se pudo cargar el generador de Excel. Recargá la página e intentá nuevamente.","error"); return; }
  const esPma = tipo === "pma";
  const filas = esPma ? obtenerPmaFiltradas() : filtrarCartillas();
  const nombre = esPma ? "PMA" : "Cartillas";
  const matriz = construirMatrizExcelDetallePresentaciones(filas,{
    tipo:`${nombre} - Presentaciones`,
    generado:formatearFechaHoraExportacion(),
    filtros:resumenFiltrosModulo(tipo)
  });
  const hoja = crearHojaExcelConDiseno(matriz, nombre, 3);
  const libro = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(libro,hoja,nombre);
  window.XLSX.writeFile(libro,`${nombre.toLowerCase()}_presentaciones_${new Date().toISOString().slice(0,10)}.xlsx`,{cellStyles:true});
}

function renderReporteFaltantesCartillas() {
  if (typeof document === "undefined") return;
  configurarModoPanelReporte("cartillas", false);
  const head = document.getElementById("report-cartillas-head");
  const body = document.getElementById("report-cartillas-body");
  const count = document.getElementById("report-cartillas-count");
  const empty = document.getElementById("report-cartillas-empty");
  if (!head || !body) return;

  const ejercicios = getPeriodosReporteSeleccionados();
  const arrow = reportCartillasRnasSortDirection === "asc" ? "↑" : "↓";
  head.innerHTML = `<tr><th><button class="sort-button" id="report-cartillas-rnas-sort" type="button" title="Ordenar RNAS">RNAS <span aria-hidden="true">${arrow}</span></button></th><th>Denominación</th>${ejercicios.map(e => `<th class="period-head">${escaparHtml(e)}</th>`).join("")}</tr>`;
  head.querySelector("#report-cartillas-rnas-sort")?.addEventListener("click", () => {
    reportCartillasRnasSortDirection = reportCartillasRnasSortDirection === "asc" ? "desc" : "asc";
    reportCartillasPage = 1;
    renderReporteFaltantesCartillas();
  });

  if (!ejercicios.length) {
    body.innerHTML = "";
    renderPaginacion("report-cartillas-pagination", null, () => {});
    renderGraficoCartillas([]);
    if (count) count.textContent = "Seleccioná al menos un ejercicio";
    if (empty) { empty.hidden = false; empty.textContent = "Seleccioná uno o más ejercicios para generar el reporte."; }
    return;
  }

  const reporte = generarReporteFaltantesPorEjercicio(obrasSociales, cartillas, ejercicios);
  const filtrado = obtenerFilasReporteCartillas(reporte, ejercicios);
  const sector = document.getElementById("report-cartillas-chart-sector");
  if (sector && !sector.hidden) renderGraficoCartillas(reporte);

  const pageInfo = paginarRegistros(filtrado, reportCartillasPage, PAGE_SIZE);
  reportCartillasPage = pageInfo.page;
  body.innerHTML = pageInfo.items.map(row => `<tr class="report-agent-row report-cartillas-history-row" data-history-os-id="${escaparHtml(row.id)}" tabindex="0" role="button" title="Ver historial completo de presentaciones">
    <td><strong>${escaparHtml(row.rnos || "—")}</strong></td>
    <td class="denominacion-cell">${escaparHtml(row.denominacion || "—")}</td>
    ${ejercicios.map(e => {
      const estado = row.periodos?.[e]?.estado || "NO_PRESENTO";
      return `<td class="report-status-cell"><span class="report-icon ${claseEstadoReporte(estado)}" title="${escaparHtml(etiquetaEstadoReporte(estado))}" aria-label="${escaparHtml(etiquetaEstadoReporte(estado))}">${simboloEstadoReporte(estado)}</span></td>`;
    }).join("")}
  </tr>`).join("");

  activarFilasHistorialReporte("cartillas", ".report-cartillas-history-row");
  renderPaginacion("report-cartillas-pagination", pageInfo, page => { reportCartillasPage = page; renderReporteFaltantesCartillas(); });
  const faltantes = reporte.filter(row => reporteTieneFaltante(row, ejercicios)).length;
  if (count) count.textContent = `${filtrado.length} ${filtrado.length === 1 ? "Agente de Seguro" : "Agentes de Seguro"} · Página ${pageInfo.page} de ${pageInfo.totalPages}`;
  const status = document.getElementById("report-cartillas-status");
  if (status) status.textContent = `${faltantes} con faltantes · ${reporte.length} agentes activos evaluados`;
  if (empty) { empty.hidden = filtrado.length !== 0; empty.textContent = "No hay Agentes de Seguro para mostrar con los filtros seleccionados."; }
}

function formatearFechaHoraExportacion(fecha = new Date()) {
  const pad = value => String(value).padStart(2, "0");
  return `${pad(fecha.getDate())}-${pad(fecha.getMonth() + 1)}-${fecha.getFullYear()} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

function exportarReporteCartillasExcel() {
  if (typeof document === "undefined") return;
  const periodos=getPeriodosReporteSeleccionados(); if(!periodos.length){mostrarToast("Seleccioná al menos un ejercicio para exportar.","error");return;}
  if(!window.XLSX){mostrarToast("No se pudo cargar el generador de Excel. Recargá la página e intentá nuevamente.","error");return;}
  const reporte=generarReporteFaltantesPorEjercicio(obrasSociales,cartillas,periodos); const filas=obtenerFilasReporteCartillas(reporte,periodos);
  const resumen=matrizResumenReporte(filas,periodos,"Cartillas - Presentaciones");
  const detalle=construirMatrizExcelDetallePresentaciones(registrosDetalleParaReporte("cartillas",filas,periodos),{tipo:"Cartillas - Detalle de presentaciones",generado:formatearFechaHoraExportacion()});
  const libro=window.XLSX.utils.book_new(); window.XLSX.utils.book_append_sheet(libro,crearHojaExcelConDiseno(resumen,"Cartillas",3),"Reporte"); window.XLSX.utils.book_append_sheet(libro,crearHojaExcelConDiseno(detalle,"Detalle",3),"Presentaciones");
  window.XLSX.writeFile(libro,`reporte_cartillas_${periodos.join("-")}.xlsx`);
}

function mostrarGraficoReporte(tipo, mostrar = true) {
  if (typeof document === "undefined") return;
  const sector = document.getElementById(tipo === "pma" ? "report-pma-chart-sector" : "report-cartillas-chart-sector");
  if (!sector) return;
  sector.hidden = !mostrar;
  if (!mostrar) return;
  if (tipo === "pma") renderReporteFaltantesPma();
  else renderReporteFaltantesCartillas();
}

function actualizarCabeceraReporte(tipo) {
  if (typeof document === "undefined") return;
  const base = tipoBaseReporte(tipo);
  const nunca = esReporteNunca(tipo);
  const eyebrow = document.getElementById("report-current-eyebrow");
  const title = document.getElementById("report-current-title");
  const description = document.getElementById("report-current-description");
  if (eyebrow) eyebrow.textContent = base === "pma" ? "PMA" : "CARTILLAS";
  if (title) title.textContent = nunca ? "Agentes de Seguro que nunca presentaron" : "Agentes de Seguro sin presentación";
  if (description) description.textContent = nunca
    ? `Identifica los Agentes de Seguro que no tienen ninguna presentación histórica de ${base === "pma" ? "PMA" : "Cartillas"} cargada en el sistema.`
    : "Seleccioná uno o más ejercicios para ver qué Agentes presentaron y cuáles no.";
  const cartSearch = document.getElementById("report-cartillas-search-wrap");
  const pmaSearch = document.getElementById("report-pma-search-wrap");
  if (cartSearch) cartSearch.hidden = base !== "cartillas";
  if (pmaSearch) pmaSearch.hidden = base !== "pma";
}

function configurarModoPanelReporte(tipo, nunca) {
  if (typeof document === "undefined") return;
  const filtros = document.getElementById(`report-${tipo}-filters`);
  const legend = document.getElementById(`report-${tipo}-legend`);
  const chart = document.getElementById(`report-${tipo}-chart-sector`);
  if (filtros) filtros.hidden = Boolean(nunca);
  if (legend) legend.hidden = Boolean(nunca);
  if (chart && nunca) chart.hidden = true;
}

function renderReporteNuncaPresentaron(tipo) {
  if (typeof document === "undefined") return;
  const fuente = tipo === "pma" ? pma : cartillas;
  const head = document.getElementById(`report-${tipo}-head`);
  const body = document.getElementById(`report-${tipo}-body`);
  const count = document.getElementById(`report-${tipo}-count`);
  const status = document.getElementById(`report-${tipo}-status`);
  const empty = document.getElementById(`report-${tipo}-empty`);
  if (!head || !body) return;
  configurarModoPanelReporte(tipo, true);
  const direccion = tipo === "pma" ? reportPmaRnasSortDirection : reportCartillasRnasSortDirection;
  const arrow = direccion === "asc" ? "↑" : "↓";
  head.innerHTML = `<tr><th><button class="sort-button" id="report-${tipo}-rnas-sort" type="button" title="Ordenar RNAS">RNAS <span aria-hidden="true">${arrow}</span></button></th><th>Denominación</th><th>Sigla</th><th>Inicio ejercicio</th></tr>`;
  head.querySelector(`#report-${tipo}-rnas-sort`)?.addEventListener("click", () => {
    if (tipo === "pma") reportPmaRnasSortDirection = reportPmaRnasSortDirection === "asc" ? "desc" : "asc";
    else reportCartillasRnasSortDirection = reportCartillasRnasSortDirection === "asc" ? "desc" : "asc";
    renderReporteNuncaPresentaron(tipo);
  });
  let filas = identificarNuncaPresentaron(obrasSociales, fuente);
  filas = filtrarNuncaPresentaron(filas, tipo);
  filas = ordenarReportePorRnas(filas, tipo === "pma" ? reportPmaRnasSortDirection : reportCartillasRnasSortDirection);
  const pageVar = tipo === "pma" ? reportPmaPage : reportCartillasPage;
  const pageInfo = paginarRegistros(filas, pageVar, PAGE_SIZE);
  if (tipo === "pma") reportPmaPage = pageInfo.page; else reportCartillasPage = pageInfo.page;
  body.innerHTML = pageInfo.items.map(os => `<tr><td><strong>${escaparHtml(os.rnos || "—")}</strong></td><td class="denominacion-cell">${escaparHtml(os.denominacion || "—")}</td><td>${escaparHtml(os.sigla || "—")}</td><td>${escaparHtml(os.inicio_ejercicio || "—")}</td></tr>`).join("");
  renderPaginacion(`report-${tipo}-pagination`, pageInfo, page => { if (tipo === "pma") reportPmaPage = page; else reportCartillasPage = page; renderReporteNuncaPresentaron(tipo); });
  if (count) count.textContent = `${filas.length} ${filas.length === 1 ? "Agente de Seguro" : "Agentes de Seguro"} que nunca ${filas.length === 1 ? "presentó" : "presentaron"}`;
  if (status) status.textContent = `Sin ninguna presentación histórica de ${tipo === "pma" ? "PMA" : "Cartillas"}`;
  if (empty) { empty.hidden = filas.length !== 0; empty.textContent = "No hay Agentes de Seguro sin presentaciones históricas con ese criterio."; }
}

function actualizarSelectorReporte() {
  if (typeof document === "undefined") return;
  const select = document.getElementById("report-type-select");
  reporteActivo = select?.value || "cartillas";
  reportCartillasPage = 1;
  reportPmaPage = 1;
  const base = tipoBaseReporte(reporteActivo);
  document.querySelectorAll("[data-report-panel]").forEach(panel => {
    panel.hidden = panel.dataset.reportPanel !== base;
  });
  actualizarCabeceraReporte(reporteActivo);
  configurarModoPanelReporte(base, esReporteNunca(reporteActivo));
  const exportButton = document.getElementById("btn-export-report");
  if (exportButton) { exportButton.disabled = false; exportButton.title = "Descargar el reporte actual en Excel"; }
  if (base === "cartillas") cargarYRenderizarReporteCartillas();
  if (base === "pma") cargarYRenderizarReportePma();
}

function cargarReporteActivo() {
  if (typeof document === "undefined") return;
  actualizarSelectorReporte();
}

function exportarReporteNuncaPresentaron(tipo) {
  if (typeof document === "undefined") return;
  if (!window.XLSX) { mostrarToast("No se pudo cargar el generador de Excel. Recargá la página e intentá nuevamente.","error"); return; }
  const fuente = tipo === "pma" ? pma : cartillas;
  let filas = filtrarNuncaPresentaron(identificarNuncaPresentaron(obrasSociales, fuente), tipo);
  filas = ordenarReportePorRnas(filas, tipo === "pma" ? reportPmaRnasSortDirection : reportCartillasRnasSortDirection);
  const nombre = tipo === "pma" ? "PMA" : "Cartillas";
  const matriz = matrizExcelNuncaPresentaron(filas, `${nombre} - Agentes que nunca presentaron`);
  const libro = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(libro, crearHojaExcelConDiseno(matriz, nombre, 3), "Nunca presentaron");
  window.XLSX.writeFile(libro, `${tipo}_nunca_presentaron_${new Date().toISOString().slice(0,10)}.xlsx`);
}

function exportarReporteActivo() {
  if (reporteActivo === "cartillas") return exportarReporteCartillasExcel();
  if (reporteActivo === "pma") return exportarReportePmaExcel();
  if (reporteActivo === "cartillas-nunca") return exportarReporteNuncaPresentaron("cartillas");
  if (reporteActivo === "pma-nunca") return exportarReporteNuncaPresentaron("pma");
  mostrarToast("Este reporte todavía no está disponible.", "error");
}

async function cargarYRenderizarReporteCartillas() {
  if (typeof document === "undefined") return;

  const status = document.getElementById("report-cartillas-status");
  const count = document.getElementById("report-cartillas-count");

  if (reporteCartillasCargado && obrasSociales.length && cartillasCompleta) {
    if (esReporteNunca(reporteActivo)) renderReporteNuncaPresentaron("cartillas"); else renderReporteFaltantesCartillas();
    return;
  }

  if (status) status.textContent = "Cargando Agentes de Seguro y Cartillas...";
  if (count) count.textContent = "Preparando reporte...";

  try {
    if (!obrasSociales.length) {
      obrasSociales = await cargarObrasSocialesDesdeSupabase();
    }

    if (!cartillasCompleta) {
      cartillas = await cargarCartillasDesdeSupabase();
      cartillasCargadas = true;
      cartillasCompleta = true;
      llenarFiltroEjercicios();
    }

    reporteCartillasCargado = true;
    poblarPeriodosReporte();
    if (esReporteNunca(reporteActivo)) renderReporteNuncaPresentaron("cartillas"); else renderReporteFaltantesCartillas();

    if (document.getElementById("report-cartillas-status")?.textContent === "Cargando Agentes de Seguro y Cartillas...") {
      document.getElementById("report-cartillas-status").textContent = "Reporte listo";
    }
  } catch (error) {
    reporteCartillasCargado = false;
    renderGraficoCartillas([]);
    if (count) count.textContent = "No se pudo generar el reporte";
    if (status) status.textContent = "Error de conexión con Supabase";
    const empty = document.getElementById("report-cartillas-empty");
    if (empty) {
      empty.hidden = false;
      empty.textContent = error?.message || "No se pudieron cargar los datos del reporte.";
    }
  }
}


function getPeriodosPmaSeleccionados() {
  if (typeof document === "undefined") return [];
  return ordenarEjercicios([...document.querySelectorAll('input[name="report-pma-periodo"]:checked')].map(input => input.value), true);
}

function actualizarResumenPeriodosPma() {
  if (typeof document === "undefined") return;
  const resumen = document.getElementById("report-pma-period-summary");
  const disponibles = [...document.querySelectorAll('input[name="report-pma-periodo"]')].map(input => input.value);
  if (resumen) resumen.textContent = resumenPeriodosSeleccionados(getPeriodosPmaSeleccionados(), disponibles);
}

function seleccionarTodosPeriodosPma(seleccionar) {
  if (typeof document === "undefined") return;
  document.querySelectorAll('input[name="report-pma-periodo"]').forEach(input => {
    input.checked = Boolean(seleccionar);
  });
  reportPmaPage = 1;
  actualizarResumenPeriodosPma();
  renderReporteFaltantesPma();
}

function poblarPeriodosPma() {
  if (typeof document === "undefined") return;
  const container = document.getElementById("report-pma-periodos");
  if (!container) return;
  const seleccionadosAntes = new Set(getPeriodosPmaSeleccionados());
  const ejercicios = ordenarEjercicios(pma.map(c => c.ejercicio).filter(Boolean), true);
  const preferido = ejercicios.find(e => e === String(new Date().getFullYear())) || ejercicios[0] || "";
  container.innerHTML = ejercicios.map(ejercicio => {
    const checked = seleccionadosAntes.size ? seleccionadosAntes.has(ejercicio) : ejercicio === preferido;
    return `<label class="period-check"><input type="checkbox" name="report-pma-periodo" value="${escaparHtml(ejercicio)}" ${checked ? "checked" : ""}><span>${escaparHtml(ejercicio)}</span></label>`;
  }).join("");
  container.querySelectorAll('input[name="report-pma-periodo"]').forEach(input => input.addEventListener("change", () => {
    reportPmaPage = 1;
    actualizarResumenPeriodosPma();
    renderReporteFaltantesPma();
  }));
  actualizarResumenPeriodosPma();
}

function obtenerFilasReportePma(reporte, periodos) {
  if (typeof document === "undefined") return ordenarReportePorRnas(reporte || [], reportPmaRnasSortDirection);
  const termino = normalizar(document.getElementById("report-pma-search")?.value || "");
  const soloFaltantes = Boolean(document.getElementById("report-pma-solo-faltantes")?.checked);
  const filtradas = (reporte || []).filter(row => {
    if (soloFaltantes && !reporteTieneFaltante(row, periodos)) return false;
    if (!termino) return true;
    return normalizar(`${row.rnos} ${row.denominacion}`).includes(termino);
  });
  return ordenarReportePorRnas(filtradas, reportPmaRnasSortDirection);
}

function renderGraficoPma(reporte) {
  const periodos = getPeriodosPmaSeleccionados();
  renderGraficoUnPeriodo("report-pma-chart", resumirCombinadoPeriodos(reporte, periodos));
}

function renderReporteFaltantesPma() {
  if (typeof document === "undefined") return;
  configurarModoPanelReporte("pma", false);
  const head = document.getElementById("report-pma-head");
  const body = document.getElementById("report-pma-body");
  const count = document.getElementById("report-pma-count");
  const empty = document.getElementById("report-pma-empty");
  if (!head || !body) return;

  const ejercicios = getPeriodosPmaSeleccionados();
  const arrow = reportPmaRnasSortDirection === "asc" ? "↑" : "↓";
  head.innerHTML = `<tr><th><button class="sort-button" id="report-pma-rnas-sort" type="button" title="Ordenar RNAS">RNAS <span aria-hidden="true">${arrow}</span></button></th><th>Denominación</th>${ejercicios.map(e => `<th class="period-head">${escaparHtml(e)}</th>`).join("")}</tr>`;
  head.querySelector("#report-pma-rnas-sort")?.addEventListener("click", () => {
    reportPmaRnasSortDirection = reportPmaRnasSortDirection === "asc" ? "desc" : "asc";
    reportPmaPage = 1;
    renderReporteFaltantesPma();
  });

  if (!ejercicios.length) {
    body.innerHTML = "";
    renderPaginacion("report-pma-pagination", null, () => {});
    renderGraficoPma([]);
    if (count) count.textContent = "Seleccioná al menos un ejercicio";
    if (empty) { empty.hidden = false; empty.textContent = "Seleccioná uno o más ejercicios para generar el reporte."; }
    return;
  }

  const reporte = generarReporteFaltantesPorEjercicio(obrasSociales, pma, ejercicios);
  const filtrado = obtenerFilasReportePma(reporte, ejercicios);
  const sector = document.getElementById("report-pma-chart-sector");
  if (sector && !sector.hidden) renderGraficoPma(reporte);

  const pageInfo = paginarRegistros(filtrado, reportPmaPage, PAGE_SIZE);
  reportPmaPage = pageInfo.page;
  body.innerHTML = pageInfo.items.map(row => `<tr class="report-agent-row report-pma-history-row" data-history-os-id="${escaparHtml(row.id)}" tabindex="0" role="button" title="Ver historial completo de presentaciones">
    <td><strong>${escaparHtml(row.rnos || "—")}</strong></td>
    <td class="denominacion-cell">${escaparHtml(row.denominacion || "—")}</td>
    ${ejercicios.map(e => {
      const estado = row.periodos?.[e]?.estado || "NO_PRESENTO";
      return `<td class="report-status-cell"><span class="report-icon ${claseEstadoReporte(estado)}" title="${escaparHtml(etiquetaEstadoReporte(estado))}" aria-label="${escaparHtml(etiquetaEstadoReporte(estado))}">${simboloEstadoReporte(estado)}</span></td>`;
    }).join("")}
  </tr>`).join("");

  activarFilasHistorialReporte("pma", ".report-pma-history-row");
  renderPaginacion("report-pma-pagination", pageInfo, page => { reportPmaPage = page; renderReporteFaltantesPma(); });
  const faltantes = reporte.filter(row => reporteTieneFaltante(row, ejercicios)).length;
  if (count) count.textContent = `${filtrado.length} ${filtrado.length === 1 ? "Agente de Seguro" : "Agentes de Seguro"} · Página ${pageInfo.page} de ${pageInfo.totalPages}`;
  const status = document.getElementById("report-pma-status");
  if (status) status.textContent = `${faltantes} con faltantes · ${reporte.length} agentes activos evaluados`;
  if (empty) { empty.hidden = filtrado.length !== 0; empty.textContent = "No hay Agentes de Seguro para mostrar con los filtros seleccionados."; }
}

function exportarReportePmaExcel() {
  if (typeof document === "undefined") return;
  const ejercicios = getPeriodosPmaSeleccionados();
  if (!ejercicios.length) { mostrarToast("Seleccioná al menos un ejercicio para exportar.", "error"); return; }
  if (!window.XLSX) { mostrarToast("No se pudo cargar el generador de Excel. Recargá la página e intentá nuevamente.", "error"); return; }
  const reporte = generarReporteFaltantesPorEjercicio(obrasSociales, pma, ejercicios);
  const filas = obtenerFilasReportePma(reporte, ejercicios);
  const resumen = matrizResumenReporte(filas, ejercicios, "PMA - Presentaciones");
  const detalle = construirMatrizExcelDetallePresentaciones(registrosDetalleParaReporte("pma", filas, ejercicios), { tipo:"PMA - Detalle de presentaciones", generado:formatearFechaHoraExportacion() });
  const libro = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(libro, crearHojaExcelConDiseno(resumen, "PMA", 3), "Reporte");
  window.XLSX.utils.book_append_sheet(libro, crearHojaExcelConDiseno(detalle, "Detalle", 3), "Presentaciones");
  window.XLSX.writeFile(libro, `reporte_pma_${ejercicios.join("-")}.xlsx`);
}

async function cargarYRenderizarReportePma() {
  if (typeof document === "undefined") return;
  const status = document.getElementById("report-pma-status");
  const count = document.getElementById("report-pma-count");

  if (reportePmaCargado && obrasSociales.length && pmaCompleta) {
    if (esReporteNunca(reporteActivo)) renderReporteNuncaPresentaron("pma"); else renderReporteFaltantesPma();
    return;
  }

  if (status) status.textContent = "Cargando Agentes de Seguro y PMA...";
  if (count) count.textContent = "Preparando reporte...";

  try {
    if (!obrasSociales.length) obrasSociales = await cargarObrasSocialesDesdeSupabase();
    if (!pmaCompleta) {
      pma = await cargarPmaDesdeSupabase();
      pmaCargadas = true;
      pmaCompleta = true;
    }
    reportePmaCargado = true;
    poblarPeriodosPma();
    if (esReporteNunca(reporteActivo)) renderReporteNuncaPresentaron("pma"); else renderReporteFaltantesPma();
    if (document.getElementById("report-pma-status")?.textContent === "Cargando Agentes de Seguro y PMA...") {
      document.getElementById("report-pma-status").textContent = "Reporte listo";
    }
  } catch (error) {
    reportePmaCargado = false;
    renderGraficoPma([]);
    if (count) count.textContent = "No se pudo generar el reporte";
    if (status) status.textContent = "Error de conexión con Supabase";
    const empty = document.getElementById("report-pma-empty");
    if (empty) {
      empty.hidden = false;
      empty.textContent = error?.message || "No se pudieron cargar los datos del reporte.";
    }
  }
}

function debeCerrarSelectorPeriodoPorClick(selector, target) {
  return Boolean(selector?.open && target && typeof selector.contains === "function" && !selector.contains(target));
}


function poblarObrasSocialesPma() {
  if(typeof document==="undefined")return;
  const list=document.getElementById("pma-os-list"); if(!list)return;
  list.innerHTML=obrasSociales.map(os=>`<option value="${escaparHtml(getObraSocialDisplay(os))}"></option>`).join("");
}
function resolverObraSocialPma(valor) {
  const buscado=normalizar(valor);
  return obrasSociales.find(os=>normalizar(getObraSocialDisplay(os))===buscado)||null;
}
function actualizarAlertaPma() {
  if (typeof document === "undefined") return calcularCumplimiento90("", "");
  const fechaInicio = document.getElementById("pma-fecha-inicio-ejercicio")?.value || "";
  const fechaIngreso = document.getElementById("pma-fecha-ingreso")?.value || "";
  const resultado = calcularCumplimiento90(fechaInicio, fechaIngreso);
  const limite = document.getElementById("pma-fecha-limite");
  if (limite) {
    limite.textContent = formatFechaPantalla(resultado.fechaLimite);
    limite.classList.remove("success", "danger", "neutral");
    limite.classList.add(resultado.estado === "EN_TERMINO" ? "success" : resultado.estado === "FUERA_DE_TERMINO" ? "danger" : "neutral");
  }
  const cumplimiento = document.getElementById("pma-cumplimiento");
  if (cumplimiento) {
    const texto = resultado.estado === "EN_TERMINO"
      ? "EN TÉRMINO"
      : resultado.estado === "FUERA_DE_TERMINO"
        ? "FUERA DE TÉRMINO"
        : "—";
    cumplimiento.textContent = texto;
    cumplimiento.classList.remove("success", "danger", "neutral");
    cumplimiento.classList.add(resultado.estado === "EN_TERMINO" ? "success" : resultado.estado === "FUERA_DE_TERMINO" ? "danger" : "neutral");
  }
  return resultado;
}
function recalcularDatosPma() {
  if (typeof document === "undefined") return;
  const os = resolverObraSocialPma(document.getElementById("pma-os-search")?.value || "");
  const inicio = os?.inicio_ejercicio || "";
  const ejercicioIngresado = document.getElementById("pma-ejercicio")?.value || "";
  const ejercicio = ejercicioCanonico(ejercicioIngresado);
  const anio = anioInicioDesdeEjercicio(ejercicio);
  const fechaInicio = anio ? fechaInicioEjercicioDesdeDiaMes(inicio, anio) : "";
  const fechaFin = anio ? finPeriodoDesdeInicio(inicio, anio) : "";

  document.getElementById("pma-os-id").value = os?.id || "";
  document.getElementById("pma-inicio-periodo").value = inicio;
  document.getElementById("pma-anio-inicio").value = anio || "";
  document.getElementById("pma-fin-periodo").value = diaMesDesdeFechaIso(fechaFin);
  document.getElementById("pma-fecha-inicio-ejercicio").value = fechaInicio;
  document.getElementById("pma-fecha-fin-ejercicio").value = fechaFin;

  actualizarMasterInfoPma(os);
  actualizarAlertaPma();
}
function limpiarFormularioPma() {
  document.getElementById("pma-form")?.reset();
  ["pma-id","pma-os-id","pma-inicio-periodo","pma-fin-periodo","pma-fecha-inicio-ejercicio","pma-fecha-fin-ejercicio","pma-anio-inicio"].forEach(id => document.getElementById(id).value = "");
  const ejercicio = document.getElementById("pma-ejercicio");
  if (ejercicio) ejercicio.value = "";
  document.getElementById("pma-res-170").value = "SI";
  actualizarMasterInfoPma(null);
  setFormMessage("pma-form-message","");
  actualizarAlertaPma();
}
function abrirModalPmaNueva() {
  limpiarFormularioPma();poblarObrasSocialesPma();
  document.getElementById("pma-modal-title").textContent="Nueva presentación de PMA";
  cargarYRenderizarNotificacionesModalPma(null);
  abrirModal("pma-modal");document.getElementById("pma-os-search")?.focus();
}
function abrirModalPmaEdicion(id) {
  const r=pma.find(x=>Number(x.id)===Number(id));if(!r)return;poblarObrasSocialesPma();
  document.getElementById("pma-modal-title").textContent="Editar presentación de PMA";
  document.getElementById("pma-id").value=r.id;document.getElementById("pma-os-id").value=r.obra_social_id||"";
  document.getElementById("pma-os-search").value=getObraSocialDisplay(r.obras_sociales||{});
  document.getElementById("pma-inicio-periodo").value=r.inicio_periodo||r.obras_sociales?.inicio_ejercicio||"";
  document.getElementById("pma-fin-periodo").value=r.fin_periodo||diaMesDesdeFechaIso(r.fecha_fin_ejercicio);
  const inicioPma = r.inicio_periodo || r.obras_sociales?.inicio_ejercicio || "";
  document.getElementById("pma-ejercicio").value =
    ejercicioCanonico(r.ejercicio || derivarEjercicio(inicioPma, r.anio_inicio)) || "";
  document.getElementById("pma-anio-inicio").value =
    r.anio_inicio || anioInicioDesdeEjercicio(document.getElementById("pma-ejercicio").value) || "";
  document.getElementById("pma-fecha-inicio-ejercicio").value=r.fecha_inicio_ejercicio||"";
  document.getElementById("pma-fecha-fin-ejercicio").value=r.fecha_fin_ejercicio||"";document.getElementById("pma-analista").value=r.analista||"";
  document.getElementById("pma-ee").value=r.numero_ee||"";document.getElementById("pma-condicion").value=r.condicion||"";
  document.getElementById("pma-fecha-ingreso").value=r.fecha_ingreso||"";document.getElementById("pma-res-170").value=r.res_170_2009||"";
  document.getElementById("pma-disposicion").value=r.numero_disposicion||"";document.getElementById("pma-fecha-disposicion").value=r.fecha_disposicion||"";
  document.getElementById("pma-observaciones").value=r.observaciones||"";
  actualizarMasterInfoPma(resolverObraSocialPma(document.getElementById("pma-os-search").value) || r.obras_sociales);
  setFormMessage("pma-form-message","");
  actualizarAlertaPma();
  cargarYRenderizarNotificacionesModalPma(r.id);
  abrirModal("pma-modal");
}

// ---------- Notificaciones de PMA (mismo esquema que las de Cartillas) ----------

let pmaNotificacionesActuales = [];
let pmaNotificacionesPmaId = null;
let pmaNotificacionesPorPma = new Map();
let pmaNotificacionesTodasCargadas = false;

function estadoNotificacionesPma(pmaId, hoyISO = hoyLocalISO()) {
  const notifs = (pmaNotificacionesPorPma.get(Number(pmaId)) || []);
  if (!notifs.length) return { estado: "SIN_NOTIFICAR", color: null, ultima: null };
  const ultima = [...notifs].sort((a, b) => (a.numero || 0) - (b.numero || 0)).at(-1);
  const color = colorNotificacion(ultima, hoyISO);
  const estado = ultima.estado === "RESPONDIO" ? "RESPONDIO" : ultima.estado === "NO_RESPONDIO" ? "NO_RESPONDIO" : "PENDIENTE";
  return { estado, color, ultima };
}

function buildPmaNotificacionesUrl(pmaId, id = null) {
  const params = new URLSearchParams();
  params.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  params.set("select", "*");
  if (id !== null) { params.set("id", `eq.${id}`); return `${SUPABASE_URL}/rest/v1/pma_notificaciones?${params.toString()}`; }
  params.set("pma_id", `eq.${pmaId}`);
  params.set("order", "numero.asc");
  return `${SUPABASE_URL}/rest/v1/pma_notificaciones?${params.toString()}`;
}

async function cargarNotificacionesPma(pmaId, fetchImpl = fetch) {
  const response = await fetchConTimeout(buildPmaNotificacionesUrl(pmaId), { method: "GET", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Accept: "application/json" }, cache: "no-store" }, 10000, fetchImpl);
  if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
  return response.json();
}

async function cargarTodasLasNotificacionesPma(fetchImpl = fetch) {
  const pageSize = 1000;
  const all = [];
  for (let offset = 0; ; offset += pageSize) {
    const params = new URLSearchParams();
    params.set("apikey", SUPABASE_PUBLISHABLE_KEY);
    params.set("select", "*");
    params.set("order", "pma_id.asc,numero.asc");
    params.set("limit", String(pageSize));
    params.set("offset", String(offset));
    const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/pma_notificaciones?${params.toString()}`, { method: "GET", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Accept: "application/json" }, cache: "no-store" }, 10000, fetchImpl);
    if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
    const page = await response.json();
    all.push(...page);
    if (page.length < pageSize) break;
  }
  pmaNotificacionesPorPma = new Map();
  all.forEach(n => {
    const lista = pmaNotificacionesPorPma.get(Number(n.pma_id)) || [];
    lista.push(n);
    pmaNotificacionesPorPma.set(Number(n.pma_id), lista);
  });
  pmaNotificacionesTodasCargadas = true;
  return all;
}

async function asegurarNotificacionesPmaCargadas() {
  if (!pmaNotificacionesTodasCargadas) await cargarTodasLasNotificacionesPma();
}

function renderNotificacionesPma() {
  const cont = document.getElementById("pma-notificaciones-lista");
  if (!cont) return;
  const hoyISO = hoyLocalISO();
  cont.innerHTML = pmaNotificacionesActuales.map(n => {
    const color = colorNotificacion(n, hoyISO);
    const clase = n.estado === "RESPONDIO" ? "respondio" : n.estado === "NO_RESPONDIO" ? "no-respondio" : "pendiente";
    const marcar = n.estado === "PENDIENTE"
      ? `<button type="button" class="link-button" data-notif-marcar-pma="RESPONDIO" data-notif-id="${n.id}">Marcar respondida</button>
         <button type="button" class="link-button" data-notif-marcar-pma="NO_RESPONDIO" data-notif-id="${n.id}">No respondió</button>`
      : "";
    return `<div class="notificacion-row">
      <span class="notificacion-dot ${color}" title="${textoEstadoNotificacion(n)}"></span>
      <span class="notificacion-numero">${n.numero}ª notificación</span>
      <span class="notificacion-detalle">Notificada: ${formatFechaPantalla(n.fecha_notificacion)} · Vence: ${formatFechaPantalla(n.fecha_limite_respuesta)}</span>
      <span class="notificacion-estado ${clase}">${textoEstadoNotificacion(n)}</span>
      <div class="notificacion-actions">${marcar}<button type="button" class="notificacion-borrar" data-notif-borrar-pma="${n.id}" title="Borrar esta notificación" aria-label="Borrar esta notificación">×</button></div>
    </div>`;
  }).join("") || `<p class="notificaciones-hint">Todavía no se cargaron notificaciones.</p>`;
  cont.querySelectorAll("[data-notif-marcar-pma]").forEach(btn => {
    btn.addEventListener("click", () => marcarNotificacionEstadoPma(btn.dataset.notifId, btn.dataset.notifMarcarPma));
  });
  cont.querySelectorAll("[data-notif-borrar-pma]").forEach(btn => {
    btn.addEventListener("click", () => borrarNotificacionPma(btn.dataset.notifBorrarPma));
  });
}

async function borrarNotificacionPma(id) {
  if (!(await mostrarConfirmacion("¿Borrar esta notificación? No se puede deshacer.", { titulo: "Borrar notificación", textoAceptar: "Borrar" }))) return;
  try {
    const session = await asegurarSesionVigente();
    const response = await fetchConTimeout(buildPmaNotificacionesUrl(null, id), {
      method: "DELETE", headers: authHeaders(session.access_token)
    }, 10000, fetch);
    if (!response.ok) throw new Error(await leerErrorApi(response) || `Supabase respondió ${response.status}`);
    await cargarYRenderizarNotificacionesModalPma(pmaNotificacionesPmaId);
    pmaNotificacionesTodasCargadas = false;
    mostrarToast("Notificación borrada.");
  } catch (error) {
    mostrarToast(error.message || "No se pudo borrar la notificación.");
  }
}

async function cargarYRenderizarNotificacionesModalPma(pmaId) {
  pmaNotificacionesPmaId = pmaId;
  const hint = document.getElementById("pma-notificaciones-hint");
  const addBtn = document.getElementById("pma-notificacion-add");
  if (!pmaId) {
    pmaNotificacionesActuales = [];
    if (document.getElementById("pma-notificaciones-lista")) document.getElementById("pma-notificaciones-lista").innerHTML = "";
    if (hint) hint.hidden = false;
    if (addBtn) addBtn.hidden = true;
    return;
  }
  if (hint) hint.hidden = true;
  if (addBtn) addBtn.hidden = false;
  try {
    pmaNotificacionesActuales = await cargarNotificacionesPma(pmaId);
    pmaNotificacionesPorPma.set(Number(pmaId), pmaNotificacionesActuales);
    renderNotificacionesPma();
  } catch (error) {
    const lista = document.getElementById("pma-notificaciones-lista");
    if (lista) lista.innerHTML = `<p class="notificaciones-hint">No se pudieron cargar las notificaciones.</p>`;
  }
}

async function agregarNotificacionPma() {
  if (!pmaNotificacionesPmaId) return;
  const cont = document.getElementById("pma-notificaciones-lista");
  if (!cont || cont.querySelector(".notificacion-nueva-row")) return;
  const proximoNumero = (pmaNotificacionesActuales.reduce((max, n) => Math.max(max, n.numero || 0), 0)) + 1;
  const hoy = hoyLocalISO();
  const fila = document.createElement("div");
  fila.className = "notificacion-nueva-row";
  fila.innerHTML = `
    <span class="notificacion-numero">${proximoNumero}ª notificación</span>
    <label style="display:flex;align-items:center;gap:6px;font-size:12px">Fecha
      <input type="date" id="pma-notif-fecha-nueva" value="${hoy}">
    </label>
    <button type="button" class="secondary small" id="pma-notif-guardar">Guardar</button>
    <button type="button" class="link-button" id="pma-notif-cancelar">Cancelar</button>
  `;
  cont.appendChild(fila);
  document.getElementById("pma-notif-cancelar").addEventListener("click", () => fila.remove());
  document.getElementById("pma-notif-guardar").addEventListener("click", async () => {
    const fecha = document.getElementById("pma-notif-fecha-nueva")?.value;
    if (!fecha) { mostrarToast("Elegí la fecha de la notificación."); return; }
    const boton = document.getElementById("pma-notif-guardar");
    boton.disabled = true; boton.textContent = "Guardando...";
    try {
      const session = await asegurarSesionVigente();
      const payload = {
        pma_id: Number(pmaNotificacionesPmaId),
        numero: proximoNumero,
        fecha_notificacion: fecha,
        fecha_limite_respuesta: sumarDiasHabiles(fecha, 10),
        estado: "PENDIENTE"
      };
      const response = await fetchConTimeout(buildPmaNotificacionesUrl(pmaNotificacionesPmaId), {
        method: "POST", headers: { ...authHeaders(session.access_token), Prefer: "return=representation" }, body: JSON.stringify(payload)
      }, 10000, fetch);
      if (!response.ok) throw new Error(await leerErrorApi(response) || `Supabase respondió ${response.status}`);
      await cargarYRenderizarNotificacionesModalPma(pmaNotificacionesPmaId);
      pmaNotificacionesTodasCargadas = false;
      mostrarToast("Notificación cargada.");
    } catch (error) {
      mostrarToast(error.message || "No se pudo guardar la notificación.");
      fila.remove();
    }
  });
}

async function marcarNotificacionEstadoPma(id, estado) {
  try {
    const session = await asegurarSesionVigente();
    const payload = { estado, updated_at: new Date().toISOString(), fecha_respuesta: estado === "RESPONDIO" ? hoyLocalISO() : null };
    const response = await fetchConTimeout(buildPmaNotificacionesUrl(null, id), {
      method: "PATCH", headers: { ...authHeaders(session.access_token), Prefer: "return=representation" }, body: JSON.stringify(payload)
    }, 10000, fetch);
    if (!response.ok) throw new Error(await leerErrorApi(response) || `Supabase respondió ${response.status}`);
    await cargarYRenderizarNotificacionesModalPma(pmaNotificacionesPmaId);
    pmaNotificacionesTodasCargadas = false;
    mostrarToast(estado === "RESPONDIO" ? "Notificación marcada como respondida." : "Notificación marcada como no respondida.");
  } catch (error) {
    mostrarToast(error.message || "No se pudo actualizar la notificación.");
  }
}
function buildPmaWriteUrl(id=null){const p=new URLSearchParams();if(id!==null&&id!==undefined&&id!=="")p.set("id",`eq.${id}`);return `${SUPABASE_URL}/rest/v1/pma?${p.toString()}`;}
async function guardarPmaEnSupabase(registro,id,accessToken,fetchImpl=fetch){
  const editando=id!==null&&id!==undefined&&id!=="";
  const response=await fetchConTimeout(buildPmaWriteUrl(editando?id:null),{method:editando?"PATCH":"POST",headers:{...authHeaders(accessToken),Prefer:"return=representation"},body:JSON.stringify(registro)},10000,fetchImpl);
  if(!response.ok){const detalle=await leerErrorApi(response);throw new Error(detalle||`Supabase respondió ${response.status}.`);}return response.json();
}
async function handlePmaSubmit(event){
  event.preventDefault();setFormMessage("pma-form-message","");const save=document.getElementById("pma-save");if(save)save.disabled=true;
  try{
    const session=await asegurarSesionVigente(),os=resolverObraSocialPma(document.getElementById("pma-os-search")?.value||"");
    if(!os)throw new Error("Seleccioná un Agente de Seguro de Salud del maestro.");
    const inicio=os.inicio_ejercicio||"";if(!inicio)throw new Error("El Agente de Seguro de Salud no tiene Inicio ejercicio cargado. Completalo primero en Agentes de Seguro.");
    const ejercicio=ejercicioCanonico(document.getElementById("pma-ejercicio")?.value||"");
    const anio=anioInicioDesdeEjercicio(ejercicio);
    const fechaInicio=anio?fechaInicioEjercicioDesdeDiaMes(inicio,anio):"",fechaFin=anio?finPeriodoDesdeInicio(inicio,anio):"";
    if(!fechaInicio||!fechaFin||!ejercicio)throw new Error("Ingresá el Ejercicio como 2026 o 2026/27.");
    const registro={obra_social_id:Number(os.id),anio_inicio:anio,ejercicio,inicio_periodo:inicio,fin_periodo:diaMesDesdeFechaIso(fechaFin),
      fecha_inicio_ejercicio:fechaInicio,fecha_fin_ejercicio:fechaFin,analista:document.getElementById("pma-analista")?.value.trim()||null,
      numero_ee:document.getElementById("pma-ee")?.value.trim()||null,condicion:document.getElementById("pma-condicion")?.value||null,
      fecha_ingreso:document.getElementById("pma-fecha-ingreso")?.value||null,res_170_2009:document.getElementById("pma-res-170")?.value||null,
      numero_disposicion:document.getElementById("pma-disposicion")?.value.trim()||null,fecha_disposicion:document.getElementById("pma-fecha-disposicion")?.value||null,
      observaciones:document.getElementById("pma-observaciones")?.value.trim()||null};
    const id=document.getElementById("pma-id")?.value||"";await guardarPmaEnSupabase(registro,id||null,session.access_token);
    cerrarModal("pma-modal");mostrarToast(id?"Presentación de PMA actualizada.":"Presentación de PMA creada.");await cargarYRenderizarPma();reportePmaCargado=false;
  }catch(error){setFormMessage("pma-form-message",error.message||"No se pudo guardar la presentación de PMA.");}
  finally{if(save)save.disabled=false;}
}

// ---------- Notificaciones de Cartilla ----------

let cartillaNotificacionesActuales = [];
let cartillaNotificacionesCartillaId = null;

// Fecha de HOY en el huso horario local del navegador (no UTC): usar
// new Date().toISOString() acá corre el día para adelante después de las
// 21:00 en Argentina (UTC-3), porque toISOString() siempre da la fecha en UTC.
function hoyLocalISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function sumarDiasHabiles(fechaISO, dias) {
  const d = new Date(`${fechaISO}T00:00:00`);
  let agregados = 0;
  while (agregados < dias) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) agregados++;
  }
  return d.toISOString().slice(0, 10);
}

function diasHabilesTranscurridos(fechaISO, hastaISO) {
  const d = new Date(`${fechaISO}T00:00:00`);
  const fin = new Date(`${hastaISO}T00:00:00`);
  let count = 0;
  while (d < fin) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

// Estado visual (color) de UNA notificación puntual, en base a días hábiles transcurridos
// desde que se notificó (verde 1-3, amarillo 4-6, naranja 7-9, rojo 10+) o a si ya se marcó
// respondida / no respondida.
function colorNotificacion(notif, hoyISO = hoyLocalISO()) {
  if (notif.estado === "RESPONDIO") return "verde";
  if (notif.estado === "NO_RESPONDIO") return "rojo";
  const transcurridos = diasHabilesTranscurridos(notif.fecha_notificacion, hoyISO);
  if (transcurridos <= 3) return "verde";
  if (transcurridos <= 6) return "amarillo";
  if (transcurridos <= 9) return "naranja";
  return "rojo";
}

// Estado "resumen" de la cartilla en base a su ÚLTIMA notificación — usado para el
// filtro "Notificadas" de la tabla y para la columna del punto de color.
function estadoNotificacionesCartilla(cartillaId, hoyISO = hoyLocalISO()) {
  const notifs = (cartillaNotificacionesPorCartilla.get(Number(cartillaId)) || []);
  if (!notifs.length) return { estado: "SIN_NOTIFICAR", color: null, ultima: null };
  const ultima = [...notifs].sort((a, b) => (a.numero || 0) - (b.numero || 0)).at(-1);
  const color = colorNotificacion(ultima, hoyISO);
  const estado = ultima.estado === "RESPONDIO" ? "RESPONDIO" : ultima.estado === "NO_RESPONDIO" ? "NO_RESPONDIO" : "PENDIENTE";
  return { estado, color, ultima };
}

function buildCartillaNotificacionesUrl(cartillaId, id = null) {
  const params = new URLSearchParams();
  params.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  params.set("select", "*");
  if (id !== null) { params.set("id", `eq.${id}`); return `${SUPABASE_URL}/rest/v1/cartilla_notificaciones?${params.toString()}`; }
  params.set("cartilla_id", `eq.${cartillaId}`);
  params.set("order", "numero.asc");
  return `${SUPABASE_URL}/rest/v1/cartilla_notificaciones?${params.toString()}`;
}

async function cargarNotificacionesCartilla(cartillaId, fetchImpl = fetch) {
  const response = await fetchConTimeout(buildCartillaNotificacionesUrl(cartillaId), { method: "GET", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Accept: "application/json" }, cache: "no-store" }, 10000, fetchImpl);
  if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
  return response.json();
}

// Cache global: cartilla_id -> lista de notificaciones, usado para el filtro/columna
// de la tabla de Cartillas sin tener que pedir todo el histórico de notificaciones a la vez.
let cartillaNotificacionesPorCartilla = new Map();
let cartillaNotificacionesTodasCargadas = false;

async function cargarTodasLasNotificacionesCartillas(fetchImpl = fetch) {
  const pageSize = 1000;
  const all = [];
  for (let offset = 0; ; offset += pageSize) {
    const params = new URLSearchParams();
    params.set("apikey", SUPABASE_PUBLISHABLE_KEY);
    params.set("select", "*");
    params.set("order", "cartilla_id.asc,numero.asc");
    params.set("limit", String(pageSize));
    params.set("offset", String(offset));
    const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/cartilla_notificaciones?${params.toString()}`, { method: "GET", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Accept: "application/json" }, cache: "no-store" }, 10000, fetchImpl);
    if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
    const page = await response.json();
    all.push(...page);
    if (page.length < pageSize) break;
  }
  cartillaNotificacionesPorCartilla = new Map();
  all.forEach(n => {
    const lista = cartillaNotificacionesPorCartilla.get(Number(n.cartilla_id)) || [];
    lista.push(n);
    cartillaNotificacionesPorCartilla.set(Number(n.cartilla_id), lista);
  });
  cartillaNotificacionesTodasCargadas = true;
  return all;
}

async function asegurarNotificacionesCargadas() {
  if (!cartillaNotificacionesTodasCargadas) await cargarTodasLasNotificacionesCartillas();
}

function textoEstadoNotificacion(notif) {
  if (notif.estado === "RESPONDIO") return `Respondió${notif.fecha_respuesta ? ` (${formatFechaPantalla(notif.fecha_respuesta)})` : ""}`;
  if (notif.estado === "NO_RESPONDIO") return "No respondió";
  return "Pendiente";
}

let cartillaModalSoloLectura = false;

function renderNotificacionesCartilla() {
  const cont = document.getElementById("cartilla-notificaciones-lista");
  if (!cont) return;
  const hoyISO = hoyLocalISO();
  cont.innerHTML = cartillaNotificacionesActuales.map(n => {
    const color = colorNotificacion(n, hoyISO);
    const clase = n.estado === "RESPONDIO" ? "respondio" : n.estado === "NO_RESPONDIO" ? "no-respondio" : "pendiente";
    const marcar = !cartillaModalSoloLectura && n.estado === "PENDIENTE"
      ? `<button type="button" class="link-button" data-notif-marcar="RESPONDIO" data-notif-id="${n.id}">Marcar respondida</button>
         <button type="button" class="link-button" data-notif-marcar="NO_RESPONDIO" data-notif-id="${n.id}">No respondió</button>`
      : "";
    const borrar = cartillaModalSoloLectura ? "" : `<button type="button" class="notificacion-borrar" data-notif-borrar="${n.id}" title="Borrar esta notificación" aria-label="Borrar esta notificación">×</button>`;
    return `<div class="notificacion-row">
      <span class="notificacion-dot ${color}" title="${textoEstadoNotificacion(n)}"></span>
      <span class="notificacion-numero">${n.numero}ª notificación</span>
      <span class="notificacion-detalle">Notificada: ${formatFechaPantalla(n.fecha_notificacion)} · Vence: ${formatFechaPantalla(n.fecha_limite_respuesta)}</span>
      <span class="notificacion-estado ${clase}">${textoEstadoNotificacion(n)}</span>
      <div class="notificacion-actions">${marcar}${borrar}</div>
    </div>`;
  }).join("") || `<p class="notificaciones-hint">Todavía no se cargaron notificaciones.</p>`;
  cont.querySelectorAll("[data-notif-marcar]").forEach(btn => {
    btn.addEventListener("click", () => marcarNotificacionEstado(btn.dataset.notifId, btn.dataset.notifMarcar));
  });
  cont.querySelectorAll("[data-notif-borrar]").forEach(btn => {
    btn.addEventListener("click", () => borrarNotificacionCartilla(btn.dataset.notifBorrar));
  });
}

async function borrarNotificacionCartilla(id) {
  if (!(await mostrarConfirmacion("¿Borrar esta notificación? No se puede deshacer.", { titulo: "Borrar notificación", textoAceptar: "Borrar" }))) return;
  try {
    const session = await asegurarSesionVigente();
    const response = await fetchConTimeout(buildCartillaNotificacionesUrl(null, id), {
      method: "DELETE", headers: authHeaders(session.access_token)
    }, 10000, fetch);
    if (!response.ok) throw new Error(await leerErrorApi(response) || `Supabase respondió ${response.status}`);
    await cargarYRenderizarNotificacionesModal(cartillaNotificacionesCartillaId);
    cartillaNotificacionesTodasCargadas = false;
    mostrarToast("Notificación borrada.");
  } catch (error) {
    mostrarToast(error.message || "No se pudo borrar la notificación.");
  }
}

async function cargarYRenderizarNotificacionesModal(cartillaId) {
  cartillaNotificacionesCartillaId = cartillaId;
  const bloque = document.getElementById("cartilla-notificaciones-block");
  const hint = document.getElementById("cartilla-notificaciones-hint");
  const addBtn = document.getElementById("cartilla-notificacion-add");
  if (!cartillaId) {
    cartillaNotificacionesActuales = [];
    if (document.getElementById("cartilla-notificaciones-lista")) document.getElementById("cartilla-notificaciones-lista").innerHTML = "";
    if (hint) hint.hidden = false;
    if (addBtn) addBtn.hidden = true;
    return;
  }
  if (hint) hint.hidden = true;
  if (addBtn) addBtn.hidden = false;
  try {
    cartillaNotificacionesActuales = await cargarNotificacionesCartilla(cartillaId);
    cartillaNotificacionesPorCartilla.set(Number(cartillaId), cartillaNotificacionesActuales);
    renderNotificacionesCartilla();
  } catch (error) {
    if (bloque) bloque.querySelector("#cartilla-notificaciones-lista").innerHTML = `<p class="notificaciones-hint">No se pudieron cargar las notificaciones.</p>`;
  }
}

async function agregarNotificacionCartilla() {
  if (!cartillaNotificacionesCartillaId || cartillaModalSoloLectura) return;
  const cont = document.getElementById("cartilla-notificaciones-lista");
  if (!cont || cont.querySelector(".notificacion-nueva-row")) return;
  const proximoNumero = (cartillaNotificacionesActuales.reduce((max, n) => Math.max(max, n.numero || 0), 0)) + 1;
  const hoy = hoyLocalISO();
  const fila = document.createElement("div");
  fila.className = "notificacion-nueva-row";
  fila.innerHTML = `
    <span class="notificacion-numero">${proximoNumero}ª notificación</span>
    <label style="display:flex;align-items:center;gap:6px;font-size:12px">Fecha
      <input type="date" id="cartilla-notif-fecha-nueva" value="${hoy}">
    </label>
    <button type="button" class="secondary small" id="cartilla-notif-guardar">Guardar</button>
    <button type="button" class="link-button" id="cartilla-notif-cancelar">Cancelar</button>
  `;
  cont.appendChild(fila);
  document.getElementById("cartilla-notif-cancelar").addEventListener("click", () => fila.remove());
  document.getElementById("cartilla-notif-guardar").addEventListener("click", async () => {
    const fecha = document.getElementById("cartilla-notif-fecha-nueva")?.value;
    if (!fecha) { mostrarToast("Elegí la fecha de la notificación."); return; }
    const boton = document.getElementById("cartilla-notif-guardar");
    boton.disabled = true; boton.textContent = "Guardando...";
    try {
      const session = await asegurarSesionVigente();
      const payload = {
        cartilla_id: Number(cartillaNotificacionesCartillaId),
        numero: proximoNumero,
        fecha_notificacion: fecha,
        fecha_limite_respuesta: sumarDiasHabiles(fecha, 10),
        estado: "PENDIENTE"
      };
      const response = await fetchConTimeout(buildCartillaNotificacionesUrl(cartillaNotificacionesCartillaId), {
        method: "POST", headers: { ...authHeaders(session.access_token), Prefer: "return=representation" }, body: JSON.stringify(payload)
      }, 10000, fetch);
      if (!response.ok) throw new Error(await leerErrorApi(response) || `Supabase respondió ${response.status}`);
      await cargarYRenderizarNotificacionesModal(cartillaNotificacionesCartillaId);
      cartillaNotificacionesTodasCargadas = false;
      mostrarToast("Notificación cargada.");
    } catch (error) {
      mostrarToast(error.message || "No se pudo guardar la notificación.");
      fila.remove();
    }
  });
}

async function marcarNotificacionEstado(id, estado) {
  try {
    const session = await asegurarSesionVigente();
    const payload = { estado, updated_at: new Date().toISOString(), fecha_respuesta: estado === "RESPONDIO" ? hoyLocalISO() : null };
    const response = await fetchConTimeout(buildCartillaNotificacionesUrl(null, id), {
      method: "PATCH", headers: { ...authHeaders(session.access_token), Prefer: "return=representation" }, body: JSON.stringify(payload)
    }, 10000, fetch);
    if (!response.ok) throw new Error(await leerErrorApi(response) || `Supabase respondió ${response.status}`);
    await cargarYRenderizarNotificacionesModal(cartillaNotificacionesCartillaId);
    cartillaNotificacionesTodasCargadas = false;
    mostrarToast(estado === "RESPONDIO" ? "Notificación marcada como respondida." : "Notificación marcada como no respondida.");
  } catch (error) {
    mostrarToast(error.message || "No se pudo actualizar la notificación.");
  }
}

async function cargarYRenderizarReporteNotificaciones() {
  if (typeof document === "undefined") return;
  const tbody = document.getElementById("notif-reporte-table-body");
  if (!tbody) return;
  try {
    if (!cartillasCompleta) { cartillas = await cargarCartillasDesdeSupabase(); cartillasCargadas = true; cartillasCompleta = true; }
    if (!obrasSociales.length) obrasSociales = await cargarObrasSocialesDesdeSupabase();
    await cargarTodasLasNotificacionesCartillas();
    renderReporteNotificaciones();
  } catch (error) {
    mostrarToast("No se pudo cargar el reporte de notificaciones.");
    console.error(error);
  }
}

function renderReporteNotificaciones() {
  const tbody = document.getElementById("notif-reporte-table-body");
  const empty = document.getElementById("notif-reporte-empty");
  const count = document.getElementById("notif-reporte-count");
  if (!tbody) return;
  const hoyISO = hoyLocalISO();

  // Filas: cartillas cuya ÚLTIMA notificación quedó en NO_RESPONDIO, o PENDIENTE y ya venció
  // el plazo de 10 días hábiles sin que se haya cargado una notificación siguiente.
  const filas = [];
  cartillas.forEach(c => {
    const notifs = cartillaNotificacionesPorCartilla.get(Number(c.id)) || [];
    if (!notifs.length) return;
    const ultima = [...notifs].sort((a, b) => (a.numero || 0) - (b.numero || 0)).at(-1);
    const vencida = ultima.estado === "PENDIENTE" && diasHabilesTranscurridos(ultima.fecha_notificacion, hoyISO) >= 10;
    if (ultima.estado === "NO_RESPONDIO" || vencida) {
      filas.push({ cartilla: c, notif: ultima, vencida });
    }
  });
  filas.sort((a, b) => (a.cartilla.obras_sociales?.rnos || "").localeCompare(b.cartilla.obras_sociales?.rnos || ""));

  tbody.innerHTML = filas.map(f => {
    const os = f.cartilla.obras_sociales || {};
    const estadoTexto = f.notif.estado === "NO_RESPONDIO" ? "No respondió (tildado)" : "Sin responder — venció el plazo";
    return `<tr>
      <td><strong>${escaparHtml(os.rnos || "—")}</strong></td>
      <td class="denominacion-cell">${escaparHtml(os.denominacion || "—")}</td>
      <td class="date-cell">${formatFechaPantalla(f.notif.fecha_notificacion)}</td>
      <td>${f.notif.numero}ª</td>
      <td class="date-cell">${formatFechaPantalla(f.notif.fecha_limite_respuesta)}</td>
      <td style="color:#c0392b;font-weight:700">${estadoTexto}</td>
    </tr>`;
  }).join("");
  if (count) count.textContent = `${filas.length} ${filas.length === 1 ? "Obra Social" : "Obras Sociales"} sin respuesta a su notificación`;
  if (empty) empty.hidden = filas.length !== 0;

  // Gráfico: cuántas cartillas respondieron a la 1ª notificación, a la 2ª, etc.
  const conteoPorNumero = new Map();
  cartillas.forEach(c => {
    const notifs = cartillaNotificacionesPorCartilla.get(Number(c.id)) || [];
    const respondida = notifs.find(n => n.estado === "RESPONDIO");
    if (respondida) conteoPorNumero.set(respondida.numero, (conteoPorNumero.get(respondida.numero) || 0) + 1);
  });
  const items = [...conteoPorNumero.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([numero, cantidad]) => ({ etiqueta: `Respondieron a la ${numero}ª notificación`, valor: cantidad }));
  renderBarChart("notif-reporte-chart", items);
}

function limpiarFormularioCartilla() {
  document.getElementById("cartilla-form")?.reset();
  document.getElementById("cartilla-id").value = "";
  document.getElementById("cartilla-os-id").value = "";
  document.getElementById("cartilla-inicio-ejercicio").value = "";
  document.getElementById("cartilla-fecha-inicio-ejercicio").value = "";
  document.getElementById("cartilla-anio-inicio").value = "";
  const ejercicio = document.getElementById("cartilla-ejercicio");
  if (ejercicio) ejercicio.value = "";
  document.getElementById("cartilla-res-170").value = "SI";
  actualizarMasterInfoCartilla(null);
  setFormMessage("cartilla-form-message", "");
  actualizarAlertaCartilla();
}

function aplicarModoSoloLecturaCartilla(soloLectura) {
  cartillaModalSoloLectura = soloLectura;
  const form = document.getElementById("cartilla-form");
  if (form) {
    form.querySelectorAll("input, select, textarea").forEach(campo => { campo.disabled = soloLectura; });
  }
  const guardar = document.getElementById("cartilla-save");
  if (guardar) guardar.hidden = soloLectura;
  const addNotif = document.getElementById("cartilla-notificacion-add");
  if (addNotif) addNotif.hidden = soloLectura;
  const aviso = document.getElementById("cartilla-archivo-aviso");
  if (aviso) aviso.hidden = !soloLectura;
}

function abrirModalCartillaNueva() {
  limpiarFormularioCartilla();
  poblarObrasSocialesCartilla();
  document.getElementById("cartilla-modal-title").textContent = "Nueva presentación de Cartilla";
  cargarYRenderizarNotificacionesModal(null);
  aplicarModoSoloLecturaCartilla(false);
  abrirModal("cartilla-modal");
  document.getElementById("cartilla-os-search")?.focus();
}

function abrirModalCartillaEdicion(id) {
  const c = cartillas.find(item => Number(item.id) === Number(id));
  if (!c) return;
  poblarObrasSocialesCartilla();
  document.getElementById("cartilla-modal-title").textContent = "Editar presentación de Cartilla";
  document.getElementById("cartilla-id").value = c.id;
  document.getElementById("cartilla-os-id").value = c.obra_social_id || "";
  document.getElementById("cartilla-os-search").value = getObraSocialDisplay(c.obras_sociales || {});
  const inicioCartilla = c.obras_sociales?.inicio_ejercicio || "";
  document.getElementById("cartilla-inicio-ejercicio").value = inicioCartilla;
  document.getElementById("cartilla-ejercicio").value =
    ejercicioCanonico(c.ejercicio || derivarEjercicio(inicioCartilla, c.anio_inicio)) || "";
  document.getElementById("cartilla-anio-inicio").value =
    c.anio_inicio || anioInicioDesdeEjercicio(document.getElementById("cartilla-ejercicio").value) || "";
  document.getElementById("cartilla-fecha-inicio-ejercicio").value = c.fecha_inicio_ejercicio || "";
  document.getElementById("cartilla-analista").value = c.analista || "";
  document.getElementById("cartilla-ee").value = c.numero_ee || "";
  document.getElementById("cartilla-condicion").value = c.condicion || "";
  document.getElementById("cartilla-fecha-ingreso").value = c.fecha_ingreso || "";
  document.getElementById("cartilla-res-170").value = c.res_170_2009 || "";
  document.getElementById("cartilla-disposicion").value = c.numero_disposicion || "";
  document.getElementById("cartilla-fecha-disposicion").value = c.fecha_disposicion || "";
  document.getElementById("cartilla-observaciones").value = c.observaciones || "";
  actualizarMasterInfoCartilla(resolverObraSocialCartilla(document.getElementById("cartilla-os-search").value) || c.obras_sociales);
  setFormMessage("cartilla-form-message", "");
  actualizarAlertaCartilla();
  cargarYRenderizarNotificacionesModal(c.id);
  aplicarModoSoloLecturaCartilla(c.condicion === "ARCHIVO");
  abrirModal("cartilla-modal");
}

function buildCartillaWriteUrl(id = null) {
  const params = new URLSearchParams();
  params.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  if (id !== null && id !== undefined && id !== "") params.set("id", `eq.${id}`);
  return `${SUPABASE_URL}/rest/v1/cartillas?${params.toString()}`;
}

async function guardarCartillaEnSupabase(registro, id, accessToken, fetchImpl = fetch) {
  const editando = id !== null && id !== undefined && id !== "";
  const payload = editando ? {...registro, updated_at:new Date().toISOString()} : registro;
  const response = await fetchConTimeout(buildCartillaWriteUrl(editando ? id : null), {
    method: editando ? "PATCH" : "POST",
    headers: {...authHeaders(accessToken), Prefer:"return=representation"},
    body: JSON.stringify(payload)
  }, 10000, fetchImpl);
  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    throw new Error(detalle || `Supabase respondió ${response.status}.`);
  }
  return response.json();
}

async function handleCartillaSubmit(event) {
  event.preventDefault();
  setFormMessage("cartilla-form-message", "");
  const save = document.getElementById("cartilla-save");
  if (save) save.disabled = true;
  try {
    const session = await asegurarSesionVigente();
    const os = resolverObraSocialCartilla(document.getElementById("cartilla-os-search")?.value || "");
    if (!os) throw new Error("Seleccioná un Agente de Seguro de Salud del maestro.");
    const inicioEjercicio = os?.inicio_ejercicio || "";
    if (!inicioEjercicio) throw new Error("El Agente de Seguro de Salud no tiene Inicio ejercicio cargado. Completalo primero en Agentes de Seguro.");
    const ejercicio = ejercicioCanonico(document.getElementById("cartilla-ejercicio")?.value || "");
    const anioInicio = anioInicioDesdeEjercicio(ejercicio);
    const fechaInicioEjercicio = anioInicio ? fechaInicioEjercicioDesdeDiaMes(inicioEjercicio, anioInicio) : "";
    if (!fechaInicioEjercicio || !ejercicio) throw new Error("Ingresá el Ejercicio como 2026 o 2026/27.");

    const registro = {
      obra_social_id:Number(os.id), anio_inicio:anioInicio, ejercicio, fecha_inicio_ejercicio:fechaInicioEjercicio,
      analista:document.getElementById("cartilla-analista")?.value.trim() || null,
      numero_ee:document.getElementById("cartilla-ee")?.value.trim() || null,
      condicion:document.getElementById("cartilla-condicion")?.value || null,
      fecha_ingreso:document.getElementById("cartilla-fecha-ingreso")?.value || null,
      res_170_2009:document.getElementById("cartilla-res-170")?.value || null,
      numero_disposicion:document.getElementById("cartilla-disposicion")?.value.trim() || null,
      fecha_disposicion:document.getElementById("cartilla-fecha-disposicion")?.value || null,
      observaciones:document.getElementById("cartilla-observaciones")?.value.trim() || null
    };
    const id = document.getElementById("cartilla-id")?.value || "";
    const filaGuardada = await guardarCartillaEnSupabase(registro, id || null, session.access_token);
    cerrarModal("cartilla-modal");
    mostrarToast(id ? "Presentación de Cartilla actualizada." : "Presentación de Cartilla creada.");
    if (!id) {
      const nuevaCartillaId = Array.isArray(filaGuardada) ? filaGuardada[0]?.id : filaGuardada?.id;
      if (nuevaCartillaId) tomarSnapshotPrestadores(nuevaCartillaId, os.id, session.access_token).catch(err => console.error("No se pudo generar el snapshot de prestadores:", err));
    }
    await cargarYRenderizarCartillas();
  } catch (error) {
    const mensaje = /duplicate|unique|23505/i.test(error.message || "") ? "Ya existe una presentación con esa Agente de Seguro, ejercicio y Nº EE." : error.message || "No se pudo guardar la presentación.";
    setFormMessage("cartilla-form-message", mensaje);
  } finally {
    if (save) save.disabled = false;
  }
}

function procesarRecuperacionDesdeUrl() {
  if (typeof location === "undefined") return false;
  const recovery = parseRecoveryHash(location.hash);
  if (!recovery) return false;

  guardarSesion(recovery);
  passwordRecoveryPending = true;

  const url = new URL(location.href);
  url.searchParams.delete("recovery");
  url.hash = "obras-sociales";
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  return true;
}

async function restaurarSesion() {
  authSession = cargarSesionGuardada();

  if (authSession && sessionNecesitaRefresh(authSession) && authSession.refresh_token) {
    try {
      guardarSesion(await authRefresh(authSession.refresh_token));
    } catch (_) {
      guardarSesion(null);
      return;
    }
  } else {
    actualizarAuthUI();
  }

  if (authSession?.access_token) {
    await refrescarDatosUsuarioSesion();
  }
}

// ---------- Prestadores (Portal de Cartilla) ----------

let prestadorObraSocialActual = null;
let prestadores = [];
let prestadoresPage = 1;
let tiposContratacionCache = [];
let tiposPrestadorCache = [];
let especialidadesPrestadorCache = [];
let tiposActivosModal = new Set();
let especialidadesSeleccionadasModal = new Set();

function poblarObrasSocialesPrestadores() {
  if (typeof document === "undefined") return;
  const list = document.getElementById("prestadores-os-list");
  if (!list) return;
  list.innerHTML = obrasSociales
    .filter(os => os.estado !== "INACTIVA" && !String(os.rnos || "").trim().startsWith("9"))
    .sort((a, b) => (a.rnos || "").localeCompare(b.rnos || "", undefined, { numeric: true }))
    .map(os => `<option value="${escaparHtml(getObraSocialDisplay(os))}"></option>`).join("");
}

function buildPrestadoresUrl(obraSocialId) {
  const params = new URLSearchParams();
  params.set("select", "*,prestador_especialidades(especialidad_id,especialidades_prestador(nombre,tipo_prestador_id,tipos_prestador(nombre,orden)))");
  params.set("obra_social_id", `eq.${obraSocialId}`);
  params.set("order", "nombre_completo.asc");
  params.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  return `${SUPABASE_URL}/rest/v1/prestadores?${params.toString()}`;
}

async function cargarPrestadoresPorOS(obraSocialId) {
  // prestadores tiene seguridad por fila (no es de lectura pública como el resto del
  // sitio), así que la consulta necesita el token de la sesión logueada, no solo la apikey.
  const session = await asegurarSesionVigente();
  const response = await fetchConTimeout(buildPrestadoresUrl(obraSocialId), { method: "GET", headers: authHeaders(session.access_token), cache: "no-store" }, 10000, fetch);
  if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
  return response.json();
}

async function cargarTaxonomiaPrestador() {
  if (tiposPrestadorCache.length) return;
  const paramsTipos = new URLSearchParams({ select: "*", order: "orden.asc", apikey: SUPABASE_PUBLISHABLE_KEY });
  const paramsEsp = new URLSearchParams({ select: "*", order: "nombre.asc", apikey: SUPABASE_PUBLISHABLE_KEY });
  const [resTipos, resEsp] = await Promise.all([
    fetchConTimeout(`${SUPABASE_URL}/rest/v1/tipos_prestador?${paramsTipos.toString()}`, { method: "GET", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Accept: "application/json" }, cache: "no-store" }, 10000, fetch),
    fetchConTimeout(`${SUPABASE_URL}/rest/v1/especialidades_prestador?${paramsEsp.toString()}`, { method: "GET", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Accept: "application/json" }, cache: "no-store" }, 10000, fetch)
  ]);
  tiposPrestadorCache = resTipos.ok ? await resTipos.json() : [];
  especialidadesPrestadorCache = resEsp.ok ? await resEsp.json() : [];
}

// ---------- Cascada Provincia / Partido / Localidad (localidades_ar) ----------
let localidadesArCache = [];

async function cargarLocalidadesAr() {
  if (localidadesArCache.length) return;
  const params = new URLSearchParams({ select: "provincia,partido,localidad", order: "provincia.asc,partido.asc,localidad.asc", apikey: SUPABASE_PUBLISHABLE_KEY });
  const pageSize = 1000;
  const all = [];
  for (let offset = 0; ; offset += pageSize) {
    const p = new URLSearchParams(params);
    p.set("limit", String(pageSize));
    p.set("offset", String(offset));
    const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/localidades_ar?${p.toString()}`, { method: "GET", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Accept: "application/json" }, cache: "no-store" }, 10000, fetch);
    if (!response.ok) break;
    const page = await response.json();
    all.push(...page);
    if (page.length < pageSize) break;
  }
  localidadesArCache = all;
}

function poblarSelectProvinciaPrestador() {
  const select = document.getElementById("prestador-provincia");
  if (!select) return;
  const provincias = [...new Set(localidadesArCache.map(l => l.provincia))].sort();
  select.innerHTML = `<option value="">—</option>` + provincias.map(p => `<option value="${escaparHtml(p)}">${escaparHtml(p)}</option>`).join("");
}

function poblarSelectPartidoPrestador(provincia, partidoSeleccionado = "") {
  const select = document.getElementById("prestador-partido");
  if (!select) return;
  if (!provincia) { select.innerHTML = `<option value="">—</option>`; select.disabled = true; return; }
  const partidos = [...new Set(localidadesArCache.filter(l => l.provincia === provincia).map(l => l.partido))].sort();
  select.innerHTML = `<option value="">—</option>` + partidos.map(p => `<option value="${escaparHtml(p)}" ${p === partidoSeleccionado ? "selected" : ""}>${escaparHtml(p)}</option>`).join("");
  select.disabled = false;
}

function poblarSelectLocalidadPrestador(provincia, partido, localidadSeleccionada = "") {
  const select = document.getElementById("prestador-localidad");
  if (!select) return;
  if (!provincia || !partido) { select.innerHTML = `<option value="">—</option>`; select.disabled = true; return; }
  const localidades = [...new Set(localidadesArCache.filter(l => l.provincia === provincia && l.partido === partido).map(l => l.localidad))].sort();
  select.innerHTML = `<option value="">—</option>` + localidades.map(l => `<option value="${escaparHtml(l)}" ${l === localidadSeleccionada ? "selected" : ""}>${escaparHtml(l)}</option>`).join("");
  select.disabled = false;
}

async function cargarTiposContratacion() {
  const params = new URLSearchParams();
  params.set("select", "nombre");
  params.set("order", "nombre.asc");
  params.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/tipos_contratacion?${params.toString()}`, { method: "GET", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Accept: "application/json" }, cache: "no-store" }, 10000, fetch);
  if (!response.ok) return [];
  return response.json();
}

function llenarDatalistsPrestador() {
  if (typeof document === "undefined") return;
  const listContrat = document.getElementById("prestador-contratacion-list");
  if (listContrat) listContrat.innerHTML = tiposContratacionCache.map(t => `<option value="${escaparHtml(t.nombre)}"></option>`).join("");
}

// Devuelve, para un prestador ya cargado (con su embed de prestador_especialidades),
// la lista de nombres de tipo únicos y la cantidad total de especialidades tildadas.
function resumenTiposEspecialidades(p) {
  const filas = p.prestador_especialidades || [];
  const tipos = [...new Set(filas.map(f => f.especialidades_prestador?.tipos_prestador?.nombre).filter(Boolean))];
  return { tipos, cantidad: filas.length };
}

function renderChipsTiposModal() {
  const cont = document.getElementById("prestador-tipos-chips");
  if (!cont) return;
  cont.innerHTML = tiposPrestadorCache.map(t => `<label class="checkbox-label tipo-checkbox">
    <input type="checkbox" data-tipo-id="${t.id}" ${tiposActivosModal.has(t.id) ? "checked" : ""}>
    <span>${escaparHtml(t.nombre)}</span>
  </label>`).join("");
  cont.querySelectorAll("[data-tipo-id]").forEach(input => {
    input.addEventListener("change", () => {
      const id = input.dataset.tipoId;
      if (input.checked) {
        tiposActivosModal.add(id);
      } else {
        tiposActivosModal.delete(id);
        // Al sacar un tipo, se sacan también sus especialidades tildadas.
        especialidadesPrestadorCache.filter(e => e.tipo_prestador_id === id).forEach(e => especialidadesSeleccionadasModal.delete(e.id));
      }
      renderGruposEspecialidadesModal();
    });
  });
}

function renderGruposEspecialidadesModal() {
  const cont = document.getElementById("prestador-especialidades-grupos");
  if (!cont) return;
  const tiposOrdenados = tiposPrestadorCache.filter(t => tiposActivosModal.has(t.id));
  cont.innerHTML = tiposOrdenados.map(t => {
    const especialidades = especialidadesPrestadorCache.filter(e => e.tipo_prestador_id === t.id);
    return `<div class="especialidades-grupo">
      <div class="especialidades-grupo-titulo">Especialidades contratadas · ${escaparHtml(t.nombre)}</div>
      <div class="especialidades-lista">
        ${especialidades.map(e => `<label class="checkbox-label especialidad-checkbox">
          <input type="checkbox" data-especialidad-id="${e.id}" ${especialidadesSeleccionadasModal.has(e.id) ? "checked" : ""}>
          <span>${escaparHtml(e.nombre)}</span>
        </label>`).join("")}
      </div>
    </div>`;
  }).join("");
  cont.querySelectorAll("[data-especialidad-id]").forEach(input => {
    input.addEventListener("change", () => {
      const id = input.dataset.especialidadId;
      if (input.checked) especialidadesSeleccionadasModal.add(id);
      else especialidadesSeleccionadasModal.delete(id);
    });
  });
}

// ---------- Importador de Cartilla histórica (Excel Carátula + Anexo III) ----------

const PROVINCIAS_CANONICAS = {
  "buenos aires": "Buenos Aires", "caba": "Ciudad Autónoma de Buenos Aires",
  "ciudad autonoma de buenos aires": "Ciudad Autónoma de Buenos Aires", "catamarca": "Catamarca",
  "chaco": "Chaco", "chubut": "Chubut", "cordoba": "Córdoba", "corrientes": "Corrientes",
  "entre rios": "Entre Ríos", "formosa": "Formosa", "jujuy": "Jujuy", "la pampa": "La Pampa",
  "la rioja": "La Rioja", "mendoza": "Mendoza", "misiones": "Misiones", "neuquen": "Neuquén",
  "rio negro": "Río Negro", "salta": "Salta", "san juan": "San Juan", "san luis": "San Luis",
  "santa cruz": "Santa Cruz", "santa fe": "Santa Fe", "santiago del estero": "Santiago del Estero",
  "tierra del fuego": "Tierra del Fuego", "tucuman": "Tucumán"
};

function normalizarTexto(s) {
  if (!s) return "";
  return String(s).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
}

// Busca, en cualquier hoja del libro, la carátula (RNAS + beneficiarios por provincia)
// recorriendo celda por celda — no depende del nombre exacto de la hoja ni de filas fijas.
function parsearCaratulaCartilla(workbook) {
  for (const nombreHoja of workbook.SheetNames) {
    const filas = window.XLSX.utils.sheet_to_json(workbook.Sheets[nombreHoja], { header: 1, defval: null });
    let rnas = null, anio = null, denominacion = null, totalBeneficiarios = null;
    for (const fila of filas) {
      for (let i = 0; i < fila.length; i++) {
        if (normalizarTexto(fila[i]).includes("rnas") && fila[i + 1] != null) rnas = String(fila[i + 1]).trim();
        if (normalizarTexto(fila[i]).includes("periodo de vigencia") && fila[i + 1] != null) anio = fila[i + 1];
        if (normalizarTexto(fila[i]).includes("denominacion") && fila[i + 1]) denominacion = String(fila[i + 1]).trim();
        if (normalizarTexto(fila[i]).includes("total de beneficiarios") && fila[i + 1] != null) totalBeneficiarios = Number(fila[i + 1]);
      }
    }
    if (!rnas) continue;
    const afiliadosPorProvincia = {};
    for (const fila of filas) {
      for (let i = 0; i < fila.length - 1; i++) {
        const prov = PROVINCIAS_CANONICAS[normalizarTexto(fila[i])];
        const cant = fila[i + 1];
        if (prov && typeof cant === "number" && cant > 0) afiliadosPorProvincia[prov] = cant;
      }
    }
    return { rnas, anio, denominacion, totalBeneficiarios, afiliadosPorProvincia, hoja: nombreHoja };
  }
  return null;
}

// Busca la hoja del Anexo III (con el encabezado "NOMBRE COMPLETO DEL PRESTADOR") y
// devuelve los prestadores agrupados por CUIT, con sus pares (tipo, especialidad) crudos.
function parsearAnexoIIICartilla(workbook) {
  for (const nombreHoja of workbook.SheetNames) {
    const filas = window.XLSX.utils.sheet_to_json(workbook.Sheets[nombreHoja], { header: 1, defval: null });
    const filaHeader = filas.findIndex(f => f.some(c => normalizarTexto(c).includes("nombre completo del prestador")));
    if (filaHeader === -1) continue;
    const prestadores = new Map();
    for (let i = filaHeader + 1; i < filas.length; i++) {
      const [nombre, cuit, tipo, especialidad, adultoPed, provincia, partido, localidad, , domicilio, telefono, email] = filas[i];
      if (!nombre) continue;
      const cuitLimpio = cuit != null ? String(cuit).trim() : null;
      const key = cuitLimpio || normalizarTexto(nombre);
      if (!prestadores.has(key)) {
        prestadores.set(key, {
          nombre: String(nombre).trim(), cuit: cuitLimpio,
          adultoPediatrico: ["ADULTO", "PEDIATRICO", "AMBOS"].includes(String(adultoPed || "").trim().toUpperCase()) ? String(adultoPed).trim().toUpperCase() : null,
          provincia: provincia ? String(provincia).trim() : null,
          partido: partido ? String(partido).trim() : null,
          localidad: localidad ? String(localidad).trim() : null,
          domicilio: domicilio ? String(domicilio).trim() : null,
          telefono: telefono != null ? String(telefono).trim() : null,
          email: email ? String(email).trim() : null,
          especialidadesCrudo: []
        });
      }
      if (tipo && especialidad) prestadores.get(key).especialidadesCrudo.push([String(tipo).trim(), String(especialidad).trim()]);
    }
    return [...prestadores.values()];
  }
  return null;
}

let importarCartillaEstado = null;

function matchearEspecialidadesImportacion(prestadores) {
  const lookup = new Map();
  especialidadesPrestadorCache.forEach(e => {
    const tipo = tiposPrestadorCache.find(t => t.id === e.tipo_prestador_id);
    if (tipo) lookup.set(`${normalizarTexto(tipo.nombre)}|${normalizarTexto(e.nombre)}`, e.id);
  });
  const sinMatch = new Map();
  let paresOk = 0, paresTotal = 0;
  prestadores.forEach(p => {
    const ids = new Set();
    p.especialidadesCrudo.forEach(([tipo, especialidad]) => {
      paresTotal++;
      const eid = lookup.get(`${normalizarTexto(tipo)}|${normalizarTexto(especialidad)}`);
      if (eid) { ids.add(eid); paresOk++; }
      else sinMatch.set(`${tipo} · ${especialidad}`, (sinMatch.get(`${tipo} · ${especialidad}`) || 0) + 1);
    });
    p.especialidadIds = [...ids];
  });
  return { paresOk, paresTotal, sinMatch };
}

async function manejarArchivoImportarCartilla(file) {
  if (!file) return;
  if (!window.XLSX) { mostrarToast("No se pudo cargar el lector de Excel. Recargá la página."); return; }
  try {
    const buffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(buffer, { type: "array" });
    const caratula = parsearCaratulaCartilla(workbook);
    const prestadoresRaw = parsearAnexoIIICartilla(workbook);
    if (!caratula || !caratula.rnas) throw new Error("No encontré la Carátula (RNAS) en el Excel. ¿Es el archivo correcto?");
    if (!prestadoresRaw) throw new Error("No encontré la hoja del Anexo III (con la columna 'Nombre completo del prestador').");
    const rnasNormalizado = caratula.rnas.replace(/\D/g, "");
    const os = obrasSociales.find(o => (o.rnos || "").replace(/\D/g, "").replace(/^0+/, "") === rnasNormalizado.replace(/^0+/, ""));
    const matcheo = matchearEspecialidadesImportacion(prestadoresRaw);
    importarCartillaEstado = { caratula, prestadores: prestadoresRaw, os, matcheo };
    renderPreviewImportarCartilla();
    abrirModal("importar-cartilla-modal");
  } catch (error) {
    mostrarToast(error.message || "No se pudo leer el archivo.");
  } finally {
    document.getElementById("importar-cartilla-file").value = "";
  }
}

function renderPreviewImportarCartilla() {
  const { caratula, prestadores, os, matcheo } = importarCartillaEstado;
  const resumen = document.getElementById("importar-cartilla-resumen");
  const avisos = document.getElementById("importar-cartilla-avisos");
  const totalAfiliados = Object.values(caratula.afiliadosPorProvincia).reduce((a, b) => a + b, 0);
  resumen.innerHTML = `
    <div class="deadline-card neutral">
      <div><span>Obra Social (por RNAS ${escaparHtml(caratula.rnas)})</span><strong>${os ? escaparHtml(getObraSocialDisplay(os)) : "⚠️ No encontrada en el sistema"}</strong></div>
      <div><span>Período</span><strong>${escaparHtml(String(caratula.anio || "—"))}</strong></div>
      <div><span>Prestadores a importar</span><strong>${prestadores.length}</strong></div>
      <div><span>Especialidades matcheadas</span><strong>${matcheo.paresOk} / ${matcheo.paresTotal}</strong></div>
      <div><span>Beneficiarios (Carátula)</span><strong>${caratula.totalBeneficiarios ?? "—"}</strong></div>
      <div><span>Suma por provincia</span><strong>${totalAfiliados}${caratula.totalBeneficiarios && totalAfiliados !== caratula.totalBeneficiarios ? " ⚠️ no coincide" : ""}</strong></div>
    </div>`;
  let avisosHtml = "";
  if (!os) avisosHtml += `<p class="notificaciones-hint">⚠️ No encontré ninguna Obra Social con RNAS ${escaparHtml(caratula.rnas)} en el sistema — no se puede importar hasta que exista.</p>`;
  if (matcheo.sinMatch.size) {
    avisosHtml += `<p class="notificaciones-hint">Quedaron afuera ${[...matcheo.sinMatch.values()].reduce((a, b) => a + b, 0)} filas por combinaciones de Tipo/Especialidad que no matchean con el sistema:</p><ul style="font-size:12px;color:var(--muted);margin:4px 0 0 18px">${[...matcheo.sinMatch.entries()].map(([k, v]) => `<li>${escaparHtml(k)} (${v})</li>`).join("")}</ul>`;
  }
  avisos.innerHTML = avisosHtml;
  const confirmar = document.getElementById("importar-cartilla-confirmar");
  if (confirmar) confirmar.disabled = !os;
}

async function confirmarImportarCartilla() {
  const { caratula, prestadores, os } = importarCartillaEstado;
  if (!os) return;
  const boton = document.getElementById("importar-cartilla-confirmar");
  boton.disabled = true; boton.textContent = "Importando...";
  setFormMessage("importar-cartilla-message", "");
  try {
    const session = await asegurarSesionVigente();
    const headers = { ...authHeaders(session.access_token), Prefer: "return=representation" };

    const idPorClave = new Map();
    const BATCH = 200;
    for (let i = 0; i < prestadores.length; i += BATCH) {
      const lote = prestadores.slice(i, i + BATCH);
      const payload = lote.map(p => ({
        obra_social_id: os.id, nombre_completo: p.nombre.slice(0, 300), cuit: p.cuit,
        adulto_pediatrico: p.adultoPediatrico, telefono: p.telefono, email: p.email,
        provincia: p.provincia, partido: p.partido, localidad: p.localidad, domicilio: p.domicilio,
        contrato_presentado: false, activo: true
      }));
      const response = await fetchConTimeout(buildPrestadorWriteUrl(), { method: "POST", headers, body: JSON.stringify(payload) }, 20000, fetch);
      if (!response.ok) throw new Error(await leerErrorApi(response) || `Supabase respondió ${response.status}`);
      const filas = await response.json();
      lote.forEach((p, idx) => idPorClave.set(p.cuit || normalizarTexto(p.nombre), filas[idx].id));
    }

    const vinculos = [];
    prestadores.forEach(p => {
      const prestadorId = idPorClave.get(p.cuit || normalizarTexto(p.nombre));
      (p.especialidadIds || []).forEach(eid => vinculos.push({ prestador_id: prestadorId, especialidad_id: eid }));
    });
    for (let i = 0; i < vinculos.length; i += 500) {
      const lote = vinculos.slice(i, i + 500);
      const response = await fetchConTimeout(buildPrestadorEspecialidadesUrl(), {
        method: "POST", headers: { ...authHeaders(session.access_token), Prefer: "return=minimal" }, body: JSON.stringify(lote)
      }, 20000, fetch);
      if (!response.ok) throw new Error(await leerErrorApi(response) || `Supabase respondió ${response.status}`);
    }

    const filasAfiliados = Object.entries(caratula.afiliadosPorProvincia).map(([provincia, cantidad]) => ({
      obra_social_id: os.id, provincia, cantidad_beneficiarios: cantidad, actualizado_en: new Date().toISOString()
    }));
    if (filasAfiliados.length) {
      const params = new URLSearchParams({ apikey: SUPABASE_PUBLISHABLE_KEY, on_conflict: "obra_social_id,provincia" });
      const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/afiliados_provincia?${params.toString()}`, {
        method: "POST", headers: { ...authHeaders(session.access_token), Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(filasAfiliados)
      }, 20000, fetch);
      if (!response.ok) throw new Error(await leerErrorApi(response) || `Supabase respondió ${response.status}`);
    }

    cerrarModal("importar-cartilla-modal");
    mostrarToast(`Se importaron ${prestadores.length} prestadores de ${getObraSocialDisplay(os)}.`);
    document.getElementById("prestadores-os-search").value = getObraSocialDisplay(os);
    await handleSeleccionObraSocialPrestadores();
  } catch (error) {
    setFormMessage("importar-cartilla-message", error.message || "No se pudo completar la importación.");
  } finally {
    boton.disabled = false; boton.textContent = "Confirmar importación";
  }
}

// ---------- Cobertura (vista del analista) ----------

const BASICAS_NOMBRES_CORTOS = {
  "Clínica médica": "Clínica",
  "Pediatría": "Pediatría",
  "Traumatología y Ortopedia": "Traumatología",
  "Ginecología": "Ginecología",
  "Urología": "Urología",
  "Emergencia/Urgencia Clínica Médica": "Urgencias"
};

async function cargarAfiliadosProvincia(obraSocialId) {
  const session = await asegurarSesionVigente();
  const params = new URLSearchParams({ select: "provincia,cantidad_beneficiarios", order: "cantidad_beneficiarios.desc", obra_social_id: `eq.${obraSocialId}`, apikey: SUPABASE_PUBLISHABLE_KEY });
  const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/afiliados_provincia?${params.toString()}`, { method: "GET", headers: authHeaders(session.access_token), cache: "no-store" }, 10000, fetch);
  if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
  return response.json();
}

let ejerciciosCartillaCache = [];

async function cargarEjerciciosCartilla() {
  if (ejerciciosCartillaCache.length) return ejerciciosCartillaCache;
  const anioActual = new Date().getFullYear();
  const vigentes = [String(anioActual + 1), `${anioActual}/${String(anioActual + 1).slice(-2)}`];
  const params = new URLSearchParams({ select: "ejercicio", apikey: SUPABASE_PUBLISHABLE_KEY });
  const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/cartillas?${params.toString()}`, { method: "GET", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Accept: "application/json" }, cache: "no-store" }, 10000, fetch);
  if (!response.ok) return [];
  const filas = await response.json();
  const todos = [...new Set(filas.map(f => f.ejercicio).filter(Boolean))];
  // Solo los ejercicios del período vigente (el que está corriendo ahora), no el historico completo.
  ejerciciosCartillaCache = vigentes.filter(e => todos.includes(e));
  return ejerciciosCartillaCache;
}

async function obtenerObraSocialIdsConCartillaPresentada(ejercicios) {
  const lista = (Array.isArray(ejercicios) ? ejercicios : [ejercicios]).filter(Boolean);
  if (!lista.length) return new Set();
  const params = new URLSearchParams({ select: "obra_social_id", ejercicio: `in.(${lista.map(e => `"${e}"`).join(",")})`, fecha_ingreso: "not.is.null", apikey: SUPABASE_PUBLISHABLE_KEY });
  const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/cartillas?${params.toString()}`, { method: "GET", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Accept: "application/json" }, cache: "no-store" }, 10000, fetch);
  if (!response.ok) return new Set();
  const filas = await response.json();
  return new Set(filas.map(f => Number(f.obra_social_id)));
}

async function inicializarVistaCobertura() {
  if (typeof document === "undefined") return;
  if (!obrasSociales.length) { try { await cargarYRenderizarObrasSociales(); } catch (error) { console.error(error); } }
  try { await cargarTaxonomiaPrestador(); } catch (error) { console.error(error); }
  const ejercicios = await cargarEjerciciosCartilla();
  poblarSelectorMultipleEjercicios("cobertura", ejercicios, () => requiereAutenticacion(handleCambioEjercicioCobertura));
}

async function handleCambioEjercicioCobertura() {
  const seleccionados = ejerciciosFiltroSeleccionados("cobertura");
  const osInput = document.getElementById("cobertura-os-search");
  const list = document.getElementById("cobertura-os-list");
  if (osInput) { osInput.value = ""; osInput.disabled = !seleccionados.length; }
  await handleSeleccionObraSocialCobertura();
  if (!seleccionados.length) { if (list) list.innerHTML = ""; return; }
  const idsPresentaron = await obtenerObraSocialIdsConCartillaPresentada(seleccionados);
  if (list) list.innerHTML = obrasSociales
    .filter(os => idsPresentaron.has(Number(os.id)) && !String(os.rnos || "").trim().startsWith("9"))
    .sort((a, b) => (a.rnos || "").localeCompare(b.rnos || "", undefined, { numeric: true }))
    .map(os => `<option value="${escaparHtml(getObraSocialDisplay(os))}"></option>`).join("");
  const etiqueta = seleccionados.join(" / ");
  if (osInput) osInput.placeholder = idsPresentaron.size
    ? `Elegí entre las ${idsPresentaron.size} Obras Sociales que presentaron Cartilla ${etiqueta}...`
    : `Ninguna Obra Social presentó Cartilla para ${etiqueta} todavía`;
}

async function handleSeleccionObraSocialCobertura() {
  const valor = document.getElementById("cobertura-os-search")?.value || "";
  const os = resolverObraSocialCartilla(valor);
  mostrarOsActualEnCabecera(os);
  const count = document.getElementById("cobertura-count");
  const resumen = document.getElementById("cobertura-resumen");
  if (!os) {
    if (count) count.textContent = "Elegí una Obra Social arriba para ver su cobertura.";
    if (resumen) resumen.hidden = true;
    document.getElementById("cobertura-table-head").innerHTML = "";
    document.getElementById("cobertura-table-body").innerHTML = "";
    return;
  }
  if (count) count.textContent = "Cargando...";
  try {
    const [afiliados, prestadores] = await Promise.all([
      cargarAfiliadosProvincia(os.id),
      cargarPrestadoresPorOS(os.id)
    ]);
    renderCoberturaTabla(os, afiliados, prestadores.filter(p => p.activo !== false));
  } catch (error) {
    if (count) count.textContent = "No se pudo cargar la cobertura.";
    mostrarToast(error.message || "No se pudo cargar la cobertura.");
  }
}

function renderCoberturaTabla(os, afiliados, prestadores) {
  const basicas = especialidadesPrestadorCache.filter(e => e.basica_obligatoria);
  const head = document.getElementById("cobertura-table-head");
  const body = document.getElementById("cobertura-table-body");
  const count = document.getElementById("cobertura-count");
  const empty = document.getElementById("cobertura-empty");
  const resumen = document.getElementById("cobertura-resumen");

  head.innerHTML = `<th>Provincia</th>${basicas.map(e => `<th title="${escaparHtml(e.nombre)}">${escaparHtml(BASICAS_NOMBRES_CORTOS[e.nombre] || e.nombre)}</th>`).join("")}<th>Beneficiarios</th>`;

  if (!afiliados.length) {
    body.innerHTML = "";
    if (empty) empty.hidden = false;
    if (count) count.textContent = `${getObraSocialDisplay(os)} — sin afiliados por provincia cargados`;
    if (resumen) resumen.hidden = true;
    return;
  }
  if (empty) empty.hidden = true;

  // Por provincia, qué IDs de especialidad básica tiene cubiertas (algún prestador activo ahí)
  const cubiertasPorProvincia = new Map();
  prestadores.forEach(p => {
    if (!p.provincia) return;
    const prov = normalizarTexto(p.provincia);
    const set = cubiertasPorProvincia.get(prov) || new Set();
    (p.prestador_especialidades || []).forEach(f => { if (f.especialidad_id) set.add(f.especialidad_id); });
    cubiertasPorProvincia.set(prov, set);
  });

  let conHueco = 0, completas = 0;
  const filas = afiliados.map(a => {
    const cubiertas = cubiertasPorProvincia.get(normalizarTexto(a.provincia)) || new Set();
    const faltantes = basicas.filter(e => !cubiertas.has(e.id));
    if (faltantes.length) conHueco++; else completas++;
    return { provincia: a.provincia, beneficiarios: a.cantidad_beneficiarios, cubiertas, faltantes };
  });

  body.innerHTML = filas.map(f => `<tr class="${f.faltantes.length ? "cobertura-fila-hueco" : ""}">
    <td><strong>${escaparHtml(f.provincia)}</strong></td>
    ${basicas.map(e => `<td><span class="cobertura-check ${f.cubiertas.has(e.id) ? "ok" : "falta"}">${f.cubiertas.has(e.id) ? "✓" : "✕"}</span></td>`).join("")}
    <td>${f.beneficiarios}</td>
  </tr>`).join("");

  if (count) count.textContent = `${getObraSocialDisplay(os)} — ${afiliados.length} provincias con afiliados`;
  if (resumen) {
    resumen.hidden = false;
    document.getElementById("cobertura-resumen-total").textContent = String(afiliados.length);
    document.getElementById("cobertura-resumen-hueco").textContent = String(conHueco);
    document.getElementById("cobertura-resumen-completa").textContent = String(completas);
  }
}

// ---------- Afiliados por localidad ----------

let afiliadosObraSocialActual = null;
let afiliadosLocalidadActuales = [];
let afiliadosSoloLectura = false;

function poblarSelectProvinciaAfiliados() {
  const select = document.getElementById("afiliados-provincia");
  if (!select) return;
  const provincias = [...new Set(localidadesArCache.map(l => l.provincia))].sort();
  select.innerHTML = `<option value="">—</option>` + provincias.map(p => `<option value="${escaparHtml(p)}">${escaparHtml(p)}</option>`).join("");
}

function poblarSelectPartidoAfiliados(provincia) {
  const select = document.getElementById("afiliados-partido");
  if (!select) return;
  if (!provincia) { select.innerHTML = `<option value="">—</option>`; select.disabled = true; return; }
  const partidos = [...new Set(localidadesArCache.filter(l => l.provincia === provincia).map(l => l.partido))].sort();
  select.innerHTML = `<option value="">—</option>` + partidos.map(p => `<option value="${escaparHtml(p)}">${escaparHtml(p)}</option>`).join("");
  select.disabled = false;
}

function poblarSelectLocalidadAfiliados(provincia, partido) {
  const select = document.getElementById("afiliados-localidad");
  if (!select) return;
  if (!provincia || !partido) { select.innerHTML = `<option value="">—</option>`; select.disabled = true; return; }
  const localidades = [...new Set(localidadesArCache.filter(l => l.provincia === provincia && l.partido === partido).map(l => l.localidad))].sort();
  select.innerHTML = `<option value="">—</option>` + localidades.map(l => `<option value="${escaparHtml(l)}">${escaparHtml(l)}</option>`).join("");
  select.disabled = false;
}

async function inicializarVistaAfiliados() {
  if (typeof document === "undefined") return;
  const esCartillaOs = normalizarPerfilAcceso(perfilSesionActual()) === "cartilla os";
  const picker = document.getElementById("afiliados-os-search")?.closest(".search-box");
  const selectEjercicio = document.getElementById("afiliados-ejercicio-select");
  try { await cargarLocalidadesAr(); poblarSelectProvinciaAfiliados(); } catch (error) { console.error(error); }

  if (esCartillaOs) {
    if (picker) picker.hidden = true;
    if (selectEjercicio) selectEjercicio.hidden = true;
    afiliadosSoloLectura = false;
    document.getElementById("afiliados-total-editar").hidden = false;
    document.getElementById("afiliados-agregar-block").hidden = false;
    document.getElementById("afiliados-total-input").readOnly = false;
    document.getElementById("afiliados-solo-lectura-aviso").hidden = true;
    if (!obrasSociales.length) { try { await cargarYRenderizarObrasSociales(); } catch (error) { console.error(error); } }
    const osId = obraSocialIdSesionActual();
    const os = obrasSociales.find(o => Number(o.id) === Number(osId));
    if (!os) return;
    document.getElementById("afiliados-os-search").value = getObraSocialDisplay(os);
    await handleSeleccionObraSocialAfiliados();
    return;
  }

  if (picker) picker.hidden = false;
  if (selectEjercicio) selectEjercicio.hidden = false;
  afiliadosSoloLectura = true;
  document.getElementById("afiliados-total-editar").hidden = true;
  document.getElementById("afiliados-agregar-block").hidden = true;
  document.getElementById("afiliados-total-input").readOnly = true;
  document.getElementById("afiliados-solo-lectura-aviso").hidden = false;
  if (!obrasSociales.length) { try { await cargarYRenderizarObrasSociales(); } catch (error) { console.error(error); } }
  const ejercicios = await cargarEjerciciosCartilla();
  poblarSelectorMultipleEjercicios("afiliados", ejercicios, () => requiereAutenticacion(handleCambioEjercicioAfiliados));
}

async function handleCambioEjercicioAfiliados() {
  const seleccionados = ejerciciosFiltroSeleccionados("afiliados");
  const osInput = document.getElementById("afiliados-os-search");
  const list = document.getElementById("afiliados-os-list");
  if (osInput) { osInput.value = ""; osInput.disabled = !seleccionados.length; }
  await handleSeleccionObraSocialAfiliados();
  if (!seleccionados.length) { if (list) list.innerHTML = ""; return; }
  const idsPresentaron = await obtenerObraSocialIdsConCartillaPresentada(seleccionados);
  if (list) list.innerHTML = obrasSociales
    .filter(os => idsPresentaron.has(Number(os.id)) && !String(os.rnos || "").trim().startsWith("9"))
    .sort((a, b) => (a.rnos || "").localeCompare(b.rnos || "", undefined, { numeric: true }))
    .map(os => `<option value="${escaparHtml(getObraSocialDisplay(os))}"></option>`).join("");
  if (osInput) osInput.placeholder = idsPresentaron.size
    ? `Elegí entre las ${idsPresentaron.size} Obras Sociales que presentaron Cartilla ${seleccionados.join(" / ")}...`
    : `Ninguna Obra Social presentó Cartilla para ${seleccionados.join(" / ")} todavía`;
}

// ---------- Configurar especialidades básicas obligatorias ----------

async function abrirModalBasicas() {
  try { await cargarTaxonomiaPrestador(); } catch (error) { console.error(error); }
  renderGruposBasicas();
  setFormMessage("basicas-message", "");
  abrirModal("basicas-modal");
}

function renderGruposBasicas() {
  const cont = document.getElementById("basicas-grupos");
  if (!cont) return;
  cont.innerHTML = tiposPrestadorCache.map(t => {
    const especialidades = especialidadesPrestadorCache.filter(e => e.tipo_prestador_id === t.id);
    return `<div class="especialidades-grupo">
      <div class="especialidades-grupo-titulo">${escaparHtml(t.nombre)}</div>
      <div class="especialidades-lista" style="max-height:none">
        ${especialidades.map(e => `<label class="checkbox-label especialidad-checkbox">
          <input type="checkbox" data-basica-id="${e.id}" ${e.basica_obligatoria ? "checked" : ""}>
          <span>${escaparHtml(e.nombre)}</span>
        </label>`).join("")}
      </div>
    </div>`;
  }).join("");
  cont.querySelectorAll("[data-basica-id]").forEach(input => {
    input.addEventListener("change", () => guardarBasicaObligatoria(input.dataset.basicaId, input.checked));
  });
}

async function guardarBasicaObligatoria(especialidadId, valor) {
  try {
    const session = await asegurarSesionVigente();
    const params = new URLSearchParams({ apikey: SUPABASE_PUBLISHABLE_KEY, id: `eq.${especialidadId}` });
    const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/especialidades_prestador?${params.toString()}`, {
      method: "PATCH", headers: { ...authHeaders(session.access_token), Prefer: "return=minimal" },
      body: JSON.stringify({ basica_obligatoria: valor })
    }, 10000, fetch);
    if (!response.ok) throw new Error(await leerErrorApi(response) || `Supabase respondió ${response.status}`);
    const especialidad = especialidadesPrestadorCache.find(e => e.id === especialidadId);
    if (especialidad) especialidad.basica_obligatoria = valor;
  } catch (error) {
    setFormMessage("basicas-message", error.message || "No se pudo guardar el cambio.");
  }
}

async function cargarAfiliadosTotal(obraSocialId) {
  const session = await asegurarSesionVigente();
  const params = new URLSearchParams({ select: "total_declarado", obra_social_id: `eq.${obraSocialId}`, apikey: SUPABASE_PUBLISHABLE_KEY });
  const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/afiliados_total?${params.toString()}`, { method: "GET", headers: authHeaders(session.access_token), cache: "no-store" }, 10000, fetch);
  if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
  const filas = await response.json();
  return filas[0]?.total_declarado ?? 0;
}

async function cargarAfiliadosLocalidadDeOS(obraSocialId) {
  const session = await asegurarSesionVigente();
  const params = new URLSearchParams({ select: "*", obra_social_id: `eq.${obraSocialId}`, order: "provincia.asc,partido.asc,localidad.asc", apikey: SUPABASE_PUBLISHABLE_KEY });
  const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/afiliados_localidad?${params.toString()}`, { method: "GET", headers: authHeaders(session.access_token), cache: "no-store" }, 10000, fetch);
  if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
  return response.json();
}

async function handleSeleccionObraSocialAfiliados() {
  const valor = document.getElementById("afiliados-os-search")?.value || "";
  const os = resolverObraSocialCartilla(valor);
  mostrarOsActualEnCabecera(os);
  const panel = document.getElementById("afiliados-panel");
  if (!os) { if (panel) panel.hidden = true; return; }
  afiliadosObraSocialActual = os;
  if (panel) panel.hidden = false;
  try {
    const [total, localidades] = await Promise.all([cargarAfiliadosTotal(os.id), cargarAfiliadosLocalidadDeOS(os.id)]);
    document.getElementById("afiliados-total-input").value = total || "";
    afiliadosLocalidadActuales = localidades;
    renderAfiliadosTabla();
  } catch (error) {
    mostrarToast(error.message || "No se pudieron cargar los afiliados.");
  }
}

function filtrarAfiliadosLocalidad() {
  const busqueda = normalizarTexto(document.getElementById("afiliados-buscar")?.value || "");
  if (!busqueda) return afiliadosLocalidadActuales;
  return afiliadosLocalidadActuales.filter(r =>
    normalizarTexto(r.localidad).includes(busqueda) ||
    normalizarTexto(r.partido).includes(busqueda) ||
    normalizarTexto(r.provincia).includes(busqueda)
  );
}

function renderAfiliadosTabla() {
  const totalDeclarado = Number(document.getElementById("afiliados-total-input")?.value || 0);
  const cargados = afiliadosLocalidadActuales.reduce((a, r) => a + (r.cantidad_beneficiarios || 0), 0);
  const resumen = document.getElementById("afiliados-total-resumen");
  if (resumen) resumen.textContent = `Cargados por localidad: ${cargados.toLocaleString("es-AR")} · Faltan: ${Math.max(0, totalDeclarado - cargados).toLocaleString("es-AR")}`;

  const filtradas = filtrarAfiliadosLocalidad();
  const body = document.getElementById("afiliados-table-body");
  const count = document.getElementById("afiliados-count");
  const empty = document.getElementById("afiliados-empty");
  if (count) {
    count.textContent = filtradas.length === afiliadosLocalidadActuales.length
      ? `${afiliadosLocalidadActuales.length} ${afiliadosLocalidadActuales.length === 1 ? "localidad cargada" : "localidades cargadas"}`
      : `${filtradas.length} de ${afiliadosLocalidadActuales.length} localidades`;
  }
  if (empty) empty.hidden = filtradas.length !== 0;
  body.innerHTML = filtradas.map(r => `<tr>
    <td>${escaparHtml(r.provincia)}</td><td>${escaparHtml(r.partido)}</td><td>${escaparHtml(r.localidad)}</td>
    <td>${afiliadosSoloLectura ? r.cantidad_beneficiarios : `<button type="button" class="link-button" data-afiliado-editar="${r.id}" title="Click para cambiar la cantidad">${r.cantidad_beneficiarios} ✎</button>`}</td>
    <td>${afiliadosSoloLectura ? "" : `<button type="button" class="notificacion-borrar" data-afiliado-borrar="${r.id}" title="Borrar">×</button>`}</td>
  </tr>`).join("");
  body.querySelectorAll("[data-afiliado-borrar]").forEach(btn => {
    btn.addEventListener("click", () => eliminarAfiliadoLocalidad(btn.dataset.afiliadoBorrar));
  });
  body.querySelectorAll("[data-afiliado-editar]").forEach(btn => {
    btn.addEventListener("click", () => editarCantidadAfiliadoLocalidad(btn.dataset.afiliadoEditar));
  });
}

async function editarCantidadAfiliadoLocalidad(id) {
  const fila = afiliadosLocalidadActuales.find(r => r.id === id);
  if (!fila) return;
  const nuevoValor = await mostrarPrompt(`Nueva cantidad de afiliados para ${fila.localidad}:`, fila.cantidad_beneficiarios, { titulo: "Editar cantidad", tipo: "number" });
  if (nuevoValor === null) return;
  const cantidad = Number(nuevoValor);
  if (!Number.isFinite(cantidad) || cantidad < 0) { mostrarToast("Ingresá un número válido."); return; }
  try {
    const session = await asegurarSesionVigente();
    const params = new URLSearchParams({ apikey: SUPABASE_PUBLISHABLE_KEY, id: `eq.${id}` });
    const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/afiliados_localidad?${params.toString()}`, {
      method: "PATCH", headers: { ...authHeaders(session.access_token), Prefer: "return=minimal" },
      body: JSON.stringify({ cantidad_beneficiarios: cantidad, actualizado_en: new Date().toISOString() })
    }, 10000, fetch);
    if (!response.ok) throw new Error(await leerErrorApi(response) || `Supabase respondió ${response.status}`);
    fila.cantidad_beneficiarios = cantidad;
    renderAfiliadosTabla();
    mostrarToast("Cantidad actualizada.");
  } catch (error) {
    mostrarToast(error.message || "No se pudo actualizar.");
  }
}

async function guardarTotalAfiliados() {
  if (!afiliadosObraSocialActual) return;
  const total = Number(document.getElementById("afiliados-total-input")?.value || 0);
  try {
    const session = await asegurarSesionVigente();
    const params = new URLSearchParams({ apikey: SUPABASE_PUBLISHABLE_KEY, on_conflict: "obra_social_id" });
    const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/afiliados_total?${params.toString()}`, {
      method: "POST", headers: { ...authHeaders(session.access_token), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([{ obra_social_id: afiliadosObraSocialActual.id, total_declarado: total, actualizado_en: new Date().toISOString() }])
    }, 10000, fetch);
    if (!response.ok) throw new Error(await leerErrorApi(response) || `Supabase respondió ${response.status}`);
    renderAfiliadosTabla();
    mostrarToast("Total de afiliados guardado.");
  } catch (error) {
    mostrarToast(error.message || "No se pudo guardar el total.");
  }
}

async function agregarAfiliadoLocalidad() {
  if (!afiliadosObraSocialActual) return;
  const provincia = document.getElementById("afiliados-provincia")?.value;
  const partido = document.getElementById("afiliados-partido")?.value;
  const localidad = document.getElementById("afiliados-localidad")?.value;
  const cantidad = Number(document.getElementById("afiliados-cantidad")?.value || 0);
  if (!provincia || !partido || !localidad) { mostrarToast("Elegí provincia, partido y localidad."); return; }
  if (!cantidad || cantidad <= 0) { mostrarToast("Ingresá una cantidad mayor a 0."); return; }
  try {
    const session = await asegurarSesionVigente();
    const params = new URLSearchParams({ apikey: SUPABASE_PUBLISHABLE_KEY, on_conflict: "obra_social_id,provincia,partido,localidad" });
    const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/afiliados_localidad?${params.toString()}`, {
      method: "POST", headers: { ...authHeaders(session.access_token), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([{ obra_social_id: afiliadosObraSocialActual.id, provincia, partido, localidad, cantidad_beneficiarios: cantidad, actualizado_en: new Date().toISOString() }])
    }, 10000, fetch);
    if (!response.ok) throw new Error(await leerErrorApi(response) || `Supabase respondió ${response.status}`);
    document.getElementById("afiliados-cantidad").value = "";
    afiliadosLocalidadActuales = await cargarAfiliadosLocalidadDeOS(afiliadosObraSocialActual.id);
    renderAfiliadosTabla();
    mostrarToast("Localidad agregada.");
  } catch (error) {
    mostrarToast(error.message || "No se pudo agregar la localidad.");
  }
}

async function eliminarAfiliadoLocalidad(id) {
  if (!(await mostrarConfirmacion("¿Borrar esta localidad?", { titulo: "Borrar localidad", textoAceptar: "Borrar" }))) return;
  try {
    const session = await asegurarSesionVigente();
    const params = new URLSearchParams({ apikey: SUPABASE_PUBLISHABLE_KEY, id: `eq.${id}` });
    const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/afiliados_localidad?${params.toString()}`, { method: "DELETE", headers: authHeaders(session.access_token) }, 10000, fetch);
    if (!response.ok) throw new Error(await leerErrorApi(response) || `Supabase respondió ${response.status}`);
    afiliadosLocalidadActuales = afiliadosLocalidadActuales.filter(r => r.id !== id);
    renderAfiliadosTabla();
  } catch (error) {
    mostrarToast(error.message || "No se pudo borrar.");
  }
}

// ---------- Presentar Cartilla (perfil Cartilla OS) ----------

// ---------- Presentar Cartilla (perfil Cartilla OS) ----------

async function cargarPeriodosOs(osId) {
  const session = await asegurarSesionVigente();
  const params = new URLSearchParams({ select: "id,ejercicio,fecha_ingreso,condicion", obra_social_id: `eq.${osId}`, order: "fecha_ingreso.desc", apikey: SUPABASE_PUBLISHABLE_KEY });
  const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/cartillas?${params.toString()}`, { method: "GET", headers: authHeaders(session.access_token), cache: "no-store" }, 10000, fetch);
  if (!response.ok) return [];
  return response.json();
}

// Llena el combo de período con solo el vigente + el anterior (no todo el historial),
// que es lo único con lo que la OS puede operar en un momento dado.
async function poblarSelectPeriodoOs(os) {
  const toolbar = document.getElementById("prestadores-header-os");
  const selectPeriodo = document.getElementById("prestadores-periodo-os");
  if (!selectPeriodo) return;
  const vigente = ejercicioVigenteParaOs(os);
  const anterior = ejercicioAnteriorParaOs(os);
  const relevantes = new Set([vigente, anterior].filter(Boolean));
  const todosLosPeriodos = await cargarPeriodosOs(os.id);
  const periodos = todosLosPeriodos.filter(p => relevantes.has(p.ejercicio));
  selectPeriodo.innerHTML = `<option value="vigente">Período vigente (${escaparHtml(vigente)}) — editable</option>` +
    periodos.map(p => `<option value="${p.id}">${escaparHtml(p.ejercicio)} — presentada el ${formatFechaPantalla(p.fecha_ingreso)}</option>`).join("");
  selectPeriodo.value = "vigente";
  if (toolbar) toolbar.hidden = false;
}

function resumenSnapshotTexto(texto) {
  if (!texto) return { tipos: [], cantidad: 0 };
  const partes = String(texto).split(";").map(s => s.trim()).filter(Boolean);
  const tipos = [];
  let cantidad = 0;
  partes.forEach(p => {
    const idx = p.indexOf(":");
    if (idx === -1) return;
    const tipo = p.slice(0, idx).trim();
    const esp = p.slice(idx + 1).trim();
    if (tipo) tipos.push(tipo);
    if (esp) cantidad += esp.split(",").filter(Boolean).length;
  });
  return { tipos, cantidad };
}

async function renderPrestadoresDesdeSnapshot(cartillaId) {
  const session = await asegurarSesionVigente();
  const params = new URLSearchParams({ select: "*", cartilla_id: `eq.${cartillaId}`, order: "nombre_completo.asc", apikey: SUPABASE_PUBLISHABLE_KEY });
  const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/cartillas_prestadores_snapshot?${params.toString()}`, { method: "GET", headers: authHeaders(session.access_token), cache: "no-store" }, 10000, fetch);
  const filas = response.ok ? await response.json() : [];
  const body = document.getElementById("prestadores-table-body");
  const count = document.getElementById("prestadores-count");
  const empty = document.getElementById("prestadores-empty");
  if (count) count.textContent = `${filas.length} ${filas.length === 1 ? "prestador presentado" : "prestadores presentados"} en esta Cartilla`;
  if (empty) empty.hidden = filas.length !== 0;
  if (body) body.innerHTML = filas.map(p => {
    const resumen = resumenSnapshotTexto(p.tipos_y_especialidades);
    return `<tr>
      <td><strong>${escaparHtml(p.nombre_completo || "—")}</strong></td>
      <td>${escaparHtml(p.cuit || "—")}</td>
      <td>${escaparHtml(resumen.tipos.join(", ") || "—")}</td>
      <td>${resumen.cantidad ? `${resumen.cantidad} especialidad${resumen.cantidad === 1 ? "" : "es"}` : "—"}</td>
      <td>${escaparHtml(p.adulto_pediatrico || "—")}</td>
      <td>${escaparHtml(p.localidad || "—")}</td>
      <td>${escaparHtml(p.tipo_contratacion || "—")}</td>
      <td style="text-align:center">${p.contrato_presentado ? `<span style="color:#278664;font-weight:800">✓</span> ${escaparHtml(p.contrato_numero_ex || "")}` : `<span style="color:#c0392b;font-weight:800">✕</span>`}</td>
      <td>${p.activo ? '<span style="color:#278664;font-weight:700">Activo</span>' : '<span style="color:#a33846;font-weight:700">De baja</span>'}</td>
    </tr>`;
  }).join("");
  const pag = document.getElementById("prestadores-pagination");
  if (pag) pag.innerHTML = "";
}

async function handleCambioPeriodoPrestadoresOs() {
  const select = document.getElementById("prestadores-periodo-os");
  const valor = select?.value || "vigente";
  const acciones = document.getElementById("prestadores-acciones-editar");
  const aviso = document.getElementById("prestadores-snapshot-aviso");
  const os = prestadorObraSocialActual;
  if (!os) return;

  if (valor === "vigente") {
    if (acciones) acciones.hidden = false;
    if (aviso) aviso.hidden = true;
    actualizarControlesPrestadores(true);
    await handleSeleccionObraSocialPrestadores();
    await verificarYRenderizarPresentacionCartillaOs(os);
    return;
  }

  if (acciones) acciones.hidden = true;
  const pillPresentar = document.getElementById("presentar-cartilla-pill");
  if (pillPresentar) pillPresentar.innerHTML = "";
  actualizarControlesPrestadores(false);
  const opcionTexto = select.options[select.selectedIndex]?.textContent || "";
  if (aviso) {
    aviso.hidden = false;
    aviso.textContent = `Estás viendo ${opcionTexto} — es la foto congelada de tu red tal como quedó al presentarla, no se puede editar. Para modificar tu red actual, volvé al "Período vigente".`;
  }
  await renderPrestadoresDesdeSnapshot(valor);
}

async function verificarYRenderizarPresentacionCartillaOs(os) {
  const pill = document.getElementById("presentar-cartilla-pill");
  if (!pill) return;
  const vigente = ejercicioVigenteParaOs(os);
  const anterior = ejercicioAnteriorParaOs(os);
  if (!vigente) { pill.innerHTML = ""; return; }
  pill.innerHTML = `<span class="stat-pill-inline">Consultando...</span>`;
  try {
    const session = await asegurarSesionVigente();
    const candidatos = [...new Set([vigente, anterior].filter(Boolean))];
    const params = new URLSearchParams({ select: "id,ejercicio,fecha_ingreso,condicion", obra_social_id: `eq.${os.id}`, ejercicio: `in.(${candidatos.map(e => `"${e}"`).join(",")})`, apikey: SUPABASE_PUBLISHABLE_KEY });
    const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/cartillas?${params.toString()}`, { method: "GET", headers: authHeaders(session.access_token), cache: "no-store" }, 10000, fetch);
    if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
    const presentadas = await response.json();
    const porEjercicio = new Map(presentadas.map(p => [p.ejercicio, p]));

    const pendientes = candidatos.filter(e => !porEjercicio.has(e));
    // El anterior (atrasado) primero si corresponde, después el vigente.
    pendientes.sort((a, b) => (a === anterior ? -1 : b === anterior ? 1 : 0));

    if (!pendientes.length) {
      const p = porEjercicio.get(vigente);
      pill.innerHTML = `<span class="stat-pill-inline ok" title="Cartilla del período ${escaparHtml(vigente)}">✓ Presentada ${formatFechaPantalla(p.fecha_ingreso)} · ${escaparHtml(p.condicion || "—")}</span>`;
      return;
    }

    pill.innerHTML = pendientes.map((ej, i) => `
      <span class="stat-pill-inline pendiente">
        <span>${ej === anterior ? "Atrasada" : "Sin presentar"}</span>
        <input type="text" class="presentar-cartilla-periodo-input" data-idx="${i}" value="${escaparHtml(ej)}">
        <button type="button" class="primary btn-presentar-cartilla" data-idx="${i}">Presentar</button>
      </span>`).join("");

    pill.querySelectorAll(".btn-presentar-cartilla").forEach(btn => {
      btn.addEventListener("click", () => {
        const input = pill.querySelector(`.presentar-cartilla-periodo-input[data-idx="${btn.dataset.idx}"]`);
        presentarCartillaOs(os, input?.value.trim(), btn);
      });
    });
  } catch (error) {
    pill.innerHTML = `<span class="stat-pill-inline">No se pudo consultar el estado</span>`;
  }
}

async function presentarCartillaOs(os, ejercicio, boton) {
  if (!ejercicio || !os) return;
  if (!(await mostrarConfirmacion(`¿Presentar la Cartilla del período ${ejercicio}? Se va a guardar una foto de tu red de prestadores tal como está ahora mismo, y ya no vas a poder modificar esta presentación (sí podés seguir editando tu red para la próxima).`, { titulo: "Presentar Cartilla", textoAceptar: "Presentar" }))) return;
  if (boton) { boton.disabled = true; boton.textContent = "Presentando..."; }
  try {
    const session = await asegurarSesionVigente();
    const anioInicio = anioInicioDesdeEjercicio(ejercicio);
    const registro = {
      obra_social_id: os.id,
      ejercicio,
      anio_inicio: anioInicio,
      fecha_inicio_ejercicio: fechaInicioEjercicioDesdeDiaMes(os.inicio_ejercicio, anioInicio),
      fecha_ingreso: hoyLocalISO(),
      condicion: "EN ESTUDIO"
    };
    const filaGuardada = await guardarCartillaEnSupabase(registro, null, session.access_token);
    const cartillaId = Array.isArray(filaGuardada) ? filaGuardada[0]?.id : filaGuardada?.id;
    if (cartillaId) {
      try { await tomarSnapshotPrestadores(cartillaId, os.id, session.access_token); } catch (error) { console.error("No se pudo generar el snapshot:", error); }
    }
    mostrarToast("¡Cartilla presentada! La Superintendencia la va a revisar.");
    await verificarYRenderizarPresentacionCartillaOs(os);
    try { await poblarSelectPeriodoOs(os); } catch (error) { console.error(error); }
  } catch (error) {
    mostrarToast(error.message || "No se pudo presentar la Cartilla.");
    if (boton) boton.disabled = false;
  }
}

async function inicializarVistaPrestadores() {
  if (typeof document === "undefined") return;
  const esCartillaOs = normalizarPerfilAcceso(perfilSesionActual()) === "cartilla os";
  const picker = document.getElementById("prestadores-os-search")?.closest(".search-box");
  const selectEjercicio = document.getElementById("prestadores-ejercicio-select");

  if (!tiposContratacionCache.length) {
    try { tiposContratacionCache = await cargarTiposContratacion(); } catch (error) { console.error(error); }
  }
  try { await cargarTaxonomiaPrestador(); } catch (error) { console.error(error); }
  try { await cargarLocalidadesAr(); poblarSelectProvinciaPrestador(); } catch (error) { console.error(error); }

  if (esCartillaOs) {
    if (picker) picker.hidden = true;
    if (selectEjercicio) selectEjercicio.hidden = true;
    if (!obrasSociales.length) { try { await cargarYRenderizarObrasSociales(); } catch (error) { console.error(error); } }
    const osId = obraSocialIdSesionActual();
    const os = obrasSociales.find(o => Number(o.id) === Number(osId));
    if (!os) {
      const count = document.getElementById("prestadores-count");
      if (count) count.textContent = "Tu usuario no tiene una Obra Social asignada. Avisá a la Superintendencia.";
      return;
    }
    document.getElementById("prestadores-os-search").value = getObraSocialDisplay(os);
    await handleSeleccionObraSocialPrestadores();
    await verificarYRenderizarPresentacionCartillaOs(os);
    try { await poblarSelectPeriodoOs(os); } catch (error) { console.error(error); }
    return;
  }

  const pillPresentar = document.getElementById("presentar-cartilla-pill");
  if (pillPresentar) pillPresentar.innerHTML = "";
  const headerOs = document.getElementById("prestadores-header-os");
  if (headerOs) headerOs.hidden = true;
  const avisoSnapshot = document.getElementById("prestadores-snapshot-aviso");
  if (avisoSnapshot) avisoSnapshot.hidden = true;
  const accionesEditar = document.getElementById("prestadores-acciones-editar");
  if (accionesEditar) accionesEditar.hidden = false;
  if (picker) picker.hidden = false;
  if (selectEjercicio) selectEjercicio.hidden = false;
  if (!obrasSociales.length) { try { await cargarYRenderizarObrasSociales(); } catch (error) { console.error(error); } }
  const ejercicios = await cargarEjerciciosCartilla();
  poblarSelectorMultipleEjercicios("prestadores", ejercicios, () => requiereAutenticacion(handleCambioEjercicioPrestadores));
  llenarDatalistsPrestador();
  const btnImportar = document.getElementById("btn-importar-cartilla");
  if (btnImportar) btnImportar.hidden = false;
}

async function handleCambioEjercicioPrestadores() {
  const seleccionados = ejerciciosFiltroSeleccionados("prestadores");
  const osInput = document.getElementById("prestadores-os-search");
  const list = document.getElementById("prestadores-os-list");
  if (osInput) { osInput.value = ""; osInput.disabled = !seleccionados.length; }
  await handleSeleccionObraSocialPrestadores();
  if (!seleccionados.length) { if (list) list.innerHTML = ""; return; }
  const idsPresentaron = await obtenerObraSocialIdsConCartillaPresentada(seleccionados);
  if (list) list.innerHTML = obrasSociales
    .filter(os => idsPresentaron.has(Number(os.id)) && !String(os.rnos || "").trim().startsWith("9"))
    .sort((a, b) => (a.rnos || "").localeCompare(b.rnos || "", undefined, { numeric: true }))
    .map(os => `<option value="${escaparHtml(getObraSocialDisplay(os))}"></option>`).join("");
  if (osInput) osInput.placeholder = idsPresentaron.size
    ? `Elegí entre las ${idsPresentaron.size} Obras Sociales que presentaron Cartilla ${seleccionados.join(" / ")}...`
    : `Ninguna Obra Social presentó Cartilla para ${seleccionados.join(" / ")} todavía`;
}

function actualizarControlesPrestadores(habilitado) {
  ["prestadores-search", "prestadores-estado-filter", "prestadores-contrato-filter", "btn-nuevo-prestador", "btn-export-prestadores"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = !habilitado;
  });
}

async function handleSeleccionObraSocialPrestadores() {
  const valor = document.getElementById("prestadores-os-search")?.value || "";
  const os = resolverObraSocialCartilla(valor);
  mostrarOsActualEnCabecera(os);
  if (!os) {
    prestadorObraSocialActual = null;
    prestadores = [];
    prestadoresPage = 1;
    renderPrestadores();
    const count = document.getElementById("prestadores-count");
    if (count) count.textContent = "Elegí una Obra Social arriba para ver su red de prestadores.";
    actualizarControlesPrestadores(false);
    return;
  }
  prestadorObraSocialActual = os;
  const count = document.getElementById("prestadores-count");
  if (count) count.textContent = "Cargando prestadores...";
  actualizarControlesPrestadores(true);
  try {
    prestadores = await cargarPrestadoresPorOS(os.id);
    prestadoresPage = 1;
    llenarDatalistsPrestador();
    renderPrestadores();
  } catch (error) {
    prestadores = [];
    renderPrestadores();
    mostrarToast("No se pudieron cargar los prestadores de esta Obra Social.");
  }
}

function filtrarPrestadores() {
  if (typeof document === "undefined") return prestadores;
  const busqueda = normalizar(document.getElementById("prestadores-search")?.value || "");
  const estado = document.getElementById("prestadores-estado-filter")?.value || "TODOS";
  const contrato = document.getElementById("prestadores-contrato-filter")?.value || "TODOS";
  return prestadores.filter(p => {
    if (busqueda) {
      const texto = normalizar(`${p.nombre_completo || ""} ${p.cuit || ""} ${p.localidad || ""}`);
      if (!texto.includes(busqueda)) return false;
    }
    if (estado === "ACTIVO" && !p.activo) return false;
    if (estado === "INACTIVO" && p.activo) return false;
    if (contrato === "SI" && !p.contrato_presentado) return false;
    if (contrato === "NO" && p.contrato_presentado) return false;
    return true;
  });
}

function renderPrestadores() {
  if (typeof document === "undefined") return;
  const tbody = document.getElementById("prestadores-table-body");
  if (!tbody) return;
  const filtradas = filtrarPrestadores();
  const pageInfo = paginarRegistros(filtradas, prestadoresPage, PAGE_SIZE);
  prestadoresPage = pageInfo.page;
  tbody.innerHTML = pageInfo.items.map(p => {
    const resumen = resumenTiposEspecialidades(p);
    return `<tr class="cartilla-row" data-prestador-id="${p.id}" tabindex="0" role="button" title="Clic para editar">
    <td><strong>${escaparHtml(p.nombre_completo || "—")}</strong></td>
    <td>${escaparHtml(p.cuit || "—")}</td>
    <td>${escaparHtml(resumen.tipos.join(", ") || "—")}</td>
    <td>${resumen.cantidad ? `${resumen.cantidad} especialidad${resumen.cantidad === 1 ? "" : "es"}` : "—"}</td>
    <td>${escaparHtml(p.adulto_pediatrico || "—")}</td>
    <td>${escaparHtml(p.localidad || "—")}</td>
    <td>${escaparHtml(p.tipo_contratacion || "—")}</td>
    <td style="text-align:center">${p.contrato_presentado ? `<span style="color:#278664;font-weight:800">✓</span> ${escaparHtml(p.contrato_numero_ex || "")}` : `<span style="color:#c0392b;font-weight:800">✕</span>`}</td>
    <td>${p.activo ? '<span style="color:#278664;font-weight:700">Activo</span>' : '<span style="color:#a33846;font-weight:700">De baja</span>'}</td>
  </tr>`;
  }).join("");
  const count = document.getElementById("prestadores-count");
  if (count && prestadorObraSocialActual) count.textContent = `${filtradas.length} ${filtradas.length === 1 ? "prestador" : "prestadores"} de ${getObraSocialDisplay(prestadorObraSocialActual)}`;
  renderPaginacion("prestadores-pagination", pageInfo, page => { prestadoresPage = page; renderPrestadores(); });
  const empty = document.getElementById("prestadores-empty");
  if (empty) empty.hidden = filtradas.length !== 0 || !prestadorObraSocialActual;
  document.querySelectorAll("#prestadores-table-body [data-prestador-id]").forEach(row => {
    const editar = () => requiereAutenticacion(() => abrirModalPrestadorEdicion(row.dataset.prestadorId));
    row.addEventListener("click", editar);
    row.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editar(); } });
  });
  if (prestadorObraSocialActual) {
    const si = prestadores.filter(p => p.contrato_presentado).length;
    document.getElementById("prestadores-resumen-si").textContent = String(si);
    document.getElementById("prestadores-resumen-no").textContent = String(prestadores.length - si);
  } else {
    document.getElementById("prestadores-resumen-si").textContent = "—";
    document.getElementById("prestadores-resumen-no").textContent = "—";
  }
}

// ---------- Buscador REFES (autocompletar prestador nuevo) ----------
let refesBuscarTimeout = null;

async function buscarEnRefes(texto) {
  const params = new URLSearchParams();
  params.set("select", "id,nombre,provincia,partido,localidad,domicilio,latitud,longitud");
  params.set("nombre", `ilike.*${texto.replace(/[%*]/g, "")}*`);
  params.set("limit", "15");
  params.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  const response = await fetchConTimeout(`${SUPABASE_URL}/rest/v1/refes_establecimientos?${params.toString()}`, { method: "GET", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Accept: "application/json" }, cache: "no-store" }, 10000, fetch);
  if (!response.ok) return [];
  return response.json();
}

function renderResultadosRefes(resultados) {
  const cont = document.getElementById("prestador-refes-resultados");
  if (!cont) return;
  if (!resultados.length) { cont.hidden = true; cont.innerHTML = ""; return; }
  cont.innerHTML = resultados.map(r => `<div class="refes-resultado-item" data-refes-id="${r.id}">
    <strong>${escaparHtml(r.nombre)}</strong>
    <span>${escaparHtml([r.localidad, r.partido, r.provincia].filter(Boolean).join(", "))}</span>
  </div>`).join("");
  cont.hidden = false;
  cont.querySelectorAll("[data-refes-id]").forEach(item => {
    item.addEventListener("click", () => {
      const r = resultados.find(x => String(x.id) === item.dataset.refesId);
      if (r) aplicarResultadoRefes(r);
      cont.hidden = true;
    });
  });
}

function aplicarResultadoRefes(r) {
  document.getElementById("prestador-nombre").value = r.nombre || "";
  document.getElementById("prestador-domicilio").value = r.domicilio || "";
  document.getElementById("prestador-latitud").value = r.latitud ?? "";
  document.getElementById("prestador-longitud").value = r.longitud ?? "";
  document.getElementById("prestador-refes-search").value = "";

  // Provincia/Partido/Localidad del REFES no siempre coinciden textualmente con las
  // de localidades_ar (distintas fuentes) — intentamos matchear, y si no hay
  // coincidencia exacta dejamos el combo para que lo elijan a mano.
  const selectProvincia = document.getElementById("prestador-provincia");
  const normaliza = t => normalizar(String(t || ""));
  const provinciaOpcion = [...selectProvincia.options].find(o => normaliza(o.value) === normaliza(r.provincia));
  if (provinciaOpcion) {
    selectProvincia.value = provinciaOpcion.value;
    poblarSelectPartidoPrestador(provinciaOpcion.value);
    const selectPartido = document.getElementById("prestador-partido");
    const partidoOpcion = [...selectPartido.options].find(o => normaliza(o.value) === normaliza(r.partido));
    if (partidoOpcion) {
      selectPartido.value = partidoOpcion.value;
      poblarSelectLocalidadPrestador(provinciaOpcion.value, partidoOpcion.value);
      const selectLocalidad = document.getElementById("prestador-localidad");
      const localidadOpcion = [...selectLocalidad.options].find(o => normaliza(o.value) === normaliza(r.localidad));
      if (localidadOpcion) selectLocalidad.value = localidadOpcion.value;
    }
  }
  mostrarToast("Se completaron los datos desde el REFES. Revisá Provincia/Partido/Localidad.");
}

function actualizarVisibilidadCampoContratoEx() {
  const select = document.getElementById("prestador-contrato-presentado");
  const campoEx = document.getElementById("prestador-contrato-ex");
  if (campoEx) campoEx.closest("label").hidden = select?.value !== "SI";
}

function limpiarFormularioPrestador() {
  document.getElementById("prestador-form")?.reset();
  document.getElementById("prestador-id").value = "";
  const refesSearch = document.getElementById("prestador-refes-search");
  if (refesSearch) refesSearch.value = "";
  const refesResultados = document.getElementById("prestador-refes-resultados");
  if (refesResultados) refesResultados.hidden = true;
  const activo = document.getElementById("prestador-activo");
  if (activo) activo.checked = true;
  const contratoPresentado = document.getElementById("prestador-contrato-presentado");
  if (contratoPresentado) contratoPresentado.value = "NO";
  setFormMessage("prestador-form-message", "");
  const eliminar = document.getElementById("prestador-eliminar");
  if (eliminar) eliminar.hidden = true;
  tiposActivosModal = new Set();
  especialidadesSeleccionadasModal = new Set();
  renderChipsTiposModal();
  renderGruposEspecialidadesModal();
  poblarSelectPartidoPrestador("");
  poblarSelectLocalidadPrestador("", "");
}

function abrirModalPrestadorNuevo() {
  if (!prestadorObraSocialActual) return;
  limpiarFormularioPrestador();
  document.getElementById("prestador-os-id").value = prestadorObraSocialActual.id;
  document.getElementById("prestador-modal-title").textContent = `Nuevo prestador — ${getObraSocialDisplay(prestadorObraSocialActual)}`;
  actualizarVisibilidadCampoContratoEx();
  abrirModal("prestador-modal");
  document.getElementById("prestador-nombre")?.focus();
}

function abrirModalPrestadorEdicion(id) {
  const p = prestadores.find(item => String(item.id) === String(id));
  if (!p) return;
  limpiarFormularioPrestador();
  document.getElementById("prestador-modal-title").textContent = "Editar prestador";
  document.getElementById("prestador-id").value = p.id;
  document.getElementById("prestador-os-id").value = p.obra_social_id;
  document.getElementById("prestador-nombre").value = p.nombre_completo || "";
  document.getElementById("prestador-cuit").value = p.cuit || "";
  document.getElementById("prestador-adulto-ped").value = p.adulto_pediatrico || "";
  document.getElementById("prestador-telefono").value = p.telefono || "";
  document.getElementById("prestador-email").value = p.email || "";
  document.getElementById("prestador-provincia").value = p.provincia || "";
  poblarSelectPartidoPrestador(p.provincia || "", p.partido || "");
  poblarSelectLocalidadPrestador(p.provincia || "", p.partido || "", p.localidad || "");
  document.getElementById("prestador-domicilio").value = p.domicilio || "";
  document.getElementById("prestador-beneficiarios").value = p.cantidad_beneficiarios_localidad ?? "";
  document.getElementById("prestador-latitud").value = p.latitud ?? "";
  document.getElementById("prestador-longitud").value = p.longitud ?? "";
  document.getElementById("prestador-contratacion").value = p.tipo_contratacion || "";
  document.getElementById("prestador-contrato-presentado").value = p.contrato_presentado ? "SI" : "NO";
  document.getElementById("prestador-contrato-ex").value = p.contrato_numero_ex || "";
  document.getElementById("prestador-activo").checked = p.activo !== false;
  (p.prestador_especialidades || []).forEach(f => {
    if (!f.especialidad_id) return;
    especialidadesSeleccionadasModal.add(f.especialidad_id);
    const tipoId = f.especialidades_prestador?.tipo_prestador_id;
    if (tipoId) tiposActivosModal.add(tipoId);
  });
  renderChipsTiposModal();
  renderGruposEspecialidadesModal();
  const eliminar = document.getElementById("prestador-eliminar");
  if (eliminar) eliminar.hidden = false;
  actualizarVisibilidadCampoContratoEx();
  abrirModal("prestador-modal");
}

function buildPrestadorWriteUrl(id = null) {
  const params = new URLSearchParams();
  params.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  if (id) params.set("id", `eq.${id}`);
  return `${SUPABASE_URL}/rest/v1/prestadores?${params.toString()}`;
}

function buildPrestadorEspecialidadesUrl(prestadorId = null) {
  const params = new URLSearchParams();
  params.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  if (prestadorId) params.set("prestador_id", `eq.${prestadorId}`);
  return `${SUPABASE_URL}/rest/v1/prestador_especialidades?${params.toString()}`;
}

async function sincronizarEspecialidadesPrestador(prestadorId, accessToken) {
  // Enfoque simple: borrar todo lo que tenía y volver a insertar la selección actual.
  const del = await fetchConTimeout(buildPrestadorEspecialidadesUrl(prestadorId), { method: "DELETE", headers: authHeaders(accessToken) }, 10000, fetch);
  if (!del.ok) throw new Error(await leerErrorApi(del) || `Supabase respondió ${del.status}`);
  if (!especialidadesSeleccionadasModal.size) return;
  const filas = [...especialidadesSeleccionadasModal].map(especialidad_id => ({ prestador_id: prestadorId, especialidad_id }));
  const ins = await fetchConTimeout(buildPrestadorEspecialidadesUrl(), {
    method: "POST", headers: { ...authHeaders(accessToken), Prefer: "return=minimal" }, body: JSON.stringify(filas)
  }, 10000, fetch);
  if (!ins.ok) throw new Error(await leerErrorApi(ins) || `Supabase respondió ${ins.status}`);
}

async function handlePrestadorSubmit(event) {
  event.preventDefault();
  setFormMessage("prestador-form-message", "");
  const save = document.getElementById("prestador-save");
  if (save) save.disabled = true;
  try {
    const session = await asegurarSesionVigente();
    const osId = document.getElementById("prestador-os-id")?.value;
    if (!osId) throw new Error("Falta la Obra Social.");
    const contratoPresentado = document.getElementById("prestador-contrato-presentado")?.value === "SI";
    const beneficiariosValor = document.getElementById("prestador-beneficiarios")?.value;
    const registro = {
      obra_social_id: Number(osId),
      nombre_completo: document.getElementById("prestador-nombre")?.value.trim(),
      cuit: document.getElementById("prestador-cuit")?.value.trim() || null,
      adulto_pediatrico: document.getElementById("prestador-adulto-ped")?.value || null,
      telefono: document.getElementById("prestador-telefono")?.value.trim() || null,
      email: document.getElementById("prestador-email")?.value.trim() || null,
      provincia: document.getElementById("prestador-provincia")?.value.trim() || null,
      partido: document.getElementById("prestador-partido")?.value.trim() || null,
      localidad: document.getElementById("prestador-localidad")?.value.trim() || null,
      domicilio: document.getElementById("prestador-domicilio")?.value.trim() || null,
      cantidad_beneficiarios_localidad: beneficiariosValor ? Number(beneficiariosValor) : null,
      latitud: document.getElementById("prestador-latitud")?.value ? Number(document.getElementById("prestador-latitud").value) : null,
      longitud: document.getElementById("prestador-longitud")?.value ? Number(document.getElementById("prestador-longitud").value) : null,
      tipo_contratacion: document.getElementById("prestador-contratacion")?.value.trim() || null,
      contrato_presentado: contratoPresentado,
      contrato_numero_ex: contratoPresentado ? (document.getElementById("prestador-contrato-ex")?.value.trim() || null) : null,
      activo: document.getElementById("prestador-activo")?.checked !== false
    };
    if (!registro.nombre_completo) throw new Error("Ingresá el nombre del prestador.");
    const id = document.getElementById("prestador-id")?.value || "";
    const editando = Boolean(id);
    const payload = editando ? { ...registro, updated_at: new Date().toISOString() } : registro;
    const response = await fetchConTimeout(buildPrestadorWriteUrl(editando ? id : null), {
      method: editando ? "PATCH" : "POST",
      headers: { ...authHeaders(session.access_token), Prefer: "return=representation" },
      body: JSON.stringify(payload)
    }, 10000, fetch);
    if (!response.ok) throw new Error(await leerErrorApi(response) || `Supabase respondió ${response.status}`);
    const filaGuardada = await response.json();
    const prestadorId = editando ? id : filaGuardada[0]?.id;
    if (prestadorId) await sincronizarEspecialidadesPrestador(prestadorId, session.access_token);
    cerrarModal("prestador-modal");
    mostrarToast(editando ? "Prestador actualizado." : "Prestador creado.");
    if (prestadorObraSocialActual) {
      prestadores = await cargarPrestadoresPorOS(prestadorObraSocialActual.id);
      renderPrestadores();
    }
  } catch (error) {
    setFormMessage("prestador-form-message", error.message || "No se pudo guardar el prestador.");
  } finally {
    if (save) save.disabled = false;
  }
}

async function eliminarPrestadorActual() {
  const id = document.getElementById("prestador-id")?.value;
  if (!id) return;
  if (!(await mostrarConfirmacion("¿Eliminar este prestador de la red? No se puede deshacer.", { titulo: "Eliminar prestador", textoAceptar: "Eliminar" }))) return;
  try {
    const session = await asegurarSesionVigente();
    const response = await fetchConTimeout(buildPrestadorWriteUrl(id), { method: "DELETE", headers: authHeaders(session.access_token) }, 10000, fetch);
    if (!response.ok) throw new Error(await leerErrorApi(response) || `Supabase respondió ${response.status}`);
    cerrarModal("prestador-modal");
    mostrarToast("Prestador eliminado.");
    if (prestadorObraSocialActual) {
      prestadores = await cargarPrestadoresPorOS(prestadorObraSocialActual.id);
      renderPrestadores();
    }
  } catch (error) {
    mostrarToast(error.message || "No se pudo eliminar el prestador.");
  }
}

function exportarPrestadoresExcel() {
  if (typeof document === "undefined" || !prestadorObraSocialActual) return;
  if (!window.XLSX) { mostrarToast("No se pudo cargar el generador de Excel. Recargá la página e intentá nuevamente.", "error"); return; }
  const filas = filtrarPrestadores();
  const encabezado = ["Nombre", "CUIT", "Tipo de prestador", "Especialidad", "Adulto/Pediátrico", "Provincia", "Partido", "Localidad", "Beneficiarios en la localidad", "Domicilio", "Teléfono", "Email", "Tipo de contratación", "Contrato presentado", "Nº EX del contrato", "Activo"];
  // Una fila por cada especialidad tildada, igual al formato Anexo III de siempre.
  // Si un prestador todavía no tiene ninguna especialidad cargada, sale una sola fila con esas columnas vacías.
  const filasExcel = filas.flatMap(p => {
    const especialidades = p.prestador_especialidades || [];
    const base = [
      p.nombre_completo || "", p.cuit || "",
    ];
    const cola = [
      p.adulto_pediatrico || "", p.provincia || "", p.partido || "", p.localidad || "",
      p.cantidad_beneficiarios_localidad ?? "", p.domicilio || "", p.telefono || "", p.email || "",
      p.tipo_contratacion || "", p.contrato_presentado ? "SI" : "NO", p.contrato_numero_ex || "", p.activo ? "SI" : "NO"
    ];
    if (!especialidades.length) return [[...base, "", "", ...cola]];
    return especialidades.map(f => [...base, f.especialidades_prestador?.tipos_prestador?.nombre || "", f.especialidades_prestador?.nombre || "", ...cola]);
  });
  const matriz = [
    [`Anexo III - Red de prestadores - ${getObraSocialDisplay(prestadorObraSocialActual)}`],
    [`Generado: ${formatearFechaHoraExportacion()}`],
    [],
    encabezado,
    ...filasExcel
  ];
  const hoja = crearHojaExcelConDiseno(matriz, "Prestadores", 3);
  const libro = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(libro, hoja, "Prestadores");
  window.XLSX.writeFile(libro, `anexo3_${prestadorObraSocialActual.rnos || "os"}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// Al presentarse una Cartilla NUEVA, se congela una copia ("foto") de la red de
// prestadores de esa OS en ese momento — la red viva se sigue editando todo el
// año, pero esta copia queda fija tal como estaba al presentar el expediente.
function buildSnapshotWriteUrl() {
  const params = new URLSearchParams();
  params.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  return `${SUPABASE_URL}/rest/v1/cartillas_prestadores_snapshot?${params.toString()}`;
}

function textoTiposYEspecialidades(p) {
  const filas = p.prestador_especialidades || [];
  if (!filas.length) return "";
  const porTipo = new Map();
  filas.forEach(f => {
    const tipo = f.especialidades_prestador?.tipos_prestador?.nombre;
    const especialidad = f.especialidades_prestador?.nombre;
    if (!tipo || !especialidad) return;
    if (!porTipo.has(tipo)) porTipo.set(tipo, []);
    porTipo.get(tipo).push(especialidad);
  });
  return [...porTipo.entries()].map(([tipo, especialidades]) => `${tipo}: ${especialidades.join(", ")}`).join("; ");
}

async function tomarSnapshotPrestadores(cartillaId, obraSocialId, accessToken) {
  const listaPrestadores = await cargarPrestadoresPorOS(obraSocialId);
  if (!listaPrestadores.length) return;
  const filas = listaPrestadores.map(p => ({
    cartilla_id: cartillaId,
    prestador_id: p.id,
    nombre_completo: p.nombre_completo,
    cuit: p.cuit,
    tipos_y_especialidades: textoTiposYEspecialidades(p),
    adulto_pediatrico: p.adulto_pediatrico,
    provincia: p.provincia,
    partido: p.partido,
    localidad: p.localidad,
    cantidad_beneficiarios_localidad: p.cantidad_beneficiarios_localidad,
    domicilio: p.domicilio,
    telefono: p.telefono,
    email: p.email,
    activo: p.activo,
    tipo_contratacion: p.tipo_contratacion,
    contrato_presentado: p.contrato_presentado,
    contrato_numero_ex: p.contrato_numero_ex
  }));
  const response = await fetchConTimeout(buildSnapshotWriteUrl(), {
    method: "POST", headers: { ...authHeaders(accessToken), Prefer: "return=minimal" }, body: JSON.stringify(filas)
  }, 15000, fetch);
  if (!response.ok) throw new Error(await leerErrorApi(response) || `Supabase respondió ${response.status}`);
}

async function initBrowser() {
  const recoveryDetected = procesarRecuperacionDesdeUrl();

  document.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.view)));
  document.querySelectorAll(".nav-group-toggle").forEach(btn => btn.addEventListener("click", () => {
    const group = btn.closest(".nav-group");
    const collapsed = group?.classList.toggle("collapsed") || false;
    btn.setAttribute("aria-expanded", String(!collapsed));
  }));
  document.querySelectorAll("[data-go]").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.go)));
  document.querySelectorAll("[data-close-modal]").forEach(btn => btn.addEventListener("click", () => cerrarModal(btn.dataset.closeModal)));
  document.querySelectorAll("[data-toggle-password]").forEach(btn => btn.addEventListener("click", () => togglePassword(btn.dataset.togglePassword, btn)));

  document.getElementById("os-search")?.addEventListener("input", renderObrasSociales);
  document.getElementById("os-estado-filter")?.addEventListener("change", renderObrasSociales);
  document.getElementById("os-inicio-filter")?.addEventListener("change", renderObrasSociales);
  document.getElementById("rnos-sort")?.addEventListener("click", toggleRnosSort);
  document.getElementById("btn-nueva-os")?.addEventListener("click", () => requiereAutenticacion(abrirModalNueva));
  document.getElementById("os-modal-close")?.addEventListener("click", () => cerrarModal("os-modal"));
  document.getElementById("os-cancelar")?.addEventListener("click", () => cerrarModal("os-modal"));
  document.getElementById("os-form")?.addEventListener("submit", handleOsSubmit);

  document.getElementById("patologia-search")?.addEventListener("input", renderPatologias);
  document.getElementById("btn-nueva-patologia")?.addEventListener("click", () => requiereAutenticacion(abrirModalNuevaPatologia));
  document.getElementById("patologia-modal-close")?.addEventListener("click", () => cerrarModal("patologia-modal"));
  document.getElementById("patologia-cancelar")?.addEventListener("click", () => cerrarModal("patologia-modal"));
  document.getElementById("patologia-form")?.addEventListener("submit", handlePatologiaSubmit);
  document.getElementById("patologia-eliminar")?.addEventListener("click", handleEliminarPatologia);

  document.getElementById("droga-search")?.addEventListener("input", renderDrogas);
  document.getElementById("btn-nueva-droga")?.addEventListener("click", () => requiereAutenticacion(abrirModalNuevaDroga));
  document.getElementById("droga-modal-close")?.addEventListener("click", () => cerrarModal("droga-modal"));
  document.getElementById("droga-cancelar")?.addEventListener("click", () => cerrarModal("droga-modal"));
  document.getElementById("droga-form")?.addEventListener("submit", handleDrogaSubmit);
  document.getElementById("droga-eliminar")?.addEventListener("click", handleEliminarDroga);
  document.getElementById("droga-es-soporte")?.addEventListener("change", actualizarVisibilidadSoporte);
  document.getElementById("droga-marca-agregar")?.addEventListener("click", agregarMarcaTemporal);
  document.getElementById("droga-patologia-agregar")?.addEventListener("click", agregarPatologiaTemporal);

  document.getElementById("btn-nueva-plantilla")?.addEventListener("click", () => requiereAutenticacion(abrirModalNuevaPlantilla));
  document.getElementById("plantilla-modal-close")?.addEventListener("click", () => cerrarModal("plantilla-modal"));
  document.getElementById("plantilla-cancelar")?.addEventListener("click", () => cerrarModal("plantilla-modal"));
  document.getElementById("plantilla-form")?.addEventListener("submit", handlePlantillaSubmit);
  document.getElementById("plantilla-eliminar")?.addEventListener("click", handleEliminarPlantilla);

  document.getElementById("expediente-search")?.addEventListener("input", renderExpedientes);
  document.getElementById("expediente-tab-activos")?.addEventListener("click", () => {
    expedienteVistaEstado = "activos";
    document.getElementById("expediente-tab-activos")?.classList.add("active");
    document.getElementById("expediente-tab-cerrados")?.classList.remove("active");
    renderExpedientes();
  });
  document.getElementById("expediente-tab-cerrados")?.addEventListener("click", () => {
    expedienteVistaEstado = "cerrados";
    document.getElementById("expediente-tab-cerrados")?.classList.add("active");
    document.getElementById("expediente-tab-activos")?.classList.remove("active");
    renderExpedientes();
  });
  document.getElementById("btn-nuevo-expediente")?.addEventListener("click", () => requiereAutenticacion(abrirModalNuevoExpediente));
  document.getElementById("expediente-modal-close")?.addEventListener("click", () => cerrarModal("expediente-modal"));
  document.getElementById("expediente-cancelar")?.addEventListener("click", () => cerrarModal("expediente-modal"));
  document.getElementById("expediente-form")?.addEventListener("submit", handleExpedienteSubmit);
  document.getElementById("expediente-eliminar")?.addEventListener("click", handleEliminarExpediente);
  document.getElementById("expediente-es-denunciante")?.addEventListener("change", actualizarVisibilidadDenunciante);
  document.getElementById("expediente-droga-select")?.addEventListener("change", poblarSelectMarcasParaDroga);
  document.getElementById("expediente-droga-agregar")?.addEventListener("click", agregarDrogaTemporalExpediente);
  document.getElementById("expediente-os-input")?.addEventListener("change", event => {
    event.target.dataset.selectedId = obrasSocialesTodasPorEtiqueta.get(event.target.value) || "";
    poblarSelectFiliales(event.target.dataset.selectedId);
  });
  document.getElementById("expediente-filial-agregar")?.addEventListener("click", () => requiereAutenticacion(handleAgregarFilial));
  document.querySelectorAll(".form-section-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const seccion = btn.closest(".form-section");
      const formulario = btn.closest("form");
      if (!seccion || !formulario) return;
      const estabaColapsada = seccion.classList.contains("collapsed");
      if (estabaColapsada) {
        // Acordeón: al abrir una sección, se cierran las demás (dentro del mismo formulario).
        formulario.querySelectorAll(".form-section").forEach(s => s.classList.add("collapsed"));
        seccion.classList.remove("collapsed");
      } else {
        seccion.classList.add("collapsed");
      }
    });
  });
  document.getElementById("btn-generar-ifsol")?.addEventListener("click", () => handleGenerarInforme("IFSOL"));
  document.getElementById("btn-generar-ifder")?.addEventListener("click", () => handleGenerarInforme("IFDER"));
  document.getElementById("btn-mail-os")?.addEventListener("click", () => abrirModalMail("os"));
  document.getElementById("btn-mail-afiliado")?.addEventListener("click", () => abrirModalMail("afiliado"));
  document.getElementById("mail-modal-close")?.addEventListener("click", () => cerrarModal("mail-modal"));
  document.getElementById("mail-cerrar")?.addEventListener("click", () => cerrarModal("mail-modal"));
  document.getElementById("mail-copiar")?.addEventListener("click", async () => {
    const div = document.getElementById("mail-texto");
    const html = div?.innerHTML || "";
    const texto = div?.innerText || "";
    try {
      if (window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": new Blob([texto], { type: "text/plain" }),
            "text/html": new Blob([html], { type: "text/html" })
          })
        ]);
      } else {
        await navigator.clipboard.writeText(texto);
      }
      mostrarToast("Texto copiado (con negrita) al portapapeles.");
    } catch {
      mostrarToast("No se pudo copiar automáticamente: seleccioná el texto y copiá con Ctrl+C.");
    }
  });
  document.getElementById("expediente-adjunto-agregar")?.addEventListener("click", handleAgregarAdjunto);
  document.getElementById("expediente-pasos")?.addEventListener("paste", event => {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        event.preventDefault();
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          const contenedor = document.getElementById("expediente-pasos");
          const img = document.createElement("img");
          img.src = reader.result;
          img.style.maxWidth = "100%";
          contenedor.appendChild(document.createElement("br"));
          contenedor.appendChild(img);
          contenedor.appendChild(document.createElement("br"));
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  });

  document.getElementById("px-patologia-search")?.addEventListener("input", renderPxPatologias);
  document.getElementById("btn-nueva-px-patologia")?.addEventListener("click", () => requiereAutenticacion(abrirModalNuevaPxPatologia));
  document.getElementById("px-patologia-modal-close")?.addEventListener("click", () => cerrarModal("px-patologia-modal"));
  document.getElementById("px-patologia-cancelar")?.addEventListener("click", () => cerrarModal("px-patologia-modal"));
  document.getElementById("px-patologia-form")?.addEventListener("submit", handlePxPatologiaSubmit);
  document.getElementById("px-patologia-eliminar")?.addEventListener("click", handleEliminarPxPatologia);

  document.getElementById("btn-nueva-px-plantilla")?.addEventListener("click", () => requiereAutenticacion(abrirModalNuevaPxPlantilla));
  document.getElementById("px-plantilla-modal-close")?.addEventListener("click", () => cerrarModal("px-plantilla-modal"));
  document.getElementById("px-plantilla-cancelar")?.addEventListener("click", () => cerrarModal("px-plantilla-modal"));
  document.getElementById("px-plantilla-form")?.addEventListener("submit", handlePxPlantillaSubmit);
  document.getElementById("px-plantilla-eliminar")?.addEventListener("click", handleEliminarPxPlantilla);

  document.getElementById("preexistencia-search")?.addEventListener("input", renderPreexistencias);
  document.getElementById("preexistencia-tab-activos")?.addEventListener("click", () => {
    preexistenciaVistaEstado = "activos";
    document.getElementById("preexistencia-tab-activos")?.classList.add("active");
    document.getElementById("preexistencia-tab-cerrados")?.classList.remove("active");
    renderPreexistencias();
  });
  document.getElementById("preexistencia-tab-cerrados")?.addEventListener("click", () => {
    preexistenciaVistaEstado = "cerrados";
    document.getElementById("preexistencia-tab-cerrados")?.classList.add("active");
    document.getElementById("preexistencia-tab-activos")?.classList.remove("active");
    renderPreexistencias();
  });
  document.getElementById("btn-nueva-preexistencia")?.addEventListener("click", () => requiereAutenticacion(abrirModalNuevaPreexistencia));
  document.getElementById("preexistencia-modal-close")?.addEventListener("click", () => cerrarModal("preexistencia-modal"));
  document.getElementById("preexistencia-cancelar")?.addEventListener("click", () => cerrarModal("preexistencia-modal"));
  document.getElementById("preexistencia-form")?.addEventListener("submit", handlePreexistenciaSubmit);
  document.getElementById("preexistencia-eliminar")?.addEventListener("click", handleEliminarPreexistencia);
  document.getElementById("contacto-os-modal-close")?.addEventListener("click", () => cerrarModal("contacto-os-modal"));
  document.getElementById("contacto-os-modal-cerrar")?.addEventListener("click", () => cerrarModal("contacto-os-modal"));
  document.getElementById("contacto-os-form")?.addEventListener("submit", handleContactoOsSubmit);
  document.getElementById("expediente-os-contacto")?.addEventListener("click", () => abrirModalContactoOs(document.getElementById("expediente-os-input")?.dataset.selectedId));
  document.getElementById("preexistencia-emp-contacto")?.addEventListener("click", () => abrirModalContactoOs(document.getElementById("preexistencia-emp-input")?.dataset.selectedId, "EMP"));

  document.getElementById("preexistencia-emp-input")?.addEventListener("change", event => {
    event.target.dataset.selectedId = empSoloPorEtiqueta.get(event.target.value) || "";
  });
  document.getElementById("preexistencia-patologia")?.addEventListener("change", event => {
    const patologia = pxPatologias.find(p => String(p.id) === String(event.target.value));
    if (patologia?.plantilla_id) document.getElementById("preexistencia-plantilla").value = patologia.plantilla_id;
  });
  document.getElementById("btn-generar-inffc")?.addEventListener("click", handleGenerarInformeInffc);
  document.getElementById("preexistencia-adjunto-agregar")?.addEventListener("click", handleAgregarAdjuntoPx);
  document.getElementById("preexistencia-profesional-agregar")?.addEventListener("click", agregarProfesionalPxTemporal);
  document.getElementById("px-reporte-tab-emp")?.addEventListener("click", () => {
    pxReporteModo = "emp"; pxReporteDrill = null;
    document.getElementById("px-reporte-tab-emp")?.classList.add("active");
    document.getElementById("px-reporte-tab-patologia")?.classList.remove("active");
    renderPxEmp();
  });
  document.getElementById("px-reporte-tab-patologia")?.addEventListener("click", () => {
    pxReporteModo = "patologia"; pxReporteDrill = null;
    document.getElementById("px-reporte-tab-patologia")?.classList.add("active");
    document.getElementById("px-reporte-tab-emp")?.classList.remove("active");
    renderPxEmp();
  });
  document.getElementById("px-reporte-volver")?.addEventListener("click", () => { pxReporteDrill = null; renderPxEmp(); });
  document.getElementById("px-reporte-exportar-excel")?.addEventListener("click", exportarPxReporteExcel);
  document.getElementById("px-reporte-exportar-pdf")?.addEventListener("click", exportarPxReportePdf);
  document.getElementById("up-reporte-tab-os")?.addEventListener("click", () => {
    upReporteModo = "os"; upReporteDrill = null;
    document.getElementById("up-reporte-tab-os")?.classList.add("active");
    document.getElementById("up-reporte-tab-patologia")?.classList.remove("active");
    renderUpReportes();
  });
  document.getElementById("up-reporte-tab-patologia")?.addEventListener("click", () => {
    upReporteModo = "patologia"; upReporteDrill = null;
    document.getElementById("up-reporte-tab-patologia")?.classList.add("active");
    document.getElementById("up-reporte-tab-os")?.classList.remove("active");
    renderUpReportes();
  });
  document.getElementById("up-reporte-volver")?.addEventListener("click", () => { upReporteDrill = null; renderUpReportes(); });
  document.getElementById("up-reporte-exportar-excel")?.addEventListener("click", exportarUpReporteExcel);
  document.getElementById("up-reporte-exportar-pdf")?.addEventListener("click", exportarUpReportePdf);
  document.getElementById("criticidad-generar")?.addEventListener("click", handleGenerarCriticidad);
  document.getElementById("criticidad-exportar-t1")?.addEventListener("click", () => exportarCriticidadTrimestre(0));
  document.getElementById("criticidad-exportar-t2")?.addEventListener("click", () => exportarCriticidadTrimestre(1));
  document.getElementById("criticidad-exportar-t3")?.addEventListener("click", () => exportarCriticidadTrimestre(2));
  document.getElementById("criticidad-exportar-t4")?.addEventListener("click", () => exportarCriticidadTrimestre(3));
  document.getElementById("metas-generar")?.addEventListener("click", handleGenerarMetasFisicas);
  document.getElementById("metas-exportar")?.addEventListener("click", exportarMetasFisicasExcel);

  document.getElementById("btn-nueva-pma")?.addEventListener("click", () => requiereAutenticacion(abrirModalPmaNueva));
  document.getElementById("pma-form")?.addEventListener("submit", handlePmaSubmit);
  document.getElementById("pma-search")?.addEventListener("input", () => { pmaPage = 1; renderPma(); });
  document.getElementById("pma-ingreso-search")?.addEventListener("input", () => { pmaPage = 1; renderPma(); });
  document.getElementById("pma-limite-search")?.addEventListener("input", () => { pmaPage = 1; renderPma(); });
  document.getElementById("pma-analista-filter")?.addEventListener("change", renderPma);
  document.getElementById("pma-condicion-filter")?.addEventListener("change", () => { pmaPage = 1; renderPma(); });
  document.getElementById("pma-os-search")?.addEventListener("input", recalcularDatosPma);
  document.getElementById("pma-os-search")?.addEventListener("change", recalcularDatosPma);
  document.getElementById("pma-ejercicio")?.addEventListener("input", recalcularDatosPma);
  document.getElementById("pma-ejercicio")?.addEventListener("change", recalcularDatosPma);
  document.getElementById("pma-fecha-ingreso")?.addEventListener("change", actualizarAlertaPma);

  document.getElementById("btn-nueva-cartilla")?.addEventListener("click", () => requiereAutenticacion(abrirModalCartillaNueva));
  document.getElementById("cartilla-form")?.addEventListener("submit", handleCartillaSubmit);
  document.getElementById("cartilla-search")?.addEventListener("input", () => { cartillaPage = 1; renderCartillas(); });
  document.getElementById("cartilla-ingreso-search")?.addEventListener("input", () => { cartillaPage = 1; renderCartillas(); });
  document.getElementById("cartilla-limite-search")?.addEventListener("input", () => { cartillaPage = 1; renderCartillas(); });
  document.getElementById("cartilla-plazo-filter")?.addEventListener("change", () => { cartillaPage = 1; renderCartillas(); });
  document.getElementById("cartilla-condicion-filter")?.addEventListener("change", () => { cartillaPage = 1; renderCartillas(); });
  document.getElementById("cartilla-notificadas-filter")?.addEventListener("change", async () => {
    await asegurarNotificacionesCargadas();
    cartillaPage = 1;
    renderCartillas();
  });
  document.getElementById("cartilla-notificacion-add")?.addEventListener("click", agregarNotificacionCartilla);
  document.getElementById("pma-notificadas-filter")?.addEventListener("change", async () => {
    await asegurarNotificacionesPmaCargadas();
    pmaPage = 1;
    renderPma();
  });
  document.getElementById("pma-notificacion-add")?.addEventListener("click", agregarNotificacionPma);
  document.getElementById("btn-export-pma")?.addEventListener("click", () => exportarModuloPresentacionesExcel("pma"));
  document.getElementById("btn-export-cartillas")?.addEventListener("click", () => exportarModuloPresentacionesExcel("cartillas"));
  document.getElementById("pma-historico-btn")?.addEventListener("click", cargarHistoricoCompletoPma);
  document.getElementById("cartilla-historico-btn")?.addEventListener("click", cargarHistoricoCompletoCartillas);
  document.getElementById("prestadores-os-search")?.addEventListener("change", () => requiereAutenticacion(handleSeleccionObraSocialPrestadores));
  document.getElementById("cobertura-os-search")?.addEventListener("change", () => requiereAutenticacion(handleSeleccionObraSocialCobertura));
  document.getElementById("btn-configurar-basicas")?.addEventListener("click", () => requiereAutenticacion(abrirModalBasicas));
  document.getElementById("afiliados-os-search")?.addEventListener("change", () => requiereAutenticacion(handleSeleccionObraSocialAfiliados));
  document.getElementById("afiliados-total-guardar")?.addEventListener("click", guardarTotalAfiliados);
  document.getElementById("afiliados-agregar")?.addEventListener("click", agregarAfiliadoLocalidad);
  document.getElementById("afiliados-buscar")?.addEventListener("input", renderAfiliadosTabla);
  document.getElementById("afiliados-provincia")?.addEventListener("change", event => {
    poblarSelectPartidoAfiliados(event.target.value);
    poblarSelectLocalidadAfiliados("", "");
  });
  document.getElementById("afiliados-partido")?.addEventListener("change", event => {
    const provincia = document.getElementById("afiliados-provincia")?.value || "";
    poblarSelectLocalidadAfiliados(provincia, event.target.value);
  });
  document.getElementById("prestadores-search")?.addEventListener("input", () => { prestadoresPage = 1; renderPrestadores(); });
  document.getElementById("prestadores-estado-filter")?.addEventListener("change", () => { prestadoresPage = 1; renderPrestadores(); });
  document.getElementById("prestadores-contrato-filter")?.addEventListener("change", () => { prestadoresPage = 1; renderPrestadores(); });
  document.getElementById("btn-nuevo-prestador")?.addEventListener("click", () => requiereAutenticacion(abrirModalPrestadorNuevo));
  document.getElementById("prestadores-periodo-os")?.addEventListener("change", () => requiereAutenticacion(handleCambioPeriodoPrestadoresOs));
  document.getElementById("btn-export-prestadores")?.addEventListener("click", exportarPrestadoresExcel);
  document.getElementById("btn-importar-cartilla")?.addEventListener("click", () => document.getElementById("importar-cartilla-file")?.click());
  document.getElementById("importar-cartilla-file")?.addEventListener("change", event => manejarArchivoImportarCartilla(event.target.files[0]));
  document.getElementById("importar-cartilla-confirmar")?.addEventListener("click", confirmarImportarCartilla);
  document.getElementById("prestador-form")?.addEventListener("submit", handlePrestadorSubmit);
  document.getElementById("prestador-eliminar")?.addEventListener("click", eliminarPrestadorActual);
  document.getElementById("prestador-contrato-presentado")?.addEventListener("change", actualizarVisibilidadCampoContratoEx);
  document.getElementById("prestador-refes-search")?.addEventListener("input", event => {
    const texto = event.target.value.trim();
    clearTimeout(refesBuscarTimeout);
    if (texto.length < 3) { document.getElementById("prestador-refes-resultados").hidden = true; return; }
    refesBuscarTimeout = setTimeout(async () => {
      const resultados = await buscarEnRefes(texto);
      renderResultadosRefes(resultados);
    }, 300);
  });
  document.addEventListener("click", event => {
    const cont = document.getElementById("prestador-refes-resultados");
    const buscador = document.getElementById("prestador-refes-search");
    if (cont && !cont.hidden && event.target !== buscador && !cont.contains(event.target)) cont.hidden = true;
  });
  document.getElementById("prestador-provincia")?.addEventListener("change", event => {
    poblarSelectPartidoPrestador(event.target.value);
    poblarSelectLocalidadPrestador("", "");
  });
  document.getElementById("prestador-partido")?.addEventListener("change", event => {
    const provincia = document.getElementById("prestador-provincia")?.value || "";
    poblarSelectLocalidadPrestador(provincia, event.target.value);
  });
  document.getElementById("cartilla-os-search")?.addEventListener("input", recalcularDatosCartilla);
  document.getElementById("cartilla-os-search")?.addEventListener("change", recalcularDatosCartilla);
  document.getElementById("cartilla-ejercicio")?.addEventListener("input", recalcularDatosCartilla);
  document.getElementById("cartilla-ejercicio")?.addEventListener("change", recalcularDatosCartilla);
  document.getElementById("cartilla-fecha-ingreso")?.addEventListener("change", actualizarAlertaCartilla);

  document.getElementById("report-cartillas-search")?.addEventListener("input", () => { reportCartillasPage = 1; esReporteNunca(reporteActivo) ? renderReporteNuncaPresentaron("cartillas") : renderReporteFaltantesCartillas(); });
  document.getElementById("report-solo-faltantes")?.addEventListener("change", () => { reportCartillasPage = 1; renderReporteFaltantesCartillas(); });
  document.getElementById("report-period-all")?.addEventListener("click", () => seleccionarTodosPeriodosReporte(true));
  document.getElementById("report-period-clear")?.addEventListener("click", () => seleccionarTodosPeriodosReporte(false));
  document.getElementById("report-pma-search")?.addEventListener("input", () => { reportPmaPage = 1; esReporteNunca(reporteActivo) ? renderReporteNuncaPresentaron("pma") : renderReporteFaltantesPma(); });
  document.getElementById("report-pma-solo-faltantes")?.addEventListener("change", () => { reportPmaPage = 1; renderReporteFaltantesPma(); });
  document.getElementById("report-pma-period-all")?.addEventListener("click", () => seleccionarTodosPeriodosPma(true));
  document.getElementById("report-pma-period-clear")?.addEventListener("click", () => seleccionarTodosPeriodosPma(false));
  document.getElementById("report-type-select")?.addEventListener("change", actualizarSelectorReporte);
  document.getElementById("btn-export-report")?.addEventListener("click", exportarReporteActivo);
  document.getElementById("btn-report-cartillas-chart")?.addEventListener("click", () => mostrarGraficoReporte("cartillas", true));
  document.getElementById("btn-hide-cartillas-chart")?.addEventListener("click", () => mostrarGraficoReporte("cartillas", false));
  document.getElementById("btn-report-pma-chart")?.addEventListener("click", () => mostrarGraficoReporte("pma", true));
  document.getElementById("btn-hide-pma-chart")?.addEventListener("click", () => mostrarGraficoReporte("pma", false));

  document.getElementById("login-form")?.addEventListener("submit", handleLoginSubmit);
  document.getElementById("btn-logout")?.addEventListener("click", handleLogout);
  document.getElementById("btn-forgot-password")?.addEventListener("click", () => {
    const email = document.getElementById("auth-user")?.value.trim() || "";
    document.getElementById("forgot-email").value = email;
    abrirModal("forgot-modal");
  });
  document.getElementById("forgot-form")?.addEventListener("submit", handleForgotSubmit);
  document.getElementById("password-form")?.addEventListener("submit", handlePasswordSubmit);

  ["os-inicio-ejercicio"].forEach(id => {
    document.getElementById(id)?.addEventListener("blur", event => {
      const normalizado = normalizarDiaMes(event.target.value);
      if (normalizado) event.target.value = normalizado;
    });
  });

  document.querySelectorAll(".modal-backdrop").forEach(modal => {
    modal.addEventListener("click", event => { if (event.target === modal) cerrarModal(modal.id); });
  });

  document.addEventListener("click", event => {
    document.querySelectorAll(".period-select[open]").forEach(selector => {
      if (debeCerrarSelectorPeriodoPorClick(selector, event.target)) selector.open = false;
    });
    document.querySelectorAll(".section-help[open]").forEach(help => {
      if (!help.contains(event.target)) help.open = false;
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    document.querySelectorAll(".period-select[open]").forEach(selector => { selector.open = false; });
    const abierto = [...document.querySelectorAll(".modal-backdrop")].reverse().find(m => !m.hidden);
    if (abierto) cerrarModal(abierto.id);
  });

  window.addEventListener("popstate", () => showView(getInitialView(location.hash), false));

  await restaurarSesion();
  if (authSession?.access_token) {
    const vistaInicial = recoveryDetected ? "obras-sociales" : getInitialView(location.hash);
    showView(vistaInicial, false);
    if (vistaInicial !== "inicio") await cargarYRenderizarObrasSociales();
  } else {
    abrirLogin();
  }

  if (recoveryDetected) abrirCambioPassword(true);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initBrowser);
  else initBrowser();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    paginarRegistros,
    resumirInicioPorParEjercicios,
    simboloCumplimientoPresentacion,
    generarReporteFaltantesPorEjercicio,
    getInitialView,
    normalizarDiaMes,
    separarLocalidadDomicilio,
    filtrarObrasSociales,
    ordenarObrasSocialesPorRnos,
    buildObrasSocialesUrl,
    buildWriteUrl,
    fetchConTimeout,
    cargarObrasSocialesDesdeSupabase,
    authSignIn,
    authRecover,
    authUpdatePassword,
    guardarObraSocialEnSupabase,
    derivarEjercicio,
    ejercicioCanonico,
    ejercicioVisible,
    anioInicioDesdeEjercicio,
    opcionesEjercicioParaInicio,
    fechaInicioEjercicioDesdeDiaMes,
    finPeriodoDesdeInicio,
    diaMesDesdeFechaIso,
    filtrarPmaRegistros,
    filtrarCartillasRegistros,
    ordenarReportePorRnas,
    construirHistorialPresentaciones,
    identificarNuncaPresentaron,
    construirEvolucionPresentaciones,
    textoContextoPeriodos,
    construirMatrizExcelDetallePresentaciones,
    calcularCumplimiento90,
    ejercicioEsperadoPeriodoControl,
    generarReporteFaltantesPresentaciones,
    generarReporteFaltantesCartillas,
    simboloEstadoReporte,
    resumirPresentacionesPorPeriodo,
    resumirCartillasPorPeriodo,
    obtenerResumenPeriodoGrafico,
    construirMatrizExcelPresentaciones,
    construirMatrizExcelCartillas,
    periodosControlDisponibles,
    resumenPeriodosSeleccionados,
    buildCartillasUrl,
    cargarCartillasDesdeSupabase,
    buildPmaUrl,
    cargarPmaDesdeSupabase,
    debeCerrarSelectorPeriodoPorClick,
    parseRecoveryHash,
    normalizarSesion,
    normalizarPerfilAcceso,
    perfilPuedeVerVista,
    primeraVistaPermitida
  };
}
