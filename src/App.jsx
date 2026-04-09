import { supabase } from './database/supabaseconfig'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    supabase.from('roles').select('*').then(({ data, error }) => {
      if (error) console.error('Error:', error)
      else console.log('Conexión exitosa:', data)
    })
  }, [])

  return <h1>Amerrisque Dental</h1>
}

export default App