from fastapi import APIRouter, Depends, Query, status
from typing import Annotated, List

from app.schemas import ProductoCreate, ProductoUpdate, ProductoWithRelations
from app.unit_of_work import UnitOfWork, get_uow
from app.services import producto_service

router = APIRouter(prefix="/productos", tags=["Productos"])


@router.get("/", response_model=List[ProductoWithRelations])
def get_productos(
    uow: Annotated[UnitOfWork, Depends(get_uow)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
    es_alergeno: Annotated[bool | None, Query()] = None,
    buscar: Annotated[str | None, Query(max_length=100)] = None
):
    return producto_service.get_all(uow, skip, limit, es_alergeno, buscar)


@router.get("/{producto_id}", response_model=ProductoWithRelations)
def get_producto(
    producto_id: int,
    uow: Annotated[UnitOfWork, Depends(get_uow)]
):
    return producto_service.get_by_id(uow, producto_id)


@router.post("/", response_model=ProductoWithRelations, status_code=status.HTTP_201_CREATED)
def create_producto(
    producto_data: ProductoCreate,
    uow: Annotated[UnitOfWork, Depends(get_uow)]
):
    return producto_service.create(uow, producto_data)


@router.put("/{producto_id}", response_model=ProductoWithRelations)
def update_producto(
    producto_id: int,
    producto_data: ProductoUpdate,
    uow: Annotated[UnitOfWork, Depends(get_uow)]
):
    return producto_service.update(uow, producto_id, producto_data)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_producto(
    producto_id: int,
    uow: Annotated[UnitOfWork, Depends(get_uow)]
):
    producto_service.delete(uow, producto_id)
