import { Link, useLocation } from 'react-router-dom'
import { Link, useLocation, Outlet } from 'react-router-dom'

import { 
  LayoutDashboard, 
  ShoppingCart, 
  Menu, 
  LogOut 
} from 'lucide-react'
import { logout } from '../utils/auth'

const AdminLayout = ({ children }) => {
  const location = useLocation()
  const admin = JSON.parse(localStorage.getItem('admin') || '{}')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Food Delivery Admin
            </h1>
            <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
              Online
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {admin.name}
            </span>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 p-2 rounded-lg hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r h-screen overflow-y-auto">
          <nav className="py-8">
            <ul className="space-y-2 px-4">
              <li>
                <Link 
                  to="/admin/dashboard"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    location.pathname === '/admin/dashboard'
                      ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/orders"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    location.pathname === '/admin/orders'
                      ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Orders</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/menu"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    location.pathname === '/admin/menu'
                      ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Menu className="w-5 h-5" />
                  <span>Menu</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout