import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'

const CATEGORIES = ['Starters', 'Main Course', 'Breads', 'Rice', 'Desserts', 'Beverages']
const MAX_FILE_SIZE_MB = 5

const defaultForm = {
  name: '',
  description: '',
  price: '',
  category: 'Starters',
  isAvailable: true,
  image: ''
}

const Menu = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [filterCategory, setFilterCategory] = useState('All')
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  const fetchMenu = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/items', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setItems(data.data)
    } catch {
      setError('Failed to fetch menu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMenu() }, [])

  const openAdd = () => {
    setEditItem(null)
    setForm(defaultForm)
    setError('')
    setShowForm(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable,
      image: item.image || ''
    })
    setError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditItem(null)
    setForm(defaultForm)
    setError('')
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Phase 7 Step 9 — file size validation (5 MB cap)
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image too large. Please choose a file under ${MAX_FILE_SIZE_MB}MB. Tip: compress at squoosh.app before uploading.`)
      e.target.value = ''
      return
    }

    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setForm(prev => ({ ...prev, image: data.url }))
      } else {
        setError('Image upload failed. Try again.')
      }
    } catch {
      setError('Image upload failed. Check your connection.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editItem ? `/api/items/${editItem._id}` : '/api/items'
      const method = editItem ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          image: form.image || 'https://placehold.co/300x200/FFF3E0/E65100?text=Food'
        })
      })
      const data = await res.json()
      if (data.success) {
        await fetchMenu()
        closeForm()
      } else {
        setError(data.message || 'Save failed')
      }
    } catch {
      setError('Something went wrong. Check your connection.')
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this menu item?')) return
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setItems(prev => prev.filter(i => i._id !== id))
      else alert('Delete failed: ' + (data.message || 'Unknown error'))
    } catch {
      alert('Delete failed. Check your connection.')
    }
  }

  const toggleAvailability = async (item) => {
    try {
      const res = await fetch(`/api/items/${item._id}/availability`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setItems(prev =>
          prev.map(i => i._id === item._id ? { ...i, isAvailable: !i.isAvailable } : i)
        )
      }
    } catch {
      alert('Toggle failed. Try again.')
    }
  }

  const filtered = filterCategory === 'All'
    ? items
    : items.filter(i => i.category === filterCategory)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading menu...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Menu</h2>
          <p className="text-gray-600 mt-1">{items.length} items</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 flex-wrap gap-2">
        {['All', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border min-h-[44px] ${
              filterCategory === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-start space-x-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <div
            key={item._id}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
              item.isAvailable ? 'border-gray-100' : 'border-red-100 opacity-70'
            }`}
          >
            {/* Image */}
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="w-full h-40 object-cover"
                onError={(e) => { e.target.src = 'https://placehold.co/300x160/FFF3E0/E65100?text=Food' }}
              />
            )}

            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900">₹{item.price}</p>
              </div>

              {item.description && (
                <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                {/* Availability Toggle */}
                <button
                  onClick={() => toggleAvailability(item)}
                  className={`flex items-center space-x-1 text-xs font-medium px-3 py-2 rounded-lg transition-all min-h-[44px] ${
                    item.isAvailable
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {item.isAvailable
                    ? <><Check className="w-3 h-3" /><span>Available</span></>
                    : <><X className="w-3 h-3" /><span>Sold Out</span></>
                  }
                </button>

                {/* Edit / Delete */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEdit(item)}
                    aria-label="Edit item"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteItem(item._id)}
                    aria-label="Delete item"
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {editItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <button
                onClick={closeForm}
                aria-label="Close form"
                className="text-gray-400 hover:text-gray-600 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Error inside modal */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start space-x-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Paneer Butter Masala"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[48px]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Price + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="199"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[48px]"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload — Phase 7 Step 9: size check + compress hint */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Image
                </label>

                {/* Preview */}
                {form.image && (
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-full h-36 object-cover rounded-xl mb-2 border border-gray-200"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                )}

                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleImageUpload}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {uploading && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                    <p className="text-xs text-blue-600">Uploading to Cloudinary...</p>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG, WebP — max 5MB.{' '}
                  <a
                    href="https://squoosh.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    Compress here
                  </a>{' '}before uploading for faster load.
                </p>
              </div>

              {/* Availability */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={form.isAvailable}
                  onChange={e => setForm({ ...form, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                  Available for ordering
                </label>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-all font-medium min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all font-medium disabled:opacity-50 min-h-[48px]"
                >
                  {saving ? 'Saving...' : uploading ? 'Uploading...' : editItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Menu
