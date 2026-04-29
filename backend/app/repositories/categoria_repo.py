from sqlmodel import Session, select
from typing import Optional

from app.models import Categoria
from app.repositories.base import BaseRepository


class CategoriaRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_all_active(
        self,
        skip: int = 0,
        limit: int = 10,
        stock_disponible: Optional[bool] = None,
        buscar: Optional[str] = None
    ) -> list[Categoria]:
        query = select(Categoria).where(Categoria.deleted_at == None)

        if stock_disponible is not None:
            query = query.where(Categoria.stock_disponible == stock_disponible)

        if buscar:
            query = query.where(Categoria.nombre.ilike(f"%{buscar}%"))

        query = query.offset(skip).limit(limit)
        return self.session.exec(query).all()

    def get_active_by_id(self, id: int) -> Optional[Categoria]:
        categoria = self.get_by_id(id)
        if not categoria or categoria.deleted_at is not None:
            return None
        return categoria

    def get_by_nombre(self, nombre: str, exclude_id: Optional[int] = None) -> Optional[Categoria]:
        query = select(Categoria).where(
            Categoria.nombre == nombre,
            Categoria.deleted_at == None
        )
        if exclude_id is not None:
            query = query.where(Categoria.id != exclude_id)
        return self.session.exec(query).first()
