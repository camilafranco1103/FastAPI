import { Routes, Route } from 'react-router-dom'
import CategoriasPage from '../pages/CategoriasPage'
import IngredientesPage from '../pages/IngredientesPage'
import ProductosPage from '../pages/ProductosPage'
import ProductoDetallePage from '../pages/ProductoDetallePage'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={
        <div className="mt-12 text-center">
          <h1 className="text-3xl font-semibold text-slate-800">
            Sistema de gestión
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Administrá categorías, ingredientes y productos desde el menú superior.
          </p>
        </div>
      } />
      <Route path="/categorias" element={<CategoriasPage />} />
      <Route path="/ingredientes" element={<IngredientesPage />} />
      <Route path="/productos" element={<ProductosPage />} />
      <Route path="/productos/:id" element={<ProductoDetallePage />} />
    </Routes>
  )
}

export default AppRouter
