import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
{ to: "/",            icon: "📊", label: "Painel",      always: true },
{ to: "/livros",      icon: "📚", label: "Acervo",      always: true },
{ to: "/emprestimos", icon: "🔄", label: "Empréstimos", always: true },
{ to: "/reservas",    icon: "🔖", label: "Reservas",    always: true },
{ to: "/multas",      icon: "💰", label: "Multas",      always: true },
{ to: "/usuarios",    icon: "👥", label: "Usuários",    adminOnly: true },
];

export default function Layout({ children }) {
const { usuario, fazerLogout, isBibliotecario } = useAuth();
const navigate = useNavigate();

const [dark, setDark] = useState(() => localStorage.getItem("tema") === "escuro");

useEffect(() => {
const root = document.documentElement;
if (dark) {
root.style.setProperty("–bg",       "#0f1117");
root.style.setProperty("–surface",  "#181c27");
root.style.setProperty("–surface2", "#1e2335");
root.style.setProperty("–border",   "#2a3050");
root.style.setProperty("–text",     "#e8ecf5");
root.style.setProperty("–muted",    "#7a859e");
localStorage.setItem("tema,escuro");
} else {
root.style.setProperty("–bg",       "#f5f7fa");
root.style.setProperty("–surface",  "#ffffff");
root.style.setProperty("–surface2", "#f5f5f5");
root.style.setProperty("–border",   "#e0e0e0");
root.style.setProperty("–text",     "#1a2340");
root.style.setProperty("–muted",    "#6b7a99");
localStorage.setItem("tema", "claro");
}
}, [dark]);

function logout() {
fazerLogout();
navigate("/login");
}

const visibleItems = navItems.filter(
(item) => item.always || (item.adminOnly && isBibliotecario)
);

return (
<div className="app-layout">
<aside className="sidebar">
<div className="sidebar-logo">
<h1>Sistema de Biblioteca</h1>
<span>Projeto Integrador 3 · Univesp 2026</span>
</div>


    <nav className="sidebar-nav">
      <div className="nav-section">Menu</div>
      {visibleItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          <span className="icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>

    <div className="sidebar-footer">
      <button
        onClick={() => setDark((d) => !d)}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 8,
          padding: "8px 12px",
          color: "#fff",
          fontSize: 13,
          cursor: "pointer",
          marginBottom: 10,
          fontFamily: "inherit",
        }}
      >
        {dark ? "Tema Claro" : "Tema Escuro"}
      </button>

      <div className="sidebar-user">
        <strong>{usuario?.nome}</strong>
        {usuario?.perfil}
      </div>
      <button className="btn btn-ghost btn-sm" onClick={logout} style={{ width: "100%", justifyContent: "center" }}>
        Sair
      </button>
    </div>
  </aside>

  <main className="main-content">{children}</main>
</div>


);
}