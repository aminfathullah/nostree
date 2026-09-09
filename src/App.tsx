import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

const LoginPage = lazy(() => import('./pages/Login'))
const AdminPage = lazy(() => import('./pages/Admin'))
const UserProfilePage = lazy(() => import('./pages/UserProfile'))
const UserTreePage = lazy(() => import('./pages/UserTree'))
const SlugPage = lazy(() => import('./pages/Slug'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))

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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full" />
      </div>
    }>
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
    </Suspense>
  )
}
