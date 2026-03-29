import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Admin */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<div className="text-2xl font-bold text-gray-900">Dashboard</div>} />
                  <Route path="orders" element={<div className="text-2xl font-bold text-gray-900">Orders</div>} />
                  <Route path="menu" element={<div className="text-2xl font-bold text-gray-900">Menu</div>} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-xl">Page Not Found</div>} />
      </Routes>
    </Router>
  )
}

export default App