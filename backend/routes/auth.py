from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.models import Usuario
from auth_utils import verificar_senha, criar_token, hash_senha
from models.models import PerfilUsuario

router = APIRouter()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    perfil: str
    nome: str


class CriarAdminRequest(BaseModel):
    nome: str
    email: str
    senha: str
    chave_secreta: str  # proteção para criar o primeiro admin


@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == form.username).first()

    if not usuario or not verificar_senha(form.password, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
        )

    if not usuario.ativo:
        raise HTTPException(status_code=403, detail="Usuário inativo")

    token = criar_token({"sub": str(usuario.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "perfil": usuario.perfil,
        "nome": usuario.nome,
    }


@router.post("/criar-admin", status_code=201)
def criar_admin(data: CriarAdminRequest, db: Session = Depends(get_db)):
    """Cria o primeiro administrador do sistema."""
    CHAVE_SECRETA_ADMIN = "biblioteca-admin-2024"  # troque em produção

    if data.chave_secreta != CHAVE_SECRETA_ADMIN:
        raise HTTPException(status_code=403, detail="Chave secreta inválida")

    if db.query(Usuario).filter(Usuario.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    admin = Usuario(
        nome=data.nome,
        email=data.email,
        senha_hash=hash_senha(data.senha),
        perfil=PerfilUsuario.admin,
    )
    db.add(admin)
    db.commit()
    return {"message": "Administrador criado com sucesso"}
