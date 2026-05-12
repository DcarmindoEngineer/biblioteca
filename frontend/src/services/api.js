import axios from "axios";

const api = axios.create({ baseURL: "https://biblioteca-production-a643.up.railway.app" });
// Injeta o token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redireciona para login se token expirado
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ────────────────────────────────────────────────────────────────────
export const login = (email, senha) =>
  api.post("/auth/login", new URLSearchParams({ username: email, password: senha }));

// ── Livros ──────────────────────────────────────────────────────────────────
export const getLivros = (params) => api.get("/livros", { params });
export const criarLivro = (data) => api.post("/livros", data);
export const atualizarLivro = (id, data) => api.put(`/livros/${id}`, data);
export const deletarLivro = (id) => api.delete(`/livros/${id}`);

// ── Categorias ──────────────────────────────────────────────────────────────
export const getCategorias = () => api.get("/categorias");
export const criarCategoria = (data) => api.post("/categorias", data);

// ── Usuários ────────────────────────────────────────────────────────────────
export const getUsuarios = (params) => api.get("/usuarios", { params });
export const criarUsuario = (data) => api.post("/usuarios", data);
export const atualizarUsuario = (id, data) => api.put(`/usuarios/${id}`, data);
export const getMeuPerfil = () => api.get("/usuarios/me");

// ── Empréstimos ─────────────────────────────────────────────────────────────
export const getEmprestimos = (params) => api.get("/emprestimos", { params });
export const criarEmprestimo = (data) => api.post("/emprestimos", data);
export const devolverLivro = (id) => api.post(`/emprestimos/${id}/devolver`);
export const renovarEmprestimo = (id) => api.post(`/emprestimos/${id}/renovar`);

// ── Reservas ────────────────────────────────────────────────────────────────
export const getReservas = () => api.get("/reservas");
export const criarReserva = (livro_id) => api.post("/reservas", { livro_id });
export const cancelarReserva = (id) => api.post(`/reservas/${id}/cancelar`);

// ── Multas ──────────────────────────────────────────────────────────────────
export const getMultas = () => api.get("/multas");
export const pagarMulta = (id) => api.post(`/multas/${id}/pagar`);

// ── Relatórios ──────────────────────────────────────────────────────────────
export const getResumo = () => api.get("/relatorios/resumo");
export const getLivrosMaisEmprestados = () => api.get("/relatorios/livros-mais-emprestados");
export const getUsuariosComPendencias = () => api.get("/relatorios/usuarios-com-pendencias");
