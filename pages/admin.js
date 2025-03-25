// pages/admin.js
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import useUser from '../lib/useUser'
import { useEffect } from 'react'
import UploadForm from '../components/UploadForm'
import AdminGallery from '../components/AdminGallery'


// ...dentro del return



export default function Admin() {
  const router = useRouter()
  const { user, loading } = useUser()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <p>Cargando...</p>
  if (!user) return null

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Panel del Fotógrafo</h1>
      <p className="mb-2">Sesión iniciada como: {user.email}</p>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Cerrar sesión
      </button>     
      <UploadForm />
      <AdminGallery />
    </div>
  )
}
