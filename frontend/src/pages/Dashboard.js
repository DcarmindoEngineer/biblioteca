import { useEffect, useState } from "react";
import { getResumo, getLivrosMaisEmprestados, getUsuariosComPendencias } from "../services/api";

export default function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [pendencias, setPendencias] = useState([]);

  useEffect(() => {
    getResumo().then((r) => setResumo(r.data)).catch(() => {});
    getLivrosMaisEmprestados().then((r) => setRanking(r.data)).catch(() => {});
    getUsuariosComPendencias().then((r) => setPendencias(r.data)).catch(() => {});
  }, []);

  return (
    <>
      <div className="page-header">
        <h2>Painel Geral</h2>
        <p>Visão geral do sistema da biblioteca</p>
      </div>

      {resumo && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{resumo.total_livros}</div>
            <div className="stat-label">Total de Livros</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">{resumo.livros_disponiveis}</div>
            <div className="stat-label">Disponíveis</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{resumo.total_usuarios}</div>
            <div className="stat-label">Usuários</div>
          </div>
          <div className="stat-card accent2">
            <div className="stat-value">{resumo.emprestimos_ativos}</div>
            <div className="stat-label">Empréstimos Ativos</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-value">{resumo.emprestimos_atrasados}</div>
            <div className="stat-label">Atrasados</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-value">R$ {Number(resumo.valor_multas_pendentes).toFixed(2)}</div>
            <div className="stat-label">Multas Pendentes</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>📚 Mais Emprestados</h3>
          {ranking.length === 0 ? (
            <div className="empty-state"><div className="icon">📭</div>Sem dados</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((item, i) => (
                    <tr key={i}>
                      <td><span className="badge badge-blue">{i + 1}</span></td>
                      <td>{item.titulo}</td>
                      <td style={{ color: "var(--muted)" }}>{item.autor}</td>
                      <td><strong>{item.total_emprestimos}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>⚠️ Usuários com Pendências</h3>
          {pendencias.length === 0 ? (
            <div className="empty-state"><div className="icon">✅</div>Nenhuma pendência</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Multas</th>
                  </tr>
                </thead>
                <tbody>
                  {pendencias.map((u) => (
                    <tr key={u.id}>
                      <td>{u.nome}</td>
                      <td style={{ color: "var(--muted)", fontSize: 12 }}>{u.email}</td>
                      <td><span className="badge badge-red">R$ {Number(u.total_multas).toFixed(2)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
