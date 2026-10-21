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
const JU_SELECT = "*,prepaga:obras_sociales!prepaga_id(id,denominacion,rnemp),agente:obras_sociales!agente_id(id,denominacion,rnos)";

let juOficios = [];
let juOficiosCargados = false;
let juOficiosCargando = null;
let juTab = "tramite";
let juPage = 1;
let juEventos = false;
let juPrepagasPorEtiqueta = new Map();
let juAgentesPorEtiqueta = new Map();
let juReporteDatos = null;

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

async function juCargarOficios(forzar = false) {
  if (juOficiosCargados && !forzar) return juOficios;
  if (juOficiosCargando && !forzar) return juOficiosCargando;
  juOficiosCargando = (async () => {
    let todos = [];
    for (let offset = 0; ; offset += 1000) {
      const filas = await juFetch("oficios", { params: { select: JU_SELECT, order: "fecha_ingreso.desc,id.desc", limit: 1000, offset } });
      todos = todos.concat(filas || []);
      if (!filas || filas.length < 1000) break;
    }
    juOficios = todos;
    juOficiosCargados = true;
    return juOficios;
  })();
  try { return await juOficiosCargando; } finally { juOficiosCargando = null; }
}

async function juAsegurarPadron() {
  await asegurarObrasSocialesTodasCargadas();
  juPrepagasPorEtiqueta = new Map();
  juAgentesPorEtiqueta = new Map();
  obrasSocialesTodas.forEach(o => {
    if (o.rnemp) juPrepagasPorEtiqueta.set(`${o.denominacion} (RNEMP ${o.rnemp})`, o.id);
    if (o.rnos) juAgentesPorEtiqueta.set(`${o.denominacion} (RNAS ${o.rnos})`, o.id);
  });
  const llenar = (id, mapa) => { const dl = document.getElementById(id); if (dl) dl.innerHTML = [...mapa.keys()].map(e => `<option value="${escaparHtml(e)}"></option>`).join(""); };
  llenar("ju-prepagas-datalist", juPrepagasPorEtiqueta);
  llenar("ju-agentes-datalist", juAgentesPorEtiqueta);
}

function juEtiquetaDe(mapa, id) {
  for (const [et, v] of mapa) if (String(v) === String(id)) return et;
  return "";
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
  const partes = [];
  if (o.agente?.denominacion) partes.push(o.agente.denominacion);
  if (o.prepaga?.denominacion && o.prepaga.denominacion !== o.agente?.denominacion) partes.push(o.prepaga.denominacion);
  if (o.otros_demandados) partes.push(o.otros_demandados);
  return partes.join(" · ");
}

function juDiasRespuesta(o) {
  return o.fecha_egreso ? juDiasEntre(o.fecha_ingreso, o.fecha_egreso) : null;
}

function juAntiguedad(o) {
  return o.estado === "Finalizado" ? null : juDiasEntre(o.fecha_ingreso, juHoyIso());
}

function juSemaforo(o) {
  if (o.estado === "Finalizado" || !o.fecha_vencimiento) return "";
  const dias = juDiasEntre(juHoyIso(), o.fecha_vencimiento);
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
  on("ju-btn-nuevo", "click", () => requiereAutenticacion(() => juAbrirModal(null)));
  on("ju-exportar", "click", juExportarListado);
  ["ju-search", "ju-motivo-filter", "ju-analista-filter", "ju-area-filter", "ju-trimestre-filter"].forEach(id => {
    on(id, "input", () => { juPage = 1; juRenderOficios(); });
    on(id, "change", () => { juPage = 1; juRenderOficios(); });
  });
  document.querySelectorAll("[data-ju-tab]").forEach(btn => btn.addEventListener("click", () => {
    juTab = btn.dataset.juTab; juPage = 1;
    document.querySelectorAll("[data-ju-tab]").forEach(b => b.classList.toggle("active", b === btn));
    juRenderOficios();
  }));
  on("ju-form", "submit", juGuardar);
  on("ju-eliminar", "click", juEliminar);
  on("ju-egreso", "change", () => {
    const estado = document.getElementById("ju-estado");
    if (document.getElementById("ju-egreso").value) estado.value = "Finalizado";
  });
  on("ju-estado", "change", () => {
    if (document.getElementById("ju-estado").value === "Finalizado" && !document.getElementById("ju-egreso").value) {
      document.getElementById("ju-egreso").value = juHoyIso();
    }
  });
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

function juLlenarFiltros() {
  const llenar = (id, etiqueta, valores) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const actual = sel.value;
    sel.innerHTML = `<option value="">${etiqueta}</option>` + valores.map(v => `<option value="${escaparHtml(v.valor)}">${escaparHtml(v.texto)}</option>`).join("");
    if ([...sel.options].some(o => o.value === actual)) sel.value = actual;
  };
  const unicos = campo => [...new Set(juOficios.map(o => o[campo]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  const motivos = [...new Set([...JU_MOTIVOS, ...unicos("motivo")])];
  llenar("ju-motivo-filter", "Motivo: Todos", motivos.map(v => ({ valor: v, texto: v })));
  llenar("ju-analista-filter", "Analista: Todos", unicos("analista").map(v => ({ valor: v, texto: v })));
  llenar("ju-area-filter", "Área de salida: Todas", [...new Set([...JU_AREAS, ...unicos("area_salida")])].map(v => ({ valor: v, texto: v })));
  const trimestres = [...new Map(juOficios.filter(o => o.fecha_ingreso).map(o => [juClaveTrimestre(o.fecha_ingreso), juTrimestre(o.fecha_ingreso)])).entries()]
    .sort((a, b) => b[0].localeCompare(a[0]));
  llenar("ju-trimestre-filter", "Trimestre: Todos", trimestres.map(([valor, texto]) => ({ valor, texto })));
  const dl = document.getElementById("ju-analistas-datalist");
  if (dl) dl.innerHTML = unicos("analista").map(v => `<option value="${escaparHtml(v)}"></option>`).join("");
}

function juOficiosFiltrados() {
  const q = normalizar(document.getElementById("ju-search")?.value || "");
  const motivo = document.getElementById("ju-motivo-filter")?.value || "";
  const analista = document.getElementById("ju-analista-filter")?.value || "";
  const area = document.getElementById("ju-area-filter")?.value || "";
  const trimestre = document.getElementById("ju-trimestre-filter")?.value || "";
  return juOficios.filter(o =>
    (juTab === "todos" || (juTab === "tramite" ? o.estado !== "Finalizado" : o.estado === "Finalizado")) &&
    (!motivo || o.motivo === motivo) &&
    (!analista || o.analista === analista) &&
    (!area || o.area_salida === area) &&
    (!trimestre || juClaveTrimestre(o.fecha_ingreso) === trimestre) &&
    (!q || [o.numero_ee, o.caratula, o.juzgado, o.descripcion, o.otros_demandados, o.agente?.denominacion, o.agente?.rnos, o.prepaga?.denominacion, o.prepaga?.rnemp]
      .some(v => normalizar(v).includes(q)))
  );
}

function juRenderOficios() {
  const tbody = document.getElementById("ju-table-body");
  if (!tbody) return;
  let filas = juOficiosFiltrados();
  if (juTab === "tramite") filas = [...filas].sort((a, b) => String(a.fecha_ingreso).localeCompare(String(b.fecha_ingreso)));
  const pageInfo = paginarRegistros(filas, juPage);
  juPage = pageInfo.page;
  tbody.innerHTML = pageInfo.items.map(o => {
    const dias = o.estado === "Finalizado" ? juDiasRespuesta(o) : juAntiguedad(o);
    const sem = juSemaforo(o);
    const venc = o.fecha_vencimiento && o.estado !== "Finalizado"
      ? `<span class="ju-venc ${sem}" title="Vence el ${formatearFecha(o.fecha_vencimiento)}">${formatearFecha(o.fecha_vencimiento)}</span>` : "";
    const demandado = juDemandado(o);
    return `<tr class="os-row" data-ju-id="${o.id}" tabindex="0" role="button" title="Clic para abrir">
      <td class="date-cell">${formatearFecha(o.fecha_ingreso)}</td>
      <td class="ju-ee">${escaparHtml(o.numero_ee || "—")}${o.reingreso ? ` <span class="ju-tag">Reingreso</span>` : ""}</td>
      <td class="ellipsis-cell" style="max-width:300px" title="${escaparHtml(o.caratula || "")}">${escaparHtml(o.caratula || "—")}</td>
      <td class="ellipsis-cell" style="max-width:220px" title="${escaparHtml(demandado)}">${escaparHtml(demandado || "—")}</td>
      <td>${escaparHtml(o.motivo || "—")}</td>
      <td>${escaparHtml(o.analista || "—")}</td>
      <td class="date-cell">${o.estado === "Finalizado" ? formatearFecha(o.fecha_egreso) : venc || "—"}</td>
      <td class="ju-num">${dias ?? "—"}</td>
      <td><span class="ju-estado ${o.estado === "Finalizado" ? "fin" : "tram"}">${escaparHtml(o.estado)}</span></td>
    </tr>`;
  }).join("");
  const thFecha = document.getElementById("ju-th-fecha2");
  const thDias = document.getElementById("ju-th-dias");
  if (thFecha) thFecha.textContent = juTab === "tramite" ? "Vencimiento" : juTab === "finalizados" ? "Egreso" : "Egreso / Venc.";
  if (thDias) thDias.textContent = juTab === "tramite" ? "Días en trámite" : juTab === "finalizados" ? "Días de respuesta" : "Días";
  const count = document.getElementById("ju-count");
  if (count) count.textContent = `${filas.length} oficio${filas.length === 1 ? "" : "s"}${pageInfo.totalPages > 1 ? ` · Página ${pageInfo.page} de ${pageInfo.totalPages}` : ""}`;
  document.getElementById("ju-empty").hidden = filas.length !== 0;
  renderPaginacion("ju-pagination", pageInfo, page => { juPage = page; juRenderOficios(); });
  tbody.querySelectorAll("[data-ju-id]").forEach(row => {
    const abrir = () => requiereAutenticacion(() => juAbrirModal(row.dataset.juId));
    row.addEventListener("click", abrir);
    row.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(); } });
  });
}

function juExportarListado() {
  const filas = juOficiosFiltrados();
  const aoa = [["Fecha ingreso", "Nº EE", "Carátula", "RNEMP", "Prepaga demandada", "RNAS", "Agente de Seguro demandado", "Otros demandados", "Juzgado / Sala", "Motivo", "Analista", "Fecha vencimiento", "Fecha egreso", "Área de salida", "Estado", "Días", "Trimestre", "Reingreso", "Descripción"]];
  filas.forEach(o => aoa.push([
    formatearFecha(o.fecha_ingreso), o.numero_ee || "", o.caratula || "", o.prepaga?.rnemp || "", o.prepaga?.denominacion || "", o.agente?.rnos || "", o.agente?.denominacion || "",
    o.otros_demandados || "", o.juzgado || "", o.motivo || "", o.analista || "", o.fecha_vencimiento ? formatearFecha(o.fecha_vencimiento) : "",
    o.fecha_egreso ? formatearFecha(o.fecha_egreso) : "", o.area_salida || "", o.estado, (o.estado === "Finalizado" ? juDiasRespuesta(o) : juAntiguedad(o)) ?? "",
    juTrimestre(o.fecha_ingreso), o.reingreso ? "Sí" : "No", o.descripcion || ""
  ]));
  const libro = window.XLSX.utils.book_new();
  const hoja = window.XLSX.utils.aoa_to_sheet(aoa);
  hoja["!cols"] = [12, 32, 60, 9, 40, 9, 40, 30, 40, 20, 14, 12, 12, 10, 12, 8, 18, 10, 50].map(wch => ({ wch }));
  hoja["!autofilter"] = { ref: `A1:S${aoa.length}` };
  window.XLSX.utils.book_append_sheet(libro, hoja, "Oficios");
  window.XLSX.writeFile(libro, `oficios_${juHoyIso()}.xlsx`);
}

// ---------------- Oficios: ficha ----------------

async function juAbrirModal(id) {
  await juAsegurarPadron();
  const o = id ? juOficios.find(x => String(x.id) === String(id)) : null;
  const form = document.getElementById("ju-form");
  form.reset();
  setFormMessage("ju-message");
  const set = (campo, valor) => { const el = document.getElementById(campo); if (el) el.value = valor ?? ""; };
  set("ju-id", o?.id);
  set("ju-ingreso", o?.fecha_ingreso || juHoyIso());
  set("ju-ee", o?.numero_ee);
  set("ju-caratula", o?.caratula);
  set("ju-prepaga", o?.prepaga_id ? juEtiquetaDe(juPrepagasPorEtiqueta, o.prepaga_id) : "");
  set("ju-agente", o?.agente_id ? juEtiquetaDe(juAgentesPorEtiqueta, o.agente_id) : "");
  set("ju-otros", o?.otros_demandados);
  set("ju-juzgado", o?.juzgado);
  set("ju-motivo", o?.motivo);
  set("ju-analista", o?.analista);
  set("ju-vencimiento", o?.fecha_vencimiento);
  set("ju-egreso", o?.fecha_egreso);
  set("ju-area", o?.area_salida || (o ? "" : "SAC"));
  set("ju-estado", o?.estado || "En trámite");
  set("ju-descripcion", o?.descripcion);
  document.getElementById("ju-reingreso").checked = Boolean(o?.reingreso);
  document.getElementById("ju-modal-title").textContent = o ? "Oficio" : "Nuevo oficio";
  document.getElementById("ju-modal-sub").textContent = o
    ? `${juTrimestre(o.fecha_ingreso)}${o.origen === "teams" ? " · importado de Teams" : ""}` : "";
  const esAdmin = ["administrador", "admin"].includes(normalizarPerfilAcceso(perfilSesionActual()));
  document.getElementById("ju-eliminar").hidden = !(o && esAdmin);
  abrirModal("ju-modal");
  setTimeout(() => document.getElementById(o ? "ju-caratula" : "ju-ee")?.focus(), 0);
}

async function juGuardar(event) {
  event.preventDefault();
  const val = id => document.getElementById(id)?.value.trim() || "";
  const id = val("ju-id");
  const prepagaTxt = val("ju-prepaga"), agenteTxt = val("ju-agente");
  const prepagaId = prepagaTxt ? juPrepagasPorEtiqueta.get(prepagaTxt) : null;
  const agenteId = agenteTxt ? juAgentesPorEtiqueta.get(agenteTxt) : null;
  if (prepagaTxt && !prepagaId) { setFormMessage("ju-message", "Elegí la prepaga de la lista (escribí parte del nombre o el RNEMP)."); return; }
  if (agenteTxt && !agenteId) { setFormMessage("ju-message", "Elegí el Agente de Seguro de la lista (escribí parte del nombre o el RNAS)."); return; }
  if (!val("ju-ingreso")) { setFormMessage("ju-message", "La fecha de ingreso es obligatoria."); return; }
  if (val("ju-egreso") && val("ju-egreso") < val("ju-ingreso")) { setFormMessage("ju-message", "La fecha de egreso no puede ser anterior a la de ingreso."); return; }
  const datos = {
    fecha_ingreso: val("ju-ingreso"),
    numero_ee: val("ju-ee") || null,
    caratula: val("ju-caratula") || null,
    prepaga_id: prepagaId || null,
    agente_id: agenteId || null,
    otros_demandados: val("ju-otros") || null,
    juzgado: val("ju-juzgado") || null,
    motivo: val("ju-motivo") || null,
    analista: val("ju-analista") || null,
    fecha_vencimiento: val("ju-vencimiento") || null,
    fecha_egreso: val("ju-egreso") || null,
    area_salida: val("ju-area") || null,
    estado: val("ju-egreso") ? "Finalizado" : (val("ju-estado") || "En trámite"),
    descripcion: val("ju-descripcion") || null,
    reingreso: document.getElementById("ju-reingreso").checked
  };
  if (!id && datos.numero_ee && !datos.reingreso) {
    const clave = normalizar(datos.numero_ee).replace(/\s+/g, "");
    const previo = juOficios.find(o => normalizar(o.numero_ee).replace(/\s+/g, "") === clave);
    if (previo) {
      const marcar = window.confirm(`El expediente ${datos.numero_ee} ya ingresó el ${formatearFecha(previo.fecha_ingreso)}.\n\n¿Lo cargo como REINGRESO?\n(Aceptar = sí, reingreso · Cancelar = volver a la ficha)`);
      if (!marcar) return;
      datos.reingreso = true;
      document.getElementById("ju-reingreso").checked = true;
    }
  }
  const boton = document.getElementById("ju-guardar");
  boton.disabled = true;
  try {
    if (id) {
      const [fila] = await juFetch("oficios", { method: "PATCH", params: { id: `eq.${id}`, select: JU_SELECT }, body: datos, prefer: "return=representation" });
      juOficios = juOficios.map(o => String(o.id) === String(id) ? fila : o);
    } else {
      const [fila] = await juFetch("oficios", { method: "POST", params: { select: JU_SELECT }, body: datos, prefer: "return=representation" });
      juOficios = [fila, ...juOficios];
    }
    cerrarModal("ju-modal");
    mostrarToast(id ? "Oficio actualizado." : "Oficio cargado.");
    juLlenarFiltros();
    juRenderOficios();
    juReporteDatos = null;
  } catch (error) {
    setFormMessage("ju-message", `No se pudo guardar. ${error.message || ""}`);
  } finally {
    boton.disabled = false;
  }
}

async function juEliminar() {
  const id = document.getElementById("ju-id").value;
  if (!id || !window.confirm("¿Eliminar este oficio? No se puede deshacer.")) return;
  try {
    await juFetch("oficios", { method: "DELETE", params: { id: `eq.${id}` } });
    juOficios = juOficios.filter(o => String(o.id) !== String(id));
    cerrarModal("ju-modal");
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
    const fechas = juOficios.map(o => o.fecha_ingreso).filter(Boolean).sort();
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
  const lista = juOficios.filter(o => (!desde || o.fecha_ingreso >= desde) && (!hasta || o.fecha_ingreso <= hasta));
  const total = juResumenGrupo(lista);
  const fin = lista.filter(o => o.estado === "Finalizado");
  const diasFin = fin.map(juDiasRespuesta).filter(d => Number.isFinite(d) && d >= 0);
  const rangos = [["0 a 2 días", d => d <= 2], ["3 a 5 días", d => d >= 3 && d <= 5], ["6 a 10 días", d => d >= 6 && d <= 10], ["Más de 10 días", d => d > 10]]
    .map(([etiqueta, fn]) => ({ etiqueta, valor: diasFin.filter(fn).length }));

  const porTrimestre = [...juAgrupar(lista, o => juClaveTrimestre(o.fecha_ingreso)).entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, l]) => ({ etiqueta: juTrimestre(l[0].fecha_ingreso), ...juResumenGrupo(l) }));
  const ordenar = arr => arr.sort((a, b) => b.total - a.total || a.etiqueta.localeCompare(b.etiqueta, "es"));
  const porMotivo = ordenar([...juAgrupar(lista, o => o.motivo).entries()].map(([k, l]) => ({ etiqueta: k, ...juResumenGrupo(l) })));
  const porAnalista = ordenar([...juAgrupar(lista, o => o.analista).entries()].map(([k, l]) => ({ etiqueta: k, ...juResumenGrupo(l) })));
  const porArea = ordenar([...juAgrupar(fin, o => o.area_salida).entries()].map(([k, l]) => ({ etiqueta: k, ...juResumenGrupo(l) })));
  const demandados = new Map();
  lista.forEach(o => {
    const ents = [];
    if (o.agente) ents.push(o.agente.denominacion);
    if (o.prepaga && o.prepaga.denominacion !== o.agente?.denominacion) ents.push(o.prepaga.denominacion);
    new Set(ents).forEach(n => demandados.set(n, (demandados.get(n) || 0) + 1));
  });
  const porDemandado = [...demandados.entries()].map(([etiqueta, total]) => ({ etiqueta, total })).sort((a, b) => b.total - a.total).slice(0, 15);
  const pendientes = lista.filter(o => o.estado !== "Finalizado").sort((a, b) => String(a.fecha_ingreso).localeCompare(String(b.fecha_ingreso)));

  juReporteDatos = { desde, hasta, total, rangos, porTrimestre, porMotivo, porAnalista, porArea, porDemandado, pendientes };

  const kpi = (titulo, valor, nota = "") => `<div class="ju-kpi"><span>${titulo}</span><strong>${valor}</strong>${nota ? `<small>${nota}</small>` : ""}</div>`;
  document.getElementById("ju-rep-kpis").innerHTML =
    kpi("Oficios ingresados", total.total) +
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
    return `<tr><td class="date-cell">${formatearFecha(o.fecha_ingreso)}</td><td class="ju-ee">${escaparHtml(o.numero_ee || "—")}</td><td class="ellipsis-cell" style="max-width:280px" title="${escaparHtml(o.caratula || "")}">${escaparHtml(o.caratula || "—")}</td><td>${escaparHtml(o.motivo || "—")}</td><td>${escaparHtml(o.analista || "—")}</td><td class="ju-num"><span class="ju-dias ${dias > 30 ? "alto" : dias > 10 ? "medio" : ""}">${dias}</span></td></tr>`;
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
    ["Ingresados", d.total.total], ["Finalizados", d.total.finalizados], ["En trámite", d.total.tramite],
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
  hoja("Pendientes", [["Fecha ingreso", "Nº EE", "Carátula", "Motivo", "Analista", "Días en trámite"], ...d.pendientes.map(o => [formatearFecha(o.fecha_ingreso), o.numero_ee || "", o.caratula || "", o.motivo || "", o.analista || "", juDiasEntre(o.fecha_ingreso, hoy)])], [12, 32, 70, 20, 14, 14]);
  window.XLSX.writeFile(libro, `reporte_oficios_${d.desde}_${d.hasta}.xlsx`);
}
