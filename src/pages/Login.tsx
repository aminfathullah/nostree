import { LoginForm } from '../components/client/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2">🌲</h1>
          <h2 className="text-2xl font-bold text-txt-main">Sign in to Nostree</h2>
          <p className="text-txt-muted mt-2">Use your Nostr extension to sign in</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
