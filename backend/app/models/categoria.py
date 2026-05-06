from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone

from app.models.producto_categoria import ProductoCategoria

if TYPE_CHECKING:
    from app.models.producto import Producto
    from app.models.ingrediente import Ingrediente


class Categoria(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=150, unique=True, index=True)
    descripcion: Optional[str] = Field(default=None)
    imagenes_url: Optional[str] = Field(default=None)
    stock_cantidad: Optional[int] = Field(default=None, ge=0)
    stock_disponible: bool = Field(default=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    deleted_at: Optional[datetime] = Field(default=None)

    productos: List["Producto"] = Relationship(
        back_populates="categorias",
        link_model=ProductoCategoria
    )
    ingredientes: List["Ingrediente"] = Relationship(back_populates="categoria")
