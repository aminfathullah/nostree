# Nostree 🌲

> **Decentralized, censorship-resistant link-in-bio platform built on the Nostr protocol.**

Nostree allows you to create a "Linktree-style" profile where you own 100% of your data. Your links, theme, and profile metadata are signed by your private key and stored on decentralized relays, not our servers.

## ✨ Features

- **Sovereign Identity**: Log in with your Nostr extension (NIP-07). No email, no passwords.
- **Censorship Resistant**: Your data lives on relays you choose. We cannot ban you or delete your links.
- **Client-Side Rendering**: Built with React & Vite for a snappy, app-like experience.
- **Extensible Themes**: Customize your page with verified themes stored on-chain.
- **NIP-05 & Lightning Support**: Verified identities and native tipping via Bitcoin Lightning.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4
- **Nostr**: `@nostr-dev-kit/ndk`
- **UI**: Motion (Framer), Lucide Icons
- **Type Safety**: TypeScript, Zod

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/aminfathullah/nostree.git
cd nostree

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:4321` to see the app.

## 🏗️ Building for Production

```bash
npm run build
```

The output will be in the `dist/` folder, ready for deployment to any static host (Cloudflare Pages, Vercel, Netlify).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
