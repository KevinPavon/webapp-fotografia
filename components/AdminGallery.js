import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminGallery() {
  const [fotos, setFotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFotos()
  }, [])

  const fetchFotos = async () => {
    const { data, error } = await supabase
      .from('fotos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener fotos:', error)
    } else {
      setFotos(data)
    }
    setLoading(false)
  }

  const handleDelete = async (foto) => {
    if (!confirm(`¿Eliminar "${foto.nombre}"?`)) return

    // 1. Eliminar archivo del bucket
    const fileName = foto.url.split('/').pop()
    const { error: storageError } = await supabase.storage
      .from('fotos')
      .remove([fileName])

    if (storageError) {
      console.error('Error al eliminar de storage:', storageError)
      return
    }

    // 2. Eliminar de la base de datos
    const { error: dbError } = await supabase
      .from('fotos')
      .delete()
      .eq('id', foto.id)

    if (dbError) {
      console.error('Error al eliminar de base de datos:', dbError)
      return
    }

    // 3. Actualizar lista local
    setFotos((prev) => prev.filter((f) => f.id !== foto.id))
  }

  if (loading) return <p className="mt-6">Cargando imágenes...</p>
  if (fotos.length === 0) return <p className="mt-6">Aún no hay imágenes subidas.</p>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
      {fotos.map((foto) => (
        <div key={foto.id} className="rounded shadow p-2 bg-white relative">
          <img
            src={foto.url}
            alt={foto.nombre}
            className="w-full h-60 object-cover rounded"
          />
          <p className="mt-2 text-sm text-gray-600 truncate">{foto.nombre}</p>
          <button
            onClick={() => handleDelete(foto)}
            className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      ))}
    </div>
  )
}
