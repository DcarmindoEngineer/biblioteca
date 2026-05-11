from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from models.models import Livro, Usuario, PerfilUsuario
from auth_utils import get_usuario_atual, requer_perfil

router = APIRouter()


# ── Schemas ────────────────────────────────────────────────────────────────────

class LivroCreate(BaseModel):
    titulo: str
    autor: str
    isbn: Optional[str] = None
    editora: Optional[str] = None
    ano: Optional[int] = None
    descricao: Optional[str] = None
    categoria_id: Optional[int] = None
    quantidade: int = 1


class LivroResponse(BaseModel):
    id: int
    titulo: str
    autor: str
    isbn: Optional[str]
    editora: Optional[str]
    ano: Optional[int]
    descricao: Optional[str]
    categoria_id: Optional[int]
    quantidade: int
    disponivel: int

    class Config:
        from_attributes = True


class LivroUpdate(BaseModel):
    titulo: Optional[str] = None
    autor: Optional[str] = None
    isbn: Optional[str] = None
    editora: Optional[str] = None
    ano: Optional[int] = None
    descricao: Optional[str] = None
    categoria_id: Optional[int] = None
    quantidade: Optional[int] = None


# ── Rotas ──────────────────────────────────────────────────────────────────────

@router.post("/", response_model=LivroResponse, status_code=201)
def criar_livro(
    data: LivroCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requer_perfil(PerfilUsuario.admin, PerfilUsuario.bibliotecario)),
):
    livro = Livro(**data.dict(), disponivel=data.quantidade)
    db.add(livro)
    db.commit()
    db.refresh(livro)
    return livro


@router.get("/", response_model=List[LivroResponse])
def listar_livros(
    titulo: Optional[str] = None,
    autor: Optional[str] = None,
    categoria_id: Optional[int] = None,
    apenas_disponiveis: bool = False,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_usuario_atual),
):
    query = db.query(Livro)
    if titulo:
        query = query.filter(Livro.titulo.ilike(f"%{titulo}%"))
    if autor:
        query = query.filter(Livro.autor.ilike(f"%{autor}%"))
    if categoria_id:
        query = query.filter(Livro.categoria_id == categoria_id)
    if apenas_disponiveis:
        query = query.filter(Livro.disponivel > 0)
    return query.all()


@router.get("/{livro_id}", response_model=LivroResponse)
def buscar_livro(
    livro_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_usuario_atual),
):
    livro = db.query(Livro).filter(Livro.id == livro_id).first()
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    return livro


@router.put("/{livro_id}", response_model=LivroResponse)
def atualizar_livro(
    livro_id: int,
    data: LivroUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requer_perfil(PerfilUsuario.admin, PerfilUsuario.bibliotecario)),
):
    livro = db.query(Livro).filter(Livro.id == livro_id).first()
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")

    for campo, valor in data.dict(exclude_unset=True).items():
        setattr(livro, campo, valor)

    db.commit()
    db.refresh(livro)
    return livro


@router.delete("/{livro_id}", status_code=204)
def deletar_livro(
    livro_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requer_perfil(PerfilUsuario.admin)),
):
    livro = db.query(Livro).filter(Livro.id == livro_id).first()
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    db.delete(livro)
    db.commit()
