import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../api/axios'

interface Ingrediente {
  id: number
  nombre: string
  descripcion: string
  parent_id: number | null
}

interface Categoria {
  id: number
  nombre: string
}

function IngredientesTable() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingIngrediente, setEditingIngrediente] = useState<Ingrediente | null>(null)
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', parent_id: '' })

  const { data: ingredientes, isLoading } = useQuery({
    queryKey: ['ingredientes'],
    queryFn: async () => {
      const response = await api.get('/ingredientes')
      return response.data as Ingrediente[]
    }
  })

  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const response = await api.get('/categorias')
      return response.data as Categoria[]
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/ingredientes', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] })
      setShowModal(false)
      setFormData({ nombre: '', descripcion: '', parent_id: '' })
    }
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
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await api.delete(`/ingredientes/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] })
    }
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

  if (isLoading) return <div>Cargando...</div>

  return (
    <div>
      <button
        onClick={openCreateModal}
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        + Nuevo Ingrediente
      </button>

      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">ID</th>
            <th className="px-4 py-2 border">Nombre</th>
            <th className="px-4 py-2 border">Descripción</th>
            <th className="px-4 py-2 border">Categoría</th>
            <th className="px-4 py-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ingredientes?.map((ing) => (
            <tr key={ing.id}>
              <td className="px-4 py-2 border">{ing.id}</td>
              <td className="px-4 py-2 border">{ing.nombre}</td>
              <td className="px-4 py-2 border">{ing.descripcion}</td>
              <td className="px-4 py-2 border">
                {categorias?.find(c => c.id === ing.parent_id)?.nombre || 'Sin categoría'}
              </td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => handleEdit(ing)}
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(ing.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">
              {editingIngrediente ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Nombre:</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Descripción:</label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Categoría:</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">Sin categoría</option>
                  {categorias?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  {editingIngrediente ? 'Actualizar' : 'Crear'}
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