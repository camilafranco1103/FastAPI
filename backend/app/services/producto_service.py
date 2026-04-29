from datetime import datetime, timezone
from fastapi import HTTPException, status

from app.models import Producto, ProductoCategoria, ProductoIngrediente
from app.schemas import ProductoCreate, ProductoUpdate
from app.unit_of_work import UnitOfWork


def get_all(
    uow: UnitOfWork,
    skip: int = 0,
    limit: int = 10,
    es_alergeno: bool | None = None,
    buscar: str | None = None
) -> list[Producto]:
    return uow.productos.get_all_active(skip, limit, es_alergeno, buscar)


def get_by_id(uow: UnitOfWork, producto_id: int) -> Producto:
    producto = uow.productos.get_active_by_id(producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado"
        )
    return producto


def _attach_categorias(uow: UnitOfWork, producto_id: int, categorias_ids: list[int]):
    for categoria_id in categorias_ids:
        if not uow.categorias.get_active_by_id(categoria_id):
            uow.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Categoría con ID {categoria_id} no encontrada"
            )
        uow.productos.add_categoria(ProductoCategoria(producto_id=producto_id, categoria_id=categoria_id))


def _attach_ingredientes(uow: UnitOfWork, producto_id: int, ingredientes_ids: list[int]):
    for ingrediente_id in ingredientes_ids:
        if not uow.ingredientes.get_active_by_id(ingrediente_id):
            uow.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ingrediente con ID {ingrediente_id} no encontrado"
            )
        uow.productos.add_ingrediente(ProductoIngrediente(producto_id=producto_id, ingrediente_id=ingrediente_id))


def create(uow: UnitOfWork, data: ProductoCreate) -> Producto:
    producto_dict = data.model_dump(exclude={"categorias_ids", "ingredientes_ids"})
    producto = Producto.model_validate(producto_dict)

    uow.productos.save(producto)
    uow.flush()

    _attach_categorias(uow, producto.id, data.categorias_ids or [])
    _attach_ingredientes(uow, producto.id, data.ingredientes_ids or [])

    uow.commit()
    uow.refresh(producto)

    _ = producto.categorias
    _ = producto.ingredientes
    return producto


def update(uow: UnitOfWork, producto_id: int, data: ProductoUpdate) -> Producto:
    producto = get_by_id(uow, producto_id)

    update_data = data.model_dump(exclude_unset=True, exclude={"categorias_ids", "ingredientes_ids"})
    for key, value in update_data.items():
        setattr(producto, key, value)
    producto.updated_at = datetime.now(timezone.utc)

    if data.categorias_ids is not None:
        uow.productos.remove_categorias(producto_id)
        _attach_categorias(uow, producto_id, data.categorias_ids)

    if data.ingredientes_ids is not None:
        uow.productos.remove_ingredientes(producto_id)
        _attach_ingredientes(uow, producto_id, data.ingredientes_ids)

    uow.productos.save(producto)
    uow.commit()
    uow.refresh(producto)

    _ = producto.categorias
    _ = producto.ingredientes
    return producto


def delete(uow: UnitOfWork, producto_id: int) -> None:
    producto = get_by_id(uow, producto_id)
    producto.deleted_at = datetime.now(timezone.utc)
    uow.productos.save(producto)
    uow.commit()
