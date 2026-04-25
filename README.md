**Link del video:** https://drive.google.com/file/d/16Cs_nmNlKExpXMZFreCBjHl7PdLYdf1p/view?usp=drive_link
================================================================================
SISTEMA DE GESTIÓN DE PRODUCTOS ALIMENTICIOS
================================================================================

Aplicación fullstack desarrollada como proyecto final para Programación IV.
Sistema de gestión con relaciones complejas entre entidades (1:N y N:N),
implementando CRUD completo, validaciones, y patrón de soft delete.

================================================================================
AUTORA
================================================================================

Camila - Programación IV - 2026

================================================================================
TECNOLOGÍAS UTILIZADAS
================================================================================

BACKEND:
- FastAPI - Framework web moderno para Python
- SQLModel - ORM que combina SQLAlchemy con Pydantic
- PostgreSQL - Base de datos relacional
- Pydantic - Validación de datos y schemas
- Uvicorn - Servidor ASGI de alto rendimiento

FRONTEND:
- React 18 - Librería de interfaz de usuario
- TypeScript - Tipado estático para JavaScript
- Vite - Build tool y dev server
- TanStack Query - Manejo de estado del servidor y caché automático
- React Router DOM - Navegación SPA
- Tailwind CSS 3 - Framework de estilos utility-first
- Axios - Cliente HTTP

================================================================================
REQUISITOS PREVIOS
================================================================================

- Python 3.10 o superior
- Node.js 18 o superior con npm
- PostgreSQL 14 o superior
- Git

================================================================================
ESTRUCTURA DEL PROYECTO
================================================================================

proyecto-parcial/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── models.py              (5 modelos con relaciones 1:N y N:N)
│   │   ├── routers/
│   │   │   ├── categorias.py          (Endpoints CRUD categorías)
│   │   │   ├── ingredientes.py        (Endpoints CRUD ingredientes)
│   │   │   └── productos.py           (Endpoints CRUD productos)
│   │   ├── schemas/
│   │   │   ├── categoria.py           (Validaciones Pydantic)
│   │   │   ├── ingrediente.py
│   │   │   └── productos.py
│   │   ├── database.py                (Configuración PostgreSQL)
│   │   └── main.py                    (Punto de entrada FastAPI)
│   ├── .env                           (Variables de entorno)
│   └── requirements.txt               (Dependencias Python)
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.ts               (Configuración cliente HTTP)
    │   ├── components/
    │   │   ├── CategoriasTable.tsx    (CRUD Categorías)
    │   │   ├── IngredientesTable.tsx  (CRUD Ingredientes)
    │   │   └── ProductosTable.tsx     (CRUD Productos con relaciones N:N)
    │   ├── pages/
    │   │   ├── CategoriasPage.tsx
    │   │   ├── IngredientesPage.tsx
    │   │   └── ProductosPage.tsx
    │   ├── App.tsx                    (Rutas y navegación)
    │   ├── main.tsx                   (Configuración TanStack Query)
    │   └── index.css                  (Estilos Tailwind)
    ├── package.json
    ├── tailwind.config.js
    └── tsconfig.json

================================================================================
INSTALACIÓN Y CONFIGURACIÓN
================================================================================

1. CLONAR EL REPOSITORIO
-------------------------
git clone https://github.com/TU_USUARIO/proyecto-parcial-programacion4.git
cd proyecto-parcial-programacion4


2. CONFIGURAR BACKEND
---------------------
cd backend
python -m venv .venv

# Activar entorno virtual
# En Linux/Mac:
source .venv/bin/activate
# En Windows:
.venv\Scripts\activate

pip install -r requirements.txt


3. CONFIGURAR BASE DE DATOS POSTGRESQL
---------------------------------------
psql -U postgres -h localhost

# Dentro de psql:
CREATE DATABASE parcial_db;
\q


4. CONFIGURAR VARIABLES DE ENTORNO
-----------------------------------
Crear archivo .env dentro de backend/ con:

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/parcial_db


5. CONFIGURAR FRONTEND
----------------------
cd frontend
npm install

================================================================================
EJECUTAR LA APLICACIÓN
================================================================================

BACKEND:
--------
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload

Backend disponible en: http://localhost:8000
Documentación interactiva: http://localhost:8000/docs


FRONTEND:
---------
# En otra terminal
cd frontend
npm run dev

Frontend disponible en: http://localhost:5173

================================================================================
MODELOS Y RELACIONES
================================================================================

MODELOS IMPLEMENTADOS (5):

1. Categoria - Categorías de productos
   Campos: id, nombre, descripcion, stock_disponible

2. Ingrediente - Ingredientes con categoría padre
   Campos: id, nombre, descripcion, parent_id (FK a categoria)

3. Producto - Productos principales
   Campos: id, nombre, descripcion, es_alergeno

4. ProductoCategoria - Tabla intermedia N:N
   Campos: producto_id (FK), categoria_id (FK)

5. ProductoIngrediente - Tabla intermedia N:N
   Campos: producto_id (FK), ingrediente_id (FK)


RELACIONES:

1:N - Categoria → Ingrediente
      Una categoría tiene muchos ingredientes
      Campo: ingrediente.parent_id → categoria.id

N:N - Producto ↔ Categoria
      Tabla intermedia: ProductoCategoria
      Un producto tiene muchas categorías
      Una categoría tiene muchos productos

N:N - Producto ↔ Ingrediente
      Tabla intermedia: ProductoIngrediente
      Un producto tiene muchos ingredientes
      Un ingrediente está en muchos productos


CAMPOS DE AUDITORÍA (en todos los modelos):

- created_at: Fecha de creación (automática)
- updated_at: Fecha de última modificación (actualizable)
- deleted_at: Soft delete (NULL = activo, fecha = eliminado)

================================================================================
CARACTERÍSTICAS IMPLEMENTADAS
================================================================================

BACKEND:
✓ CRUD completo para 3 entidades principales
✓ Relaciones 1:N y N:N correctamente implementadas
✓ Soft delete en todos los modelos
✓ Validaciones con Pydantic (BaseModel)
✓ Paginación en endpoints GET (skip, limit)
✓ Manejo de errores con HTTPException
✓ Status codes HTTP correctos (200, 201, 204, 404, 400)
✓ CORS configurado para comunicación frontend-backend
✓ Documentación automática con Swagger UI
✓ Foreign keys y validaciones de integridad
✓ Lazy loading de relaciones forzado con session.refresh()

FRONTEND:
✓ Interfaz con React + TypeScript
✓ TanStack Query para estado del servidor y caché
✓ React Router DOM para navegación SPA
✓ CRUD completo en interfaz de usuario
✓ Modales para crear y editar registros
✓ Manejo de relaciones N:N con checkboxes múltiples
✓ Actualización automática de caché con invalidateQueries
✓ Estilos responsive con Tailwind CSS
✓ Type safety completo con interfaces TypeScript
✓ Validación de formularios
✓ Confirmación antes de eliminar

================================================================================
ENDPOINTS DE LA API
================================================================================

CATEGORÍAS:
GET    /api/categorias          - Listar categorías (paginado)
GET    /api/categorias/{id}     - Obtener categoría por ID
POST   /api/categorias          - Crear categoría
PUT    /api/categorias/{id}     - Actualizar categoría
DELETE /api/categorias/{id}     - Eliminar categoría (soft delete)

INGREDIENTES:
GET    /api/ingredientes        - Listar ingredientes (paginado)
GET    /api/ingredientes/{id}   - Obtener ingrediente por ID
POST   /api/ingredientes        - Crear ingrediente
PUT    /api/ingredientes/{id}   - Actualizar ingrediente
DELETE /api/ingredientes/{id}   - Eliminar ingrediente (soft delete)

PRODUCTOS:
GET    /api/productos           - Listar productos con relaciones
GET    /api/productos/{id}      - Obtener producto con relaciones
POST   /api/productos           - Crear producto con relaciones N:N
PUT    /api/productos/{id}      - Actualizar producto con relaciones
DELETE /api/productos/{id}      - Eliminar producto (soft delete)

Parámetros de paginación (GET):
- skip: int (default 0) - Registros a saltar
- limit: int (default 10, max 100) - Cantidad de registros

================================================================================
PROBLEMAS RESUELTOS DURANTE EL DESARROLLO
================================================================================

1. INCOMPATIBILIDAD TAILWIND CSS 4
Problema: Tailwind v4 beta incompatible con Vite 8
Solución: Instalación de Tailwind CSS 3.4.1 (versión estable)
Comando: npm install -D tailwindcss@3.4.1

2. LAZY LOADING EN SQLMODEL
Problema: Relaciones N:N no se cargaban automáticamente en respuestas API
Solución: Forzar carga con session.refresh(producto) y acceso explícito
          a propiedades (producto.categorias, producto.ingredientes)
Ubicación: backend/app/routers/productos.py

3. AUTENTICACIÓN POSTGRESQL
Problema: Error "Peer authentication failed" al conectar
Solución: Usar flag -h localhost y configurar contraseña
Comando: psql -U postgres -h localhost

4. BOTONES APILADOS EN TABLA
Problema: Botones Editar/Eliminar aparecían uno encima del otro
Solución: Agregar whitespace-nowrap y flex gap-2 en celda de acciones
Ubicación: ProductosTable.tsx

================================================================================
CONCEPTOS TÉCNICOS CLAVE
================================================================================

BACKEND:

- SQLModel: ORM que combina SQLAlchemy (base de datos) con Pydantic (validación)
- Relationship: Función que crea conexiones entre tablas sin SQL manual
- back_populates: Hace relaciones bidireccionales (navegación en ambos sentidos)
- Foreign Key: Campo que referencia ID de otra tabla (integridad referencial)
- Soft Delete: Marcar registro como eliminado sin borrarlo físicamente
- HTTPException: Clase FastAPI para devolver errores HTTP con códigos
- Annotated + Query: Validación de parámetros de URL con metadatos
- Status Codes: 200 (OK), 201 (Created), 204 (No Content), 404 (Not Found)

FRONTEND:

- TypeScript Interface: Define estructura y tipos de datos de objetos
- useQuery: Hook TanStack Query para peticiones GET y caché
- useMutation: Hook TanStack Query para POST/PUT/DELETE
- queryKey: Identificador único del caché (ej: ['productos'])
- queryFn: Función que hace la petición HTTP real
- invalidateQueries: Marca caché como desactualizado para refrescar
- React Router: Navegación SPA sin recargar página completa
- Tailwind Classes: Estilos con clases utility (bg-, px-, rounded-, etc)

================================================================================
FLUJO DE DATOS COMPLETO
================================================================================

CREAR PRODUCTO CON RELACIONES N:N:

1. FRONTEND:
   - Usuario marca checkboxes de categorías e ingredientes
   - Arrays categorias_ids e ingredientes_ids acumulan IDs seleccionados
   - Al enviar formulario, createMutation.mutate() envía POST

2. BACKEND:
   - Router productos.py recibe ProductoCreate (validado por Pydantic)
   - Crea objeto Producto con campos básicos
   - Itera sobre categorias_ids:
     * Busca cada categoría en BD
     * Crea registro en ProductoCategoria vinculando ambos IDs
   - Itera sobre ingredientes_ids:
     * Busca cada ingrediente en BD
     * Crea registro en ProductoIngrediente vinculando ambos IDs
   - session.commit() guarda todo en PostgreSQL
   - Devuelve ProductoWithRelations con relaciones cargadas

3. FRONTEND:
   - onSuccess() se ejecuta
   - invalidateQueries(['productos']) marca caché desactualizado
   - useQuery automáticamente hace GET /productos para datos frescos
   - Tabla se actualiza sin reload de página

================================================================================
NOTAS TÉCNICAS
================================================================================

- Las tablas se crean automáticamente al iniciar el backend mediante
  SQLModel.metadata.create_all(engine) en el lifespan de main.py

- El soft delete mantiene registros en BD con deleted_at != NULL
  Todas las queries filtran con .where(deleted_at == None)

- TanStack Query cachea datos en memoria usando queryKey como identificador
  invalidateQueries fuerza re-fetch automático tras mutaciones

- Relaciones N:N requieren tabla intermedia con dos foreign keys
  No se puede hacer N:N directo en bases de datos relacionales

- CORS permite que frontend (puerto 5173) haga peticiones a backend (puerto 8000)
  Sin CORS, el navegador bloquearía las peticiones por seguridad

- TypeScript detecta errores en tiempo de desarrollo antes de ejecutar
  Las interfaces validan estructura de datos en compilación

================================================================================
CONTACTO
================================================================================

Camila - Programación IV
Año 2026

================================================================================
PROYECTO FINAL - PROGRAMACIÓN IV
================================================================================
