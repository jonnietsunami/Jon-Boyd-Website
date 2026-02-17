import { createFileRoute, Link } from '@tanstack/react-router'
import { Instagram, Youtube, Twitter } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { getSiteContent } from '../server/functions/content'
import { getSocialLinks } from '../server/functions/social'
import { subscribeEmail } from '../server/functions/subscribers'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [content, socialLinks] = await Promise.all([
      getSiteContent(),
      getSocialLinks(),
    ])
    return { content, socialLinks }
  },
  component: HomePage,
})

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  x: Twitter,
}

function HomePage() {
  const { content, socialLinks } = Route.useLoaderData()
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    try {
      await subscribeEmail({ data: { email, website } })
      toast.success('Subscribed!')
      setEmail('')
    } catch {
      toast.error('Failed to subscribe')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="h-screen w-screen overflow-hidden relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/hero.webp)' }}
      />

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6 md:p-12">
        {/* Top: Logo + Social Icons */}
        <div className="flex items-center justify-between">
          <img
            src="/bullshitjonbwsmile.png"
            alt="Boyd!"
            className="h-10 md:h-12 w-auto mix-blend-lighten hover:scale-105 transition-transform"
          />
          <div className="flex gap-4">
            {socialLinks.map((link) => {
              const Icon = socialIcons[link.platform.toLowerCase()]
              return Icon ? (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <Icon className="w-6 h-6" />
                </a>
              ) : null
            })}
          </div>
        </div>

        {/* Middle: Name */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tight">
            {content?.hero_title || 'JON BOYD'}
          </h1>
          {content?.hero_subtitle && (
            <p className="text-lg md:text-xl lg:text-2xl text-white/70 mt-4 tracking-wide text-center">
              {content.hero_subtitle}
            </p>
          )}
        </div>

        {/* Bottom: Bio link + Email signup */}
        <div className="flex flex-col items-center md:items-stretch gap-0.5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
            <Link
              to="/bio"
              className="group inline-flex items-center gap-3 text-white text-lg font-medium border border-white/30 rounded-full px-6 py-3 hover:bg-white hover:text-black transition-all duration-300"
            >
              Bio & Videos
              <span className="inline-block animate-bounce-x -translate-y-px">→</span>
            </Link>

            <form onSubmit={handleSubscribe} className="w-full md:w-auto">
              <div className="flex items-center bg-white/10 border border-white/20 rounded-full pl-5 pr-1.5 py-1.5">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-white placeholder:text-white/50 text-sm outline-none w-full md:w-52"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-white text-black hover:bg-white/90 text-sm font-medium px-4 py-1.5 shrink-0 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? '...' : 'Join'}
                </button>
              </div>
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute opacity-0 h-0 w-0 overflow-hidden pointer-events-none"
              />
            </form>
          </div>
          <p className="text-xs text-white/40 text-right pr-3 self-end">* I respect your inbox</p>
        </div>
      </div>
    </main>
  )
}
