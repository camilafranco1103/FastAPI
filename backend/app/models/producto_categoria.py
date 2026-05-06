from sqlmodel import SQLModel, Field
from datetime import datetime, timezone


class ProductoCategoria(SQLModel, table=True):
    producto_id: int = Field(foreign_key="producto.id", primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", primary_key=True)
    es_principal: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
