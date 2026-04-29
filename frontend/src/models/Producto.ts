export interface Producto {
  id: number
  nombre: string
  descripcion: string
  es_alergeno: boolean
  categorias: { id: number; nombre: string }[]
  ingredientes: { id: number; nombre: string }[]
}
