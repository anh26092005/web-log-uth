import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_auth') === 'true'
  })

  const login = (password) => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || '26092005@'
    if (password === adminPassword) {
      sessionStorage.setItem('admin_auth', 'true')
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    sessionStorage.removeItem('admin_auth')
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
