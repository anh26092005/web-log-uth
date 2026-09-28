import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import PublicPage from './pages/PublicPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'

function AdminRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <AdminDashboard /> : <AdminLogin />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicPage />} />
      <Route path="/admin" element={<AdminRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
