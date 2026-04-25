from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CategoriaBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=150)
    descripcion: Optional[str] = None
    imagenes_url: Optional[str] = None
    stock_cantidad: Optional[int] = Field(None, ge=0)
    stock_disponible: bool = True


class CategoriaCreate(CategoriaBase):
    """Para CREAR una categoría"""
    pass


class CategoriaUpdate(BaseModel):
    """Para ACTUALIZAR una categoría"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=150)
    descripcion: Optional[str] = None
    imagenes_url: Optional[str] = None
    stock_cantidad: Optional[int] = Field(None, ge=0)
    stock_disponible: Optional[bool] = None


class CategoriaResponse(CategoriaBase):
    """Para las RESPUESTAS de la API"""
    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True