import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function test() {
    console.log('--- DIAGNÓSTICO DE CONEXIÓN ---')
    console.log('URL:', process.env.VITE_SUPABASE_URL)
    
    // 1. Probar conexión básica
    const { data: tables, error } = await supabase.from('profiles').select('*').limit(1)
    
    if (error) {
        console.log('❌ ERROR AL LEER PROFILES:', error.message)
        console.log('Código de error:', error.code)
        console.log('Sugerencia:', error.hint)
    } else {
        console.log('✅ TABLA PROFILES ENCONTRADA!')
    }

    // 2. Probar si existen otras tablas
    const { error: errorCitas } = await supabase.from('appointments').select('*').limit(1)
    if (errorCitas) console.log('❌ ERROR AL LEER APPOINTMENTS:', errorCitas.message)
    else console.log('✅ TABLA APPOINTMENTS ENCONTRADA!')
}

test()
