from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from typing import Annotated, List
from datetime import datetime

from app.database import get_session
from app.models import Producto, Categoria, Ingrediente, ProductoCategoria, ProductoIngrediente
from app.schemas import ProductoCreate, ProductoUpdate, ProductoWithRelations

router = APIRouter(prefix="/productos", tags=["Productos"])


@router.get("/", response_model=List[ProductoWithRelations])
def get_productos(
    session: Annotated[Session, Depends(get_session)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
    es_alergeno: Annotated[bool | None, Query()] = None,
    buscar: Annotated[str | None, Query(max_length=100)] = None
):
    """Obtener lista de productos con paginación"""
    query = select(Producto).where(Producto.deleted_at == None)
    
    if es_alergeno is not None:
        query = query.where(Producto.es_alergeno == es_alergeno)
    
    if buscar:
        query = query.where(Producto.nombre.ilike(f"%{buscar}%"))
    
    query = query.offset(skip).limit(limit)
    productos = session.exec(query).all()
    
    return productos


@router.get("/{producto_id}", response_model=ProductoWithRelations)
def get_producto(
    producto_id: int,
    session: Annotated[Session, Depends(get_session)]
):
    """Obtener un producto por ID con sus relaciones"""
    producto = session.get(Producto, producto_id)
    
    if not producto or producto.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado"
        )
    
    return producto


@router.post("/", response_model=ProductoWithRelations, status_code=status.HTTP_201_CREATED)
def create_producto(
    producto_data: ProductoCreate,
    session: Annotated[Session, Depends(get_session)]
):
    """Crear un nuevo producto con categorías e ingredientes"""
    categorias_ids = producto_data.categorias_ids or []
    ingredientes_ids = producto_data.ingredientes_ids or []
    
    # Crear el producto (sin las relaciones)
    producto_dict = producto_data.model_dump(exclude={"categorias_ids", "ingredientes_ids"})
    producto = Producto.model_validate(producto_dict)
    
    session.add(producto)
    session.flush()  # Para obtener el ID
    
    # Agregar categorías
    for categoria_id in categorias_ids:
        categoria = session.get(Categoria, categoria_id)
        if not categoria or categoria.deleted_at is not None:
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Categoría con ID {categoria_id} no encontrada"
            )
        
        producto_categoria = ProductoCategoria(
            producto_id=producto.id,
            categoria_id=categoria_id
        )
        session.add(producto_categoria)
    
    # Agregar ingredientes
    for ingrediente_id in ingredientes_ids:
        ingrediente = session.get(Ingrediente, ingrediente_id)
        if not ingrediente or ingrediente.deleted_at is not None:
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ingrediente con ID {ingrediente_id} no encontrado"
            )
        
        producto_ingrediente = ProductoIngrediente(
            producto_id=producto.id,
            ingrediente_id=ingrediente_id
        )
        session.add(producto_ingrediente)
    
    session.commit()
    session.refresh(producto)
    
    _ = producto.categorias
    _ = producto.ingredientes

    return producto


@router.put("/{producto_id}", response_model=ProductoWithRelations)
def update_producto(
    producto_id: int,
    producto_data: ProductoUpdate,
    session: Annotated[Session, Depends(get_session)]
):
    """Actualizar un producto existente"""
    producto = session.get(Producto, producto_id)
    
    if not producto or producto.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado"
        )
    
    categorias_ids = producto_data.categorias_ids
    ingredientes_ids = producto_data.ingredientes_ids
    
    # Actualizar campos básicos
    update_data = producto_data.model_dump(
        exclude_unset=True, 
        exclude={"categorias_ids", "ingredientes_ids"}
    )
    
    for key, value in update_data.items():
        setattr(producto, key, value)
    
    producto.updated_at = datetime.utcnow()
    
    # Actualizar categorías si se proporcionan
    if categorias_ids is not None:
        # Eliminar categorías actuales
        for pc in session.exec(
            select(ProductoCategoria).where(ProductoCategoria.producto_id == producto_id)
        ):
            session.delete(pc)
        
        # Agregar nuevas categorías
        for categoria_id in categorias_ids:
            categoria = session.get(Categoria, categoria_id)
            if not categoria or categoria.deleted_at is not None:
                session.rollback()
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Categoría con ID {categoria_id} no encontrada"
                )
            
            producto_categoria = ProductoCategoria(
                producto_id=producto_id,
                categoria_id=categoria_id
            )
            session.add(producto_categoria)
    
    # Actualizar ingredientes si se proporcionan
    if ingredientes_ids is not None:
        # Eliminar ingredientes actuales
        for pi in session.exec(
            select(ProductoIngrediente).where(ProductoIngrediente.producto_id == producto_id)
        ):
            session.delete(pi)
        
        # Agregar nuevos ingredientes
        for ingrediente_id in ingredientes_ids:
            ingrediente = session.get(Ingrediente, ingrediente_id)
            if not ingrediente or ingrediente.deleted_at is not None:
                session.rollback()
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ingrediente con ID {ingrediente_id} no encontrado"
                )
            
            producto_ingrediente = ProductoIngrediente(
                producto_id=producto_id,
                ingrediente_id=ingrediente_id
            )
            session.add(producto_ingrediente)
    
    session.commit()
    session.refresh(producto)

# Forzar carga de relaciones
    _ = producto.categorias
    _ = producto.ingredientes

    return producto


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_producto(
    producto_id: int,
    session: Annotated[Session, Depends(get_session)]
):
    """Eliminar (soft delete) un producto"""
    producto = session.get(Producto, producto_id)
    
    if not producto or producto.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado"
        )
    
    # Soft delete
    producto.deleted_at = datetime.utcnow()
    session.add(producto)
    session.commit()
    
    return None