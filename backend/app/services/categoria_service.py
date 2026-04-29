from datetime import datetime, timezone
from fastapi import HTTPException, status

from app.models import Categoria
from app.schemas import CategoriaCreate, CategoriaUpdate
from app.unit_of_work import UnitOfWork


def get_all(
    uow: UnitOfWork,
    skip: int = 0,
    limit: int = 10,
    stock_disponible: bool | None = None,
    buscar: str | None = None
) -> list[Categoria]:
    return uow.categorias.get_all_active(skip, limit, stock_disponible, buscar)


def get_by_id(uow: UnitOfWork, categoria_id: int) -> Categoria:
    categoria = uow.categorias.get_active_by_id(categoria_id)
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Categoría con ID {categoria_id} no encontrada"
        )
    return categoria


def create(uow: UnitOfWork, data: CategoriaCreate) -> Categoria:
    if uow.categorias.get_by_nombre(data.nombre):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe una categoría con el nombre '{data.nombre}'"
        )

    categoria = Categoria.model_validate(data)
    uow.categorias.save(categoria)
    uow.commit()
    uow.refresh(categoria)
    return categoria


def update(uow: UnitOfWork, categoria_id: int, data: CategoriaUpdate) -> Categoria:
    categoria = get_by_id(uow, categoria_id)

    update_data = data.model_dump(exclude_unset=True)

    if "nombre" in update_data and uow.categorias.get_by_nombre(update_data["nombre"], exclude_id=categoria_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe otra categoría con el nombre '{update_data['nombre']}'"
        )

    for key, value in update_data.items():
        setattr(categoria, key, value)

    categoria.updated_at = datetime.now(timezone.utc)
    uow.categorias.save(categoria)
    uow.commit()
    uow.refresh(categoria)
    return categoria


def delete(uow: UnitOfWork, categoria_id: int) -> None:
    categoria = get_by_id(uow, categoria_id)
    categoria.deleted_at = datetime.now(timezone.utc)
    uow.categorias.save(categoria)
    uow.commit()
