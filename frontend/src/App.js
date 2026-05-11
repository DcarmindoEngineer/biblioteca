import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Livros from "./pages/Livros";
import Emprestimos from "./pages/Emprestimos";
import Reservas from "./pages/Reservas";
import Multas from "./pages/Multas";
import Usuarios from "./pages/Usuarios";
import "./index.css";

function PrivateRoute({ children }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function AdminRoute({ children }) {
  const { usuario, isBibliotecario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (!isBibliotecario) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { usuario } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/livros" element={<PrivateRoute><Livros /></PrivateRoute>} />
      <Route path="/emprestimos" element={<PrivateRoute><Emprestimos /></PrivateRoute>} />
      <Route path="/reservas" element={<PrivateRoute><Reservas /></PrivateRoute>} />
      <Route path="/multas" element={<PrivateRoute><Multas /></PrivateRoute>} />
      <Route path="/usuarios" element={<AdminRoute><Usuarios /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
