import { useEffect, useState } from "react";
import { getUsuarios, criarUsuario, atualizarUsuario } from "../services/api";

const empty = { nome: "", email: "", senha: "", perfil: "aluno", matricula: "" };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  function carregar() { getUsuarios().then((r) => setUsuarios(r.data)); }
  useEffect(() => { carregar(); }, []);

  function abrirNovo() { setForm(empty); setEditando(null); setErro(""); setModal(true); }

  function abrirEditar(u) {
    setForm({ nome: u.nome, email: u.email, senha: "", perfil: u.perfil, matricula: u.matricula || "" });
    setEditando(u.id);
    setErro("");
    setModal(true);
  }

  async function salvar() {
    setLoading(true);
    setErro("");
    try {
      if (editando) {
        const payload = { nome: form.nome, email: form.email, matricula: form.matricula || null };
        await atualizarUsuario(editando, payload);
      } else {
        await criarUsuario({ ...form, matricula: form.matricula || null });
      }
      setModal(false);
      carregar();
    } catch (e) {
      setErro(e.response?.data?.detail || "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  function perfilBadge(perfil) {
    const map = { admin: "badge-red", bibliotecario: "badge-blue", professor: "badge-yellow", aluno: "badge-green" };
    return <span className={`badge ${map[perfil]}`}>{perfil}</span>;
  }

  return (
    <>
      <div className="page-header">
        <h2>Usuários</h2>
        <p>Gerenciar alunos, professores e bibliotecários</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={abrirNovo}>+ Novo Usuário</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nome</th><th>Email</th><th>Matrícula</th><th>Perfil</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>Nenhum usuário</td></tr>
              ) : usuarios.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.nome}</strong></td>
                  <td style={{ color: "var(--muted)", fontSize: 13 }}>{u.email}</td>
                  <td style={{ color: "var(--muted)" }}>{u.matricula || "—"}</td>
                  <td>{perfilBadge(u.perfil)}</td>
                  <td><span className={`badge ${u.ativo ? "badge-green" : "badge-muted"}`}>{u.ativo ? "Ativo" : "Inativo"}</span></td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(u)}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <h3>{editando ? "Editar Usuário" : "Novo Usuário"}</h3>
            {erro && <div className="alert alert-error">{erro}</div>}

            <div className="form-row">
              <div className="form-group">
                <label>Nome *</label>
                <input value={form.nome} onChange={f("nome")} />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={form.email} onChange={f("email")} />
              </div>
            </div>
            {!editando && (
              <div className="form-group">
                <label>Senha *</label>
                <input type="password" value={form.senha} onChange={f("senha")} />
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label>Perfil *</label>
                <select value={form.perfil} onChange={f("perfil")}>
                  <option value="aluno">Aluno</option>
                  <option value="professor">Professor</option>
                  <option value="bibliotecario">Bibliotecário</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Matrícula</label>
                <input value={form.matricula} onChange={f("matricula")} />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvar} disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
