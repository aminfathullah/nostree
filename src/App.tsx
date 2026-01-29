import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Page components
import HomePage from './pages/Home'
import LoginPage from './pages/Login'
import AdminPage from './pages/Admin'
import UserProfilePage from './pages/UserProfile'
import UserTreePage from './pages/UserTree'
import SlugPage from './pages/Slug'
import NotFoundPage from './pages/NotFound'

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { pubkey, isLoading, status } = useAuth()
  
  if (isLoading || status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full" />
      </div>
    )
  }
  
  // With auto-login, pubkey should always be available
  // Only redirect if there's an error
  if (!pubkey && status === "error") {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminPage />
        </ProtectedRoute>
      } />
      
      {/* User profile routes */}
      <Route path="/u/:username" element={<UserProfilePage />} />
      <Route path="/u/:username/:slug" element={<UserTreePage />} />
      
      {/* Global slug route (must be last to not conflict) */}
      <Route path="/:slug" element={<SlugPage />} />
      
      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
