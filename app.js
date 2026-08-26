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

const STORAGE_KEY = "gcp-obras-sociales-demo-v2";

const obrasSocialesDemo = [
  {
    id: 1,
    rnos: "100106",
    denominacion: "OBRA SOCIAL DEMO DEL PERSONAL ADMINISTRATIVO",
    sigla: "OSDPA",
    inicioEjercicio: "01/01",
    finEjercicio: "31/12",
    estado: "ACTIVA",
    observaciones: ""
  },
  {
    id: 2,
    rnos: "105606",
    denominacion: "OBRA SOCIAL DEMO DE LA INDUSTRIA Y AFINES",
    sigla: "OSDIA",
    inicioEjercicio: "01/01",
    finEjercicio: "31/12",
    estado: "ACTIVA",
    observaciones: ""
  },
  {
    id: 3,
    rnos: "106708",
    denominacion: "OBRA SOCIAL DEMO DE TRABAJADORES REGIONALES",
    sigla: "OSDTR",
    inicioEjercicio: "01/01",
    finEjercicio: "31/12",
    estado: "ACTIVA",
    observaciones: ""
  },
  {
    id: 4,
    rnos: "401001",
    denominacion: "OBRA SOCIAL DEMO DEL PERSONAL DE DIRECCIÓN",
    sigla: "OSDPD",
    inicioEjercicio: "01/01",
    finEjercicio: "31/12",
    estado: "INACTIVA",
    observaciones: "Registro de ejemplo para visualizar el estado inactivo."
  }
];

function cargarObrasSociales() {
  try {
    const guardadas = localStorage.getItem(STORAGE_KEY);
    if (!guardadas) return [...obrasSocialesDemo];
    const parsed = JSON.parse(guardadas);
    if (!Array.isArray(parsed)) return [...obrasSocialesDemo];
    return parsed.map(os => ({
      ...os,
      inicioEjercicio: os.inicioEjercicio || "",
      finEjercicio: os.finEjercicio || ""
    }));
  } catch {
    return [...obrasSocialesDemo];
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
  const match = texto.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!match) return "";

  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const diasPorMes = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (mes < 1 || mes > 12) return "";
  if (dia < 1 || dia > diasPorMes[mes - 1]) return "";

  return `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}`;
}

function validarDiaMes(valor) {
  return normalizarDiaMes(valor) !== "";
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

    const bolsa = normalizar(`${os.rnos} ${os.denominacion} ${os.sigla}`);
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
      <td>${escaparHtml(mostrarDiaMes(os.inicioEjercicio))}</td>
      <td>${escaparHtml(mostrarDiaMes(os.finEjercicio))}</td>
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
  document.getElementById("os-rnos").value = os.rnos;
  document.getElementById("os-denominacion").value = os.denominacion;
  document.getElementById("os-sigla").value = os.sigla || "";
  document.getElementById("os-inicio-ejercicio").value = os.inicioEjercicio || "";
  document.getElementById("os-fin-ejercicio").value = os.finEjercicio || "";
  document.getElementById("os-estado").value = os.estado;
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
  let inicioEjercicio = document.getElementById("os-inicio-ejercicio").value.trim();
  let finEjercicio = document.getElementById("os-fin-ejercicio").value.trim();
  const estado = document.getElementById("os-estado").value;
  const observaciones = document.getElementById("os-observaciones").value.trim();

  if (!rnos || !denominacion || !inicioEjercicio || !finEjercicio) {
    mostrarMensajeFormulario("RNOS, Denominación, Inicio ejercicio y Fin ejercicio son obligatorios.");
    return;
  }

  if (!validarDiaMes(inicioEjercicio) || !validarDiaMes(finEjercicio)) {
    mostrarMensajeFormulario("Inicio ejercicio y Fin ejercicio deben tener formato DD/MM, por ejemplo 01/06 y 31/05.");
    return;
  }

  inicioEjercicio = normalizarDiaMes(inicioEjercicio);
  finEjercicio = normalizarDiaMes(finEjercicio);

  const duplicado = obrasSociales.some(os =>
    normalizar(os.rnos) === normalizar(rnos) && Number(os.id) !== id
  );

  if (duplicado) {
    mostrarMensajeFormulario("Ya existe una Obra Social con ese RNOS.");
    return;
  }

  if (id) {
    const index = obrasSociales.findIndex(os => Number(os.id) === id);
    if (index === -1) return;

    obrasSociales[index] = {
      ...obrasSociales[index],
      rnos,
      denominacion,
      sigla,
      inicioEjercicio,
      finEjercicio,
      estado,
      observaciones
    };
  } else {
    obrasSociales.push({
      id: siguienteId(),
      rnos,
      denominacion,
      sigla,
      inicioEjercicio,
      finEjercicio,
      estado,
      observaciones
    });
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

renderObrasSociales();


["os-inicio-ejercicio", "os-fin-ejercicio"].forEach(id => {
  const campo = document.getElementById(id);
  campo?.addEventListener("blur", () => {
    const normalizado = normalizarDiaMes(campo.value);
    if (normalizado) campo.value = normalizado;
  });
});
