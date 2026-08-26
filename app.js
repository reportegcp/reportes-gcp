const views = {
  inicio: {
    title: "Inicio",
    subtitle: "Panel general de seguimiento prestacional"
  },
  "obras-sociales": {
    title: "Obras Sociales",
    subtitle: "Maestro único de RNOS y denominaciones"
  },
  pma: {
    title: "PMA",
    subtitle: "Seguimiento de presentaciones"
  },
  cartillas: {
    title: "Cartillas",
    subtitle: "Seguimiento de presentaciones"
  },
  reportes: {
    title: "Reportes",
    subtitle: "Consultas e indicadores de gestión"
  }
};

function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));

  const view = document.getElementById(id);
  const button = document.querySelector(`[data-view="${id}"]`);

  if (view) view.classList.add("active");
  if (button) button.classList.add("active");

  const meta = views[id] || views.inicio;
  document.getElementById("page-title").textContent = meta.title;
  document.getElementById("page-subtitle").textContent = meta.subtitle;
}

document.querySelectorAll("[data-view]").forEach(btn => {
  btn.addEventListener("click", () => showView(btn.dataset.view));
});

document.querySelectorAll("[data-go]").forEach(btn => {
  btn.addEventListener("click", () => showView(btn.dataset.go));
});

/* =========================================================
   OBRAS SOCIALES - PROTOTIPO LOCAL
   Todavía no conectado a Supabase.
   ========================================================= */

const STORAGE_KEY = "gcp-obras-sociales-v1";

const OLD_DEMO_KEYS = [
  "gcp-obras-sociales-demo-v1",
  "gcp-obras-sociales-demo-v2",
  "gcp-obras-sociales-demo-v3"
];

OLD_DEMO_KEYS.forEach(key => localStorage.removeItem(key));

function cargarObrasSociales() {
  try {
    const guardadas = localStorage.getItem(STORAGE_KEY);
    if (!guardadas) return [];

    const parsed = JSON.parse(guardadas);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let obrasSociales = cargarObrasSociales();

function guardarObrasSociales() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obrasSociales));
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

    const bolsa = normalizar([
      os.rnos,
      os.denominacion,
      os.sigla,
      os.domicilio,
      os.localidad,
      os.provincia,
      os.telefono,
      os.email,
      os.web
    ].join(" "));

    return bolsa.includes(termino);
  });
}

function renderObrasSociales() {
  const tbody = document.getElementById("os-table-body");
  if (!tbody) return;

  const busqueda = document.getElementById("os-search").value;
  const estado = document.getElementById("os-estado-filter").value;
  const filtradas = filtrarObrasSociales(obrasSociales, busqueda, estado);

  tbody.innerHTML = filtradas.map(os => `
    <tr>
      <td><strong>${escaparHtml(os.rnos)}</strong></td>
      <td>${escaparHtml(os.denominacion)}</td>
      <td>${escaparHtml(os.sigla || "—")}</td>
      <td>${escaparHtml(os.localidad || "—")}</td>
      <td>${escaparHtml(os.provincia || "—")}</td>
      <td>${mostrarDiaMes(os.fechaInicio)}</td>
      <td>${mostrarDiaMes(os.inicioEjercicio)}</td>
      <td>
        <span class="badge ${os.estado === "ACTIVA" ? "active" : "inactive"}">
          ${escaparHtml(os.estado)}
        </span>
      </td>
      <td class="actions-col">
        <button class="edit-button" type="button" data-edit-os="${os.id}">
          ✎ Editar
        </button>
      </td>
    </tr>
  `).join("");

  document.getElementById("os-count").textContent =
    `${filtradas.length} ${filtradas.length === 1 ? "Obra Social" : "Obras Sociales"}`;

  document.getElementById("os-empty").hidden = filtradas.length !== 0;

  document.querySelectorAll("[data-edit-os]").forEach(btn => {
    btn.addEventListener("click", () => abrirModalEdicion(Number(btn.dataset.editOs)));
  });
}

function abrirModalNueva() {
  document.getElementById("os-form").reset();
  document.getElementById("os-id").value = "";
  document.getElementById("os-estado").value = "ACTIVA";
  document.getElementById("os-modal-title").textContent = "Nueva Obra Social";
  ocultarMensajeFormulario();
  abrirModal();
  setTimeout(() => document.getElementById("os-rnos").focus(), 0);
}

function abrirModalEdicion(id) {
  const os = obrasSociales.find(item => item.id === id);
  if (!os) return;

  document.getElementById("os-id").value = os.id;
  document.getElementById("os-rnos").value = os.rnos || "";
  document.getElementById("os-denominacion").value = os.denominacion || "";
  document.getElementById("os-sigla").value = os.sigla || "";
  document.getElementById("os-domicilio").value = os.domicilio || "";
  document.getElementById("os-localidad").value = os.localidad || "";
  document.getElementById("os-provincia").value = os.provincia || "";
  document.getElementById("os-telefono").value = os.telefono || "";
  document.getElementById("os-email").value = os.email || "";
  document.getElementById("os-web").value = os.web || "";
  document.getElementById("os-fecha-inicio").value = os.fechaInicio || "";
  document.getElementById("os-inicio-ejercicio").value = os.inicioEjercicio || "";
  document.getElementById("os-estado").value = os.estado || "ACTIVA";
  document.getElementById("os-observaciones").value = os.observaciones || "";

  document.getElementById("os-modal-title").textContent = "Editar Obra Social";
  ocultarMensajeFormulario();
  abrirModal();
}

function abrirModal() {
  document.getElementById("os-modal").hidden = false;
  document.body.classList.add("modal-open");
}

function cerrarModal() {
  document.getElementById("os-modal").hidden = true;
  document.body.classList.remove("modal-open");
  ocultarMensajeFormulario();
}

function mostrarMensajeFormulario(texto) {
  const el = document.getElementById("os-form-message");
  el.textContent = texto;
  el.hidden = false;
}

function ocultarMensajeFormulario() {
  const el = document.getElementById("os-form-message");
  el.textContent = "";
  el.hidden = true;
}

function siguienteId() {
  return obrasSociales.reduce((max, os) => Math.max(max, Number(os.id) || 0), 0) + 1;
}

function guardarDesdeFormulario(event) {
  event.preventDefault();
  ocultarMensajeFormulario();

  const id = Number(document.getElementById("os-id").value || 0);
  const rnos = document.getElementById("os-rnos").value.trim();
  const denominacion = document.getElementById("os-denominacion").value.trim();
  const sigla = document.getElementById("os-sigla").value.trim().toUpperCase();
  const domicilio = document.getElementById("os-domicilio").value.trim();
  const localidad = document.getElementById("os-localidad").value.trim();
  const provincia = document.getElementById("os-provincia").value.trim();
  const telefono = document.getElementById("os-telefono").value.trim();
  const email = document.getElementById("os-email").value.trim();
  const web = document.getElementById("os-web").value.trim();
  let fechaInicio = document.getElementById("os-fecha-inicio").value.trim();
  let inicioEjercicio = document.getElementById("os-inicio-ejercicio").value.trim();
  const estado = document.getElementById("os-estado").value;
  const observaciones = document.getElementById("os-observaciones").value.trim();

  if (!rnos || !denominacion) {
    mostrarMensajeFormulario("RNOS y Denominación son obligatorios.");
    return;
  }

  if (fechaInicio && !normalizarDiaMes(fechaInicio)) {
    mostrarMensajeFormulario("Fecha Inicio debe tener formato DD-MM, por ejemplo 15-03.");
    return;
  }

  if (inicioEjercicio && !normalizarDiaMes(inicioEjercicio)) {
    mostrarMensajeFormulario("Inicio ejercicio debe tener formato DD-MM, por ejemplo 01-07.");
    return;
  }

  fechaInicio = fechaInicio ? normalizarDiaMes(fechaInicio) : "";
  inicioEjercicio = inicioEjercicio ? normalizarDiaMes(inicioEjercicio) : "";

  const duplicado = obrasSociales.some(os =>
    normalizar(os.rnos) === normalizar(rnos) && Number(os.id) !== id
  );

  if (duplicado) {
    mostrarMensajeFormulario("Ya existe una Obra Social con ese RNOS.");
    return;
  }

  const registro = {
    rnos,
    denominacion,
    sigla,
    domicilio,
    localidad,
    provincia,
    telefono,
    email,
    web,
    fechaInicio,
    inicioEjercicio,
    estado,
    observaciones
  };

  if (id) {
    const index = obrasSociales.findIndex(os => Number(os.id) === id);
    if (index === -1) return;
    obrasSociales[index] = { ...obrasSociales[index], ...registro };
  } else {
    obrasSociales.push({ id: siguienteId(), ...registro });
  }

  guardarObrasSociales();
  renderObrasSociales();
  cerrarModal();
}

const osSearch = document.getElementById("os-search");
const osEstadoFilter = document.getElementById("os-estado-filter");
const btnNuevaOs = document.getElementById("btn-nueva-os");
const osForm = document.getElementById("os-form");
const osModal = document.getElementById("os-modal");

if (osSearch) osSearch.addEventListener("input", renderObrasSociales);
if (osEstadoFilter) osEstadoFilter.addEventListener("change", renderObrasSociales);
if (btnNuevaOs) btnNuevaOs.addEventListener("click", abrirModalNueva);
if (osForm) osForm.addEventListener("submit", guardarDesdeFormulario);

document.getElementById("os-modal-close")?.addEventListener("click", cerrarModal);
document.getElementById("os-cancelar")?.addEventListener("click", cerrarModal);

osModal?.addEventListener("click", event => {
  if (event.target === osModal) cerrarModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !document.getElementById("os-modal")?.hidden) {
    cerrarModal();
  }
});

["os-fecha-inicio", "os-inicio-ejercicio"].forEach(id => {
  const campo = document.getElementById(id);
  campo?.addEventListener("blur", () => {
    const normalizado = normalizarDiaMes(campo.value);
    if (normalizado) campo.value = normalizado;
  });
});

renderObrasSociales();
