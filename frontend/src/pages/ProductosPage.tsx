import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import type { Producto, Categoria, Ingrediente } from '../types'
import ProductosTable from '../components/ProductosTable'
import ProductoModal from '../components/ProductoModal'

type FormData = {
  nombre: string
  descripcion: string
  es_alergeno: boolean
  categorias_ids: number[]
  ingredientes_ids: number[]
}

const EMPTY_FORM: FormData = {
  nombre: '',
  descripcion: '',
  es_alergeno: false,
  categorias_ids: [],
  ingredientes_ids: []
}
const LIMIT = 10

function ProductosPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)
  const [page, setPage] = useState(0)

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['productos', page],
    queryFn: async () => {
      const res = await api.get('/productos', { params: { skip: page * LIMIT, limit: LIMIT } })
      return res.data as Producto[]
    }
  })

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const res = await api.get('/categorias', { params: { limit: 100 } })
      return res.data as Categoria[]
    }
  })

  const { data: ingredientes = [] } = useQuery({
    queryKey: ['ingredientes'],
    queryFn: async () => {
      const res = await api.get('/ingredientes', { params: { limit: 100 } })
      return res.data as Ingrediente[]
    }
  })

  const handleError = (error: any) => {
    alert(error.response?.data?.detail || 'Ocurrió un error inesperado')
  }

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/productos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      setShowModal(false)
      setFormData(EMPTY_FORM)
    },
    onError: handleError
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => api.put(`/productos/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      setShowModal(false)
      setEditing(null)
      setFormData(EMPTY_FORM)
    },
    onError: handleError
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/productos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
    onError: handleError
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (producto: Producto) => {
    setEditing(producto)
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
    setEditing(null)
    setFormData(EMPTY_FORM)
    setShowModal(true)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-20 text-slate-400 text-sm">Cargando...</div>
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

      <ProductosTable
        productos={productos}
        page={page}
        limit={LIMIT}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onNextPage={() => setPage(p => p + 1)}
        onPrevPage={() => setPage(p => p - 1)}
      />

      <ProductoModal
        show={showModal}
        editing={editing}
        formData={formData}
        categorias={categorias}
        ingredientes={ingredientes}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}

export default ProductosPage
