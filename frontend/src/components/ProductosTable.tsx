import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../api/axios'

interface Producto {
  id: number
  nombre: string
  descripcion: string
  es_alergeno: boolean
  categorias: { id: number; nombre: string }[]
  ingredientes: { id: number; nombre: string }[]
}

interface Categoria {
  id: number
  nombre: string
}

interface Ingrediente {
  id: number
  nombre: string
}

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

  const { data: productos, isLoading } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const response = await api.get('/productos')
      return response.data as Producto[]
    }
  })

  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const response = await api.get('/categorias')
      return response.data as Categoria[]
    }
  })

  const { data: ingredientes } = useQuery({
    queryKey: ['ingredientes'],
    queryFn: async () => {
      const response = await api.get('/ingredientes')
      return response.data as Ingrediente[]
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/productos', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      setShowModal(false)
      setFormData({ nombre: '', descripcion: '', es_alergeno: false, categorias_ids: [], ingredientes_ids: [] })
    }
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
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await api.delete(`/productos/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    }
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

  if (isLoading) return <div>Cargando...</div>

  return (
    <div>
      <button
        onClick={openCreateModal}
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        + Nuevo Producto
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Nombre</th>
              <th className="px-4 py-2 border">Descripción</th>
              <th className="px-4 py-2 border">Alérgeno</th>
              <th className="px-4 py-2 border">Categorías</th>
              <th className="px-4 py-2 border">Ingredientes</th>
              <th className="px-4 py-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos?.map((prod) => (
              <tr key={prod.id}>
                <td className="px-4 py-2 border">{prod.id}</td>
                <td className="px-4 py-2 border">{prod.nombre}</td>
                <td className="px-4 py-2 border">{prod.descripcion}</td>
                <td className="px-4 py-2 border">{prod.es_alergeno ? 'Sí' : 'No'}</td>
                <td className="px-4 py-2 border">
                  {prod.categorias.map(c => c.nombre).join(', ') || 'Sin categorías'}
                </td>
                <td className="px-4 py-2 border">
                  {prod.ingredientes.map(i => i.nombre).join(', ') || 'Sin ingredientes'}
                </td>
                <td className="px-4 py-2 border whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(prod)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white p-6 rounded-lg w-[600px] my-8">
            <h3 className="text-xl font-bold mb-4">
              {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
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
                    checked={formData.es_alergeno}
                    onChange={(e) => setFormData({ ...formData, es_alergeno: e.target.checked })}
                    className="mr-2"
                  />
                  Es Alérgeno
                </label>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 font-semibold">Categorías:</label>
                <div className="border p-3 rounded max-h-32 overflow-y-auto">
                  {categorias?.map(cat => (
                    <label key={cat.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={formData.categorias_ids.includes(cat.id)}
                        onChange={() => toggleCategoria(cat.id)}
                        className="mr-2"
                      />
                      {cat.nombre}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-semibold">Ingredientes:</label>
                <div className="border p-3 rounded max-h-32 overflow-y-auto">
                  {ingredientes?.map(ing => (
                    <label key={ing.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={formData.ingredientes_ids.includes(ing.id)}
                        onChange={() => toggleIngrediente(ing.id)}
                        className="mr-2"
                      />
                      {ing.nombre}
                    </label>
                  ))}
                </div>
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
                  {editingProducto ? 'Actualizar' : 'Crear'}
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