import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../api/axios'
import type { Producto, Categoria, Ingrediente } from '../models'

function ProductosTable() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    es_alergeno: false,
    categorias_ids: [] as number[],
    ingredientes_ids: [] as number[]
  })
  const [page, setPage] = useState(0)
  const limit = 10

  const { data: productos, isLoading } = useQuery({
    queryKey: ['productos', page],
    queryFn: async () => {
      const response = await api.get('/productos', { params: { skip: page * limit, limit } })
      return response.data as Producto[]
    }
  })

  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const response = await api.get('/categorias', { params: { limit: 100 } })
      return response.data as Categoria[]
    }
  })

  const { data: ingredientes } = useQuery({
    queryKey: ['ingredientes'],
    queryFn: async () => {
      const response = await api.get('/ingredientes', { params: { limit: 100 } })
      return response.data as Ingrediente[]
    }
  })

  const handleError = (error: any) => {
    alert(error.response?.data?.detail || 'Ocurrió un error inesperado')
  }

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/productos', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      setShowModal(false)
      setFormData({ nombre: '', descripcion: '', es_alergeno: false, categorias_ids: [], ingredientes_ids: [] })
    },
    onError: handleError
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await api.put(`/productos/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      setShowModal(false)
      setEditingProducto(null)
      setFormData({ nombre: '', descripcion: '', es_alergeno: false, categorias_ids: [], ingredientes_ids: [] })
    },
    onError: handleError
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await api.delete(`/productos/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
    onError: handleError
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingProducto) {
      updateMutation.mutate({ id: editingProducto.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto)
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      es_alergeno: producto.es_alergeno,
      categorias_ids: producto.categorias.map(c => c.id),
      ingredientes_ids: producto.ingredientes.map(i => i.id)
    })
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      deleteMutation.mutate(id)
    }
  }

  const openCreateModal = () => {
    setEditingProducto(null)
    setFormData({ nombre: '', descripcion: '', es_alergeno: false, categorias_ids: [], ingredientes_ids: [] })
    setShowModal(true)
  }

  const toggleCategoria = (id: number) => {
    setFormData(prev => ({
      ...prev,
      categorias_ids: prev.categorias_ids.includes(id)
        ? prev.categorias_ids.filter(cid => cid !== id)
        : [...prev.categorias_ids, id]
    }))
  }

  const toggleIngrediente = (id: number) => {
    setFormData(prev => ({
      ...prev,
      ingredientes_ids: prev.ingredientes_ids.includes(id)
        ? prev.ingredientes_ids.filter(iid => iid !== id)
        : [...prev.ingredientes_ids, id]
    }))
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
      Cargando...
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-slate-800">Productos</h2>
        <button
          onClick={openCreateModal}
          className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo producto
        </button>
      </div>

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
            {productos?.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-sm text-gray-400">{prod.id}</td>
                <td className="px-5 py-3 text-sm font-medium text-slate-700">{prod.nombre}</td>
                <td className="px-5 py-3 text-sm text-slate-500">{prod.descripcion || '—'}</td>
                <td className="px-5 py-3">
                  {prod.es_alergeno ? (
                    <span className="inline-flex text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                      Sí
                    </span>
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
                      onClick={() => handleEdit(prod)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id)}
                      className="text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {productos?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                  No hay productos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación fija */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 py-3 flex items-center justify-between z-40">
        <span className="text-sm text-gray-400">Página {page + 1}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 0}
            className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={(productos?.length ?? 0) < limit}
            className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-800 mb-5">
              {editingProducto ? 'Editar producto' : 'Nuevo producto'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Descripción</label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.es_alergeno}
                  onChange={(e) => setFormData({ ...formData, es_alergeno: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-slate-600">Es alérgeno</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Categorías</label>
                <div className="border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
                  {categorias?.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.categorias_ids.includes(cat.id)}
                        onChange={() => toggleCategoria(cat.id)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-slate-600">{cat.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Ingredientes</label>
                <div className="border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
                  {ingredientes?.map(ing => (
                    <label key={ing.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.ingredientes_ids.includes(ing.id)}
                        onChange={() => toggleIngrediente(ing.id)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-slate-600">{ing.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  {editingProducto ? 'Guardar cambios' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductosTable
