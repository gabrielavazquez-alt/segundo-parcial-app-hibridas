import api from "./api";

export async function fetchProjects() {
    const res = await api.get("/projects");
    return res.data.projects;
}

export async function fetchProjectById(id) {
    const res = await api.get(`/projects/${id}`);
    return res.data.project;
}

export async function createProject(data) {
    const res = await api.post("/projects", data);
    return res.data.project;
}

export async function updateProject(id, data) {
    const res = await api.put(`/projects/${id}`, data);
    return res.data.project;
}

export async function deleteProject(id) {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
}
