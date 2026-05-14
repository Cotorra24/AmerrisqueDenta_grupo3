import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import RutaProtegida from './components/rutas/Rutaprotegida'
import FormularioLogin from './components/login/Formulariologin'
import DashboardAdmin from './views/admin/Dashboardadmin'
import DashboardOdontologo from './views/odontologo/Dashboardodontologo'
import DashboardRecepcionista from './views/recepcionista/Dashboardrecepcionista'
import DashboardPaciente from './views/paciente/Dashboardpaciente'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<FormularioLogin />} />

        {/* Rutas protegidas por rol (IDs del SQL: 1=admin, 2=doctor, 3=recep, 4=paciente) */}
        <Route 
          path="/admin/*" 
          element={
            <RutaProtegida rolesPermitidos={[1]}>
              <DashboardAdmin />
            </RutaProtegida>
          } 
        />
        
        <Route 
          path="/odontologo/*" 
          element={
            <RutaProtegida rolesPermitidos={[2]}>
              <DashboardOdontologo />
            </RutaProtegida>
          } 
        />

        <Route 
          path="/recepcionista/*" 
          element={
            <RutaProtegida rolesPermitidos={[3]}>
              <DashboardRecepcionista />
            </RutaProtegida>
          } 
        />

        <Route 
          path="/paciente/*" 
          element={
            <RutaProtegida rolesPermitidos={[4]}>
              <DashboardPaciente />
            </RutaProtegida>
          } 
        />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App