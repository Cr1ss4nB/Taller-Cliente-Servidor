let tareas = [];
let nextId = 1;
const API_URL = "https://jsonplaceholder.typicode.com/todos";

const taskText = document.getElementById("taskText");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const feedback = document.getElementById("feedback");

async function agregarTarea() {
  const texto = taskText.value.trim();
  if (texto === "") {
    mostrarFeedback("El campo no puede estar vacío", "error");
    return;
  }

  const nuevaTarea = { id: nextId++, title: texto, completed: false };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(nuevaTarea),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Error al agregar en servidor");

    const data = await response.json();
    tareas.push(data);

    mostrarFeedback("Tarea agregada con éxito", "success");
    taskText.value = "";
    renderizarTareas();
  } catch (error) {
    mostrarFeedback(error.message, "error");
  }
}

async function completarTarea(id) {
  const tarea = tareas.find((t) => t.id === id);
  if (!tarea) return;

  tarea.completed = !tarea.completed;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(tarea),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Error al actualizar tarea");

    mostrarFeedback("Tarea actualizada", "success");
    renderizarTareas();
  } catch (error) {
    mostrarFeedback(error.message, "error");
  }
}

async function eliminarTarea(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Error al eliminar tarea");

    tareas = tareas.filter((t) => t.id !== id);
    mostrarFeedback("Tarea eliminada", "info");
    renderizarTareas();
  } catch (error) {
    mostrarFeedback(error.message, "error");
  }
}

function renderizarTareas() {
  taskList.innerHTML = "";
  tareas.forEach((tarea) => {
    const li = document.createElement("li");
    li.className = tarea.completed ? "completed" : "";
    li.innerHTML = `
      <span>${tarea.title}</span>
      <button onclick="completarTarea(${tarea.id})">
        ${tarea.completed ? "Desmarcar" : "Completar"}
      </button>
      <button onclick="eliminarTarea(${tarea.id})">Eliminar</button>
    `;
    taskList.appendChild(li);
  });
}

function mostrarFeedback(mensaje, tipo) {
  feedback.textContent = mensaje;
  feedback.className = tipo;
}

addTaskBtn.addEventListener("click", agregarTarea);