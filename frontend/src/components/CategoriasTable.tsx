import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../api/axios'

interface Categoria {
  id: number
  nombre: string
  descripcion: string
  stock_disponible: boolean
}

function CategoriasTable() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', stock_disponible: true })

  // useQuery - Obtener categorías
  const { data: categorias, isLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const response = await api.get('/categorias')
      return response.data as Categoria[]
    }
  })

  // useMutation - Crear
  const createMutation = useMutation({
    mutationFn: async (data: { nombre: string; descripcion: string; stock_disponible: boolean }) => {
      return await api.post('/categorias', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      setShowModal(false)
      setFormData({ nombre: '', descripcion: '', stock_disponible: true })
    }
  })

  // useMutation - Actualizar
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await api.put(`/categorias/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      setShowModal(false)
      setEditingCategoria(null)
      setFormData({ nombre: '', descripcion: '', stock_disponible: true })
    }
  })

  // useMutation - Eliminar
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await api.delete(`/categorias/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCategoria) {
      updateMutation.mutate({ id: editingCategoria.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria)
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      stock_disponible: categoria.stock_disponible
    })
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      deleteMutation.mutate(id)
    }
  }

  const openCreateModal = () => {
    setEditingCategoria(null)
    setFormData({ nombre: '', descripcion: '', stock_disponible: true })
    setShowModal(true)
  }

  if (isLoading) return <div>Cargando...</div>

  return (
    <div>
      {/* Botón Crear */}
      <button
        onClick={openCreateModal}
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        + Nueva Categoría
      </button>

      {/* Tabla */}
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">ID</th>
            <th className="px-4 py-2 border">Nombre</th>
            <th className="px-4 py-2 border">Descripción</th>
            <th className="px-4 py-2 border">Stock Disponible</th>
            <th className="px-4 py-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias?.map((cat) => (
            <tr key={cat.id}>
              <td className="px-4 py-2 border">{cat.id}</td>
              <td className="px-4 py-2 border">{cat.nombre}</td>
              <td className="px-4 py-2 border">{cat.descripcion}</td>
              <td className="px-4 py-2 border">{cat.stock_disponible ? 'Sí' : 'No'}</td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => handleEdit(cat)}
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">
              {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
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
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.stock_disponible}
                    onChange={(e) => setFormData({ ...formData, stock_disponible: e.target.checked })}
                    className="mr-2"
                  />
                  Stock Disponible
                </label>
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
                  {editingCategoria ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoriasTable