from pydantic import BaseModel


class ProductoIngredienteBase(BaseModel):
    producto_id: int
    ingrediente_id: int
    es_removible: bool = True


class ProductoIngredienteCreate(ProductoIngredienteBase):
    """Para CREAR relación producto-ingrediente"""
    pass


class ProductoIngredienteResponse(ProductoIngredienteBase):
    """Para las RESPUESTAS de la API"""
    
    class Config:
        from_attributes = True