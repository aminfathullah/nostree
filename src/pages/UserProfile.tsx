import logo from '../assets/logo.png'

export default function UserProfilePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-4 flex justify-center">
        <img src={logo} alt="Logo" className="w-24 h-24 object-contain" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Profile Viewer</h1>
      <p className="text-txt-muted max-w-md mb-4">
        To view a profile, use the /profile page with an npub parameter.
      </p>
      <p className="text-sm text-txt-dim">
        Example: <code className="bg-card px-2 py-1 rounded">/profile?npub=npub1...</code>
      </p>
    </div>
  )
}
