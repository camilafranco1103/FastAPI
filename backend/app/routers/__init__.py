from .categorias import router as categorias_router
from .ingredientes import router as ingredientes_router
from .productos import router as productos_router

__all__ = ["categorias_router", "ingredientes_router", "productos_router"]