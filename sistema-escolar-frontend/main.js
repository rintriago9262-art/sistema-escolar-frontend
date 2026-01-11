// Detecta automáticamente si estás en localhost o en producción
const API_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:4000" 
  : "https://sistema-escolar-backend-esnm.onrender.com";

let materiasLista = [];
let usuariosLista = []; 
let estudiantesLista = [];
let notasLista = [];
let usuarioLogueado = null;

// Variables de estado para edición de usuarios
let userModoEdit = false;
let userIdActual = null;

// Variables de estado para edición de estudiantes
let estudianteModoEdit = false;
let estudianteIdActual = null;

// Variables de estado para edición de notas
let notaModoEdit = false;
let notaIdActual = null;

// Referencias a la UI
const vistaLogin = document.getElementById("vistaLogin");
const vistaDashboard = document.getElementById("vistaDashboard");
const tablaMaterias = document.getElementById("tablaMaterias");
const tablaUsuarios = document.getElementById("tablaUsuarios");
const tablaEstudiantes = document.getElementById("tablaEstudiantes");
const tablaNotas = document.getElementById("tablaNotas");

// Modales
const modalMateriaBS = new bootstrap.Modal(document.getElementById("modalMateria"));
const modalUsuarioBS = document.getElementById("modalUsuario") ? new bootstrap.Modal(document.getElementById("modalUsuario")) : null;
const modalPerfilBS = new bootstrap.Modal(document.getElementById("modalPerfil"));
const modalEstudianteBS = document.getElementById("modalEstudiante") ? new bootstrap.Modal(document.getElementById("modalEstudiante")) : null;
const modalNotaBS = document.getElementById("modalNota") ? new bootstrap.Modal(document.getElementById("modalNota")) : null;

// =======================
// LOGIN
// =======================
document.getElementById("formLogin").addEventListener("submit", async e => {
  e.preventDefault();
  const cedula = document.getElementById("loginCedula").value;
  const clave = document.getElementById("loginClave").value;

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cedula, clave })
    });

    const data = await res.json();
    if (res.ok) {
      usuarioLogueado = data.usuario; 
      
      document.getElementById("userNombreDisplay").textContent = usuarioLogueado.nombre;
      
      vistaLogin.classList.add("d-none");
      vistaDashboard.classList.remove("d-none");
      
      // Cargamos los datos iniciales
      cargarMaterias();
      cargarUsuarios(); 
      cargarEstudiantes();
      cargarNotas();
    } else {
      document.getElementById("loginError").textContent = data.msg;
    }
  } catch (error) {
    console.error("Error en el login:", error);
    document.getElementById("loginError").textContent = "Error al conectar con el servidor";
  }
});

document.getElementById("btnSalir").onclick = () => location.reload();

// =======================
// GESTIÓN DE MATERIAS
// =======================
async function cargarMaterias() {
  const res = await fetch(`${API_URL}/materias`);
  materiasLista = await res.json();
  renderizarMaterias();
  llenarSelectMaterias(); // Para el select de notas
}

function renderizarMaterias() {
  if (!tablaMaterias) return;
  tablaMaterias.innerHTML = "";
  materiasLista.forEach(m => {
    tablaMaterias.innerHTML += `
      <tr>
        <td>${m.codigo}</td>
        <td>${m.nombre}</td>
        <td>${m.creditos}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editarMateria('${m.codigo}')"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-danger btn-sm" onclick="eliminarMateria('${m.codigo}')"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`;
  });
}

document.getElementById("formMateria").addEventListener("submit", async e => {
  e.preventDefault();
  const datos = {
    codigo: document.getElementById("matCodigo").value,
    nombre: document.getElementById("matNombre").value,
    creditos: document.getElementById("matCreditos").value
  };

  const editar = document.getElementById("matModoEdit").value === "true";
  const url = editar ? `${API_URL}/materias/${datos.codigo}` : `${API_URL}/materias`;
  const method = editar ? "PUT" : "POST";

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });

  modalMateriaBS.hide();
  cargarMaterias();
});

// =======================
// GESTIÓN DE USUARIOS
// =======================
async function cargarUsuarios() {
  const res = await fetch(`${API_URL}/usuarios`);
  usuariosLista = await res.json();
  renderizarUsuarios();
}

function renderizarUsuarios() {
  if (!tablaUsuarios) return;
  tablaUsuarios.innerHTML = "";
  
  usuariosLista.forEach(u => {
    tablaUsuarios.innerHTML += `
      <tr>
        <td>${u.id}</td>
        <td>${u.cedula}</td>
        <td>${u.nombre}</td>
        <td>
          <button class="btn btn-warning btn-sm me-1" onclick="editarUsuario(${u.id})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="eliminarUsuario(${u.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>`;
  });
}

const formUsuario = document.getElementById("formUsuario");
if (formUsuario) {
  formUsuario.addEventListener("submit", async (e) => {
    e.preventDefault(); 

    const datos = {
      cedula: document.getElementById("userCedula").value,
      nombre: document.getElementById("userNombre").value,
      clave: document.getElementById("userClave").value
    };

    const url = userModoEdit ? `${API_URL}/usuarios/${userIdActual}` : `${API_URL}/usuarios`;
    const method = userModoEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (res.ok) {
      alert(userModoEdit ? "Usuario actualizado" : "Usuario creado");
      formUsuario.reset();
      userModoEdit = false;
      userIdActual = null;
      if (modalUsuarioBS) modalUsuarioBS.hide();
      cargarUsuarios();
    } else {
      const error = await res.json();
      alert("Error: " + error.msg);
    }
  });
}

// =======================
// GESTIÓN DE ESTUDIANTES
// =======================
async function cargarEstudiantes() {
  const res = await fetch(`${API_URL}/estudiantes`);
  estudiantesLista = await res.json();
  renderizarEstudiantes();
  llenarSelectEstudiantes(); // Para el select de notas
}

function renderizarEstudiantes() {
  if (!tablaEstudiantes) return;
  tablaEstudiantes.innerHTML = "";
  
  estudiantesLista.forEach(e => {
    tablaEstudiantes.innerHTML += `
      <tr>
        <td>${e.id}</td>
        <td>${e.cedula}</td>
        <td>${e.nombre}</td>
        <td>${e.apellido}</td>
        <td>
          <button class="btn btn-warning btn-sm me-1" onclick="editarEstudiante(${e.id})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="eliminarEstudiante(${e.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>`;
  });
}

const formEstudiante = document.getElementById("formEstudiante");
if (formEstudiante) {
  formEstudiante.addEventListener("submit", async (e) => {
    e.preventDefault(); 

    const datos = {
      cedula: document.getElementById("estudianteCedula").value,
      nombre: document.getElementById("estudianteNombre").value,
      apellido: document.getElementById("estudianteApellido").value
    };

    const url = estudianteModoEdit ? `${API_URL}/estudiantes/${estudianteIdActual}` : `${API_URL}/estudiantes`;
    const method = estudianteModoEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (res.ok) {
      alert(estudianteModoEdit ? "Estudiante actualizado" : "Estudiante creado");
      formEstudiante.reset();
      estudianteModoEdit = false;
      estudianteIdActual = null;
      if (modalEstudianteBS) modalEstudianteBS.hide();
      cargarEstudiantes();
    } else {
      const error = await res.json();
      alert("Error: " + error.msg);
    }
  });
}

// =======================
// GESTIÓN DE NOTAS
// =======================
async function cargarNotas() {
  const res = await fetch(`${API_URL}/notas-detalle`);
  notasLista = await res.json();
  renderizarNotas();
}

function renderizarNotas() {
  if (!tablaNotas) return;
  tablaNotas.innerHTML = "";
  
  notasLista.forEach(n => {
    tablaNotas.innerHTML += `
      <tr>
        <td>${n.id}</td>
        <td>${n.estudiante}</td>
        <td>${n.materia}</td>
        <td><span class="badge ${n.calificacion >= 7 ? 'bg-success' : 'bg-danger'}">${n.calificacion}</span></td>
        <td>${n.observacion || '-'}</td>
        <td>
          <button class="btn btn-warning btn-sm me-1" onclick="editarNota(${n.id})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="eliminarNota(${n.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>`;
  });
}

const formNota = document.getElementById("formNota");
if (formNota) {
  formNota.addEventListener("submit", async (e) => {
    e.preventDefault(); 

    const datos = {
      estudiante_id: document.getElementById("notaEstudiante").value,
      materia_codigo: document.getElementById("notaMateria").value,
      calificacion: document.getElementById("notaCalificacion").value,
      observacion: document.getElementById("notaObservacion").value
    };

    const url = notaModoEdit ? `${API_URL}/notas/${notaIdActual}` : `${API_URL}/notas`;
    const method = notaModoEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (res.ok) {
      alert(notaModoEdit ? "Nota actualizada" : "Nota registrada");
      formNota.reset();
      notaModoEdit = false;
      notaIdActual = null;
      if (modalNotaBS) modalNotaBS.hide();
      cargarNotas();
    } else {
      const error = await res.json();
      alert("Error: " + error.msg);
    }
  });
}

// Función para llenar el select de estudiantes
function llenarSelectEstudiantes() {
  const select = document.getElementById("notaEstudiante");
  if (!select) return;
  
  select.innerHTML = '<option value="">Seleccione un estudiante</option>';
  estudiantesLista.forEach(e => {
    select.innerHTML += `<option value="${e.id}">${e.nombre} ${e.apellido} (${e.cedula})</option>`;
  });
}

// Función para llenar el select de materias
function llenarSelectMaterias() {
  const select = document.getElementById("notaMateria");
  if (!select) return;
  
  select.innerHTML = '<option value="">Seleccione una materia</option>';
  materiasLista.forEach(m => {
    select.innerHTML += `<option value="${m.codigo}">${m.nombre} (${m.codigo})</option>`;
  });
}

// =======================
// GESTIÓN DE PERFIL
// =======================
document.getElementById("btnPerfil").onclick = () => {
  if (usuarioLogueado) {
    document.getElementById("perfilNombre").textContent = usuarioLogueado.nombre;
    document.getElementById("perfilCedula").textContent = `C.I.: ${usuarioLogueado.cedula}`;
    modalPerfilBS.show();
  }
};

// =======================
// FUNCIONES GLOBALES (Window)
// =======================
window.prepararCrearUsuario = () => {
  formUsuario.reset();
  userModoEdit = false;
  userIdActual = null;
  document.getElementById("modalTituloUsuario").innerText = "Crear Usuario";
  if (modalUsuarioBS) modalUsuarioBS.show();
};

window.editarUsuario = (id) => {
  const u = usuariosLista.find(x => x.id === id);
  if (!u) return;

  document.getElementById("userCedula").value = u.cedula;
  document.getElementById("userNombre").value = u.nombre;
  document.getElementById("userClave").value = ""; 

  userModoEdit = true;
  userIdActual = id;
  document.getElementById("modalTituloUsuario").innerText = "Editar Usuario";

  if (modalUsuarioBS) modalUsuarioBS.show();
};

window.eliminarUsuario = async (id) => {
  if (!confirm("¿Eliminar este usuario?")) return;
  await fetch(`${API_URL}/usuarios/${id}`, { method: "DELETE" });
  cargarUsuarios();
};

window.prepararCrearMateria = () => {
  document.getElementById("formMateria").reset();
  document.getElementById("matCodigo").disabled = false;
  document.getElementById("matModoEdit").value = "false";
  modalMateriaBS.show();
};

window.editarMateria = codigo => {
  const m = materiasLista.find(x => x.codigo === codigo);
  if (!m) return;
  document.getElementById("matCodigo").value = m.codigo;
  document.getElementById("matNombre").value = m.nombre;
  document.getElementById("matCreditos").value = m.creditos;
  document.getElementById("matCodigo").disabled = true;
  document.getElementById("matModoEdit").value = "true";
  modalMateriaBS.show();
};

window.eliminarMateria = async (codigo) => {
  if (!confirm("¿Eliminar materia?")) return;
  await fetch(`${API_URL}/materias/${codigo}`, { method: "DELETE" });
  cargarMaterias();
};

// Funciones de Estudiantes
window.prepararCrearEstudiante = () => {
  formEstudiante.reset();
  estudianteModoEdit = false;
  estudianteIdActual = null;
  document.getElementById("modalTituloEstudiante").innerText = "Crear Estudiante";
  if (modalEstudianteBS) modalEstudianteBS.show();
};

window.editarEstudiante = (id) => {
  const e = estudiantesLista.find(x => x.id === id);
  if (!e) return;

  document.getElementById("estudianteCedula").value = e.cedula;
  document.getElementById("estudianteNombre").value = e.nombre;
  document.getElementById("estudianteApellido").value = e.apellido;

  estudianteModoEdit = true;
  estudianteIdActual = id;
  document.getElementById("modalTituloEstudiante").innerText = "Editar Estudiante";

  if (modalEstudianteBS) modalEstudianteBS.show();
};

window.eliminarEstudiante = async (id) => {
  if (!confirm("¿Eliminar este estudiante?")) return;
  await fetch(`${API_URL}/estudiantes/${id}`, { method: "DELETE" });
  cargarEstudiantes();
};

// Funciones de Notas
window.prepararCrearNota = () => {
  formNota.reset();
  notaModoEdit = false;
  notaIdActual = null;
  document.getElementById("modalTituloNota").innerText = "Registrar Nota";
  llenarSelectEstudiantes();
  llenarSelectMaterias();
  if (modalNotaBS) modalNotaBS.show();
};

window.editarNota = async (id) => {
  // Obtenemos los datos completos de la nota
  const res = await fetch(`${API_URL}/notas/${id}`);
  const nota = await res.json();
  
  if (!nota) return;

  document.getElementById("notaEstudiante").value = nota.estudiante_id;
  document.getElementById("notaMateria").value = nota.materia_codigo;
  document.getElementById("notaCalificacion").value = nota.calificacion;
  document.getElementById("notaObservacion").value = nota.observacion || "";

  notaModoEdit = true;
  notaIdActual = id;
  document.getElementById("modalTituloNota").innerText = "Editar Nota";

  llenarSelectEstudiantes();
  llenarSelectMaterias();
  if (modalNotaBS) modalNotaBS.show();
};

window.eliminarNota = async (id) => {
  if (!confirm("¿Eliminar esta nota?")) return;
  await fetch(`${API_URL}/notas/${id}`, { method: "DELETE" });
  cargarNotas();
};