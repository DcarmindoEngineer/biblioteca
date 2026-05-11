import { useEffect, useState } from "react";
import { getMultas, pagarMulta } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function Multas() {
  const [multas, setMultas] = useState([]);
  const { isBibliotecario } = useAuth();

  function carregar() { getMultas().then((r) => setMultas(r.data)); }
  useEffect(() => { carregar(); }, []);

  async function pagar(id) {
    if (!window.confirm("Confirmar pagamento desta multa?")) return;
    await pagarMulta(id);
    carregar();
  }

  function formatDate(d) { return d ? new Date(d).toLocaleDateString("pt-BR") : "—"; }

  const totalPendente = multas.filter((m) => m.status === "pendente").reduce((s, m) => s + m.valor, 0);

  return (
    <>
      <div className="page-header">
        <h2>Multas</h2>
        <p>Controle de multas por atraso na devolução</p>
      </div>

      {multas.some((m) => m.status === "pendente") && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card danger">
            <div className="stat-value">R$ {totalPendente.toFixed(2)}</div>
            <div className="stat-label">Total Pendente</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{multas.filter((m) => m.status === "pendente").length}</div>
            <div className="stat-label">Multas Pendentes</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Empréstimo</th>
                <th>Dias de Atraso</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Pago em</th>
                {isBibliotecario && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {multas.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>✅ Nenhuma multa</td></tr>
              ) : multas.map((m) => (
                <tr key={m.id}>
                  <td style={{ color: "var(--muted)" }}>#{m.id}</td>
                  <td>Empréstimo #{m.emprestimo_id}</td>
                  <td><span className="badge badge-red">{m.dias_atraso} dias</span></td>
                  <td><strong>R$ {Number(m.valor).toFixed(2)}</strong></td>
                  <td>
                    <span className={`badge ${m.status === "paga" ? "badge-green" : "badge-red"}`}>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ color: "var(--muted)" }}>{formatDate(m.pago_em)}</td>
                  {isBibliotecario && (
                    <td>
                      {m.status === "pendente" && (
                        <button className="btn btn-success btn-sm" onClick={() => pagar(m.id)}>
                          Registrar Pagamento
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
