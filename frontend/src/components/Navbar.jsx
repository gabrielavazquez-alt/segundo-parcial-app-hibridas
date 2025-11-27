import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
    const { user, isLogged, isPM, isTranslator, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    if (!isLogged) return null;

    return (
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-sky-400 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/40">
                        TF
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-slate-50">
                            Tradu-Flow
                        </span>
                        {user && (
                            <span className="text-[11px] text-slate-400">
                                {user.role === "PM" ? "Project Manager" : "Translator"}
                            </span>
                        )}
                    </div>
                </div>

                <nav className="flex items-center gap-4 text-xs font-medium">
                    {isPM && (
                        <Link
                            className="text-slate-200 hover:text-emerald-300"
                            to="/pm/projects"
                        >
                            Mis proyectos
                        </Link>
                    )}

                    {isTranslator && (
                        <Link
                            className="text-slate-200 hover:text-emerald-300"
                            to="/translator/tasks"
                        >
                            Mis tareas
                        </Link>
                    )}

                    <button
                        onClick={handleLogout}
                        className="ml-2 inline-flex items-center rounded-xl border border-red-500/70 bg-red-600/90 px-3 py-1 text-[11px] font-semibold text-slate-50 shadow-sm shadow-red-500/40 hover:bg-red-500"
                    >
                        Cerrar sesión
                    </button>
                </nav>
            </div>
        </header>
    );
}
