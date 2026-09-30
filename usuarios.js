// =====================================================================
// Usuarios: alta y gestión (solo perfil Administrador).
// Usa la Edge Function "admin-usuarios", que valida el perfil del que llama
// y opera con la clave de servicio del lado del servidor.
// =====================================================================

let usUsuarios = [];
let usPerfiles = [];
let usEventos = false;
let usOsPorEtiqueta = new Map();
let usAccesos = {};

async function usLlamar(accion, datos = {}) {
  const session = await asegurarSesionVigente();
  const resp = await fetchConTimeout(`${SUPABASE_URL}/functions/v1/admin-usuarios`, {
    method: "POST",
    headers: { ...authHeaders(session.access_token), "Content-Type": "application/json" },
    body: JSON.stringify({ accion, ...datos })
  }, 20000);
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || data.error) throw new Error(data.error || `El servidor respondió ${resp.status}.`);
  return data;
}

function usGenerarPassword() {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
  const numeros = "23456789";
  const arr = new Uint32Array(10);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < 8; i++) out += letras[arr[i] % letras.length];
  out += numeros[arr[8] % numeros.length] + numeros[arr[9] % numeros.length];
  return out;
}

function usRnasOs(id) {
  const o = (typeof obrasSocialesTodas !== "undefined" ? obrasSocialesTodas : []).find(x => String(x.id) === String(id));
  return o ? (o.rnos || o.rnemp || "") : "";
}

function usEtiquetaOs(id) {
  for (const [et, osId] of usOsPorEtiqueta) if (String(osId) === String(id)) return et;
  return "";
}

async function usAsegurarOs() {
  await asegurarObrasSocialesTodasCargadas();
  usOsPorEtiqueta = new Map();
  obrasSocialesTodas.forEach(o => {
    const codigo = o.rnos || o.rnemp || "";
    usOsPorEtiqueta.set(`${o.denominacion}${codigo ? ` (${codigo})` : ""}`, o.id);
  });
  document.getElementById("us-os-datalist").innerHTML = [...usOsPorEtiqueta.keys()].map(e => `<option value="${escaparHtml(e)}"></option>`).join("");
}

function inicializarVistaUsuarios() {
  if (!usEventos) {
    usEventos = true;
    document.getElementById("us-btn-nuevo").addEventListener("click", () => usAbrirModal(null));
    document.getElementById("us-search").addEventListener("input", usRender);
    document.getElementById("us-form").addEventListener("submit", usGuardar);
    document.getElementById("us-perfil").addEventListener("change", () => { usAccesos = accesosSugeridosPerfil(document.getElementById("us-perfil").value); usActualizarCampoOs(); usRenderAccesos(); });
    document.getElementById("us-accesos-reset").addEventListener("click", () => { usAccesos = accesosSugeridosPerfil(document.getElementById("us-perfil").value); usRenderAccesos(); });
    document.getElementById("us-generar").addEventListener("click", () => { document.getElementById("us-password").value = usGenerarPassword(); });
    document.getElementById("us-blanquear").addEventListener("click", usBlanquear);
    document.getElementById("us-bloquear").addEventListener("click", usBloquear);
    document.getElementById("us-eliminar").addEventListener("click", usEliminar);
  }
  usCargar();
}

async function usCargar() {
  document.getElementById("us-count").textContent = "Cargando usuarios...";
  try {
    const [data] = await Promise.all([usLlamar("listar"), usAsegurarOs()]);
    usUsuarios = (data.usuarios || []).sort((a, b) => (a.nombre || a.email).localeCompare(b.nombre || b.email, "es"));
    usPerfiles = data.perfiles || [];
    usRender();
  } catch (error) {
    document.getElementById("us-count").textContent = `No se pudieron cargar los usuarios. ${error.message || ""}`;
  }
}

function usFecha(iso) {
  if (!iso) return "Nunca";
  return new Date(iso).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
}

function usRender() {
  const q = normalizar(document.getElementById("us-search").value || "");
  const filas = usUsuarios.filter(u => !q || [u.nombre, u.email, etiquetaPerfil(u.perfil), usEtiquetaOs(u.obra_social_id), usRnasOs(u.obra_social_id)].some(v => normalizar(v).includes(q)));
  document.getElementById("us-table-body").innerHTML = filas.map(u => {
    const estado = u.bloqueado ? `<span class="us-pill bloqueado">Bloqueado</span>`
      : u.debe_cambiar_password ? `<span class="us-pill pendiente">Debe cambiar contraseña</span>`
      : `<span class="us-pill activo">Activo</span>`;
    return `<tr class="os-row" data-us-id="${u.id}" tabindex="0" role="button" title="Clic para editar">
      <td class="ellipsis-cell" style="max-width:320px" title="${escaparHtml(u.nombre || "")}"><strong>${escaparHtml(u.nombre || "—")}</strong></td>
      <td>${escaparHtml(u.email)}</td>
      <td>${escaparHtml(etiquetaPerfil(u.perfil))}${usResumenModulos(u)}</td>
      <td title="${escaparHtml(usEtiquetaOs(u.obra_social_id))}">${escaparHtml(u.obra_social_id ? usRnasOs(u.obra_social_id) || `ID ${u.obra_social_id}` : "—")}</td>
      <td class="date-cell">${usFecha(u.ultimo_ingreso)}</td>
      <td>${estado}</td>
    </tr>`;
  }).join("");
  document.getElementById("us-count").textContent = `${filas.length} usuario${filas.length === 1 ? "" : "s"}`;
  document.getElementById("us-empty").hidden = filas.length !== 0;
  document.querySelectorAll("[data-us-id]").forEach(tr => {
    const abrir = () => usAbrirModal(tr.dataset.usId);
    tr.addEventListener("click", abrir);
    tr.addEventListener("keydown", e => { if (e.key === "Enter") abrir(); });
  });
}

function usActualizarCampoOs() {
  const esOs = document.getElementById("us-perfil").value === "Cartilla OS";
  document.getElementById("us-os-label").hidden = !esOs;
}

function usAbrirModal(id) {
  const u = id ? usUsuarios.find(x => x.id === id) : null;
  const esNuevo = !u;
  document.getElementById("us-form").reset();
  document.getElementById("us-id").value = u?.id || "";
  document.getElementById("us-modal-title").textContent = esNuevo ? "Nuevo usuario" : "Editar usuario";
  document.getElementById("us-perfil").innerHTML = `<option value="">Elegir...</option>` + usPerfiles.map(p => `<option value="${escaparHtml(p)}">${escaparHtml(etiquetaPerfil(p))}</option>`).join("");
  document.getElementById("us-nombre").value = u?.nombre || "";
  const email = document.getElementById("us-email");
  email.value = u?.email || "";
  email.readOnly = !esNuevo;
  document.getElementById("us-perfil").value = u ? usPerfilActualizado(u.perfil) : "";
  document.getElementById("us-os").value = u?.obra_social_id ? usEtiquetaOs(u.obra_social_id) : "";
  document.getElementById("us-pass-bloque").hidden = !esNuevo;
  document.getElementById("us-password").required = esNuevo;
  document.getElementById("us-password").value = esNuevo ? usGenerarPassword() : "";
  document.getElementById("us-acciones-extra").hidden = esNuevo;
  document.getElementById("us-bloquear").textContent = u?.bloqueado ? "Desbloquear acceso" : "Bloquear acceso";
  document.getElementById("us-guardar").textContent = esNuevo ? "Crear usuario" : "Guardar cambios";
  document.getElementById("us-guardar").hidden = false;
  document.getElementById("us-credenciales").hidden = true;
  setFormMessage("us-message");
  usAccesos = u ? usAccesosEfectivos(u) : {};
  usActualizarCampoOs();
  usRenderAccesos();
  abrirModal("us-modal");
}

function usMostrarCredenciales(email, password, titulo) {
  const box = document.getElementById("us-credenciales");
  const texto = `Sistema de Reportes GCP\nhttps://reportegcp.github.io/reportes-gcp/\nUsuario: ${email}\nContraseña temporal: ${password}\nAl ingresar, el sistema le va a pedir que la cambie.`;
  box.innerHTML = `<strong>${escaparHtml(titulo)}</strong>
    <pre>${escaparHtml(texto)}</pre>
    <button type="button" class="secondary small" id="us-copiar">Copiar datos para enviar</button>`;
  box.hidden = false;
  document.getElementById("us-copiar").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(texto); mostrarToast("Datos copiados."); }
    catch { mostrarToast("No se pudo copiar; seleccioná el texto a mano.", "error"); }
  });
}

async function usGuardar(event) {
  event.preventDefault();
  setFormMessage("us-message");
  const id = document.getElementById("us-id").value;
  const perfil = document.getElementById("us-perfil").value;
  const nombre = document.getElementById("us-nombre").value.trim();
  let obra_social_id = null;
  if (perfil === "Cartilla OS") {
    obra_social_id = usOsPorEtiqueta.get(document.getElementById("us-os").value.trim());
    if (!obra_social_id) return setFormMessage("us-message", "Elegí la Obra Social de la lista desplegable.");
  }
  if (!perfil) return setFormMessage("us-message", "Elegí el perfil.");
  if (tipoPerfil(perfil) === "interno" && !Object.keys(usAccesosLimpios()).length) return setFormMessage("us-message", "Dale acceso al menos a un módulo (Solo mirar o Editar).");
  const boton = document.getElementById("us-guardar");
  try {
    boton.disabled = true;
    if (!id) {
      const email = document.getElementById("us-email").value.trim();
      const password = document.getElementById("us-password").value;
      await usLlamar("crear", { email, password, nombre, perfil, obra_social_id, accesos: usAccesosLimpios() });
      usMostrarCredenciales(email.toLowerCase(), password, "Usuario creado. Enviale estos datos:");
      document.getElementById("us-guardar").hidden = true;
      mostrarToast("Usuario creado.");
    } else {
      await usLlamar("editar", { id, nombre, perfil, obra_social_id, accesos: usAccesosLimpios() });
      mostrarToast("Cambios guardados.");
      cerrarModal("us-modal");
    }
    await usCargar();
  } catch (error) {
    setFormMessage("us-message", error.message || "No se pudo guardar.");
  } finally {
    boton.disabled = false;
  }
}

async function usBlanquear() {
  const id = document.getElementById("us-id").value;
  const u = usUsuarios.find(x => x.id === id);
  if (!u) return;
  const ok = await mostrarConfirmacion(`¿Blanquear la contraseña de ${u.email}? Se genera una contraseña temporal nueva y la actual deja de funcionar.`, { titulo: "Blanquear contraseña", textoAceptar: "Blanquear" });
  if (!ok) return;
  try {
    const password = usGenerarPassword();
    await usLlamar("blanquear", { id, password });
    usMostrarCredenciales(u.email, password, "Contraseña blanqueada. Enviale estos datos:");
    await usCargar();
  } catch (error) {
    setFormMessage("us-message", error.message || "No se pudo blanquear.");
  }
}

async function usBloquear() {
  const id = document.getElementById("us-id").value;
  const u = usUsuarios.find(x => x.id === id);
  if (!u) return;
  const bloquear = !u.bloqueado;
  const ok = await mostrarConfirmacion(bloquear
    ? `¿Bloquear el acceso de ${u.email}? No va a poder ingresar hasta que lo desbloquees.`
    : `¿Desbloquear el acceso de ${u.email}?`, { titulo: bloquear ? "Bloquear acceso" : "Desbloquear acceso", textoAceptar: bloquear ? "Bloquear" : "Desbloquear" });
  if (!ok) return;
  try {
    await usLlamar("bloquear", { id, bloqueado: bloquear });
    mostrarToast(bloquear ? "Acceso bloqueado." : "Acceso desbloqueado.");
    cerrarModal("us-modal");
    await usCargar();
  } catch (error) {
    setFormMessage("us-message", error.message || "No se pudo cambiar el acceso.");
  }
}

async function usEliminar() {
  const id = document.getElementById("us-id").value;
  const u = usUsuarios.find(x => x.id === id);
  if (!u) return;
  const ok = await mostrarConfirmacion(`¿Eliminar definitivamente a ${u.nombre || u.email} (${u.email})? No se puede deshacer: para volver a darle acceso habría que crearlo de nuevo. Si solo querés que no entre por un tiempo, usá "Bloquear acceso".`, { titulo: "Eliminar usuario", textoAceptar: "Eliminar" });
  if (!ok) return;
  try {
    await usLlamar("eliminar", { id });
    mostrarToast("Usuario eliminado.");
    cerrarModal("us-modal");
    await usCargar();
  } catch (error) {
    setFormMessage("us-message", error.message || "No se pudo eliminar.");
  }
}

// ---------- Accesos por módulo (Sin acceso / Solo mirar / Editar) ----------

const US_PERFIL_NUEVO = {
  "admin prestacional": "Coordinador",
  "admin presentaciones": "Analista",
  "admin preexistencias": "Analista",
  "carga presentaciones": "Administrativo",
  "personal gcp": "Analista"
};

function usPerfilActualizado(perfil) {
  return US_PERFIL_NUEVO[normalizarPerfilAcceso(perfil)] || perfil || "";
}

function usAccesosEfectivos(u) {
  const out = {};
  VISTAS_CON_ACCESO_PERSONALIZABLE.forEach(v => {
    const nivel = nivelAccesoPerfil(u.perfil, u.accesos, v);
    if (nivel) out[v] = nivel;
  });
  return out;
}

function usResumenModulos(u) {
  if (tipoPerfil(u.perfil) !== "interno") return "";
  const acc = usAccesosEfectivos(u);
  const mods = MODULOS_ACCESO.filter(m => m.vistas.some(([v]) => acc[v])).map(m => m.nombre);
  return mods.length ? `<div class="us-modulos-resumen" title="${escaparHtml(mods.join(", "))}">${escaparHtml(mods.join(" · "))}</div>` : `<div class="us-modulos-resumen">Sin módulos</div>`;
}

function usAccesosLimpios() {
  const out = {};
  for (const [v, nivel] of Object.entries(usAccesos)) if (VISTAS_CON_ACCESO_PERSONALIZABLE.has(v) && (nivel === "editar" || nivel === "ver")) out[v] = nivel;
  return out;
}

function usRenderAccesos() {
  const perfil = document.getElementById("us-perfil").value;
  const bloque = document.getElementById("us-accesos-bloque");
  const personalizable = tipoPerfil(perfil) === "interno";
  bloque.hidden = false;
  document.getElementById("us-accesos-reset").hidden = !personalizable;
  if (!personalizable) {
    const aviso = !perfil
      ? "Elegí primero el perfil: se cargan unos accesos sugeridos y después elegís, módulo por módulo, Sin acceso, Solo mirar o Editar."
      : tipoPerfil(perfil) === "administrador"
        ? "El Administrador ve y edita todo, incluido Usuarios. No se configura."
        : "La Obra Social ve solo la presentación de Cartilla de su propia Obra Social. No se configura.";
    document.getElementById("us-accesos").innerHTML = `<div class="us-accesos-aviso">${aviso}</div>`;
    return;
  }
  const opciones = (actual, pendiente) => `<option value="" ${actual === "" ? "selected" : ""}>Sin acceso</option><option value="ver" ${actual === "ver" ? "selected" : ""}>Solo mirar${pendiente ? " *" : ""}</option><option value="editar" ${actual === "editar" ? "selected" : ""}>Editar</option>`;
  document.getElementById("us-accesos").innerHTML = MODULOS_ACCESO.map((m, i) => {
    const niveles = m.vistas.map(([v]) => usAccesos[v] || "");
    const todos = niveles.every(n => n === niveles[0]) ? niveles[0] : "mixto";
    const activo = niveles.some(Boolean);
    const cabecera = `<div class="us-modulo-cab"><span>${escaparHtml(m.nombre)}</span>
      <select data-us-mod="${i}" class="us-nivel ${todos === "mixto" ? "mixto" : "n-" + (todos || "no")}">
        ${todos === "mixto" ? `<option value="mixto" selected>Personalizado</option>` : ""}${opciones(todos === "mixto" ? "mixto" : todos, m.vistas.some(([v]) => !VISTAS_SOLO_MIRAR_LISTAS.has(v)))}
      </select></div>`;
    const items = m.vistas.length > 1 ? `<div class="us-modulo-items">${m.vistas.map(([v, nombre]) => `<div class="us-item"><span>${escaparHtml(nombre)}</span>
        <select data-us-vista="${v}" class="us-nivel n-${usAccesos[v] || "no"}">${opciones(usAccesos[v] || "", !VISTAS_SOLO_MIRAR_LISTAS.has(v))}</select></div>`).join("")}</div>` : "";
    return `<div class="us-modulo ${activo ? "activo" : ""}">${cabecera}${items}</div>`;
  }).join("") + `<div class="us-accesos-nota">* En estas pantallas "Solo mirar" todavía funciona como "Editar": las voy adaptando por etapas.</div>`;
  const cont = document.getElementById("us-accesos");
  const fijar = (v, nivel) => { if (nivel) usAccesos[v] = nivel; else delete usAccesos[v]; };
  cont.querySelectorAll("[data-us-vista]").forEach(sel => sel.addEventListener("change", () => { fijar(sel.dataset.usVista, sel.value); usRenderAccesos(); }));
  cont.querySelectorAll("[data-us-mod]").forEach(sel => sel.addEventListener("change", () => {
    if (sel.value === "mixto") return;
    MODULOS_ACCESO[Number(sel.dataset.usMod)].vistas.forEach(([v]) => fijar(v, sel.value));
    usRenderAccesos();
  }));
}
