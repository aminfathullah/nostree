import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-4 flex justify-center">
        <img src={logo} alt="Logo" className="w-24 h-24 object-contain" />
      </div>
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
