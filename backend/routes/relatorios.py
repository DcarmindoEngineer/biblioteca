from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models.models import Livro, Emprestimo, Multa, Usuario, StatusEmprestimo, StatusMulta, PerfilUsuario
from auth_utils import requer_perfil

router = APIRouter()


@router.get("/resumo")
def resumo_geral(
    db: Session = Depends(get_db),
    _=Depends(requer_perfil(PerfilUsuario.admin, PerfilUsuario.bibliotecario)),
):
    """Painel com números gerais do sistema."""
    return {
        "total_livros":          db.query(func.sum(Livro.quantidade)).scalar() or 0,
        "livros_disponiveis":    db.query(func.sum(Livro.disponivel)).scalar() or 0,
        "total_usuarios":        db.query(func.count(Usuario.id)).scalar(),
        "emprestimos_ativos":    db.query(Emprestimo).filter(Emprestimo.status == StatusEmprestimo.ativo).count(),
        "emprestimos_atrasados": db.query(Emprestimo).filter(Emprestimo.status == StatusEmprestimo.atrasado).count(),
        "multas_pendentes":      db.query(Multa).filter(Multa.status == StatusMulta.pendente).count(),
        "valor_multas_pendentes": db.query(func.sum(Multa.valor)).filter(Multa.status == StatusMulta.pendente).scalar() or 0,
    }


@router.get("/livros-mais-emprestados")
def livros_mais_emprestados(
    limite: int = 10,
    db: Session = Depends(get_db),
    _=Depends(requer_perfil(PerfilUsuario.admin, PerfilUsuario.bibliotecario)),
):
    """Ranking dos livros mais emprestados."""
    resultado = (
        db.query(Livro.titulo, Livro.autor, func.count(Emprestimo.id).label("total"))
        .join(Emprestimo, Emprestimo.livro_id == Livro.id)
        .group_by(Livro.id)
        .order_by(func.count(Emprestimo.id).desc())
        .limit(limite)
        .all()
    )
    return [{"titulo": r.titulo, "autor": r.autor, "total_emprestimos": r.total} for r in resultado]


@router.get("/usuarios-com-pendencias")
def usuarios_com_pendencias(
    db: Session = Depends(get_db),
    _=Depends(requer_perfil(PerfilUsuario.admin, PerfilUsuario.bibliotecario)),
):
    """Usuários com multas pendentes ou empréstimos atrasados."""
    multas = (
        db.query(Usuario.id, Usuario.nome, Usuario.email, func.sum(Multa.valor).label("total_multas"))
        .join(Multa, Multa.usuario_id == Usuario.id)
        .filter(Multa.status == StatusMulta.pendente)
        .group_by(Usuario.id)
        .all()
    )
    return [
        {"id": m.id, "nome": m.nome, "email": m.email, "total_multas": m.total_multas}
        for m in multas
    ]
