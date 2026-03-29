import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Menu from './pages/Menu'
import Home from './pages/Home'
import MenuPage from './pages/MenuPage'

function App() {
  return (
    <Router>
      <Routes>

        {/* ── Customer Public Routes ── */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<MenuPage />} />

        {/* ── Admin Auth ── */}
        <Route path="/login" element={<Login />} />

        {/* ── Protected Admin Routes ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="menu" element={<Menu />} />
        </Route>

        {/* ── 404 ── */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">
              Page Not Found
            </div>
          }
        />

      </Routes>
    </Router>
  )
}

export default App
