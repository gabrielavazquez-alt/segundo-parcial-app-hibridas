import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProjectById } from "../../services/projectService";
import {
    fetchTasksByProject,
    createTask,
    updateTask,
    reassignTask,
} from "../../services/taskService";
import {
    fetchInstructionsByProject,
    createInstruction,
} from "../../services/instructionService";
import { fetchTranslators } from "../../services/userService";

export default function ProjectDetailPage() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [instructions, setInstructions] = useState([]);
    const [translators, setTranslators] = useState([]);
    const [loading, setLoading] = useState(true);

    const [taskForm, setTaskForm] = useState({
        title: "",
        description: "",
        assignedTo: "",
        dueDate: "",
    });

    const [instructionText, setInstructionText] = useState("");
    const [reassignForTask, setReassignForTask] = useState({});

    async function loadAll() {
        try {
            setLoading(true);
            const [p, t, instr] = await Promise.all([
                fetchProjectById(id),
                fetchTasksByProject(id),
                fetchInstructionsByProject(id),
            ]);
            setProject(p);
            setTasks(t || []);
            setInstructions(instr || []);
        } catch (err) {
            console.error(err);
            alert("Error cargando detalle de proyecto");
        } finally {
            setLoading(false);
        }
    }

    async function loadTranslators() {
        try {
            const data = await fetchTranslators();
            setTranslators(data || []);
        } catch (err) {
            console.error(err);
            alert("Error cargando traductores");
        }
    }

    useEffect(() => {
        loadAll();
        loadTranslators();
    }, [id]);

    async function handleCreateTask(e) {
        e.preventDefault();

        if (!taskForm.title || !taskForm.assignedTo || !taskForm.dueDate) {
            alert("Título, traductor y fecha límite son obligatorios.");
            return;
        }

        try {
            await createTask(id, taskForm);
            setTaskForm({
                title: "",
                description: "",
                assignedTo: "",
                dueDate: "",
            });
            loadAll();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Error creando tarea");
        }
    }

    async function handleCreateInstruction(e) {
        e.preventDefault();
        if (!instructionText.trim()) return;
        try {
            await createInstruction(id, instructionText.trim());
            setInstructionText("");
            loadAll();
        } catch (err) {
            console.error(err);
            alert("Error creando instrucción");
        }
    }

    async function handleChangeTaskStatus(taskId, status) {
        try {
            await updateTask(taskId, { status });
            loadAll();
        } catch (err) {
            console.error(err);
            alert("Error actualizando estado de la tarea");
        }
    }

    function handleReassignSelect(taskId, translatorId) {
        setReassignForTask((prev) => ({ ...prev, [taskId]: translatorId }));
    }

    async function handleReassignTask(taskId) {
        const translatorId = reassignForTask[taskId];
        if (!translatorId) {
            alert("Seleccioná un traductor para reasignar.");
            return;
        }

        try {
            await reassignTask(taskId, translatorId);
            setReassignForTask((prev) => ({ ...prev, [taskId]: "" }));
            loadAll();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Error reasignando tarea");
        }
    }

    // helper para mostrar nombre del traductor
    function getTranslatorLabel(task) {
        if (!task.assignedTo) return "Sin asignar";
        const tr = translators.find((t) => t._id === task.assignedTo);
        if (!tr) return task.assignedTo; // fallback: id
        return `${tr.name} (${tr.email})`;
    }

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950">
                <p className="text-sm text-slate-200">Cargando proyecto…</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-slate-950">
                <p className="text-sm text-slate-200">No se encontró el proyecto.</p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-6">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header proyecto */}
                <header className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/40">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-slate-50">
                                {project.name}
                            </h1>
                            {project.description && (
                                <p className="mt-1 text-sm text-slate-300">
                                    {project.description}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${project.status === "DELIVERED"
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/60"
                                        : project.status === "IN_PROGRESS"
                                            ? "bg-sky-500/20 text-sky-300 border border-sky-500/60"
                                            : "bg-slate-500/25 text-slate-100 border border-slate-500/60"
                                    }`}
                            >
                                Estado: {project.status}
                            </span>
                            <p className="text-[11px] text-slate-400">
                                ID proyecto: <span className="font-mono">{project._id}</span>
                            </p>
                        </div>
                    </div>
                </header>

                {/* Grid: tareas / instrucciones */}
                <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)]">
                    {/* Tareas */}
                    <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/40">
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-100">
                                    Tareas
                                </h2>
                                <p className="text-[11px] text-slate-400">
                                    Creá tareas para traductores y seguí su estado.
                                </p>
                            </div>
                        </div>

                        {/* Formulario crear tarea */}
                        <form
                            onSubmit={handleCreateTask}
                            className="mb-5 grid gap-3 text-sm md:grid-cols-4"
                        >
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Título
                                </label>
                                <input
                                    name="title"
                                    placeholder="Ej: Review es-LA"
                                    value={taskForm.title}
                                    onChange={(e) =>
                                        setTaskForm({ ...taskForm, title: e.target.value })
                                    }
                                    className="w-full rounded-xl bg-slate-950 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/80"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Descripción (opcional)
                                </label>
                                <input
                                    name="description"
                                    placeholder="Detalles, archivos, notas…"
                                    value={taskForm.description}
                                    onChange={(e) =>
                                        setTaskForm({
                                            ...taskForm,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl bg-slate-950 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/80"
                                />
                            </div>

                            {/* Selector de traductor */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Traductor asignado
                                </label>
                                <select
                                    name="assignedTo"
                                    value={taskForm.assignedTo}
                                    onChange={(e) =>
                                        setTaskForm({ ...taskForm, assignedTo: e.target.value })
                                    }
                                    className="w-full rounded-xl bg-slate-950 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/80"
                                >
                                    <option value="">Seleccioná un traductor…</option>
                                    {translators.map((t) => (
                                        <option key={t._id} value={t._id}>
                                            {t.name} ({t.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Fecha límite */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Fecha límite
                                </label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={taskForm.dueDate}
                                    onChange={(e) =>
                                        setTaskForm({ ...taskForm, dueDate: e.target.value })
                                    }
                                    className="w-full rounded-xl bg-slate-950 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/80"
                                />
                            </div>

                            <div className="md:col-span-4 flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex items-center rounded-xl bg-linear-to-r from-emerald-500 to-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/40 hover:from-emerald-400 hover:to-sky-400"
                                >
                                    Crear tarea
                                </button>
                            </div>
                        </form>

                        {/* Listado de tareas */}
                        {tasks.length === 0 ? (
                            <p className="text-sm text-slate-300">
                                No hay tareas aún para este proyecto.
                            </p>
                        ) : (
                            <ul className="space-y-3 text-sm">
                                {tasks.map((t) => {
                                    const translatorLabel = getTranslatorLabel(t);
                                    const isRejected = t.status === "REJECTED" || !t.assignedTo;

                                    return (
                                        <li
                                            key={t._id}
                                            className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-semibold text-slate-50">
                                                        {t.title}
                                                    </p>
                                                    {t.description && (
                                                        <p className="mt-1 text-[12px] text-slate-300">
                                                            {t.description}
                                                        </p>
                                                    )}
                                                    <p className="text-[11px] text-slate-400 mt-1">
                                                        Traductor:{" "}
                                                        <span className="font-medium">
                                                            {translatorLabel}
                                                        </span>
                                                    </p>
                                                    {t.dueDate && (
                                                        <p className="text-[11px] text-slate-400">
                                                            Fecha límite:{" "}
                                                            {new Date(t.dueDate).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                    {t.completedAt && (
                                                        <p className="text-[11px] text-emerald-300">
                                                            Completada el{" "}
                                                            {new Date(t.completedAt).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    {/* badge estado */}
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-[11px] font-medium ${t.status === "COMPLETED"
                                                                ? "bg-emerald-500/15 text-emerald-300"
                                                                : t.status === "IN_PROGRESS" ||
                                                                    t.status === "ACCEPTED"
                                                                    ? "bg-sky-500/15 text-sky-300"
                                                                    : t.status === "REJECTED"
                                                                        ? "bg-red-500/15 text-red-300"
                                                                        : "bg-slate-500/20 text-slate-100"
                                                            }`}
                                                    >
                                                        {t.status}
                                                    </span>

                                                    {/* Selector de estado para el PM */}
                                                    <select
                                                        value={t.status}
                                                        onChange={(e) =>
                                                            handleChangeTaskStatus(t._id, e.target.value)
                                                        }
                                                        className="rounded-xl bg-slate-950 border border-slate-700 px-2 py-1 text-[11px] text-slate-100 focus:outline-none focus:border-emerald-400"
                                                    >
                                                        <option value="PENDING">PENDING</option>
                                                        <option value="ACCEPTED">ACCEPTED</option>
                                                        <option value="REJECTED">REJECTED</option>
                                                        <option value="COMPLETED">COMPLETED</option>
                                                    </select>

                                                    {/* Reasignar si está rechazada o sin traductor */}
                                                    {isRejected && (
                                                        <div className="mt-1 flex flex-col gap-1">
                                                            <select
                                                                value={reassignForTask[t._id] || ""}
                                                                onChange={(e) =>
                                                                    handleReassignSelect(
                                                                        t._id,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="rounded-xl bg-slate-950 border border-slate-700 px-2 py-1 text-[11px] text-slate-100 focus:outline-none focus:border-emerald-400"
                                                            >
                                                                <option value="">Reasignar a…</option>
                                                                {translators.map((tr) => (
                                                                    <option key={tr._id} value={tr._id}>
                                                                        {tr.name} ({tr.email})
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleReassignTask(t._id)}
                                                                className="rounded-xl border border-emerald-500/70 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-500/20"
                                                            >
                                                                Confirmar reasignación
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    {/* Instrucciones */}
                    <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/40">
                        <h2 className="text-sm font-semibold text-slate-100 mb-1.5">
                            Instrucciones del proyecto
                        </h2>
                        <p className="text-[11px] text-slate-400 mb-4">
                            Dejá indicaciones globales para todos los traductores.
                        </p>

                        <form onSubmit={handleCreateInstruction} className="space-y-3 mb-4">
                            <textarea
                                placeholder="Nueva instrucción (glosarios, tono, referencias…)"
                                value={instructionText}
                                onChange={(e) => setInstructionText(e.target.value)}
                                rows={4}
                                className="w-full rounded-xl bg-slate-950 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/80"
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex items-center rounded-xl border border-emerald-400/70 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/20"
                                >
                                    Agregar instrucción
                                </button>
                            </div>
                        </form>

                        {instructions.length === 0 ? (
                            <p className="text-sm text-slate-300">No hay instrucciones aún.</p>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {instructions.map((i, index) => (
                                    <li
                                        key={i._id}
                                        className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2"
                                    >
                                        <p className="text-[11px] text-slate-400 mb-1">
                                            Instrucción #{index + 1}
                                        </p>
                                        <p className="text-sm text-slate-100 whitespace-pre-line">
                                            {i.content}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
