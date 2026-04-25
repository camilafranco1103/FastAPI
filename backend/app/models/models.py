from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime


__all__ = ["Categoria", "Ingrediente", "Producto", "ProductoCategoria", "ProductoIngrediente"]


# ========================================
# TABLA INTERMEDIA: ProductoCategoria
# ========================================
class ProductoCategoria(SQLModel, table=True):
    """
    Tabla intermedia N:N entre Producto y Categoria
    Un producto puede estar en varias categorías
    """
    producto_id: int = Field(foreign_key="producto.id", primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", primary_key=True)
    es_principal: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ========================================
# TABLA INTERMEDIA: ProductoIngrediente
# ========================================
class ProductoIngrediente(SQLModel, table=True):
    """
    Tabla intermedia N:N entre Producto e Ingrediente
    """
    producto_id: int = Field(foreign_key="producto.id", primary_key=True)
    ingrediente_id: int = Field(foreign_key="ingrediente.id", primary_key=True)
    es_removible: bool = Field(default=True)


# ========================================
# MODELO: Categoria
# ========================================
class Categoria(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=150, unique=True, index=True)
    descripcion: Optional[str] = Field(default=None)
    imagenes_url: Optional[str] = Field(default=None)  # Guardamos como JSON string
    stock_cantidad: Optional[int] = Field(default=None, ge=0)
    stock_disponible: bool = Field(default=True)
    
    # Auditoría
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = Field(default=None)
    
    # Relaciones
    productos: List["Producto"] = Relationship(
        back_populates="categorias",
        link_model=ProductoCategoria
    )
    ingredientes: List["Ingrediente"] = Relationship(back_populates="categoria")


# ========================================
# MODELO: Ingrediente
# ========================================
class Ingrediente(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    parent_id: Optional[int] = Field(default=None, foreign_key="categoria.id")
    nombre: str = Field(max_length=100, unique=True, index=True)
    descripcion: Optional[str] = Field(default=None)
    
    # Auditoría
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = Field(default=None)
    
    # Relaciones
    categoria: Optional["Categoria"] = Relationship(back_populates="ingredientes")
    productos: List["Producto"] = Relationship(
        back_populates="ingredientes",
        link_model=ProductoIngrediente
    )


# ========================================
# MODELO: Producto
# ========================================
class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100, index=True)
    descripcion: Optional[str] = Field(default=None)
    es_alergeno: bool = Field(default=False)
    
    # Auditoría
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = Field(default=None)
    
    # Relaciones N:N
    categorias: List["Categoria"] = Relationship(
        back_populates="productos",
        link_model=ProductoCategoria
    )
    ingredientes: List["Ingrediente"] = Relationship(
        back_populates="productos",
        link_model=ProductoIngrediente
    )