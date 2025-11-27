import { useEffect, useState, useMemo } from "react";
import {
    fetchMyTasks,
    translatorChangeStatus,
} from "../../services/taskService";

export default function TranslatorTasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    async function loadTasks() {
        try {
            setLoading(true);
            const data = await fetchMyTasks();
            setTasks((data || []).filter((t) => t.status !== "REJECTED"));
        } catch (err) {
            console.error(err);
            alert("Error cargando tareas");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTasks();
    }, []);

    async function handleChangeStatus(id, status) {
        try {
            await translatorChangeStatus(id, status);
            loadTasks();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Error cambiando estado");
        }
    }

    // Agrupar por proyecto
    const groupedByProject = useMemo(() => {
        const groups = {};

        for (const t of tasks) {
            const key = t.projectId ? t.projectId.toString() : "NO_PROJECT";

            const name = t.projectName || "Proyecto sin nombre";

            if (!groups[key]) {
                groups[key] = {
                    projectName: name,
                    tasks: [],
                };
            }

            groups[key].tasks.push(t);
        }

        return groups;
    }, [tasks]);

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950">
                <p className="text-sm text-slate-200">Cargando tareas…</p>
            </div>
        );
    }

    const projectEntries = Object.entries(groupedByProject);

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-6">
            <div className="mx-auto max-w-5xl space-y-6">
                <header>
                    <h1 className="text-2xl font-semibold text-slate-50">Mis tareas</h1>
                    <p className="text-sm text-slate-300">
                        Aceptá, rechazá o marcá como completadas las tareas asignadas.
                    </p>
                </header>

                {projectEntries.length === 0 ? (
                    <p className="text-sm text-slate-200">
                        No tenés tareas asignadas.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {projectEntries.map(([projectId, group]) => (
                            <section
                                key={projectId}
                                className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-black/40"
                            >
                                <h2 className="text-sm font-semibold text-slate-100 mb-3">
                                    {group.projectName}
                                </h2>

                                <ul className="space-y-3 text-sm">
                                    {group.tasks.map((t) => {
                                        const isCompleted = t.status === "COMPLETED";
                                        const isPending = t.status === "PENDING";
                                        const isAccepted = t.status === "ACCEPTED";

                                        let completedLabel = "";
                                        if (isCompleted && t.completedAt) {
                                            const d = new Date(t.completedAt);
                                            completedLabel = d.toLocaleString();
                                        }

                                        return (
                                            <li
                                                key={t._id}
                                                className="rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3"
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

                                                        {isCompleted && (
                                                            <p className="mt-1 text-[11px] text-emerald-300">
                                                                Completada el{" "}
                                                                {completedLabel || "estado completado"}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <span
                                                        className={`rounded-full px-2 py-1 text-[11px] font-medium ${isCompleted
                                                            ? "bg-emerald-500/15 text-emerald-300"
                                                            : isAccepted
                                                                ? "bg-sky-500/15 text-sky-300"
                                                                : isPending
                                                                    ? "bg-slate-500/20 text-slate-100"
                                                                    : "bg-slate-500/20 text-slate-100"
                                                            }`}
                                                    >
                                                        {t.status}
                                                    </span>
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                                                    {isPending && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    handleChangeStatus(t._id, "ACCEPTED")
                                                                }
                                                                className="rounded-xl border border-sky-500/70 bg-sky-500/10 px-3 py-1 text-sky-200 hover:bg-sky-500/20"
                                                            >
                                                                Aceptar
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleChangeStatus(t._id, "REJECTED")
                                                                }
                                                                className="rounded-xl border border-red-500/70 bg-red-500/10 px-3 py-1 text-red-200 hover:bg-red-500/20"
                                                            >
                                                                Rechazar
                                                            </button>
                                                        </>
                                                    )}

                                                    {isAccepted && (
                                                        <button
                                                            onClick={() =>
                                                                handleChangeStatus(t._id, "COMPLETED")
                                                            }
                                                            className="rounded-xl border border-emerald-500/70 bg-emerald-500/10 px-3 py-1 text-emerald-200 hover:bg-emerald-500/20"
                                                        >
                                                            Completar
                                                        </button>
                                                    )}

                                                    {isCompleted && (
                                                        <span className="text-[11px] text-slate-400">
                                                            No hay más acciones disponibles.
                                                        </span>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
