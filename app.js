const SUPABASE_URL = "https://kvevhmqxfjorwgydgaqd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_PmqcH16HogW-iFZMqmX3cQ_PbKyQxKc";

const views = {
  inicio: { title: "Inicio", subtitle: "Panel general de seguimiento prestacional" },
  "obras-sociales": { title: "Obras Sociales", subtitle: "Maestro único de RNOS y denominaciones" },
  pma: { title: "PMA", subtitle: "Seguimiento de presentaciones" },
  cartillas: { title: "Cartillas", subtitle: "Seguimiento de presentaciones" },
  reportes: { title: "Reportes", subtitle: "Consultas e indicadores de gestión" }
};

function getInitialView(hash) {
  const id = String(hash || "").replace(/^#/, "");
  return Object.prototype.hasOwnProperty.call(views, id) ? id : "inicio";
}

function buildObrasSocialesUrl() {
  const fields = [
    "id", "rnos", "denominacion", "sigla", "domicilio", "localidad", "provincia",
    "telefono", "email", "web", "fecha_inicio", "inicio_ejercicio", "estado", "observaciones"
  ].join(",");

  const params = new URLSearchParams();
  params.set("select", fields);
  params.set("order", "denominacion.asc");
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
      fetchImpl(url, {
        ...options,
        ...(controller ? { signal: controller.signal } : {})
      }),
      timeoutPromise
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function cargarObrasSocialesDesdeSupabase(fetchImpl = fetch) {
  const response = await fetchConTimeout(
    buildObrasSocialesUrl(),
    {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      cache: "no-store"
    },
    10000,
    fetchImpl
  );

  if (!response.ok) {
    let detalle = "";
    try { detalle = await response.text(); } catch (_) {}
    throw new Error(`Supabase respondió ${response.status}${detalle ? `: ${detalle}` : ""}`);
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
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

let obrasSociales = [];

function showView(id, updateHistory = true) {
  if (typeof document === "undefined") return;
  const resolved = Object.prototype.hasOwnProperty.call(views, id) ? id : "inicio";

  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));

  document.getElementById(resolved)?.classList.add("active");
  document.querySelector(`[data-view="${resolved}"]`)?.classList.add("active");

  const meta = views[resolved];
  document.getElementById("page-title").textContent = meta.title;
  document.getElementById("page-subtitle").textContent = meta.subtitle;

  if (updateHistory && typeof history !== "undefined") {
    history.pushState(null, "", `#${resolved}`);
  }
}

function renderObrasSociales() {
  if (typeof document === "undefined") return;
  const tbody = document.getElementById("os-table-body");
  if (!tbody) return;

  const busqueda = document.getElementById("os-search")?.value || "";
  const estado = document.getElementById("os-estado-filter")?.value || "TODAS";
  const filtradas = filtrarObrasSociales(obrasSociales, busqueda, estado);

  tbody.innerHTML = filtradas.map(os => `
    <tr>
      <td><strong>${escaparHtml(os.rnos)}</strong></td>
      <td>${escaparHtml(os.denominacion)}</td>
      <td>${escaparHtml(os.sigla || "—")}</td>
      <td>${escaparHtml(os.localidad || "—")}</td>
      <td>${escaparHtml(os.provincia || "—")}</td>
      <td>${mostrarDiaMes(os.fecha_inicio)}</td>
      <td>${mostrarDiaMes(os.inicio_ejercicio)}</td>
      <td><span class="badge ${os.estado === "ACTIVA" ? "active" : "inactive"}">${escaparHtml(os.estado || "—")}</span></td>
      <td class="actions-col"><button class="edit-button" type="button" data-edit-os="${os.id}">✎ Editar</button></td>
    </tr>
  `).join("");

  const count = document.getElementById("os-count");
  if (count) count.textContent = `${filtradas.length} ${filtradas.length === 1 ? "Obra Social" : "Obras Sociales"}`;

  const empty = document.getElementById("os-empty");
  if (empty) {
    empty.hidden = filtradas.length !== 0;
    if (!filtradas.length) empty.textContent = "No se encontraron Obras Sociales con ese criterio.";
  }

  document.querySelectorAll("[data-edit-os]").forEach(btn => {
    btn.addEventListener("click", () => abrirModalLectura(Number(btn.dataset.editOs)));
  });
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
    setEstadoCarga("Conectado a Supabase");
  } catch (error) {
    obrasSociales = [];
    renderObrasSociales();
    if (count) count.textContent = "0 Obras Sociales";

    const esTimeout = error && error.name === "TimeoutError";
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

function abrirModalLectura(id) {
  const os = obrasSociales.find(item => Number(item.id) === Number(id));
  if (!os) return;

  const values = {
    "os-id": os.id,
    "os-rnos": os.rnos,
    "os-denominacion": os.denominacion,
    "os-sigla": os.sigla,
    "os-domicilio": os.domicilio,
    "os-localidad": os.localidad,
    "os-provincia": os.provincia,
    "os-telefono": os.telefono,
    "os-email": os.email,
    "os-web": os.web,
    "os-fecha-inicio": os.fecha_inicio,
    "os-inicio-ejercicio": os.inicio_ejercicio,
    "os-estado": os.estado,
    "os-observaciones": os.observaciones
  };

  Object.entries(values).forEach(([idCampo, value]) => {
    const campo = document.getElementById(idCampo);
    if (campo) campo.value = value ?? "";
  });

  document.getElementById("os-modal-title").textContent = "Editar Obra Social";
  const msg = document.getElementById("os-form-message");
  if (msg) {
    msg.textContent = "Lectura desde Supabase. La edición se habilitará cuando agreguemos acceso de usuarios.";
    msg.hidden = false;
  }

  document.querySelectorAll("#os-form input:not([type=hidden]), #os-form textarea, #os-form select").forEach(campo => {
    campo.disabled = true;
  });
  document.querySelector('#os-form button[type="submit"]')?.setAttribute("disabled", "disabled");

  document.getElementById("os-modal").hidden = false;
  document.body.classList.add("modal-open");
}

function cerrarModal() {
  document.getElementById("os-modal").hidden = true;
  document.body.classList.remove("modal-open");
}

function initBrowser() {
  document.querySelectorAll("[data-view]").forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });
  document.querySelectorAll("[data-go]").forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.go));
  });

  document.getElementById("os-search")?.addEventListener("input", renderObrasSociales);
  document.getElementById("os-estado-filter")?.addEventListener("change", renderObrasSociales);
  document.getElementById("os-modal-close")?.addEventListener("click", cerrarModal);
  document.getElementById("os-cancelar")?.addEventListener("click", cerrarModal);
  document.getElementById("os-form")?.addEventListener("submit", event => event.preventDefault());

  const modal = document.getElementById("os-modal");
  modal?.addEventListener("click", event => { if (event.target === modal) cerrarModal(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal && !modal.hidden) cerrarModal();
  });

  window.addEventListener("popstate", () => showView(getInitialView(location.hash), false));
  showView(getInitialView(location.hash), false);
  cargarYRenderizarObrasSociales();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBrowser);
  } else {
    initBrowser();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getInitialView,
    buildObrasSocialesUrl,
    fetchConTimeout,
    cargarObrasSocialesDesdeSupabase,
    filtrarObrasSociales,
    normalizarDiaMes
  };
}
