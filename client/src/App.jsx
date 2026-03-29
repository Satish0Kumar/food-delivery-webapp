import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<div className="text-2xl font-bold">Dashboard</div>} />
          <Route path="orders" element={<div className="text-2xl font-bold">Orders</div>} />
          <Route path="menu" element={<div className="text-2xl font-bold">Menu</div>} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center">Page Not Found</div>} />
      </Routes>
    </Router>
  )
}

export default App