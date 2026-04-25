from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import create_db_and_tables
from app.routers import categorias_router, ingredientes_router, productos_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Ejecuta al iniciar y al cerrar la aplicación"""
    # Código que se ejecuta AL INICIAR
    print("🚀 Iniciando aplicación...")
    create_db_and_tables()
    print("✅ Base de datos lista")
    yield
    # Código que se ejecuta AL CERRAR
    print("👋 Cerrando aplicación...")


app = FastAPI(
    title="API Parcial - Programación IV",
    description="API para gestión de Categorías, Ingredientes y Productos",
    version="1.0.0",
    lifespan=lifespan
)


# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL del frontend React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Registrar routers
app.include_router(categorias_router, prefix="/api")
app.include_router(ingredientes_router, prefix="/api")
app.include_router(productos_router, prefix="/api")


# Ruta raíz (opcional)
@app.get("/")
def read_root():
    return {
        "message": "API funcionando correctamente",
        "docs": "http://localhost:8000/docs"
    }