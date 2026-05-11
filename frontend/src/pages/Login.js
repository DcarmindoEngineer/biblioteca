import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const { fazerLogin } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      await fazerLogin(email, senha);
      navigate("/");
    } catch {
      setErro("Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Lado esquerdo */}
      <div style={styles.left}>
        {/* Padrão geométrico decorativo */}
        <div style={styles.pattern} />

        <div style={styles.leftContent}>
          {/* Logo UNIVESP simulada */}
          <div style={styles.logoBox}>
            <span style={styles.logoText}>UNIVESP</span>
          </div>

          <div style={styles.brand}>
            <h1 style={styles.brandTitle}>Sistema de<br />Biblioteca</h1>
            <div style={styles.brandAccent} />
            <p style={styles.brandSub}>Projeto Integrador 3 · Univesp 2026</p>
          </div>

          <p style={styles.tagline}>
            Organize o acervo, gerencie empréstimos e acompanhe tudo em um só lugar.
          </p>

          <div style={styles.badges}>
            <span style={styles.badge}>📚 Acervo</span>
            <span style={styles.badge}>🔄 Empréstimos</span>
            <span style={styles.badge}>📊 Relatórios</span>
          </div>
        </div>
      </div>

      {/* Lado direito */}
      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>📖</div>
            <h2 style={styles.title}>Bem-vindo</h2>
            <p style={styles.sub}>Acesse com suas credenciais institucionais</p>
          </div>

          {erro && (
            <div style={styles.erroBox}>{erro}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Senha</label>
              <input
                style={styles.input}
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              style={{ ...styles.btnEntrar, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p style={styles.footer}>
            Universidade Virtual do Estado de São Paulo
          </p>
        </div>
      </div>
    </div>
  );
}

const VERMELHO = "#250208";
const PRETO = "#1a1a1a";
const CINZA_CLARO = "#f5f5f5";

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "#f5f7fa",
    fontFamily: "'DM Sans', sans-serif",
  },

  /* ── Lado esquerdo ── */
  left: {
    flex: 1,
    background: `linear-gradient(145deg, ${VERMELHO} 0%, #a00d24 100%)`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "60px",
    position: "relative",
    overflow: "hidden",
  },
  pattern: {
    position: "absolute",
    inset: 0,
    backgroundImage: `radial-gradient(circle at 80% 20%, rgba(26,26,26,0.18) 0%, transparent 50%),
                      radial-gradient(circle at 10% 80%, rgba(255,255,255,0.06) 0%, transparent 40%)`,
    pointerEvents: "none",
  },
  leftContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: 460,
  },
  logoBox: {
    display: "inline-block",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 8,
    padding: "6px 16px",
    marginBottom: 36,
  },
  logoText: {
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: "3px",
  },
  brand: { marginBottom: 28 },
  brandTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 52,
    color: "#fff",
    lineHeight: 1.15,
    margin: 0,
  },
  brandAccent: {
    width: 56,
    height: 4,
    background: PRETO,
    borderRadius: 2,
    margin: "16px 0",
  },
  brandSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: "0.5px",
    margin: 0,
  },
  tagline: {
    fontSize: 17,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 1.7,
    marginBottom: 36,
  },
  badges: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  badge: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 13,
  },

  /* ── Lado direito ── */
  right: {
    width: 460,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    background: "#f5f7fa",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "40px 36px",
    width: "100%",
    boxShadow: "0 8px 40px rgba(200,16,46,0.10)",
    border: `1px solid ${CINZA_CLARO}`,
  },
  cardHeader: {
    textAlign: "center",
    marginBottom: 28,
  },
  cardIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  title: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 28,
    color: VERMELHO,
    margin: "0 0 6px",
  },
  sub: {
    color: "#666",
    fontSize: 14,
    margin: 0,
  },
  erroBox: {
    background: "#fff0f0",
    border: "1px solid #ffcccc",
    color: "#cc0000",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 16,
  },
  formGroup: { marginBottom: 16 },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: VERMELHO,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    background: CINZA_CLARO,
    border: `1.5px solid ${CINZA_CLARO}`,
    color: "#1a1a2e",
    padding: "11px 14px",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  btnEntrar: {
    width: "100%",
    background: `linear-gradient(135deg, ${VERMELHO} 0%, #a00d24 100%)`,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "13px",
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    marginTop: 8,
    letterSpacing: "0.3px",
    transition: "opacity 0.15s",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#aaa",
    marginTop: 24,
    marginBottom: 0,
    borderTop: `1px solid ${CINZA_CLARO}`,
    paddingTop: 16,
  },
};
