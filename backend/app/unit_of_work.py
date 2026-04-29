from typing import Annotated
from fastapi import Depends
from sqlmodel import Session

from app.database import get_session
from app.repositories import CategoriaRepository, IngredienteRepository, ProductoRepository


class UnitOfWork:
    def __init__(self, session: Session):
        self.session = session
        self.categorias = CategoriaRepository(session)
        self.ingredientes = IngredienteRepository(session)
        self.productos = ProductoRepository(session)

    def commit(self):
        self.session.commit()

    def rollback(self):
        self.session.rollback()

    def flush(self):
        self.session.flush()

    def refresh(self, entity):
        self.session.refresh(entity)


def get_uow(session: Annotated[Session, Depends(get_session)]) -> UnitOfWork:
    return UnitOfWork(session)
