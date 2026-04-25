from pydantic import BaseModel
from datetime import datetime


class ProductoCategoriaBase(BaseModel):
    producto_id: int
    categoria_id: int
    es_principal: bool = False


class ProductoCategoriaCreate(ProductoCategoriaBase):
    """Para CREAR relación producto-categoría"""
    pass


class ProductoCategoriaResponse(ProductoCategoriaBase):
    """Para las RESPUESTAS de la API"""
    created_at: datetime
    
    class Config:
        from_attributes = True