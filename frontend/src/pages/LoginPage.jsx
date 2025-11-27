
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function LoginPage() {
    const { login } = useContext(AuthContext);
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!form.email || !form.password) {
            setError("Email y contraseña son obligatorios.");
            return;
        }

        try {
            setLoading(true);
            const user = await login(form.email, form.password);

            if (user.role === "PM") {
                navigate("/pm/projects");
            } else if (user.role === "TRANSLATOR") {
                navigate("/translator/tasks");
            } else {
                navigate("/login");
            }
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message || "Error al iniciar sesión. Intentalo de nuevo."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="w-full max-w-md rounded-3xl bg-slate-900/80 border border-slate-700/80 p-6 shadow-xl shadow-black/50">
                <h1 className="text-2xl font-semibold text-slate-50 mb-1">
                    Iniciar sesión
                </h1>
                <p className="text-sm text-slate-400 mb-4">
                    Accedé a tu panel de PM o traductor.
                </p>

                {error && (
                    <div className="mb-3 rounded-xl bg-red-500/10 border border-red-500/50 px-3 py-2 text-xs text-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/80"
                            placeholder="tuemail@ejemplo.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/80"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full rounded-xl bg-linear-to-r from-emerald-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 hover:from-emerald-400 hover:to-sky-400 disabled:opacity-60"
                    >
                        {loading ? "Ingresando..." : "Entrar"}
                    </button>
                </form>

                <p className="mt-4 text-[11px] text-slate-400 text-center">
                    ¿No tenés cuenta?{" "}
                    <Link
                        to="/register"
                        className="text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                        Registrate acá
                    </Link>
                </p>
            </div>
        </div>
    );
}
