from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from typing import Annotated, List
from datetime import datetime

from app.database import get_session
from app.models import Ingrediente, Categoria
from app.schemas import IngredienteCreate, IngredienteUpdate, IngredienteResponse

router = APIRouter(prefix="/ingredientes", tags=["Ingredientes"])


@router.get("/", response_model=List[IngredienteResponse])
def get_ingredientes(
    session: Annotated[Session, Depends(get_session)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
    parent_id: Annotated[int | None, Query()] = None,
    buscar: Annotated[str | None, Query(max_length=100)] = None
):
    """Obtener lista de ingredientes con paginación"""
    query = select(Ingrediente).where(Ingrediente.deleted_at == None)
    
    if parent_id is not None:
        query = query.where(Ingrediente.parent_id == parent_id)
    
    if buscar:
        query = query.where(Ingrediente.nombre.ilike(f"%{buscar}%"))
    
    query = query.offset(skip).limit(limit)
    ingredientes = session.exec(query).all()
    
    return ingredientes


@router.get("/{ingrediente_id}", response_model=IngredienteResponse)
def get_ingrediente(
    ingrediente_id: int,
    session: Annotated[Session, Depends(get_session)]
):
    """Obtener un ingrediente por ID"""
    ingrediente = session.get(Ingrediente, ingrediente_id)
    
    if not ingrediente or ingrediente.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingrediente con ID {ingrediente_id} no encontrado"
        )
    
    return ingrediente


@router.post("/", response_model=IngredienteResponse, status_code=status.HTTP_201_CREATED)
def create_ingrediente(
    ingrediente_data: IngredienteCreate,
    session: Annotated[Session, Depends(get_session)]
):
    """Crear un nuevo ingrediente"""
    # Verificar nombre único
    existing = session.exec(
        select(Ingrediente).where(
            Ingrediente.nombre == ingrediente_data.nombre,
            Ingrediente.deleted_at == None
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un ingrediente con el nombre '{ingrediente_data.nombre}'"
        )
    
    # Verificar que parent_id existe si se proporciona
    if ingrediente_data.parent_id is not None:
        categoria = session.get(Categoria, ingrediente_data.parent_id)
        if not categoria or categoria.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Categoría con ID {ingrediente_data.parent_id} no encontrada"
            )
    
    ingrediente = Ingrediente.model_validate(ingrediente_data)
    session.add(ingrediente)
    session.commit()
    session.refresh(ingrediente)
    
    return ingrediente


@router.put("/{ingrediente_id}", response_model=IngredienteResponse)
def update_ingrediente(
    ingrediente_id: int,
    ingrediente_data: IngredienteUpdate,
    session: Annotated[Session, Depends(get_session)]
):
    """Actualizar un ingrediente existente"""
    ingrediente = session.get(Ingrediente, ingrediente_id)
    
    if not ingrediente or ingrediente.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingrediente con ID {ingrediente_id} no encontrado"
        )
    
    update_data = ingrediente_data.model_dump(exclude_unset=True)
    
    # Verificar nombre único si se está actualizando
    if "nombre" in update_data:
        existing = session.exec(
            select(Ingrediente).where(
                Ingrediente.nombre == update_data["nombre"],
                Ingrediente.id != ingrediente_id,
                Ingrediente.deleted_at == None
            )
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe otro ingrediente con el nombre '{update_data['nombre']}'"
            )
    
    # Verificar que parent_id existe si se está actualizando
    if "parent_id" in update_data and update_data["parent_id"] is not None:
        categoria = session.get(Categoria, update_data["parent_id"])
        if not categoria or categoria.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Categoría con ID {update_data['parent_id']} no encontrada"
            )
    
    # Actualizar campos
    for key, value in update_data.items():
        setattr(ingrediente, key, value)
    
    ingrediente.updated_at = datetime.utcnow()
    
    session.add(ingrediente)
    session.commit()
    session.refresh(ingrediente)
    
    return ingrediente


@router.delete("/{ingrediente_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ingrediente(
    ingrediente_id: int,
    session: Annotated[Session, Depends(get_session)]
):
    """Eliminar (soft delete) un ingrediente"""
    ingrediente = session.get(Ingrediente, ingrediente_id)
    
    if not ingrediente or ingrediente.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingrediente con ID {ingrediente_id} no encontrado"
        )
    
    # Soft delete
    ingrediente.deleted_at = datetime.utcnow()
    session.add(ingrediente)
    session.commit()
    
    return None