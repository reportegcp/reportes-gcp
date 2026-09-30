// =====================================================================
// Módulo Auditorías (Auditoría Integral - GCP)
// Paso 1: alta con Orden de Auditoría, visitas, Requerimiento en PDF,
// checklist de puntos y registro de documentación recibida.
// Depende de funciones globales de app.js (buildTableUrl, authHeaders,
// asegurarSesionVigente, fetchConTimeout, leerErrorApi, escaparHtml, etc.)
// =====================================================================

const AU_ESTADOS = [
  "Orden cargada",
  "1º visita realizada",
  "Esperando documentación",
  "Documentación recibida",
  "2º visita",
  "Informe en borrador",
  "Informe emitido",
  "Cerrada"
];
const AU_ESTADOS_PREVIOS_A_DOCUMENTACION = ["Orden cargada", "1º visita realizada", "Esperando documentación"];
const AU_EJES = {
  A: "Estructura organizacional y acceso",
  B: "Población beneficiaria",
  C: "Red prestacional",
  D: "Gestión y auditoría médica",
  E: "Programas preventivos",
  F: "Cumplimiento normativo"
};
const AU_BUCKET = "auditorias";

let auAuditorias = [];
let auCargadas = false;
let auVistaEstado = "activas";
let auActual = null;
let auPuntos = [];
let auDocs = [];
let auEditandoPuntos = false;
let auOsPorEtiqueta = new Map();
let auEventosVinculados = false;
let auPlantillaItems = [];
let auPlantillaTextos = {};
let auEjes = {};
let auPasoActivo = 1;
let auEjeActivo = "A";
let auEditor = null;
let auEditorCargando = null;

// ---------------- API ----------------

async function auFetch(table, { method = "GET", params = {}, body, prefer } = {}) {
  const session = await asegurarSesionVigente();
  const headers = { ...authHeaders(session.access_token) };
  if (prefer) headers.Prefer = prefer;
  const response = await fetchConTimeout(buildTableUrl(table, params), {
    method,
    headers,
    cache: "no-store",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  }, 15000);
  if (!response.ok) {
    const detalle = await leerErrorApi(response);
    throw new Error(detalle || `Supabase respondió ${response.status}.`);
  }
  if (method === "DELETE" || response.status === 204) return null;
  const texto = await response.text();
  return texto ? JSON.parse(texto) : null;
}

function auNombreSeguro(nombre) {
  const limpio = String(nombre || "archivo")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_");
  return limpio.slice(-120) || "archivo";
}

async function auSubirArchivo(path, file) {
  const session = await asegurarSesionVigente();
  const resp = await fetch(`${SUPABASE_URL}/storage/v1/object/${AU_BUCKET}/${path}`, {
    method: "POST",
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${session.access_token}`, "Content-Type": file.type || "application/octet-stream" },
    body: file
  });
  if (!resp.ok) throw new Error(`No se pudo subir el archivo (${(await leerErrorApi(resp)) || resp.status}).`);
  return path;
}

async function auBorrarArchivo(path) {
  if (!path) return;
  try {
    const session = await asegurarSesionVigente();
    await fetch(`${SUPABASE_URL}/storage/v1/object/${AU_BUCKET}/${path}`, { method: "DELETE", headers: authHeaders(session.access_token) });
  } catch (error) {
    console.error("No se pudo borrar el archivo", path, error);
  }
}

async function auAbrirArchivo(path) {
  // El bucket es privado: se pide un enlace temporal (10 minutos).
  const ventana = window.open("", "_blank");
  try {
    const session = await asegurarSesionVigente();
    const resp = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${AU_BUCKET}/${path}`, {
      method: "POST",
      headers: authHeaders(session.access_token),
      body: JSON.stringify({ expiresIn: 600 })
    });
    if (!resp.ok) throw new Error((await leerErrorApi(resp)) || "No se pudo abrir el archivo.");
    const data = await resp.json();
    const url = `${SUPABASE_URL}/storage/v1${data.signedURL || data.signedUrl}`;
    if (ventana) ventana.location.href = url; else window.open(url, "_blank");
  } catch (error) {
    if (ventana) ventana.close();
    mostrarToast(error.message || "No se pudo abrir el archivo.", "error");
  }
}

// ---------------- Utilidades ----------------

function auFormatearRnas(rnos) {
  const r = String(rnos || "").trim();
  return /^\d{6}$/.test(r) ? `${r[0]}-${r.slice(1, 5)}-${r[5]}` : r;
}

function auAnioAuditoria(aud) {
  const f = aud?.fecha_visita_1;
  return f ? Number(String(f).slice(0, 4)) : new Date().getFullYear();
}

function auReemplazarAnios(texto, anio) {
  return String(texto || "")
    .replaceAll("{ANIO_2}", String(anio - 2))
    .replaceAll("{ANIO_1}", String(anio - 1))
    .replaceAll("{ANIO}", String(anio));
}

function auFechaLarga(iso) {
  if (!iso) return "";
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const [a, m, d] = String(iso).split("-").map(Number);
  return `${d} de ${meses[m - 1]} de ${a}`;
}

function auClaseEstadoPunto(estado) {
  return {
    Recibido: "au-est-recibido",
    Parcial: "au-est-parcial",
    "No aportado": "au-est-noaportado"
  }[estado] || "au-est-pendiente";
}

function auTextoPlano(html) {
  const div = document.createElement("div");
  div.innerHTML = String(html || "").replace(/<li[^>]*>/gi, " · ").replace(/<(p|br|div)[^>]*>/gi, " ");
  return (div.textContent || "").replace(/\s+/g, " ").trim();
}

async function auAsegurarOs() {
  await asegurarObrasSocialesTodasCargadas();
  auOsPorEtiqueta = new Map();
  obrasSocialesTodas
    .filter(o => o.tipo === "Obra Social")
    .forEach(o => auOsPorEtiqueta.set(`${o.denominacion}${o.rnos ? ` (${o.rnos})` : ""}`, o.id));
  const dl = document.getElementById("au-os-datalist");
  if (dl) dl.innerHTML = [...auOsPorEtiqueta.keys()].map(e => `<option value="${escaparHtml(e)}"></option>`).join("");
}

function auEtiquetaOs(id) {
  for (const [etiqueta, osId] of auOsPorEtiqueta) if (String(osId) === String(id)) return etiqueta;
  return "";
}

// ---------------- Inicialización ----------------

function inicializarVistaAuditorias(vista) {
  if (!auEventosVinculados) auVincularEventos();
  if (vista === "au-auditorias") {
    auMostrarLista();
    if (!auCargadas) auCargarLista();
  }
  if (vista === "au-plantilla") auCargarPlantilla();
  if (vista === "au-pendientes") auCargarPendientes();
}

function auVincularEventos() {
  auEventosVinculados = true;
  const on = (id, ev, fn) => document.getElementById(id)?.addEventListener(ev, fn);

  on("au-btn-nueva", "click", () => requiereAutenticacion(auAbrirNueva));
  on("au-tab-activas", "click", () => auCambiarTab("activas"));
  on("au-tab-cerradas", "click", () => auCambiarTab("cerradas"));
  on("au-search", "input", auRenderLista);
  on("au-nueva-form", "submit", auCrearAuditoria);
  on("au-volver", "click", async () => { await auGuardarEjeSiHayCambios(); await auGuardarPunto3SiHayCambios(); await auGuardarObservacionesSiHayCambios(); await auGuardarConclusionSiHayCambios(); auMostrarLista(); auCargarLista(); });
  on("au-obs-agregar", "click", () => { auLeerObsDelDom(); auObs.push({ eje: "", texto: "", sugerencia: "" }); auObsSucio = true; auRenderObs(); });
  on("au-obs-proponer", "click", auReproponerObservaciones);
  on("au-obs-guardar", "click", () => auGuardarObservaciones(false));
  on("au-obs-continuar", "click", () => auGuardarObservaciones(true));
  on("au-conc-proponer", "click", auReproponerConclusion);
  on("au-conc-guardar", "click", () => auGuardarConclusion(true));
  on("au-marcar-emitido", "click", auMarcarEmitido);
  on("au-word", "click", auDescargarWord);
  on("au-form", "submit", auGuardarDatos);
  on("au-eliminar", "click", auEliminarAuditoria);
  on("au-orden-subir", "click", auSubirOrden);
  on("au-btn-requerimiento", "click", () => auGenerarPdfRequerimiento(auActual, auPuntos));
  on("au-req-entregado", "click", auConfirmarEntregaRequerimiento);
  on("au-doc-terminar", "click", auTerminarDocumentacion);
  on("au-eje-guardar", "click", () => auGuardarEje(false));
  on("au-eje-siguiente", "click", () => auGuardarEje(true));
  on("au-eje-restaurar", "click", auRestaurarEje);
  on("au-puntos-editar", "click", () => { auEditandoPuntos = true; auRenderPuntos(); });
  on("au-puntos-cancelar", "click", () => { auEditandoPuntos = false; auRenderPuntos(); });
  on("au-puntos-guardar", "click", auGuardarTextosPuntos);
  on("au-p3-guardar", "click", () => auGuardarPunto3(false));
  on("au-p3-siguiente", "click", () => auGuardarPunto3(true));
  on("au-p3-anterior", "click", () => auAbrirPunto3(auPuntoActivo - 1));
  on("au-p3-estado", "change", () => { auP3EstadoTocado = true; document.getElementById("au-p3-guardado").textContent = "Cambios sin guardar"; });
  on("au-p3-subir", "click", auAdjuntarArchivoPunto);
  on("au-ir-pendientes", "click", async () => { await auGuardarPunto3SiHayCambios(); auPendFiltroAuditoria = auActual.id; showView("au-pendientes"); });
  on("au-pl-agregar", "click", () => auAbrirEditorPunto(null));
  auVincularComboPendientes();
  on("au-pend-filtro", "change", auRenderPendientes);

  on("au-pl-preview", "click", auPreviewPlantilla);
  on("au-pl-enc-editar", "click", auAbrirEditorEncabezado);
  on("au-enc-guardar", "click", auGuardarEncabezado);
  on("au-punto-guardar", "click", auGuardarPunto);
  on("au-punto-quitar", "click", auQuitarPunto);

  document.querySelectorAll("[data-au-toolbar]").forEach(tb => auVincularToolbar(tb, document.getElementById(tb.dataset.auToolbar)));
}

function auVincularToolbar(toolbar, rte) {
  if (!toolbar || !rte) return;
  toolbar.querySelectorAll("[data-cmd]").forEach(btn => {
    btn.addEventListener("mousedown", e => e.preventDefault());
    btn.addEventListener("click", () => { rte.focus(); document.execCommand(btn.dataset.cmd, false, null); });
  });
}

// ---------------- Listado ----------------

function auMostrarLista() {
  document.getElementById("au-lista").hidden = false;
  document.getElementById("au-detalle").hidden = true;
  auActual = null;
}

function auCambiarTab(tab) {
  auVistaEstado = tab;
  document.getElementById("au-tab-activas")?.classList.toggle("active", tab === "activas");
  document.getElementById("au-tab-cerradas")?.classList.toggle("active", tab === "cerradas");
  auRenderLista();
}

async function auCargarLista() {
  const count = document.getElementById("au-count");
  if (count) count.textContent = "Cargando auditorías...";
  try {
    const [filas] = await Promise.all([
      auFetch("auditorias", { params: { select: "*,obras_sociales(denominacion,rnos,sigla),auditoria_puntos(estado)", order: "fecha_visita_1.desc.nullsfirst,created_at.desc" } }),
      auAsegurarOs()
    ]);
    auAuditorias = filas || [];
    auCargadas = true;
    auRenderLista();
  } catch (error) {
    if (count) count.textContent = `No se pudieron cargar las auditorías. ${error.message || ""}`;
    console.error(error);
  }
}

function auRenderLista() {
  const tbody = document.getElementById("au-table-body");
  if (!tbody) return;
  const termino = normalizar(document.getElementById("au-search")?.value || "");
  const filas = auAuditorias
    .filter(a => auVistaEstado === "cerradas" ? a.estado === "Cerrada" : a.estado !== "Cerrada")
    .filter(a => !termino ||
      normalizar(a.numero_ex).includes(termino) ||
      normalizar(a.obras_sociales?.denominacion).includes(termino) ||
      normalizar(a.obras_sociales?.sigla).includes(termino) ||
      normalizar(a.obras_sociales?.rnos).includes(termino));

  tbody.innerHTML = filas.map(a => {
    const puntos = a.auditoria_puntos || [];
    const recibidos = puntos.filter(p => p.estado === "Recibido" || p.estado === "Parcial").length;
    const visita2 = a.visita_2_estado === "Programada" || a.visita_2_estado === "Realizada"
      ? `${a.visita_2_estado}${a.fecha_visita_2 ? ` · ${formatearFecha(a.fecha_visita_2)}` : ""}`
      : a.visita_2_estado;
    return `<tr class="os-row" data-au-id="${a.id}" tabindex="0" role="button" title="Clic para abrir">
      <td class="ellipsis-cell" style="max-width:170px" title="${escaparHtml(a.numero_ex)}"><strong>${escaparHtml(a.numero_ex)}</strong></td>
      <td class="ellipsis-cell" style="max-width:240px" title="${escaparHtml(a.obras_sociales?.denominacion || "")}">${escaparHtml(a.obras_sociales?.sigla || a.obras_sociales?.denominacion || "—")}</td>
      <td>${escaparHtml(auFormatearRnas(a.obras_sociales?.rnos))}</td>
      <td class="date-cell">${formatearFecha(a.fecha_visita_1)}</td>
      <td>${escaparHtml(visita2)}</td>
      <td>${recibidos} de ${puntos.length}</td>
      <td><span class="au-estado-pill">${escaparHtml(a.estado)}</span></td>
    </tr>`;
  }).join("");

  const count = document.getElementById("au-count");
  if (count) count.textContent = `${filas.length} auditoría${filas.length === 1 ? "" : "s"}`;
  document.getElementById("au-empty").hidden = filas.length !== 0;
  tbody.querySelectorAll("[data-au-id]").forEach(row => {
    const abrir = () => requiereAutenticacion(() => auAbrirDetalle(row.dataset.auId));
    row.addEventListener("click", abrir);
    row.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(); } });
  });
}

// ---------------- Alta ----------------

async function auAbrirNueva() {
  await auAsegurarOs();
  document.getElementById("au-nueva-form").reset();
  setFormMessage("au-nueva-message");
  abrirModal("au-nueva-modal");
  setTimeout(() => document.getElementById("au-nueva-ex")?.focus(), 0);
}

async function auCrearAuditoria(event) {
  event.preventDefault();
  const boton = document.getElementById("au-nueva-guardar");
  setFormMessage("au-nueva-message");
  const numeroEx = document.getElementById("au-nueva-ex").value.trim();
  const osTexto = document.getElementById("au-nueva-os").value.trim();
  const osId = auOsPorEtiqueta.get(osTexto);
  if (!numeroEx) return setFormMessage("au-nueva-message", "El Nº EX es obligatorio.");
  if (!osId) return setFormMessage("au-nueva-message", "Elegí una Obra Social de la lista desplegable.");
  const archivo = document.getElementById("au-nueva-orden").files?.[0];
  if (archivo && archivo.size > 20 * 1024 * 1024) return setFormMessage("au-nueva-message", "El archivo de la orden no puede superar los 20 MB.");

  try {
    boton.disabled = true;
    const plantilla = await auFetch("auditoria_requerimiento_items", { params: { select: "texto_html,modelo_html,eje,orden", activo: "eq.true", order: "orden.asc" } });
    if (!plantilla?.length) throw new Error("La plantilla del Requerimiento no tiene puntos activos.");

    const [aud] = await auFetch("auditorias", {
      method: "POST", prefer: "return=representation",
      body: {
        numero_ex: numeroEx,
        obra_social_id: osId,
        numero_if_orden: document.getElementById("au-nueva-if").value.trim() || null,
        fecha_visita_1: document.getElementById("au-nueva-fecha").value || null
      }
    }).catch(error => {
      throw new Error(/duplicate|unique|23505/i.test(error.message) ? "Ya existe una auditoría con ese Nº EX." : error.message);
    });

    await auFetch("auditoria_puntos", {
      method: "POST",
      body: plantilla.map((item, i) => ({ auditoria_id: aud.id, numero: i + 1, texto_html: item.texto_html, modelo_html: item.modelo_html, eje: item.eje }))
    });

    if (archivo) {
      const path = await auSubirArchivo(`${aud.id}/orden/${Date.now()}_${auNombreSeguro(archivo.name)}`, archivo);
      await auFetch("auditorias", { method: "PATCH", params: { id: `eq.${aud.id}` }, body: { orden_archivo_path: path, orden_nombre_archivo: archivo.name } });
    }

    cerrarModal("au-nueva-modal");
    mostrarToast("Auditoría creada.");
    auCargadas = false;
    await auAbrirDetalle(aud.id);
  } catch (error) {
    setFormMessage("au-nueva-message", error.message || "No se pudo crear la auditoría.");
  } finally {
    boton.disabled = false;
  }
}

// ---------------- Detalle ----------------

async function auAbrirDetalle(id) {
  await auAsegurarOs();
  try {
    const [filas, puntos, docs, ejes] = await Promise.all([
      auFetch("auditorias", { params: { id: `eq.${id}`, select: "*,obras_sociales(denominacion,rnos,sigla,inicio_ejercicio)" } }),
      auFetch("auditoria_puntos", { params: { auditoria_id: `eq.${id}`, order: "numero.asc" } }),
      auFetch("auditoria_documentos", { params: { auditoria_id: `eq.${id}`, order: "fecha_recepcion.asc.nullslast,created_at.asc" } }),
      auFetch("auditoria_ejes", { params: { auditoria_id: `eq.${id}` } })
    ]);
    if (!filas?.length) throw new Error("No se encontró la auditoría.");
    auActual = filas[0];
    auPuntos = puntos || [];
    auDocs = docs || [];
    auEjes = {};
    (ejes || []).forEach(e => { auEjes[e.eje] = e; });
    auEditandoPuntos = false;
    auPasoActivo = auPrimerPasoPendiente();
    document.getElementById("au-lista").hidden = true;
    document.getElementById("au-detalle").hidden = false;
    auRenderDetalle();
    window.scrollTo({ top: 0 });
    if (auPasoActivo === 3) auAbrirPaso3();
    if (auPasoActivo === 4) auAbrirInforme();
    if (auPasoActivo === 5) auAbrirObservaciones();
    if (auPasoActivo === 6) auAbrirConclusion();
  } catch (error) {
    mostrarToast(error.message || "No se pudo abrir la auditoría.", "error");
  }
}

function auRenderDetalle() {
  const a = auActual;
  const os = a.obras_sociales || {};
  document.getElementById("au-detalle-os").textContent = `${os.denominacion || ""}${os.sigla ? ` (${os.sigla})` : ""}`;
  document.getElementById("au-detalle-sub").textContent = `RNAS ${auFormatearRnas(os.rnos)} · ${a.numero_ex} · ${a.estado}`;

  const estadoSel = document.getElementById("au-estado");
  estadoSel.innerHTML = AU_ESTADOS.map(e => `<option>${escaparHtml(e)}</option>`).join("");
  document.getElementById("au-id").value = a.id;
  document.getElementById("au-numero-ex").value = a.numero_ex || "";
  document.getElementById("au-os-input").value = auEtiquetaOs(a.obra_social_id);
  document.getElementById("au-if-orden").value = a.numero_if_orden || "";
  document.getElementById("au-tipo").value = a.tipo || "Integral";
  document.getElementById("au-fecha-visita-1").value = a.fecha_visita_1 || "";
  document.getElementById("au-auditores").value = a.auditores || "";
  document.getElementById("au-visita2-estado").value = a.visita_2_estado || "Pendiente";
  document.getElementById("au-fecha-visita-2").value = a.fecha_visita_2 || "";
  estadoSel.value = a.estado || "Orden cargada";
  document.getElementById("au-observaciones").value = a.observaciones_internas || "";
  setFormMessage("au-form-message");
  auRenderOrden();
  auRenderPuntos();
  auResetFormDoc();
  auRenderDocs();
  auRenderPasos();
}

function auRenderOrden() {
  const cont = document.getElementById("au-orden-actual");
  const caja = document.getElementById("au-orden-subir-box");
  const a = auActual;
  if (a.orden_archivo_path) {
    cont.innerHTML = `<div class="au-orden-fila">
        <button type="button" class="au-link" id="au-orden-ver">📄 ${escaparHtml(a.orden_nombre_archivo || "Orden de auditoría")}</button>
        <button type="button" class="au-link au-orden-cambiar" id="au-orden-cambiar">Reemplazar archivo</button>
      </div>
      <span class="au-hint">Ya está cargada. Clic en el nombre para abrirla.</span>`;
    caja.hidden = true;
    document.getElementById("au-orden-ver").addEventListener("click", () => auAbrirArchivo(a.orden_archivo_path));
    document.getElementById("au-orden-cambiar").addEventListener("click", () => { caja.hidden = false; });
  } else {
    cont.innerHTML = `<span class="au-hint">Todavía no se cargó. Elegí el archivo y tocá "Subir archivo".</span>`;
    caja.hidden = false;
  }
}

async function auSubirOrden() {
  const input = document.getElementById("au-orden-file");
  const archivo = input.files?.[0];
  if (!archivo) return setFormMessage("au-form-message", "Elegí el archivo de la orden.");
  if (archivo.size > 20 * 1024 * 1024) return setFormMessage("au-form-message", "El archivo no puede superar los 20 MB.");
  const boton = document.getElementById("au-orden-subir");
  try {
    boton.disabled = true;
    const anterior = auActual.orden_archivo_path;
    const path = await auSubirArchivo(`${auActual.id}/orden/${Date.now()}_${auNombreSeguro(archivo.name)}`, archivo);
    await auFetch("auditorias", { method: "PATCH", params: { id: `eq.${auActual.id}` }, body: { orden_archivo_path: path, orden_nombre_archivo: archivo.name } });
    if (anterior) await auBorrarArchivo(anterior);
    auActual.orden_archivo_path = path;
    auActual.orden_nombre_archivo = archivo.name;
    input.value = "";
    auRenderOrden();
    mostrarToast("Orden de auditoría subida.");
  } catch (error) {
    setFormMessage("au-form-message", error.message);
  } finally {
    boton.disabled = false;
  }
}

async function auGuardarDatos(event) {
  event.preventDefault();
  setFormMessage("au-form-message");
  const numeroEx = document.getElementById("au-numero-ex").value.trim();
  const osId = auOsPorEtiqueta.get(document.getElementById("au-os-input").value.trim());
  if (!numeroEx) return setFormMessage("au-form-message", "El Nº EX es obligatorio.");
  if (!osId) return setFormMessage("au-form-message", "Elegí una Obra Social de la lista desplegable.");
  const visita2 = document.getElementById("au-visita2-estado").value;
  const fecha2 = document.getElementById("au-fecha-visita-2").value || null;
  if ((visita2 === "Programada" || visita2 === "Realizada") && !fecha2) return setFormMessage("au-form-message", "Indicá la fecha de la 2º visita.");

  const boton = document.getElementById("au-guardar");
  try {
    boton.disabled = true;
    const [fila] = await auFetch("auditorias", {
      method: "PATCH", prefer: "return=representation", params: { id: `eq.${auActual.id}`, select: "*,obras_sociales(denominacion,rnos,sigla,inicio_ejercicio)" },
      body: {
        numero_ex: numeroEx,
        obra_social_id: osId,
        numero_if_orden: document.getElementById("au-if-orden").value.trim() || null,
        tipo: document.getElementById("au-tipo").value,
        fecha_visita_1: document.getElementById("au-fecha-visita-1").value || null,
        auditores: document.getElementById("au-auditores").value.trim() || null,
        visita_2_estado: visita2,
        fecha_visita_2: visita2 === "No requerida" ? null : fecha2,
        estado: document.getElementById("au-estado").value,
        observaciones_internas: document.getElementById("au-observaciones").value.trim() || null,
        updated_at: new Date().toISOString()
      }
    }).catch(error => {
      throw new Error(/duplicate|unique|23505/i.test(error.message) ? "Ya existe otra auditoría con ese Nº EX." : error.message);
    });
    auActual = fila;
    auCargadas = false;
    auRenderDetalle();
    if (auPasoCompleto(1)) {
      mostrarToast("Datos guardados.");
      auIrAPaso(auPrimerPasoPendiente());
    } else {
      setFormMessage("au-form-message", "Datos guardados. Para continuar falta la fecha de la 1º visita.", "neutral");
    }
  } catch (error) {
    setFormMessage("au-form-message", error.message || "No se pudieron guardar los datos.");
  } finally {
    boton.disabled = false;
  }
}

async function auEliminarAuditoria() {
  const ok = await mostrarConfirmacion(`¿Eliminar la auditoría ${auActual.numero_ex}? Se borran también la orden, los puntos y toda la documentación cargada. No se puede deshacer.`, { titulo: "Eliminar auditoría", textoAceptar: "Eliminar" });
  if (!ok) return;
  try {
    const archivos = [auActual.orden_archivo_path, ...auDocs.map(d => d.archivo_path)].filter(Boolean);
    await auFetch("auditorias", { method: "DELETE", params: { id: `eq.${auActual.id}` } });
    for (const path of archivos) await auBorrarArchivo(path);
    mostrarToast("Auditoría eliminada.");
    auMostrarLista();
    auCargadas = false;
    auCargarLista();
  } catch (error) {
    setFormMessage("au-form-message", error.message || "No se pudo eliminar.");
  }
}

// ---------------- Puntos del requerimiento ----------------

function auDocsDePunto(numero) {
  return auDocs.filter(d => (d.puntos || []).includes(numero));
}

function auRenderPuntos() {
  const anio = auAnioAuditoria(auActual);
  // Paso 2: texto del requerimiento (como la hoja impresa)
  const req = document.getElementById("au-req-lista");
  document.getElementById("au-puntos-edicion-acciones").hidden = !auEditandoPuntos;
  document.getElementById("au-puntos-editar").hidden = auEditandoPuntos;
  if (auEditandoPuntos) {
    req.innerHTML = auPuntos.map(p => `<li class="au-hoja-punto au-punto-edit-li">
        <div class="anexo-i-rte au-punto-rte" contenteditable="true" data-au-punto-texto="${p.id}">${p.texto_html}</div>
      </li>`).join("");
  } else {
    req.innerHTML = auPuntos.map(p => `<li class="au-hoja-punto au-hoja-punto-fijo"><div class="au-hoja-punto-texto">${auResaltarAnios(p.texto_html, anio)}</div></li>`).join("");
  }

  auRenderP3Nums();
}

async function auCambiarEstadoPunto(id, estado, manual) {
  try {
    await auFetch("auditoria_puntos", { method: "PATCH", params: { id: `eq.${id}` }, body: { estado, estado_manual: manual } });
    const p = auPuntos.find(x => x.id === id);
    if (p) { p.estado = estado; p.estado_manual = manual; }
    auCargadas = false;
    auRenderPuntos();
  } catch (error) {
    mostrarToast(error.message || "No se pudo cambiar el estado.", "error");
  }
}

async function auVolverAutomatico(id) {
  const p = auPuntos.find(x => x.id === id);
  if (!p) return;
  await auCambiarEstadoPunto(id, (auDocsDePunto(p.numero).length || auTieneTexto(p.respuesta_html)) ? "Recibido" : "Pendiente", false);
}

async function auRecalcularEstadosAutomaticos() {
  for (const p of auPuntos) {
    if (p.estado_manual) continue;
    const deseado = (auDocsDePunto(p.numero).length || auTieneTexto(p.respuesta_html)) ? "Recibido" : "Pendiente";
    if (p.estado !== deseado) {
      await auFetch("auditoria_puntos", { method: "PATCH", params: { id: `eq.${p.id}` }, body: { estado: deseado } });
      p.estado = deseado;
    }
  }
}

async function auGuardarTextosPuntos() {
  const boton = document.getElementById("au-puntos-guardar");
  try {
    boton.disabled = true;
    for (const el of document.querySelectorAll("[data-au-punto-texto]")) {
      const p = auPuntos.find(x => x.id === el.dataset.auPuntoTexto);
      const nuevo = el.innerHTML.trim();
      if (p && nuevo && nuevo !== p.texto_html) {
        await auFetch("auditoria_puntos", { method: "PATCH", params: { id: `eq.${p.id}` }, body: { texto_html: nuevo } });
        p.texto_html = nuevo;
      }
    }
    auEditandoPuntos = false;
    auRenderPuntos();
    mostrarToast("Texto del requerimiento actualizado para esta auditoría.");
  } catch (error) {
    mostrarToast(error.message || "No se pudo guardar el texto.", "error");
  } finally {
    boton.disabled = false;
  }
}

// ---------------- Paso 3: respuesta punto por punto ----------------

let auPuntoActivo = 1;
let auEditorPunto = null;
let auP3EstadoTocado = false;
let auP3ModeloCargado = null;

function auTieneTexto(html) {
  return !!auTextoPlano(html) || /<img/i.test(html || "");
}

function auClaseDot(estado) {
  return { Recibido: "recibido", Parcial: "parcial", "No aportado": "noaportado" }[estado] || "";
}

function auRenderDocs() {
  auRenderP3Nums();
  auRenderAdjuntosPunto();
}
function auResetFormDoc() {}

function auRenderP3Nums() {
  const cont = document.getElementById("au-p3-nums");
  if (!cont) return;
  cont.innerHTML = auPuntos.map(p => `<button type="button" class="au-p3-num ${auClaseDot(p.estado)} ${p.numero === auPuntoActivo ? "activo" : ""}" data-au-p3-num="${p.numero}" title="${escaparHtml(p.estado)}">${p.numero}</button>`).join("");
  cont.querySelectorAll("[data-au-p3-num]").forEach(b => b.addEventListener("click", () => auAbrirPunto3(Number(b.dataset.auP3Num))));
  const recibidos = auPuntos.filter(p => p.estado === "Recibido").length;
  const faltan = auPuntos.filter(p => p.estado === "Pendiente").length;
  document.getElementById("au-p3-resumen").textContent = `${recibidos} de ${auPuntos.length} recibidos · ${faltan} pendientes`;
}

function auRenderAdjuntosPunto() {
  const cont = document.getElementById("au-p3-adj-lista");
  if (!cont) return;
  const docs = auDocsDePunto(auPuntoActivo);
  cont.innerHTML = docs.length ? docs.map(d => `<div class="au-p3-adj">
      ${d.archivo_path ? `<button type="button" class="au-link" data-au-adj-ver="${d.id}">📄 ${escaparHtml(d.nombre_archivo || d.nombre)}</button>` : `<span>${escaparHtml(d.nombre)}</span>`}
      <button type="button" class="au-link au-link-danger" data-au-adj-borrar="${d.id}">Quitar</button>
    </div>`).join("") : `<span class="au-hint">Sin archivos.</span>`;
  cont.querySelectorAll("[data-au-adj-ver]").forEach(b => b.addEventListener("click", () => auAbrirArchivo(auDocs.find(d => d.id === b.dataset.auAdjVer)?.archivo_path)));
  cont.querySelectorAll("[data-au-adj-borrar]").forEach(b => b.addEventListener("click", () => auBorrarDoc(b.dataset.auAdjBorrar)));
}

async function auAbrirPaso3() {
  const primero = auPuntos.find(p => p.estado === "Pendiente")?.numero || 1;
  await auAbrirPunto3(primero, true);
}

async function auAbrirPunto3(numero, forzar = false) {
  if (!forzar && numero === auPuntoActivo && auEditorPunto) return;
  await auGuardarPunto3SiHayCambios();
  auPuntoActivo = numero;
  const p = auPuntos.find(x => x.numero === numero);
  if (!p) return;
  const anio = auAnioAuditoria(auActual);
  document.getElementById("au-p3-titulo").innerHTML = `<span class="au-p3-titulo-num">Punto ${p.numero}</span><div class="au-p3-titulo-texto">${auReemplazarAnios(p.texto_html, anio)}</div>`;
  document.getElementById("au-p3-estado").value = p.estado;
  auP3EstadoTocado = false;
  document.getElementById("au-p3-anterior").disabled = numero <= 1;
  const btnSig = document.getElementById("au-p3-siguiente");
  btnSig.hidden = numero >= auPuntos.length;
  btnSig.textContent = `Guardar y seguir con el punto ${numero + 1} →`;
  auRenderP3Nums();
  auRenderAdjuntosPunto();
  const estadoEl = document.getElementById("au-p3-guardado");
  estadoEl.textContent = "Cargando editor...";
  try {
    if (!auEditorPunto) auEditorPunto = await auCrearEditor("#au-p3-editor", 420, "au-p3-guardado");
    auEditorPunto.mode.set(soloLecturaActiva() ? "readonly" : "design");
    const usaModelo = !p.respuesta_html;
    auEditorPunto.setContent(p.respuesta_html || await auRenderModelo(p.modelo_html));
    auP3ModeloCargado = usaModelo ? auEditorPunto.getContent() : null;
    auEditorPunto.undoManager.clear();
    auEditorPunto.setDirty(false);
    estadoEl.textContent = usaModelo ? (p.modelo_html ? "Texto modelo: completá los ____ y guardá" : "") : "Guardado";
  } catch (error) {
    estadoEl.textContent = "";
    mostrarToast(`No se pudo cargar el editor. ${error.message || ""}`, "error");
  }
}

async function auPersistirPunto3() {
  const p = auPuntos.find(x => x.numero === auPuntoActivo);
  if (!p || !auEditorPunto) return;
  let html = auEditorPunto.getContent();
  // Si el texto modelo no se tocó, no se guarda como respuesta (el punto no pasa a "Recibido").
  if (auP3ModeloCargado !== null && html === auP3ModeloCargado) html = null;
  let estado = document.getElementById("au-p3-estado").value;
  let manual = p.estado_manual;
  if (auP3EstadoTocado) manual = true;
  else if (!p.estado_manual) estado = (auTieneTexto(html) || auDocsDePunto(p.numero).length) ? "Recibido" : "Pendiente";
  await auFetch("auditoria_puntos", { method: "PATCH", params: { id: `eq.${p.id}` }, body: { respuesta_html: html, estado, estado_manual: manual } });
  Object.assign(p, { respuesta_html: html, estado, estado_manual: manual });
  if (html !== null) auP3ModeloCargado = null;
  auEditorPunto.setDirty(false);
  auP3EstadoTocado = false;
  document.getElementById("au-p3-estado").value = estado;
  document.getElementById("au-p3-guardado").textContent = html === null ? "Sin cambios en el texto modelo" : "Guardado";
  auCargadas = false;
  await auAjustarVisitaYEstadoPorDocumentacion();
  auRenderP3Nums();
}

async function auGuardarPunto3SiHayCambios() {
  if (!auEditorPunto || auPasoActivo !== 3 || soloLecturaActiva()) return;
  if (!auEditorPunto.isDirty() && !auP3EstadoTocado) return;
  try { await auPersistirPunto3(); } catch (error) { mostrarToast(`No se pudo guardar el punto ${auPuntoActivo}. ${error.message || ""}`, "error"); }
}

async function auGuardarPunto3(seguir) {
  const botones = ["au-p3-guardar", "au-p3-siguiente"].map(id => document.getElementById(id));
  try {
    botones.forEach(b => { b.disabled = true; });
    await auPersistirPunto3();
    if (seguir && auPuntoActivo < auPuntos.length) {
      await auAbrirPunto3(auPuntoActivo + 1, true);
      document.getElementById("au-p3-nums").scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      mostrarToast(`Punto ${auPuntoActivo} guardado.`);
    }
  } catch (error) {
    mostrarToast(error.message || "No se pudo guardar el punto.", "error");
  } finally {
    botones.forEach(b => { b.disabled = false; });
  }
}

async function auAdjuntarArchivoPunto() {
  const input = document.getElementById("au-p3-file");
  const archivo = input.files?.[0];
  if (!archivo) return mostrarToast("Elegí un archivo.", "error");
  if (archivo.size > 20 * 1024 * 1024) return mostrarToast("El archivo no puede superar los 20 MB.", "error");
  const boton = document.getElementById("au-p3-subir");
  try {
    boton.disabled = true;
    const path = await auSubirArchivo(`${auActual.id}/docs/${Date.now()}_${auNombreSeguro(archivo.name)}`, archivo);
    await auFetch("auditoria_documentos", { method: "POST", body: { auditoria_id: auActual.id, nombre: archivo.name, nombre_archivo: archivo.name, archivo_path: path, puntos: [auPuntoActivo], fecha_recepcion: new Date().toISOString().slice(0, 10) } });
    auDocs = await auFetch("auditoria_documentos", { params: { auditoria_id: `eq.${auActual.id}`, order: "created_at.asc" } }) || [];
    input.value = "";
    await auRecalcularEstadosAutomaticos();
    const p = auPuntos.find(x => x.numero === auPuntoActivo);
    if (p && !auP3EstadoTocado) document.getElementById("au-p3-estado").value = p.estado;
    await auAjustarVisitaYEstadoPorDocumentacion();
    auRenderDocs();
    mostrarToast("Archivo adjuntado.");
  } catch (error) {
    mostrarToast(error.message || "No se pudo adjuntar.", "error");
  } finally {
    boton.disabled = false;
  }
}

async function auAjustarVisitaYEstadoPorDocumentacion() {
  const cambios = {};
  const hayAlgo = auPuntos.some(p => p.estado !== "Pendiente" && p.estado !== "No aportado") || auDocs.length > 0;
  if (!hayAlgo) {
    // Si se quitó toda la documentación, se vuelve atrás lo automático.
    if (auActual.visita_2_estado === "No requerida") cambios.visita_2_estado = "Pendiente";
    if (auActual.estado === "Documentación recibida") cambios.estado = "Esperando documentación";
    if (!Object.keys(cambios).length) return "";
    await auFetch("auditorias", { method: "PATCH", params: { id: `eq.${auActual.id}` }, body: cambios });
    Object.assign(auActual, cambios);
    auRenderDetalleSinDocs();
    return "";
  }
  if (auActual.visita_2_estado === "Pendiente") cambios.visita_2_estado = "No requerida";
  if (AU_ESTADOS_PREVIOS_A_DOCUMENTACION.includes(auActual.estado)) cambios.estado = "Documentación recibida";
  if (!Object.keys(cambios).length) return "";
  await auFetch("auditorias", { method: "PATCH", params: { id: `eq.${auActual.id}` }, body: cambios });
  Object.assign(auActual, cambios);
  auRenderDetalleSinDocs();
  return cambios.visita_2_estado ? " La 2º visita quedó como \"No requerida\"." : "";
}

function auRenderDetalleSinDocs() {
  document.getElementById("au-visita2-estado").value = auActual.visita_2_estado;
  document.getElementById("au-estado").value = auActual.estado;
  const os = auActual.obras_sociales || {};
  document.getElementById("au-detalle-sub").textContent = `RNAS ${auFormatearRnas(os.rnos)} · ${auActual.numero_ex} · ${auActual.estado}`;
}

async function auBorrarDoc(id) {
  const d = auDocs.find(x => x.id === id);
  if (!d) return;
  const ok = await mostrarConfirmacion(`¿Quitar "${d.nombre}" de la documentación recibida?`, { titulo: "Quitar documento", textoAceptar: "Quitar" });
  if (!ok) return;
  try {
    await auFetch("auditoria_documentos", { method: "DELETE", params: { id: `eq.${id}` } });
    if (d.archivo_path) await auBorrarArchivo(d.archivo_path);
    auDocs = auDocs.filter(x => x.id !== id);
    await auRecalcularEstadosAutomaticos();
    await auAjustarVisitaYEstadoPorDocumentacion();
    auCargadas = false;
    auRenderDocs();
    auRenderPuntos();
    mostrarToast("Documento quitado.");
  } catch (error) {
    mostrarToast(error.message || "No se pudo quitar el documento.", "error");
  }
}

// ---------------- PDF del Requerimiento ----------------

let auLibsPdfPromesa = null;
function auCargarScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(s);
  });
}
function auAsegurarLibsPdf() {
  if (window.pdfMake && window.htmlToPdfmake) return Promise.resolve();
  if (!auLibsPdfPromesa) {
    auLibsPdfPromesa = auCargarScript("https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/pdfmake.min.js")
      .then(() => auCargarScript("https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/vfs_fonts.js"))
      .then(() => auCargarScript("https://cdn.jsdelivr.net/npm/html-to-pdfmake@2.5.13/browser.js"))
      .catch(error => { auLibsPdfPromesa = null; throw error; });
  }
  return auLibsPdfPromesa;
}

async function auCargarTextosPlantilla() {
  const filas = await auFetch("auditoria_plantilla_textos", { params: { select: "clave,contenido" } });
  const textos = {};
  (filas || []).forEach(f => { textos[f.clave] = f.contenido; });
  return textos;
}

function auHtmlAPdf(html) {
  const fuente = String(html || "").trim();
  if (!fuente) return [];
  const resultado = window.htmlToPdfmake(/^</.test(fuente) ? fuente : `<div>${fuente}</div>`, { defaultStyles: { p: { margin: [0, 0, 0, 6] }, ul: { margin: [0, 2, 0, 2] }, li: { margin: [0, 1, 0, 1] } } });
  return Array.isArray(resultado) ? resultado : [resultado];
}

function auDocDefinicionRequerimiento({ textos, puntos, anio, os, numeroEx, fecha }) {
  const r = t => auReemplazarAnios(t, anio);
  const filaDato = (label, valor) => [{ text: label, bold: true, fillColor: "#f1f4f8" }, { text: valor || " " }];
  return {
    pageSize: "LETTER",
    pageMargins: [64, 56, 60, 56],
    defaultStyle: { fontSize: 10.5, lineHeight: 1.2 },
    footer: (actual, total) => ({ text: `Página ${actual} de ${total}`, alignment: "right", fontSize: 8, color: "#777", margin: [0, 16, 60, 0] }),
    content: [
      { text: r(textos.req_titulo || ""), bold: true, alignment: "center", fontSize: 12, margin: [0, 0, 0, 10] },
      { text: r(textos.req_subtitulo || ""), bold: true, fontSize: 11, margin: [0, 0, 0, 12] },
      {
        table: {
          widths: [130, "*"],
          body: [
            filaDato("Obra Social", os?.denominacion ? `${os.denominacion}${os.sigla ? ` (${os.sigla})` : ""}` : ""),
            filaDato("RNAS", auFormatearRnas(os?.rnos)),
            filaDato("Nº de expediente", numeroEx),
            filaDato("Fecha de la auditoría", fecha ? formatearFecha(fecha) : "")
          ]
        },
        layout: { hLineColor: () => "#c9d2dd", vLineColor: () => "#c9d2dd" },
        margin: [0, 0, 0, 14]
      },
      ...auHtmlAPdf(r(textos.req_intro || "")),
      ...puntos.map((p, i) => ({
        columns: [
          { width: 20, text: `${i + 1}.` },
          { width: "*", stack: auHtmlAPdf(r(p.texto_html)) }
        ],
        columnGap: 4,
        margin: [8, 3, 0, 3]
      })),
      {
        columns: [
          { width: "*", stack: [{ text: " ", margin: [0, 40, 0, 0] }, { canvas: [{ type: "line", x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 0.7 }] }, { text: "REPRESENTANTE DE SSSALUD", bold: true, fontSize: 9, margin: [0, 4, 0, 0] }] },
          { width: "*", stack: [{ text: " ", margin: [0, 40, 0, 0] }, { canvas: [{ type: "line", x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 0.7 }] }, { text: "REPRESENTANTE OBRA SOCIAL", bold: true, fontSize: 9, margin: [0, 4, 0, 0] }] }
        ],
        columnGap: 30,
        margin: [0, 20, 0, 0],
        unbreakable: true
      }
    ]
  };
}

async function auGenerarPdfRequerimiento(aud, puntos) {
  if (!aud) return;
  if (auEditandoPuntos) return mostrarToast("Guardá o cancelá la edición del texto antes de imprimir.", "error");
  const boton = document.getElementById("au-btn-requerimiento");
  try {
    boton.disabled = true;
    boton.textContent = "Generando PDF...";
    const [textos] = await Promise.all([auCargarTextosPlantilla(), auAsegurarLibsPdf()]);
    const doc = auDocDefinicionRequerimiento({
      textos, puntos, anio: auAnioAuditoria(aud), os: aud.obras_sociales, numeroEx: aud.numero_ex, fecha: aud.fecha_visita_1
    });
    const sigla = auNombreSeguro(aud.obras_sociales?.sigla || aud.obras_sociales?.rnos || "OS");
    window.pdfMake.createPdf(doc).download(`Requerimiento_Auditoria_${sigla}_${auAnioAuditoria(aud)}.pdf`);
  } catch (error) {
    mostrarToast(error.message || "No se pudo generar el PDF.", "error");
  } finally {
    boton.disabled = false;
    boton.textContent = "Descargar requerimiento (PDF)";
  }
}

// ---------------- Plantilla del Requerimiento ----------------

function auResaltarAnios(html, anio) {
  const marca = (valor, ayuda) => `<span class="au-anio" title="${ayuda}">${valor}</span>`;
  return String(html || "")
    .replaceAll("{ANIO_2}", marca(anio - 2, "Dos años antes de la auditoría"))
    .replaceAll("{ANIO_1}", marca(anio - 1, "Año anterior a la auditoría"))
    .replaceAll("{ANIO}", marca(anio, "Año de la auditoría"));
}

async function auCargarPlantilla() {
  setFormMessage("au-pl-message");
  try {
    const [textos, items] = await Promise.all([
      auCargarTextosPlantilla(),
      auFetch("auditoria_requerimiento_items", { params: { order: "orden.asc" } })
    ]);
    auPlantillaTextos = textos;
    auPlantillaItems = items || [];
    auRenderPlantilla();
  } catch (error) {
    setFormMessage("au-pl-message", `No se pudo cargar la plantilla. ${error.message || ""}`);
  }
}

function auRenderPlantilla() {
  const anio = new Date().getFullYear();
  const t = auPlantillaTextos;
  document.getElementById("au-pl-ver-titulo").innerHTML = auResaltarAnios(escaparHtml(t.req_titulo || ""), anio);
  document.getElementById("au-pl-ver-subtitulo").innerHTML = auResaltarAnios(escaparHtml(t.req_subtitulo || ""), anio);
  document.getElementById("au-pl-ver-intro").innerHTML = auResaltarAnios(t.req_intro || "", anio);

  const lista = document.getElementById("au-pl-items");
  lista.innerHTML = auPlantillaItems.map(it => `<li class="au-hoja-punto ${it.activo ? "" : "inactivo"}" data-au-pl-id="${it.id}" tabindex="0" title="Clic para editar este punto">
    <div class="au-hoja-punto-texto">${auResaltarAnios(it.texto_html, anio)}</div>
    <div class="au-hoja-punto-meta">
      <span class="au-eje" title="${escaparHtml(AU_EJES[it.eje])}">Eje ${it.eje} · ${escaparHtml(AU_EJES[it.eje])}</span>
      ${it.activo ? "" : `<span class="au-inactivo-tag">No se incluye</span>`}
      ${it.modelo_html ? `<span class="au-modelo-tag">Con texto modelo</span>` : ""}
      <span class="au-hoja-lapiz">Editar</span>
    </div>
  </li>`).join("");
  lista.querySelectorAll("[data-au-pl-id]").forEach(li => {
    const abrir = () => auAbrirEditorPunto(li.dataset.auPlId);
    li.addEventListener("click", abrir);
    li.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); abrir(); } });
  });
}

function auAbrirEditorEncabezado() {
  if (soloLecturaActiva()) return;
  const t = auPlantillaTextos;
  document.getElementById("au-pl-titulo").value = t.req_titulo || "";
  document.getElementById("au-pl-subtitulo").value = t.req_subtitulo || "";
  document.getElementById("au-pl-intro").innerHTML = t.req_intro || "";
  setFormMessage("au-enc-message");
  abrirModal("au-enc-modal");
}

async function auGuardarEncabezado() {
  const boton = document.getElementById("au-enc-guardar");
  try {
    boton.disabled = true;
    const textos = {
      req_titulo: document.getElementById("au-pl-titulo").value.trim(),
      req_subtitulo: document.getElementById("au-pl-subtitulo").value.trim(),
      req_intro: document.getElementById("au-pl-intro").innerHTML.trim()
    };
    for (const [clave, contenido] of Object.entries(textos)) {
      await auFetch("auditoria_plantilla_textos", { method: "POST", prefer: "resolution=merge-duplicates", params: { on_conflict: "clave" }, body: { clave, contenido, updated_at: new Date().toISOString() } });
    }
    Object.assign(auPlantillaTextos, textos);
    cerrarModal("au-enc-modal");
    auRenderPlantilla();
    mostrarToast("Encabezado guardado.");
  } catch (error) {
    setFormMessage("au-enc-message", error.message || "No se pudo guardar.");
  } finally {
    boton.disabled = false;
  }
}

function auAbrirEditorPunto(id) {
  if (soloLecturaActiva()) return;
  const esNuevo = !id;
  const it = esNuevo ? { texto_html: "", eje: "A", activo: true } : auPlantillaItems.find(x => x.id === id);
  if (!it) return;
  const total = auPlantillaItems.length + (esNuevo ? 1 : 0);
  const posicionActual = esNuevo ? total : auPlantillaItems.indexOf(it) + 1;
  document.getElementById("au-punto-title").textContent = esNuevo ? "Nuevo punto" : `Editar punto ${posicionActual}`;
  document.getElementById("au-punto-id").value = id || "";
  document.getElementById("au-punto-texto").innerHTML = it.texto_html || "";
  document.getElementById("au-punto-modelo").innerHTML = it.modelo_html || "";
  document.getElementById("au-punto-eje").innerHTML = Object.entries(AU_EJES).map(([k, v]) => `<option value="${k}" ${it.eje === k ? "selected" : ""}>${k} · ${escaparHtml(v)}</option>`).join("");
  document.getElementById("au-punto-posicion").innerHTML = Array.from({ length: total }, (_, i) => `<option value="${i + 1}" ${i + 1 === posicionActual ? "selected" : ""}>${i + 1}</option>`).join("");
  document.getElementById("au-punto-activo").checked = it.activo !== false;
  document.getElementById("au-punto-quitar").hidden = esNuevo;
  setFormMessage("au-punto-message");
  abrirModal("au-punto-modal");
  setTimeout(() => document.getElementById("au-punto-texto").focus(), 50);
}

async function auReordenarYGuardar(lista) {
  for (const [i, it] of lista.entries()) {
    if (it.id && it.orden !== i + 1) {
      await auFetch("auditoria_requerimiento_items", { method: "PATCH", params: { id: `eq.${it.id}` }, body: { orden: i + 1, updated_at: new Date().toISOString() } });
      it.orden = i + 1;
    }
  }
}

async function auGuardarPunto() {
  const id = document.getElementById("au-punto-id").value;
  const texto = document.getElementById("au-punto-texto").innerHTML.trim();
  if (!auTextoPlano(texto)) return setFormMessage("au-punto-message", "Escribí el texto del punto.");
  const boton = document.getElementById("au-punto-guardar");
  try {
    boton.disabled = true;
    const modelo = document.getElementById("au-punto-modelo").innerHTML.trim();
    const datos = { texto_html: texto, modelo_html: auTextoPlano(modelo) || /\{(PMA|CARTILLA)\}/.test(modelo) ? modelo : null, eje: document.getElementById("au-punto-eje").value, activo: document.getElementById("au-punto-activo").checked, updated_at: new Date().toISOString() };
    const posicion = Number(document.getElementById("au-punto-posicion").value);
    let item;
    if (id) {
      await auFetch("auditoria_requerimiento_items", { method: "PATCH", params: { id: `eq.${id}` }, body: datos });
      item = auPlantillaItems.find(x => x.id === id);
      Object.assign(item, datos);
    } else {
      const [creado] = await auFetch("auditoria_requerimiento_items", { method: "POST", prefer: "return=representation", body: { ...datos, orden: auPlantillaItems.length + 1 } });
      item = creado;
      auPlantillaItems.push(item);
    }
    const lista = auPlantillaItems.filter(x => x !== item);
    lista.splice(posicion - 1, 0, item);
    await auReordenarYGuardar(lista);
    auPlantillaItems = lista;
    cerrarModal("au-punto-modal");
    auRenderPlantilla();
    mostrarToast(id ? "Punto guardado." : "Punto agregado.");
  } catch (error) {
    setFormMessage("au-punto-message", error.message || "No se pudo guardar el punto.");
  } finally {
    boton.disabled = false;
  }
}

async function auQuitarPunto() {
  const id = document.getElementById("au-punto-id").value;
  if (!id) return;
  const ok = await mostrarConfirmacion("¿Quitar este punto de la plantilla? Las auditorías ya creadas conservan su copia. Si solo querés dejar de pedirlo por un tiempo, destildá \"Incluir este punto\".", { titulo: "Quitar punto", textoAceptar: "Quitar" });
  if (!ok) return;
  try {
    await auFetch("auditoria_requerimiento_items", { method: "DELETE", params: { id: `eq.${id}` } });
    const lista = auPlantillaItems.filter(x => x.id !== id);
    await auReordenarYGuardar(lista);
    auPlantillaItems = lista;
    cerrarModal("au-punto-modal");
    auRenderPlantilla();
    mostrarToast("Punto quitado.");
  } catch (error) {
    setFormMessage("au-punto-message", error.message || "No se pudo quitar el punto.");
  }
}

async function auPreviewPlantilla() {
  const boton = document.getElementById("au-pl-preview");
  try {
    boton.disabled = true;
    await auAsegurarLibsPdf();
    const doc = auDocDefinicionRequerimiento({
      textos: auPlantillaTextos,
      puntos: auPlantillaItems.filter(it => it.activo !== false),
      anio: new Date().getFullYear(),
      os: { denominacion: "OBRA SOCIAL DE EJEMPLO", sigla: "OSEJ", rnos: "100000" },
      numeroEx: "EX-0000-00000000- -APN-GCP#SSS",
      fecha: new Date().toISOString().slice(0, 10)
    });
    window.pdfMake.createPdf(doc).open();
  } catch (error) {
    setFormMessage("au-pl-message", error.message || "No se pudo generar la vista previa.");
  } finally {
    boton.disabled = false;
  }
}

// ---------------- Pasos ----------------

const AU_PASOS = [
  { n: 1, titulo: "Datos y orden" },
  { n: 2, titulo: "Requerimiento" },
  { n: 3, titulo: "Documentación" },
  { n: 4, titulo: "Informe" },
  { n: 5, titulo: "Observaciones" },
  { n: 6, titulo: "Conclusión y Word" }
];

function auPasoCompleto(n) {
  const a = auActual;
  if (!a) return false;
  if (n === 1) return !!(a.numero_ex && a.obra_social_id && a.fecha_visita_1);
  if (n === 2) return !!a.requerimiento_entregado;
  if (n === 3) return !!a.documentacion_completa;
  if (n === 4) return Object.keys(AU_EJES).every(e => auEjes[e]?.hallazgo);
  if (n === 5) return !!a.observaciones_listas;
  if (n === 6) return ["Informe emitido", "Cerrada"].includes(a.estado);
  return false;
}

function auPasoHabilitado(n) {
  for (let i = 1; i < n; i++) if (!auPasoCompleto(i)) return false;
  return true;
}

function auPrimerPasoPendiente() {
  for (const p of AU_PASOS) if (!auPasoCompleto(p.n)) return p.n;
  return AU_PASOS.length;
}

function auRenderPasos() {
  const nav = document.getElementById("au-pasos");
  nav.innerHTML = AU_PASOS.map(p => {
    const completo = auPasoCompleto(p.n);
    const habilitado = auPasoHabilitado(p.n);
    const clase = [p.n === auPasoActivo ? "activo" : "", completo ? "completo" : "", habilitado ? "" : "bloqueado"].join(" ");
    const marca = completo ? "✓" : habilitado ? p.n : "🔒";
    return `<button type="button" class="au-paso-btn ${clase}" data-au-ir-paso="${p.n}" ${habilitado ? "" : `title="Se habilita al terminar el paso anterior"`}>
      <span class="au-paso-marca">${marca}</span><span>${p.titulo}</span></button>`;
  }).join('<span class="au-paso-sep"></span>');
  nav.querySelectorAll("[data-au-ir-paso]").forEach(b => b.addEventListener("click", () => {
    const n = Number(b.dataset.auIrPaso);
    if (!auPasoHabilitado(n)) return mostrarToast("Ese paso se habilita cuando termines el anterior.", "error");
    auIrAPaso(n);
  }));
  document.querySelectorAll("[data-au-paso]").forEach(el => { el.hidden = Number(el.dataset.auPaso) !== auPasoActivo; });

  const reqEstado = document.getElementById("au-req-estado");
  if (reqEstado) reqEstado.textContent = auActual.requerimiento_entregado
    ? `Entregado en la 1º visita del ${formatearFecha(auActual.fecha_visita_1)}.`
    : "Imprimí el PDF, llevalo a la visita y después confirmá la entrega.";
  const btnEntrega = document.getElementById("au-req-entregado");
  if (btnEntrega) btnEntrega.textContent = auActual.requerimiento_entregado ? "Continuar al paso 3 →" : "Confirmar entrega y continuar →";
  const btnTerminar = document.getElementById("au-doc-terminar");
  if (btnTerminar) btnTerminar.textContent = auActual.documentacion_completa ? "Continuar al informe →" : "Terminé de cargar la documentación →";
}

async function auIrAPaso(n) {
  if (auPasoActivo === 4 && n !== 4) await auGuardarEjeSiHayCambios();
  if (auPasoActivo === 3 && n !== 3) await auGuardarPunto3SiHayCambios();
  if (auPasoActivo === 5 && n !== 5) await auGuardarObservacionesSiHayCambios();
  if (auPasoActivo === 6 && n !== 6) await auGuardarConclusionSiHayCambios();
  auPasoActivo = n;
  auRenderPasos();
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (n === 3) auAbrirPaso3();
  if (n === 4) auAbrirInforme();
  if (n === 5) auAbrirObservaciones();
  if (n === 6) auAbrirConclusion();
}

async function auPatchAuditoria(cambios) {
  const [fila] = await auFetch("auditorias", {
    method: "PATCH", prefer: "return=representation",
    params: { id: `eq.${auActual.id}`, select: "*,obras_sociales(denominacion,rnos,sigla,inicio_ejercicio)" },
    body: { ...cambios, updated_at: new Date().toISOString() }
  });
  auActual = fila;
  auCargadas = false;
  const os = auActual.obras_sociales || {};
  document.getElementById("au-detalle-sub").textContent = `RNAS ${auFormatearRnas(os.rnos)} · ${auActual.numero_ex} · ${auActual.estado}`;
  document.getElementById("au-estado").value = auActual.estado;
  document.getElementById("au-visita2-estado").value = auActual.visita_2_estado;
  document.getElementById("au-fecha-visita-2").value = auActual.fecha_visita_2 || "";
}

async function auConfirmarEntregaRequerimiento() {
  try {
    if (!auActual.requerimiento_entregado) {
      const cambios = { requerimiento_entregado: true };
      if (["Orden cargada", "1º visita realizada"].includes(auActual.estado)) cambios.estado = "Esperando documentación";
      await auPatchAuditoria(cambios);
      mostrarToast("Entrega del requerimiento registrada.");
    }
    auIrAPaso(3);
  } catch (error) {
    mostrarToast(error.message || "No se pudo registrar la entrega.", "error");
  }
}

async function auTerminarDocumentacion() {
  if (auActual.documentacion_completa) return auIrAPaso(4);
  await auGuardarPunto3SiHayCambios();
  if (!auPuntos.some(p => p.estado === "Recibido" || p.estado === "Parcial")) {
    const ok = await mostrarConfirmacion("No hay ningún punto recibido. Si la Obra Social no entregó nada, corresponde la 2º visita con el mismo requerimiento. ¿La marco como programada? La fecha la completás en el paso 1.", { titulo: "Sin documentación", textoAceptar: "Programar 2º visita" });
    if (!ok) return;
    await auPatchAuditoria({ visita_2_estado: "Programada", estado: "2º visita" });
    auRenderPasos();
    return mostrarToast("2º visita marcada como programada. Cuando llegue la documentación, cargala en este paso.");
  }
  const pendientes = auPuntos.filter(p => p.estado === "Pendiente");
  const ok = await mostrarConfirmacion(pendientes.length
    ? `Quedan ${pendientes.length} puntos en "Pendiente" (${pendientes.map(p => p.numero).join(", ")}). Al terminar pasan a "No aportado". ¿Continuar?`
    : "Todos los puntos tienen estado. ¿Terminar la carga y pasar al informe?", { titulo: "Terminar documentación", textoAceptar: "Terminar" });
  if (!ok) return;
  try {
    for (const p of pendientes) {
      await auFetch("auditoria_puntos", { method: "PATCH", params: { id: `eq.${p.id}` }, body: { estado: "No aportado", estado_manual: true } });
      p.estado = "No aportado"; p.estado_manual = true;
    }
    const cambios = { documentacion_completa: true };
    if (!["Informe en borrador", "Informe emitido", "Cerrada"].includes(auActual.estado)) cambios.estado = "Informe en borrador";
    await auPatchAuditoria(cambios);
    auRenderPuntos();
    auIrAPaso(4);
  } catch (error) {
    mostrarToast(error.message || "No se pudo terminar la carga.", "error");
  }
}

// ---------------- Paso 4: informe por eje ----------------

const AU_TINYMCE = "https://cdn.jsdelivr.net/npm/tinymce@7.6.0/tinymce.min.js";
const AU_TINYMCE_ES = "https://cdn.jsdelivr.net/npm/tinymce-i18n@24.12.9/langs7/es.js";

function auComprimirImagen(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const maxAncho = 1400;
      const escala = Math.min(1, maxAncho / img.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * escala);
      canvas.height = Math.round(img.naturalHeight * escala);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const png = canvas.toDataURL("image/png");
      const jpg = canvas.toDataURL("image/jpeg", 0.85);
      resolve(png.length <= jpg.length ? png : jpg);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo leer la imagen.")); };
    img.src = url;
  });
}

const auEditoresCargando = {};
function auCrearEditor(selector, altura, idEstado) {
  if (auEditoresCargando[selector]) return auEditoresCargando[selector];
  auEditoresCargando[selector] = (window.tinymce ? Promise.resolve() : auCargarScript(AU_TINYMCE))
    .then(() => new Promise(resolve => {
      window.tinymce.init({
        selector,
        license_key: "gpl",
        language: "es",
        language_url: AU_TINYMCE_ES,
        height: altura,
        menubar: false,
        toolbar_mode: "wrap",
        elementpath: false,
        branding: false,
        promotion: false,
        plugins: "lists advlist image table quickbars autolink",
        toolbar: "undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image table | removeformat",
        block_formats: "Párrafo=p; Subtítulo=h4",
        quickbars_selection_toolbar: false,
        quickbars_insert_toolbar: false,
        quickbars_image_toolbar: "alignleft aligncenter alignright | image",
        image_dimensions: true,
        image_description: false,
        object_resizing: true,
        resize_img_proportional: true,
        paste_data_images: true,
        automatic_uploads: true,
        images_upload_handler: blobInfo => auComprimirImagen(blobInfo.blob()),
        table_default_styles: { "border-collapse": "collapse", width: "100%" },
        content_style: "body{font-family:Calibri,Carlito,Arial,sans-serif;font-size:11pt;line-height:1.45;margin:12px 16px;padding:0} img{max-width:100%;height:auto} table td,table th{border:1px solid #999;padding:4px 6px} h4{font-size:11pt;margin:14px 0 6px}",
        setup: editor => {
          editor.on("init", () => resolve(editor));
          editor.on("input change undo redo", () => { const el = document.getElementById(idEstado); if (el) el.textContent = "Cambios sin guardar"; });
        }
      });
    }))
    .catch(error => { delete auEditoresCargando[selector]; throw error; });
  return auEditoresCargando[selector];
}

async function auAsegurarEditor() {
  if (!auEditor) auEditor = await auCrearEditor("#au-editor", 640, "au-eje-guardado");
  return auEditor;
}

function auFechaDmy(iso) {
  return iso ? formatearFecha(iso) : "____";
}

function auSumarDias(iso, dias) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

function auFinEjercicio(inicioIso) {
  const d = new Date(`${inicioIso}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() + 1);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function auTextoEjercicioOs() {
  const ini = String(auActual.obras_sociales?.inicio_ejercicio || "").match(/^(\d{1,2})[-/](\d{1,2})$/);
  if (!ini) return "____";
  const inicio = `2001-${ini[2].padStart(2, "0")}-${ini[1].padStart(2, "0")}`;
  const fin = auFinEjercicio(inicio);
  return `${inicio.slice(8, 10)}/${inicio.slice(5, 7)} – ${fin.slice(8, 10)}/${fin.slice(5, 7)}`;
}

async function auDatosPresentacion(tabla, anio) {
  const filas = await auFetch(tabla, { params: { obra_social_id: `eq.${auActual.obra_social_id}`, select: "anio_inicio,fecha_inicio_ejercicio,numero_ee,fecha_ingreso,numero_disposicion,fecha_disposicion,condicion", order: "anio_inicio.desc" } }) || [];
  const r = filas.find(f => Number(f.anio_inicio) === anio) || null;
  const extemporanea = !!(r?.fecha_inicio_ejercicio && r?.fecha_ingreso && r.fecha_ingreso > auSumarDias(r.fecha_inicio_ejercicio, -90));
  return { existe: !!r, extemporanea };
}

async function auParrafoPresentacion(tabla, anio) {
  const filas = await auFetch(tabla, { params: { obra_social_id: `eq.${auActual.obra_social_id}`, select: "anio_inicio,fecha_inicio_ejercicio,numero_ee,fecha_ingreso,numero_disposicion,fecha_disposicion,condicion", order: "anio_inicio.desc" } }) || [];
  const esPma = tabla === "pma";
  const nombre = esPma ? "Programa Médico Asistencial" : "Cartilla Prestacional";
  const art = esPma ? "el" : "la";
  const aprobadoTxt = esPma ? "aprobado" : "aprobada";
  const norma = esPma ? "la Resolución SSS N.º 83/07" : "la Resolución SSSalud N.º 2165/2021";
  const titulo = esPma ? "Programa Médico Asistencial (Res. 83/07 - SSS)" : "Cartilla Médico Asistencial (Res. 2165/21 - SSS)";
  const r = filas.find(f => Number(f.anio_inicio) === anio) || filas[0];
  if (!r) {
    return `<p><strong>${titulo}:</strong> No se registra en los sistemas de la Gerencia la presentación de ${art} ${nombre} correspondiente al ejercicio ${anio}.</p>`;
  }
  const inicio = r.fecha_inicio_ejercicio;
  const periodo = inicio ? `al período comprendido entre el ${auFechaLarga(inicio)} y el ${auFechaLarga(auFinEjercicio(inicio))}` : `al ejercicio ${r.anio_inicio}`;
  const aprobacion = r.numero_disposicion
    ? `fue ${aprobadoTxt} mediante ${r.numero_disposicion}${r.fecha_disposicion ? `, de fecha ${auFechaLarga(r.fecha_disposicion)}` : ""}`
    : `se encuentra en trámite (condición: ${String(r.condicion || "sin dato").toLowerCase()})`;
  let plazo = "";
  if (inicio && r.fecha_ingreso) {
    const limite = auSumarDias(inicio, -90);
    plazo = r.fecha_ingreso > limite
      ? ` No obstante, el expediente ${r.numero_ee || "____"} fue iniciado el ${auFechaDmy(r.fecha_ingreso)}, con posterioridad al plazo mínimo de noventa (90) días previos al inicio del ejercicio, previsto en ${norma}, por lo que la presentación resultó extemporánea.`
      : ` La presentación se efectuó mediante el expediente ${r.numero_ee || "____"}, iniciado el ${auFechaDmy(r.fecha_ingreso)}, dentro del plazo previsto por ${norma}.`;
  }
  return `<p><strong>${titulo}:</strong> Se verificó que ${art} ${nombre} correspondiente ${periodo} ${aprobacion}.${plazo}</p>`;
}

async function auPlantillaEje(eje) {
  const anio = auAnioAuditoria(auActual);
  const t = (titulo, texto) => `<p><strong>${titulo}:</strong> ${texto}</p>`;
  if (eje === "A") return [
    t("Ámbito de actuación", "____"),
    t("Ejercicio", auTextoEjercicioOs()),
    t("Dirección Médica y Auditoría Médica", "La conducción médico-prestacional se encuentra a cargo de ____, en funciones de ____."),
    "<p>La Auditoría Médica se encuentra integrada por ____. De acuerdo con la documentación presentada, sus funciones comprenden ____.</p>",
    t("Modalidad de cobertura", "La Obra Social informó que cuenta con ____ para su población beneficiaria y que las prestaciones son brindadas mediante ____. La modalidad contractual es ____."),
    t("Planes superadores", "____"),
    t("Autorizaciones", "Las solicitudes de autorización de prácticas, estudios e internaciones pueden gestionarse mediante ____. Según lo informado por el Agente, ____, estimándose un tiempo aproximado de resolución de ____."),
    t("Canales de comunicación con el beneficiario", "El Agente informó los siguientes canales institucionales de contacto: ____."),
    t("Coseguros", "Se verificó que el Agente del Seguro de Salud ____ el esquema de copagos aplicable a partir del ____. A continuación se detallan los importes consignados:")
  ].join("");
  if (eje === "B") return [
    t("Acepta", "____"),
    t("No acepta", "____"),
    t("Población total", `Para el año ${anio} se informó una población total de ____ beneficiarios. La distribución por tipo de beneficiario informada comprende ____. El padrón discrimina ____ titulares (____ %) y ____ familiares (____ %).`),
    `<p>Como antecedente comparativo, para el período ${anio - 2}/${anio - 1} se informó una población total de ____ beneficiarios.</p>`,
    t("Distribución geográfica", "La población se encuentra distribuida en ____. A continuación se incorpora el detalle:"),
    t("Distribución por rango etario", "La población presenta una edad promedio de ____ años, observándose la mayor concentración en el grupo de ____, que representa aproximadamente el ____ % del padrón. Asimismo, se registran ____ beneficiarios menores de 18 años.")
  ].join("");
  if (eje === "C") return [
    t("Red de prestadores", "Brinda cobertura a través de ____. La documentación presentada permite identificar una red integrada por ____."),
    t("Cobertura territorial de la red", "____"),
    t("Red farmacéutica", "Para la provisión de medicamentos, el Agente informó ____."),
    t("Modalidad de acceso", "____. Las delegaciones declaradas se detallan en la siguiente tabla:")
  ].join("");
  if (eje === "D") return [
    t("Auditoría Médica", "La Auditoría Médica interviene en ____."),
    t("Documentación de auditorías a prestadores y beneficiarios internados", "____"),
    t("Trazabilidad de prestaciones", "Dentro de la muestra aportada se verificó documentación respaldatoria correspondiente a ____."),
    t("Auditorías de terreno", "Se analizaron informes de auditoría médica de terreno correspondientes a ____."),
    t("Beneficiarios con patologías oncológicas y autoinmunes", "____"),
    t("Órdenes de pago de prestaciones de alto costo", "____"),
    t("Información estadística de prestaciones", "____")
  ].join("");
  if (eje === "E") return [
    t("Programas preventivos", "La Obra Social presentó documentación descriptiva de programas de prevención y promoción de la salud, incluyendo ____."),
    t("Material de difusión", "____"),
    t("Campañas de vacunación e inmunizaciones", "____"),
    t("Padrones y seguimiento", "____")
  ].join("");
  if (eje === "F") {
    let pma = "", cartilla = "";
    try {
      [pma, cartilla] = await Promise.all([auParrafoPresentacion("pma", anio), auParrafoPresentacion("cartillas", anio)]);
    } catch (error) {
      console.error(error);
      pma = t("Programa Médico Asistencial (Res. 83/07 - SSS)", "____");
      cartilla = t("Cartilla Médico Asistencial (Res. 2165/21 - SSS)", "____");
    }
    return [
      t("Resolución ANSSAL 650/97", "De la información obrante en el Estado de Situación institucional surge que el Agente del Seguro de Salud ____ las presentaciones correspondientes a la Resolución ANSSAL N.º 650/97 durante los ejercicios ____."),
      pma,
      cartilla,
      t("Leyes especiales", "La documentación presentada acredita circuitos específicos para ____.")
    ].join("");
  }
  return "";
}

function auRenderEjesTabs() {
  const tabs = document.getElementById("au-ejes-tabs");
  tabs.innerHTML = Object.entries(AU_EJES).map(([k, v]) => {
    const h = auEjes[k]?.hallazgo;
    return `<button type="button" class="au-eje-tab ${k === auEjeActivo ? "activo" : ""} ${h ? "completo" : ""}" data-au-eje="${k}">
      <span class="au-eje-tab-letra">${h ? "✓" : k}</span><span>${escaparHtml(v)}</span></button>`;
  }).join("");
  tabs.querySelectorAll("[data-au-eje]").forEach(b => b.addEventListener("click", () => auMostrarEje(b.dataset.auEje)));
  const hechos = Object.keys(AU_EJES).filter(k => auEjes[k]?.hallazgo).length;
  document.getElementById("au-informe-resumen").textContent = `${hechos} de 6 ejes con hallazgo`;
}

function auRenderRefEje(eje) {
  const anio = auAnioAuditoria(auActual);
  const puntos = auPuntos.filter(p => p.eje === eje);
  document.getElementById("au-informe-ref").innerHTML = `<div class="au-ref-titulo">Lo que entregó la Obra Social</div>` +
    (puntos.length ? puntos.map(p => {
      const docs = auDocsDePunto(p.numero);
      return `<div class="au-ref-punto">
        <div class="au-ref-cab"><span class="au-punto-num">${p.numero}</span><span class="au-ref-estado ${auClaseEstadoPunto(p.estado)}">${p.estado}</span></div>
        <div class="au-ref-texto">${escaparHtml(auTextoPlano(auReemplazarAnios(p.texto_html, anio)))}</div>
        ${auTieneTexto(p.respuesta_html) ? `<div class="au-ref-respuesta">${escaparHtml(auTextoPlano(p.respuesta_html).slice(0, 400))}${auTextoPlano(p.respuesta_html).length > 400 ? "…" : ""}</div>` : ""}
        ${docs.map(d => `<div class="au-ref-doc">
          <div class="au-ref-doc-nombre">${d.archivo_path ? `<button type="button" class="au-link" data-au-ref-ver="${d.id}">${escaparHtml(d.nombre)}</button>` : escaparHtml(d.nombre)}</div>
          ${d.nota ? `<div class="au-ref-doc-nota">${escaparHtml(d.nota)}</div>` : ""}
        </div>`).join("")}
      </div>`;
    }).join("") : `<p class="au-hint">Este eje no tiene puntos del requerimiento asociados.</p>`);
  document.querySelectorAll("[data-au-ref-ver]").forEach(b => b.addEventListener("click", () => auAbrirArchivo(auDocs.find(d => d.id === b.dataset.auRefVer)?.archivo_path)));
}

async function auAbrirInforme() {
  const primero = Object.keys(AU_EJES).find(k => !auEjes[k]?.hallazgo) || "A";
  auEjeActivo = primero;
  auRenderEjesTabs();
  auRenderRefEje(primero);
  document.getElementById("au-eje-guardado").textContent = "Cargando editor...";
  try {
    await auAsegurarEditor();
    await auCargarEjeEnEditor(primero);
  } catch (error) {
    document.getElementById("au-eje-guardado").textContent = "";
    mostrarToast(`No se pudo cargar el editor. ${error.message || ""}`, "error");
  }
}

async function auCargarEjeEnEditor(eje) {
  const guardado = auEjes[eje];
  const html = guardado?.analisis_html || await auArmarEje(eje);
  auEditor.mode.set(soloLecturaActiva() ? "readonly" : "design");
  auEditor.setContent(html);
  auEditor.undoManager.clear();
  auEditor.setDirty(false);
  document.getElementById("au-hallazgo").value = guardado?.hallazgo || "";
  document.getElementById("au-eje-guardado").textContent = guardado?.updated_at ? `Guardado ${new Date(guardado.updated_at).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}` : "Texto precargado, sin guardar";
  const siguiente = auSiguienteEje(eje);
  document.getElementById("au-eje-siguiente").textContent = siguiente ? `Guardar y seguir con el eje ${siguiente} →` : "Guardar y terminar el informe →";
}

function auSiguienteEje(eje) {
  const claves = Object.keys(AU_EJES);
  return claves[claves.indexOf(eje) + 1] || null;
}

async function auMostrarEje(eje) {
  if (eje === auEjeActivo) return;
  await auGuardarEjeSiHayCambios();
  auEjeActivo = eje;
  auRenderEjesTabs();
  auRenderRefEje(eje);
  if (auEditor) await auCargarEjeEnEditor(eje);
}

async function auPersistirEje(eje, html, hallazgo) {
  const [fila] = await auFetch("auditoria_ejes", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    params: { on_conflict: "auditoria_id,eje" },
    body: { auditoria_id: auActual.id, eje, analisis_html: html, hallazgo: hallazgo || null, updated_at: new Date().toISOString() }
  });
  auEjes[eje] = fila;
}

async function auGuardarEjeSiHayCambios() {
  if (!auEditor || auPasoActivo !== 4 || soloLecturaActiva()) return;
  const hallazgo = document.getElementById("au-hallazgo").value;
  const hallazgoCambio = (auEjes[auEjeActivo]?.hallazgo || "") !== hallazgo;
  if (!auEditor.isDirty() && !hallazgoCambio) return;
  try {
    await auPersistirEje(auEjeActivo, auEditor.getContent(), hallazgo);
    auEditor.setDirty(false);
    mostrarToast(`Eje ${auEjeActivo} guardado.`);
  } catch (error) {
    mostrarToast(`No se pudo guardar el eje ${auEjeActivo}. ${error.message || ""}`, "error");
  }
}

async function auGuardarEje(seguir) {
  if (!auEditor) return;
  const hallazgo = document.getElementById("au-hallazgo").value;
  if (seguir && !hallazgo) return mostrarToast("Elegí el hallazgo del eje antes de seguir.", "error");
  const html = auEditor.getContent();
  const botones = [document.getElementById("au-eje-guardar"), document.getElementById("au-eje-siguiente")];
  try {
    botones.forEach(b => { b.disabled = true; });
    await auPersistirEje(auEjeActivo, html, hallazgo);
    auEditor.setDirty(false);
    const quedanBlancos = (html.match(/_{4,}/g) || []).length;
    document.getElementById("au-eje-guardado").textContent = quedanBlancos ? `Guardado · quedan ${quedanBlancos} espacios "____" por completar` : "Guardado";
    auRenderEjesTabs();
    auRenderPasos();
    if (seguir) {
      const siguiente = auSiguienteEje(auEjeActivo);
      if (siguiente) {
        auEjeActivo = siguiente;
        auRenderEjesTabs();
        auRenderRefEje(siguiente);
        await auCargarEjeEnEditor(siguiente);
        window.scrollTo({ top: document.getElementById("au-ejes-tabs").getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
      } else if (auPasoCompleto(4)) {
        mostrarToast("Informe por ejes terminado. Seguimos con las observaciones.");
        auRenderPasos();
        auIrAPaso(5);
      } else {
        const falta = Object.keys(AU_EJES).find(k => !auEjes[k]?.hallazgo);
        mostrarToast(`Falta el hallazgo del eje ${falta}.`, "error");
        await auMostrarEje(falta);
      }
    }
  } catch (error) {
    mostrarToast(error.message || "No se pudo guardar el eje.", "error");
  } finally {
    botones.forEach(b => { b.disabled = false; });
  }
}

async function auRestaurarEje() {
  const ok = await mostrarConfirmacion(`¿Volver a armar el eje ${auEjeActivo} con lo que escribiste en sus puntos (paso 3)? Lo escrito en este eje se reemplaza cuando guardes.`, { titulo: "Volver a armar desde los puntos", textoAceptar: "Reemplazar" });
  if (!ok || !auEditor) return;
  auEditor.setContent(await auArmarEje(auEjeActivo));
  auEditor.setDirty(true);
  document.getElementById("au-eje-guardado").textContent = "Cambios sin guardar";
}


// ---------------- Menú Pendientes ----------------

let auPendAuditorias = [];
let auPendFiltroAuditoria = null;

async function auCargarPendientes() {
  const cont = document.getElementById("au-pend-lista");
  cont.innerHTML = `<p class="au-hint">Cargando...</p>`;
  try {
    auPendAuditorias = await auFetch("auditorias", {
      params: {
        select: "id,numero_ex,estado,fecha_visita_1,obras_sociales(denominacion,rnos,sigla),auditoria_puntos(id,numero,texto_html,estado,estado_manual),auditoria_documentos(puntos)",
        estado: "neq.Cerrada",
        order: "fecha_visita_1.desc.nullsfirst"
      }
    }) || [];
    auPendAuditorias.forEach(a => a.auditoria_puntos.sort((x, y) => x.numero - y.numero));
    auRenderPendientes();
  } catch (error) {
    cont.innerHTML = `<p class="au-hint">No se pudieron cargar los pendientes. ${escaparHtml(error.message || "")}</p>`;
  }
}

function auRenderPendientes() {
  const cont = document.getElementById("au-pend-lista");
  const filtro = document.getElementById("au-pend-filtro").value;
  const vacio = document.getElementById("au-pend-empty");
  const incluye = p => filtro === "todos" ? true : filtro === "faltantes" ? p.estado !== "Recibido" : p.estado === filtro;
  auSincronizarComboPendientes();
  if (!auPendFiltroAuditoria) {
    cont.innerHTML = `<div class="au-pend-inicio">Tocá la flechita para ver los expedientes, o escribí para buscarlo.</div>`;
    vacio.hidden = true;
    return;
  }

  const bloques = auPendAuditorias
    .filter(a => a.id === auPendFiltroAuditoria)
    .map(a => ({ a, puntos: a.auditoria_puntos.filter(incluye) }))
    .filter(b => b.puntos.length);

  vacio.hidden = bloques.length !== 0;
  vacio.textContent = "Ese expediente no tiene puntos en el estado elegido.";
  const aviso = "";
  cont.innerHTML = aviso + bloques.map(({ a, puntos }) => {
    const anio = a.fecha_visita_1 ? Number(a.fecha_visita_1.slice(0, 4)) : new Date().getFullYear();
    const recibidos = a.auditoria_puntos.filter(p => p.estado === "Recibido").length;
    return `<div class="table-card au-card">
      <div class="table-meta au-meta-flex">
        <strong>${escaparHtml(a.obras_sociales?.sigla || a.obras_sociales?.denominacion || "")} · RNAS ${escaparHtml(auFormatearRnas(a.obras_sociales?.rnos))}</strong>
        <span class="au-resumen">${escaparHtml(a.numero_ex)} · ${recibidos} de ${a.auditoria_puntos.length} recibidos</span>
        <button type="button" class="secondary small" data-au-pend-abrir="${a.id}">Abrir expediente</button>
      </div>
      <div class="au-puntos-lista">
        ${puntos.map(p => {
          const texto = auTextoPlano(auReemplazarAnios(p.texto_html, anio));
          return `<div class="au-punto-fila">
            <span class="au-punto-num">${p.numero}</span>
            <div class="au-punto-fila-texto" title="${escaparHtml(texto)}">${escaparHtml(texto)}</div>
            <select data-au-pend-estado="${p.id}" data-au-pend-aud="${a.id}" class="${auClaseEstadoPunto(p.estado)}">
              ${["Pendiente", "Recibido", "Parcial", "No aportado"].map(e => `<option ${e === p.estado ? "selected" : ""}>${e}</option>`).join("")}
            </select>
          </div>`;
        }).join("")}
      </div>
    </div>`;
  }).join("");

  cont.querySelectorAll("[data-au-pend-abrir]").forEach(b => b.addEventListener("click", () => {
    showView("au-auditorias");
    auAbrirDetalle(b.dataset.auPendAbrir);
  }));
  cont.querySelectorAll("[data-au-pend-estado]").forEach(sel => sel.addEventListener("change", async () => {
    try {
      await auFetch("auditoria_puntos", { method: "PATCH", params: { id: `eq.${sel.dataset.auPendEstado}` }, body: { estado: sel.value, estado_manual: true } });
      const aud = auPendAuditorias.find(x => x.id === sel.dataset.auPendAud);
      const punto = aud?.auditoria_puntos.find(x => x.id === sel.dataset.auPendEstado);
      if (punto) { punto.estado = sel.value; punto.estado_manual = true; }
      auCargadas = false;
      mostrarToast("Estado actualizado.");
      auRenderPendientes();
    } catch (error) {
      mostrarToast(error.message || "No se pudo cambiar el estado.", "error");
    }
  }));
}


// ---------------- Textos modelo ----------------

let auCachePresentaciones = {};

async function auRenderModelo(html) {
  let out = String(html || "");
  if (!out) return "";
  const os = auActual.obras_sociales || {};
  const anio = auAnioAuditoria(auActual);
  out = auReemplazarAnios(out, anio)
    .replaceAll("{OS}", escaparHtml(os.denominacion || "Obra Social"))
    .replaceAll("{SIGLA}", escaparHtml(os.sigla || ""))
    .replaceAll("{RNAS}", escaparHtml(auFormatearRnas(os.rnos)))
    .replaceAll("{EX}", escaparHtml(auActual.numero_ex || ""))
    .replaceAll("{EJERCICIO}", auTextoEjercicioOs());
  for (const [marca, tabla] of [["{PMA}", "pma"], ["{CARTILLA}", "cartillas"]]) {
    if (!out.includes(marca)) continue;
    const clave = `${auActual.id}:${tabla}`;
    try {
      if (!auCachePresentaciones[clave]) auCachePresentaciones[clave] = await auParrafoPresentacion(tabla, anio);
      out = out.replaceAll(marca, auCachePresentaciones[clave]);
    } catch (error) {
      out = out.replaceAll(marca, "<p>____</p>");
    }
  }
  return out;
}

// Arma el texto de un eje con lo escrito en sus puntos (paso 3).
async function auArmarEje(eje) {
  const partes = [];
  for (const p of auPuntos.filter(x => x.eje === eje)) {
    if (auTieneTexto(p.respuesta_html)) partes.push(p.respuesta_html);
    else if (p.estado === "No aportado") partes.push(`<p>No se aportó la documentación correspondiente al punto ${p.numero} del Requerimiento.</p>`);
    else partes.push(await auRenderModelo(p.modelo_html));
  }
  if (eje === "F") partes.push("<p><strong>Leyes especiales:</strong> La documentación presentada acredita circuitos específicos para ____.</p>");
  return partes.join("");
}


// Campo único para elegir o buscar el expediente
function auEtiquetaPend(a) {
  return `${a.obras_sociales?.sigla || a.obras_sociales?.denominacion || ""} · ${a.numero_ex}`;
}

let auPendResaltado = 0;

function auOpcionesPend() {
  const q = normalizar(document.getElementById("au-pend-search").value || "");
  const sel = auPendAuditorias.find(a => a.id === auPendFiltroAuditoria);
  const texto = sel && document.getElementById("au-pend-search").value === auEtiquetaPend(sel) ? "" : q;
  return auPendAuditorias.filter(a => !texto ||
    normalizar(a.numero_ex).includes(texto) || normalizar(a.obras_sociales?.denominacion).includes(texto) ||
    normalizar(a.obras_sociales?.sigla).includes(texto) || normalizar(a.obras_sociales?.rnos).includes(texto) ||
    normalizar(auFormatearRnas(a.obras_sociales?.rnos)).includes(texto));
}

function auMostrarOpcionesPend() {
  const lista = document.getElementById("au-pend-opciones");
  const input = document.getElementById("au-pend-search");
  const ops = auOpcionesPend();
  auPendResaltado = Math.min(auPendResaltado, Math.max(0, ops.length - 1));
  lista.innerHTML = ops.length
    ? ops.map((a, i) => `<li role="option" data-au-op="${a.id}" class="${i === auPendResaltado ? "resaltado" : ""} ${a.id === auPendFiltroAuditoria ? "elegido" : ""}" title="${escaparHtml(a.obras_sociales?.denominacion || "")} · RNAS ${escaparHtml(auFormatearRnas(a.obras_sociales?.rnos))} · ${escaparHtml(a.numero_ex)}"><strong>${escaparHtml(a.obras_sociales?.denominacion || a.obras_sociales?.sigla || "")}</strong><span>RNAS ${escaparHtml(auFormatearRnas(a.obras_sociales?.rnos))}</span><span>${escaparHtml(a.numero_ex)}</span></li>`).join("")
    : `<li class="vacio">${auPendAuditorias.length ? "No hay expedientes abiertos que coincidan." : "No hay expedientes abiertos."}</li>`;
  lista.hidden = false;
  input.setAttribute("aria-expanded", "true");
  lista.querySelectorAll("[data-au-op]").forEach(li => li.addEventListener("mousedown", e => { e.preventDefault(); auElegirPend(li.dataset.auOp); }));
}

function auOcultarOpcionesPend() {
  document.getElementById("au-pend-opciones").hidden = true;
  document.getElementById("au-pend-search").setAttribute("aria-expanded", "false");
}

function auElegirPend(id) {
  auPendFiltroAuditoria = id;
  auOcultarOpcionesPend();
  auRenderPendientes();
}

function auSincronizarComboPendientes() {
  const input = document.getElementById("au-pend-search");
  const sel = auPendAuditorias.find(a => a.id === auPendFiltroAuditoria);
  if (sel && document.activeElement !== input) input.value = auEtiquetaPend(sel);
  document.getElementById("au-pend-limpiar").hidden = !input.value;
}

function auVincularComboPendientes() {
  const input = document.getElementById("au-pend-search");
  input.addEventListener("focus", () => { auPendResaltado = 0; auMostrarOpcionesPend(); input.select(); });
  input.addEventListener("click", auMostrarOpcionesPend);
  input.addEventListener("input", () => {
    auPendResaltado = 0;
    document.getElementById("au-pend-limpiar").hidden = !input.value;
    if (!input.value && auPendFiltroAuditoria) { auPendFiltroAuditoria = null; auRenderPendientes(); }
    auMostrarOpcionesPend();
  });
  input.addEventListener("blur", () => setTimeout(() => { auOcultarOpcionesPend(); auSincronizarComboPendientes(); }, 120));
  input.addEventListener("keydown", e => {
    const ops = auOpcionesPend();
    if (e.key === "ArrowDown") { e.preventDefault(); auPendResaltado = Math.min(ops.length - 1, auPendResaltado + 1); auMostrarOpcionesPend(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); auPendResaltado = Math.max(0, auPendResaltado - 1); auMostrarOpcionesPend(); }
    else if (e.key === "Enter") { e.preventDefault(); if (ops[auPendResaltado]) { auElegirPend(ops[auPendResaltado].id); input.blur(); } }
    else if (e.key === "Escape") { auOcultarOpcionesPend(); input.blur(); }
  });
  document.getElementById("au-pend-flecha").addEventListener("mousedown", e => {
    e.preventDefault();
    if (document.getElementById("au-pend-opciones").hidden) { input.focus(); auMostrarOpcionesPend(); } else auOcultarOpcionesPend();
  });
  document.getElementById("au-pend-limpiar").addEventListener("mousedown", e => {
    e.preventDefault();
    input.value = "";
    auPendFiltroAuditoria = null;
    auRenderPendientes();
    input.focus();
  });
}

// ---------------- Paso 5: observaciones y sugerencias ----------------

let auObs = [];
let auObsSucio = false;
let auBiblioteca = [];

const AU_EJES_INFORME = {
  A: "ESTRUCTURA ORGANIZACIONAL Y ACCESO A LAS PRESTACIONES",
  B: "POBLACIÓN BENEFICIARIA",
  C: "ESTRUCTURA PRESTACIONAL",
  D: "GESTIÓN PRESTACIONAL Y AUDITORÍA MÉDICA",
  E: "PROGRAMAS PREVENTIVOS",
  F: "CUMPLIMIENTO NORMATIVO"
};

function auListaNumeros(nums) {
  if (nums.length <= 1) return nums.join("");
  return `${nums.slice(0, -1).join(", ")} y ${nums[nums.length - 1]}`;
}

function auBuscarBiblioteca(titulo) {
  return auBiblioteca.find(b => b.titulo === titulo) || null;
}

async function auProponerObservaciones() {
  const anio = auAnioAuditoria(auActual);
  const obs = [];
  const usadosF = new Set();
  // PMA y Cartilla, según lo registrado en Reportes GCP
  for (const [tabla, nombre, clave] of [["pma", "Programa Médico Asistencial", "PMA extemporáneo"], ["cartillas", "Cartilla Médico Asistencial", "Cartilla extemporánea"]]) {
    try {
      const d = await auDatosPresentacion(tabla, anio);
      if (!d.existe) {
        obs.push({ eje: "F", texto: `No se registra la presentación ${tabla === "pma" ? "del" : "de la"} ${nombre} correspondiente al ejercicio ${anio}.`, sugerencia: `Regularizar la presentación ${tabla === "pma" ? "del" : "de la"} ${nombre} conforme a la normativa vigente.` });
        usadosF.add(tabla);
      } else if (d.extemporanea) {
        const b = auBuscarBiblioteca(clave);
        obs.push({ eje: "F", texto: b?.texto_observacion || `${nombre} presentado en forma extemporánea.`, sugerencia: b?.texto_sugerencia || "____" });
        usadosF.add(tabla);
      }
    } catch (error) { console.error(error); }
  }
  // Ejes con hallazgo distinto de "Cumple"
  for (const [eje, nombre] of Object.entries(AU_EJES)) {
    const h = auEjes[eje]?.hallazgo;
    if (!h || h === "Cumple" || h === "No aportado") continue;
    if (eje === "F" && usadosF.size) continue;
    obs.push({ eje, texto: `En relación con ${nombre.toLowerCase()}, se observó que ____.`, sugerencia: "____" });
  }
  // Puntos no aportados y parciales
  const noAport = auPuntos.filter(p => p.estado === "No aportado").map(p => p.numero);
  const parciales = auPuntos.filter(p => p.estado === "Parcial").map(p => p.numero);
  if (noAport.length) {
    const b = auBuscarBiblioteca("Documentación no aportada");
    obs.push({ eje: "", texto: `El Agente del Seguro de Salud no aportó la documentación requerida en ${noAport.length === 1 ? "el punto" : "los puntos"} ${auListaNumeros(noAport)} del Requerimiento.`, sugerencia: b?.texto_sugerencia || "Remitir la documentación pendiente del Requerimiento a fin de completar la evaluación." });
  }
  if (parciales.length) {
    obs.push({ eje: "", texto: `La documentación correspondiente ${parciales.length === 1 ? "al punto" : "a los puntos"} ${auListaNumeros(parciales)} del Requerimiento fue aportada en forma parcial.`, sugerencia: "Completar la documentación de los puntos indicados a fin de permitir su evaluación integral." });
  }
  return obs;
}

async function auAbrirObservaciones() {
  document.getElementById("au-obs-guardado").textContent = "Cargando...";
  try {
    const [obs, bib] = await Promise.all([
      auFetch("auditoria_observaciones", { params: { auditoria_id: `eq.${auActual.id}`, order: "orden.asc" } }),
      auFetch("auditoria_sugerencias_biblioteca", { params: { order: "eje.asc.nullslast,titulo.asc" } })
    ]);
    auBiblioteca = bib || [];
    auObs = (obs || []).map(o => ({ eje: o.eje || "", texto: o.texto, sugerencia: o.sugerencia || "" }));
    auObsSucio = false;
    if (!auObs.length && !auActual.observaciones_listas && !soloLecturaActiva()) {
      auObs = await auProponerObservaciones();
      auObsSucio = auObs.length > 0;
      document.getElementById("au-obs-guardado").textContent = auObs.length ? "Propuestas desde los hallazgos, sin guardar" : "";
    } else {
      document.getElementById("au-obs-guardado").textContent = auObs.length ? "Guardado" : "";
    }
    auRenderObs();
  } catch (error) {
    document.getElementById("au-obs-guardado").textContent = "";
    mostrarToast(error.message || "No se pudieron cargar las observaciones.", "error");
  }
}

function auRenderObs() {
  const cont = document.getElementById("au-obs-lista");
  document.getElementById("au-obs-resumen").textContent = `${auObs.length} observacion${auObs.length === 1 ? "" : "es"}`;
  if (!auObs.length) {
    cont.innerHTML = `<div class="au-pend-inicio">No hay observaciones. Si el Agente cumple en todos los ejes, podés continuar sin observaciones; si no, agregalas con "+ Agregar observación".</div>`;
    return;
  }
  const opcionesEje = eje => `<option value="" ${!eje ? "selected" : ""}>General</option>` + Object.entries(AU_EJES).map(([k, v]) => `<option value="${k}" ${eje === k ? "selected" : ""}>${k} · ${escaparHtml(v)}</option>`).join("");
  cont.innerHTML = auObs.map((o, i) => {
    const bib = auBiblioteca.filter(b => !o.eje || !b.eje || b.eje === o.eje);
    return `<div class="au-obs" data-au-obs="${i}">
      <div class="au-obs-cab">
        <span class="au-p3-titulo-num">Observación ${i + 1}</span>
        <select data-au-obs-eje>${opcionesEje(o.eje)}</select>
        <span class="au-obs-mover">
          <button type="button" class="au-link" data-au-obs-mover="-1" ${i === 0 ? "disabled" : ""} title="Subir">↑</button>
          <button type="button" class="au-link" data-au-obs-mover="1" ${i === auObs.length - 1 ? "disabled" : ""} title="Bajar">↓</button>
          <button type="button" class="au-link au-link-danger" data-au-obs-quitar>Quitar</button>
        </span>
      </div>
      <textarea data-au-obs-texto rows="3" placeholder="Qué se observó">${escaparHtml(o.texto)}</textarea>
      <div class="au-obs-sug-cab">
        <span class="au-label" style="margin:0">Sugerencia</span>
        <select data-au-obs-bib><option value="">Elegir de la biblioteca...</option>${bib.map(b => `<option value="${b.id}">${escaparHtml(b.titulo)}</option>`).join("")}</select>
        <button type="button" class="au-link" data-au-obs-guardar-bib title="Guardar esta observación y su sugerencia en la biblioteca">Guardar en la biblioteca</button>
      </div>
      <textarea data-au-obs-sug rows="2" placeholder="Qué se sugiere">${escaparHtml(o.sugerencia)}</textarea>
    </div>`;
  }).join("");
  cont.querySelectorAll("[data-au-obs]").forEach(card => {
    const i = Number(card.dataset.auObs);
    card.querySelectorAll("textarea, [data-au-obs-eje]").forEach(el => el.addEventListener("input", () => { auObsSucio = true; document.getElementById("au-obs-guardado").textContent = "Cambios sin guardar"; }));
    card.querySelector("[data-au-obs-eje]").addEventListener("change", () => { auLeerObsDelDom(); auObsSucio = true; auRenderObs(); });
    card.querySelectorAll("[data-au-obs-mover]").forEach(b => b.addEventListener("click", () => {
      auLeerObsDelDom();
      const d = i + Number(b.dataset.auObsMover);
      [auObs[i], auObs[d]] = [auObs[d], auObs[i]];
      auObsSucio = true; auRenderObs();
    }));
    card.querySelector("[data-au-obs-quitar]").addEventListener("click", () => { auLeerObsDelDom(); auObs.splice(i, 1); auObsSucio = true; auRenderObs(); });
    card.querySelector("[data-au-obs-bib]").addEventListener("change", e => {
      const b = auBiblioteca.find(x => x.id === e.target.value);
      if (!b) return;
      auLeerObsDelDom();
      const o = auObs[i];
      o.sugerencia = b.texto_sugerencia;
      if (!o.texto.trim() || /_{4,}/.test(o.texto)) o.texto = b.texto_observacion || o.texto;
      if (!o.eje && b.eje) o.eje = b.eje;
      auObsSucio = true; auRenderObs();
    });
    card.querySelector("[data-au-obs-guardar-bib]").addEventListener("click", () => auGuardarEnBiblioteca(i));
  });
}

function auLeerObsDelDom() {
  document.querySelectorAll("#au-obs-lista [data-au-obs]").forEach(card => {
    const o = auObs[Number(card.dataset.auObs)];
    if (!o) return;
    o.eje = card.querySelector("[data-au-obs-eje]").value;
    o.texto = card.querySelector("[data-au-obs-texto]").value;
    o.sugerencia = card.querySelector("[data-au-obs-sug]").value;
  });
}

async function auGuardarEnBiblioteca(i) {
  auLeerObsDelDom();
  const o = auObs[i];
  if (!o.sugerencia.trim() || /_{4,}/.test(o.sugerencia)) return mostrarToast("Completá la sugerencia antes de guardarla en la biblioteca.", "error");
  const titulo = window.prompt("Nombre corto para encontrarla en la biblioteca (por ejemplo: \"Sin padrón de programas preventivos\"):", "");
  if (!titulo || !titulo.trim()) return;
  try {
    const [nuevo] = await auFetch("auditoria_sugerencias_biblioteca", { method: "POST", prefer: "return=representation", body: { eje: o.eje || null, titulo: titulo.trim(), texto_observacion: /_{4,}/.test(o.texto) ? null : o.texto, texto_sugerencia: o.sugerencia } });
    auBiblioteca.push(nuevo);
    auRenderObs();
    mostrarToast("Guardada en la biblioteca.");
  } catch (error) {
    mostrarToast(error.message || "No se pudo guardar en la biblioteca.", "error");
  }
}

async function auReproponerObservaciones() {
  const ok = await mostrarConfirmacion("¿Reemplazar las observaciones actuales por las que surgen de los hallazgos? Lo que escribiste se pierde cuando guardes.", { titulo: "Volver a proponer", textoAceptar: "Reemplazar" });
  if (!ok) return;
  auObs = await auProponerObservaciones();
  auObsSucio = true;
  document.getElementById("au-obs-guardado").textContent = "Propuestas desde los hallazgos, sin guardar";
  auRenderObs();
}

async function auPersistirObservaciones() {
  auLeerObsDelDom();
  const limpias = auObs.filter(o => o.texto.trim());
  await auFetch("auditoria_observaciones", { method: "DELETE", params: { auditoria_id: `eq.${auActual.id}` } });
  if (limpias.length) {
    await auFetch("auditoria_observaciones", { method: "POST", body: limpias.map((o, i) => ({ auditoria_id: auActual.id, orden: i + 1, eje: o.eje || null, texto: o.texto.trim(), sugerencia: o.sugerencia.trim() || null })) });
  }
  auObs = limpias;
  auObsSucio = false;
}

async function auGuardarObservaciones(continuar) {
  const botones = ["au-obs-guardar", "au-obs-continuar"].map(id => document.getElementById(id));
  try {
    botones.forEach(b => { b.disabled = true; });
    await auPersistirObservaciones();
    document.getElementById("au-obs-guardado").textContent = "Guardado";
    if (continuar) {
      if (!auActual.observaciones_listas) await auPatchAuditoria({ observaciones_listas: true });
      auRenderPasos();
      auIrAPaso(6);
    } else {
      auRenderObs();
      mostrarToast("Observaciones guardadas.");
    }
  } catch (error) {
    mostrarToast(error.message || "No se pudieron guardar las observaciones.", "error");
  } finally {
    botones.forEach(b => { b.disabled = false; });
  }
}

async function auGuardarObservacionesSiHayCambios() {
  if (!auObsSucio || auPasoActivo !== 5 || soloLecturaActiva()) return;
  try { await auPersistirObservaciones(); mostrarToast("Observaciones guardadas."); }
  catch (error) { mostrarToast(`No se pudieron guardar las observaciones. ${error.message || ""}`, "error"); }
}

// ---------------- Paso 6: conclusión e informe ----------------

let auEditorConclusion = null;

const AU_FRASES_CUMPLE = {
  A: "una estructura médico-prestacional organizada, con circuitos definidos de acceso y autorización de prestaciones",
  B: "información consistente de su población beneficiaria",
  C: "una red prestacional con cobertura en su ámbito de actuación",
  D: "mecanismos de auditoría médica y trazabilidad de las prestaciones",
  E: "programas preventivos y acciones de promoción de la salud",
  F: "el cumplimiento de las presentaciones normativas exigidas"
};

function auUnirFrases(frases) {
  if (frases.length <= 1) return frases.join("");
  return `${frases.slice(0, -1).join(", ")} y ${frases[frases.length - 1]}`;
}

function auProponerConclusion() {
  const os = auActual.obras_sociales?.denominacion || "la Obra Social";
  const cumple = Object.keys(AU_EJES).filter(e => auEjes[e]?.hallazgo === "Cumple");
  const noCumple = Object.keys(AU_EJES).filter(e => ["No cumple", "Cumple parcialmente", "No aportado"].includes(auEjes[e]?.hallazgo));
  const noAport = auPuntos.filter(p => p.estado === "No aportado").map(p => p.numero);
  const partes = [];
  partes.push(`<p>Del análisis de la documentación aportada y de las verificaciones realizadas en el marco de la auditoría integral a la ${escaparHtml(os)}, surge que el Agente del Seguro de Salud ${cumple.length ? `cuenta con ${auUnirFrases(cumple.map(e => AU_FRASES_CUMPLE[e]))}` : "presenta aspectos a regularizar en los distintos ejes evaluados"}.</p>`);
  if (noCumple.length || noAport.length) {
    const temas = noCumple.map(e => AU_EJES[e].toLowerCase());
    let texto = "No obstante, se identificaron incumplimientos y aspectos a fortalecer";
    if (temas.length) texto += ` vinculados con ${auUnirFrases(temas)}`;
    if (noAport.length) texto += `${temas.length ? ", así como" : ", en particular"} la falta de aporte de la documentación correspondiente a ${noAport.length === 1 ? "el punto" : "los puntos"} ${auListaNumeros(noAport)} del Requerimiento`;
    partes.push(`<p>${texto}, conforme se detalla en el apartado de Observaciones.</p>`);
  }
  partes.push(`<p>En consecuencia, se formulan las sugerencias detalladas precedentemente, cuya implementación permitirá al Agente del Seguro de Salud fortalecer la gestión prestacional y garantizar el acceso efectivo de sus beneficiarios a las prestaciones, conforme a la normativa vigente.</p>`);
  return partes.join("");
}

async function auAbrirConclusion() {
  const estado = document.getElementById("au-conc-guardado");
  estado.textContent = "Cargando editor...";
  try {
    if (!auObs.length) {
      const obs = await auFetch("auditoria_observaciones", { params: { auditoria_id: `eq.${auActual.id}`, order: "orden.asc" } });
      auObs = (obs || []).map(o => ({ eje: o.eje || "", texto: o.texto, sugerencia: o.sugerencia || "" }));
    }
    if (!auEditorConclusion) auEditorConclusion = await auCrearEditor("#au-conclusion", 360, "au-conc-guardado");
    auEditorConclusion.mode.set(soloLecturaActiva() ? "readonly" : "design");
    const propuesta = !auActual.conclusion_html;
    auEditorConclusion.setContent(auActual.conclusion_html || auProponerConclusion());
    auEditorConclusion.undoManager.clear();
    auEditorConclusion.setDirty(propuesta && !soloLecturaActiva());
    estado.textContent = propuesta ? "Conclusión propuesta, sin guardar" : "Guardado";
    auRenderEstadoInforme();
  } catch (error) {
    estado.textContent = "";
    mostrarToast(`No se pudo cargar el editor. ${error.message || ""}`, "error");
  }
}

function auContarBlancos(html) {
  return (String(html || "").match(/_{4,}/g) || []).length;
}

function auRenderEstadoInforme() {
  const detalle = [];
  const puntosConBlancos = auPuntos.filter(p => auContarBlancos(p.respuesta_html)).map(p => p.numero);
  Object.keys(AU_EJES).forEach(e => { const n = auContarBlancos(auEjes[e]?.analisis_html); if (n) detalle.push(`eje ${e}: ${n}`); });
  const nObs = auObs.reduce((t, o) => t + auContarBlancos(o.texto) + auContarBlancos(o.sugerencia), 0);
  if (nObs) detalle.push(`observaciones: ${nObs}`);
  const nConc = auEditorConclusion ? auContarBlancos(auEditorConclusion.getContent()) : 0;
  if (nConc) detalle.push(`conclusión: ${nConc}`);
  const caja = document.getElementById("au-blancos");
  caja.innerHTML = detalle.length
    ? `⚠ Quedan espacios "____" sin completar en el informe (${escaparHtml(detalle.join(" · "))}). Podés descargarlo igual y completarlos en Word.`
    : "✓ No quedan espacios \"____\" sin completar en el informe.";
  caja.classList.toggle("ok", !detalle.length);
  const emitido = ["Informe emitido", "Cerrada"].includes(auActual.estado);
  document.getElementById("au-emitido-estado").textContent = emitido ? `Estado: ${auActual.estado}.` : "Cuando lo subas a GDE, marcalo como emitido.";
  document.getElementById("au-marcar-emitido").hidden = emitido;
  document.getElementById("au-conc-resumen").textContent = `${auObs.length} observacion${auObs.length === 1 ? "" : "es"} · ${Object.keys(AU_EJES).filter(e => auEjes[e]?.hallazgo).length} ejes analizados`;
}

async function auGuardarConclusion(avisar) {
  if (!auEditorConclusion || soloLecturaActiva()) return;
  try {
    await auPatchAuditoria({ conclusion_html: auEditorConclusion.getContent() });
    auEditorConclusion.setDirty(false);
    document.getElementById("au-conc-guardado").textContent = "Guardado";
    auRenderEstadoInforme();
    if (avisar) mostrarToast("Conclusión guardada.");
  } catch (error) {
    mostrarToast(error.message || "No se pudo guardar la conclusión.", "error");
  }
}

async function auGuardarConclusionSiHayCambios() {
  if (!auEditorConclusion || auPasoActivo !== 6 || soloLecturaActiva() || !auEditorConclusion.isDirty()) return;
  await auGuardarConclusion(true);
}

async function auReproponerConclusion() {
  const ok = await mostrarConfirmacion("¿Reemplazar la conclusión por la propuesta según los hallazgos y observaciones?", { titulo: "Volver a proponer", textoAceptar: "Reemplazar" });
  if (!ok || !auEditorConclusion) return;
  auEditorConclusion.setContent(auProponerConclusion());
  auEditorConclusion.setDirty(true);
  document.getElementById("au-conc-guardado").textContent = "Cambios sin guardar";
  auRenderEstadoInforme();
}

async function auMarcarEmitido() {
  const ok = await mostrarConfirmacion("¿Marcar el informe como emitido? La auditoría queda en estado \"Informe emitido\" (después podés cerrarla desde el paso 1).", { titulo: "Informe emitido", textoAceptar: "Marcar como emitido" });
  if (!ok) return;
  try {
    await auGuardarConclusionSiHayCambios();
    await auPatchAuditoria({ estado: "Informe emitido" });
    auRenderPasos();
    auRenderEstadoInforme();
    mostrarToast("Informe marcado como emitido.");
  } catch (error) {
    mostrarToast(error.message || "No se pudo marcar.", "error");
  }
}

// ---------------- Word ----------------

const AU_DOCX_ANCHO_MAX = 600; // px (ancho útil de la hoja)

function auDocxRuns(nodo, formato = {}) {
  const { TextRun, ImageRun } = window.docx;
  const runs = [];
  nodo.childNodes.forEach(n => {
    if (n.nodeType === 3) {
      const texto = n.textContent.replace(/\s+/g, " ");
      if (texto) runs.push(new TextRun({ text: texto, bold: !!formato.bold, italics: !!formato.italics, underline: formato.underline ? {} : undefined, size: 22, font: "Calibri" }));
      return;
    }
    if (n.nodeType !== 1) return;
    const tag = n.tagName.toLowerCase();
    if (tag === "br") { runs.push(new TextRun({ break: 1 })); return; }
    if (tag === "img") { const img = auDocxImagenRun(n); if (img) runs.push(img); return; }
    const estilo = (n.getAttribute("style") || "").toLowerCase();
    const f = { ...formato };
    if (["strong", "b"].includes(tag) || /font-weight:\s*(bold|[6-9]00)/.test(estilo)) f.bold = true;
    if (["em", "i"].includes(tag) || /font-style:\s*italic/.test(estilo)) f.italics = true;
    if (tag === "u" || /text-decoration:[^;]*underline/.test(estilo)) f.underline = true;
    runs.push(...auDocxRuns(n, f));
  });
  return runs;
}

function auDocxImagenRun(img) {
  const { ImageRun } = window.docx;
  const src = img.getAttribute("src") || "";
  if (!src.startsWith("data:image")) return null;
  const estilo = img.getAttribute("style") || "";
  let w = Number(img.getAttribute("width")) || Number((estilo.match(/width:\s*(\d+)px/) || [])[1]) || Number(img.dataset.nw) || 400;
  let h = Number(img.getAttribute("height")) || Number((estilo.match(/height:\s*(\d+)px/) || [])[1]) || 0;
  const nw = Number(img.dataset.nw), nh = Number(img.dataset.nh);
  if (!h && nw && nh) h = Math.round(w * nh / nw);
  if (!h) h = Math.round(w * 0.6);
  if (w > AU_DOCX_ANCHO_MAX) { h = Math.round(h * AU_DOCX_ANCHO_MAX / w); w = AU_DOCX_ANCHO_MAX; }
  try {
    return new ImageRun({ data: dataUrlABytes(src), transformation: { width: w, height: h } });
  } catch (error) {
    console.error("Imagen no incluida en el Word", error);
    return null;
  }
}

function auDocxAlineacion(el) {
  const { AlignmentType } = window.docx;
  const estilo = (el.getAttribute("style") || "").toLowerCase();
  const img = el.tagName === "IMG" ? el : el.querySelector(":scope > img");
  const eImg = (img?.getAttribute("style") || "").toLowerCase();
  if (/float:\s*right/.test(eImg) || /text-align:\s*right/.test(estilo)) return AlignmentType.RIGHT;
  if (/margin-left:\s*auto/.test(eImg) || /display:\s*block/.test(eImg) && /margin-right:\s*auto/.test(eImg) || /text-align:\s*center/.test(estilo)) return AlignmentType.CENTER;
  if (/text-align:\s*justify/.test(estilo)) return AlignmentType.JUSTIFIED;
  return AlignmentType.JUSTIFIED;
}

function auDocxBloques(html) {
  const { Paragraph, Table, TableRow, TableCell, WidthType, BorderStyle } = window.docx;
  const cont = document.createElement("div");
  cont.innerHTML = html || "";
  const out = [];
  const parrafo = (el, extra = {}) => new Paragraph({ alignment: auDocxAlineacion(el), spacing: { after: 120, line: 276, lineRule: window.docx.LineRuleType.AUTO }, children: auDocxRuns(el), ...extra });
  const recorrer = (nodo, nivelLista = 0) => {
    nodo.childNodes.forEach(n => {
      if (n.nodeType === 3) {
        if (n.textContent.trim()) out.push(new Paragraph({ spacing: { after: 120 }, children: auDocxRuns({ childNodes: [n] }) }));
        return;
      }
      if (n.nodeType !== 1) return;
      const tag = n.tagName.toLowerCase();
      if (["p", "div", "h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) {
        if (n.querySelector(":scope > table, :scope > ul, :scope > ol, :scope > p")) { recorrer(n, nivelLista); return; }
        if (!n.textContent.trim() && !n.querySelector("img")) return;
        out.push(parrafo(n, tag.startsWith("h") ? { keepNext: true, children: auDocxRuns(n, { bold: true }) } : {}));
      } else if (tag === "img") {
        const run = auDocxImagenRun(n);
        if (run) out.push(new Paragraph({ alignment: auDocxAlineacion(n), spacing: { after: 120 }, children: [run] }));
      } else if (tag === "ul" || tag === "ol") {
        let k = 0;
        n.querySelectorAll(":scope > li").forEach(li => {
          k++;
          const sub = [...li.children].filter(c => ["ul", "ol"].includes(c.tagName.toLowerCase()));
          const clon = li.cloneNode(true);
          clon.querySelectorAll(":scope > ul, :scope > ol").forEach(x => x.remove());
          const runs = auDocxRuns(clon);
          out.push(tag === "ul"
            ? new Paragraph({ bullet: { level: Math.min(nivelLista, 8) }, spacing: { after: 60 }, children: runs })
            : new Paragraph({ indent: { left: 360 * (nivelLista + 1), hanging: 360 }, spacing: { after: 60 }, children: [new window.docx.TextRun({ text: `${k}. `, size: 22, font: "Calibri" }), ...runs] }));
          sub.forEach(s => recorrer({ childNodes: [s] }, nivelLista + 1));
        });
      } else if (tag === "table") {
        const filas = [...n.querySelectorAll("tr")];
        if (!filas.length) return;
        const borde = { style: BorderStyle.SINGLE, size: 4, color: "999999" };
        out.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: filas.map(tr => new TableRow({
            children: [...tr.children].map(td => new TableCell({
              borders: { top: borde, bottom: borde, left: borde, right: borde },
              children: [new Paragraph({ children: auDocxRuns(td, { bold: td.tagName === "TH" }) })]
            }))
          }))
        }));
        out.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
      } else {
        const runs = auDocxRuns(n);
        if (runs.length) out.push(new Paragraph({ spacing: { after: 120 }, children: runs }));
      }
    });
  };
  recorrer(cont);
  return out;
}

async function auPrepararImagenes(html) {
  // Guarda el tamaño natural de cada imagen para respetar proporciones en el Word.
  const cont = document.createElement("div");
  cont.innerHTML = html || "";
  for (const img of cont.querySelectorAll("img")) {
    const src = img.getAttribute("src") || "";
    if (!src.startsWith("data:image")) continue;
    const d = await obtenerDimensionesImagen(src);
    img.dataset.nw = d.width; img.dataset.nh = d.height;
    if (!img.getAttribute("width") && !/width:\s*\d+px/.test(img.getAttribute("style") || "")) img.setAttribute("width", String(Math.min(d.width, AU_DOCX_ANCHO_MAX)));
  }
  return cont.innerHTML;
}

async function auDescargarWord() {
  const boton = document.getElementById("au-word");
  try {
    boton.disabled = true;
    boton.textContent = "Armando el informe...";
    await auGuardarConclusionSiHayCambios();
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = window.docx;
    const textos = await auCargarTextosPlantilla();
    const [ejesFrescos, obsFrescas, docsFrescos] = await Promise.all([
      auFetch("auditoria_ejes", { params: { auditoria_id: `eq.${auActual.id}` } }),
      auFetch("auditoria_observaciones", { params: { auditoria_id: `eq.${auActual.id}`, order: "orden.asc" } }),
      auFetch("auditoria_documentos", { params: { auditoria_id: `eq.${auActual.id}`, order: "fecha_recepcion.asc.nullslast" } })
    ]);
    (ejesFrescos || []).forEach(e => { auEjes[e.eje] = e; });
    const obs = obsFrescas || [];
    const docs = docsFrescos || [];
    const a = auActual, os = a.obras_sociales || {};
    const anio = auAnioAuditoria(a);
    const T = (texto, o = {}) => new TextRun({ text: texto, size: 22, font: "Calibri", ...o });
    const P = (children, o = {}) => new Paragraph({ spacing: { after: 120, line: 276, lineRule: window.docx.LineRuleType.AUTO }, alignment: AlignmentType.JUSTIFIED, children, ...o });
    const titulo = texto => new Paragraph({ spacing: { before: 240, after: 120 }, keepNext: true, children: [T(texto, { bold: true, size: 24, color: "1F3864" })] });
    const hijos = [];

    hijos.push(P([T("Ref.: ", { bold: true }), T(os.denominacion || "", { bold: true })], { alignment: AlignmentType.LEFT, spacing: { after: 60 } }));
    hijos.push(P([T("RNAS: ", { bold: true }), T(auFormatearRnas(os.rnos), { bold: true })], { alignment: AlignmentType.LEFT, spacing: { after: 60 } }));
    hijos.push(P([T("Expediente: ", { bold: true }), T(a.numero_ex || "")], { alignment: AlignmentType.LEFT, spacing: { after: 200 } }));
    hijos.push(P([T(a.numero_if_orden
      ? `Visto lo indicado por ${a.numero_if_orden}, desde la Gerencia de Control Prestacional (GCP), se llevaron a cabo las acciones de auditoría colegiada conforme lo detallado a continuación.`
      : `Visto lo actuado en el expediente ${a.numero_ex}, desde la Gerencia de Control Prestacional (GCP), se llevaron a cabo las acciones de auditoría colegiada conforme lo detallado a continuación.`)]));

    hijos.push(titulo("OBJETO"));
    hijos.push(P([T(textos.inf_objeto || "")]));
    hijos.push(titulo("ALCANCE"));
    hijos.push(P([T(textos.inf_alcance || "")]));
    hijos.push(titulo("INTRODUCCIÓN"));
    const fechaDoc = docs.find(d => d.fecha_recepcion)?.fecha_recepcion;
    hijos.push(P([T(`En el marco de la auditoría colegiada realizada a la ${os.denominacion || ""}${os.sigla ? ` (${os.sigla})` : ""}, RNAS ${auFormatearRnas(os.rnos)}, se efectuó el relevamiento de los aspectos vinculados con la estructura organizacional y prestacional, la población beneficiaria, la red de prestadores, el funcionamiento de la Auditoría Médica, los programas preventivos y el cumplimiento de las presentaciones normativas.`)]));
    hijos.push(P([T(`El Requerimiento fue entregado en la visita realizada el ${a.fecha_visita_1 ? auFechaLarga(a.fecha_visita_1) : "____"}${a.visita_2_estado === "Realizada" && a.fecha_visita_2 ? `, con una segunda visita el ${auFechaLarga(a.fecha_visita_2)}` : ""}${fechaDoc ? `, y la documentación aportada por el Agente del Seguro de Salud fue recibida a partir del ${auFechaLarga(fechaDoc)}` : ""}.`)]));

    // 1. Documentación
    let n = 1;
    hijos.push(titulo(`${n}. DOCUMENTACIÓN APORTADA`));
    const borde = { style: BorderStyle.SINGLE, size: 4, color: "999999" };
    const celda = (texto, o = {}) => new TableCell({ borders: { top: borde, bottom: borde, left: borde, right: borde }, shading: o.fondo ? { fill: o.fondo } : undefined, width: o.ancho ? { size: o.ancho, type: WidthType.DXA } : undefined, children: [new Paragraph({ children: [T(texto, { size: 18, bold: !!o.bold })] })] });
    hijos.push(new Table({
      width: { size: 8832, type: WidthType.DXA },
      columnWidths: [560, 4700, 1250, 2322],
      rows: [
        new TableRow({ tableHeader: true, children: [celda("Nº", { bold: true, fondo: "DCE6F1", ancho: 560 }), celda("Punto requerido", { bold: true, fondo: "DCE6F1", ancho: 4700 }), celda("Estado", { bold: true, fondo: "DCE6F1", ancho: 1250 }), celda("Documentación aportada", { bold: true, fondo: "DCE6F1", ancho: 2322 })] }),
        ...auPuntos.map(p => {
          const txt = auTextoPlano(auReemplazarAnios(p.texto_html, anio));
          const dd = docs.filter(d => (d.puntos || []).includes(p.numero)).map(d => d.nombre).join("; ");
          return new TableRow({ children: [celda(String(p.numero), { ancho: 560 }), celda(txt.length > 180 ? `${txt.slice(0, 177)}…` : txt, { ancho: 4700 }), celda(p.estado, { ancho: 1250 }), celda(dd || (p.estado === "No aportado" ? "—" : ""), { ancho: 2322 })] });
        })
      ]
    }));

    // 2 a 7. Ejes
    for (const eje of Object.keys(AU_EJES)) {
      n++;
      hijos.push(titulo(`${n}. ${AU_EJES_INFORME[eje]}`));
      const html = await auPrepararImagenes(auEjes[eje]?.analisis_html || await auArmarEje(eje));
      hijos.push(...auDocxBloques(html));
    }

    n++;
    hijos.push(titulo(`${n}. OBSERVACIONES`));
    if (obs.length) obs.forEach((o, i) => hijos.push(P([T(`${n}.${i + 1}. `, { bold: true }), T(o.texto)], { indent: { left: 360, hanging: 360 } })));
    else hijos.push(P([T("No se formulan observaciones.")]));
    const sugs = obs.filter(o => o.sugerencia);
    n++;
    hijos.push(titulo(`${n}. SUGERENCIAS`));
    if (sugs.length) sugs.forEach((o, i) => hijos.push(P([T(`${n}.${i + 1}. `, { bold: true }), T(o.sugerencia)], { indent: { left: 360, hanging: 360 } })));
    else hijos.push(P([T("No se formulan sugerencias.")]));
    n++;
    hijos.push(titulo(`${n}. CONCLUSIÓN`));
    hijos.push(...auDocxBloques(await auPrepararImagenes(a.conclusion_html || auProponerConclusion())));

    const doc = new Document({
      styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
      sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1608, bottom: 1440, left: 1800 } } }, children: hijos }]
    });
    const blob = await Packer.toBlob(doc);
    descargarBlob(blob, `Informe_Auditoria_${auNombreSeguro(os.sigla || os.rnos || "OS")}_${anio}.docx`);
    mostrarToast("Informe descargado.");
  } catch (error) {
    console.error(error);
    mostrarToast(`No se pudo armar el Word. ${error.message || ""}`, "error");
  } finally {
    boton.disabled = false;
    boton.textContent = "Descargar informe (Word)";
  }
}
