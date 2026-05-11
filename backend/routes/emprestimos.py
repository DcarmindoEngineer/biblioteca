from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from database import get_db
from models.models import Emprestimo, Livro, Usuario, Multa, StatusEmprestimo, StatusMulta, PerfilUsuario
from auth_utils import get_usuario_atual, requer_perfil

router = APIRouter()

DIAS_PRAZO_PADRAO = 14       # dias para devolução
VALOR_MULTA_DIA  = 0.50      # R$ por dia de atraso
MAX_RENOVACOES   = 2


# ── Schemas ────────────────────────────────────────────────────────────────────

class EmprestimoCreate(BaseModel):
    usuario_id: int
    livro_id: int
    dias_prazo: int = DIAS_PRAZO_PADRAO


class EmprestimoResponse(BaseModel):
    id: int
    usuario_id: int
    livro_id: int
    data_emprestimo: datetime
    data_prevista: datetime
    data_devolucao: Optional[datetime]
    status: StatusEmprestimo
    renovacoes: int

    class Config:
        from_attributes = True


# ── Rotas ──────────────────────────────────────────────────────────────────────

@router.post("/", response_model=EmprestimoResponse, status_code=201)
def criar_emprestimo(
    data: EmprestimoCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requer_perfil(PerfilUsuario.admin, PerfilUsuario.bibliotecario)),
):
    livro = db.query(Livro).filter(Livro.id == data.livro_id).first()
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    if livro.disponivel <= 0:
        raise HTTPException(status_code=400, detail="Livro sem exemplares disponíveis")

    usuario = db.query(Usuario).filter(Usuario.id == data.usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    # Verificar multas pendentes
    multa_pendente = db.query(Multa).filter(
        Multa.usuario_id == data.usuario_id,
        Multa.status == StatusMulta.pendente,
    ).first()
    if multa_pendente:
        raise HTTPException(status_code=400, detail="Usuário possui multa pendente")

    emprestimo = Emprestimo(
        usuario_id=data.usuario_id,
        livro_id=data.livro_id,
        data_prevista=datetime.utcnow() + timedelta(days=data.dias_prazo),
    )
    livro.disponivel -= 1

    db.add(emprestimo)
    db.commit()
    db.refresh(emprestimo)
    return emprestimo


@router.post("/{emprestimo_id}/devolver", response_model=EmprestimoResponse)
def devolver_livro(
    emprestimo_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requer_perfil(PerfilUsuario.admin, PerfilUsuario.bibliotecario)),
):
    emprestimo = db.query(Emprestimo).filter(Emprestimo.id == emprestimo_id).first()
    if not emprestimo:
        raise HTTPException(status_code=404, detail="Empréstimo não encontrado")
    if emprestimo.status == StatusEmprestimo.devolvido:
        raise HTTPException(status_code=400, detail="Livro já foi devolvido")

    agora = datetime.utcnow()
    emprestimo.data_devolucao = agora
    emprestimo.status = StatusEmprestimo.devolvido
    emprestimo.livro.disponivel += 1

    # Gerar multa se atrasado
    if agora > emprestimo.data_prevista:
        dias_atraso = (agora - emprestimo.data_prevista).days
        multa = Multa(
            usuario_id=emprestimo.usuario_id,
            emprestimo_id=emprestimo.id,
            valor=dias_atraso * VALOR_MULTA_DIA,
            dias_atraso=dias_atraso,
        )
        db.add(multa)

    db.commit()
    db.refresh(emprestimo)
    return emprestimo


@router.post("/{emprestimo_id}/renovar", response_model=EmprestimoResponse)
def renovar_emprestimo(
    emprestimo_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requer_perfil(PerfilUsuario.admin, PerfilUsuario.bibliotecario)),
):
    emprestimo = db.query(Emprestimo).filter(Emprestimo.id == emprestimo_id).first()
    if not emprestimo:
        raise HTTPException(status_code=404, detail="Empréstimo não encontrado")
    if emprestimo.status != StatusEmprestimo.ativo:
        raise HTTPException(status_code=400, detail="Empréstimo não está ativo")
    if emprestimo.renovacoes >= MAX_RENOVACOES:
        raise HTTPException(status_code=400, detail=f"Limite de {MAX_RENOVACOES} renovações atingido")

    emprestimo.data_prevista += timedelta(days=DIAS_PRAZO_PADRAO)
    emprestimo.renovacoes += 1

    db.commit()
    db.refresh(emprestimo)
    return emprestimo


@router.get("/", response_model=List[EmprestimoResponse])
def listar_emprestimos(
    usuario_id: Optional[int] = None,
    status: Optional[StatusEmprestimo] = None,
    db: Session = Depends(get_db),
    usuario_atual: Usuario = Depends(get_usuario_atual),
):
    query = db.query(Emprestimo)

    # Aluno/professor só veem os próprios empréstimos
    if usuario_atual.perfil in [PerfilUsuario.aluno, PerfilUsuario.professor]:
        query = query.filter(Emprestimo.usuario_id == usuario_atual.id)
    elif usuario_id:
        query = query.filter(Emprestimo.usuario_id == usuario_id)

    if status:
        query = query.filter(Emprestimo.status == status)

    return query.order_by(Emprestimo.data_emprestimo.desc()).all()
