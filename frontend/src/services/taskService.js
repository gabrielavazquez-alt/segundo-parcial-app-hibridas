import api from "./api";

// PM: tareas de un proyecto
export async function fetchTasksByProject(projectId) {
    const res = await api.get(`/tasks/project/${projectId}`);
    return res.data.tasks;
}

// PM: crear tarea
export async function createTask(projectId, data) {
    const res = await api.post(`/tasks/project/${projectId}`, data);
    return res.data;
}

// PM: actualizar tarea
export async function updateTask(taskId, data) {
    const res = await api.put(`/tasks/${taskId}`, data);
    return res.data.task;
}

// PM: eliminar tarea
export async function deleteTask(taskId) {
    const res = await api.delete(`/tasks/${taskId}`);
    return res.data;
}

// Traductor: tareas
export async function fetchMyTasks() {
    const res = await api.get("/tasks/translator/me");
    return res.data.tasks;
}

// Traductor: cambiar estado
export async function translatorChangeStatus(taskId, status) {
    const res = await api.patch(`/tasks/translator/${taskId}`, { status });
    return res.data.task;
}

export async function reassignTask(taskId, assignedTo) {
    const res = await api.patch(`/tasks/${taskId}/reassign`, { assignedTo });
    return res.data.task;
}