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
  div.innerHTML = html || "";
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
}

function auVincularEventos() {
  auEventosVinculados = true;
  const on = (id, ev, fn) => document.getElementById(id)?.addEventListener(ev, fn);

  on("au-btn-nueva", "click", () => requiereAutenticacion(auAbrirNueva));
  on("au-tab-activas", "click", () => auCambiarTab("activas"));
  on("au-tab-cerradas", "click", () => auCambiarTab("cerradas"));
  on("au-search", "input", auRenderLista);
  on("au-nueva-form", "submit", auCrearAuditoria);
  on("au-volver", "click", () => { auMostrarLista(); auCargarLista(); });
  on("au-form", "submit", auGuardarDatos);
  on("au-eliminar", "click", auEliminarAuditoria);
  on("au-orden-subir", "click", auSubirOrden);
  on("au-btn-requerimiento", "click", () => auGenerarPdfRequerimiento(auActual, auPuntos));
  on("au-puntos-editar", "click", () => { auEditandoPuntos = true; auRenderPuntos(); });
  on("au-puntos-cancelar", "click", () => { auEditandoPuntos = false; auRenderPuntos(); });
  on("au-puntos-guardar", "click", auGuardarTextosPuntos);
  on("au-doc-guardar", "click", auGuardarDocumento);
  on("au-doc-cancelar", "click", auResetFormDoc);
  on("au-pl-agregar", "click", () => { auLeerPlantillaDelDom(); auPlantillaItems.push({ texto_html: "", eje: "A", activo: true }); auRenderPlantillaItems(); });
  on("au-pl-guardar", "click", auGuardarPlantilla);
  on("au-pl-preview", "click", auPreviewPlantilla);

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
    const plantilla = await auFetch("auditoria_requerimiento_items", { params: { select: "texto_html,eje,orden", activo: "eq.true", order: "orden.asc" } });
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
      body: plantilla.map((item, i) => ({ auditoria_id: aud.id, numero: i + 1, texto_html: item.texto_html, eje: item.eje }))
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
    const [filas, puntos, docs] = await Promise.all([
      auFetch("auditorias", { params: { id: `eq.${id}`, select: "*,obras_sociales(denominacion,rnos,sigla)" } }),
      auFetch("auditoria_puntos", { params: { auditoria_id: `eq.${id}`, order: "numero.asc" } }),
      auFetch("auditoria_documentos", { params: { auditoria_id: `eq.${id}`, order: "fecha_recepcion.asc.nullslast,created_at.asc" } })
    ]);
    if (!filas?.length) throw new Error("No se encontró la auditoría.");
    auActual = filas[0];
    auPuntos = puntos || [];
    auDocs = docs || [];
    auEditandoPuntos = false;
    document.getElementById("au-lista").hidden = true;
    document.getElementById("au-detalle").hidden = false;
    auRenderDetalle();
    window.scrollTo({ top: 0 });
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
}

function auRenderOrden() {
  const cont = document.getElementById("au-orden-actual");
  const a = auActual;
  if (a.orden_archivo_path) {
    cont.innerHTML = `<button type="button" class="au-link" id="au-orden-ver">📄 ${escaparHtml(a.orden_nombre_archivo || "Orden de auditoría")}</button>
      <span class="au-hint">Habilita hasta 2 visitas. Para reemplazarla, elegí otro archivo y subilo.</span>`;
    document.getElementById("au-orden-ver").addEventListener("click", () => auAbrirArchivo(a.orden_archivo_path));
  } else {
    cont.innerHTML = `<span class="au-hint">Todavía no se subió la orden de auditoría.</span>`;
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
      method: "PATCH", prefer: "return=representation", params: { id: `eq.${auActual.id}`, select: "*,obras_sociales(denominacion,rnos,sigla)" },
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
    mostrarToast("Datos guardados.");
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
  const cont = document.getElementById("au-puntos-lista");
  const anio = auAnioAuditoria(auActual);
  document.getElementById("au-puntos-edicion-acciones").hidden = !auEditandoPuntos;
  document.getElementById("au-puntos-editar").hidden = auEditandoPuntos;

  const recibidos = auPuntos.filter(p => p.estado === "Recibido").length;
  const parciales = auPuntos.filter(p => p.estado === "Parcial").length;
  const noAport = auPuntos.filter(p => p.estado === "No aportado").length;
  document.getElementById("au-puntos-resumen").textContent =
    `${recibidos} recibidos · ${parciales} parciales · ${noAport} no aportados · ${auPuntos.length - recibidos - parciales - noAport} pendientes`;

  if (auEditandoPuntos) {
    cont.innerHTML = `<p class="au-hint" style="margin:0 0 8px">Los cambios valen solo para esta auditoría. Ctrl+B negrita, Ctrl+U subrayado. {ANIO}, {ANIO_1} y {ANIO_2} se reemplazan al imprimir.</p>` +
      auPuntos.map(p => `<div class="au-punto au-punto-edit">
        <span class="au-punto-num">${p.numero}</span>
        <div class="anexo-i-rte au-punto-rte" contenteditable="true" data-au-punto-texto="${p.id}">${p.texto_html}</div>
      </div>`).join("");
    return;
  }

  cont.innerHTML = auPuntos.map(p => {
    const docs = auDocsDePunto(p.numero);
    return `<div class="au-punto">
      <span class="au-punto-num">${p.numero}</span>
      <div class="au-punto-cuerpo">
        <div class="au-punto-texto">${auReemplazarAnios(p.texto_html, anio)}</div>
        <div class="au-punto-docs">
          <span class="au-eje" title="${escaparHtml(AU_EJES[p.eje])}">Eje ${p.eje}</span>
          ${docs.length ? docs.map(d => `<span class="au-doc-chip">${escaparHtml(d.nombre)}</span>`).join("") : `<span class="au-hint">Sin documentos</span>`}
        </div>
      </div>
      <div class="au-punto-estado">
        <select data-au-punto-estado="${p.id}" class="${auClaseEstadoPunto(p.estado)}" title="${p.estado_manual ? "Estado fijado a mano" : "Estado automático según la documentación"}">
          ${["Pendiente", "Recibido", "Parcial", "No aportado"].map(e => `<option ${e === p.estado ? "selected" : ""}>${e}</option>`).join("")}
        </select>
        ${p.estado_manual ? `<button type="button" class="au-link au-auto" data-au-punto-auto="${p.id}" title="Volver al estado automático">↺ automático</button>` : ""}
      </div>
    </div>`;
  }).join("");

  cont.querySelectorAll("[data-au-punto-estado]").forEach(sel => sel.addEventListener("change", () => auCambiarEstadoPunto(sel.dataset.auPuntoEstado, sel.value, true)));
  cont.querySelectorAll("[data-au-punto-auto]").forEach(btn => btn.addEventListener("click", () => auVolverAutomatico(btn.dataset.auPuntoAuto)));
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
  await auCambiarEstadoPunto(id, auDocsDePunto(p.numero).length ? "Recibido" : "Pendiente", false);
}

async function auRecalcularEstadosAutomaticos() {
  for (const p of auPuntos) {
    if (p.estado_manual) continue;
    const deseado = auDocsDePunto(p.numero).length ? "Recibido" : "Pendiente";
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

// ---------------- Documentación recibida ----------------

let auDocPuntosSeleccionados = new Set();

function auRenderChipsPuntos() {
  const cont = document.getElementById("au-doc-puntos");
  cont.innerHTML = auPuntos.map(p => `<button type="button" class="au-chip ${auDocPuntosSeleccionados.has(p.numero) ? "on" : ""}" data-au-chip="${p.numero}" title="${escaparHtml(auTextoPlano(auReemplazarAnios(p.texto_html, auAnioAuditoria(auActual))).slice(0, 180))}">${p.numero}</button>`).join("");
  cont.querySelectorAll("[data-au-chip]").forEach(btn => btn.addEventListener("click", () => {
    const n = Number(btn.dataset.auChip);
    if (auDocPuntosSeleccionados.has(n)) auDocPuntosSeleccionados.delete(n); else auDocPuntosSeleccionados.add(n);
    btn.classList.toggle("on");
  }));
}

function auResetFormDoc() {
  document.getElementById("au-doc-id").value = "";
  document.getElementById("au-doc-nombre").value = "";
  document.getElementById("au-doc-fecha").value = new Date().toISOString().slice(0, 10);
  document.getElementById("au-doc-file").value = "";
  document.getElementById("au-doc-nota").value = "";
  document.getElementById("au-doc-guardar").textContent = "+ Agregar documento";
  document.getElementById("au-doc-cancelar").hidden = true;
  auDocPuntosSeleccionados = new Set();
  setFormMessage("au-doc-message");
  auRenderChipsPuntos();
}

function auEditarDoc(id) {
  const d = auDocs.find(x => x.id === id);
  if (!d) return;
  document.getElementById("au-doc-id").value = d.id;
  document.getElementById("au-doc-nombre").value = d.nombre || "";
  document.getElementById("au-doc-fecha").value = d.fecha_recepcion || "";
  document.getElementById("au-doc-file").value = "";
  document.getElementById("au-doc-nota").value = d.nota || "";
  document.getElementById("au-doc-guardar").textContent = "Guardar cambios";
  document.getElementById("au-doc-cancelar").hidden = false;
  auDocPuntosSeleccionados = new Set(d.puntos || []);
  auRenderChipsPuntos();
  document.getElementById("au-doc-nombre").scrollIntoView({ behavior: "smooth", block: "center" });
  document.getElementById("au-doc-nombre").focus();
}

function auRenderDocs() {
  const tbody = document.getElementById("au-doc-body");
  tbody.innerHTML = auDocs.map(d => `<tr>
    <td><strong>${escaparHtml(d.nombre)}</strong>${d.nota ? `<div class="au-doc-nota">${escaparHtml(d.nota)}</div>` : ""}</td>
    <td>${(d.puntos || []).slice().sort((x, y) => x - y).join(", ")}</td>
    <td class="date-cell">${formatearFecha(d.fecha_recepcion)}</td>
    <td>${d.archivo_path ? `<button type="button" class="au-link" data-au-doc-ver="${d.id}" title="${escaparHtml(d.nombre_archivo || "")}">Ver</button>` : "—"}</td>
    <td class="au-doc-acciones">
      <button type="button" class="au-link" data-au-doc-editar="${d.id}">Editar</button>
      <button type="button" class="au-link au-link-danger" data-au-doc-borrar="${d.id}">Quitar</button>
    </td>
  </tr>`).join("");
  document.getElementById("au-doc-empty").hidden = auDocs.length !== 0;
  tbody.querySelectorAll("[data-au-doc-ver]").forEach(b => b.addEventListener("click", () => auAbrirArchivo(auDocs.find(d => d.id === b.dataset.auDocVer)?.archivo_path)));
  tbody.querySelectorAll("[data-au-doc-editar]").forEach(b => b.addEventListener("click", () => auEditarDoc(b.dataset.auDocEditar)));
  tbody.querySelectorAll("[data-au-doc-borrar]").forEach(b => b.addEventListener("click", () => auBorrarDoc(b.dataset.auDocBorrar)));
}

async function auGuardarDocumento() {
  setFormMessage("au-doc-message");
  const id = document.getElementById("au-doc-id").value;
  const nombre = document.getElementById("au-doc-nombre").value.trim();
  const puntos = [...auDocPuntosSeleccionados].sort((a, b) => a - b);
  const archivo = document.getElementById("au-doc-file").files?.[0];
  if (!nombre) return setFormMessage("au-doc-message", "Escribí el nombre o la descripción del documento.");
  if (!puntos.length) return setFormMessage("au-doc-message", "Marcá al menos un punto del requerimiento al que responde.");
  if (archivo && archivo.size > 20 * 1024 * 1024) return setFormMessage("au-doc-message", "El archivo no puede superar los 20 MB.");

  const boton = document.getElementById("au-doc-guardar");
  try {
    boton.disabled = true;
    const registro = {
      nombre,
      puntos,
      fecha_recepcion: document.getElementById("au-doc-fecha").value || null,
      nota: document.getElementById("au-doc-nota").value.trim() || null
    };
    const anterior = id ? auDocs.find(d => d.id === id) : null;
    if (archivo) {
      registro.archivo_path = await auSubirArchivo(`${auActual.id}/docs/${Date.now()}_${auNombreSeguro(archivo.name)}`, archivo);
      registro.nombre_archivo = archivo.name;
    }
    if (id) {
      await auFetch("auditoria_documentos", { method: "PATCH", params: { id: `eq.${id}` }, body: registro });
      if (archivo && anterior?.archivo_path) await auBorrarArchivo(anterior.archivo_path);
    } else {
      await auFetch("auditoria_documentos", { method: "POST", body: { ...registro, auditoria_id: auActual.id } });
    }
    auDocs = await auFetch("auditoria_documentos", { params: { auditoria_id: `eq.${auActual.id}`, order: "fecha_recepcion.asc.nullslast,created_at.asc" } }) || [];
    await auRecalcularEstadosAutomaticos();
    const aviso = await auAjustarVisitaYEstadoPorDocumentacion();
    auCargadas = false;
    auResetFormDoc();
    auRenderDocs();
    auRenderPuntos();
    mostrarToast(id ? "Documento actualizado." : `Documento agregado.${aviso}`);
  } catch (error) {
    setFormMessage("au-doc-message", error.message || "No se pudo guardar el documento.");
  } finally {
    boton.disabled = false;
  }
}

// Si la OS ya entregó documentación, la 2º visita no se realiza.
async function auAjustarVisitaYEstadoPorDocumentacion() {
  if (!auDocs.length) return "";
  const cambios = {};
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
    auCargadas = false;
    if (document.getElementById("au-doc-id").value === id) auResetFormDoc();
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
    boton.textContent = "Imprimir requerimiento (PDF)";
  }
}

// ---------------- Plantilla del Requerimiento ----------------

async function auCargarPlantilla() {
  setFormMessage("au-pl-message");
  try {
    const [textos, items] = await Promise.all([
      auCargarTextosPlantilla(),
      auFetch("auditoria_requerimiento_items", { params: { order: "orden.asc" } })
    ]);
    auPlantillaTextos = textos;
    auPlantillaItems = items || [];
    document.getElementById("au-pl-titulo").value = textos.req_titulo || "";
    document.getElementById("au-pl-subtitulo").value = textos.req_subtitulo || "";
    document.getElementById("au-pl-intro").innerHTML = textos.req_intro || "";
    auRenderPlantillaItems();
  } catch (error) {
    setFormMessage("au-pl-message", `No se pudo cargar la plantilla. ${error.message || ""}`);
  }
}

function auRenderPlantillaItems() {
  const cont = document.getElementById("au-pl-items");
  cont.innerHTML = auPlantillaItems.map((it, i) => `<div class="au-pl-item ${it.activo === false ? "inactivo" : ""}" data-au-pl-idx="${i}">
    <div class="au-pl-item-lateral">
      <span class="au-punto-num">${i + 1}</span>
      <button type="button" class="au-link" data-au-pl-mover="-1" ${i === 0 ? "disabled" : ""} title="Subir">↑</button>
      <button type="button" class="au-link" data-au-pl-mover="1" ${i === auPlantillaItems.length - 1 ? "disabled" : ""} title="Bajar">↓</button>
    </div>
    <div class="au-pl-item-cuerpo">
      <div class="au-pl-item-barra">
        <div class="anexo-i-rte-toolbar">
          <button type="button" data-cmd="bold" title="Negrita"><b>B</b></button>
          <button type="button" data-cmd="underline" title="Subrayado"><u>S</u></button>
          <button type="button" data-cmd="insertUnorderedList" title="Viñetas">•</button>
        </div>
        <label class="au-pl-eje">Eje <select data-au-pl-eje>${Object.entries(AU_EJES).map(([k, v]) => `<option value="${k}" ${it.eje === k ? "selected" : ""} title="${escaparHtml(v)}">${k} · ${escaparHtml(v)}</option>`).join("")}</select></label>
        <label class="au-pl-activo"><input type="checkbox" data-au-pl-activo ${it.activo === false ? "" : "checked"}> Activo</label>
        <button type="button" class="au-link au-link-danger" data-au-pl-quitar title="Quitar punto">Quitar</button>
      </div>
      <div class="anexo-i-rte au-punto-rte" contenteditable="true" data-au-pl-texto>${it.texto_html || ""}</div>
    </div>
  </div>`).join("");

  cont.querySelectorAll(".au-pl-item").forEach(el => {
    const idx = Number(el.dataset.auPlIdx);
    auVincularToolbar(el.querySelector(".anexo-i-rte-toolbar"), el.querySelector("[data-au-pl-texto]"));
    el.querySelectorAll("[data-au-pl-mover]").forEach(b => b.addEventListener("click", () => {
      auLeerPlantillaDelDom();
      const destino = idx + Number(b.dataset.auPlMover);
      [auPlantillaItems[idx], auPlantillaItems[destino]] = [auPlantillaItems[destino], auPlantillaItems[idx]];
      auRenderPlantillaItems();
    }));
    el.querySelector("[data-au-pl-quitar]").addEventListener("click", () => {
      auLeerPlantillaDelDom();
      auPlantillaItems.splice(idx, 1);
      auRenderPlantillaItems();
    });
  });
}

function auLeerPlantillaDelDom() {
  document.querySelectorAll("#au-pl-items .au-pl-item").forEach(el => {
    const it = auPlantillaItems[Number(el.dataset.auPlIdx)];
    if (!it) return;
    it.texto_html = el.querySelector("[data-au-pl-texto]").innerHTML.trim();
    it.eje = el.querySelector("[data-au-pl-eje]").value;
    it.activo = el.querySelector("[data-au-pl-activo]").checked;
  });
}

async function auGuardarPlantilla() {
  auLeerPlantillaDelDom();
  setFormMessage("au-pl-message");
  const vacios = auPlantillaItems.filter(it => !auTextoPlano(it.texto_html));
  if (vacios.length) return setFormMessage("au-pl-message", "Hay puntos sin texto. Completalos o quitalos antes de guardar.");
  const boton = document.getElementById("au-pl-guardar");
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
    const existentes = await auFetch("auditoria_requerimiento_items", { params: { select: "id" } }) || [];
    const idsActuales = new Set(auPlantillaItems.filter(it => it.id).map(it => it.id));
    for (const e of existentes) {
      if (!idsActuales.has(e.id)) await auFetch("auditoria_requerimiento_items", { method: "DELETE", params: { id: `eq.${e.id}` } });
    }
    for (const [i, it] of auPlantillaItems.entries()) {
      const body = { orden: i + 1, texto_html: it.texto_html, eje: it.eje, activo: it.activo !== false, updated_at: new Date().toISOString() };
      if (it.id) await auFetch("auditoria_requerimiento_items", { method: "PATCH", params: { id: `eq.${it.id}` }, body });
      else await auFetch("auditoria_requerimiento_items", { method: "POST", body });
    }
    await auCargarPlantilla();
    setFormMessage("au-pl-message", "Plantilla guardada. Se aplica a las auditorías que se creen a partir de ahora.", "success");
  } catch (error) {
    setFormMessage("au-pl-message", error.message || "No se pudo guardar la plantilla.");
  } finally {
    boton.disabled = false;
  }
}

async function auPreviewPlantilla() {
  auLeerPlantillaDelDom();
  const boton = document.getElementById("au-pl-preview");
  try {
    boton.disabled = true;
    await auAsegurarLibsPdf();
    const textos = {
      req_titulo: document.getElementById("au-pl-titulo").value,
      req_subtitulo: document.getElementById("au-pl-subtitulo").value,
      req_intro: document.getElementById("au-pl-intro").innerHTML
    };
    const hoy = new Date().toISOString().slice(0, 10);
    const doc = auDocDefinicionRequerimiento({
      textos,
      puntos: auPlantillaItems.filter(it => it.activo !== false),
      anio: new Date().getFullYear(),
      os: { denominacion: "OBRA SOCIAL DE EJEMPLO", sigla: "OSEJ", rnos: "100000" },
      numeroEx: "EX-0000-00000000- -APN-GCP#SSS",
      fecha: hoy
    });
    window.pdfMake.createPdf(doc).open();
  } catch (error) {
    setFormMessage("au-pl-message", error.message || "No se pudo generar la vista previa.");
  } finally {
    boton.disabled = false;
  }
}
