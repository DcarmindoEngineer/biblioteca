from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
# Importar todos os models para que sejam criados
import models.models  # noqa: F401
# Importar rotas
from routes import auth, usuarios, livros, categorias, emprestimos, reservas, multas, relatorios

# Criar tabelas no banco
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sistema de Gerenciamento de Biblioteca",
    description="API para gerenciamento de biblioteca escolar",
    version="1.0.0",
)

# CORS - permite o frontend React se comunicar com a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://biblioteca-carmindo.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rotas
app.include_router(auth.router,        prefix="/auth",        tags=["Autenticação"])
app.include_router(usuarios.router,    prefix="/usuarios",    tags=["Usuários"])
app.include_router(livros.router,      prefix="/livros",      tags=["Livros"])
app.include_router(categorias.router,  prefix="/categorias",  tags=["Categorias"])
app.include_router(emprestimos.router, prefix="/emprestimos", tags=["Empréstimos"])
app.include_router(reservas.router,    prefix="/reservas",    tags=["Reservas"])
app.include_router(multas.router,      prefix="/multas",      tags=["Multas"])
app.include_router(relatorios.router,  prefix="/relatorios",  tags=["Relatórios"])

@app.get("/")
def root():
    return {"message": "API da Biblioteca funcionando!"}
