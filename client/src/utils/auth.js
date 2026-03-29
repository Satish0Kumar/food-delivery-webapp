export const isLoggedIn = () => {
  return !!localStorage.getItem('token')
}

export const getAdmin = () => {
  const admin = localStorage.getItem('admin')
  return admin ? JSON.parse(admin) : null
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('admin')
  window.location.href = '/login'
}