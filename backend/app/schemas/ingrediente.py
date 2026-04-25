from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class IngredienteBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    descripcion: Optional[str] = None
    parent_id: Optional[int] = None


class IngredienteCreate(IngredienteBase):
    """Para CREAR un ingrediente"""
    pass


class IngredienteUpdate(BaseModel):
    """Para ACTUALIZAR un ingrediente"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    descripcion: Optional[str] = None
    parent_id: Optional[int] = None


class IngredienteResponse(IngredienteBase):
    """Para las RESPUESTAS de la API"""
    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True