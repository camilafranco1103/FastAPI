import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import CategoriasPage from './pages/CategoriasPage'
import IngredientesPage from './pages/IngredientesPage'
import ProductosPage from './pages/ProductosPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 pb-24">
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
        </Routes>
      </div>
    </div>
  )
}

export default App
