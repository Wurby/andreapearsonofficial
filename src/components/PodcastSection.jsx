import { motion } from 'framer-motion'
import { useContent } from '../hooks/useContent'
import Markdown from './Markdown'
import { spotifyEmbedSrc, youtubeEmbedSrc, applePodcastsEmbedSrc } from '../lib/podcastEmbeds'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: 'easeOut', delay: i * 0.1 },
  }),
}

const APPLE_SANDBOX = 'allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation'

export default function PodcastSection() {
  const { content } = useContent()
  const podcast = content?.podcast

  const embeds = [
    podcast?.spotify?.enabled && {
      key: 'spotify', label: 'Spotify', src: spotifyEmbedSrc(podcast.spotify.url), height: 352,
    },
    podcast?.youtube?.enabled && {
      key: 'youtube', label: 'YouTube', src: youtubeEmbedSrc(podcast.youtube.url), aspectVideo: true,
    },
    podcast?.applePodcasts?.enabled && {
      key: 'apple', label: 'Apple Podcasts', src: applePodcastsEmbedSrc(podcast.applePodcasts.url), height: 450, sandbox: APPLE_SANDBOX,
    },
  ].filter(e => e && e.src)

  if (!podcast || embeds.length === 0) return null

  return (
    <section className="bg-mint-cream py-14 md:py-28 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
        >
          <p className="text-xs tracking-[0.2em] uppercase text-blood-red mb-4 font-medium">{podcast.eyebrow || 'Podcast'}</p>
          <div className="w-12 h-px bg-blood-red mb-6" />
          <h2 className="text-subtitle text-deep-space-blue mb-4">{podcast.heading}</h2>
          {podcast.body && (
            <Markdown className="text-body text-deep-space-blue/70 leading-relaxed mb-10 max-w-2xl">
              {podcast.body}
            </Markdown>
          )}
        </motion.div>

        <div className="space-y-8">
          {embeds.map((embed, i) => (
            <motion.div
              key={embed.key}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
              custom={i + 1}
            >
              {embed.aspectVideo ? (
                <div className="aspect-video rounded-xl overflow-hidden shadow-sm">
                  <iframe
                    title={`The Andrea Pearson Show — ${embed.label}`}
                    src={embed.src}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              ) : (
                <iframe
                  title={`The Andrea Pearson Show — ${embed.label}`}
                  src={embed.src}
                  width="100%"
                  height={embed.height}
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  {...(embed.sandbox && { sandbox: embed.sandbox })}
                  loading="lazy"
                  className="rounded-xl shadow-sm"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
