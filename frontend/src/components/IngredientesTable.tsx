import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../api/axios'
import type { Ingrediente, Categoria } from '../models'

function IngredientesTable() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingIngrediente, setEditingIngrediente] = useState<Ingrediente | null>(null)
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', parent_id: '' })
  const [page, setPage] = useState(0)
  const limit = 10

  const { data: ingredientes, isLoading } = useQuery({
    queryKey: ['ingredientes', page],
    queryFn: async () => {
      const response = await api.get('/ingredientes', { params: { skip: page * limit, limit } })
      return response.data as Ingrediente[]
    }
  })

  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const response = await api.get('/categorias', { params: { limit: 100 } })
      return response.data as Categoria[]
    }
  })

  const handleError = (error: any) => {
    alert(error.response?.data?.detail || 'Ocurrió un error inesperado')
  }

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/ingredientes', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] })
      setShowModal(false)
      setFormData({ nombre: '', descripcion: '', parent_id: '' })
    },
    onError: handleError
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await api.put(`/ingredientes/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] })
      setShowModal(false)
      setEditingIngrediente(null)
      setFormData({ nombre: '', descripcion: '', parent_id: '' })
    },
    onError: handleError
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await api.delete(`/ingredientes/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] })
    },
    onError: handleError
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      parent_id: formData.parent_id ? parseInt(formData.parent_id) : null
    }
    if (editingIngrediente) {
      updateMutation.mutate({ id: editingIngrediente.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (ingrediente: Ingrediente) => {
    setEditingIngrediente(ingrediente)
    setFormData({
      nombre: ingrediente.nombre,
      descripcion: ingrediente.descripcion,
      parent_id: ingrediente.parent_id?.toString() || ''
    })
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este ingrediente?')) {
      deleteMutation.mutate(id)
    }
  }

  const openCreateModal = () => {
    setEditingIngrediente(null)
    setFormData({ nombre: '', descripcion: '', parent_id: '' })
    setShowModal(true)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
      Cargando...
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-slate-800">Ingredientes</h2>
        <button
          onClick={openCreateModal}
          className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo ingrediente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['ID', 'Nombre', 'Descripción', 'Categoría', 'Acciones'].map(col => (
                <th key={col} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ingredientes?.map((ing) => (
              <tr key={ing.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-sm text-gray-400">{ing.id}</td>
                <td className="px-5 py-3 text-sm font-medium text-slate-700">{ing.nombre}</td>
                <td className="px-5 py-3 text-sm text-slate-500">{ing.descripcion || '—'}</td>
                <td className="px-5 py-3 text-sm text-slate-500">
                  {categorias?.find(c => c.id === ing.parent_id)?.nombre || (
                    <span className="text-gray-300">Sin categoría</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(ing)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(ing.id)}
                      className="text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {ingredientes?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                  No hay ingredientes registrados.
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
            disabled={(ingredientes?.length ?? 0) < limit}
            className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-5">
              {editingIngrediente ? 'Editar ingrediente' : 'Nuevo ingrediente'}
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
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Categoría</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                >
                  <option value="">Sin categoría</option>
                  {categorias?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
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
                  {editingIngrediente ? 'Guardar cambios' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default IngredientesTable
