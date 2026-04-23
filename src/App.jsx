import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import FormularioLogin from './components/login/FormularioLogin'
import RutaProtegida from './components/rutas/Rutaprotegida'
import DashboardPaciente from './views/paciente/Dashboardpaciente'
import DashboardRecepcionista from './views/recepcionista/Dashboardrecepcionista'
import DashboardOdontologo from './views/odontologo/Dashboardodontologo'
import DashboardAdmin from './views/admin/Dashboardadmin'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<FormularioLogin />} />

        {/* Rutas protegidas por rol */}
        {/* rol_id 1 = administrador */}
        <Route path="/admin" element={
          <RutaProtegida rolesPermitidos={[1]}>
            <DashboardAdmin />
          </RutaProtegida>
        } />

        {/* rol_id 2 = odontologo */}
        <Route path="/odontologo" element={
          <RutaProtegida rolesPermitidos={[2]}>
            <DashboardOdontologo />
          </RutaProtegida>
        } />

        {/* rol_id 3 = recepcionista */}
        <Route path="/recepcionista" element={
          <RutaProtegida rolesPermitidos={[3]}>
            <DashboardRecepcionista />
          </RutaProtegida>
        } />

        {/* rol_id 4 = paciente */}
        <Route path="/paciente" element={
          <RutaProtegida rolesPermitidos={[4]}>
            <DashboardPaciente />
          </RutaProtegida>
        } />

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App