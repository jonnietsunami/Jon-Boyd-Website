import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { getSiteContent } from '../server/functions/content'
import { getActiveVideos } from '../server/functions/videos'

export const Route = createFileRoute('/bio')({
  loader: async () => {
    const [content, videos] = await Promise.all([
      getSiteContent(),
      getActiveVideos(),
    ])
    return { content, videos }
  },
  component: BioPage,
})

function BioPage() {
  const { content, videos } = Route.useLoaderData()
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </header>

      {/* Desktop: Side by side layout */}
      <div className="hidden md:grid md:grid-cols-2 min-h-screen">
        {/* Left: Bio section */}
        <div className="p-12 pt-24 flex flex-col gap-8">
          <div className="flex gap-6 items-start">
            <img
              src="/bio.webp"
              alt="Jon Boyd"
              className="w-48 h-48 object-cover rounded-lg flex-shrink-0"
            />
            <div>
              <h1 className="text-4xl font-bold mb-4">Jon Boyd</h1>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {content?.bio_text || 'Bio coming soon...'}
              </p>
            </div>
          </div>

          {/* Video thumbnails */}
          {videos.length > 0 && (
            <div className="mt-auto">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                Videos
              </h2>
              <div className="flex gap-3">
                {videos.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => setActiveVideoIndex(index)}
                    className={`relative overflow-hidden rounded-lg transition-all ${
                      index === activeVideoIndex
                        ? 'ring-2 ring-primary'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-32 h-20 object-cover"
                    />
                    <span className="absolute bottom-1 left-1 right-1 text-xs text-white bg-black/70 px-1 py-0.5 rounded truncate">
                      {video.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Video player */}
        <div className="bg-black flex items-center justify-center p-8">
          {videos.length > 0 ? (
            <div className="relative w-full aspect-video">
              {/* Render all iframes, hide inactive ones with CSS */}
              {videos.map((video, index) => (
                <iframe
                  key={video.id}
                  src={`https://www.youtube.com/embed/${video.youtube_id}?rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className={`absolute inset-0 w-full h-full ${
                    index === activeVideoIndex ? 'visible' : 'invisible'
                  }`}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No videos yet</p>
          )}
        </div>
      </div>

      {/* Mobile: Stacked layout */}
      <div className="md:hidden pt-16">
        {/* Row 1: Bio image + text */}
        <div className="p-6 grid grid-cols-[auto_1fr] gap-4">
          <img
            src="/bio.webp"
            alt="Jon Boyd"
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div>
            <h1 className="text-2xl font-bold mb-2">Jon Boyd</h1>
            <p className="text-sm text-muted-foreground line-clamp-4">
              {content?.bio_text || 'Bio coming soon...'}
            </p>
          </div>
        </div>

        {/* Full bio text below */}
        <div className="px-6 pb-6">
          <p className="text-muted-foreground whitespace-pre-wrap">
            {content?.bio_text || ''}
          </p>
        </div>

        {/* Row 2: Video carousel + player */}
        {videos.length > 0 && (
          <div className="bg-black p-4">
            {/* Active video */}
            <div className="relative w-full aspect-video mb-4">
              {videos.map((video, index) => (
                <iframe
                  key={video.id}
                  src={`https://www.youtube.com/embed/${video.youtube_id}?rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className={`absolute inset-0 w-full h-full ${
                    index === activeVideoIndex ? 'visible' : 'invisible'
                  }`}
                />
              ))}
            </div>

            {/* Thumbnail carousel */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {videos.map((video, index) => (
                <button
                  key={video.id}
                  onClick={() => setActiveVideoIndex(index)}
                  className={`relative flex-shrink-0 overflow-hidden rounded transition-all ${
                    index === activeVideoIndex
                      ? 'ring-2 ring-primary'
                      : 'opacity-60'
                  }`}
                >
                  <img
                    src={`https://img.youtube.com/vi/${video.youtube_id}/default.jpg`}
                    alt={video.title}
                    className="w-24 h-16 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
