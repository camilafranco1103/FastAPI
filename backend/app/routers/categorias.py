from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from typing import Annotated, List
from datetime import datetime

from app.database import get_session
from app.models import Categoria
from app.schemas import CategoriaCreate, CategoriaUpdate, CategoriaResponse

router = APIRouter(prefix="/categorias", tags=["Categorías"])


@router.get("/", response_model=List[CategoriaResponse])
def get_categorias(
    session: Annotated[Session, Depends(get_session)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
    stock_disponible: Annotated[bool | None, Query()] = None,
    buscar: Annotated[str | None, Query(max_length=100)] = None
):
    """Obtener lista de categorías con paginación"""
    query = select(Categoria).where(Categoria.deleted_at == None)
    
    if stock_disponible is not None:
        query = query.where(Categoria.stock_disponible == stock_disponible)
    
    if buscar:
        query = query.where(Categoria.nombre.ilike(f"%{buscar}%"))
    
    query = query.offset(skip).limit(limit)
    categorias = session.exec(query).all()
    
    return categorias


@router.get("/{categoria_id}", response_model=CategoriaResponse)
def get_categoria(
    categoria_id: int,
    session: Annotated[Session, Depends(get_session)]
):
    """Obtener una categoría por ID"""
    categoria = session.get(Categoria, categoria_id)
    
    if not categoria or categoria.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Categoría con ID {categoria_id} no encontrada"
        )
    
    return categoria


@router.post("/", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
def create_categoria(
    categoria_data: CategoriaCreate,
    session: Annotated[Session, Depends(get_session)]
):
    """Crear una nueva categoría"""
    # Verificar nombre único
    existing = session.exec(
        select(Categoria).where(
            Categoria.nombre == categoria_data.nombre,
            Categoria.deleted_at == None
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe una categoría con el nombre '{categoria_data.nombre}'"
        )
    
    categoria = Categoria.model_validate(categoria_data)
    session.add(categoria)
    session.commit()
    session.refresh(categoria)
    
    return categoria


@router.put("/{categoria_id}", response_model=CategoriaResponse)
def update_categoria(
    categoria_id: int,
    categoria_data: CategoriaUpdate,
    session: Annotated[Session, Depends(get_session)]
):
    """Actualizar una categoría existente"""
    categoria = session.get(Categoria, categoria_id)
    
    if not categoria or categoria.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Categoría con ID {categoria_id} no encontrada"
        )
    
    update_data = categoria_data.model_dump(exclude_unset=True)
    
    # Verificar nombre único si se está actualizando
    if "nombre" in update_data:
        existing = session.exec(
            select(Categoria).where(
                Categoria.nombre == update_data["nombre"],
                Categoria.id != categoria_id,
                Categoria.deleted_at == None
            )
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe otra categoría con el nombre '{update_data['nombre']}'"
            )
    
    # Actualizar campos
    for key, value in update_data.items():
        setattr(categoria, key, value)
    
    categoria.updated_at = datetime.utcnow()
    
    session.add(categoria)
    session.commit()
    session.refresh(categoria)
    
    return categoria


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_categoria(
    categoria_id: int,
    session: Annotated[Session, Depends(get_session)]
):
    """Eliminar (soft delete) una categoría"""
    categoria = session.get(Categoria, categoria_id)
    
    if not categoria or categoria.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Categoría con ID {categoria_id} no encontrada"
        )
    
    # Soft delete
    categoria.deleted_at = datetime.utcnow()
    session.add(categoria)
    session.commit()
    
    return None