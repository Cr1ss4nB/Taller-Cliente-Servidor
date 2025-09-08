let tareas = [];
let nextLocalId = 1;
const API_URL = "https://jsonplaceholder.typicode.com/todos";

const taskText = document.getElementById("taskText");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const feedback = document.getElementById("feedback");

async function agregarTarea() {
  const texto = taskText.value.trim();
  if (!texto) {
    mostrarFeedback("El campo no puede estar vacío", "error");
    return;
  }

  const nueva = {
    localId: nextLocalId++,
    title: texto,
    completed: false,
    serverId: null
  };

  tareas.push(nueva);
  taskText.value = "";
  renderizarTareas();
  mostrarFeedback("Enviando al servidor...", "info");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: nueva.title, completed: nueva.completed })
    });
    if (!res.ok) throw new Error("Error al agregar en servidor");
    const data = await res.json();
    const tareaLocal = tareas.find(t => t.localId === nueva.localId);
    if (tareaLocal) tareaLocal.serverId = data.id;
    mostrarFeedback("Tarea agregada con éxito", "success");
    renderizarTareas();
  } catch (err) {
    mostrarFeedback("No se pudo guardar en servidor: " + err.message, "error");
  }
}

async function completarTarea(localId) {
  const tarea = tareas.find(t => t.localId === localId);
  if (!tarea) return;
  tarea.completed = !tarea.completed;
  renderizarTareas();

  try {
    if (tarea.serverId) {
      const idValido = ((tarea.serverId - 1) % 200) + 1; 
      
      const res = await fetch(`${API_URL}/${idValido}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: idValido,
          title: tarea.title, 
          completed: tarea.completed,
          userId: 1
        })
      });
      if (!res.ok) throw new Error("Error al actualizar tarea en servidor");
    } else {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: tarea.title, 
          completed: tarea.completed,
          userId: 1
        })
      });
      if (!res.ok) throw new Error("Error al crear tarea en servidor");
      const data = await res.json();
      tarea.serverId = data.id;
    }
  } catch (err) {
  }
}


async function eliminarTarea(localId) {
  const tarea = tareas.find(t => t.localId === localId);
  if (!tarea) return;
  tareas = tareas.filter(t => t.localId !== localId);
  renderizarTareas();

  try {
    if (tarea.serverId) {
      const res = await fetch(`${API_URL}/${tarea.serverId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar tarea en servidor");
      mostrarFeedback("Tarea eliminada", "info");
    } else {
      mostrarFeedback("Tarea eliminada localmente", "info");
    }
  } catch (err) {
    mostrarFeedback("Error al eliminar en servidor: " + err.message, "error");
  }
}

function renderizarTareas() {
  taskList.innerHTML = "";
  tareas.forEach(t => {
    const li = document.createElement("li");
    li.className = t.completed ? "completed" : "";
    li.innerHTML = `
      <span>${escapeHtml(t.title)}</span>
      <button onclick="completarTarea(${t.localId})">
        ${t.completed ? "Desmarcar" : "Completar"}
      </button>
      <button onclick="eliminarTarea(${t.localId})">Eliminar</button>
    `;
    taskList.appendChild(li);
  });
}

function mostrarFeedback(mensaje, tipo) {
  feedback.textContent = mensaje;
  feedback.className = tipo;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

addTaskBtn.addEventListener("click", agregarTarea);
