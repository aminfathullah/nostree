import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import LoginPage from './pages/Login'
import AdminPage from './pages/Admin'
import UserProfilePage from './pages/UserProfile'
import UserTreePage from './pages/UserTree'
import SlugPage from './pages/Slug'
import NotFoundPage from './pages/NotFound'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { pubkey, isLoading, status } = useAuth()
  
  if (isLoading || status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full" />
      </div>
    )
  }
  
  if (!pubkey || status !== "authenticated") {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminPage />
        </ProtectedRoute>
      } />
      
      <Route path="/u/:username" element={<UserProfilePage />} />
      <Route path="/u/:username/:slug" element={<UserTreePage />} />
      
      <Route path="/:slug" element={<SlugPage />} />
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
