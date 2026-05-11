import { useEffect, useState } from "react";
import { getReservas, criarReserva, cancelarReserva, getLivros } from "../services/api";

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [livros, setLivros] = useState([]);
  const [modal, setModal] = useState(false);
  const [livroId, setLivroId] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  function carregar() {
    getReservas().then((r) => setReservas(r.data));
    getLivros().then((r) => setLivros(r.data));
  }

  useEffect(() => { carregar(); }, []);

  async function salvar() {
    setLoading(true);
    setErro("");
    try {
      await criarReserva(Number(livroId));
      setModal(false);
      carregar();
    } catch (e) {
      setErro(e.response?.data?.detail || "Erro ao criar reserva.");
    } finally {
      setLoading(false);
    }
  }

  async function cancelar(id) {
    if (!window.confirm("Cancelar esta reserva?")) return;
    await cancelarReserva(id);
    carregar();
  }

  function statusBadge(status) {
    const map = { pendente: "badge-yellow", confirmada: "badge-green", cancelada: "badge-muted", expirada: "badge-red" };
    return <span className={`badge ${map[status]}`}>{status}</span>;
  }

  function formatDate(d) { return d ? new Date(d).toLocaleDateString("pt-BR") : "—"; }

  return (
    <>
      <div className="page-header">
        <h2>Reservas</h2>
        <p>Gerencie suas reservas de livros</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => { setErro(""); setLivroId(""); setModal(true); }}>
          + Nova Reserva
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Livro</th><th>Criado em</th><th>Expira em</th><th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {reservas.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>Nenhuma reserva</td></tr>
              ) : reservas.map((r) => (
                <tr key={r.id}>
                  <td style={{ color: "var(--muted)" }}>#{r.id}</td>
                  <td>{livros.find((l) => l.id === r.livro_id)?.titulo || `Livro #${r.livro_id}`}</td>
                  <td>{formatDate(r.criado_em)}</td>
                  <td>{formatDate(r.expira_em)}</td>
                  <td>{statusBadge(r.status)}</td>
                  <td>
                    {r.status === "pendente" && (
                      <button className="btn btn-danger btn-sm" onClick={() => cancelar(r.id)}>Cancelar</button>
                    )}
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
            <h3>Nova Reserva</h3>
            {erro && <div className="alert alert-error">{erro}</div>}
            <div className="form-group">
              <label>Livro *</label>
              <select value={livroId} onChange={(e) => setLivroId(e.target.value)}>
                <option value="">Selecione...</option>
                {livros.map((l) => (
                  <option key={l.id} value={l.id}>{l.titulo} — {l.autor}</option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvar} disabled={loading || !livroId}>
                {loading ? "Reservando..." : "Reservar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
