import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "PM",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            await register(form);
            setSuccess("Usuario creado correctamente. Ahora podés iniciar sesión.");
            setTimeout(() => navigate("/login"), 1300);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "No se pudo registrar. Verificá los datos."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center px-4">
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-6 items-center">
                {/* Texto lateral */}
                <div className="hidden md:block">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700 text-[11px] text-slate-300 mb-4">
                        Configurá tu rol en el flujo
                    </div>
                    <h1 className="text-3xl font-semibold text-slate-50 mb-3">
                        Registrate como Project Manager o Translator.
                    </h1>
                    <p className="text-sm text-slate-300 mb-4 max-w-md">
                        El rol define qué vas a ver en la app: como PM vas a crear proyectos y
                        tareas; como traductor vas a gestionar las tareas que te asignen.
                    </p>
                </div>

                {/* Card de registro */}
                <div className="w-full">
                    <div className="rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-xl shadow-black/50 p-6">
                        <h2 className="text-xl font-semibold text-slate-50 mb-1">
                            Crear cuenta
                        </h2>
                        <p className="text-[11px] text-slate-400 mb-4">
                            Completá tus datos y elegí cómo vas a usar TraduFlow.
                        </p>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl bg-slate-950 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/60"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full rounded-xl bg-slate-950 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/60"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    className="w-full rounded-xl bg-slate-950 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/60"
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm({ ...form, password: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-2">
                                    Rol
                                </label>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, role: "PM" })}
                                        className={`flex flex-col items-start gap-1 px-3 py-2 rounded-xl border ${form.role === "PM"
                                                ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                                                : "border-slate-700 bg-slate-950 text-slate-200"
                                            }`}
                                    >
                                        <span className="font-semibold">Project Manager</span>
                                        <span className="text-[10px] text-slate-300/80">
                                            Crea proyectos, asigna tareas e instrucciones.
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, role: "TRANSLATOR" })}
                                        className={`flex flex-col items-start gap-1 px-3 py-2 rounded-xl border ${form.role === "TRANSLATOR"
                                                ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                                                : "border-slate-700 bg-slate-950 text-slate-200"
                                            }`}
                                    >
                                        <span className="font-semibold">Translator</span>
                                        <span className="text-[10px] text-slate-300/80">
                                            Ve, acepta y completa tareas asignadas.
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="text-xs text-red-300 bg-red-950/40 border border-red-700/60 rounded-xl px-3 py-2">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-600/60 rounded-xl px-3 py-2">
                                    {success}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-sm font-medium text-slate-950 shadow-lg shadow-emerald-500/40 hover:from-emerald-400 hover:to-sky-400 disabled:opacity-60"
                            >
                                {loading ? "Creando cuenta..." : "Registrarme"}
                            </button>
                        </form>

                        <p className="mt-4 text-[11px] text-slate-400 text-center">
                            ¿Ya tenés cuenta?{" "}
                            <Link
                                to="/login"
                                className="text-emerald-300 hover:text-emerald-200"
                            >
                                Iniciá sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
