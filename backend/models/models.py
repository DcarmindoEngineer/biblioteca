from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


# ── Enums ──────────────────────────────────────────────────────────────────────

class PerfilUsuario(str, enum.Enum):
    aluno         = "aluno"
    professor     = "professor"
    bibliotecario = "bibliotecario"
    admin         = "admin"

class StatusEmprestimo(str, enum.Enum):
    ativo     = "ativo"
    devolvido = "devolvido"
    atrasado  = "atrasado"

class StatusReserva(str, enum.Enum):
    pendente   = "pendente"
    confirmada = "confirmada"
    cancelada  = "cancelada"
    expirada   = "expirada"

class StatusMulta(str, enum.Enum):
    pendente = "pendente"
    paga     = "paga"


# ── Models ─────────────────────────────────────────────────────────────────────

class Categoria(Base):
    __tablename__ = "categorias"

    id   = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), unique=True, nullable=False)

    livros = relationship("Livro", back_populates="categoria")


class Usuario(Base):
    __tablename__ = "usuarios"

    id             = Column(Integer, primary_key=True, index=True)
    nome           = Column(String(150), nullable=False)
    email          = Column(String(150), unique=True, index=True, nullable=False)
    senha_hash     = Column(String(255), nullable=False)
    perfil         = Column(Enum(PerfilUsuario), nullable=False)
    matricula      = Column(String(50), unique=True, nullable=True)   # aluno/professor
    ativo          = Column(Boolean, default=True)
    criado_em      = Column(DateTime(timezone=True), server_default=func.now())

    emprestimos = relationship("Emprestimo", back_populates="usuario")
    reservas    = relationship("Reserva",    back_populates="usuario")
    multas      = relationship("Multa",      back_populates="usuario")


class Livro(Base):
    __tablename__ = "livros"

    id           = Column(Integer, primary_key=True, index=True)
    titulo       = Column(String(255), nullable=False, index=True)
    autor        = Column(String(255), nullable=False)
    isbn         = Column(String(20),  unique=True, nullable=True)
    editora      = Column(String(150), nullable=True)
    ano          = Column(Integer,     nullable=True)
    descricao    = Column(Text,        nullable=True)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=True)
    quantidade   = Column(Integer, default=1)          # total de exemplares
    disponivel   = Column(Integer, default=1)          # exemplares disponíveis
    criado_em    = Column(DateTime(timezone=True), server_default=func.now())

    categoria   = relationship("Categoria",   back_populates="livros")
    emprestimos = relationship("Emprestimo",  back_populates="livro")
    reservas    = relationship("Reserva",     back_populates="livro")


class Emprestimo(Base):
    __tablename__ = "emprestimos"

    id               = Column(Integer, primary_key=True, index=True)
    usuario_id       = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    livro_id         = Column(Integer, ForeignKey("livros.id"),   nullable=False)
    data_emprestimo  = Column(DateTime(timezone=True), server_default=func.now())
    data_prevista    = Column(DateTime(timezone=True), nullable=False)  # prazo de devolução
    data_devolucao   = Column(DateTime(timezone=True), nullable=True)   # devolução real
    status           = Column(Enum(StatusEmprestimo), default=StatusEmprestimo.ativo)
    renovacoes       = Column(Integer, default=0)

    usuario = relationship("Usuario", back_populates="emprestimos")
    livro   = relationship("Livro",   back_populates="emprestimos")
    multa   = relationship("Multa",   back_populates="emprestimo", uselist=False)


class Reserva(Base):
    __tablename__ = "reservas"

    id          = Column(Integer, primary_key=True, index=True)
    usuario_id  = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    livro_id    = Column(Integer, ForeignKey("livros.id"),   nullable=False)
    criado_em   = Column(DateTime(timezone=True), server_default=func.now())
    expira_em   = Column(DateTime(timezone=True), nullable=False)  # prazo para retirada
    status      = Column(Enum(StatusReserva), default=StatusReserva.pendente)

    usuario = relationship("Usuario", back_populates="reservas")
    livro   = relationship("Livro",   back_populates="reservas")


class Multa(Base):
    __tablename__ = "multas"

    id            = Column(Integer, primary_key=True, index=True)
    usuario_id    = Column(Integer, ForeignKey("usuarios.id"),    nullable=False)
    emprestimo_id = Column(Integer, ForeignKey("emprestimos.id"), nullable=False)
    valor         = Column(Float,   nullable=False)
    dias_atraso   = Column(Integer, nullable=False)
    status        = Column(Enum(StatusMulta), default=StatusMulta.pendente)
    pago_em       = Column(DateTime(timezone=True), nullable=True)
    criado_em     = Column(DateTime(timezone=True), server_default=func.now())

    usuario    = relationship("Usuario",    back_populates="multas")
    emprestimo = relationship("Emprestimo", back_populates="multa")
