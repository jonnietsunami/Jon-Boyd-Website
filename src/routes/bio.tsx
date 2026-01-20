import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Play } from 'lucide-react'
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

  const activeVideo = videos[activeVideoIndex]

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 md:p-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm tracking-wide uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </header>

      {/* Desktop Layout - No Scroll */}
      <div className="hidden lg:flex h-screen overflow-hidden">
        {/* Left Panel - Bio with image background */}
        <div className="w-[40%] h-full relative">
          {/* Full-height image */}
          <img
            src="/bio.webp"
            alt="Jon Boyd"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Text content at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-10 xl:p-14">
            <h1 className="text-5xl xl:text-6xl font-bold tracking-tight mb-4">
              Jon Boyd
            </h1>
            <p className="text-base xl:text-lg text-white/80 leading-relaxed max-w-md">
              {content?.bio_text || 'Bio coming soon...'}
            </p>
          </div>
        </div>

        {/* Right Panel - Videos */}
        <div className="flex-1 bg-neutral-950 h-full flex flex-col py-6 xl:py-8">
          {/* Main Video Player */}
          <div className="flex-1 flex items-center justify-center px-8 xl:px-12 min-h-0">
            {videos.length > 0 ? (
              <div className="w-full max-w-3xl">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl">
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
                {activeVideo && (
                  <h3 className="mt-4 text-lg xl:text-xl font-medium text-white/90 truncate">
                    {activeVideo.title}
                  </h3>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Play className="w-6 h-6 text-white/30" />
                </div>
                <p className="text-white/40">Videos coming soon</p>
              </div>
            )}
          </div>

          {/* Video Thumbnails */}
          {videos.length > 1 && (
            <div className="flex-shrink-0 border-t border-white/10 px-8 xl:px-12 pt-4 xl:pt-6">
              <div className="flex gap-3 xl:gap-4 overflow-x-auto">
                {videos.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => setActiveVideoIndex(index)}
                    className={`group relative flex-shrink-0 overflow-hidden rounded-lg transition-all duration-300 ${
                      index === activeVideoIndex
                        ? 'border-2 border-white'
                        : 'border-2 border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-32 xl:w-40 aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Play
                        className={`w-6 h-6 text-white transition-transform group-hover:scale-110 ${
                          index === activeVideoIndex ? 'opacity-0' : 'opacity-70'
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden md:flex lg:hidden flex-col min-h-screen pt-20">
        {/* Bio Section */}
        <div className="flex gap-8 p-8">
          <img
            src="/bio.webp"
            alt="Jon Boyd"
            className="w-64 h-80 object-cover rounded-xl flex-shrink-0"
          />
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Jon Boyd</h1>
            <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
              {content?.bio_text || 'Bio coming soon...'}
            </p>
          </div>
        </div>

        {/* Videos Section */}
        <div className="flex-1 bg-neutral-950 p-8">
          {videos.length > 0 ? (
            <>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6">
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
              {activeVideo && (
                <h3 className="text-lg font-medium text-white/90 mb-4">
                  {activeVideo.title}
                </h3>
              )}
              {videos.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {videos.map((video, index) => (
                    <button
                      key={video.id}
                      onClick={() => setActiveVideoIndex(index)}
                      className={`relative flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                        index === activeVideoIndex
                          ? 'ring-2 ring-white'
                          : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-36 aspect-video object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-white/40">Videos coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen pt-20">
        {/* Hero Image */}
        <div className="relative">
          <img
            src="/bio.webp"
            alt="Jon Boyd"
            className="w-full aspect-[3/4] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-4xl font-bold tracking-tight">Jon Boyd</h1>
          </div>
        </div>

        {/* Bio Text */}
        <div className="p-6">
          <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
            {content?.bio_text || 'Bio coming soon...'}
          </p>
        </div>

        {/* Videos Section */}
        {videos.length > 0 && (
          <div className="bg-neutral-950 p-6">
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
              Videos
            </h2>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4">
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
            {activeVideo && (
              <h3 className="text-base font-medium text-white/90 mb-4">
                {activeVideo.title}
              </h3>
            )}
            {videos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {videos.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => setActiveVideoIndex(index)}
                    className={`relative flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                      index === activeVideoIndex
                        ? 'ring-2 ring-white'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-28 aspect-video object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
