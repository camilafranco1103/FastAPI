import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import type { Producto } from '../types'

function ProductoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: producto, isLoading, isError } = useQuery({
    queryKey: ['producto', id],
    queryFn: async () => {
      const res = await api.get(`/productos/${id}`)
      return res.data as Producto
    },
    enabled: !!id
  })

  if (isLoading) return (
    <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
      Cargando...
    </div>
  )

  if (isError || !producto) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="text-rose-500 text-sm">No se pudo cargar el producto.</p>
      <button
        onClick={() => navigate('/productos')}
        className="text-sm text-slate-600 underline"
      >
        Volver al listado
      </button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/productos')}
        className="mb-6 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
      >
        ← Volver al listado
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">{producto.nombre}</h1>
            <p className="mt-1 text-sm text-slate-500">{producto.descripcion || 'Sin descripción'}</p>
          </div>
          {producto.es_alergeno && (
            <span className="inline-flex text-xs font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-700">
              Alérgeno
            </span>
          )}
        </div>

        <div className="border-t border-gray-100 pt-6 space-y-5">
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Categorías
            </h2>
            {producto.categorias.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {producto.categorias.map(cat => (
                  <span
                    key={cat.id}
                    className="inline-flex text-sm px-3 py-1 rounded-full bg-slate-100 text-slate-700"
                  >
                    {cat.nombre}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-300">Sin categorías asignadas</p>
            )}
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Ingredientes
            </h2>
            {producto.ingredientes.length > 0 ? (
              <ul className="space-y-1">
                {producto.ingredientes.map(ing => (
                  <li key={ing.id} className="text-sm text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                    {ing.nombre}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-300">Sin ingredientes asignados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductoDetallePage
