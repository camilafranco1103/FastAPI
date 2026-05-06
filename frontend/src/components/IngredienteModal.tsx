import type { Ingrediente, Categoria } from '../types'

type FormData = {
  nombre: string
  descripcion: string
  parent_id: string
}

type Props = {
  show: boolean
  editing: Ingrediente | null
  formData: FormData
  categorias: Categoria[]
  onChange: (data: FormData) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

function IngredienteModal({ show, editing, formData, categorias, onChange, onSubmit, onClose }: Props) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-5">
          {editing ? 'Editar ingrediente' : 'Nuevo ingrediente'}
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => onChange({ ...formData, nombre: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Descripción</label>
            <input
              type="text"
              value={formData.descripcion}
              onChange={(e) => onChange({ ...formData, descripcion: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Categoría</label>
            <select
              value={formData.parent_id}
              onChange={(e) => onChange({ ...formData, parent_id: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            >
              <option value="">Sin categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              {editing ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default IngredienteModal
