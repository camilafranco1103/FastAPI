from fastapi import APIRouter, Depends, Query, status
from typing import Annotated, List

from app.schemas import CategoriaCreate, CategoriaUpdate, CategoriaResponse
from app.unit_of_work import UnitOfWork, get_uow
from app.services import categoria_service

router = APIRouter(prefix="/categorias", tags=["Categorías"])


@router.get("/", response_model=List[CategoriaResponse])
def get_categorias(
    uow: Annotated[UnitOfWork, Depends(get_uow)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
    stock_disponible: Annotated[bool | None, Query()] = None,
    buscar: Annotated[str | None, Query(max_length=100)] = None
):
    return categoria_service.get_all(uow, skip, limit, stock_disponible, buscar)


@router.get("/{categoria_id}", response_model=CategoriaResponse)
def get_categoria(
    categoria_id: int,
    uow: Annotated[UnitOfWork, Depends(get_uow)]
):
    return categoria_service.get_by_id(uow, categoria_id)


@router.post("/", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
def create_categoria(
    categoria_data: CategoriaCreate,
    uow: Annotated[UnitOfWork, Depends(get_uow)]
):
    return categoria_service.create(uow, categoria_data)


@router.put("/{categoria_id}", response_model=CategoriaResponse)
def update_categoria(
    categoria_id: int,
    categoria_data: CategoriaUpdate,
    uow: Annotated[UnitOfWork, Depends(get_uow)]
):
    return categoria_service.update(uow, categoria_id, categoria_data)


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_categoria(
    categoria_id: int,
    uow: Annotated[UnitOfWork, Depends(get_uow)]
):
    categoria_service.delete(uow, categoria_id)
