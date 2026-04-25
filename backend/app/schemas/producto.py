from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .categoria import CategoriaResponse
from .ingrediente import IngredienteResponse


class ProductoBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    descripcion: Optional[str] = None
    es_alergeno: bool = False


class ProductoCreate(ProductoBase):
    """Para CREAR un producto"""
    categorias_ids: Optional[List[int]] = []
    ingredientes_ids: Optional[List[int]] = []


class ProductoUpdate(BaseModel):
    """Para ACTUALIZAR un producto"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    descripcion: Optional[str] = None
    es_alergeno: Optional[bool] = None
    categorias_ids: Optional[List[int]] = None
    ingredientes_ids: Optional[List[int]] = None


class ProductoResponse(ProductoBase):
    """Para las RESPUESTAS de la API (sin relaciones)"""
    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ProductoWithRelations(ProductoResponse):
    """Para las RESPUESTAS con relaciones incluidas"""
    categorias: List[CategoriaResponse] = []
    ingredientes: List[IngredienteResponse] = []
    
    class Config:
        from_attributes = True