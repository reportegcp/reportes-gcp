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
  on("ju-rep-generar", "click", juGenerarReporte);
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
  const res = juPadron.filter(o => !ya.has(String(o.id)) && palabras.every(p => o._busqueda.includes(p))).slice(0, 25);
  lista.innerHTML = res.map(o => `<button type="button" class="ju-combo-item" data-os-id="${o.id}">
      <span>${escaparHtml(o.denominacion)}</span><small>${escaparHtml(juCodigoDe(o))} · ${o.rnos ? "Obra Social" : "Prepaga"}</small>
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

// ---------------- Reportes ----------------

async function juMostrarReportes() {
  const desde = document.getElementById("ju-rep-desde");
  const hasta = document.getElementById("ju-rep-hasta");
  try {
    await juCargarOficios();
  } catch (error) {
    mostrarToast("No se pudieron cargar los oficios.", "error");
    return;
  }
  if (desde && !desde.value) {
    const fechas = juTodosLosIngresos().map(i => i.fecha_ingreso).filter(Boolean).sort();
    desde.value = fechas[0] || "";
    hasta.value = juHoyIso();
  }
  if (!juReporteDatos) juGenerarReporte();
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
  const fin = lista.filter(o => o.estado === "Finalizado");
  const dias = fin.map(juDiasRespuesta);
  return { total: lista.length, finalizados: fin.length, tramite: lista.length - fin.length, mediana: juMediana(dias), promedio: juPromedio(dias) };
}

function juGenerarReporte() {
  const desde = document.getElementById("ju-rep-desde")?.value || "";
  const hasta = document.getElementById("ju-rep-hasta")?.value || "";
  if (desde && hasta && desde > hasta) { mostrarToast("\"Desde\" tiene que ser anterior a \"Hasta\".", "error"); return; }
  const lista = juTodosLosIngresos().filter(i => (!desde || i.fecha_ingreso >= desde) && (!hasta || i.fecha_ingreso <= hasta));
  const reingresos = lista.filter(i => i.oficio.ingresos[0]?.id !== i.id).length;
  const total = juResumenGrupo(lista);
  const fin = lista.filter(o => o.estado === "Finalizado");
  const diasFin = fin.map(juDiasRespuesta).filter(d => Number.isFinite(d) && d >= 0);
  const rangos = [["0 a 2 días", d => d <= 2], ["3 a 5 días", d => d >= 3 && d <= 5], ["6 a 10 días", d => d >= 6 && d <= 10], ["Más de 10 días", d => d > 10]]
    .map(([etiqueta, fn]) => ({ etiqueta, valor: diasFin.filter(fn).length }));

  const porTrimestre = [...juAgrupar(lista, o => juClaveTrimestre(o.fecha_ingreso)).entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, l]) => ({ etiqueta: juTrimestre(l[0].fecha_ingreso), ...juResumenGrupo(l) }));
  const ordenar = arr => arr.sort((a, b) => b.total - a.total || a.etiqueta.localeCompare(b.etiqueta, "es"));
  const porMotivo = ordenar([...juAgrupar(lista, o => o.oficio.motivo).entries()].map(([k, l]) => ({ etiqueta: k, ...juResumenGrupo(l) })));
  const porAnalista = ordenar([...juAgrupar(lista, o => o.analista).entries()].map(([k, l]) => ({ etiqueta: k, ...juResumenGrupo(l) })));
  const porArea = ordenar([...juAgrupar(fin, o => o.area_salida).entries()].map(([k, l]) => ({ etiqueta: k, ...juResumenGrupo(l) })));
  const demandados = new Map();
  lista.forEach(o => {
    new Set((o.oficio.demandados || []).map(d => d.denominacion)).forEach(n => demandados.set(n, (demandados.get(n) || 0) + 1));
  });
  const porDemandado = [...demandados.entries()].map(([etiqueta, total]) => ({ etiqueta, total })).sort((a, b) => b.total - a.total).slice(0, 15);
  const pendientes = lista.filter(o => o.estado !== "Finalizado").sort((a, b) => String(a.fecha_ingreso).localeCompare(String(b.fecha_ingreso)));

  juReporteDatos = { desde, hasta, reingresos, total, rangos, porTrimestre, porMotivo, porAnalista, porArea, porDemandado, pendientes };

  const kpi = (titulo, valor, nota = "") => `<div class="ju-kpi"><span>${titulo}</span><strong>${valor}</strong>${nota ? `<small>${nota}</small>` : ""}</div>`;
  document.getElementById("ju-rep-kpis").innerHTML =
    kpi("Ingresos", total.total, reingresos ? `incluye ${reingresos} reingreso${reingresos === 1 ? "" : "s"}` : "") +
    kpi("Finalizados", total.finalizados, total.total ? `${Math.round((total.finalizados / total.total) * 100)}% del total` : "") +
    kpi("En trámite", total.tramite) +
    kpi("Tiempo de respuesta", total.mediana ?? "—", total.mediana != null ? `días (mediana) · promedio ${String(total.promedio).replace(".", ",")}` : "");
  document.getElementById("ju-rep-titulo").textContent = `Oficios ingresados entre el ${formatearFecha(desde)} y el ${formatearFecha(hasta)}`;

  const tabla = (filas, conTiempo = true) => filas.map(f => `<tr><td>${escaparHtml(f.etiqueta)}</td><td class="ju-num"><strong>${f.total}</strong></td><td class="ju-num">${f.finalizados}</td><td class="ju-num">${f.tramite}</td>${conTiempo ? `<td class="ju-num">${f.mediana ?? "—"}</td>` : ""}</tr>`).join("");
  document.getElementById("ju-rep-trimestre").innerHTML = tabla(porTrimestre);
  document.getElementById("ju-rep-motivo").innerHTML = tabla(porMotivo);
  document.getElementById("ju-rep-analista").innerHTML = tabla(porAnalista);
  document.getElementById("ju-rep-area").innerHTML = porArea.map(f => `<tr><td>${escaparHtml(f.etiqueta)}</td><td class="ju-num"><strong>${f.total}</strong></td><td class="ju-num">${f.mediana ?? "—"}</td></tr>`).join("");
  renderBarChart("ju-rep-tiempos", rangos);
  document.getElementById("ju-rep-demandados").innerHTML = porDemandado.map((f, i) => `<tr><td class="ju-num">${i + 1}</td><td>${escaparHtml(f.etiqueta)}</td><td class="ju-num"><strong>${f.total}</strong></td></tr>`).join("");
  const hoy = juHoyIso();
  document.getElementById("ju-rep-pendientes-count").textContent = `${pendientes.length} en trámite`;
  document.getElementById("ju-rep-pendientes").innerHTML = pendientes.map(o => {
    const dias = juDiasEntre(o.fecha_ingreso, hoy);
    return `<tr><td class="date-cell">${formatearFecha(o.fecha_ingreso)}</td><td class="ju-ee">${escaparHtml(o.oficio.numero_ee || "—")}</td><td class="ellipsis-cell" style="max-width:280px" title="${escaparHtml(o.oficio.caratula || "")}">${escaparHtml(o.oficio.caratula || "—")}</td><td>${escaparHtml(o.oficio.motivo || "—")}</td><td>${escaparHtml(o.analista || "—")}</td><td class="ju-num"><span class="ju-dias ${dias > 30 ? "alto" : dias > 10 ? "medio" : ""}">${dias}</span></td></tr>`;
  }).join("") || `<tr><td colspan="6" style="color:var(--muted)">No hay oficios en trámite en el período.</td></tr>`;
  document.getElementById("ju-rep-resultado").hidden = false;
}

function juExportarReporte() {
  const d = juReporteDatos;
  if (!d) return;
  const libro = window.XLSX.utils.book_new();
  const hoja = (nombre, aoa, cols) => {
    const h = window.XLSX.utils.aoa_to_sheet(aoa);
    h["!cols"] = cols.map(wch => ({ wch }));
    window.XLSX.utils.book_append_sheet(libro, h, nombre);
  };
  hoja("Resumen", [
    [`Oficios ingresados entre el ${formatearFecha(d.desde)} y el ${formatearFecha(d.hasta)}`], [],
    ["Ingresos", d.total.total], ["Reingresos incluidos", d.reingresos], ["Finalizados", d.total.finalizados], ["En trámite", d.total.tramite],
    ["Tiempo de respuesta (mediana, días)", d.total.mediana ?? ""], ["Tiempo de respuesta (promedio, días)", d.total.promedio ?? ""], [],
    ["Tiempo de respuesta", "Oficios"], ...d.rangos.map(r => [r.etiqueta, r.valor])
  ], [38, 12]);
  const grupo = (titulo, filas) => [[titulo, "Ingresados", "Finalizados", "En trámite", "Días de respuesta (mediana)"], ...filas.map(f => [f.etiqueta, f.total, f.finalizados, f.tramite, f.mediana ?? ""])];
  hoja("Por trimestre", grupo("Trimestre", d.porTrimestre), [20, 12, 12, 12, 26]);
  hoja("Por motivo", grupo("Motivo", d.porMotivo), [24, 12, 12, 12, 26]);
  hoja("Por analista", grupo("Analista", d.porAnalista), [18, 12, 12, 12, 26]);
  hoja("Por área de salida", [["Área de salida", "Finalizados", "Días de respuesta (mediana)"], ...d.porArea.map(f => [f.etiqueta, f.total, f.mediana ?? ""])], [18, 12, 26]);
  hoja("Más demandados", [["#", "Demandado", "Oficios"], ...d.porDemandado.map((f, i) => [i + 1, f.etiqueta, f.total])], [5, 60, 10]);
  const hoy = juHoyIso();
  hoja("Pendientes", [["Fecha ingreso", "Nº EE", "Carátula", "Motivo", "Analista", "Días en trámite"], ...d.pendientes.map(o => [formatearFecha(o.fecha_ingreso), o.oficio.numero_ee || "", o.oficio.caratula || "", o.oficio.motivo || "", o.analista || "", juDiasEntre(o.fecha_ingreso, hoy)])], [12, 32, 70, 20, 14, 14]);
  window.XLSX.writeFile(libro, `reporte_oficios_${d.desde}_${d.hasta}.xlsx`);
}
