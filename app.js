const SUPABASE_URL = "https://kvevhmqxfjorwgydgaqd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_PmqcH16HogW-iFZMqmX3cQ_PbKyQxKc";
const SESSION_KEY = "gcp-auth-session-v1";

const views = {
  inicio: { title: "", subtitle: "" },
  "obras-sociales": { title: "Agentes de Seguro", subtitle: "Maestro único de RNAS y denominaciones" },
  pma: { title: "PMA", subtitle: "Seguimiento de presentaciones" },
  cartillas: { title: "Cartillas", subtitle: "Presentaciones y cumplimiento del plazo de 90 días" },
  reportes: { title: "Reportes", subtitle: "Consultas e indicadores de gestión" },
  "up-patologias": { title: "Patologías", subtitle: "Catálogo de patologías para Urgencias Prestacionales" },
  "up-drogas": { title: "Catálogo de drogas", subtitle: "Drogas, marcas comerciales y fundamentación por patología" },
  "up-plantillas": { title: "Plantillas de informe", subtitle: "Textos de apertura y cierre técnico" },
  "up-expedientes": { title: "Expedientes", subtitle: "Urgencias Prestacionales" }
};

const manualesSeccion = {
  "obras-sociales": `<strong>Qué hacer en Agentes de Seguro</strong><ul><li>Buscá por RNAS, denominación o sigla.</li><li>Usá los filtros de estado e Inicio ejercicio.</li><li>Hacé clic en una fila para consultar o modificar los datos del agente.</li><li>El Inicio ejercicio se utiliza para determinar los períodos de control de las presentaciones.</li></ul>`,
  pma: `<strong>Qué hacer en PMA</strong><ul><li>Usá el buscador o seleccioná uno o varios ejercicios.</li><li>Podés filtrar además por Condición, Fecha de ingreso y Fecha límite.</li><li>Hacé clic en una presentación para verla o editarla.</li><li>“Nueva presentación” registra un nuevo trámite. “Exportar Excel” descarga todos los campos de los registros filtrados.</li></ul>`,
  cartillas: `<strong>Qué hacer en Cartillas</strong><ul><li>Usá el buscador o seleccioná uno o varios ejercicios.</li><li>El filtro Plazo permite ver presentaciones en término o fuera de término y también podés buscar por Fecha de ingreso y Fecha límite.</li><li>El plazo se calcula tomando como límite 90 días antes del Inicio ejercicio.</li><li>Hacé clic en una presentación para verla o editarla. El Excel incluye todos los campos.</li></ul>`,
  reportes: `<strong>Qué hacer en Reportes</strong><ul><li>Elegí el reporte de Cartillas o PMA. También podés identificar los Agentes que nunca presentaron.</li><li>Seleccioná uno o varios ejercicios, por ejemplo 2026 y 2025/26.</li><li>✓ indica que presentó y ✕ que no presentó en ese ejercicio.</li><li>Hacé clic sobre un Agente de Seguro para abrir su historial completo en los reportes de Presentaciones. En “Nunca presentaron” no hay historial porque no existen presentaciones cargadas. Podés ordenar por RNAS y exportar a Excel.</li></ul>`,
  "up-patologias": `<strong>Qué hacer en Patologías</strong><ul><li>Buscá por nombre.</li><li>Hacé clic en una fila para editarla o eliminarla.</li></ul>`,
  "up-drogas": `<strong>Qué hacer en Catálogo de drogas</strong><ul><li>Cada droga puede tener varias marcas comerciales y, si no es de soporte, una fundamentación distinta por cada patología a la que se asocia.</li><li>Las drogas de soporte (por ejemplo antieméticos) usan una única fundamentación general, sin asociar a patologías puntuales.</li><li>Hacé clic en una fila para editarla o eliminarla.</li></ul>`,
  "up-plantillas": `<strong>Qué hacer en Plantillas</strong><ul><li>El texto de apertura y el de cierre técnico se usan al generar los informes IFSOL/IFDER de un expediente.</li><li>Hacé clic en una fila para editarla o eliminarla.</li></ul>`,
  "up-expedientes": `<strong>Qué hacer en Expedientes</strong><ul><li>Buscá por Nº EE, paciente o DNI.</li><li>El formulario tiene varias secciones plegables; hacé clic en el título de cada una para abrirla.</li><li>Escribí en el campo de Obra Social/EMP para buscarla y elegí una opción de la lista que aparece.</li><li>Hacé clic en una fila para editar ese expediente.</li></ul>`
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
let reporteCartillasCargado = false;
let reporteActivo = "cartillas";
let pma = [];
let pmaCargadas = false;
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
let expedientes = [];
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
    if (!pmaCargadas) tareas.push(cargarPmaDesdeSupabase().then(rows => { pma = rows; pmaCargadas = true; llenarFiltrosPma(); }));
    if (!cartillasCargadas) tareas.push(cargarCartillasDesdeSupabase().then(rows => { cartillas = rows; cartillasCargadas = true; llenarFiltroEjercicios(); }));
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

  // Urgencias Prestacionales: exclusivo del perfil "Administrador", ni siquiera "Admin Prestacional" entra.
  if (id.startsWith("up-")) return ["administrador", "admin"].includes(p);

  if (["admin prestacional", "administrador", "admin"].includes(p)) return true;
  if (p === "admin presentaciones") return ["obras-sociales", "pma", "cartillas", "reportes"].includes(id);
  if (p === "carga presentaciones") return ["pma", "cartillas", "reportes"].includes(id);
  return false;
}

function primeraVistaPermitida(perfil) {
  const p = normalizarPerfilAcceso(perfil);
  if (p === "admin presentaciones") return "obras-sociales";
  if (p === "carga presentaciones") return "pma";
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

function vistaPermitidaParaSesion(vista) {
  return perfilPuedeVerVista(perfilSesionActual(), vista);
}

function aplicarPermisosNavegacion() {
  if (typeof document === "undefined") return;
  const p = normalizarPerfilAcceso(perfilSesionActual());
  const esAdminPrestacional = ["admin prestacional", "administrador", "admin"].includes(p);
  const esAdminPresentaciones = p === "admin presentaciones";
  const esCargaPresentaciones = p === "carga presentaciones";
  const esAdministrador = ["administrador", "admin"].includes(p);

  document.querySelector('[data-nav-access="inicio"]')?.toggleAttribute("hidden", !esAdminPrestacional);
  document.querySelector('[data-nav-access="obras-sociales"]')?.toggleAttribute("hidden", !(esAdminPrestacional || esAdminPresentaciones));
  document.querySelector('[data-nav-access="presentaciones"]')?.toggleAttribute("hidden", !(esAdminPrestacional || esAdminPresentaciones || esCargaPresentaciones));
  document.querySelector('[data-nav-access="reportes"]')?.toggleAttribute("hidden", !(esAdminPrestacional || esAdminPresentaciones || esCargaPresentaciones));
  document.querySelector('[data-nav-access="urgencias-prestacionales"]')?.toggleAttribute("hidden", !esAdministrador);
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
    await eliminarPatologiaEnSupabase(id, session.access_token);
    cerrarModal("patologia-modal");
    mostrarToast("Patología eliminada.");
    patologiasCargadas = false;
    await cargarYRenderizarPatologias();
  } catch (error) {
    setFormMessage("patologia-form-message", error.message || "No se pudo eliminar la patología. Puede estar en uso por una droga.");
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
  const response = await fetchConTimeout(buildObrasSocialesTodasUrl(), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 15000);
  if (!response.ok) { console.error("Error cargando Obras Sociales/EMP:", await leerErrorApi(response)); return; }
  const rows = await response.json();
  obrasSocialesTodas = Array.isArray(rows) ? rows : [];
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
  const termino = normalizar(busqueda || "");
  if (!termino) return lista;
  return lista.filter(e =>
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
  document.getElementById("expediente-pasos").value = e.pasos_resolucion || "";

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
    pasos_resolucion: document.getElementById("expediente-pasos")?.value || null
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

function textoPlanoDesdeHtml(html) {
  if (!html) return "";
  return html.replace(/<\/(p|div|li)>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n\n").trim();
}

function fundamentacionParaExpediente(drogaId, patologiaId) {
  const droga = drogas.find(d => String(d.id) === String(drogaId));
  if (!droga) return "";
  if (droga.es_soporte) return droga.fundamentacion_general || "";
  const fp = (droga.droga_patologia || []).find(item => String(item.patologia_id) === String(patologiaId));
  return fp?.fundamentacion_texto || "";
}

async function generarInformeDocx(expediente, tipo) {
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = window.docx;
  const plantilla = plantillas.find(p => String(p.id) === String(expediente.plantilla_id));
  const patologiaNombre = expediente.patologias?.nombre || patologias.find(p => String(p.id) === String(expediente.patologia_id))?.nombre || "—";
  const osEtiqueta = etiquetaObraSocial(expediente.obra_social_id) || "—";
  const medicamentos = expediente.expediente_medicamentos || [];
  const P = 24; // 12pt

  const parrafos = [];
  parrafos.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `INFORME TÉCNICO — ${tipo}`, bold: true, size: 28 })] }));
  parrafos.push(new Paragraph({ children: [new TextRun({ text: `Expediente Nº ${expediente.numero_ee}`, bold: true, size: P })] }));
  parrafos.push(new Paragraph({ text: "" }));
  parrafos.push(new Paragraph({ children: [new TextRun({ text: "Paciente: ", bold: true, size: P }), new TextRun({ text: expediente.nombre_paciente || "", size: P })] }));
  if (expediente.dni_cuit_paciente) parrafos.push(new Paragraph({ children: [new TextRun({ text: "DNI / CUIT: ", bold: true, size: P }), new TextRun({ text: expediente.dni_cuit_paciente, size: P })] }));
  parrafos.push(new Paragraph({ children: [new TextRun({ text: "Obra Social / EMP: ", bold: true, size: P }), new TextRun({ text: osEtiqueta, size: P })] }));
  parrafos.push(new Paragraph({ children: [new TextRun({ text: "Patología: ", bold: true, size: P }), new TextRun({ text: patologiaNombre, size: P })] }));
  parrafos.push(new Paragraph({ children: [new TextRun({ text: "Diagnóstico: ", bold: true, size: P }), new TextRun({ text: expediente.diagnostico_detalle || "", size: P })] }));
  parrafos.push(new Paragraph({ text: "" }));

  if (plantilla?.texto_apertura) {
    textoPlanoDesdeHtml(plantilla.texto_apertura).split("\n").forEach(linea => {
      if (linea.trim()) parrafos.push(new Paragraph({ children: [new TextRun({ text: linea, size: P })] }));
    });
    parrafos.push(new Paragraph({ text: "" }));
  }

  parrafos.push(new Paragraph({ children: [new TextRun({ text: "Medicación solicitada:", bold: true, size: P })] }));
  medicamentos.forEach((m, i) => {
    const droga = drogas.find(d => String(d.id) === String(m.droga_id));
    const marca = (droga?.marcas_comerciales || []).find(mc => String(mc.id) === String(m.marca_id));
    const encabezado = medicamentos.length > 1 ? `${i + 1}) ${droga?.nombre || ""}` : (droga?.nombre || "");
    parrafos.push(new Paragraph({ children: [new TextRun({ text: encabezado, bold: true, size: P })] }));
    if (marca) {
      parrafos.push(new Paragraph({ children: [new TextRun({ text: `Marca comercial: ${marca.nombre_comercial}`, size: P })] }));
      if (marca.numero_anmat) parrafos.push(new Paragraph({ children: [new TextRun({ text: `Certificado ANMAT Nº ${marca.numero_anmat}`, size: P })] }));
    }
    if (m.dosis) parrafos.push(new Paragraph({ children: [new TextRun({ text: `Dosis: ${m.dosis}`, size: P })] }));
    const fundamentacion = textoPlanoDesdeHtml(fundamentacionParaExpediente(m.droga_id, expediente.patologia_id));
    if (fundamentacion) fundamentacion.split("\n").forEach(linea => { if (linea.trim()) parrafos.push(new Paragraph({ children: [new TextRun({ text: linea, size: P })] })); });
    parrafos.push(new Paragraph({ text: "" }));
  });

  if (plantilla?.texto_cierre_tecnico) {
    textoPlanoDesdeHtml(plantilla.texto_cierre_tecnico).split("\n").forEach(linea => {
      if (linea.trim()) parrafos.push(new Paragraph({ children: [new TextRun({ text: linea, size: P })] }));
    });
    parrafos.push(new Paragraph({ text: "" }));
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
    ? lista.map(i => `
      <div class="subform-item">
        <div class="subform-item-text"><strong>${escaparHtml(i.tipo)}</strong> — ${formatearFecha(i.fecha_generacion)}</div>
        <a href="${escaparHtml(i.archivo_url)}" target="_blank" rel="noopener" class="secondary" style="text-decoration:none;padding:4px 10px;border-radius:8px;font-size:12px;white-space:nowrap">Descargar</a>
      </div>`).join("")
    : `<p style="color:var(--muted);font-size:13px;margin:0">Todavía no se generó ningún informe para este expediente.</p>`;
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

function textoMailObraSocial(expediente, tratamiento) {
  const osEtiqueta = etiquetaObraSocial(expediente.obra_social_id) || "la Obra Social/EMP";
  const medicamentos = expediente.expediente_medicamentos || [];
  const listaDrogas = medicamentos.map(m => {
    const droga = drogas.find(d => String(d.id) === String(m.droga_id));
    return `- ${droga?.nombre || ""}${m.dosis ? ` (Dosis: ${m.dosis})` : ""}`;
  }).join("\n") || "- (sin drogas cargadas)";

  return `Estimados de ${osEtiqueta},

Por medio de la presente, en el marco del expediente Nº ${expediente.numero_ee}, correspondiente al afiliado ${expediente.nombre_paciente}${expediente.dni_cuit_paciente ? ` (CUIL Nº ${expediente.dni_cuit_paciente})` : ""}, se solicita la cobertura del tratamiento${tratamiento ? ` ${tratamiento}` : ""} con la siguiente medicación:

${listaDrogas}

DIAGNÓSTICO: ${expediente.diagnostico_detalle || "—"}

Se recuerda que, conforme la normativa vigente, el Agente del Seguro de Salud cuenta con un plazo de 2 (dos) días hábiles para efectuar el traslado correspondiente.

Quedamos a la espera de su respuesta a la brevedad.

Saludos cordiales.`;
}

function textoMailAfiliado(expediente) {
  const medicamentos = expediente.expediente_medicamentos || [];
  const listaDrogas = medicamentos.map(m => {
    const droga = drogas.find(d => String(d.id) === String(m.droga_id));
    return `- ${droga?.nombre || ""}${m.dosis ? ` (Dosis: ${m.dosis})` : ""}`;
  }).join("\n") || "- (sin drogas cargadas)";

  return `Estimado/a ${expediente.nombre_paciente || ""},

Para dar continuidad al trámite del expediente Nº ${expediente.numero_ee}, referido a la medicación:

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
    document.getElementById("mail-texto").value = tipo === "os"
      ? textoMailObraSocial(expediente, tratamientoInput.value.trim())
      : textoMailAfiliado(expediente);
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
      (["pma", "cartillas"].includes(resolved) && group.dataset.navGroup === "presentaciones") ||
      (resolved.startsWith("up-") && group.dataset.navGroup === "urgencias-prestacionales");
    group.classList.toggle("collapsed", !esGrupoDeLaVistaActual);
    group.querySelector(".nav-group-toggle")?.setAttribute("aria-expanded", String(esGrupoDeLaVistaActual));
  });
  if (["pma", "cartillas"].includes(resolved)) {
    document.querySelector('[data-nav-group="presentaciones"]')?.classList.add("active");
  }
  if (resolved.startsWith("up-")) {
    document.querySelector('[data-nav-group="urgencias-prestacionales"]')?.classList.add("active");
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
    const helpContent = document.getElementById("section-help-content");
    const help = document.getElementById("section-help");
    if (helpContent) helpContent.innerHTML = manualesSeccion[resolved] || "";
    if (help) help.hidden = !manualesSeccion[resolved];
  }

  if (updateHistory && typeof history !== "undefined") history.pushState(null, "", `#${resolved}`);
  if (resolved === "pma" && !pmaCargadas) cargarYRenderizarPma();
  if (resolved === "cartillas" && !cartillasCargadas) cargarYRenderizarCartillas();
  if (resolved === "reportes") cargarReporteActivo();
  if (resolved === "up-patologias" && !patologiasCargadas) cargarYRenderizarPatologias();
  if (resolved === "up-drogas" && !drogasCargadas) cargarYRenderizarDrogas();
  if (resolved === "up-plantillas" && !plantillasCargadas) cargarYRenderizarPlantillas();
  if (resolved === "up-expedientes" && !expedientesCargadas) cargarYRenderizarExpedientes();
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
    if (nombre) nombre.textContent = identidad.nombre;
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

function buildCartillasUrl(offset = 0, limit = 1000) {
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
  return `${SUPABASE_URL}/rest/v1/cartillas?${params.toString()}`;
}

async function cargarCartillasDesdeSupabase(fetchImpl = fetch) {
  const pageSize = 1000;
  const all = [];
  for (let offset = 0; ; offset += pageSize) {
    const response = await fetchConTimeout(buildCartillasUrl(offset, pageSize), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 10000, fetchImpl);
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

function buildPmaUrl(offset = 0, limit = 1000) {
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
  return `${SUPABASE_URL}/rest/v1/pma?${params.toString()}`;
}

async function cargarPmaDesdeSupabase(fetchImpl = fetch) {
  const pageSize = 1000;
  const all = [];
  for (let offset = 0; ; offset += pageSize) {
    const response = await fetchConTimeout(buildPmaUrl(offset, pageSize), { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" }, 10000, fetchImpl);
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
  const fechaIngreso = filtros.fechaIngreso || "";
  const fechaLimite = filtros.fechaLimite || "";
  return (lista || []).filter(c => {
    const os = c.obras_sociales || {};
    if (ejercicios.size && !ejercicios.has(String(c.ejercicio || ""))) return false;
    const cumplimiento = calcularCumplimiento90(c?.fecha_inicio_ejercicio || "", c?.fecha_ingreso || "");
    if (plazo !== "TODOS" && cumplimiento !== plazo) return false;
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
  return filtrarPmaRegistros(pma,{
    busqueda:document.getElementById("pma-search")?.value||"",
    ejercicios:ejerciciosFiltroSeleccionados("pma"),
    condicion:document.getElementById("pma-condicion-filter")?.value||"TODOS",
    fechaIngreso:document.getElementById("pma-ingreso-search")?.value||"",
    fechaLimite:document.getElementById("pma-limite-search")?.value||""
  });
}
function cumplimientoPmaRegistro(row) {
  return calcularCumplimiento90(row?.fecha_inicio_ejercicio || "", row?.fecha_ingreso || "");
}

function renderPma() {
  if (typeof document === "undefined") return;
  const tbody = document.getElementById("pma-table-body"); if (!tbody) return;
  const head = document.getElementById("pma-table-head");
  const rows = ordenarPresentacionesPorCampo(obtenerPmaFiltradas(), pmaSortField, pmaSortDirection);
  if (head) {
    head.innerHTML = `<th><button class="sort-button" id="pma-sort-rnas" type="button" title="Ordenar por RNAS">RNAS <span aria-hidden="true">${iconoOrdenTabla(pmaSortField, "rnas", pmaSortDirection)}</span></button></th><th>Denominación</th><th><button class="sort-button" id="pma-sort-ejercicio" type="button" title="Ordenar por ejercicio">Ejercicio <span aria-hidden="true">${iconoOrdenTabla(pmaSortField, "ejercicio", pmaSortDirection)}</span></button></th><th><button class="sort-button" id="pma-sort-ingreso" type="button" title="Ordenar por fecha de ingreso">Ingreso <span aria-hidden="true">${iconoOrdenTabla(pmaSortField, "ingreso", pmaSortDirection)}</span></button></th><th><button class="sort-button" id="pma-sort-fecha-limite" type="button" title="Ordenar por fecha límite">Fecha límite <span aria-hidden="true">${iconoOrdenTabla(pmaSortField, "fecha_limite", pmaSortDirection)}</span></button></th><th>Plazo</th><th>Condición</th><th>Nº EE</th><th>Nº DISPO</th>`;
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
    return `<tr class="pma-row" data-pma-id="${r.id}" tabindex="0" role="button" title="Clic para ver o editar la presentación">
      <td><strong>${escaparHtml(r.obras_sociales?.rnos||"—")}</strong></td>
      <td class="denominacion-cell">${escaparHtml(r.obras_sociales?.denominacion||"—")}</td>
      <td>${escaparHtml(r.ejercicio||"—")}</td>
      <td class="date-cell">${formatFechaPantalla(r.fecha_ingreso)}</td>
      <td class="date-cell">${formatFechaPantalla(plazo.fechaLimite)}</td>
      <td class="deadline-cell"><span class="deadline-icon ${clase}" title="${titulo}" aria-label="${titulo}">${simbolo}</span></td>
      <td>${escaparHtml(r.condicion||"—")}</td>
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
  try{pma=await cargarPmaDesdeSupabase();pmaCargadas=true;llenarFiltrosPma();renderPma();}
  catch(error){pma=[];pmaCargadas=false;renderPma();if(count)count.textContent="0 presentaciones";if(status)status.textContent="Error de conexión con Supabase";
    const empty=document.getElementById("pma-empty");if(empty){empty.hidden=false;empty.textContent=error?.message||"No se pudieron cargar las presentaciones de PMA.";}}
}

function cumplimientoCartillaRegistro(row) {
  return calcularCumplimiento90(row?.fecha_inicio_ejercicio || "", row?.fecha_ingreso || "");
}

function llenarFiltroEjercicios() {
  if (typeof document === "undefined") return;
  poblarSelectorMultipleEjercicios("cartilla", cartillas.map(c => c.ejercicio).filter(Boolean), () => { cartillaPage = 1; renderCartillas(); });
}

function filtrarCartillas() {
  if (typeof document === "undefined") return cartillas;
  return filtrarCartillasRegistros(cartillas, {
    busqueda: document.getElementById("cartilla-search")?.value || "",
    ejercicios: ejerciciosFiltroSeleccionados("cartilla"),
    plazo: document.getElementById("cartilla-plazo-filter")?.value || "TODOS",
    fechaIngreso: document.getElementById("cartilla-ingreso-search")?.value || "",
    fechaLimite: document.getElementById("cartilla-limite-search")?.value || ""
  });
}

function renderCartillas() {
  if (typeof document === "undefined") return;
  const tbody = document.getElementById("cartilla-table-body");
  if (!tbody) return;
  const head = document.getElementById("cartilla-table-head");
  const filtradas = ordenarPresentacionesPorCampo(filtrarCartillas(), cartillaSortField, cartillaSortDirection);
  if (head) {
    head.innerHTML = `<th><button class="sort-button" id="cartilla-sort-rnas" type="button" title="Ordenar por RNAS">RNAS <span aria-hidden="true">${iconoOrdenTabla(cartillaSortField, "rnas", cartillaSortDirection)}</span></button></th><th>Denominación</th><th><button class="sort-button" id="cartilla-sort-ejercicio" type="button" title="Ordenar por ejercicio">Ejercicio <span aria-hidden="true">${iconoOrdenTabla(cartillaSortField, "ejercicio", cartillaSortDirection)}</span></button></th><th><button class="sort-button" id="cartilla-sort-ingreso" type="button" title="Ordenar por fecha de ingreso">Ingreso <span aria-hidden="true">${iconoOrdenTabla(cartillaSortField, "ingreso", cartillaSortDirection)}</span></button></th><th><button class="sort-button" id="cartilla-sort-fecha-limite" type="button" title="Ordenar por fecha límite">Fecha límite <span aria-hidden="true">${iconoOrdenTabla(cartillaSortField, "fecha_limite", cartillaSortDirection)}</span></button></th><th>Plazo</th><th>Condición</th><th>Nº EE</th><th>Nº DISPO</th>`;
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
    return `<tr class="cartilla-row" data-cartilla-id="${c.id}" tabindex="0" role="button" title="Clic para ver o editar la presentación">
      <td><strong>${escaparHtml(os.rnos || "—")}</strong></td>
      <td class="denominacion-cell">${escaparHtml(os.denominacion || "—")}</td>
      <td>${escaparHtml(c.ejercicio || "—")}</td>
      <td class="date-cell">${formatFechaPantalla(c.fecha_ingreso)}</td>
      <td class="date-cell">${formatFechaPantalla(plazo.fechaLimite)}</td>
      <td class="deadline-cell"><span class="deadline-icon ${clase}" title="${titulo}" aria-label="${titulo}">${simbolo}</span></td>
      <td>${escaparHtml(c.condicion || "—")}</td>
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
    cartillas = await cargarCartillasDesdeSupabase();
    cartillasCargadas = true;
    llenarFiltroEjercicios();
    renderCartillas();

  } catch (error) {
    cartillas = [];
    cartillasCargadas = false;
    renderCartillas();
    if (status) status.textContent = "Error de conexión con Supabase";
    const empty = document.getElementById("cartilla-empty");
    if (empty) { empty.hidden = false; empty.textContent = error?.message || "No se pudieron cargar las presentaciones."; }
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

function renderGraficoCartillas(resumen) {
  const periodos = getPeriodosReporteSeleccionados();
  const elegido = sincronizarPeriodoGrafico("report-cartillas-chart-period", periodos);
  renderGraficoUnPeriodo("report-cartillas-chart", obtenerResumenPeriodoGrafico(resumen, elegido));
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
  if (sector && !sector.hidden) renderGraficoCartillas(resumirCartillasPorPeriodo(reporte, ejercicios));

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

  if (reporteCartillasCargado && obrasSociales.length && cartillasCargadas) {
    if (esReporteNunca(reporteActivo)) renderReporteNuncaPresentaron("cartillas"); else renderReporteFaltantesCartillas();
    return;
  }

  if (status) status.textContent = "Cargando Agentes de Seguro y Cartillas...";
  if (count) count.textContent = "Preparando reporte...";

  try {
    if (!obrasSociales.length) {
      obrasSociales = await cargarObrasSocialesDesdeSupabase();
    }

    if (!cartillasCargadas) {
      cartillas = await cargarCartillasDesdeSupabase();
      cartillasCargadas = true;
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

function renderGraficoPma(resumen) {
  const periodos = getPeriodosPmaSeleccionados();
  const elegido = sincronizarPeriodoGrafico("report-pma-chart-period", periodos);
  renderGraficoUnPeriodo("report-pma-chart", obtenerResumenPeriodoGrafico(resumen, elegido));
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
  if (sector && !sector.hidden) renderGraficoPma(resumirPresentacionesPorPeriodo(reporte, ejercicios));

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

  if (reportePmaCargado && obrasSociales.length && pmaCargadas) {
    if (esReporteNunca(reporteActivo)) renderReporteNuncaPresentaron("pma"); else renderReporteFaltantesPma();
    return;
  }

  if (status) status.textContent = "Cargando Agentes de Seguro y PMA...";
  if (count) count.textContent = "Preparando reporte...";

  try {
    if (!obrasSociales.length) obrasSociales = await cargarObrasSocialesDesdeSupabase();
    if (!pmaCargadas) {
      pma = await cargarPmaDesdeSupabase();
      pmaCargadas = true;
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
  abrirModal("pma-modal");
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

function abrirModalCartillaNueva() {
  limpiarFormularioCartilla();
  poblarObrasSocialesCartilla();
  document.getElementById("cartilla-modal-title").textContent = "Nueva presentación de Cartilla";
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
    await guardarCartillaEnSupabase(registro, id || null, session.access_token);
    cerrarModal("cartilla-modal");
    mostrarToast(id ? "Presentación de Cartilla actualizada." : "Presentación de Cartilla creada.");
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
  document.querySelectorAll("#expediente-form .form-section-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const seccion = btn.closest(".form-section");
      if (!seccion) return;
      const estabaColapsada = seccion.classList.contains("collapsed");
      if (estabaColapsada) {
        // Acordeón: al abrir una sección, se cierran las demás.
        document.querySelectorAll("#expediente-form .form-section").forEach(s => s.classList.add("collapsed"));
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
    const texto = document.getElementById("mail-texto")?.value || "";
    try { await navigator.clipboard.writeText(texto); mostrarToast("Texto copiado al portapapeles."); }
    catch { mostrarToast("No se pudo copiar automáticamente: seleccioná el texto y copiá con Ctrl+C."); }
  });
  document.getElementById("expediente-adjunto-agregar")?.addEventListener("click", handleAgregarAdjunto);

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
  document.getElementById("btn-export-pma")?.addEventListener("click", () => exportarModuloPresentacionesExcel("pma"));
  document.getElementById("btn-export-cartillas")?.addEventListener("click", () => exportarModuloPresentacionesExcel("cartillas"));
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
  document.getElementById("report-cartillas-chart-period")?.addEventListener("change", renderReporteFaltantesCartillas);
  document.getElementById("report-pma-chart-period")?.addEventListener("change", renderReporteFaltantesPma);

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
