from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List
from database import get_db
from models.models import Categoria, Livro, Emprestimo, Multa, Usuario, StatusEmprestimo, StatusMulta, PerfilUsuario
from auth_utils import get_usuario_atual, requer_perfil

# ── Categorias ──────────────────────────────────────────────────────────────────

router = APIRouter()


class CategoriaCreate(BaseModel):
    nome: str


class CategoriaResponse(BaseModel):
    id: int
    nome: str

    class Config:
        from_attributes = True


@router.post("/", response_model=CategoriaResponse, status_code=201)
def criar_categoria(
    data: CategoriaCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requer_perfil(PerfilUsuario.admin, PerfilUsuario.bibliotecario)),
):
    if db.query(Categoria).filter(Categoria.nome == data.nome).first():
        raise HTTPException(status_code=400, detail="Categoria já existe")
    cat = Categoria(nome=data.nome)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.get("/", response_model=List[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db), _: Usuario = Depends(get_usuario_atual)):
    return db.query(Categoria).all()
