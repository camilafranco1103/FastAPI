from sqlmodel import SQLModel, Field


class ProductoIngrediente(SQLModel, table=True):
    producto_id: int = Field(foreign_key="producto.id", primary_key=True)
    ingrediente_id: int = Field(foreign_key="ingrediente.id", primary_key=True)
    es_removible: bool = Field(default=True)
