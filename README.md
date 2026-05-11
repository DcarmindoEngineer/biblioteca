# 📚 Sistema de Gerenciamento de Biblioteca

Projeto acadêmico de sistema de gerenciamento de biblioteca escolar com suporte a múltiplos perfis de usuário, empréstimos, reservas, multas e relatórios.

---

## 🗂️ Estrutura do Projeto

```
biblioteca/
├── backend/
│   ├── main.py              # Entrada da aplicação FastAPI
│   ├── database.py          # Conexão com SQLite
│   ├── auth_utils.py        # JWT e controle de perfis
│   ├── requirements.txt     # Dependências Python
│   ├── models/
│   │   └── models.py        # Tabelas do banco de dados
│   └── routes/
│       ├── auth.py          # Login e criação de admin
│       ├── usuarios.py      # CRUD de usuários
│       ├── livros.py        # CRUD de livros
│       ├── categorias.py    # CRUD de categorias
│       ├── emprestimos.py   # Empréstimos, devoluções e renovações
│       ├── reservas.py      # Reservas de livros
│       ├── multas.py        # Controle de multas
│       └── relatorios.py    # Relatórios e estatísticas
└── frontend/                # (próxima etapa - React)
```

---

## 🚀 Como rodar o backend

### 1. Pré-requisitos
- Python 3.11+
- pip

### 2. Instalar dependências
```bash
cd backend
pip install -r requirements.txt
```

### 3. Iniciar o servidor
```bash
uvicorn main:app --reload
```

A API estará disponível em: `http://localhost:8000`

Documentação interativa (Swagger): `http://localhost:8000/docs`

---

## 👤 Perfis de Usuário

| Perfil         | Permissões                                              |
|----------------|---------------------------------------------------------|
| `admin`        | Acesso total ao sistema                                 |
| `bibliotecario`| Gerencia livros, empréstimos, reservas e multas        |
| `professor`    | Consulta acervo, faz reservas, vê seus empréstimos     |
| `aluno`        | Consulta acervo, faz reservas, vê seus empréstimos     |

---

## 🔑 Primeiro acesso

1. Criar o administrador inicial:
```bash
curl -X POST http://localhost:8000/auth/criar-admin \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Administrador",
    "email": "admin@escola.com",
    "senha": "senha123",
    "chave_secreta": "biblioteca-admin-2024"
  }'
```

2. Fazer login para obter o token JWT:
```bash
curl -X POST http://localhost:8000/auth/login \
  -F "username=admin@escola.com" \
  -F "password=senha123"
```

3. Usar o token nas requisições seguintes:
```bash
curl http://localhost:8000/livros \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🗃️ Modelo de Dados

### Tabelas
- **usuarios** — alunos, professores, bibliotecários e admins
- **livros** — acervo com controle de exemplares disponíveis
- **categorias** — categorias dos livros
- **emprestimos** — registros de empréstimo com prazo e devolução
- **reservas** — reservas com expiração automática
- **multas** — multas geradas automaticamente na devolução com atraso

### Regras de negócio
- Prazo padrão de empréstimo: **14 dias**
- Máximo de renovações: **2 por empréstimo**
- Multa por dia de atraso: **R$ 0,50**
- Reserva expira em: **3 dias** após confirmação
- Usuários com multa pendente **não podem** realizar novos empréstimos

---

## 📡 Principais Endpoints

| Método | Rota                              | Descrição                    |
|--------|-----------------------------------|------------------------------|
| POST   | /auth/login                       | Login e geração de token     |
| GET    | /livros                           | Listar/buscar livros         |
| POST   | /livros                           | Cadastrar livro              |
| POST   | /emprestimos                      | Registrar empréstimo         |
| POST   | /emprestimos/{id}/devolver        | Registrar devolução          |
| POST   | /emprestimos/{id}/renovar         | Renovar empréstimo           |
| POST   | /reservas                         | Fazer reserva                |
| POST   | /multas/{id}/pagar                | Registrar pagamento de multa |
| GET    | /relatorios/resumo                | Painel geral                 |
| GET    | /relatorios/livros-mais-emprestados | Ranking de livros           |

Documentação completa disponível em `/docs` após iniciar o servidor.
