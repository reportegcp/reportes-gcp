// =====================================================================
// Módulo Jurídico: Oficios (reemplaza la lista de Teams), Reclamos y Reportes.
// Depende de funciones globales de app.js (buildTableUrl, authHeaders,
// asegurarSesionVigente, fetchConTimeout, leerErrorApi, escaparHtml,
// formatearFecha, normalizar, paginarRegistros, renderPaginacion, abrirModal,
// cerrarModal, setFormMessage, mostrarToast, renderBarChart, etc.)
// =====================================================================

const JU_MOTIVOS = ["Medicación", "Discapacidad", "Prepagas", "Insumos", "PMO", "Internación geriátrica", "Leyes especiales", "Cirugia", "Estudios y prácticas", "Falta de Prestadores", "Fertilidad"];
const JU_AREAS = ["SAC", "SCEMPF", "GAJ", "GCEF", "SD"];
const JU_ESTADOS = ["En trámite", "Finalizado"];
const JU_SELECT = "*,oficio_demandados(obra_social_id,obras_sociales(id,denominacion,rnos,rnemp,tipo)),oficio_ingresos(*)";

let juOficios = [];
let juOficiosCargados = false;
let juOficiosCargando = null;
let juTab = "tramite";
let juPage = 1;
let juEventos = false;
let juPadron = [];
let juReporteDatos = null;
// Estado de la ficha abierta
let juFicha = null; // { id, demandados: [os], ingresos: [{...}], editando, nuevo }

// ---------------- API ----------------

async function juFetch(table, { method = "GET", params = {}, body, prefer } = {}) {
  const session = await asegurarSesionVigente();
  const headers = { ...authHeaders(session.access_token) };
  if (prefer) headers.Prefer = prefer;
  const response = await fetchConTimeout(buildTableUrl(table, params), {
    method, headers, cache: "no-store",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  }, 20000);
  if (!response.ok) throw new Error((await leerErrorApi(response)) || `Supabase respondió ${response.status}.`);
  if (method === "DELETE" || response.status === 204) return null;
  const texto = await response.text();
  return texto ? JSON.parse(texto) : null;
}

function juPreparar(o) {
  const ingresos = [...(o.oficio_ingresos || [])].sort((a, b) => String(a.fecha_ingreso).localeCompare(String(b.fecha_ingreso)) || a.id - b.id);
  const demandados = (o.oficio_demandados || []).map(d => d.obras_sociales).filter(Boolean)
    .sort((a, b) => String(a.denominacion).localeCompare(String(b.denominacion), "es"));
  const ultimo = ingresos[ingresos.length - 1] || {};
  return { ...o, ingresos, demandados, ultimo, estado: ultimo.estado || "En trámite" };
}

async function juCargarOficios(forzar = false) {
  if (juOficiosCargados && !forzar) return juOficios;
  if (juOficiosCargando && !forzar) return juOficiosCargando;
  juOficiosCargando = (async () => {
    let todos = [];
    for (let offset = 0; ; offset += 1000) {
      const filas = await juFetch("oficios", { params: { select: JU_SELECT, order: "id.desc", limit: 1000, offset } });
      todos = todos.concat(filas || []);
      if (!filas || filas.length < 1000) break;
    }
    juOficios = todos.map(juPreparar);
    juOficiosCargados = true;
    return juOficios;
  })();
  try { return await juOficiosCargando; } finally { juOficiosCargando = null; }
}

async function juRecargarOficio(id) {
  const [fila] = await juFetch("oficios", { params: { select: JU_SELECT, id: `eq.${id}` } });
  const o = juPreparar(fila);
  const idx = juOficios.findIndex(x => String(x.id) === String(id));
  if (idx >= 0) juOficios[idx] = o; else juOficios.unshift(o);
  return o;
}

async function juAsegurarPadron() {
  await asegurarObrasSocialesTodasCargadas();
  juPadron = obrasSocialesTodas
    .filter(o => o.rnos || o.rnemp)
    .map(o => ({ ...o, _busqueda: normalizar(`${o.denominacion} ${o.rnos || ""} ${o.rnemp || ""}`) }));
}

function juCodigoDe(os) {
  if (!os) return "";
  return os.rnos ? `RNAS ${os.rnos}` : os.rnemp ? `RNEMP ${os.rnemp}` : "";
}

function juClaveEe(ee) {
  return String(ee || "").replace(/\s+/g, "").toUpperCase();
}

// ---------------- Cálculos ----------------

function juHoyIso() {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`;
}

function juDiasEntre(desde, hasta) {
  if (!desde || !hasta) return null;
  return Math.round((new Date(`${hasta}T00:00:00`) - new Date(`${desde}T00:00:00`)) / 86400000);
}

function juTrimestre(fecha) {
  if (!fecha) return "";
  const [a, m] = fecha.split("-").map(Number);
  return `${Math.ceil(m / 3)}º trimestre ${a}`;
}

function juClaveTrimestre(fecha) {
  if (!fecha) return "";
  const [a, m] = fecha.split("-").map(Number);
  return `${a}-${Math.ceil(m / 3)}`;
}

function juDemandado(o) {
  const nombres = [...new Set((o.demandados || []).map(d => d.denominacion))];
  if (o.otros_demandados) nombres.push(o.otros_demandados);
  return nombres.join(" · ");
}

function juDiasRespuesta(ing) {
  return ing.fecha_egreso ? juDiasEntre(ing.fecha_ingreso, ing.fecha_egreso) : null;
}

function juSemaforo(ing) {
  if (ing.estado === "Finalizado" || !ing.fecha_vencimiento) return "";
  const dias = juDiasEntre(juHoyIso(), ing.fecha_vencimiento);
  if (dias < 0) return "vencido";
  if (dias <= 2) return "por-vencer";
  return "en-plazo";
}

function juMediana(valores) {
  const v = valores.filter(x => Number.isFinite(x) && x >= 0).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : Math.round((v[m - 1] + v[m]) / 2);
}

function juPromedio(valores) {
  const v = valores.filter(x => Number.isFinite(x) && x >= 0);
  return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : null;
}

// ---------------- Inicialización ----------------

function inicializarVistaJuridico(vista) {
  if (!juEventos) juVincularEventos();
  if (vista === "ju-oficios") juMostrarOficios();
  if (vista === "ju-reclamos") reMostrarReclamos();
  if (vista === "ju-reportes") juMostrarReportes();
}

function juVincularEventos() {
  juEventos = true;
  const on = (id, ev, fn) => document.getElementById(id)?.addEventListener(ev, fn);
  on("ju-btn-nuevo", "click", () => requiereAutenticacion(() => juAbrirFicha(null)));
  on("ju-exportar", "click", juExportarListado);
  // El buscador re-renderiza al escribir; los filtros, al cambiar. (Escuchar "change" en el buscador
  // re-dibujaba la tabla al hacer clic en una fila y el clic se perdía.)
  on("ju-search", "input", () => { juPage = 1; juRenderOficios(); });
  ["ju-motivo-filter", "ju-analista-filter", "ju-area-filter", "ju-trimestre-filter"].forEach(id => {
    on(id, "change", () => { juPage = 1; juRenderOficios(); });
  });
  document.querySelectorAll("[data-ju-tab]").forEach(btn => btn.addEventListener("click", () => {
    juTab = btn.dataset.juTab; juPage = 1;
    document.querySelectorAll("[data-ju-tab]").forEach(b => b.classList.toggle("active", b === btn));
    juRenderOficios();
  }));
  on("ju-form", "submit", juGuardar);
  on("ju-eliminar", "click", juEliminar);
  on("ju-editar", "click", () => juSetEditando(true));
  on("ju-cancelar", "click", juCerrarFicha);
  on("ju-reingreso-btn", "click", juAgregarReingreso);
  on("ju-ee", "input", juVerificarEe);
  on("ju-dem-buscar", "input", juRenderBusquedaDemandados);
  on("ju-dem-buscar", "focus", juRenderBusquedaDemandados);
  on("ju-dem-buscar", "keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); document.querySelector("#ju-dem-lista [data-os-id]")?.click(); }
    if (e.key === "Escape") document.getElementById("ju-dem-lista").hidden = true;
  });
  document.addEventListener("click", e => {
    if (!e.target.closest(".ju-combo")) { const l = document.getElementById("ju-dem-lista"); if (l) l.hidden = true; }
  });
  document.querySelector('#ju-modal [data-close-modal="ju-modal"]')?.addEventListener("click", () => { juFicha = null; });
  jrVincularEventos();
  on("ju-rep-exportar", "click", juExportarReporte);
  on("ju-rep-imprimir", "click", () => window.print());
}

// ---------------- Oficios: listado ----------------

async function juMostrarOficios() {
  const count = document.getElementById("ju-count");
  if (!juOficiosCargados && count) count.textContent = "Cargando oficios...";
  try {
    await Promise.all([juCargarOficios(), juAsegurarPadron()]);
    juLlenarFiltros();
    juRenderOficios();
  } catch (error) {
    if (count) count.textContent = `No se pudieron cargar los oficios. ${error.message || ""}`;
    console.error(error);
  }
}

function juTodosLosIngresos() {
  return juOficios.flatMap(o => o.ingresos.map(i => ({ ...i, oficio: o })));
}

function juLlenarFiltros() {
  const llenar = (id, etiqueta, valores) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const actual = sel.value;
    sel.innerHTML = `<option value="">${etiqueta}</option>` + valores.map(v => `<option value="${escaparHtml(v.valor)}">${escaparHtml(v.texto)}</option>`).join("");
    if ([...sel.options].some(o => o.value === actual)) sel.value = actual;
  };
  const ingresos = juTodosLosIngresos();
  const unicos = (lista, campo) => [...new Set(lista.map(x => x[campo]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  llenar("ju-motivo-filter", "Motivo: Todos", [...new Set([...JU_MOTIVOS, ...unicos(juOficios, "motivo")])].map(v => ({ valor: v, texto: v })));
  const analistas = unicos(ingresos, "analista");
  llenar("ju-analista-filter", "Analista: Todos", analistas.map(v => ({ valor: v, texto: v })));
  llenar("ju-area-filter", "Área de salida: Todas", [...new Set([...JU_AREAS, ...unicos(ingresos, "area_salida")])].map(v => ({ valor: v, texto: v })));
  const trimestres = [...new Map(ingresos.filter(i => i.fecha_ingreso).map(i => [juClaveTrimestre(i.fecha_ingreso), juTrimestre(i.fecha_ingreso)])).entries()]
    .sort((a, b) => b[0].localeCompare(a[0]));
  llenar("ju-trimestre-filter", "Trimestre: Todos", trimestres.map(([valor, texto]) => ({ valor, texto })));
  const dl = document.getElementById("ju-analistas-datalist");
  if (dl) dl.innerHTML = analistas.map(v => `<option value="${escaparHtml(v)}"></option>`).join("");
}

function juOficiosFiltrados() {
  const q = normalizar(document.getElementById("ju-search")?.value || "");
  const qEe = juClaveEe(document.getElementById("ju-search")?.value || "");
  const motivo = document.getElementById("ju-motivo-filter")?.value || "";
  const analista = document.getElementById("ju-analista-filter")?.value || "";
  const area = document.getElementById("ju-area-filter")?.value || "";
  const trimestre = document.getElementById("ju-trimestre-filter")?.value || "";
  return juOficios.filter(o =>
    (juTab === "todos" || (juTab === "tramite" ? o.estado !== "Finalizado" : o.estado === "Finalizado")) &&
    (!motivo || o.motivo === motivo) &&
    (!analista || o.ultimo.analista === analista) &&
    (!area || o.ultimo.area_salida === area) &&
    (!trimestre || o.ingresos.some(i => juClaveTrimestre(i.fecha_ingreso) === trimestre)) &&
    (!q || juClaveEe(o.numero_ee).includes(qEe) ||
      [o.caratula, o.juzgado, o.otros_demandados, ...o.ingresos.map(i => i.descripcion), ...o.demandados.flatMap(d => [d.denominacion, d.rnos, d.rnemp])]
        .some(v => normalizar(v).includes(q)))
  );
}

function juRenderOficios() {
  const tbody = document.getElementById("ju-table-body");
  if (!tbody) return;
  const filas = juOficiosFiltrados().sort((a, b) => juTab === "tramite"
    ? String(a.ultimo.fecha_ingreso).localeCompare(String(b.ultimo.fecha_ingreso))
    : String(b.ultimo.fecha_ingreso).localeCompare(String(a.ultimo.fecha_ingreso)));
  const pageInfo = paginarRegistros(filas, juPage);
  juPage = pageInfo.page;
  tbody.innerHTML = pageInfo.items.map(o => {
    const u = o.ultimo;
    const sem = juSemaforo(u);
    const fecha2 = o.estado === "Finalizado"
      ? formatearFecha(u.fecha_egreso)
      : (u.fecha_vencimiento ? `<span class="ju-venc ${sem}">${formatearFecha(u.fecha_vencimiento)}</span>` : "—");
    const demandado = juDemandado(o);
    return `<tr class="os-row" data-ju-id="${o.id}" tabindex="0" role="button" title="Clic para abrir">
      <td class="date-cell">${formatearFecha(u.fecha_ingreso)}${o.ingresos.length > 1 ? `<br><span class="ju-tag" title="Ingresó ${o.ingresos.length} veces">Reingreso</span>` : ""}</td>
      <td class="ju-ee">${escaparHtml(o.numero_ee || "—")}</td>
      <td class="ellipsis-cell" style="max-width:340px" title="${escaparHtml(o.caratula || "")}">${escaparHtml(o.caratula || "—")}</td>
      <td class="ellipsis-cell" style="max-width:260px" title="${escaparHtml(demandado)}">${escaparHtml(demandado || "—")}</td>
      <td class="date-cell">${fecha2}</td>
      <td><span class="ju-estado ${o.estado === "Finalizado" ? "fin" : "tram"}">${escaparHtml(o.estado)}</span></td>
    </tr>`;
  }).join("");
  const thFecha = document.getElementById("ju-th-fecha2");
  if (thFecha) thFecha.textContent = juTab === "tramite" ? "Vencimiento" : juTab === "finalizados" ? "Egreso" : "Egreso / Venc.";
  const count = document.getElementById("ju-count");
  if (count) count.textContent = `${filas.length} oficio${filas.length === 1 ? "" : "s"}${pageInfo.totalPages > 1 ? ` · Página ${pageInfo.page} de ${pageInfo.totalPages}` : ""}`;
  document.getElementById("ju-empty").hidden = filas.length !== 0;
  renderPaginacion("ju-pagination", pageInfo, page => { juPage = page; juRenderOficios(); });
  tbody.querySelectorAll("[data-ju-id]").forEach(row => {
    const abrir = () => requiereAutenticacion(() => juAbrirFicha(row.dataset.juId));
    row.addEventListener("click", abrir);
    row.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(); } });
  });
}

function juExportarListado() {
  const filas = juOficiosFiltrados();
  const codigos = (o, campo) => o.demandados.map(d => d[campo]).filter(Boolean).join(" / ");
  const aoa = [["Nº EE", "Carátula", "Demandados", "RNAS", "RNEMP", "Otros demandados", "Juzgado / Sala", "Motivo", "Ingresos", "Último ingreso", "Vencimiento", "Egreso", "Área de salida", "Analista", "Estado", "Días de respuesta", "Descripción"]];
  filas.forEach(o => {
    const u = o.ultimo;
    aoa.push([o.numero_ee || "", o.caratula || "", o.demandados.map(d => d.denominacion).join(" / "), codigos(o, "rnos"), codigos(o, "rnemp"),
      o.otros_demandados || "", o.juzgado || "", o.motivo || "", o.ingresos.length, formatearFecha(u.fecha_ingreso),
      u.fecha_vencimiento ? formatearFecha(u.fecha_vencimiento) : "", u.fecha_egreso ? formatearFecha(u.fecha_egreso) : "",
      u.area_salida || "", u.analista || "", o.estado, juDiasRespuesta(u) ?? "", u.descripcion || ""]);
  });
  const det = [["Nº EE", "Nº de ingreso", "Fecha ingreso", "Vencimiento", "Egreso", "Días de respuesta", "Área de salida", "Analista", "Estado", "Descripción"]];
  filas.forEach(o => o.ingresos.forEach((i, n) => det.push([o.numero_ee || "", n + 1, formatearFecha(i.fecha_ingreso), i.fecha_vencimiento ? formatearFecha(i.fecha_vencimiento) : "",
    i.fecha_egreso ? formatearFecha(i.fecha_egreso) : "", juDiasRespuesta(i) ?? "", i.area_salida || "", i.analista || "", i.estado, i.descripcion || ""])));
  const libro = window.XLSX.utils.book_new();
  const hoja = window.XLSX.utils.aoa_to_sheet(aoa);
  hoja["!cols"] = [32, 60, 45, 14, 14, 30, 40, 20, 9, 13, 12, 12, 10, 14, 12, 10, 50].map(wch => ({ wch }));
  hoja["!autofilter"] = { ref: `A1:Q${aoa.length}` };
  window.XLSX.utils.book_append_sheet(libro, hoja, "Oficios");
  const hojaDet = window.XLSX.utils.aoa_to_sheet(det);
  hojaDet["!cols"] = [32, 8, 13, 12, 12, 10, 10, 14, 12, 50].map(wch => ({ wch }));
  window.XLSX.utils.book_append_sheet(libro, hojaDet, "Ingresos");
  window.XLSX.writeFile(libro, `oficios_${juHoyIso()}.xlsx`);
}

// ---------------- Oficios: ficha ----------------

function juIngresoVacio() {
  return { id: null, fecha_ingreso: juHoyIso(), fecha_vencimiento: "", fecha_egreso: "", area_salida: "SAC", analista: "", descripcion: "", estado: "En trámite" };
}

async function juAbrirFicha(id, { conReingreso = false } = {}) {
  await juAsegurarPadron();
  const o = id ? juOficios.find(x => String(x.id) === String(id)) : null;
  document.getElementById("ju-form").reset();
  setFormMessage("ju-message");
  document.getElementById("ju-ee-aviso").hidden = true;
  document.getElementById("ju-id").value = o?.id || "";
  document.getElementById("ju-ee").value = o?.numero_ee || "";
  document.getElementById("ju-motivo").value = o?.motivo || "";
  document.getElementById("ju-caratula").value = o?.caratula || "";
  document.getElementById("ju-otros").value = o?.otros_demandados || "";
  document.getElementById("ju-juzgado").value = o?.juzgado || "";
  document.getElementById("ju-dem-buscar").value = "";
  juFicha = {
    id: o?.id || null,
    nuevo: !o,
    demandados: [...(o?.demandados || [])],
    ingresos: o ? o.ingresos.map(i => ({ ...i })) : [juIngresoVacio()]
  };
  document.getElementById("ju-modal-title").textContent = o ? (o.numero_ee || "Oficio sin Nº EE") : "Nuevo oficio";
  document.getElementById("ju-modal-sub").textContent = o
    ? `${o.ingresos.length === 1 ? "1 ingreso" : `${o.ingresos.length} ingresos`} · ${o.estado}${o.origen === "teams" ? " · importado de Teams" : ""}` : "";
  const esAdmin = ["administrador", "admin"].includes(normalizarPerfilAcceso(perfilSesionActual()));
  document.getElementById("ju-eliminar").hidden = !(o && esAdmin);
  juRenderChips();
  juRenderIngresos();
  juSetEditando(!o);
  abrirModal("ju-modal");
  if (conReingreso) juAgregarReingreso();
  else if (!o) setTimeout(() => document.getElementById("ju-ee")?.focus(), 0);
}

function juCerrarFicha() {
  juFicha = null;
  cerrarModal("ju-modal");
}

function juSetEditando(editando) {
  if (!juFicha) return;
  if (editando) juLeerIngresosDelDom();
  juFicha.editando = editando;
  document.getElementById("ju-fieldset").disabled = !editando;
  document.getElementById("ju-form").classList.toggle("ju-solo-lectura", !editando);
  document.getElementById("ju-guardar").hidden = !editando;
  document.getElementById("ju-editar").hidden = editando;
  document.getElementById("ju-reingreso-btn").hidden = juFicha.nuevo;
  document.getElementById("ju-cancelar").textContent = editando && !juFicha.nuevo ? "Cancelar" : "Cerrar";
  document.querySelector("#ju-dem-buscar").closest(".ju-combo").hidden = !editando;
  juRenderChips();
  juRenderIngresos();
}

// --- Demandados ---

function juRenderChips() {
  const cont = document.getElementById("ju-chips");
  if (!cont || !juFicha) return;
  cont.innerHTML = juFicha.demandados.map(d => `<span class="ju-chip" title="${escaparHtml(d.tipo || "")}">
      <strong>${escaparHtml(d.denominacion)}</strong><small>${escaparHtml(juCodigoDe(d))}</small>
      ${juFicha.editando ? `<button type="button" data-quitar-os="${d.id}" aria-label="Quitar">×</button>` : ""}
    </span>`).join("") || `<span class="ju-sin-dato">Sin demandados cargados</span>`;
  cont.querySelectorAll("[data-quitar-os]").forEach(b => b.addEventListener("click", () => {
    juFicha.demandados = juFicha.demandados.filter(d => String(d.id) !== b.dataset.quitarOs);
    juRenderChips();
  }));
}

function juRenderBusquedaDemandados() {
  const input = document.getElementById("ju-dem-buscar");
  const lista = document.getElementById("ju-dem-lista");
  if (!juFicha?.editando) { lista.hidden = true; return; }
  const q = normalizar(input.value.trim());
  if (q.length < 2) { lista.innerHTML = `<div class="ju-combo-vacio">Escribí al menos 2 letras o números...</div>`; lista.hidden = false; return; }
  const ya = new Set(juFicha.demandados.map(d => String(d.id)));
  const palabras = q.split(/\s+/);
  const inactiva = o => String(o.estado || "").toUpperCase() === "INACTIVA";
  const res = juPadron.filter(o => !ya.has(String(o.id)) && palabras.every(p => o._busqueda.includes(p)))
    .sort((a, b) => inactiva(a) - inactiva(b)).slice(0, 25);
  lista.innerHTML = res.map(o => `<button type="button" class="ju-combo-item" data-os-id="${o.id}">
      <span>${escaparHtml(o.denominacion)}</span><small>${escaparHtml(juCodigoDe(o))} · ${o.rnos ? "Obra Social" : "Prepaga"}${inactiva(o) ? " · inactiva" : ""}</small>
    </button>`).join("") || `<div class="ju-combo-vacio">No hay coincidencias en el padrón.</div>`;
  lista.hidden = false;
  lista.querySelectorAll("[data-os-id]").forEach(b => b.addEventListener("click", () => {
    const os = juPadron.find(o => String(o.id) === b.dataset.osId);
    if (os) juFicha.demandados.push(os);
    input.value = "";
    lista.hidden = true;
    juRenderChips();
    input.focus();
  }));
}

// --- Nº EE: un expediente se carga una sola vez ---

function juVerificarEe() {
  const aviso = document.getElementById("ju-ee-aviso");
  if (!juFicha) return null;
  const clave = juClaveEe(document.getElementById("ju-ee").value);
  const previo = clave ? juOficios.find(o => juClaveEe(o.numero_ee) === clave && String(o.id) !== String(juFicha.id)) : null;
  if (!previo) { aviso.hidden = true; return null; }
  aviso.innerHTML = `Este expediente ya está cargado (último ingreso ${formatearFecha(previo.ultimo.fecha_ingreso)}, ${escaparHtml(previo.estado.toLowerCase())}). No se puede cargar dos veces: si volvió a ingresar, registrá el reingreso en ese mismo oficio.
    <button type="button" class="primary small" id="ju-ir-reingreso">Abrir y registrar reingreso</button>`;
  aviso.hidden = false;
  document.getElementById("ju-ir-reingreso").addEventListener("click", () => juAbrirFicha(previo.id, { conReingreso: true }));
  return previo;
}

// --- Ingresos ---

function juLeerIngresosDelDom() {
  if (!juFicha) return;
  document.querySelectorAll("[data-ing-idx]").forEach(card => {
    const ing = juFicha.ingresos[Number(card.dataset.ingIdx)];
    if (!ing) return;
    card.querySelectorAll("[data-campo]").forEach(el => { ing[el.dataset.campo] = el.value; });
  });
}

function juRenderIngresos() {
  const cont = document.getElementById("ju-ingresos");
  if (!cont || !juFicha) return;
  const ed = juFicha.editando;
  const esAdmin = ["administrador", "admin"].includes(normalizarPerfilAcceso(perfilSesionActual()));
  const opciones = (lista, valor) => lista.map(v => `<option ${v === valor ? "selected" : ""}>${escaparHtml(v)}</option>`).join("");
  cont.innerHTML = juFicha.ingresos.map((i, idx) => {
    const titulo = idx === 0 ? "1º ingreso" : `Reingreso (${idx + 1}º ingreso)`;
    const dias = juDiasRespuesta(i);
    const quitar = ed && idx > 0 && (!i.id || esAdmin) ? `<button type="button" class="ju-link-danger" data-quitar-ing="${idx}">Quitar</button>` : "";
    return `<div class="ju-ingreso ${idx > 0 ? "es-reingreso" : ""}" data-ing-idx="${idx}">
      <div class="ju-ingreso-cab"><strong>${titulo}</strong><span>${i.estado === "Finalizado" ? `Finalizado${dias != null ? ` · ${dias} día${dias === 1 ? "" : "s"} de respuesta` : ""}` : "En trámite"}</span>${quitar}</div>
      <div class="ju-ingreso-grid">
        <label><span>Fecha de ingreso *</span><input type="date" data-campo="fecha_ingreso" value="${escaparHtml(i.fecha_ingreso || "")}" required></label>
        <label><span>Vencimiento</span><input type="date" data-campo="fecha_vencimiento" value="${escaparHtml(i.fecha_vencimiento || "")}"></label>
        <label><span>Analista</span><input data-campo="analista" list="ju-analistas-datalist" value="${escaparHtml(i.analista || "")}"></label>
        <label><span>Estado</span><select data-campo="estado">${opciones(JU_ESTADOS, i.estado)}</select></label>
        <label><span>Fecha de egreso</span><input type="date" data-campo="fecha_egreso" value="${escaparHtml(i.fecha_egreso || "")}"></label>
        <label><span>Área de salida</span><select data-campo="area_salida"><option value=""></option>${opciones(JU_AREAS, i.area_salida)}</select></label>
        <label class="ju-ingreso-desc"><span>Descripción</span><input data-campo="descripcion" value="${escaparHtml(i.descripcion || "")}" placeholder="Medicamento, insumo o prestación que se reclama"></label>
      </div>
    </div>`;
  }).join("");
  cont.querySelectorAll("[data-ing-idx]").forEach(card => {
    const egreso = card.querySelector('[data-campo="fecha_egreso"]');
    const estado = card.querySelector('[data-campo="estado"]');
    egreso.addEventListener("change", () => { if (egreso.value) estado.value = "Finalizado"; });
    estado.addEventListener("change", () => { if (estado.value === "Finalizado" && !egreso.value) egreso.value = juHoyIso(); if (estado.value === "En trámite") egreso.value = ""; });
  });
  cont.querySelectorAll("[data-quitar-ing]").forEach(b => b.addEventListener("click", () => {
    juLeerIngresosDelDom();
    const idx = Number(b.dataset.quitarIng);
    const ing = juFicha.ingresos[idx];
    if (ing.id && !window.confirm("¿Quitar este reingreso? Se borra al guardar.")) return;
    if (ing.id) (juFicha.borrarIngresos ||= []).push(ing.id);
    juFicha.ingresos.splice(idx, 1);
    juRenderIngresos();
  }));
}

function juAgregarReingreso() {
  if (!juFicha) return;
  if (!juFicha.editando) juSetEditando(true);
  juLeerIngresosDelDom();
  const ultimo = juFicha.ingresos[juFicha.ingresos.length - 1];
  if (ultimo && !ultimo.id) { mostrarToast("Ya hay un reingreso nuevo sin guardar.", "error"); return; }
  juFicha.ingresos.push({ ...juIngresoVacio(), analista: ultimo?.analista || "" });
  juRenderIngresos();
  const cards = document.querySelectorAll("[data-ing-idx]");
  cards[cards.length - 1]?.scrollIntoView({ behavior: "smooth", block: "center" });
  cards[cards.length - 1]?.querySelector('[data-campo="fecha_ingreso"]')?.focus();
}

// --- Guardar ---

async function juGuardar(event) {
  event.preventDefault();
  if (!juFicha?.editando) return;
  juLeerIngresosDelDom();
  const val = id => document.getElementById(id)?.value.trim() || "";
  if (juVerificarEe()) { setFormMessage("ju-message", "Ese Nº EE ya está cargado. Abrí el oficio existente para registrar el reingreso."); return; }
  if (!val("ju-ee")) { setFormMessage("ju-message", "El Nº EE es obligatorio."); return; }
  for (const [n, i] of juFicha.ingresos.entries()) {
    const nombre = n === 0 ? "el 1º ingreso" : `el ${n + 1}º ingreso`;
    if (!i.fecha_ingreso) { setFormMessage("ju-message", `Falta la fecha de ingreso en ${nombre}.`); return; }
    if (i.fecha_egreso && i.fecha_egreso < i.fecha_ingreso) { setFormMessage("ju-message", `En ${nombre}, la fecha de egreso es anterior a la de ingreso.`); return; }
    if (n > 0 && i.fecha_ingreso < juFicha.ingresos[n - 1].fecha_ingreso) { setFormMessage("ju-message", `La fecha de ${nombre} es anterior al ingreso previo.`); return; }
    if (i.fecha_egreso) i.estado = "Finalizado";
  }
  const datos = {
    numero_ee: val("ju-ee"),
    caratula: val("ju-caratula") || null,
    otros_demandados: val("ju-otros") || null,
    juzgado: val("ju-juzgado") || null,
    motivo: val("ju-motivo") || null
  };
  const boton = document.getElementById("ju-guardar");
  boton.disabled = true;
  try {
    let id = juFicha.id;
    if (id) {
      await juFetch("oficios", { method: "PATCH", params: { id: `eq.${id}` }, body: datos, prefer: "return=minimal" });
    } else {
      const [fila] = await juFetch("oficios", { method: "POST", params: { select: "id" }, body: datos, prefer: "return=representation" });
      id = fila.id;
    }
    // Demandados: reemplazar la lista
    const original = new Set((juOficios.find(o => String(o.id) === String(id))?.demandados || []).map(d => String(d.id)));
    const actual = new Set(juFicha.demandados.map(d => String(d.id)));
    const quitar = [...original].filter(x => !actual.has(x));
    const agregar = [...actual].filter(x => !original.has(x));
    if (quitar.length) await juFetch("oficio_demandados", { method: "DELETE", params: { oficio_id: `eq.${id}`, obra_social_id: `in.(${quitar.join(",")})` } });
    if (agregar.length) await juFetch("oficio_demandados", { method: "POST", body: agregar.map(x => ({ oficio_id: id, obra_social_id: Number(x) })), prefer: "return=minimal" });
    // Ingresos
    for (const borrar of juFicha.borrarIngresos || []) await juFetch("oficio_ingresos", { method: "DELETE", params: { id: `eq.${borrar}` } });
    for (const i of juFicha.ingresos) {
      const fila = {
        fecha_ingreso: i.fecha_ingreso, fecha_vencimiento: i.fecha_vencimiento || null, fecha_egreso: i.fecha_egreso || null,
        area_salida: i.area_salida || null, analista: (i.analista || "").trim() || null, descripcion: (i.descripcion || "").trim() || null, estado: i.estado || "En trámite"
      };
      if (i.id) await juFetch("oficio_ingresos", { method: "PATCH", params: { id: `eq.${i.id}` }, body: fila, prefer: "return=minimal" });
      else await juFetch("oficio_ingresos", { method: "POST", body: { ...fila, oficio_id: id }, prefer: "return=minimal" });
    }
    await juRecargarOficio(id);
    const eraNuevo = juFicha.nuevo;
    mostrarToast(eraNuevo ? "Oficio cargado." : "Cambios guardados.");
    juLlenarFiltros();
    juRenderOficios();
    juReporteDatos = null;
    juAbrirFicha(id);
  } catch (error) {
    const msg = String(error.message || "");
    setFormMessage("ju-message", /oficios_numero_ee_unico|duplicate key/i.test(msg)
      ? "Ese Nº EE ya está cargado en otro oficio."
      : `No se pudo guardar. ${msg}`);
  } finally {
    boton.disabled = false;
  }
}

async function juEliminar() {
  const id = document.getElementById("ju-id").value;
  if (!id || !window.confirm("¿Eliminar este oficio con todos sus ingresos? No se puede deshacer.")) return;
  try {
    await juFetch("oficios", { method: "DELETE", params: { id: `eq.${id}` } });
    juOficios = juOficios.filter(o => String(o.id) !== String(id));
    juCerrarFicha();
    mostrarToast("Oficio eliminado.");
    juRenderOficios();
  } catch (error) {
    setFormMessage("ju-message", `No se pudo eliminar. ${error.message || ""}`);
  }
}

// =====================================================================
// Reclamos (reemplaza la lista de Teams). Misma lógica que Oficios:
// un reclamo por Nº EE, con su historial de ingresos y sus demandados.
// =====================================================================

const RE_SELECT = "*,reclamo_demandados(obra_social_id,obras_sociales(id,denominacion,rnos,rnemp,tipo,estado)),reclamo_ingresos(*)";
const RE_ESTADOS = ["Asignado", "Devuelto", "Finalizado"];
const RE_TIPOS = ["PMO SI", "PMO NO", "LEYES ESPECIALES", "DISCAPACIDAD", "COSEGUROS", "ODONTOLOGIA", "DENTRO DE CARTILLA", "FUERA DE CARTILLA"];
const RE_AREAS = ["SAL", "GAJ", "SD", "SGSUSS", "GDYAISS", "DUSS", "SAUSS", "GAYSUSS", "SAISS", "GGE", "SG", "GCEF", "GEF", "SAC"];

let reReclamos = [];
let reCargados = false;
let reCargando = null;
let reTab = "Asignado";
let rePage = 1;
let reEventos = false;
let reFicha = null;

function rePreparar(r) {
  const ingresos = [...(r.reclamo_ingresos || [])].sort((a, b) => String(a.fecha_ingreso || "").localeCompare(String(b.fecha_ingreso || "")) || a.id - b.id);
  const demandados = (r.reclamo_demandados || []).map(d => d.obras_sociales).filter(Boolean)
    .sort((a, b) => String(a.denominacion).localeCompare(String(b.denominacion), "es"));
  const ultimo = ingresos[ingresos.length - 1] || {};
  return { ...r, ingresos, demandados, ultimo, estado: ultimo.estado || "Asignado" };
}

async function reCargarReclamos(forzar = false) {
  if (reCargados && !forzar) return reReclamos;
  if (reCargando && !forzar) return reCargando;
  reCargando = (async () => {
    let todos = [];
    for (let offset = 0; ; offset += 1000) {
      const filas = await juFetch("reclamos", { params: { select: RE_SELECT, order: "id.desc", limit: 1000, offset } });
      todos = todos.concat(filas || []);
      if (!filas || filas.length < 1000) break;
    }
    reReclamos = todos.map(rePreparar);
    reCargados = true;
    return reReclamos;
  })();
  try { return await reCargando; } finally { reCargando = null; }
}

async function reRecargarReclamo(id) {
  const [fila] = await juFetch("reclamos", { params: { select: RE_SELECT, id: `eq.${id}` } });
  const r = rePreparar(fila);
  const idx = reReclamos.findIndex(x => String(x.id) === String(id));
  if (idx >= 0) reReclamos[idx] = r; else reReclamos.unshift(r);
  return r;
}

function reTodosLosIngresos() {
  return reReclamos.flatMap(r => r.ingresos.map(i => ({ ...i, reclamo: r })));
}

function reMayus(v) {
  return String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/\s+/g, " ").trim();
}

// ---------------- Eventos ----------------

function reVincularEventos() {
  reEventos = true;
  const on = (id, ev, fn) => document.getElementById(id)?.addEventListener(ev, fn);
  on("re-btn-nuevo", "click", () => requiereAutenticacion(() => reAbrirFicha(null)));
  on("re-exportar", "click", reExportarListado);
  on("re-search", "input", () => { rePage = 1; reRenderReclamos(); });
  ["re-tipo-filter", "re-tema-filter", "re-analista-filter", "re-envia-filter", "re-trimestre-filter"].forEach(id => on(id, "change", () => { rePage = 1; reRenderReclamos(); }));
  document.querySelectorAll("[data-re-tab]").forEach(btn => btn.addEventListener("click", () => {
    reTab = btn.dataset.reTab; rePage = 1;
    document.querySelectorAll("[data-re-tab]").forEach(b => b.classList.toggle("active", b === btn));
    reRenderReclamos();
  }));
  on("re-form", "submit", reGuardar);
  on("re-eliminar", "click", reEliminar);
  on("re-editar", "click", () => reSetEditando(true));
  on("re-cancelar", "click", reCerrarFicha);
  on("re-reingreso-btn", "click", reAgregarReingreso);
  on("re-ee", "input", reVerificarEe);
  on("re-dem-buscar", "input", reRenderBusquedaDemandados);
  on("re-dem-buscar", "focus", reRenderBusquedaDemandados);
  on("re-dem-buscar", "keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); document.querySelector("#re-dem-lista [data-os-id]")?.click(); }
    if (e.key === "Escape") document.getElementById("re-dem-lista").hidden = true;
  });
  document.addEventListener("click", e => {
    if (!e.target.closest(".ju-combo")) { const l = document.getElementById("re-dem-lista"); if (l) l.hidden = true; }
  });
  document.querySelector('#re-modal [data-close-modal="re-modal"]')?.addEventListener("click", () => { reFicha = null; });
}

// ---------------- Listado ----------------

async function reMostrarReclamos() {
  if (!reEventos) reVincularEventos();
  const count = document.getElementById("re-count");
  if (!reCargados && count) count.textContent = "Cargando reclamos...";
  try {
    await Promise.all([reCargarReclamos(), juAsegurarPadron()]);
    reLlenarFiltros();
    reRenderReclamos();
  } catch (error) {
    if (count) count.textContent = `No se pudieron cargar los reclamos. ${error.message || ""}`;
    console.error(error);
  }
}

function reLlenarFiltros() {
  const llenar = (id, etiqueta, valores) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const actual = sel.value;
    sel.innerHTML = `<option value="">${etiqueta}</option>` + valores.map(v => `<option value="${escaparHtml(v.valor)}">${escaparHtml(v.texto)}</option>`).join("");
    if ([...sel.options].some(o => o.value === actual)) sel.value = actual;
  };
  const ingresos = reTodosLosIngresos();
  const unicos = (lista, campo) => [...new Set(lista.map(x => x[campo]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  const tipos = [...new Set([...RE_TIPOS, ...unicos(reReclamos, "tipo_reclamo")])];
  const temas = unicos(reReclamos, "tema");
  const analistas = unicos(ingresos, "analista");
  llenar("re-tipo-filter", "Tipo: Todos", tipos.map(v => ({ valor: v, texto: v })));
  llenar("re-tema-filter", "Tema: Todos", temas.map(v => ({ valor: v, texto: v })));
  llenar("re-analista-filter", "Analista: Todos", analistas.map(v => ({ valor: v, texto: v })));
  llenar("re-envia-filter", "Área que envía: Todas", [...new Set([...RE_AREAS, ...unicos(ingresos, "area_envia")])].map(v => ({ valor: v, texto: v })));
  const trimestres = [...new Map(ingresos.filter(i => i.fecha_ingreso).map(i => [juClaveTrimestre(i.fecha_ingreso), juTrimestre(i.fecha_ingreso)])).entries()]
    .sort((a, b) => b[0].localeCompare(a[0]));
  llenar("re-trimestre-filter", "Trimestre: Todos", trimestres.map(([valor, texto]) => ({ valor, texto })));
  const setDl = (id, vals) => { const dl = document.getElementById(id); if (dl) dl.innerHTML = vals.map(v => `<option value="${escaparHtml(v)}"></option>`).join(""); };
  setDl("re-analistas-datalist", analistas);
  setDl("re-temas-datalist", temas);
  setDl("re-areas-datalist", [...new Set([...RE_AREAS, ...unicos(ingresos, "area_envia"), ...unicos(ingresos, "area_salida")])]);
}

function reFiltrados() {
  const q = normalizar(document.getElementById("re-search")?.value || "");
  const qEe = juClaveEe(document.getElementById("re-search")?.value || "");
  const tipo = document.getElementById("re-tipo-filter")?.value || "";
  const tema = document.getElementById("re-tema-filter")?.value || "";
  const analista = document.getElementById("re-analista-filter")?.value || "";
  const envia = document.getElementById("re-envia-filter")?.value || "";
  const trimestre = document.getElementById("re-trimestre-filter")?.value || "";
  return reReclamos.filter(r =>
    (reTab === "todos" || r.estado === reTab) &&
    (!tipo || r.tipo_reclamo === tipo) &&
    (!tema || r.tema === tema) &&
    (!analista || r.ultimo.analista === analista) &&
    (!envia || r.ingresos.some(i => i.area_envia === envia)) &&
    (!trimestre || r.ingresos.some(i => juClaveTrimestre(i.fecha_ingreso) === trimestre)) &&
    (!q || juClaveEe(r.numero_ee).includes(qEe) || String(r.cuit_beneficiario || "").includes(q.replace(/\D/g, "") || "~") ||
      [r.tema, r.tipo_reclamo, ...r.ingresos.map(i => i.observaciones), ...r.demandados.flatMap(d => [d.denominacion, d.rnos, d.rnemp])]
        .some(v => normalizar(v).includes(q)))
  );
}

function reRenderReclamos() {
  const tbody = document.getElementById("re-table-body");
  if (!tbody) return;
  const filas = reFiltrados().sort((a, b) => reTab === "Asignado"
    ? String(a.ultimo.fecha_ingreso || "").localeCompare(String(b.ultimo.fecha_ingreso || ""))
    : String(b.ultimo.fecha_ingreso || "").localeCompare(String(a.ultimo.fecha_ingreso || "")));
  const pageInfo = paginarRegistros(filas, rePage);
  rePage = pageInfo.page;
  const clase = e => e === "Finalizado" ? "fin" : e === "Devuelto" ? "dev" : "tram";
  tbody.innerHTML = pageInfo.items.map(r => {
    const u = r.ultimo;
    const demandado = juDemandado(r);
    const tema = [r.tipo_reclamo, r.tema].filter(Boolean).join(" · ");
    return `<tr class="os-row" data-re-id="${r.id}" tabindex="0" role="button" title="Clic para abrir">
      <td class="date-cell">${formatearFecha(u.fecha_ingreso)}${r.ingresos.length > 1 ? `<br><span class="ju-tag" title="Ingresó ${r.ingresos.length} veces">Reingreso</span>` : ""}</td>
      <td class="ju-ee">${escaparHtml(r.numero_ee || "—")}</td>
      <td class="ellipsis-cell" style="max-width:280px" title="${escaparHtml(demandado)}">${escaparHtml(demandado || "—")}</td>
      <td class="ellipsis-cell" style="max-width:260px" title="${escaparHtml(tema)}">${escaparHtml(tema || "—")}</td>
      <td class="ellipsis-cell" style="max-width:300px" title="${escaparHtml(u.observaciones || "")}">${escaparHtml(u.observaciones || "—")}</td>
      <td class="date-cell">${formatearFecha(u.fecha_salida)}</td>
      <td><span class="ju-estado ${clase(r.estado)}">${escaparHtml(r.estado)}</span></td>
    </tr>`;
  }).join("");
  const count = document.getElementById("re-count");
  if (count) count.textContent = `${filas.length} reclamo${filas.length === 1 ? "" : "s"}${pageInfo.totalPages > 1 ? ` · Página ${pageInfo.page} de ${pageInfo.totalPages}` : ""}`;
  document.getElementById("re-empty").hidden = filas.length !== 0;
  renderPaginacion("re-pagination", pageInfo, page => { rePage = page; reRenderReclamos(); });
  tbody.querySelectorAll("[data-re-id]").forEach(row => {
    const abrir = () => requiereAutenticacion(() => reAbrirFicha(row.dataset.reId));
    row.addEventListener("click", abrir);
    row.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(); } });
  });
}

function reExportarListado() {
  const filas = reFiltrados();
  const siNo = v => v == null ? "" : v ? "Sí" : "No";
  const codigos = (r, campo) => r.demandados.map(d => d[campo]).filter(Boolean).join(" / ");
  const aoa = [["Nº EE", "Demandados", "RNAS", "RNEMP", "Área de reclamo", "Tipo de reclamo", "Tema", "Insumo", "Medicación", "Prestación", "Informe médico", "CUIT beneficiario", "Menor de 18", "Ingresos", "Último ingreso", "Área que envía", "Analista", "Fecha firma", "Fecha salida", "Área de salida", "Fecha notificación", "Estado", "Días de respuesta", "Observaciones"]];
  filas.forEach(r => {
    const u = r.ultimo;
    aoa.push([r.numero_ee || "", r.demandados.map(d => d.denominacion).join(" / "), codigos(r, "rnos"), codigos(r, "rnemp"), r.area_reclamo || "", r.tipo_reclamo || "", r.tema || "",
      siNo(r.insumo), siNo(r.medicacion), siNo(r.prestacion), siNo(r.informe_medico), r.cuit_beneficiario || "", siNo(r.menor_18), r.ingresos.length,
      u.fecha_ingreso ? formatearFecha(u.fecha_ingreso) : "", u.area_envia || "", u.analista || "", u.fecha_firma ? formatearFecha(u.fecha_firma) : "",
      u.fecha_salida ? formatearFecha(u.fecha_salida) : "", u.area_salida || "", u.fecha_notificacion ? formatearFecha(u.fecha_notificacion) : "", r.estado,
      (u.fecha_salida && u.fecha_ingreso ? juDiasEntre(u.fecha_ingreso, u.fecha_salida) : "") ?? "", u.observaciones || ""]);
  });
  const det = [["Nº EE", "Nº de ingreso", "Fecha ingreso", "Área que envía", "Analista", "Fecha firma", "Fecha salida", "Área de salida", "Fecha notificación", "Estado", "Observaciones"]];
  filas.forEach(r => r.ingresos.forEach((i, n) => det.push([r.numero_ee || "", n + 1, i.fecha_ingreso ? formatearFecha(i.fecha_ingreso) : "", i.area_envia || "", i.analista || "",
    i.fecha_firma ? formatearFecha(i.fecha_firma) : "", i.fecha_salida ? formatearFecha(i.fecha_salida) : "", i.area_salida || "", i.fecha_notificacion ? formatearFecha(i.fecha_notificacion) : "", i.estado, i.observaciones || ""])));
  const libro = window.XLSX.utils.book_new();
  const hoja = window.XLSX.utils.aoa_to_sheet(aoa);
  hoja["!cols"] = [32, 45, 14, 14, 12, 18, 24, 8, 10, 10, 10, 14, 10, 8, 12, 12, 14, 12, 12, 12, 14, 11, 10, 60].map(wch => ({ wch }));
  hoja["!autofilter"] = { ref: `A1:X${aoa.length}` };
  window.XLSX.utils.book_append_sheet(libro, hoja, "Reclamos");
  const hojaDet = window.XLSX.utils.aoa_to_sheet(det);
  hojaDet["!cols"] = [32, 8, 12, 12, 14, 12, 12, 12, 14, 11, 60].map(wch => ({ wch }));
  window.XLSX.utils.book_append_sheet(libro, hojaDet, "Ingresos");
  window.XLSX.writeFile(libro, `reclamos_${juHoyIso()}.xlsx`);
}

// ---------------- Ficha ----------------

function reIngresoVacio() {
  return { id: null, fecha_ingreso: juHoyIso(), area_envia: "", analista: "", fecha_firma: "", fecha_salida: "", area_salida: "", fecha_notificacion: "", observaciones: "", estado: "Asignado" };
}

async function reAbrirFicha(id, { conReingreso = false } = {}) {
  await juAsegurarPadron();
  const r = id ? reReclamos.find(x => String(x.id) === String(id)) : null;
  document.getElementById("re-form").reset();
  setFormMessage("re-message");
  document.getElementById("re-ee-aviso").hidden = true;
  const set = (campo, valor) => { const el = document.getElementById(campo); if (el) el.value = valor ?? ""; };
  set("re-ee", r?.numero_ee);
  set("re-area-reclamo", r?.area_reclamo || (r ? "" : "Cobertura"));
  set("re-tipo", r?.tipo_reclamo);
  set("re-tema", r?.tema);
  set("re-cuit", r?.cuit_beneficiario);
  set("re-dem-buscar", "");
  [["re-insumo", "insumo"], ["re-medicacion", "medicacion"], ["re-prestacion", "prestacion"], ["re-informe", "informe_medico"], ["re-menor", "menor_18"]]
    .forEach(([el, campo]) => { document.getElementById(el).checked = Boolean(r?.[campo]); });
  const tipoSel = document.getElementById("re-tipo");
  if (r?.tipo_reclamo && ![...tipoSel.options].some(o => o.value === r.tipo_reclamo)) tipoSel.insertAdjacentHTML("beforeend", `<option>${escaparHtml(r.tipo_reclamo)}</option>`);
  tipoSel.value = r?.tipo_reclamo || "";
  reFicha = { id: r?.id || null, nuevo: !r, demandados: [...(r?.demandados || [])], ingresos: r ? r.ingresos.map(i => ({ ...i })) : [reIngresoVacio()] };
  document.getElementById("re-modal-title").textContent = r ? (r.numero_ee || "Reclamo sin Nº EE") : "Nuevo reclamo";
  document.getElementById("re-modal-sub").textContent = r
    ? `${r.ingresos.length === 1 ? "1 ingreso" : `${r.ingresos.length} ingresos`} · ${r.estado}${r.origen === "teams" ? " · importado de Teams" : ""}` : "";
  const esAdmin = ["administrador", "admin"].includes(normalizarPerfilAcceso(perfilSesionActual()));
  document.getElementById("re-eliminar").hidden = !(r && esAdmin);
  reSetEditando(!r);
  abrirModal("re-modal");
  if (conReingreso) reAgregarReingreso();
  else if (!r) setTimeout(() => document.getElementById("re-ee")?.focus(), 0);
}

function reCerrarFicha() {
  reFicha = null;
  cerrarModal("re-modal");
}

function reSetEditando(editando) {
  if (!reFicha) return;
  if (editando) reLeerIngresosDelDom();
  reFicha.editando = editando;
  document.getElementById("re-fieldset").disabled = !editando;
  document.getElementById("re-form").classList.toggle("ju-solo-lectura", !editando);
  document.getElementById("re-guardar").hidden = !editando;
  document.getElementById("re-editar").hidden = editando;
  document.getElementById("re-reingreso-btn").hidden = reFicha.nuevo;
  document.getElementById("re-cancelar").textContent = editando && !reFicha.nuevo ? "Cancelar" : "Cerrar";
  document.getElementById("re-dem-buscar").closest(".ju-combo").hidden = !editando;
  reRenderChips();
  reRenderIngresos();
}

function reRenderChips() {
  const cont = document.getElementById("re-chips");
  if (!cont || !reFicha) return;
  cont.innerHTML = reFicha.demandados.map(d => `<span class="ju-chip">
      <strong>${escaparHtml(d.denominacion)}</strong><small>${escaparHtml(juCodigoDe(d))}</small>
      ${reFicha.editando ? `<button type="button" data-quitar-os="${d.id}" aria-label="Quitar">×</button>` : ""}
    </span>`).join("") || `<span class="ju-sin-dato">Sin demandados cargados</span>`;
  cont.querySelectorAll("[data-quitar-os]").forEach(b => b.addEventListener("click", () => {
    reFicha.demandados = reFicha.demandados.filter(d => String(d.id) !== b.dataset.quitarOs);
    reRenderChips();
  }));
}

function reRenderBusquedaDemandados() {
  const input = document.getElementById("re-dem-buscar");
  const lista = document.getElementById("re-dem-lista");
  if (!reFicha?.editando) { lista.hidden = true; return; }
  const q = normalizar(input.value.trim());
  if (q.length < 2) { lista.innerHTML = `<div class="ju-combo-vacio">Escribí al menos 2 letras o números...</div>`; lista.hidden = false; return; }
  const ya = new Set(reFicha.demandados.map(d => String(d.id)));
  const palabras = q.split(/\s+/);
  const inactiva = o => String(o.estado || "").toUpperCase() === "INACTIVA";
  const res = juPadron.filter(o => !ya.has(String(o.id)) && palabras.every(p => o._busqueda.includes(p)))
    .sort((a, b) => inactiva(a) - inactiva(b)).slice(0, 25);
  lista.innerHTML = res.map(o => `<button type="button" class="ju-combo-item" data-os-id="${o.id}">
      <span>${escaparHtml(o.denominacion)}</span><small>${escaparHtml(juCodigoDe(o))} · ${o.rnos ? "Obra Social" : "Prepaga"}${inactiva(o) ? " · inactiva" : ""}</small>
    </button>`).join("") || `<div class="ju-combo-vacio">No hay coincidencias en el padrón.</div>`;
  lista.hidden = false;
  lista.querySelectorAll("[data-os-id]").forEach(b => b.addEventListener("click", () => {
    const os = juPadron.find(o => String(o.id) === b.dataset.osId);
    if (os) reFicha.demandados.push(os);
    input.value = "";
    lista.hidden = true;
    reRenderChips();
    input.focus();
  }));
}

function reVerificarEe() {
  const aviso = document.getElementById("re-ee-aviso");
  if (!reFicha) return null;
  const clave = juClaveEe(document.getElementById("re-ee").value);
  const previo = clave ? reReclamos.find(r => juClaveEe(r.numero_ee) === clave && String(r.id) !== String(reFicha.id)) : null;
  if (!previo) { aviso.hidden = true; return null; }
  aviso.innerHTML = `Este expediente ya está cargado (último ingreso ${formatearFecha(previo.ultimo.fecha_ingreso)}, ${escaparHtml(previo.estado.toLowerCase())}). No se puede cargar dos veces: si volvió a ingresar, registrá el reingreso en ese mismo reclamo.
    <button type="button" class="primary small" id="re-ir-reingreso">Abrir y registrar reingreso</button>`;
  aviso.hidden = false;
  document.getElementById("re-ir-reingreso").addEventListener("click", () => reAbrirFicha(previo.id, { conReingreso: true }));
  return previo;
}

function reLeerIngresosDelDom() {
  if (!reFicha) return;
  document.querySelectorAll("[data-re-ing-idx]").forEach(card => {
    const ing = reFicha.ingresos[Number(card.dataset.reIngIdx)];
    if (!ing) return;
    card.querySelectorAll("[data-campo]").forEach(el => { ing[el.dataset.campo] = el.value; });
  });
}

function reRenderIngresos() {
  const cont = document.getElementById("re-ingresos");
  if (!cont || !reFicha) return;
  const ed = reFicha.editando;
  const esAdmin = ["administrador", "admin"].includes(normalizarPerfilAcceso(perfilSesionActual()));
  const opciones = (lista, valor) => lista.map(v => `<option ${v === valor ? "selected" : ""}>${escaparHtml(v)}</option>`).join("");
  cont.innerHTML = reFicha.ingresos.map((i, idx) => {
    const titulo = idx === 0 ? "1º ingreso" : `Reingreso (${idx + 1}º ingreso)`;
    const dias = i.fecha_salida && i.fecha_ingreso ? juDiasEntre(i.fecha_ingreso, i.fecha_salida) : null;
    const quitar = ed && idx > 0 && (!i.id || esAdmin) ? `<button type="button" class="ju-link-danger" data-quitar-ing="${idx}">Quitar</button>` : "";
    return `<div class="ju-ingreso ${idx > 0 ? "es-reingreso" : ""}" data-re-ing-idx="${idx}">
      <div class="ju-ingreso-cab"><strong>${titulo}</strong><span>${escaparHtml(i.estado)}${dias != null ? ` · ${dias} día${dias === 1 ? "" : "s"} hasta la salida` : ""}</span>${quitar}</div>
      <div class="ju-ingreso-grid">
        <label><span>Fecha de ingreso *</span><input type="date" data-campo="fecha_ingreso" value="${escaparHtml(i.fecha_ingreso || "")}"></label>
        <label><span>Área que envía</span><input data-campo="area_envia" list="re-areas-datalist" value="${escaparHtml(i.area_envia || "")}"></label>
        <label><span>Analista</span><input data-campo="analista" list="re-analistas-datalist" value="${escaparHtml(i.analista || "")}"></label>
        <label><span>Estado</span><select data-campo="estado">${opciones(RE_ESTADOS, i.estado)}</select></label>
        <label><span>Fecha de firma</span><input type="date" data-campo="fecha_firma" value="${escaparHtml(i.fecha_firma || "")}"></label>
        <label><span>Fecha de salida GCP</span><input type="date" data-campo="fecha_salida" value="${escaparHtml(i.fecha_salida || "")}"></label>
        <label><span>Área de salida</span><input data-campo="area_salida" list="re-areas-datalist" value="${escaparHtml(i.area_salida || "")}"></label>
        <label><span>Fecha de notificación</span><input type="date" data-campo="fecha_notificacion" value="${escaparHtml(i.fecha_notificacion || "")}"></label>
        <label class="ju-ingreso-full"><span>Observaciones</span><textarea data-campo="observaciones" rows="2">${escaparHtml(i.observaciones || "")}</textarea></label>
      </div>
    </div>`;
  }).join("");
  cont.querySelectorAll("[data-re-ing-idx]").forEach(card => {
    const salida = card.querySelector('[data-campo="fecha_salida"]');
    const estado = card.querySelector('[data-campo="estado"]');
    salida.addEventListener("change", () => { if (salida.value && estado.value === "Asignado") estado.value = "Finalizado"; });
    estado.addEventListener("change", () => { if (estado.value !== "Asignado" && !salida.value) salida.value = juHoyIso(); });
  });
  cont.querySelectorAll("[data-quitar-ing]").forEach(b => b.addEventListener("click", () => {
    reLeerIngresosDelDom();
    const idx = Number(b.dataset.quitarIng);
    const ing = reFicha.ingresos[idx];
    if (ing.id && !window.confirm("¿Quitar este reingreso? Se borra al guardar.")) return;
    if (ing.id) (reFicha.borrarIngresos ||= []).push(ing.id);
    reFicha.ingresos.splice(idx, 1);
    reRenderIngresos();
  }));
}

function reAgregarReingreso() {
  if (!reFicha) return;
  if (!reFicha.editando) reSetEditando(true);
  reLeerIngresosDelDom();
  const ultimo = reFicha.ingresos[reFicha.ingresos.length - 1];
  if (ultimo && !ultimo.id) { mostrarToast("Ya hay un reingreso nuevo sin guardar.", "error"); return; }
  reFicha.ingresos.push({ ...reIngresoVacio(), analista: ultimo?.analista || "", area_envia: ultimo?.area_envia || "" });
  reRenderIngresos();
  const cards = document.querySelectorAll("[data-re-ing-idx]");
  cards[cards.length - 1]?.scrollIntoView({ behavior: "smooth", block: "center" });
  cards[cards.length - 1]?.querySelector('[data-campo="fecha_ingreso"]')?.focus();
}

async function reGuardar(event) {
  event.preventDefault();
  if (!reFicha?.editando) return;
  reLeerIngresosDelDom();
  const val = id => document.getElementById(id)?.value.trim() || "";
  if (reVerificarEe()) { setFormMessage("re-message", "Ese Nº EE ya está cargado. Abrí el reclamo existente para registrar el reingreso."); return; }
  if (!val("re-ee")) { setFormMessage("re-message", "El Nº EE es obligatorio."); return; }
  for (const [n, i] of reFicha.ingresos.entries()) {
    const nombre = n === 0 ? "el 1º ingreso" : `el ${n + 1}º ingreso`;
    const esNuevoOCambiado = !i.id || reFicha.editando;
    if (!i.fecha_ingreso && (!i.id)) { setFormMessage("re-message", `Falta la fecha de ingreso en ${nombre}.`); return; }
    if (i.fecha_salida && i.fecha_ingreso && i.fecha_salida < i.fecha_ingreso && esNuevoOCambiado) { setFormMessage("re-message", `En ${nombre}, la fecha de salida es anterior a la de ingreso.`); return; }
    if (n > 0 && i.fecha_ingreso && reFicha.ingresos[n - 1].fecha_ingreso && i.fecha_ingreso < reFicha.ingresos[n - 1].fecha_ingreso) { setFormMessage("re-message", `La fecha de ${nombre} es anterior al ingreso previo.`); return; }
  }
  const datos = {
    numero_ee: val("re-ee"),
    area_reclamo: val("re-area-reclamo") || null,
    tipo_reclamo: val("re-tipo") || null,
    tema: reMayus(val("re-tema")) || null,
    cuit_beneficiario: val("re-cuit").replace(/\D/g, "") || null,
    insumo: document.getElementById("re-insumo").checked,
    medicacion: document.getElementById("re-medicacion").checked,
    prestacion: document.getElementById("re-prestacion").checked,
    informe_medico: document.getElementById("re-informe").checked,
    menor_18: document.getElementById("re-menor").checked
  };
  const boton = document.getElementById("re-guardar");
  boton.disabled = true;
  try {
    let id = reFicha.id;
    if (id) await juFetch("reclamos", { method: "PATCH", params: { id: `eq.${id}` }, body: datos, prefer: "return=minimal" });
    else { const [fila] = await juFetch("reclamos", { method: "POST", params: { select: "id" }, body: datos, prefer: "return=representation" }); id = fila.id; }
    const original = new Set((reReclamos.find(r => String(r.id) === String(id))?.demandados || []).map(d => String(d.id)));
    const actual = new Set(reFicha.demandados.map(d => String(d.id)));
    const quitar = [...original].filter(x => !actual.has(x));
    const agregar = [...actual].filter(x => !original.has(x));
    if (quitar.length) await juFetch("reclamo_demandados", { method: "DELETE", params: { reclamo_id: `eq.${id}`, obra_social_id: `in.(${quitar.join(",")})` } });
    if (agregar.length) await juFetch("reclamo_demandados", { method: "POST", body: agregar.map(x => ({ reclamo_id: id, obra_social_id: Number(x) })), prefer: "return=minimal" });
    for (const borrar of reFicha.borrarIngresos || []) await juFetch("reclamo_ingresos", { method: "DELETE", params: { id: `eq.${borrar}` } });
    for (const i of reFicha.ingresos) {
      const fila = {
        fecha_ingreso: i.fecha_ingreso || null, area_envia: reMayus(i.area_envia) || null, analista: (i.analista || "").trim() || null,
        fecha_firma: i.fecha_firma || null, fecha_salida: i.fecha_salida || null, area_salida: reMayus(i.area_salida) || null,
        fecha_notificacion: i.fecha_notificacion || null, observaciones: (i.observaciones || "").trim() || null, estado: i.estado || "Asignado"
      };
      if (i.id) await juFetch("reclamo_ingresos", { method: "PATCH", params: { id: `eq.${i.id}` }, body: fila, prefer: "return=minimal" });
      else await juFetch("reclamo_ingresos", { method: "POST", body: { ...fila, reclamo_id: id }, prefer: "return=minimal" });
    }
    await reRecargarReclamo(id);
    mostrarToast(reFicha.nuevo ? "Reclamo cargado." : "Cambios guardados.");
    reLlenarFiltros();
    reRenderReclamos();
    juReporteDatos = null;
    reAbrirFicha(id);
  } catch (error) {
    const msg = String(error.message || "");
    setFormMessage("re-message", /reclamos_numero_ee_unico|duplicate key/i.test(msg) ? "Ese Nº EE ya está cargado en otro reclamo." : `No se pudo guardar. ${msg}`);
  } finally {
    boton.disabled = false;
  }
}

async function reEliminar() {
  const id = reFicha?.id;
  if (!id || !window.confirm("¿Eliminar este reclamo con todos sus ingresos? No se puede deshacer.")) return;
  try {
    await juFetch("reclamos", { method: "DELETE", params: { id: `eq.${id}` } });
    reReclamos = reReclamos.filter(r => String(r.id) !== String(id));
    reCerrarFicha();
    mostrarToast("Reclamo eliminado.");
    reRenderReclamos();
  } catch (error) {
    setFormMessage("re-message", `No se pudo eliminar. ${error.message || ""}`);
  }
}

// ---------------- Reportes (Oficios y Reclamos) ----------------
// Pastillas y gráficos siempre a la vista; tablas a pedido ("Ver tabla" en cada
// gráfico y "Ver listado" con los expedientes que cumplen los filtros).

const JU_REP_CONFIG = {
  oficios: {
    nombre: "Oficios", clase1: "Por motivo", col1: "Motivo", clase2: null, texto: "Carátula", estados: ["En trámite", "Finalizado"],
    cerrados: "Finalizados",
    async cargar() { await juCargarOficios(); },
    items() {
      return juTodosLosIngresos().map(i => ({
        ref: i.oficio.id, fecha_ingreso: i.fecha_ingreso, fecha_egreso: i.fecha_egreso, estado: i.estado,
        finalizado: i.estado === "Finalizado", devuelto: false, analista: i.analista, area_salida: i.area_salida,
        clase1: i.oficio.motivo, clase2: null, numero_ee: i.oficio.numero_ee, texto: i.oficio.caratula,
        demandados: i.oficio.demandados, esReingreso: i.oficio.ingresos[0]?.id !== i.id,
        buscar: normalizar([i.oficio.numero_ee, i.oficio.caratula, i.descripcion, i.oficio.juzgado, i.oficio.otros_demandados].join(" ")),
        clave: juClaveEe(i.oficio.numero_ee)
      }));
    },
    abrir: id => juAbrirFicha(id)
  },
  reclamos: {
    nombre: "Reclamos", clase1: "Por tipo de reclamo", col1: "Tipo", clase2: "Tema", texto: "Observaciones", estados: ["Asignado", "Devuelto", "Finalizado"],
    cerrados: "Finalizados y devueltos",
    async cargar() { await reCargarReclamos(); },
    items() {
      return reTodosLosIngresos().map(i => ({
        ref: i.reclamo.id, fecha_ingreso: i.fecha_ingreso, fecha_egreso: i.fecha_salida, estado: i.estado,
        finalizado: i.estado !== "Asignado", devuelto: i.estado === "Devuelto", analista: i.analista, area_salida: i.area_salida,
        clase1: i.reclamo.tipo_reclamo, clase2: i.reclamo.tema, numero_ee: i.reclamo.numero_ee, texto: i.observaciones,
        demandados: i.reclamo.demandados, esReingreso: i.reclamo.ingresos[0]?.id !== i.id,
        buscar: normalizar([i.reclamo.numero_ee, i.observaciones, i.reclamo.tema, i.reclamo.cuit_beneficiario].join(" ")),
        clave: juClaveEe(i.reclamo.numero_ee)
      }));
    },
    abrir: id => reAbrirFicha(id)
  }
};

const JR_GRAFICOS = [
  ["trimestre", "Evolución por trimestre"], ["estado", "Estado actual"], ["tiempos", "Tiempo de respuesta"],
  ["clase1", "Motivo / Tipo"], ["clase2", "Tema"], ["analista", "Analista"], ["demandados", "Más demandados"], ["area", "Área de salida"]
];
const JR_TOP = 8;
let jrGraficos = (() => {
  try { const v = JSON.parse(localStorage.getItem("gcp-jr-graficos") || "null"); if (Array.isArray(v)) return new Set(v); } catch (e) { /* sin almacenamiento */ }
  return new Set(["estado", "tiempos"]);
})();

function jrGuardarGraficos() {
  try { localStorage.setItem("gcp-jr-graficos", JSON.stringify([...jrGraficos])); } catch (e) { /* sin almacenamiento */ }
}

function jrRenderSelectorGraficos() {
  const cfg = JU_REP_CONFIG[jr.tipo];
  const cont = document.getElementById("jr-graficos");
  if (!cont) return;
  const disponibles = JR_GRAFICOS.filter(([k]) => k !== "clase2" || cfg.clase2)
    .map(([k, t]) => [k, k === "clase1" ? cfg.col1 : t]);
  cont.innerHTML = disponibles.map(([k, t]) => `<button type="button" class="jr-graf-chip${jrGraficos.has(k) ? " active" : ""}" data-jr-graf-btn="${k}">${escaparHtml(t)}</button>`).join("")
    + `<button type="button" class="jr-graf-chip todos" data-jr-graf-btn="__todos">${disponibles.every(([k]) => jrGraficos.has(k)) ? "Ocultar todos" : "Ver todos"}</button>`;
  cont.querySelectorAll("[data-jr-graf-btn]").forEach(b => b.addEventListener("click", () => {
    const k = b.dataset.jrGrafBtn;
    if (k === "__todos") {
      const todos = disponibles.every(([x]) => jrGraficos.has(x));
      disponibles.forEach(([x]) => todos ? jrGraficos.delete(x) : jrGraficos.add(x));
    } else if (jrGraficos.has(k)) jrGraficos.delete(k); else jrGraficos.add(k);
    jrGuardarGraficos();
    jrAplicarVisibilidad();
    jrRenderSelectorGraficos();
  }));
}

function jrAplicarVisibilidad() {
  const cfg = JU_REP_CONFIG[jr.tipo];
  document.querySelectorAll("[data-jr-graf]").forEach(card => {
    const k = card.dataset.jrGraf;
    card.hidden = !jrGraficos.has(k) || (k === "clase2" && !cfg.clase2);
  });
  const grid = document.querySelector("#ju-reportes .jr-grid");
  if (grid) grid.hidden = ![...document.querySelectorAll("[data-jr-graf]")].some(c => !c.hidden);
}

const jr = { tipo: "oficios", buscar: "", demandado: null, clase1: "", clase2: "", analista: "", estado: "", listado: false, page: 1 };
let jrEventos = false;

function juRepTipo() { return jr.tipo; }

function jrVincularEventos() {
  if (jrEventos) return;
  jrEventos = true;
  const on = (id, ev, fn) => document.getElementById(id)?.addEventListener(ev, fn);
  document.querySelectorAll("[data-jr-tipo]").forEach(b => b.addEventListener("click", () => {
    if (jr.tipo === b.dataset.jrTipo) return;
    jr.tipo = b.dataset.jrTipo;
    Object.assign(jr, { clase1: "", clase2: "", analista: "", estado: "", page: 1 });
    document.querySelectorAll("[data-jr-tipo]").forEach(x => x.classList.toggle("active", x === b));
    document.getElementById("ju-rep-desde").value = "";
    juMostrarReportes();
  }));
  on("ju-rep-desde", "change", () => { jr.page = 1; juGenerarReporte(); });
  on("ju-rep-hasta", "change", () => { jr.page = 1; juGenerarReporte(); });
  on("jr-buscar", "input", e => { jr.buscar = e.target.value; jr.page = 1; juGenerarReporte(); });
  [["jr-clase1", "clase1"], ["jr-clase2", "clase2"], ["jr-analista", "analista"], ["jr-estado", "estado"]].forEach(([id, campo]) =>
    on(id, "change", e => { jr[campo] = e.target.value; jr.page = 1; juGenerarReporte(); }));
  on("jr-dem-buscar", "input", jrBuscarDemandado);
  on("jr-dem-buscar", "focus", jrBuscarDemandado);
  on("jr-dem-buscar", "keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); document.querySelector("#jr-dem-lista [data-os-id]")?.click(); }
    if (e.key === "Escape") document.getElementById("jr-dem-lista").hidden = true;
  });
  document.addEventListener("click", e => {
    if (!e.target.closest(".jr-dem")) { const l = document.getElementById("jr-dem-lista"); if (l) l.hidden = true; }
  });
  on("jr-ver-listado", "click", () => { jr.listado = !jr.listado; jr.page = 1; juGenerarReporte(); });
}

async function juMostrarReportes() {
  jrVincularEventos();
  const cfg = JU_REP_CONFIG[jr.tipo];
  try {
    await Promise.all([cfg.cargar(), juAsegurarPadron()]);
  } catch (error) {
    mostrarToast(`No se pudieron cargar los ${cfg.nombre.toLowerCase()}.`, "error");
    return;
  }
  const desde = document.getElementById("ju-rep-desde");
  const hasta = document.getElementById("ju-rep-hasta");
  if (!desde.value) {
    const fechas = cfg.items().map(i => i.fecha_ingreso).filter(Boolean).sort();
    desde.value = fechas[0] || "";
    hasta.value = juHoyIso();
  }
  jrLlenarFiltros();
  juGenerarReporte();
}

function jrLlenarFiltros() {
  const cfg = JU_REP_CONFIG[jr.tipo];
  const items = cfg.items();
  const llenar = (id, etiqueta, valores, actual) => {
    const sel = document.getElementById(id);
    sel.innerHTML = `<option value="">${etiqueta}: Todos</option>` + valores.map(v => `<option value="${escaparHtml(v)}">${escaparHtml(v)}</option>`).join("");
    sel.value = valores.includes(actual) ? actual : "";
  };
  const unicos = campo => [...new Set(items.map(i => i[campo]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  llenar("jr-clase1", cfg.col1, unicos("clase1"), jr.clase1);
  const c2 = document.getElementById("jr-clase2");
  c2.hidden = !cfg.clase2;
  if (cfg.clase2) llenar("jr-clase2", "Tema", unicos("clase2"), jr.clase2);
  llenar("jr-analista", "Analista", unicos("analista"), jr.analista);
  llenar("jr-estado", "Estado", cfg.estados, jr.estado);
  document.getElementById("jr-buscar").placeholder = jr.tipo === "oficios"
    ? "Buscar por Nº EE, carátula, juzgado o descripción..." : "Buscar por Nº EE, observaciones, tema o CUIT...";
  document.querySelectorAll("[data-jr-cerrados]").forEach(el => { el.textContent = cfg.cerrados; });
}

function jrBuscarDemandado() {
  const input = document.getElementById("jr-dem-buscar");
  const lista = document.getElementById("jr-dem-lista");
  const q = normalizar(input.value.trim());
  if (q.length < 2) { lista.innerHTML = `<div class="ju-combo-vacio">Escribí al menos 2 letras o números...</div>`; lista.hidden = false; return; }
  const palabras = q.split(/\s+/);
  const res = juPadron.filter(o => palabras.every(p => o._busqueda.includes(p))).slice(0, 20);
  lista.innerHTML = res.map(o => `<button type="button" class="ju-combo-item" data-os-id="${o.id}"><span>${escaparHtml(o.denominacion)}</span><small>${escaparHtml(juCodigoDe(o))}</small></button>`).join("")
    || `<div class="ju-combo-vacio">No hay coincidencias en el padrón.</div>`;
  lista.hidden = false;
  lista.querySelectorAll("[data-os-id]").forEach(b => b.addEventListener("click", () => {
    jr.demandado = juPadron.find(o => String(o.id) === b.dataset.osId) || null;
    input.value = "";
    lista.hidden = true;
    jr.page = 1;
    juGenerarReporte();
  }));
}

function jrFiltrar(items, { desde: d0, hasta: h0 } = {}) {
  const desde = d0 ?? (document.getElementById("ju-rep-desde")?.value || "");
  const hasta = h0 ?? (document.getElementById("ju-rep-hasta")?.value || "");
  const q = normalizar(jr.buscar.trim());
  const qEe = juClaveEe(jr.buscar);
  return items.filter(i =>
    i.fecha_ingreso && (!desde || i.fecha_ingreso >= desde) && (!hasta || i.fecha_ingreso <= hasta) &&
    (!q || i.buscar.includes(q) || (qEe.length > 3 && i.clave.includes(qEe))) &&
    (!jr.demandado || (i.demandados || []).some(d => String(d.id) === String(jr.demandado.id))) &&
    (!jr.clase1 || i.clase1 === jr.clase1) &&
    (!jr.clase2 || i.clase2 === jr.clase2) &&
    (!jr.analista || i.analista === jr.analista) &&
    (!jr.estado || i.estado === jr.estado)
  );
}

function juAgrupar(lista, claveFn) {
  const mapa = new Map();
  lista.forEach(o => {
    const k = claveFn(o) || "(Sin dato)";
    if (!mapa.has(k)) mapa.set(k, []);
    mapa.get(k).push(o);
  });
  return mapa;
}

function juResumenGrupo(lista) {
  const fin = lista.filter(o => o.finalizado);
  const dias = fin.map(juDiasRespuesta);
  return { total: lista.length, finalizados: fin.length, tramite: lista.length - fin.length, devueltos: lista.filter(o => o.devuelto).length, mediana: juMediana(dias), promedio: juPromedio(dias) };
}

// --- Dibujo ---

function jrTablaDetalle(filas, col, { conEstados = true } = {}) {
  const cfg = JU_REP_CONFIG[jr.tipo];
  const cab = conEstados
    ? `<tr><th>${escaparHtml(col)}</th><th>Ingresados</th><th>${escaparHtml(cfg.cerrados)}</th><th>En trámite</th><th>Días resp.</th></tr>`
    : `<tr><th>${escaparHtml(col)}</th><th>Cantidad</th></tr>`;
  const cuerpo = filas.map(f => conEstados
    ? `<tr><td>${escaparHtml(f.etiqueta)}</td><td class="ju-num"><strong>${f.total}</strong></td><td class="ju-num">${f.finalizados}</td><td class="ju-num">${f.tramite}</td><td class="ju-num">${f.mediana ?? "—"}</td></tr>`
    : `<tr><td>${escaparHtml(f.etiqueta)}</td><td class="ju-num"><strong>${f.total}</strong></td></tr>`).join("");
  return `<details class="jr-tabla"><summary>Ver tabla</summary><div class="table-scroll"><table class="data-table ig-tabla"><thead>${cab}</thead><tbody>${cuerpo}</tbody></table></div></details>`;
}

function jrBarras(id, todas, { col, filtro, segmentos = true, max, top = JR_TOP } = {}) {
  const cont = document.getElementById(id);
  if (!cont) return;
  if (!todas.length) { cont.innerHTML = `<div class="jr-vacio">Sin datos con estos filtros.</div>`; return; }
  const filas = top ? todas.slice(0, top) : todas;
  const resto = todas.length - filas.length;
  const tope = max || Math.max(...filas.map(f => f.total), 1);
  cont.innerHTML = `<div class="jr-barras">${filas.map((f, n) => {
    const ancho = v => `${Math.max(0, (v / tope) * 100)}%`;
    const barra = segmentos
      ? `<span class="jr-seg jr-c2" style="width:${ancho(f.finalizados)}"></span><span class="jr-seg jr-c3" style="width:${ancho(f.tramite)}"></span>`
      : `<span class="jr-seg jr-c1" style="width:${ancho(f.total)}"></span>`;
    const titulo = segmentos ? `${f.etiqueta}: ${f.total} (${f.finalizados} cerrados, ${f.tramite} en trámite)` : `${f.etiqueta}: ${f.total}`;
    return `<${filtro ? "button type=\"button\"" : "div"} class="jr-barra${filtro ? " clic" : ""}" data-jr-n="${n}" title="${escaparHtml(titulo)}">
      <span class="jr-etq">${escaparHtml(f.etiqueta)}</span><span class="jr-pista">${barra}</span><span class="jr-val">${f.total}</span>
    </${filtro ? "button" : "div"}>`;
  }).join("")}</div>${resto > 0 ? `<div class="jr-resto">y ${resto} más en la tabla</div>` : ""}${jrTablaDetalle(todas, col, { conEstados: segmentos })}`;
  if (filtro) cont.querySelectorAll("[data-jr-n]").forEach(b => b.addEventListener("click", () => { filtro(filas[Number(b.dataset.jrN)]); jr.page = 1; juGenerarReporte(); }));
}

function jrColumnas(id, filas) {
  const cont = document.getElementById(id);
  if (!filas.length) { cont.innerHTML = `<div class="jr-vacio">Sin datos con estos filtros.</div>`; return; }
  const tope = Math.max(...filas.map(f => f.total), 1);
  cont.innerHTML = `<div class="jr-cols">${filas.map(f => `<div class="jr-col" title="${escaparHtml(f.etiqueta)}: ${f.total} ingresados, ${f.finalizados} cerrados">
      <div class="jr-col-barras"><span class="jr-c1" style="height:${(f.total / tope) * 100}%"><b>${f.total}</b></span><span class="jr-c2" style="height:${(f.finalizados / tope) * 100}%"></span></div>
      <small>${escaparHtml(f.corta)}</small></div>`).join("")}</div>${jrTablaDetalle(filas, "Trimestre")}`;
}

function jrEstados(id, lista) {
  const cfg = JU_REP_CONFIG[jr.tipo];
  const filas = cfg.estados.map(e => ({ etiqueta: e, total: lista.filter(i => i.estado === e).length }));
  const total = lista.length || 1;
  const clase = e => e === "Finalizado" ? "jr-c2" : e === "Devuelto" ? "jr-c4" : "jr-c3";
  document.getElementById(id).innerHTML = `<div class="jr-apilada">${filas.map(f => `<span class="${clase(f.etiqueta)}" style="width:${(f.total / total) * 100}%" title="${escaparHtml(f.etiqueta)}: ${f.total}"></span>`).join("")}</div>
    <div class="jr-estados">${filas.map(f => `<button type="button" class="jr-estado-item" data-jr-estado="${escaparHtml(f.etiqueta)}"><i class="${clase(f.etiqueta)}"></i>${escaparHtml(f.etiqueta)}<strong>${f.total}</strong><small>${Math.round((f.total / total) * 100)}%</small></button>`).join("")}</div>
    ${jrTablaDetalle(filas, "Estado", { conEstados: false })}`;
  document.querySelectorAll(`#${id} [data-jr-estado]`).forEach(b => b.addEventListener("click", () => { jr.estado = b.dataset.jrEstado; jr.page = 1; jrLlenarFiltros(); juGenerarReporte(); }));
}

function jrRenderActivos() {
  const cfg = JU_REP_CONFIG[jr.tipo];
  const activos = [];
  if (jr.buscar.trim()) activos.push(["buscar", `Texto: “${jr.buscar.trim()}”`]);
  if (jr.demandado) activos.push(["demandado", `Demandado: ${jr.demandado.denominacion}`]);
  if (jr.clase1) activos.push(["clase1", `${cfg.col1}: ${jr.clase1}`]);
  if (jr.clase2) activos.push(["clase2", `Tema: ${jr.clase2}`]);
  if (jr.analista) activos.push(["analista", `Analista: ${jr.analista}`]);
  if (jr.estado) activos.push(["estado", `Estado: ${jr.estado}`]);
  const cont = document.getElementById("jr-activos");
  cont.hidden = !activos.length;
  cont.innerHTML = activos.map(([k, t]) => `<span class="ju-chip"><strong>${escaparHtml(t)}</strong><button type="button" data-jr-quitar="${k}" aria-label="Quitar filtro">×</button></span>`).join("")
    + (activos.length > 1 ? `<button type="button" class="ju-link-danger" id="jr-limpiar">Limpiar filtros</button>` : "");
  const quitar = k => {
    if (k === "buscar") { jr.buscar = ""; document.getElementById("jr-buscar").value = ""; }
    else if (k === "demandado") jr.demandado = null;
    else jr[k] = "";
    jr.page = 1;
    jrLlenarFiltros();
    juGenerarReporte();
  };
  cont.querySelectorAll("[data-jr-quitar]").forEach(b => b.addEventListener("click", () => quitar(b.dataset.jrQuitar)));
  document.getElementById("jr-limpiar")?.addEventListener("click", () => {
    Object.assign(jr, { buscar: "", demandado: null, clase1: "", clase2: "", analista: "", estado: "", page: 1 });
    document.getElementById("jr-buscar").value = "";
    jrLlenarFiltros();
    juGenerarReporte();
  });
}

function jrRenderListado(lista) {
  const cfg = JU_REP_CONFIG[jr.tipo];
  const btn = document.getElementById("jr-ver-listado");
  btn.textContent = jr.listado ? "Ocultar listado" : `Ver listado (${lista.length})`;
  const card = document.getElementById("jr-listado-card");
  card.hidden = !jr.listado;
  if (!jr.listado) return;
  const filas = [...lista].sort((a, b) => String(b.fecha_ingreso).localeCompare(String(a.fecha_ingreso)));
  const pageInfo = paginarRegistros(filas, jr.page);
  jr.page = pageInfo.page;
  document.getElementById("jr-listado-titulo").textContent = `${filas.length} ingreso${filas.length === 1 ? "" : "s"} con estos filtros`;
  document.getElementById("jr-listado-col1").textContent = cfg.col1;
  document.getElementById("jr-listado-texto").textContent = cfg.texto;
  const hoy = juHoyIso();
  document.getElementById("jr-listado-body").innerHTML = pageInfo.items.map(i => {
    const dias = i.fecha_egreso ? juDiasEntre(i.fecha_ingreso, i.fecha_egreso) : juDiasEntre(i.fecha_ingreso, hoy);
    const dem = [...new Set((i.demandados || []).map(d => d.denominacion))].join(" · ");
    const cls = i.estado === "Finalizado" ? "fin" : i.estado === "Devuelto" ? "dev" : "tram";
    return `<tr class="os-row" data-jr-ref="${i.ref}" tabindex="0" role="button" title="Clic para abrir">
      <td class="date-cell">${formatearFecha(i.fecha_ingreso)}${i.esReingreso ? `<br><span class="ju-tag">Reingreso</span>` : ""}</td>
      <td class="ju-ee">${escaparHtml(i.numero_ee || "—")}</td>
      <td class="ellipsis-cell" style="max-width:240px" title="${escaparHtml(dem)}">${escaparHtml(dem || "—")}</td>
      <td class="ellipsis-cell" style="max-width:280px" title="${escaparHtml(i.texto || "")}">${escaparHtml(i.texto || "—")}</td>
      <td>${escaparHtml(i.clase1 || "—")}</td>
      <td>${escaparHtml(i.analista || "—")}</td>
      <td class="date-cell">${formatearFecha(i.fecha_egreso)}</td>
      <td class="ju-num" title="${i.fecha_egreso ? "Días hasta la salida" : "Días en trámite"}">${dias ?? "—"}</td>
      <td><span class="ju-estado ${cls}">${escaparHtml(i.estado)}</span></td>
    </tr>`;
  }).join("") || `<tr><td colspan="9" style="color:var(--muted)">No hay ingresos con estos filtros.</td></tr>`;
  renderPaginacion("jr-listado-paginacion", pageInfo, p => { jr.page = p; juGenerarReporte(); });
  document.querySelectorAll("#jr-listado-body [data-jr-ref]").forEach(row => {
    const abrir = () => requiereAutenticacion(() => cfg.abrir(row.dataset.jrRef));
    row.addEventListener("click", abrir);
    row.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(); } });
  });
}

function juGenerarReporte() {
  const tipo = jr.tipo;
  const cfg = JU_REP_CONFIG[tipo];
  const desde = document.getElementById("ju-rep-desde")?.value || "";
  const hasta = document.getElementById("ju-rep-hasta")?.value || "";
  if (desde && hasta && desde > hasta) { mostrarToast("\"Desde\" tiene que ser anterior a \"Hasta\".", "error"); return; }
  const lista = jrFiltrar(cfg.items());
  const reingresos = lista.filter(i => i.esReingreso).length;
  const total = juResumenGrupo(lista);
  const fin = lista.filter(o => o.finalizado);
  const diasFin = fin.map(juDiasRespuesta).filter(d => Number.isFinite(d) && d >= 0);
  const cortes = tipo === "reclamos"
    ? [["0 a 7 días", d => d <= 7], ["8 a 15 días", d => d >= 8 && d <= 15], ["16 a 30 días", d => d >= 16 && d <= 30], ["Más de 30 días", d => d > 30]]
    : [["0 a 2 días", d => d <= 2], ["3 a 5 días", d => d >= 3 && d <= 5], ["6 a 10 días", d => d >= 6 && d <= 10], ["Más de 10 días", d => d > 10]];
  const rangos = cortes.map(([etiqueta, fn]) => ({ etiqueta, total: diasFin.filter(fn).length }));
  const hoy = juHoyIso();

  const porTrimestre = [...juAgrupar(lista, o => juClaveTrimestre(o.fecha_ingreso)).entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, l]) => { const [a, t] = k.split("-"); return { etiqueta: juTrimestre(l[0].fecha_ingreso), corta: `${t}T ${String(a).slice(2)}`, ...juResumenGrupo(l) }; });
  const ordenar = arr => arr.sort((a, b) => b.total - a.total || a.etiqueta.localeCompare(b.etiqueta, "es"));
  const porClase1 = ordenar([...juAgrupar(lista, o => o.clase1).entries()].map(([k, l]) => ({ etiqueta: k, ...juResumenGrupo(l) })));
  const porClase2 = cfg.clase2 ? ordenar([...juAgrupar(lista, o => o.clase2).entries()].map(([k, l]) => ({ etiqueta: k, ...juResumenGrupo(l) }))) : [];
  const porAnalista = ordenar([...juAgrupar(lista, o => o.analista).entries()].map(([k, l]) => ({ etiqueta: k, ...juResumenGrupo(l) })));
  const porArea = ordenar([...juAgrupar(fin.filter(o => o.area_salida), o => o.area_salida).entries()].map(([k, l]) => ({ etiqueta: k, ...juResumenGrupo(l) })));
  const dem = new Map();
  lista.forEach(o => {
    const vistos = new Set();
    (o.demandados || []).forEach(d => {
      if (vistos.has(d.denominacion)) return;
      vistos.add(d.denominacion);
      if (!dem.has(d.denominacion)) dem.set(d.denominacion, { os: d, items: [] });
      dem.get(d.denominacion).items.push(o);
    });
  });
  const porDemandado = [...dem.entries()].map(([etiqueta, v]) => ({ etiqueta, os: v.os, ...juResumenGrupo(v.items) })).sort((a, b) => b.total - a.total);
  const pendientes = lista.filter(o => !o.finalizado).sort((a, b) => String(a.fecha_ingreso).localeCompare(String(b.fecha_ingreso)));

  juReporteDatos = { tipo, desde, hasta, reingresos, total, rangos, porTrimestre, porClase1, porClase2, porAnalista, porArea, porDemandado, pendientes, lista };

  // Pastillas: siempre el año en curso (1/1 a hoy), con los demás filtros aplicados.
  const anio = hoy.slice(0, 4);
  const listaAnio = jrFiltrar(cfg.items(), { desde: `${anio}-01-01`, hasta: hoy });
  const totAnio = juResumenGrupo(listaAnio);
  const reingAnio = listaAnio.filter(i => i.esReingreso).length;
  const pend30Anio = listaAnio.filter(o => !o.finalizado && juDiasEntre(o.fecha_ingreso, hoy) > 30).length;
  const kpi = (titulo, valor, nota = "", clase = "") => `<div class="ju-kpi ${clase}"><span>${titulo}</span><strong>${valor}</strong>${nota ? `<small>${nota}</small>` : ""}</div>`;
  const pct = n => totAnio.total ? `${Math.round((n / totAnio.total) * 100)}% del total` : "";
  document.getElementById("ju-rep-kpis-titulo").textContent = `Año ${anio} · del 01/01 al ${formatearFecha(hoy)}`;
  document.getElementById("ju-rep-kpis").innerHTML =
    kpi("Ingresos", totAnio.total, reingAnio ? `incluye ${reingAnio} reingreso${reingAnio === 1 ? "" : "s"}` : "") +
    (tipo === "reclamos"
      ? kpi("Finalizados", totAnio.finalizados - totAnio.devueltos, pct(totAnio.finalizados - totAnio.devueltos), "ok") + kpi("Devueltos", totAnio.devueltos, pct(totAnio.devueltos)) + kpi("Asignados", totAnio.tramite, "en trámite", "alerta")
      : kpi("Finalizados", totAnio.finalizados, pct(totAnio.finalizados), "ok") + kpi("En trámite", totAnio.tramite, "", "alerta")) +
    kpi("Más de 30 días en trámite", pend30Anio, "pendientes antiguos", pend30Anio ? "riesgo" : "") +
    kpi("Tiempo de respuesta", totAnio.mediana ?? "—", totAnio.mediana != null ? `días (mediana) · promedio ${String(totAnio.promedio).replace(".", ",")}` : "");
  document.getElementById("ju-rep-titulo").textContent = `${cfg.nombre}`;
  document.getElementById("ju-rep-graf-titulo").textContent = `Ingresados entre el ${formatearFecha(desde)} y el ${formatearFecha(hasta)}`;

  jrColumnas("jr-trimestre", porTrimestre);
  jrEstados("jr-estados", lista);
  jrBarras("jr-tiempos", rangos, { col: "Tiempo de respuesta", segmentos: false, top: 0 });
  document.getElementById("jr-clase1-titulo").textContent = cfg.clase1;
  jrBarras("jr-g-clase1", porClase1, { col: cfg.col1, filtro: f => { jr.clase1 = f.etiqueta === "(Sin dato)" ? "" : f.etiqueta; jrLlenarFiltros(); } });
  document.getElementById("jr-clase2-card").hidden = !cfg.clase2;
  if (cfg.clase2) jrBarras("jr-g-clase2", porClase2, { col: "Tema", filtro: f => { jr.clase2 = f.etiqueta === "(Sin dato)" ? "" : f.etiqueta; jrLlenarFiltros(); } });
  jrBarras("jr-g-analista", porAnalista, { col: "Analista", filtro: f => { jr.analista = f.etiqueta === "(Sin dato)" ? "" : f.etiqueta; jrLlenarFiltros(); } });
  jrBarras("jr-g-demandados", porDemandado, { col: "Demandado", filtro: f => { jr.demandado = f.os; } });
  jrBarras("jr-g-area", porArea, { col: "Área de salida", segmentos: false });
  jrRenderSelectorGraficos();
  jrAplicarVisibilidad();
  jrRenderActivos();
  jrRenderListado(lista);
  document.getElementById("ju-rep-resultado").hidden = false;
}

function juExportarReporte() {
  const d = juReporteDatos;
  if (!d) return;
  const cfg = JU_REP_CONFIG[d.tipo];
  const libro = window.XLSX.utils.book_new();
  const hoja = (nombre, aoa, cols) => {
    const h = window.XLSX.utils.aoa_to_sheet(aoa);
    h["!cols"] = cols.map(wch => ({ wch }));
    window.XLSX.utils.book_append_sheet(libro, h, nombre.slice(0, 31));
  };
  const filtros = [];
  if (jr.buscar.trim()) filtros.push(`Texto: ${jr.buscar.trim()}`);
  if (jr.demandado) filtros.push(`Demandado: ${jr.demandado.denominacion}`);
  if (jr.clase1) filtros.push(`${cfg.col1}: ${jr.clase1}`);
  if (jr.clase2) filtros.push(`Tema: ${jr.clase2}`);
  if (jr.analista) filtros.push(`Analista: ${jr.analista}`);
  if (jr.estado) filtros.push(`Estado: ${jr.estado}`);
  const resumen = [
    [`${cfg.nombre} ingresados entre el ${formatearFecha(d.desde)} y el ${formatearFecha(d.hasta)}`],
    [filtros.length ? `Filtros: ${filtros.join(" · ")}` : "Sin filtros"], [],
    ["Ingresos", d.total.total], ["Reingresos incluidos", d.reingresos]
  ];
  if (d.tipo === "reclamos") resumen.push(["Finalizados", d.total.finalizados - d.total.devueltos], ["Devueltos", d.total.devueltos], ["Asignados (en trámite)", d.total.tramite]);
  else resumen.push(["Finalizados", d.total.finalizados], ["En trámite", d.total.tramite]);
  resumen.push(["Tiempo de respuesta (mediana, días)", d.total.mediana ?? ""], ["Tiempo de respuesta (promedio, días)", d.total.promedio ?? ""], [], ["Tiempo de respuesta", cfg.nombre], ...d.rangos.map(r => [r.etiqueta, r.total]));
  hoja("Resumen", resumen, [38, 12]);
  const grupo = (titulo, filas) => [[titulo, "Ingresados", cfg.cerrados, "En trámite", "Días de respuesta (mediana)"], ...filas.map(f => [f.etiqueta, f.total, f.finalizados, f.tramite, f.mediana ?? ""])];
  hoja("Por trimestre", grupo("Trimestre", d.porTrimestre), [20, 12, 14, 12, 26]);
  hoja(cfg.clase1, grupo(cfg.col1, d.porClase1), [24, 12, 14, 12, 26]);
  if (cfg.clase2) hoja("Por tema", grupo("Tema", d.porClase2), [34, 12, 14, 12, 26]);
  hoja("Por analista", grupo("Analista", d.porAnalista), [18, 12, 14, 12, 26]);
  hoja("Por demandado", grupo("Demandado", d.porDemandado), [60, 12, 14, 12, 26]);
  hoja("Por área de salida", [["Área de salida", cfg.cerrados, "Días de respuesta (mediana)"], ...d.porArea.map(f => [f.etiqueta, f.total, f.mediana ?? ""])], [18, 14, 26]);
  const hoy = juHoyIso();
  hoja("Listado", [["Fecha ingreso", "Nº EE", "Demandados", cfg.texto, cfg.col1, ...(cfg.clase2 ? ["Tema"] : []), "Analista", "Salida", "Días", "Estado", "Reingreso"],
    ...[...d.lista].sort((a, b) => String(b.fecha_ingreso).localeCompare(String(a.fecha_ingreso))).map(i => [
      formatearFecha(i.fecha_ingreso), i.numero_ee || "", [...new Set((i.demandados || []).map(x => x.denominacion))].join(" / "), i.texto || "", i.clase1 || "",
      ...(cfg.clase2 ? [i.clase2 || ""] : []), i.analista || "", i.fecha_egreso ? formatearFecha(i.fecha_egreso) : "",
      i.fecha_egreso ? juDiasEntre(i.fecha_ingreso, i.fecha_egreso) : juDiasEntre(i.fecha_ingreso, hoy), i.estado, i.esReingreso ? "Sí" : "No"])],
    [12, 32, 45, 60, 20, ...(cfg.clase2 ? [24] : []), 14, 12, 8, 12, 10]);
  window.XLSX.writeFile(libro, `reporte_${cfg.nombre.toLowerCase()}_${d.desde}_${d.hasta}.xlsx`);
}
