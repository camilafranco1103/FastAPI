import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import type { Ingrediente, Categoria } from '../types'
import IngredientesTable from '../components/IngredientesTable'
import IngredienteModal from '../components/IngredienteModal'

type FormData = {
  nombre: string
  descripcion: string
  parent_id: string
}

const EMPTY_FORM: FormData = { nombre: '', descripcion: '', parent_id: '' }
const LIMIT = 10

function IngredientesPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Ingrediente | null>(null)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)
  const [page, setPage] = useState(0)

  const { data: ingredientes = [], isLoading } = useQuery({
    queryKey: ['ingredientes', page],
    queryFn: async () => {
      const res = await api.get('/ingredientes', { params: { skip: page * LIMIT, limit: LIMIT } })
      return res.data as Ingrediente[]
    }
  })

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const res = await api.get('/categorias', { params: { limit: 100 } })
      return res.data as Categoria[]
    }
  })

  const handleError = (error: any) => {
    alert(error.response?.data?.detail || 'Ocurrió un error inesperado')
  }

  const buildPayload = (data: FormData) => ({
    nombre: data.nombre,
    descripcion: data.descripcion,
    parent_id: data.parent_id ? parseInt(data.parent_id) : null
  })

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/ingredientes', buildPayload(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] })
      setShowModal(false)
      setFormData(EMPTY_FORM)
    },
    onError: handleError
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => api.put(`/ingredientes/${id}`, buildPayload(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] })
      setShowModal(false)
      setEditing(null)
      setFormData(EMPTY_FORM)
    },
    onError: handleError
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/ingredientes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredientes'] }),
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

  const handleEdit = (ingrediente: Ingrediente) => {
    setEditing(ingrediente)
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
        <h2 className="text-xl font-semibold text-slate-800">Ingredientes</h2>
        <button
          onClick={openCreateModal}
          className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo ingrediente
        </button>
      </div>

      <IngredientesTable
        ingredientes={ingredientes}
        categorias={categorias}
        page={page}
        limit={LIMIT}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onNextPage={() => setPage(p => p + 1)}
        onPrevPage={() => setPage(p => p - 1)}
      />

      <IngredienteModal
        show={showModal}
        editing={editing}
        formData={formData}
        categorias={categorias}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}

export default IngredientesPage
