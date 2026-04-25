import { Routes, Route, Link } from 'react-router-dom'
import CategoriasPage from './pages/CategoriasPage'
import IngredientesPage from './pages/IngredientesPage'
import ProductosPage from './pages/ProductosPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link to="/" className="flex items-center text-gray-700 hover:text-gray-900">
                Inicio
              </Link>
              <Link to="/categorias" className="flex items-center text-gray-700 hover:text-gray-900">
                Categorías
              </Link>
              <Link to="/ingredientes" className="flex items-center text-gray-700 hover:text-gray-900">
                Ingredientes
              </Link>
              <Link to="/productos" className="flex items-center text-gray-700 hover:text-gray-900">
                Productos
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                 Parcial Programación IV
              </h1>
              
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