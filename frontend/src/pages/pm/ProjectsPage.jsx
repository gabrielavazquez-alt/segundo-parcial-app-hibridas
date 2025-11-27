import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    fetchProjects,
    createProject,
    deleteProject,
    updateProject,
} from "../../services/projectService";

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // formulario crear proyecto
    const [form, setForm] = useState({
        name: "",
        description: "",
        status: "PENDING",
    });

    // editar proyecto
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editForm, setEditForm] = useState({
        name: "",
        description: "",
        status: "PENDING",
    });

    const navigate = useNavigate();

    async function loadProjects() {
        try {
            setLoading(true);
            const data = await fetchProjects();
            setProjects(data || []);
        } catch (err) {
            console.error(err);
            alert("Error cargando proyectos");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProjects();
    }, []);

    // crear proyecto
    function handleCreateChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleCreateSubmit(e) {
        e.preventDefault();
        if (!form.name.trim()) {
            alert("El nombre del proyecto es obligatorio.");
            return;
        }

        try {
            await createProject(form);
            setForm({
                name: "",
                description: "",
                status: "PENDING",
            });
            loadProjects();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Error creando proyecto");
        }
    }

    // eliminar proyecto
    async function handleDelete(id) {
        if (!window.confirm("¿Seguro que querés eliminar este proyecto?")) return;

        try {
            await deleteProject(id);
            loadProjects();
        } catch (err) {
            console.error(err);
            alert("No se pudo eliminar el proyecto.");
        }
    }

    // editar proyecto
    function startEditProject(project) {
        setEditingProjectId(project._id);
        setEditForm({
            name: project.name || "",
            description: project.description || "",
            status: project.status || "PENDING",
        });
    }

    function handleEditChange(e) {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleEditSave(projectId) {
        try {
            await updateProject(projectId, {
                name: editForm.name,
                description: editForm.description,
                status: editForm.status,
            });
            setEditingProjectId(null);
            loadProjects();
        } catch (err) {
            console.error(err);
            alert("No se pudo actualizar el proyecto.");
        }
    }

    function handleEditCancel() {
        setEditingProjectId(null);
    }


    function statusBadgeClasses(status) {
        switch (status) {
            case "DELIVERED":
                return "border-emerald-400 text-emerald-200 bg-emerald-500/10";
            case "IN_PROGRESS":
                return "border-sky-400 text-sky-200 bg-sky-500/10";
            default:
                return "border-slate-500 text-slate-200 bg-slate-800/60";
        }
    }

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-8">
            <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)]">

                <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/40">
                    <h1 className="text-xl font-semibold text-slate-50 mb-1">
                        Proyectos de traducción
                    </h1>
                    <p className="text-xs text-slate-400 mb-6">
                        Creá y gestioná los proyectos como PM.
                    </p>

                    <h2 className="text-sm font-semibold text-slate-100 mb-3">
                        Crear nuevo proyecto
                    </h2>

                    <form
                        onSubmit={handleCreateSubmit}
                        className="space-y-4 text-sm"
                        autoComplete="off"
                    >
                        <div>
                            <label className="block text-xs text-slate-300 mb-1">
                                Nombre del proyecto
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Ej: Overwatch 2 – Season 12"
                                value={form.name}
                                onChange={handleCreateChange}
                                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-slate-300 mb-1">
                                Descripción
                            </label>
                            <textarea
                                name="description"
                                rows={3}
                                placeholder="Breve resumen de alcance, idiomas, deadlines..."
                                value={form.description}
                                onChange={handleCreateChange}
                                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-slate-300 mb-1">
                                Estado
                            </label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleCreateChange}
                                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                            >
                                <option value="PENDING">Pendiente</option>
                                <option value="IN_PROGRESS">En progreso</option>
                                <option value="DELIVERED">Entregado</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/40 hover:from-emerald-400 hover:to-sky-400"
                        >
                            Crear proyecto
                        </button>
                    </form>
                </section>

                <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/40">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-100">
                                Mis proyectos
                            </h2>
                            <p className="text-xs text-slate-400">
                                Accedé al detalle para gestionar tareas e instrucciones.
                            </p>
                        </div>
                        {!loading && (
                            <span className="text-[11px] text-slate-400">
                                {projects.length} proyecto
                                {projects.length !== 1 && "s"}
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <p className="text-sm text-slate-300">Cargando proyectos…</p>
                    ) : projects.length === 0 ? (
                        <p className="text-sm text-slate-300">
                            Todavía no creaste proyectos.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {projects.map((p) => {
                                const isEditing = editingProjectId === p._id;

                                return (
                                    <div
                                        key={p._id}
                                        className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 flex flex-col gap-2"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 text-sm">
                                                {isEditing ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={editForm.name}
                                                            onChange={handleEditChange}
                                                            className="w-full mb-2 rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-emerald-400"
                                                            placeholder="Nombre del proyecto"
                                                        />
                                                        <textarea
                                                            name="description"
                                                            rows={2}
                                                            value={editForm.description}
                                                            onChange={handleEditChange}
                                                            className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-emerald-400"
                                                            placeholder="Descripción"
                                                        />
                                                        <div className="mt-2">
                                                            <label className="block text-[11px] text-slate-400 mb-1">
                                                                Estado
                                                            </label>
                                                            <select
                                                                name="status"
                                                                value={editForm.status}
                                                                onChange={handleEditChange}
                                                                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
                                                            >
                                                                <option value="PENDING">Pendiente</option>
                                                                <option value="IN_PROGRESS">En progreso</option>
                                                                <option value="DELIVERED">Entregado</option>
                                                            </select>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="font-semibold text-slate-50">
                                                            {p.name}
                                                        </p>
                                                        {p.description && (
                                                            <p className="text-xs text-slate-300">
                                                                {p.description}
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            <span
                                                className={`text-[11px] px-3 py-1 rounded-full border ${statusBadgeClasses(
                                                    p.status
                                                )}`}
                                            >
                                                {p.status}
                                            </span>
                                        </div>

                                        <div className="mt-2 flex flex-wrap gap-2 justify-between items-center">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/pm/projects/${p._id}`)}
                                                    className="px-3 py-1 rounded-full text-[11px] bg-emerald-500/15 text-emerald-200 border border-emerald-500/70 hover:bg-emerald-500/25"
                                                >
                                                    Ver detalles
                                                </button>

                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditSave(p._id)}
                                                            className="px-3 py-1 rounded-full text-[11px] bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
                                                        >
                                                            Guardar
                                                        </button>
                                                        <button
                                                            onClick={handleEditCancel}
                                                            className="px-3 py-1 rounded-full text-[11px] border border-slate-600 text-slate-200 hover:border-slate-400"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => startEditProject(p)}
                                                        className="px-3 py-1 rounded-full text-[11px] border border-slate-600 text-slate-200 hover:border-emerald-400 hover:text-emerald-200"
                                                    >
                                                        Editar
                                                    </button>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleDelete(p._id)}
                                                className="px-3 py-1 rounded-full text-[11px] border border-red-500/80 text-red-300 hover:bg-red-500/10"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
