import { useEffect, useState } from "react";
import { getEmprestimos, criarEmprestimo, devolverLivro, renovarEmprestimo, getLivros, getUsuarios } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [modal, setModal] = useState(false);
  const [livros, setLivros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ usuario_id: "", livro_id: "", dias_prazo: 14 });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const { isBibliotecario } = useAuth();

  function carregar() {
    getEmprestimos().then((r) => setEmprestimos(r.data));
  }

  useEffect(() => {
    carregar();
    if (isBibliotecario) {
      getLivros({ apenas_disponiveis: true }).then((r) => setLivros(r.data));
      getUsuarios().then((r) => setUsuarios(r.data));
    }
  }, [isBibliotecario]);

  async function salvar() {
    setLoading(true);
    setErro("");
    try {
      await criarEmprestimo({
        usuario_id: Number(form.usuario_id),
        livro_id: Number(form.livro_id),
        dias_prazo: Number(form.dias_prazo),
      });
      setModal(false);
      carregar();
    } catch (e) {
      setErro(e.response?.data?.detail || "Erro ao registrar.");
    } finally {
      setLoading(false);
    }
  }

  async function devolver(id) {
    if (!window.confirm("Confirmar devolução?")) return;
    await devolverLivro(id);
    carregar();
  }

  async function renovar(id) {
    await renovarEmprestimo(id);
    carregar();
  }

  function statusBadge(status) {
    const map = { ativo: "badge-blue", devolvido: "badge-green", atrasado: "badge-red" };
    const label = { ativo: "Ativo", devolvido: "Devolvido", atrasado: "Atrasado" };
    return <span className={`badge ${map[status]}`}>{label[status]}</span>;
  }

  function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("pt-BR");
  }

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <>
      <div className="page-header">
        <h2>Empréstimos</h2>
        <p>Controle de empréstimos e devoluções</p>
      </div>

      {isBibliotecario && (
        <div style={{ marginBottom: 20 }}>
          <button className="btn btn-primary" onClick={() => { setErro(""); setForm({ usuario_id: "", livro_id: "", dias_prazo: 14 }); setModal(true); }}>
            + Novo Empréstimo
          </button>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Usuário</th>
                <th>Livro</th>
                <th>Empréstimo</th>
                <th>Prazo</th>
                <th>Devolução</th>
                <th>Renov.</th>
                <th>Status</th>
                {isBibliotecario && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {emprestimos.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>Nenhum empréstimo encontrado</td></tr>
              ) : emprestimos.map((e) => (
                <tr key={e.id}>
                  <td style={{ color: "var(--muted)" }}>#{e.id}</td>
                  <td>{usuarios.find((u) => u.id === e.usuario_id)?.nome || `Usuário #${e.usuario_id}`}</td>
                  <td>{livros.find((l) => l.id === e.livro_id)?.titulo || `Livro #${e.livro_id}`}</td>
                  <td>{formatDate(e.data_emprestimo)}</td>
                  <td>{formatDate(e.data_prevista)}</td>
                  <td>{formatDate(e.data_devolucao)}</td>
                  <td style={{ textAlign: "center" }}>{e.renovacoes}</td>
                  <td>{statusBadge(e.status)}</td>
                  {isBibliotecario && (
                    <td>
                      {e.status === "ativo" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-success btn-sm" onClick={() => devolver(e.id)}>Devolver</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => renovar(e.id)} disabled={e.renovacoes >= 2}>Renovar</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <h3>Novo Empréstimo</h3>
            {erro && <div className="alert alert-error">{erro}</div>}

            <div className="form-group">
              <label>Usuário *</label>
              <select value={form.usuario_id} onChange={f("usuario_id")}>
                <option value="">Selecione...</option>
                {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome} ({u.perfil})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Livro *</label>
              <select value={form.livro_id} onChange={f("livro_id")}>
                <option value="">Selecione...</option>
                {livros.map((l) => <option key={l.id} value={l.id}>{l.titulo} — {l.autor} ({l.disponivel} disp.)</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Prazo (dias)</label>
              <input type="number" min="1" max="60" value={form.dias_prazo} onChange={f("dias_prazo")} />
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvar} disabled={loading || !form.usuario_id || !form.livro_id}>
                {loading ? "Registrando..." : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
