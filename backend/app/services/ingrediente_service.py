from datetime import datetime, timezone
from fastapi import HTTPException, status

from app.models import Ingrediente
from app.schemas import IngredienteCreate, IngredienteUpdate
from app.unit_of_work import UnitOfWork


def get_all(
    uow: UnitOfWork,
    skip: int = 0,
    limit: int = 10,
    parent_id: int | None = None,
    buscar: str | None = None
) -> list[Ingrediente]:
    return uow.ingredientes.get_all_active(skip, limit, parent_id, buscar)


def get_by_id(uow: UnitOfWork, ingrediente_id: int) -> Ingrediente:
    ingrediente = uow.ingredientes.get_active_by_id(ingrediente_id)
    if not ingrediente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingrediente con ID {ingrediente_id} no encontrado"
        )
    return ingrediente


def create(uow: UnitOfWork, data: IngredienteCreate) -> Ingrediente:
    if uow.ingredientes.get_by_nombre(data.nombre):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un ingrediente con el nombre '{data.nombre}'"
        )

    if data.parent_id is not None and not uow.categorias.get_active_by_id(data.parent_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Categoría con ID {data.parent_id} no encontrada"
        )

    ingrediente = Ingrediente.model_validate(data)
    uow.ingredientes.save(ingrediente)
    uow.commit()
    uow.refresh(ingrediente)
    return ingrediente


def update(uow: UnitOfWork, ingrediente_id: int, data: IngredienteUpdate) -> Ingrediente:
    ingrediente = get_by_id(uow, ingrediente_id)

    update_data = data.model_dump(exclude_unset=True)

    if "nombre" in update_data and uow.ingredientes.get_by_nombre(update_data["nombre"], exclude_id=ingrediente_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe otro ingrediente con el nombre '{update_data['nombre']}'"
        )

    if "parent_id" in update_data and update_data["parent_id"] is not None:
        if not uow.categorias.get_active_by_id(update_data["parent_id"]):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Categoría con ID {update_data['parent_id']} no encontrada"
            )

    for key, value in update_data.items():
        setattr(ingrediente, key, value)

    ingrediente.updated_at = datetime.now(timezone.utc)
    uow.ingredientes.save(ingrediente)
    uow.commit()
    uow.refresh(ingrediente)
    return ingrediente


def delete(uow: UnitOfWork, ingrediente_id: int) -> None:
    ingrediente = get_by_id(uow, ingrediente_id)
    ingrediente.deleted_at = datetime.now(timezone.utc)
    uow.ingredientes.save(ingrediente)
    uow.commit()
