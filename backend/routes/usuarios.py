from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from database import get_db
from models.models import Usuario, PerfilUsuario
from auth_utils import hash_senha, get_usuario_atual, requer_perfil

router = APIRouter()


# ── Schemas ────────────────────────────────────────────────────────────────────

class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    perfil: PerfilUsuario
    matricula: Optional[str] = None


class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: str
    perfil: PerfilUsuario
    matricula: Optional[str]
    ativo: bool

    class Config:
        from_attributes = True


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    matricula: Optional[str] = None
    ativo: Optional[bool] = None


# ── Rotas ──────────────────────────────────────────────────────────────────────

@router.post("/", response_model=UsuarioResponse, status_code=201)
def criar_usuario(
    data: UsuarioCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requer_perfil(PerfilUsuario.admin, PerfilUsuario.bibliotecario)),
):
    if db.query(Usuario).filter(Usuario.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    usuario = Usuario(
        nome=data.nome,
        email=data.email,
        senha_hash=hash_senha(data.senha),
        perfil=data.perfil,
        matricula=data.matricula,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.get("/", response_model=List[UsuarioResponse])
def listar_usuarios(
    perfil: Optional[PerfilUsuario] = None,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requer_perfil(PerfilUsuario.admin, PerfilUsuario.bibliotecario)),
):
    query = db.query(Usuario)
    if perfil:
        query = query.filter(Usuario.perfil == perfil)
    return query.all()


@router.get("/me", response_model=UsuarioResponse)
def meu_perfil(usuario: Usuario = Depends(get_usuario_atual)):
    return usuario


@router.get("/{usuario_id}", response_model=UsuarioResponse)
def buscar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requer_perfil(PerfilUsuario.admin, PerfilUsuario.bibliotecario)),
):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return usuario


@router.put("/{usuario_id}", response_model=UsuarioResponse)
def atualizar_usuario(
    usuario_id: int,
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requer_perfil(PerfilUsuario.admin)),
):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    for campo, valor in data.dict(exclude_unset=True).items():
        setattr(usuario, campo, valor)

    db.commit()
    db.refresh(usuario)
    return usuario
