from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone

from app.models.producto_categoria import ProductoCategoria
from app.models.producto_ingrediente import ProductoIngrediente

if TYPE_CHECKING:
    from app.models.categoria import Categoria
    from app.models.ingrediente import Ingrediente


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100, index=True)
    descripcion: Optional[str] = Field(default=None)
    es_alergeno: bool = Field(default=False)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    deleted_at: Optional[datetime] = Field(default=None)

    categorias: List["Categoria"] = Relationship(
        back_populates="productos",
        link_model=ProductoCategoria
    )
    ingredientes: List["Ingrediente"] = Relationship(
        back_populates="productos",
        link_model=ProductoIngrediente
    )
