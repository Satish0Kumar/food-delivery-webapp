import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]) // [{ _id, name, price, image, category, quantity }]
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // ── Add item or increment qty if already in cart
  const addToCart = useCallback((item) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i._id === item._id)
      if (exists) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    setIsDrawerOpen(true) // auto-open drawer on add
  }, [])

  // ── Increment qty
  const increment = useCallback((id) => {
    setCartItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, quantity: i.quantity + 1 } : i))
    )
  }, [])

  // ── Decrement qty — remove item if qty reaches 0
  const decrement = useCallback((id) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i._id === id)
      if (!item) return prev
      if (item.quantity === 1) return prev.filter((i) => i._id !== id)
      return prev.map((i) => (i._id === id ? { ...i, quantity: i.quantity - 1 } : i))
    })
  }, [])

  // ── Remove item entirely
  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => prev.filter((i) => i._id !== id))
  }, [])

  // ── Clear entire cart (called after order placed)
  const clearCart = useCallback(() => {
    setCartItems([])
    setIsDrawerOpen(false)
  }, [])

  // ── Derived values
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const totalAmount = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isDrawerOpen,
        setIsDrawerOpen,
        addToCart,
        increment,
        decrement,
        removeFromCart,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Custom hook — use this in any component
export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
