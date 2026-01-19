import { ProfileViewerApp } from '../components/client/ProfileViewerApp'
import logo from '../assets/logo.png'

// UserProfilePage - This page is accessed via /u/:username
// ProfileViewerApp extracts npub from URL query/hash, so we need to redirect
// For now, show a message since we don't have username-to-npub resolution yet

export default function UserProfilePage() {
  // ProfileViewerApp handles its own URL parsing for npub
  // The /u/:username route needs NIP-05 resolution which is handled by TreeViewer
  
  // For profile viewing, redirect to /profile?npub=... pattern
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
