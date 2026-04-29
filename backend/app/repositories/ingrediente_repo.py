from sqlmodel import Session, select
from typing import Optional

from app.models import Ingrediente
from app.repositories.base import BaseRepository


class IngredienteRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, Ingrediente)

    def get_all_active(
        self,
        skip: int = 0,
        limit: int = 10,
        parent_id: Optional[int] = None,
        buscar: Optional[str] = None
    ) -> list[Ingrediente]:
        query = select(Ingrediente).where(Ingrediente.deleted_at == None)

        if parent_id is not None:
            query = query.where(Ingrediente.parent_id == parent_id)

        if buscar:
            query = query.where(Ingrediente.nombre.ilike(f"%{buscar}%"))

        query = query.offset(skip).limit(limit)
        return self.session.exec(query).all()

    def get_active_by_id(self, id: int) -> Optional[Ingrediente]:
        ingrediente = self.get_by_id(id)
        if not ingrediente or ingrediente.deleted_at is not None:
            return None
        return ingrediente

    def get_by_nombre(self, nombre: str, exclude_id: Optional[int] = None) -> Optional[Ingrediente]:
        query = select(Ingrediente).where(
            Ingrediente.nombre == nombre,
            Ingrediente.deleted_at == None
        )
        if exclude_id is not None:
            query = query.where(Ingrediente.id != exclude_id)
        return self.session.exec(query).first()
