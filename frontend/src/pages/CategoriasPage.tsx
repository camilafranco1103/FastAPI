import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import type { Categoria } from '../types'
import CategoriasTable from '../components/CategoriasTable'
import CategoriaModal from '../components/CategoriaModal'

type FormData = {
  nombre: string
  descripcion: string
  stock_disponible: boolean
}

const EMPTY_FORM: FormData = { nombre: '', descripcion: '', stock_disponible: true }
const LIMIT = 10

function CategoriasPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)
  const [page, setPage] = useState(0)

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias', page],
    queryFn: async () => {
      const res = await api.get('/categorias', { params: { skip: page * LIMIT, limit: LIMIT } })
      return res.data as Categoria[]
    }
  })

  const handleError = (error: any) => {
    alert(error.response?.data?.detail || 'Ocurrió un error inesperado')
  }

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/categorias', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      setShowModal(false)
      setFormData(EMPTY_FORM)
    },
    onError: handleError
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => api.put(`/categorias/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      setShowModal(false)
      setEditing(null)
      setFormData(EMPTY_FORM)
    },
    onError: handleError
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/categorias/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categorias'] }),
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

  const handleEdit = (categoria: Categoria) => {
    setEditing(categoria)
    setFormData({ nombre: categoria.nombre, descripcion: categoria.descripcion, stock_disponible: categoria.stock_disponible })
    setShowModal(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
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
        <h2 className="text-xl font-semibold text-slate-800">Categorías</h2>
        <button
          onClick={openCreateModal}
          className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nueva categoría
        </button>
      </div>

      <CategoriasTable
        categorias={categorias}
        page={page}
        limit={LIMIT}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onNextPage={() => setPage(p => p + 1)}
        onPrevPage={() => setPage(p => p - 1)}
      />

      <CategoriaModal
        show={showModal}
        editing={editing}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}

export default CategoriasPage
