const SUPABASE_URL = "https://kvevhmqxfjorwgydgaqd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_PmqcH16HogW-iFZMqmX3cQ_PbKyQxKc";
const SESSION_KEY = "gcp-auth-session-v1";

const views = {
  inicio: { title: "", subtitle: "" },
  "obras-sociales": { title: "Obras Sociales", subtitle: "Maestro único de RNOS y denominaciones" },
  pma: { title: "PMA", subtitle: "Seguimiento de presentaciones" },
  cartillas: { title: "Cartillas", subtitle: "Presentaciones y cumplimiento del plazo de 90 días" },
  reportes: { title: "Reportes", subtitle: "Consultas e indicadores de gestión" }
};

let obrasSociales = [];
let rnosSortDirection = "asc";
let authSession = null;
let accionPendienteTrasLogin = null;
let passwordRecoveryPending = false;
let cartillas = [];
let cartillasCargadas = false;
let reporteCartillasCargado = false;
let reporteActivo = "cartillas";

function getInitialView(hash) {
  const id = String(hash || "").replace(/^#/, "");
  return Object.prototype.hasOwnProperty.call(views, id) ? id : "inicio";
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

function generarReporteFaltantesCartillas(obras, registrosCartillas, periodos) {
  const periodosValidos = [...new Set((periodos || []).map(Number).filter(Number.isInteger))].sort((a, b) => a - b);
  const indexPresentaciones = new Set(
    (registrosCartillas || [])
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
          periodosResultado[periodo] = {
            estado: "SIN_INICIO",
            ejercicioEsperado: ""
          };
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

function simboloEstadoReporte(estado) {
  if (estado === "PRESENTO") return "✓";
  if (estado === "NO_PRESENTO") return "✕";
  return "?";
}

function resumirCartillasPorPeriodo(reporte, periodos) {
  const periodosValidos = [...new Set((periodos || []).map(Number).filter(Number.isInteger))].sort((a, b) => a - b);

  return periodosValidos.map(periodo => {
    let presentaron = 0;
    let noPresentaron = 0;
    let sinInicio = 0;

    for (const row of reporte || []) {
      const estado = row?.periodos?.[periodo]?.estado;
      if (estado === "PRESENTO") presentaron += 1;
      else if (estado === "NO_PRESENTO") noPresentaron += 1;
      else sinInicio += 1;
    }

    return { periodo, presentaron, noPresentaron, sinInicio };
  });
}

function construirMatrizExcelCartillas(filas, periodos, metadata = {}) {
  const periodosValidos = [...new Set((periodos || []).map(Number).filter(Number.isInteger))].sort((a, b) => a - b);
  const matriz = [
    ["Reporte", metadata.reporte || "Cartillas - Presentaciones"],
    ["Períodos de control", periodosValidos.join(", ")],
    ["Generado", metadata.generado || ""],
    ["Leyenda", "✓ Presentó | ✕ No presentó | ? Sin Inicio ejercicio"],
    ["RNOS", "Denominación", "Inicio ejercicio", ...periodosValidos.map(String)]
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
  const limite = inicio ? new Date(inicio.getTime() - 90 * 86400000) : null;

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

function filtrarObrasSociales(lista, busqueda, estado) {
  const termino = normalizar(busqueda);
  return lista.filter(os => {
    const coincideEstado = estado === "TODAS" || os.estado === estado;
    if (!coincideEstado) return false;
    if (!termino) return true;

    return normalizar([
      os.rnos, os.denominacion, os.sigla, os.domicilio, os.localidad,
      os.provincia, os.telefono, os.email, os.web
    ].join(" ")).includes(termino);
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
    throw new Error(detalle || "Usuario o contraseña incorrectos.");
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

  return {
    nombre:
      userMetadata.nombre ||
      userMetadata.full_name ||
      userMetadata.name ||
      "Usuario autorizado",
    perfil:
      appMetadata.perfil ||
      appMetadata.role_name ||
      "Perfil no definido"
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

function showView(id, updateHistory = true) {
  if (typeof document === "undefined") return;
  const resolved = Object.prototype.hasOwnProperty.call(views, id) ? id : "inicio";

  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
  document.getElementById(resolved)?.classList.add("active");
  document.querySelector(`[data-view="${resolved}"]`)?.classList.add("active");

  const meta = views[resolved];
  const topbar = document.getElementById("topbar");
  const copy = document.getElementById("topbar-copy");
  const title = document.getElementById("page-title");
  const subtitle = document.getElementById("page-subtitle");

  if (resolved === "inicio") {
    topbar?.classList.add("is-home");
    if (copy) copy.hidden = true;
  } else {
    topbar?.classList.remove("is-home");
    if (copy) copy.hidden = false;
    if (title) title.textContent = meta.title;
    if (subtitle) subtitle.textContent = meta.subtitle;
  }

  if (updateHistory && typeof history !== "undefined") history.pushState(null, "", `#${resolved}`);
  if (resolved === "cartillas" && !cartillasCargadas) cargarYRenderizarCartillas();
  if (resolved === "reportes") cargarReporteActivo();
}

function renderObrasSociales() {
  if (typeof document === "undefined") return;
  const tbody = document.getElementById("os-table-body");
  if (!tbody) return;

  const busqueda = document.getElementById("os-search")?.value || "";
  const estado = document.getElementById("os-estado-filter")?.value || "TODAS";
  const filtradas = ordenarObrasSocialesPorRnos(
    filtrarObrasSociales(obrasSociales, busqueda, estado),
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
  if (count) count.textContent = `${filtradas.length} ${filtradas.length === 1 ? "Obra Social" : "Obras Sociales"}`;

  const empty = document.getElementById("os-empty");
  if (empty) {
    empty.hidden = filtradas.length !== 0;
    if (!filtradas.length) empty.textContent = "No se encontraron Obras Sociales con ese criterio.";
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
  if (count) count.textContent = "Cargando Obras Sociales...";
  setEstadoCarga("Conectando con Supabase...");

  try {
    obrasSociales = await cargarObrasSocialesDesdeSupabase();
    renderObrasSociales();
    poblarObrasSocialesCartilla();
    setEstadoCarga("Conectado a Supabase");
  } catch (error) {
    obrasSociales = [];
    renderObrasSociales();
    if (count) count.textContent = "0 Obras Sociales";
    const esTimeout = error?.name === "TimeoutError";
    setEstadoCarga(esTimeout ? "Supabase no respondió en 10 segundos" : "Error de conexión con Supabase");
    const empty = document.getElementById("os-empty");
    if (empty) {
      empty.hidden = false;
      empty.textContent = esTimeout
        ? "Supabase no respondió dentro del tiempo esperado. Actualizá la página o revisá la conexión."
        : `No se pudieron cargar las Obras Sociales.${error?.message ? " " + error.message : ""}`;
    }
    console.error("Error cargando Obras Sociales:", error);
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
  document.getElementById("os-modal-title").textContent = "Nueva Obra Social";
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
  document.getElementById("os-modal-title").textContent = "Editar Obra Social";
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
  abrirModal("login-modal");
  setTimeout(() => document.getElementById("auth-user")?.focus(), 0);
}

function actualizarAuthUI() {
  if (typeof document === "undefined") return;
  const login = document.getElementById("btn-login");
  const sessionBox = document.getElementById("auth-session");
  const nombre = document.getElementById("auth-user-name");
  const perfil = document.getElementById("auth-user-profile");

  const conectado = Boolean(authSession?.access_token);
  if (login) login.hidden = conectado;
  if (sessionBox) sessionBox.hidden = !conectado;

  if (conectado) {
    const identidad = getSessionIdentity(authSession);
    if (nombre) nombre.textContent = identidad.nombre;
    if (perfil) perfil.textContent = identidad.perfil;
  } else {
    if (nombre) nombre.textContent = "";
    if (perfil) perfil.textContent = "";
  }

  renderObrasSociales();
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
    cerrarModal("login-modal");
    document.getElementById("login-form")?.reset();
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
    mostrarToast("Sesión cerrada.", "neutral");
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
    setFormMessage("os-form-message", "RNOS y Denominación son obligatorios.");
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
    mostrarToast(id ? "Obra Social actualizada." : "Obra Social creada.");
    await cargarYRenderizarObrasSociales();
  } catch (error) {
    const mensaje = /duplicate|unique|23505/i.test(error.message || "")
      ? "Ya existe una Obra Social con ese RNOS."
      : error.message || "No se pudo guardar la Obra Social.";
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

function actualizarAlertaCartilla() {
  if (typeof document === "undefined") return calcularCumplimiento90("", "");
  const fechaInicio = document.getElementById("cartilla-fecha-inicio-ejercicio")?.value || "";
  const fechaIngreso = document.getElementById("cartilla-fecha-ingreso")?.value || "";
  const resultado = calcularCumplimiento90(fechaInicio, fechaIngreso);
  const card = document.getElementById("cartilla-deadline-card");
  const limite = document.getElementById("cartilla-fecha-limite");
  const estado = document.getElementById("cartilla-cumplimiento");
  const detalle = document.getElementById("cartilla-cumplimiento-detalle");
  if (limite) limite.textContent = formatFechaPantalla(resultado.fechaLimite);
  if (estado) estado.textContent = resultado.estado === "EN_TERMINO" ? "EN TÉRMINO" : resultado.estado === "FUERA_DE_TERMINO" ? "FUERA DE TÉRMINO" : "SIN DATOS";
  if (detalle) detalle.textContent = textoCumplimiento90(resultado);
  if (card) {
    card.classList.remove("success", "danger", "neutral");
    card.classList.add(resultado.estado === "EN_TERMINO" ? "success" : resultado.estado === "FUERA_DE_TERMINO" ? "danger" : "neutral");
  }
  return resultado;
}

function recalcularDatosCartilla() {
  if (typeof document === "undefined") return;
  const os = resolverObraSocialCartilla(document.getElementById("cartilla-os-search")?.value || "");
  const anio = Number(document.getElementById("cartilla-anio-inicio")?.value || 0);
  const inicio = os?.inicio_ejercicio || "";
  document.getElementById("cartilla-os-id").value = os?.id || "";
  document.getElementById("cartilla-inicio-ejercicio").value = inicio;
  document.getElementById("cartilla-ejercicio").value = derivarEjercicio(inicio, anio);
  document.getElementById("cartilla-fecha-inicio-ejercicio").value = fechaInicioEjercicioDesdeDiaMes(inicio, anio);
  actualizarAlertaCartilla();
}

function buildCartillasUrl(offset = 0, limit = 1000) {
  const fields = [
    "id","obra_social_id","anio_inicio","ejercicio","fecha_inicio_ejercicio","analista","numero_ee","condicion",
    "fecha_ingreso","res_170_2009","numero_disposicion","fecha_disposicion","observaciones","created_at","updated_at",
    "obras_sociales(rnos,denominacion,sigla,inicio_ejercicio)"
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

function cumplimientoCartillaRegistro(row) {
  return calcularCumplimiento90(row?.fecha_inicio_ejercicio || "", row?.fecha_ingreso || "");
}

function llenarFiltroEjercicios() {
  if (typeof document === "undefined") return;
  const select = document.getElementById("cartilla-ejercicio-filter");
  if (!select) return;
  const actual = select.value || "TODOS";
  const ejercicios = [...new Set(cartillas.map(c => c.ejercicio).filter(Boolean))].sort((a,b) => String(b).localeCompare(String(a), "es", {numeric:true}));
  select.innerHTML = '<option value="TODOS">Ejercicio: Todos</option>' + ejercicios.map(e => `<option value="${escaparHtml(e)}">${escaparHtml(e)}</option>`).join("");
  select.value = ejercicios.includes(actual) ? actual : "TODOS";
}

function filtrarCartillas() {
  if (typeof document === "undefined") return cartillas;
  const termino = normalizar(document.getElementById("cartilla-search")?.value || "");
  const ejercicio = document.getElementById("cartilla-ejercicio-filter")?.value || "TODOS";
  const plazo = document.getElementById("cartilla-plazo-filter")?.value || "TODOS";
  return cartillas.filter(c => {
    const os = c.obras_sociales || {};
    if (ejercicio !== "TODOS" && c.ejercicio !== ejercicio) return false;
    const cumplimiento = cumplimientoCartillaRegistro(c).estado;
    if (plazo !== "TODOS" && cumplimiento !== plazo) return false;
    if (!termino) return true;
    return normalizar([os.rnos,os.denominacion,os.sigla,c.ejercicio,c.analista,c.numero_ee,c.condicion,c.numero_disposicion,c.observaciones].join(" ")).includes(termino);
  });
}

function renderCartillas() {
  if (typeof document === "undefined") return;
  const tbody = document.getElementById("cartilla-table-body");
  if (!tbody) return;
  const filtradas = filtrarCartillas();
  tbody.innerHTML = filtradas.map(c => {
    const os = c.obras_sociales || {};
    const plazo = cumplimientoCartillaRegistro(c);
    const plazoTexto = plazo.estado === "EN_TERMINO" ? "EN TÉRMINO" : plazo.estado === "FUERA_DE_TERMINO" ? "FUERA DE TÉRMINO" : "SIN DATOS";
    const clase = plazo.estado === "EN_TERMINO" ? "active" : plazo.estado === "FUERA_DE_TERMINO" ? "inactive" : "neutral-badge";
    return `<tr class="cartilla-row" data-cartilla-id="${c.id}" tabindex="0" role="button" title="Clic para ver o editar la presentación">
      <td><strong>${escaparHtml(os.rnos || "—")}</strong></td>
      <td class="denominacion-cell">${escaparHtml(os.denominacion || "—")}</td>
      <td>${escaparHtml(c.ejercicio || "—")}</td>
      <td class="date-cell">${formatFechaPantalla(c.fecha_ingreso)}</td>
      <td class="date-cell">${formatFechaPantalla(plazo.fechaLimite)}</td>
      <td><span class="badge ${clase}">${plazoTexto}</span></td>
      <td>${escaparHtml(c.condicion || "—")}</td>
      <td>${escaparHtml(c.analista || "—")}</td>
    </tr>`;
  }).join("");
  const count = document.getElementById("cartilla-count");
  if (count) count.textContent = `${filtradas.length} ${filtradas.length === 1 ? "presentación" : "presentaciones"}`;
  const empty = document.getElementById("cartilla-empty");
  if (empty) empty.hidden = filtradas.length !== 0;

  document.querySelectorAll(".cartilla-row[data-cartilla-id]").forEach(row => {
    const editar = () => requiereAutenticacion(() => abrirModalCartillaEdicion(Number(row.dataset.cartillaId)));
    row.addEventListener("click", editar);
    row.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editar(); }
    });
  });
}

async function cargarYRenderizarCartillas() {
  if (typeof document === "undefined") return;
  const status = document.getElementById("cartilla-source-status");
  if (status) status.textContent = "Conectando con Supabase...";
  try {
    cartillas = await cargarCartillasDesdeSupabase();
    cartillasCargadas = true;
    llenarFiltroEjercicios();
    renderCartillas();
    if (status) status.textContent = "Conectado a Supabase";
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
  const seleccionados = [...new Set((periodosSeleccionados || []).map(Number).filter(Number.isInteger))];
  const disponibles = [...new Set((periodosDisponibles || []).map(Number).filter(Number.isInteger))];

  if (!seleccionados.length) return "Seleccionar períodos";
  if (disponibles.length && seleccionados.length === disponibles.length) {
    return "Todos los períodos seleccionados";
  }
  if (seleccionados.length === 1) return "1 período seleccionado";
  return `${seleccionados.length} períodos seleccionados`;
}

function getPeriodosReporteSeleccionados() {
  if (typeof document === "undefined") return [];
  return [...document.querySelectorAll('input[name="report-periodo"]:checked')]
    .map(input => Number(input.value))
    .filter(Number.isInteger)
    .sort((a, b) => a - b);
}

function actualizarResumenPeriodosReporte() {
  if (typeof document === "undefined") return;
  const resumen = document.getElementById("report-period-summary");
  const disponibles = [...document.querySelectorAll('input[name="report-periodo"]')]
    .map(input => Number(input.value))
    .filter(Number.isInteger);

  if (resumen) {
    resumen.textContent = resumenPeriodosSeleccionados(
      getPeriodosReporteSeleccionados(),
      disponibles
    );
  }
}

function seleccionarTodosPeriodosReporte(seleccionar) {
  if (typeof document === "undefined") return;
  document.querySelectorAll('input[name="report-periodo"]').forEach(input => {
    input.checked = Boolean(seleccionar);
  });
  actualizarResumenPeriodosReporte();
  renderReporteFaltantesCartillas();
}

function poblarPeriodosReporte() {
  if (typeof document === "undefined") return;
  const container = document.getElementById("report-periodos");
  if (!container) return;

  const seleccionadosAntes = new Set(getPeriodosReporteSeleccionados());
  const periodos = periodosControlDisponibles(cartillas);
  const actual = new Date().getFullYear();

  container.innerHTML = periodos.map(periodo => {
    const checked = seleccionadosAntes.size
      ? seleccionadosAntes.has(periodo)
      : periodo === actual;

    return `<label class="period-check">
      <input type="checkbox" name="report-periodo" value="${periodo}" ${checked ? "checked" : ""}>
      <span>${periodo}</span>
    </label>`;
  }).join("");

  container.querySelectorAll('input[name="report-periodo"]').forEach(input => {
    input.addEventListener("change", () => {
      actualizarResumenPeriodosReporte();
      renderReporteFaltantesCartillas();
    });
  });

  actualizarResumenPeriodosReporte();
}

function reporteTieneFaltante(row, periodos) {
  return periodos.some(periodo => {
    const estado = row?.periodos?.[periodo]?.estado;
    return estado === "NO_PRESENTO" || estado === "SIN_INICIO";
  });
}

function obtenerFilasReporteCartillas(reporte, periodos) {
  if (typeof document === "undefined") return [...(reporte || [])];
  const termino = normalizar(document.getElementById("report-cartillas-search")?.value || "");
  const soloFaltantes = Boolean(document.getElementById("report-solo-faltantes")?.checked);

  return (reporte || []).filter(row => {
    if (soloFaltantes && !reporteTieneFaltante(row, periodos)) return false;
    if (!termino) return true;
    return normalizar(`${row.rnos} ${row.denominacion}`).includes(termino);
  });
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

function renderGraficoCartillas(resumen) {
  if (typeof document === "undefined") return;
  const container = document.getElementById("report-cartillas-chart");
  if (!container) return;

  if (!Array.isArray(resumen) || !resumen.length) {
    container.innerHTML = '<div class="chart-empty">Seleccioná al menos un período para ver el gráfico.</div>';
    return;
  }

  const maximo = Math.max(
    1,
    ...resumen.flatMap(item => [item.presentaron, item.noPresentaron, item.sinInicio])
  );
  const altoMaximo = 170;

  const bar = (valor, clase, etiqueta) => {
    const alto = valor === 0 ? 2 : Math.max(6, Math.round((valor / maximo) * altoMaximo));
    return `<div class="chart-bar-wrap" title="${escaparHtml(etiqueta)}: ${valor}">
      <span class="chart-value">${valor}</span>
      <div class="chart-bar ${clase}" style="height:${alto}px" aria-label="${escaparHtml(etiqueta)}: ${valor}"></div>
    </div>`;
  };

  container.innerHTML = `<div class="chart-groups">
    ${resumen.map(item => `
      <div class="chart-period-group">
        <div class="chart-bars">
          ${bar(item.presentaron, "presented", "Presentaron")}
          ${bar(item.noPresentaron, "missing", "No presentaron")}
          ${bar(item.sinInicio, "unknown", "Sin Inicio ejercicio")}
        </div>
        <strong>${item.periodo}</strong>
      </div>
    `).join("")}
  </div>`;
}

function renderReporteFaltantesCartillas() {
  if (typeof document === "undefined") return;

  const head = document.getElementById("report-cartillas-head");
  const body = document.getElementById("report-cartillas-body");
  const count = document.getElementById("report-cartillas-count");
  const empty = document.getElementById("report-cartillas-empty");
  if (!head || !body) return;

  const periodos = getPeriodosReporteSeleccionados();

  head.innerHTML = `<tr>
    <th>RNOS</th>
    <th>Denominación</th>
    <th>Inicio ejercicio</th>
    ${periodos.map(periodo => `<th class="period-head">${periodo}</th>`).join("")}
  </tr>`;

  if (!periodos.length) {
    body.innerHTML = "";
    renderGraficoCartillas([]);
    if (count) count.textContent = "Seleccioná al menos un período";
    if (empty) {
      empty.hidden = false;
      empty.textContent = "Seleccioná uno o más períodos de control para generar el reporte.";
    }
    return;
  }

  const reporte = generarReporteFaltantesCartillas(obrasSociales, cartillas, periodos);
  const filtrado = obtenerFilasReporteCartillas(reporte, periodos);
  renderGraficoCartillas(resumirCartillasPorPeriodo(reporte, periodos));

  body.innerHTML = filtrado.map(row => `
    <tr>
      <td><strong>${escaparHtml(row.rnos || "—")}</strong></td>
      <td class="denominacion-cell">${escaparHtml(row.denominacion || "—")}</td>
      <td class="date-cell">${escaparHtml(row.inicioEjercicio || "—")}</td>
      ${periodos.map(periodo => {
        const resultado = row.periodos[periodo] || { estado: "SIN_INICIO", ejercicioEsperado: "" };
        const estado = resultado.estado || "SIN_INICIO";
        const simbolo = simboloEstadoReporte(estado);
        const etiqueta = etiquetaEstadoReporte(estado);
        const clase = claseEstadoReporte(estado);
        const detalle = resultado.ejercicioEsperado ? ` · Ejercicio esperado: ${resultado.ejercicioEsperado}` : "";
        return `<td class="report-status-cell">
          <span class="report-icon ${clase}" title="${escaparHtml(etiqueta + detalle)}" aria-label="${escaparHtml(etiqueta + detalle)}">${simbolo}</span>
        </td>`;
      }).join("")}
    </tr>
  `).join("");

  const faltantes = reporte.filter(row => reporteTieneFaltante(row, periodos)).length;
  const sinInicio = reporte.filter(row => periodos.some(p => row.periodos[p]?.estado === "SIN_INICIO")).length;

  if (count) {
    count.textContent = `${filtrado.length} ${filtrado.length === 1 ? "Obra Social" : "Obras Sociales"} mostradas`;
  }

  const status = document.getElementById("report-cartillas-status");
  if (status) {
    status.textContent = `${faltantes} con faltantes · ${sinInicio} sin Inicio ejercicio · ${reporte.length} OS activas evaluadas`;
  }

  if (empty) {
    empty.hidden = filtrado.length !== 0;
    empty.textContent = "No hay Obras Sociales para mostrar con los filtros seleccionados.";
  }
}

function formatearFechaHoraExportacion(fecha = new Date()) {
  const pad = value => String(value).padStart(2, "0");
  return `${pad(fecha.getDate())}-${pad(fecha.getMonth() + 1)}-${fecha.getFullYear()} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

function exportarReporteCartillasExcel() {
  if (typeof document === "undefined") return;

  const periodos = getPeriodosReporteSeleccionados();
  if (!periodos.length) {
    mostrarToast("Seleccioná al menos un período para exportar.", "error");
    return;
  }

  if (!window.XLSX) {
    mostrarToast("No se pudo cargar el generador de Excel. Recargá la página e intentá nuevamente.", "error");
    return;
  }

  const reporte = generarReporteFaltantesCartillas(obrasSociales, cartillas, periodos);
  const filas = obtenerFilasReporteCartillas(reporte, periodos);
  const matriz = construirMatrizExcelCartillas(filas, periodos, {
    reporte: "Cartillas - Presentaciones",
    generado: formatearFechaHoraExportacion()
  });

  const hoja = window.XLSX.utils.aoa_to_sheet(matriz);
  hoja["!cols"] = [
    { wch: 12 },
    { wch: 55 },
    { wch: 16 },
    ...periodos.map(() => ({ wch: 12 }))
  ];

  const libro = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(libro, hoja, "Cartillas");
  window.XLSX.writeFile(libro, `reporte_cartillas_${periodos.join("-")}.xlsx`);
}

function actualizarSelectorReporte() {
  if (typeof document === "undefined") return;
  const select = document.getElementById("report-type-select");
  reporteActivo = select?.value || "cartillas";

  document.querySelectorAll("[data-report-panel]").forEach(panel => {
    panel.hidden = panel.dataset.reportPanel !== reporteActivo;
  });

  const exportButton = document.getElementById("btn-export-report");
  if (exportButton) {
    const disponible = reporteActivo === "cartillas";
    exportButton.disabled = !disponible;
    exportButton.title = disponible ? "Descargar el reporte actual en Excel" : "La exportación se habilitará cuando incorporemos este reporte";
  }

  if (reporteActivo === "cartillas") cargarYRenderizarReporteCartillas();
}

function cargarReporteActivo() {
  if (typeof document === "undefined") return;
  actualizarSelectorReporte();
}

function exportarReporteActivo() {
  if (reporteActivo === "cartillas") {
    exportarReporteCartillasExcel();
    return;
  }
  mostrarToast("Este reporte todavía no está disponible.", "error");
}

async function cargarYRenderizarReporteCartillas() {
  if (typeof document === "undefined") return;

  const status = document.getElementById("report-cartillas-status");
  const count = document.getElementById("report-cartillas-count");

  if (reporteCartillasCargado && obrasSociales.length && cartillasCargadas) {
    renderReporteFaltantesCartillas();
    return;
  }

  if (status) status.textContent = "Cargando Obras Sociales y Cartillas...";
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
    renderReporteFaltantesCartillas();

    if (document.getElementById("report-cartillas-status")?.textContent === "Cargando Obras Sociales y Cartillas...") {
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

function limpiarFormularioCartilla() {
  document.getElementById("cartilla-form")?.reset();
  document.getElementById("cartilla-id").value = "";
  document.getElementById("cartilla-os-id").value = "";
  document.getElementById("cartilla-inicio-ejercicio").value = "";
  document.getElementById("cartilla-ejercicio").value = "";
  document.getElementById("cartilla-fecha-inicio-ejercicio").value = "";
  document.getElementById("cartilla-anio-inicio").value = String(new Date().getFullYear());
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
  document.getElementById("cartilla-inicio-ejercicio").value = c.obras_sociales?.inicio_ejercicio || "";
  document.getElementById("cartilla-anio-inicio").value = c.anio_inicio || (c.fecha_inicio_ejercicio ? Number(c.fecha_inicio_ejercicio.slice(0,4)) : "");
  document.getElementById("cartilla-ejercicio").value = c.ejercicio || "";
  document.getElementById("cartilla-fecha-inicio-ejercicio").value = c.fecha_inicio_ejercicio || "";
  document.getElementById("cartilla-analista").value = c.analista || "";
  document.getElementById("cartilla-ee").value = c.numero_ee || "";
  document.getElementById("cartilla-condicion").value = c.condicion || "";
  document.getElementById("cartilla-fecha-ingreso").value = c.fecha_ingreso || "";
  document.getElementById("cartilla-res-170").value = c.res_170_2009 || "";
  document.getElementById("cartilla-disposicion").value = c.numero_disposicion || "";
  document.getElementById("cartilla-fecha-disposicion").value = c.fecha_disposicion || "";
  document.getElementById("cartilla-observaciones").value = c.observaciones || "";
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
    const anioInicio = Number(document.getElementById("cartilla-anio-inicio")?.value || 0);
    const inicioEjercicio = os?.inicio_ejercicio || "";
    const fechaInicioEjercicio = fechaInicioEjercicioDesdeDiaMes(inicioEjercicio, anioInicio);
    const ejercicio = derivarEjercicio(inicioEjercicio, anioInicio);
    if (!os) throw new Error("Seleccioná una Obra Social del maestro.");
    if (!inicioEjercicio) throw new Error("La Obra Social no tiene Inicio ejercicio cargado. Completalo primero en Obras Sociales.");
    if (!fechaInicioEjercicio || !ejercicio) throw new Error("Revisá el Inicio ejercicio y el Año de inicio.");

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
    const mensaje = /duplicate|unique|23505/i.test(error.message || "") ? "Ya existe una presentación con esa Obra Social, ejercicio y Nº EE." : error.message || "No se pudo guardar la presentación.";
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

function initBrowser() {
  const recoveryDetected = procesarRecuperacionDesdeUrl();

  document.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.view)));
  document.querySelectorAll("[data-go]").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.go)));
  document.querySelectorAll("[data-close-modal]").forEach(btn => btn.addEventListener("click", () => cerrarModal(btn.dataset.closeModal)));
  document.querySelectorAll("[data-toggle-password]").forEach(btn => btn.addEventListener("click", () => togglePassword(btn.dataset.togglePassword, btn)));

  document.getElementById("os-search")?.addEventListener("input", renderObrasSociales);
  document.getElementById("os-estado-filter")?.addEventListener("change", renderObrasSociales);
  document.getElementById("rnos-sort")?.addEventListener("click", toggleRnosSort);
  document.getElementById("btn-nueva-os")?.addEventListener("click", () => requiereAutenticacion(abrirModalNueva));
  document.getElementById("os-modal-close")?.addEventListener("click", () => cerrarModal("os-modal"));
  document.getElementById("os-cancelar")?.addEventListener("click", () => cerrarModal("os-modal"));
  document.getElementById("os-form")?.addEventListener("submit", handleOsSubmit);

  document.getElementById("btn-nueva-cartilla")?.addEventListener("click", () => requiereAutenticacion(abrirModalCartillaNueva));
  document.getElementById("cartilla-form")?.addEventListener("submit", handleCartillaSubmit);
  document.getElementById("cartilla-search")?.addEventListener("input", renderCartillas);
  document.getElementById("cartilla-ejercicio-filter")?.addEventListener("change", renderCartillas);
  document.getElementById("cartilla-plazo-filter")?.addEventListener("change", renderCartillas);
  document.getElementById("cartilla-os-search")?.addEventListener("input", recalcularDatosCartilla);
  document.getElementById("cartilla-os-search")?.addEventListener("change", recalcularDatosCartilla);
  document.getElementById("cartilla-anio-inicio")?.addEventListener("input", recalcularDatosCartilla);
  document.getElementById("cartilla-fecha-ingreso")?.addEventListener("change", actualizarAlertaCartilla);

  document.getElementById("report-cartillas-search")?.addEventListener("input", renderReporteFaltantesCartillas);
  document.getElementById("report-solo-faltantes")?.addEventListener("change", renderReporteFaltantesCartillas);
  document.getElementById("report-period-all")?.addEventListener("click", () => seleccionarTodosPeriodosReporte(true));
  document.getElementById("report-period-clear")?.addEventListener("click", () => seleccionarTodosPeriodosReporte(false));
  document.getElementById("report-type-select")?.addEventListener("change", actualizarSelectorReporte);
  document.getElementById("btn-export-report")?.addEventListener("click", exportarReporteActivo);

  document.getElementById("btn-login")?.addEventListener("click", abrirLogin);
  document.getElementById("login-form")?.addEventListener("submit", handleLoginSubmit);
  document.getElementById("btn-logout")?.addEventListener("click", handleLogout);
  document.getElementById("btn-forgot-password")?.addEventListener("click", () => {
    const email = document.getElementById("auth-user")?.value.trim() || "";
    cerrarModal("login-modal");
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
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    const abierto = [...document.querySelectorAll(".modal-backdrop")].reverse().find(m => !m.hidden);
    if (abierto) cerrarModal(abierto.id);
  });

  window.addEventListener("popstate", () => showView(getInitialView(location.hash), false));

  restaurarSesion();
  showView(recoveryDetected ? "obras-sociales" : getInitialView(location.hash), false);
  cargarYRenderizarObrasSociales();

  if (recoveryDetected) abrirCambioPassword(true);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initBrowser);
  else initBrowser();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
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
    fechaInicioEjercicioDesdeDiaMes,
    calcularCumplimiento90,
    ejercicioEsperadoPeriodoControl,
    generarReporteFaltantesCartillas,
    simboloEstadoReporte,
    resumirCartillasPorPeriodo,
    construirMatrizExcelCartillas,
    periodosControlDisponibles,
    resumenPeriodosSeleccionados,
    buildCartillasUrl,
    cargarCartillasDesdeSupabase,
    parseRecoveryHash,
    normalizarSesion
  };
}
