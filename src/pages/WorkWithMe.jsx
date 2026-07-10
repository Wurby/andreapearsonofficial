import { motion } from 'framer-motion'
import { useContent } from '../hooks/useContent'
import SocialLinks from '../components/SocialLinks'
import Button from '../components/Button'
import Markdown from '../components/Markdown'
import { trackEvent } from '../lib/analytics'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: 'easeOut', delay: i * 0.1 },
  }),
}

export default function WorkWithMe() {
  const { content } = useContent()
  const workWithMe = content?.workWithMe ?? {}
  const consultants = workWithMe.consultants ?? []
  const doneForYou = workWithMe.doneForYou ?? {}
  const speaking = workWithMe.speaking ?? {}
  const speaksTo = speaking.speaksTo ?? []
  const topics = speaking.topics ?? []
  const contactEmail = content?.contactEmail || 'ap@andreapearsonbooks.com'
  const contactHref = `mailto:${contactEmail}`

  return (
    <>
      <div className="bg-deep-space-blue px-6 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <p className="text-xs tracking-[0.2em] uppercase text-blood-red mb-6 font-medium">Consulting</p>
            <div className="w-12 h-px bg-blood-red mb-6" />
            <h1 className="text-title text-mint-cream mb-6">Work With Me</h1>
            <p className="text-body text-mint-cream/60 max-w-2xl leading-relaxed">
              Strategic clarity for growth-minded business owners.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="bg-mint-cream">
        <div className="px-6 py-16 md:py-24 max-w-4xl mx-auto space-y-20">

          {consultants.length > 0 && (
            <motion.section
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              <h2 className="text-subtitle text-deep-space-blue mb-2">One-on-One Consultations</h2>
              <div className="w-8 h-px bg-blood-red mt-3 mb-12" />

              <div className="space-y-14">
                {consultants.map((c, i) => (
                  <div key={i} className="border-l-2 border-deep-space-blue/15 pl-8">
                    <h3 className="text-caption text-deep-space-blue mb-2">{c.name}</h3>
                    {c.tagline && (
                      <p className="text-xs text-deep-space-blue/50 mb-6 tracking-widest uppercase">{c.tagline}</p>
                    )}
                    <div className="mb-8">
                      <Markdown className="text-body text-onyx leading-relaxed">{c.bio}</Markdown>
                    </div>
                    <Button
                      href={contactHref}
                      onClick={() => trackEvent('work_with_me_cta_click', {
                        ctaType: 'consultation',
                        consultantName: c.name,
                      })}
                    >
                      {c.ctaLabel || 'Book a Session'}
                    </Button>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          <motion.section
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <h2 className="text-subtitle text-deep-space-blue mb-2">{doneForYou.heading || 'Done-for-You Services'}</h2>
            <div className="w-8 h-px bg-blood-red mt-3 mb-8" />
            {doneForYou.tag && (
              <p className="text-xs font-medium text-deep-space-blue/50 mb-6 tracking-widest uppercase">{doneForYou.tag}</p>
            )}
            <div className="mb-8">
              <Markdown className="text-body text-onyx leading-relaxed">{doneForYou.body}</Markdown>
            </div>
            <p className="text-onyx text-lg">
              Not sure which option fits?{' '}
              <a href={contactHref} className="text-blood-red hover:underline">
                Reach out and we'll help you decide.
              </a>
            </p>
          </motion.section>

          <motion.section
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <h2 className="text-subtitle text-deep-space-blue mb-2">Speaking &amp; Workshops</h2>
            <div className="w-8 h-px bg-blood-red mt-3 mb-8" />
            <div className="mb-10">
              <Markdown className="text-onyx leading-relaxed text-lg">{speaking.body}</Markdown>
            </div>

            {(speaksTo.length > 0 || topics.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-10 mb-10">
                {speaksTo.length > 0 && (
                  <div>
                    <h3 className="text-caption text-deep-space-blue mb-4">Andrea speaks to:</h3>
                    <ul className="text-onyx space-y-2 text-base leading-relaxed">
                      {speaksTo.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                    {speaking.speaksToNote && (
                      <p className="text-base text-onyx/60 mt-4">{speaking.speaksToNote}</p>
                    )}
                  </div>
                )}
                {topics.length > 0 && (
                  <div>
                    <h3 className="text-caption text-deep-space-blue mb-4">Speaking Topics</h3>
                    <ul className="text-onyx space-y-2 text-base leading-relaxed">
                      {topics.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <Button
              href={contactHref}
              onClick={() => trackEvent('work_with_me_cta_click', { ctaType: 'speaking' })}
            >
              {speaking.ctaLabel || 'Inquire About Speaking'}
            </Button>
          </motion.section>

          <motion.section
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <h2 className="text-subtitle text-deep-space-blue mb-2">Contact</h2>
            <div className="w-8 h-px bg-blood-red mt-3 mb-6" />
            <p className="text-onyx mb-4 text-lg">Andrea personally reads all incoming messages.</p>
            <a
              href={contactHref}
              className="text-deep-space-blue hover:text-blood-red transition-colors font-medium text-lg"
            >
              {contactEmail}
            </a>
            <SocialLinks links={content?.socialLinks} className="text-deep-space-blue/50 mt-6" />
          </motion.section>

        </div>
      </div>
    </>
  )
}
