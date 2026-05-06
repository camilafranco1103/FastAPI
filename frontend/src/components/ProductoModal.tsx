import type { Producto, Categoria, Ingrediente } from '../types'

type FormData = {
  nombre: string
  descripcion: string
  es_alergeno: boolean
  categorias_ids: number[]
  ingredientes_ids: number[]
}

type Props = {
  show: boolean
  editing: Producto | null
  formData: FormData
  categorias: Categoria[]
  ingredientes: Ingrediente[]
  onChange: (data: FormData) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

function ProductoModal({ show, editing, formData, categorias, ingredientes, onChange, onSubmit, onClose }: Props) {
  if (!show) return null

  const toggleCategoria = (id: number) => {
    onChange({
      ...formData,
      categorias_ids: formData.categorias_ids.includes(id)
        ? formData.categorias_ids.filter(cid => cid !== id)
        : [...formData.categorias_ids, id]
    })
  }

  const toggleIngrediente = (id: number) => {
    onChange({
      ...formData,
      ingredientes_ids: formData.ingredientes_ids.includes(id)
        ? formData.ingredientes_ids.filter(iid => iid !== id)
        : [...formData.ingredientes_ids, id]
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-slate-800 mb-5">
          {editing ? 'Editar producto' : 'Nuevo producto'}
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
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.es_alergeno}
              onChange={(e) => onChange({ ...formData, es_alergeno: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-slate-600">Es alérgeno</span>
          </label>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Categorías</label>
            <div className="border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
              {categorias.map(cat => (
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
              {ingredientes.map(ing => (
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

export default ProductoModal
