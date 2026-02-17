import { createFileRoute, Link } from '@tanstack/react-router'
import { Instagram, Youtube, Twitter } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
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
        {/* Top: Social Icons */}
        <div className="flex justify-end gap-4">
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link
            to="/bio"
            className="group inline-flex items-center gap-3 text-white text-lg font-medium border border-white/30 rounded-full px-6 py-3 hover:bg-white hover:text-black transition-all duration-300"
          >
            Bio & Videos
            <span className="inline-block animate-bounce-x -translate-y-px">→</span>
          </Link>

          <form
            onSubmit={handleSubscribe}
            className="flex flex-col gap-2 w-full md:w-auto"
          >
            <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Tickets. Drops. New ideas."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 md:w-64"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="secondary"
                className="bg-white text-black hover:bg-white/90"
              >
                {isSubmitting ? '...' : 'Join Now'}
              </Button>
              <a className="text-sm text-white/50">* I will respect your inbox.  I promise</a>
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
      </div>
    </main>
  )
}
