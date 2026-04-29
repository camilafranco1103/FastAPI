from fastapi import APIRouter, Depends, Query, status
from typing import Annotated, List

from app.schemas import IngredienteCreate, IngredienteUpdate, IngredienteResponse
from app.unit_of_work import UnitOfWork, get_uow
from app.services import ingrediente_service

router = APIRouter(prefix="/ingredientes", tags=["Ingredientes"])


@router.get("/", response_model=List[IngredienteResponse])
def get_ingredientes(
    uow: Annotated[UnitOfWork, Depends(get_uow)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
    parent_id: Annotated[int | None, Query()] = None,
    buscar: Annotated[str | None, Query(max_length=100)] = None
):
    return ingrediente_service.get_all(uow, skip, limit, parent_id, buscar)


@router.get("/{ingrediente_id}", response_model=IngredienteResponse)
def get_ingrediente(
    ingrediente_id: int,
    uow: Annotated[UnitOfWork, Depends(get_uow)]
):
    return ingrediente_service.get_by_id(uow, ingrediente_id)


@router.post("/", response_model=IngredienteResponse, status_code=status.HTTP_201_CREATED)
def create_ingrediente(
    ingrediente_data: IngredienteCreate,
    uow: Annotated[UnitOfWork, Depends(get_uow)]
):
    return ingrediente_service.create(uow, ingrediente_data)


@router.put("/{ingrediente_id}", response_model=IngredienteResponse)
def update_ingrediente(
    ingrediente_id: int,
    ingrediente_data: IngredienteUpdate,
    uow: Annotated[UnitOfWork, Depends(get_uow)]
):
    return ingrediente_service.update(uow, ingrediente_id, ingrediente_data)


@router.delete("/{ingrediente_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ingrediente(
    ingrediente_id: int,
    uow: Annotated[UnitOfWork, Depends(get_uow)]
):
    ingrediente_service.delete(uow, ingrediente_id)
