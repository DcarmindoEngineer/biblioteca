import { useEffect, useState } from "react";
import { getLivros, getCategorias, criarLivro, atualizarLivro, deletarLivro } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const empty = { titulo: "", autor: "", isbn: "", editora: "", ano: "", descricao: "", categoria_id: "", quantidade: 1 };

export default function Livros() {
  const [livros, setLivros] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const { isBibliotecario } = useAuth();

  function carregar() {
    getLivros(busca ? { titulo: busca } : {}).then((r) => setLivros(r.data));
  }

  useEffect(() => {
    carregar();
    getCategorias().then((r) => setCategorias(r.data));
  }, []);

  function abrirNovo() {
    setForm(empty);
    setEditando(null);
    setErro("");
    setModal(true);
  }

  function abrirEditar(livro) {
    setForm({ ...livro, categoria_id: livro.categoria_id || "" });
    setEditando(livro.id);
    setErro("");
    setModal(true);
  }

  async function salvar() {
    setLoading(true);
    setErro("");
    try {
      const payload = {
        ...form,
        ano: form.ano ? Number(form.ano) : null,
        quantidade: Number(form.quantidade),
        categoria_id: form.categoria_id || null,
      };
      if (editando) await atualizarLivro(editando, payload);
      else await criarLivro(payload);
      setModal(false);
      carregar();
    } catch (e) {
      setErro(e.response?.data?.detail || "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  async function excluir(id) {
    if (!window.confirm("Excluir este livro?")) return;
    await deletarLivro(id);
    carregar();
  }

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <>
      <div className="page-header">
        <h2>Acervo de Livros</h2>
        <p>Gerencie todos os livros da biblioteca</p>
      </div>

      <div className="search-bar">
        <input
          placeholder="Buscar por título..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && carregar()}
        />
        <button className="btn btn-ghost" onClick={carregar}>Buscar</button>
        {isBibliotecario && (
          <button className="btn btn-primary" onClick={abrirNovo} style={{ marginLeft: "auto" }}>
            + Novo Livro
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>ISBN</th>
                <th>Categoria</th>
                <th>Total</th>
                <th>Disponível</th>
                {isBibliotecario && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {livros.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>Nenhum livro encontrado</td></tr>
              ) : livros.map((l) => (
                <tr key={l.id}>
                  <td><strong>{l.titulo}</strong></td>
                  <td style={{ color: "var(--muted)" }}>{l.autor}</td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{l.isbn || "—"}</td>
                  <td>{categorias.find((c) => c.id === l.categoria_id)?.nome || "—"}</td>
                  <td>{l.quantidade}</td>
                  <td>
                    <span className={`badge ${l.disponivel > 0 ? "badge-green" : "badge-red"}`}>
                      {l.disponivel}
                    </span>
                  </td>
                  {isBibliotecario && (
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(l)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => excluir(l.id)}>Excluir</button>
                      </div>
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
            <h3>{editando ? "Editar Livro" : "Novo Livro"}</h3>
            {erro && <div className="alert alert-error">{erro}</div>}

            <div className="form-row">
              <div className="form-group">
                <label>Título *</label>
                <input value={form.titulo} onChange={f("titulo")} />
              </div>
              <div className="form-group">
                <label>Autor *</label>
                <input value={form.autor} onChange={f("autor")} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ISBN</label>
                <input value={form.isbn} onChange={f("isbn")} />
              </div>
              <div className="form-group">
                <label>Editora</label>
                <input value={form.editora} onChange={f("editora")} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Ano</label>
                <input type="number" value={form.ano} onChange={f("ano")} />
              </div>
              <div className="form-group">
                <label>Quantidade</label>
                <input type="number" min="1" value={form.quantidade} onChange={f("quantidade")} />
              </div>
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <select value={form.categoria_id} onChange={f("categoria_id")}>
                <option value="">Sem categoria</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <textarea rows={3} value={form.descricao} onChange={f("descricao")} style={{ resize: "vertical" }} />
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
