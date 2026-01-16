import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'motion/react'
import { ArrowRight, Zap, Palette, Lock, Sparkles, Users, Globe } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Publish in seconds. Your links go live instantly on the Nostr network.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Palette,
    title: "16+ Themes",
    description: "Choose from beautiful presets or create your own custom style.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Lock,
    title: "You Own It",
    description: "Your data lives on Nostr. No middlemen, no lock-in, truly yours.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
]

const stats = [
  { value: "∞", label: "Trees" },
  { value: "16+", label: "Themes" },
  { value: "0", label: "Fees" },
]

export default function HomePage() {
  const { pubkey } = useAuth()

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-3xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>Powered by Nostr</span>
          </motion.div>

          {/* Tree Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-8xl mb-6 animate-float"
          >
            🌲
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-brand via-purple-500 to-brand bg-clip-text text-transparent animate-gradient">
              Nostree
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-txt-muted mb-4"
          >
            Your Nostr-powered link tree.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-txt-dim mb-10"
          >
            Own your links. Own your graph. No middlemen.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to={pubkey ? "/admin" : "/login"}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand hover:bg-brand-hover text-brand-fg font-semibold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:shadow-brand/25 animate-pulse-glow"
            >
              <span>{pubkey ? "Go to Editor" : "Get Started Free"}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <a
              href="https://nostr.how/get-started"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card hover:bg-card-hover border border-border hover:border-border-hover text-txt-main font-medium rounded-2xl transition-all"
            >
              <Globe className="w-5 h-5" />
              <span>Learn about Nostr</span>
            </a>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 flex gap-12 mt-16"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-brand">{stat.value}</div>
              <div className="text-sm text-txt-muted">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-txt-main mb-4">
              Why Nostree?
            </h2>
            <p className="text-txt-muted text-lg max-w-2xl mx-auto">
              Unlike traditional link-in-bio tools, Nostree gives you true ownership 
              of your data through the decentralized Nostr protocol.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 bg-card border border-border rounded-2xl hover:border-brand/30 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-txt-main mb-2">
                  {feature.title}
                </h3>
                <p className="text-txt-muted">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / CTA Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 bg-gradient-to-br from-brand/10 via-purple-500/10 to-brand/5 rounded-3xl border border-brand/20"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-5 h-5 text-brand" />
              <span className="text-sm font-medium text-brand">Built for the Nostr community</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-txt-main mb-4">
              Ready to own your links?
            </h3>
            <p className="text-txt-muted mb-6">
              Join the growing community of creators using Nostr to take control of their online presence.
            </p>
            <Link
              to={pubkey ? "/admin" : "/login"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand hover:bg-brand-hover text-brand-fg font-semibold rounded-2xl transition-all shadow-lg"
            >
              <span>Create Your Tree</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-txt-muted">
            <span className="text-xl">🌲</span>
            <span className="font-medium">Nostree</span>
          </div>
          <p className="text-sm text-txt-dim">
            Built with ❤️ for the Nostr ecosystem
          </p>
        </div>
      </footer>
    </main>
  )
}
