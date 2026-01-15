import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="text-6xl mb-4">🌲</div>
      <h1 className="text-2xl font-bold text-brand mb-2">Not Found</h1>
      <p className="text-txt-muted max-w-md mb-6">
        The page you're looking for doesn't exist.
      </p>
      <Link 
        to="/" 
        className="text-brand hover:underline"
      >
        Go to Homepage
      </Link>
    </main>
  )
}
