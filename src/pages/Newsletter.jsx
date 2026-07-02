import { motion } from 'framer-motion'
import { useContent } from '../hooks/useContent'
import Button from '../components/Button'

const ACCENT_MAP = {
  'bg-deep-space-blue': 'bg-blood-red',
  'bg-regal-navy':      'bg-blood-red',
  'bg-blood-red':       'bg-deep-space-blue',
  'bg-onyx':            'bg-blood-red',
  'bg-mint-cream':      'bg-deep-space-blue',
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: 'easeOut', delay: i * 0.1 },
  }),
}

export default function Newsletter() {
  const { content, loading } = useContent()
  const newsletters = content?.newsletters ?? []

  return (
    <>
      {/* ── Hero band ──────────────────────────────────────────── */}
      <div className="bg-deep-space-blue px-6 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <p className="text-xs tracking-[0.2em] uppercase text-blood-red mb-6 font-medium">Stay Connected</p>
            <div className="w-12 h-px bg-blood-red mb-6" />
            <h1 className="text-title text-mint-cream">Newsletter</h1>
            <p className="text-body text-mint-cream/60 mt-6 max-w-xl leading-relaxed">
              Choose the list that fits your reading life — new releases, reader extras, and updates. No spam, ever.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Cards ──────────────────────────────────────────────── */}
      <div className="bg-mint-cream px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="grid sm:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : newsletters.length === 0 ? (
            <p className="text-gray-400 text-base">No newsletters configured yet.</p>
          ) : (
            <div className="grid sm:grid-cols-3 gap-6">
              {newsletters.map((item, i) => {
                const bg        = item.bg || 'bg-deep-space-blue'
                const isCustom  = bg.startsWith('#')
                const accentBg  = isCustom ? 'bg-blood-red' : (ACCENT_MAP[bg] ?? 'bg-blood-red')

                return (
                  <motion.div
                    key={i}
                    variants={fadeUp} initial="hidden" animate="visible" custom={i + 1}
                    className={`relative flex flex-col overflow-hidden p-8 pt-10 ${isCustom ? '' : bg}`}
                    style={isCustom ? { backgroundColor: bg } : undefined}
                  >
                    {/* Top accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${accentBg}`} />

                    {/* Content */}
                    <h2 className="font-display text-4xl font-light leading-tight mb-4 text-mint-cream">
                      {item.label || 'Newsletter'}
                    </h2>
                    <p className="text-base leading-relaxed mb-10 flex-1 text-mint-cream/60">
                      {item.description}
                    </p>

                    {item.url ? (
                      <Button href={item.url} size="md" variant="ghost" className="w-full text-center">
                        Subscribe
                      </Button>
                    ) : (
                      <span className="text-center text-sm py-3 px-4 border border-mint-cream/20 text-mint-cream/40 tracking-wide">
                        Coming soon
                      </span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
