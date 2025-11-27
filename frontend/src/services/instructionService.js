import api from "./api";

export async function fetchInstructionsByProject(projectId) {
    const res = await api.get(`/instructions/project/${projectId}`);
    return res.data.instructions;
}

export async function createInstruction(projectId, content) {
    const res = await api.post(`/instructions/project/${projectId}`, { content });
    return res.data.instruction;
}

export async function updateInstruction(instructionId, content) {
    const res = await api.put(`/instructions/${instructionId}`, { content });
    return res.data.instruction;
}

export async function deleteInstruction(instructionId) {
    const res = await api.delete(`/instructions/${instructionId}`);
    return res.data;
}
