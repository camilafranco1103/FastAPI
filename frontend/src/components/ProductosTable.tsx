import { useNavigate } from 'react-router-dom'
import type { Producto } from '../types'

type Props = {
  productos: Producto[]
  page: number
  limit: number
  onEdit: (producto: Producto) => void
  onDelete: (id: number) => void
  onNextPage: () => void
  onPrevPage: () => void
}

function ProductosTable({ productos, page, limit, onEdit, onDelete, onNextPage, onPrevPage }: Props) {
  const navigate = useNavigate()

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['ID', 'Nombre', 'Descripción', 'Alérgeno', 'Categorías', 'Ingredientes', 'Acciones'].map(col => (
                <th key={col} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {productos.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-sm text-gray-400">{prod.id}</td>
                <td className="px-5 py-3 text-sm font-medium text-slate-700">{prod.nombre}</td>
                <td className="px-5 py-3 text-sm text-slate-500">{prod.descripcion || '—'}</td>
                <td className="px-5 py-3">
                  {prod.es_alergeno ? (
                    <span className="inline-flex text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Sí</span>
                  ) : (
                    <span className="text-sm text-gray-300">No</span>
                  )}
                </td>
                <td className="px-5 py-3 text-sm text-slate-500">
                  {prod.categorias.length > 0
                    ? prod.categorias.map(c => c.nombre).join(', ')
                    : <span className="text-gray-300">—</span>
                  }
                </td>
                <td className="px-5 py-3 text-sm text-slate-500">
                  {prod.ingredientes.length > 0
                    ? prod.ingredientes.map(i => i.nombre).join(', ')
                    : <span className="text-gray-300">—</span>
                  }
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/productos/${prod.id}`)}
                      className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => onEdit(prod)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(prod.id)}
                      className="text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                  No hay productos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 py-3 flex items-center justify-between z-40">
        <span className="text-sm text-gray-400">Página {page + 1}</span>
        <div className="flex gap-2">
          <button
            onClick={onPrevPage}
            disabled={page === 0}
            className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <button
            onClick={onNextPage}
            disabled={productos.length < limit}
            className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductosTable
