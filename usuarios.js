// =====================================================================
// Usuarios: alta y gestión (solo perfil Administrador).
// Usa la Edge Function "admin-usuarios", que valida el perfil del que llama
// y opera con la clave de servicio del lado del servidor.
// =====================================================================

let usUsuarios = [];
let usPerfiles = [];
let usEventos = false;
let usOsPorEtiqueta = new Map();

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
    document.getElementById("us-perfil").addEventListener("change", usActualizarCampoOs);
    document.getElementById("us-generar").addEventListener("click", () => { document.getElementById("us-password").value = usGenerarPassword(); });
    document.getElementById("us-blanquear").addEventListener("click", usBlanquear);
    document.getElementById("us-bloquear").addEventListener("click", usBloquear);
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
  const filas = usUsuarios.filter(u => !q || [u.nombre, u.email, u.perfil, usEtiquetaOs(u.obra_social_id)].some(v => normalizar(v).includes(q)));
  document.getElementById("us-table-body").innerHTML = filas.map(u => {
    const estado = u.bloqueado ? `<span class="us-pill bloqueado">Bloqueado</span>`
      : u.debe_cambiar_password ? `<span class="us-pill pendiente">Debe cambiar contraseña</span>`
      : `<span class="us-pill activo">Activo</span>`;
    return `<tr class="os-row" data-us-id="${u.id}" tabindex="0" role="button" title="Clic para editar">
      <td><strong>${escaparHtml(u.nombre || "—")}</strong></td>
      <td>${escaparHtml(u.email)}</td>
      <td>${escaparHtml(u.perfil || "Sin perfil")}</td>
      <td class="ellipsis-cell" style="max-width:260px" title="${escaparHtml(usEtiquetaOs(u.obra_social_id))}">${escaparHtml(u.obra_social_id ? usEtiquetaOs(u.obra_social_id) || `ID ${u.obra_social_id}` : "—")}</td>
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
  document.getElementById("us-perfil").innerHTML = `<option value="">Elegir...</option>` + usPerfiles.map(p => `<option>${escaparHtml(p)}</option>`).join("");
  document.getElementById("us-nombre").value = u?.nombre || "";
  const email = document.getElementById("us-email");
  email.value = u?.email || "";
  email.readOnly = !esNuevo;
  document.getElementById("us-perfil").value = u?.perfil || "";
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
  usActualizarCampoOs();
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
  const boton = document.getElementById("us-guardar");
  try {
    boton.disabled = true;
    if (!id) {
      const email = document.getElementById("us-email").value.trim();
      const password = document.getElementById("us-password").value;
      await usLlamar("crear", { email, password, nombre, perfil, obra_social_id });
      usMostrarCredenciales(email.toLowerCase(), password, "Usuario creado. Enviale estos datos:");
      document.getElementById("us-guardar").hidden = true;
      mostrarToast("Usuario creado.");
    } else {
      await usLlamar("editar", { id, nombre, perfil, obra_social_id });
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
