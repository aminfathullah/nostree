import * as React from "react";
import { useState, useEffect } from "react";
import ProfileViewer from "./ProfileViewer";
import logo from "../../assets/logo.png";

/**
 * ProfileViewerApp - Wrapper that extracts npub from URL
 * Supports /profile?npub=... or /profile#npub1...
 */
export function ProfileViewerApp() {
  const [npub, setNpub] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Try to get npub from different URL patterns
    const url = new URL(window.location.href);
    
    // Pattern 1: /profile?npub=npub1...
    let npubValue = url.searchParams.get("npub");
    
    // Pattern 2: /profile#npub1...
    if (!npubValue && url.hash.startsWith("#npub1")) {
      npubValue = url.hash.slice(1);
    }
    
    // Pattern 3: /p/npub1... (from pathname)
    if (!npubValue) {
      const pathMatch = url.pathname.match(/\/p\/(npub1[a-z0-9]+)/);
      if (pathMatch) {
        npubValue = pathMatch[1];
      }
    }

    if (npubValue && npubValue.startsWith("npub1")) {
      setNpub(npubValue);
    } else {
      setNotFound(true);
    }
  }, []);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mb-4 flex justify-center">
          <img src={logo} alt="Logo" className="w-24 h-24 object-contain" />
        </div>
        <h1 className="text-2xl font-bold mb-2">No Profile Specified</h1>
        <p className="text-txt-muted max-w-md mb-4">
          Please provide an npub to view a profile.
        </p>
        <p className="text-sm text-txt-dim">
          Example: <code className="bg-card px-2 py-1 rounded">/profile?npub=npub1...</code>
        </p>
      </div>
    );
  }

  if (!npub) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <ProfileViewer npub={npub} />;
}

export default ProfileViewerApp;
