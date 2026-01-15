import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { pubkey } = useAuth()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center max-w-lg">
        <h1 className="text-6xl mb-4">🌲</h1>
        <h2 className="text-4xl font-bold text-brand mb-4">Nostree</h2>
        <p className="text-txt-muted text-lg mb-8">
          Your Nostr-powered link tree. Create beautiful link pages backed by the Nostr protocol.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {pubkey ? (
            <Link
              to="/admin"
              className="px-6 py-3 bg-brand hover:bg-brand-hover text-brand-fg font-medium rounded-xl transition-all"
            >
              Go to Editor
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-6 py-3 bg-brand hover:bg-brand-hover text-brand-fg font-medium rounded-xl transition-all"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
