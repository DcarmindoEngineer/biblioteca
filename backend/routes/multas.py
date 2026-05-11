from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime
from database import get_db
from models.models import Multa, Usuario, StatusMulta, PerfilUsuario
from auth_utils import get_usuario_atual, requer_perfil

router = APIRouter()


class MultaResponse(BaseModel):
    id: int
    usuario_id: int
    emprestimo_id: int
    valor: float
    dias_atraso: int
    status: StatusMulta
    pago_em: datetime | None
    criado_em: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[MultaResponse])
def listar_multas(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_atual),
):
    query = db.query(Multa)
    if usuario.perfil in [PerfilUsuario.aluno, PerfilUsuario.professor]:
        query = query.filter(Multa.usuario_id == usuario.id)
    return query.order_by(Multa.criado_em.desc()).all()


@router.post("/{multa_id}/pagar", response_model=MultaResponse)
def pagar_multa(
    multa_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requer_perfil(PerfilUsuario.admin, PerfilUsuario.bibliotecario)),
):
    multa = db.query(Multa).filter(Multa.id == multa_id).first()
    if not multa:
        raise HTTPException(status_code=404, detail="Multa não encontrada")
    if multa.status == StatusMulta.paga:
        raise HTTPException(status_code=400, detail="Multa já foi paga")

    multa.status = StatusMulta.paga
    multa.pago_em = datetime.utcnow()
    db.commit()
    db.refresh(multa)
    return multa
