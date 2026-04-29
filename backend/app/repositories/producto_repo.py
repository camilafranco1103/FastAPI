from sqlmodel import Session, select
from typing import Optional

from app.models import Producto, ProductoCategoria, ProductoIngrediente
from app.repositories.base import BaseRepository


class ProductoRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_all_active(
        self,
        skip: int = 0,
        limit: int = 10,
        es_alergeno: Optional[bool] = None,
        buscar: Optional[str] = None
    ) -> list[Producto]:
        query = select(Producto).where(Producto.deleted_at == None)

        if es_alergeno is not None:
            query = query.where(Producto.es_alergeno == es_alergeno)

        if buscar:
            query = query.where(Producto.nombre.ilike(f"%{buscar}%"))

        query = query.offset(skip).limit(limit)
        return self.session.exec(query).all()

    def get_active_by_id(self, id: int) -> Optional[Producto]:
        producto = self.get_by_id(id)
        if not producto or producto.deleted_at is not None:
            return None
        return producto

    def get_producto_categorias(self, producto_id: int) -> list[ProductoCategoria]:
        return self.session.exec(
            select(ProductoCategoria).where(ProductoCategoria.producto_id == producto_id)
        ).all()

    def get_producto_ingredientes(self, producto_id: int) -> list[ProductoIngrediente]:
        return self.session.exec(
            select(ProductoIngrediente).where(ProductoIngrediente.producto_id == producto_id)
        ).all()

    def add_categoria(self, producto_categoria: ProductoCategoria):
        self.session.add(producto_categoria)

    def add_ingrediente(self, producto_ingrediente: ProductoIngrediente):
        self.session.add(producto_ingrediente)

    def remove_categorias(self, producto_id: int):
        for pc in self.get_producto_categorias(producto_id):
            self.session.delete(pc)

    def remove_ingredientes(self, producto_id: int):
        for pi in self.get_producto_ingredientes(producto_id):
            self.session.delete(pi)
