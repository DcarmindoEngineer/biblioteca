import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const salvo = localStorage.getItem("usuario");
    if (salvo) setUsuario(JSON.parse(salvo));
  }, []);

  async function fazerLogin(email, senha) {
    const { data } = await apiLogin(email, senha);
    const u = { nome: data.nome, perfil: data.perfil, token: data.access_token };
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("usuario", JSON.stringify(u));
    setUsuario(u);
    return u;
  }

  function fazerLogout() {
    localStorage.clear();
    setUsuario(null);
  }

  const isAdmin = usuario?.perfil === "admin";
  const isBibliotecario = ["admin", "bibliotecario"].includes(usuario?.perfil);

  return (
    <AuthContext.Provider value={{ usuario, fazerLogin, fazerLogout, isAdmin, isBibliotecario }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
