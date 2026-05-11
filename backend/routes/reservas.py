from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
from database import get_db
from models.models import Reserva, Livro, Usuario, StatusReserva, PerfilUsuario
from auth_utils import get_usuario_atual, requer_perfil

router = APIRouter()

DIAS_EXPIRACAO_RESERVA = 3  # dias para retirar o livro reservado


class ReservaCreate(BaseModel):
    livro_id: int


class ReservaResponse(BaseModel):
    id: int
    usuario_id: int
    livro_id: int
    criado_em: datetime
    expira_em: datetime
    status: StatusReserva

    class Config:
        from_attributes = True


@router.post("/", response_model=ReservaResponse, status_code=201)
def criar_reserva(
    data: ReservaCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    livro = db.query(Livro).filter(Livro.id == data.livro_id).first()
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")

    # Verificar se já tem reserva ativa para este livro
    reserva_existente = db.query(Reserva).filter(
        Reserva.usuario_id == usuario.id,
        Reserva.livro_id == data.livro_id,
        Reserva.status == StatusReserva.pendente,
    ).first()
    if reserva_existente:
        raise HTTPException(status_code=400, detail="Você já possui uma reserva ativa para este livro")

    reserva = Reserva(
        usuario_id=usuario.id,
        livro_id=data.livro_id,
        expira_em=datetime.utcnow() + timedelta(days=DIAS_EXPIRACAO_RESERVA),
    )
    db.add(reserva)
    db.commit()
    db.refresh(reserva)
    return reserva


@router.post("/{reserva_id}/cancelar", response_model=ReservaResponse)
def cancelar_reserva(
    reserva_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    reserva = db.query(Reserva).filter(Reserva.id == reserva_id).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")

    # Usuário só pode cancelar sua própria reserva (admin/bibliotecário podem cancelar qualquer uma)
    if usuario.perfil in [PerfilUsuario.aluno, PerfilUsuario.professor]:
        if reserva.usuario_id != usuario.id:
            raise HTTPException(status_code=403, detail="Acesso negado")

    reserva.status = StatusReserva.cancelada
    db.commit()
    db.refresh(reserva)
    return reserva


@router.get("/", response_model=List[ReservaResponse])
def listar_reservas(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    query = db.query(Reserva)
    if usuario.perfil in [PerfilUsuario.aluno, PerfilUsuario.professor]:
        query = query.filter(Reserva.usuario_id == usuario.id)
    return query.order_by(Reserva.criado_em.desc()).all()
