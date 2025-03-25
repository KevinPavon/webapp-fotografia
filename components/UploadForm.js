// components/UploadForm.js

import { useDropzone } from 'react-dropzone'
import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export default function UploadForm({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true)
    setMessage(null)

    for (const file of acceptedFiles) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${fileName}`

      // 1. Subir al bucket "fotos"
      const { error: uploadError } = await supabase.storage
        .from('fotos')
        .upload(filePath, file)

      if (uploadError) {
        setMessage(`Error al subir ${file.name}: ${uploadError.message}`)
        console.error(uploadError)
        setUploading(false)
        return
      }

      // 2. Obtener URL pública
      const { data } = supabase.storage.from('fotos').getPublicUrl(filePath)
      const publicUrl = data.publicUrl

      // 3. Guardar en base de datos
      const { error: dbError } = await supabase
        .from('fotos')
        .insert([{ nombre: file.name, url: publicUrl }])

      if (dbError) {
        setMessage(`Subida fallida en base de datos: ${dbError.message}`)
        console.error(dbError)
        setUploading(false)
        return
      }

      setMessage(`Imagen "${file.name}" subida correctamente ✅`)

      // 4. Llamar a la función del padre si existe
      if (onUploadSuccess) {
        onUploadSuccess()
      }
    }

    setUploading(false)
  }, [onUploadSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div className="mt-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-10 text-center rounded ${
            isDragActive ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'
          }`}          
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Soltá la imagen aquí...</p>
        ) : (
          <p>Arrastrá una imagen aquí o hacé clic para subir</p>
        )}
      </div>

      {uploading && <p className="mt-4 text-blue-500">Subiendo imagen...</p>}
      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  )
}
