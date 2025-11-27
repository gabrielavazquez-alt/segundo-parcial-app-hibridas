import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProjectsPage from "../pages/pm/ProjectsPage";
import ProjectDetailPage from "../pages/pm/ProjectDetailPage";
import TranslatorTasksPage from "../pages/translator/TranslatorTasksPage";
import Navbar from "../components/Navbar";

function PrivateRoute({ children }) {
    const { isLogged, loading } = useContext(AuthContext);
    if (loading) return <p>Cargando sesión...</p>;
    if (!isLogged) return <Navigate to="/login" />;
    return children;
}

function PMRoute({ children }) {
    const { isPM } = useContext(AuthContext);
    return isPM ? children : <Navigate to="/login" />;
}

function TranslatorRoute({ children }) {
    const { isTranslator } = useContext(AuthContext);
    return isTranslator ? children : <Navigate to="/login" />;
}


function RoleRedirect() {
    const { isLogged, isPM, isTranslator, loading } = useContext(AuthContext);

    if (loading) return <p>Cargando sesión...</p>;
    if (!isLogged) return <Navigate to="/login" />;

    if (isPM) return <Navigate to="/pm/projects" />;
    if (isTranslator) return <Navigate to="/translator/tasks" />;

    return <Navigate to="/login" />;
}

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>
                {/* públicas */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* home: según rol */}
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <RoleRedirect />
                        </PrivateRoute>
                    }
                />

                {/* privadas PM */}
                <Route
                    path="/pm/projects"
                    element={
                        <PrivateRoute>
                            <PMRoute>
                                <ProjectsPage />
                            </PMRoute>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/pm/projects/:id"
                    element={
                        <PrivateRoute>
                            <PMRoute>
                                <ProjectDetailPage />
                            </PMRoute>
                        </PrivateRoute>
                    }
                />

                {/* privadas Traductor */}
                <Route
                    path="/translator/tasks"
                    element={
                        <PrivateRoute>
                            <TranslatorRoute>
                                <TranslatorTasksPage />
                            </TranslatorRoute>
                        </PrivateRoute>
                    }
                />

                {/* default */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}
