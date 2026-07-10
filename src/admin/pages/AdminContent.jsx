import { useState, useEffect, useRef } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../lib/firebase'
import { useContent } from '../../hooks/useContent'
import { useTheme } from '../../hooks/useTheme'
import { useBooks } from '../../hooks/useBooks'
import MarkdownBadge, { MARKDOWN_HINT } from '../components/MarkdownBadge'
import BookPicker from '../components/BookPicker'
import { spotifyEmbedSrc, youtubeEmbedSrc, applePodcastsEmbedSrc } from '../../lib/podcastEmbeds'

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram',   placeholder: 'https://instagram.com/yourhandle' },
  { key: 'facebook',  label: 'Facebook',    placeholder: 'https://facebook.com/yourpage'    },
  { key: 'tiktok',    label: 'TikTok',      placeholder: 'https://tiktok.com/@yourhandle'   },
  { key: 'goodreads', label: 'Goodreads',   placeholder: 'https://goodreads.com/author/...' },
  { key: 'pinterest', label: 'Pinterest',   placeholder: 'https://pinterest.com/yourhandle' },
  { key: 'youtube',   label: 'YouTube',     placeholder: 'https://youtube.com/@yourchannel' },
  { key: 'twitter',   label: '𝕏 (Twitter)', placeholder: 'https://x.com/yourhandle'         },
]

// Fallback values only — actual swatch color is read live from settings/theme (see useTheme
// below) so these stay correct after Andrea repaints the palette in Theme Settings.
const DEFAULT_THEME = {
  deepSpaceBlue: '#002B4C',
  regalNavy:     '#003A67',
  mintCream:     '#F1F9F7',
  onyx:          '#0A0C08',
  bloodRed:      '#900101',
}

// Role-based labels, not color names — see matching note in AdminTheme.jsx.
const BG_OPTIONS = [
  { value: 'bg-deep-space-blue', label: 'Primary',         themeKey: 'deepSpaceBlue' },
  { value: 'bg-regal-navy',      label: 'Secondary',       themeKey: 'regalNavy'     },
  { value: 'bg-blood-red',       label: 'Accent',          themeKey: 'bloodRed'      },
  { value: 'bg-onyx',            label: 'Text',            themeKey: 'onyx'          },
  { value: 'bg-mint-cream',      label: 'Page Background', themeKey: 'mintCream'     },
]

const EMPTY_SOCIAL      = Object.fromEntries(SOCIAL_PLATFORMS.map(p => [p.key, '']))
const EMPTY_NEWSLETTER  = { label: '', description: '', url: '', bg: 'bg-deep-space-blue' }
const EMPTY_CONSULTANT  = { name: '', tagline: '', bio: '', ctaLabel: 'Book a Session' }

// The one site-wide contact email — see the Contact Email tab.
const DEFAULT_CONTACT_EMAIL = 'ap@andreapearsonbooks.com'

// Current live copy — used to seed the admin form the first time it loads, so
// saving the Work With Me tab before every field has been reviewed doesn't
// blank out the public page.
const DEFAULT_WORK_WITH_ME = {
  consultants: [
    {
      name: 'Andrea Pearson',
      tagline: 'Strategy · Marketing · Clarity',
      bio: "Sessions with Andrea are focused, strategic conversations designed to bring clarity and direction to your business. Rather than offering generic advice or overwhelming you with tactics, Andrea looks at your business as it exists today—your goals, your constraints, and what's already working—to help you identify what truly matters right now.\n\nBest suited for business owners who value insight over hype and want to make confident decisions without tearing everything down. You'll leave with fewer competing priorities, a stronger sense of direction, and clear next steps you can act on immediately.",
      ctaLabel: 'Book a Session',
    },
    {
      name: 'Nolan J. Skinner',
      tagline: 'Systems · Operations · Analysis',
      bio: "Sessions with Nolan are analytical, high-level strategic reviews focused on how a business actually operates beneath the surface. Rather than discussing tactics or short-term fixes, Nolan examines systems, processes, and decision flow to identify structural inefficiencies or constraints that quietly limit efficiency and scalability.\n\nBest suited for established business owners and leaders who want long-term clarity and stronger operational foundations. You'll leave with a clear understanding of what's holding your business back at a structural level and what high-leverage changes will have the greatest impact.",
      ctaLabel: 'Book a Session',
    },
  ],
  doneForYou: {
    heading: 'Done-for-You Services',
    tag: 'Project-based · Defined scope',
    body: "Our done-for-you services are designed for business owners and authors who already have content, but want it presented professionally, without technical stress. We focus on clarity and reliability—whether that means formatting an on-brand lead magnet, setting up a clean newsletter system, or ensuring your emails are refined and scheduled well in advance.\n\nThese services are intentionally structured and limited in scope. We don't create content from scratch or manage day-to-day marketing decisions. Instead, we refine, organize, and implement what you give us so it's clear and cohesive.",
  },
  speaking: {
    body: "Andrea Pearson speaks to audiences who want to grow personally and professionally. Her talks focus on mindset, progression, realizing meaningful goals, marketing, and practical business growth strategy. She brings energy, clarity, and momentum to the stage—connecting easily with large audiences and helping them see what's possible, then how to move toward it with intention.\n\nShe is especially known for combining big-picture thinking with practical takeaways, leaving audiences motivated and grounded in next steps they can apply immediately.",
    speaksTo: [
      'Business owners and entrepreneurs',
      'Creatives and independent professionals',
      'Leadership and professional development audiences',
      'Faith-friendly and values-driven organizations',
      'Conferences, summits, workshops, retreats, and group events',
    ],
    speaksToNote: 'Available for in-person and virtual engagements.',
    topics: [
      'Mindset and long-term thinking for real growth',
      'Progression rather than perfection',
      'Realizing goals without burnout or overwhelm',
      'Building a positive, resilient mindset',
      'Marketing that builds trust',
      'Why email and owned audiences still matter',
    ],
    ctaLabel: 'Inquire About Speaking',
  },
}

// Confirmed with Joshua 2026-07-10 — verified against search results matching
// "The Andrea Pearson Show" exactly (Spotify search also surfaces an unrelated
// "Andrea Pearson Audiobooks" show, so these aren't guessable from a search alone).
// Seeds the admin form so the public Podcast section doesn't go blank until
// Andrea opens this tab and hits Save once — same pattern as DEFAULT_WORK_WITH_ME.
const DEFAULT_PODCAST = {
  eyebrow: 'Podcast',
  heading: 'The Andrea Pearson Show',
  body: 'Solo episodes and guest interviews on mindset, marketing, and building sustainable success — new episodes weekly.',
  spotify:       { enabled: true, url: 'https://open.spotify.com/show/3RbOgqJMKGaKxeAr9gl5ZZ' },
  youtube:       { enabled: true, url: 'https://www.youtube.com/channel/UCsKoXraaU4PD1FCYOoq_Pfw' },
  applePodcasts: { enabled: true, url: 'https://podcasts.apple.com/us/podcast/the-andrea-pearson-show/id1692828324' },
}

const PODCAST_PLATFORMS = [
  { key: 'spotify',       label: 'Spotify',        placeholder: 'https://open.spotify.com/show/…',              parse: spotifyEmbedSrc },
  { key: 'youtube',       label: 'YouTube',        placeholder: 'https://www.youtube.com/channel/…',            parse: youtubeEmbedSrc },
  { key: 'applePodcasts', label: 'Apple Podcasts', placeholder: 'https://podcasts.apple.com/us/podcast/…/id…', parse: applePodcastsEmbedSrc },
]

const TABS = [
  { key: 'homepage',    label: 'Homepage' },
  { key: 'podcast',     label: 'Podcast' },
  { key: 'bio',         label: 'Author Bio' },
  { key: 'newsletters', label: 'Newsletters' },
  { key: 'workWithMe',  label: 'Work With Me' },
  { key: 'social',      label: 'Social Links' },
  { key: 'contact',     label: 'Contact Email' },
]

const EMPTY_FORM = {
  headline:     '',
  intro:        '',
  bioShort:     '',
  bioLong:      '',
  headshotUrl:  '',
  pullQuote:    '',
  newsletters:  [],
  homepageHeroes: ['', '', ''],
  podcast:      DEFAULT_PODCAST,
  workWithMe:   DEFAULT_WORK_WITH_ME,
  socialLinks:  EMPTY_SOCIAL,
  contactEmail: DEFAULT_CONTACT_EMAIL,
}

function migrateWorkWithMe(content) {
  if (!content.workWithMe) return DEFAULT_WORK_WITH_ME
  // contactEmail lived under workWithMe before it was consolidated into its own tab
  const workWithMe = { ...content.workWithMe }
  delete workWithMe.contactEmail
  return workWithMe
}

function migrateHomepageHeroes(content) {
  const heroes = content.homepageHeroes ?? []
  return [0, 1, 2].map(i => heroes[i] ?? '')
}

function migratePodcast(content) {
  const p = content.podcast ?? {}
  return {
    eyebrow: p.eyebrow ?? DEFAULT_PODCAST.eyebrow,
    heading: p.heading ?? DEFAULT_PODCAST.heading,
    body:    p.body    ?? DEFAULT_PODCAST.body,
    spotify:       { ...DEFAULT_PODCAST.spotify,       ...p.spotify },
    youtube:       { ...DEFAULT_PODCAST.youtube,       ...p.youtube },
    applePodcasts: { ...DEFAULT_PODCAST.applePodcasts, ...p.applePodcasts },
  }
}

function migrateContactEmail(content) {
  return content.contactEmail ?? content.workWithMe?.contactEmail ?? DEFAULT_CONTACT_EMAIL
}

function migrateNewsletters(content) {
  if (content.newsletters?.length) return content.newsletters
  // Migrate from old newsletterLinks object
  const old = content.newsletterLinks || {}
  return [
    { label: 'Fantasy',    description: '', url: old.fantasy    || '', bg: 'bg-deep-space-blue' },
    { label: 'Romance',    description: '', url: old.romance    || '', bg: 'bg-blood-red'        },
    { label: 'Nonfiction', description: '', url: old.nonfiction || '', bg: 'bg-onyx'             },
  ]
}

export default function AdminContent() {
  const { content, loading }          = useContent()
  const { theme }                     = useTheme()
  const { books }                     = useBooks()
  const [form, setForm]               = useState(EMPTY_FORM)
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [uploading, setUploading]     = useState(false)
  const didInit                       = useRef(false)
  const headshotInputRef              = useRef(null)
  const [activeTab, setActiveTab]     = useState('homepage')

  useEffect(() => {
    if (content && !didInit.current) {
      didInit.current = true
      setForm({
        headline:     content.headline     ?? '',
        intro:        content.intro        ?? '',
        bioShort:     content.bioShort     ?? '',
        bioLong:      content.bioLong      ?? '',
        headshotUrl:  content.headshotUrl  ?? '',
        pullQuote:    content.pullQuote    ?? '',
        newsletters:  migrateNewsletters(content),
        homepageHeroes: migrateHomepageHeroes(content),
        podcast:      migratePodcast(content),
        workWithMe:   migrateWorkWithMe(content),
        socialLinks:  { ...EMPTY_SOCIAL, ...content.socialLinks },
        contactEmail: migrateContactEmail(content),
      })
    }
  }, [content])

  const setField      = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setSocialLink = (key, val) => setForm(f => ({
    ...f, socialLinks: { ...f.socialLinks, [key]: val },
  }))

  // A book can only occupy one hero slot — picking it into a new slot clears
  // any other slot it was already in, instead of allowing duplicates.
  function setHeroSlot(i, bookId) {
    setForm(f => {
      const heroes = f.homepageHeroes.map((id, idx) => (idx !== i && id === bookId ? '' : id))
      heroes[i] = bookId
      return { ...f, homepageHeroes: heroes }
    })
  }

  // Newsletter CRUD
  function addNewsletter() {
    setForm(f => ({ ...f, newsletters: [...f.newsletters, { ...EMPTY_NEWSLETTER }] }))
  }
  function updateNewsletter(i, key, val) {
    setForm(f => {
      const newsletters = [...f.newsletters]
      newsletters[i] = { ...newsletters[i], [key]: val }
      return { ...f, newsletters }
    })
  }
  function removeNewsletter(i) {
    setForm(f => ({ ...f, newsletters: f.newsletters.filter((_, idx) => idx !== i) }))
  }
  function moveNewsletter(i, dir) {
    setForm(f => {
      const newsletters = [...f.newsletters]
      const j = i + dir
      if (j < 0 || j >= newsletters.length) return f
      ;[newsletters[i], newsletters[j]] = [newsletters[j], newsletters[i]]
      return { ...f, newsletters }
    })
  }

  // Podcast
  const setPodcastField = (key, val) => setForm(f => ({
    ...f, podcast: { ...f.podcast, [key]: val },
  }))
  const setPodcastPlatform = (platform, key, val) => setForm(f => ({
    ...f, podcast: { ...f.podcast, [platform]: { ...f.podcast[platform], [key]: val } },
  }))

  // Work With Me
  const setWorkWithMeField = (key, val) => setForm(f => ({
    ...f, workWithMe: { ...f.workWithMe, [key]: val },
  }))
  const setDoneForYouField = (key, val) => setForm(f => ({
    ...f, workWithMe: { ...f.workWithMe, doneForYou: { ...f.workWithMe.doneForYou, [key]: val } },
  }))
  const setSpeakingField = (key, val) => setForm(f => ({
    ...f, workWithMe: { ...f.workWithMe, speaking: { ...f.workWithMe.speaking, [key]: val } },
  }))

  // Consultants CRUD
  function addConsultant() {
    setWorkWithMeField('consultants', [...form.workWithMe.consultants, { ...EMPTY_CONSULTANT }])
  }
  function updateConsultant(i, key, val) {
    const consultants = [...form.workWithMe.consultants]
    consultants[i] = { ...consultants[i], [key]: val }
    setWorkWithMeField('consultants', consultants)
  }
  function removeConsultant(i) {
    setWorkWithMeField('consultants', form.workWithMe.consultants.filter((_, idx) => idx !== i))
  }
  function moveConsultant(i, dir) {
    const consultants = [...form.workWithMe.consultants]
    const j = i + dir
    if (j < 0 || j >= consultants.length) return
    ;[consultants[i], consultants[j]] = [consultants[j], consultants[i]]
    setWorkWithMeField('consultants', consultants)
  }

  // Speaking bullet lists (speaksTo / topics) CRUD
  function addBullet(listKey) {
    setSpeakingField(listKey, [...form.workWithMe.speaking[listKey], ''])
  }
  function updateBullet(listKey, i, val) {
    const list = [...form.workWithMe.speaking[listKey]]
    list[i] = val
    setSpeakingField(listKey, list)
  }
  function removeBullet(listKey, i) {
    setSpeakingField(listKey, form.workWithMe.speaking[listKey].filter((_, idx) => idx !== i))
  }

  async function handleHeadshotUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext     = file.name.split('.').pop()
      const fileRef = storageRef(storage, `content/headshot.${ext}`)
      await uploadBytes(fileRef, file, { contentType: file.type })
      const url = await getDownloadURL(fileRef)
      setField('headshotUrl', url)
    } finally {
      setUploading(false)
      if (headshotInputRef.current) headshotInputRef.current.value = ''
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      await setDoc(doc(db, 'settings', 'content'), form)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-gray-400">Loading…</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-deep-space-blue mb-6">Site Content</h1>

      <div className="flex gap-1 border-b mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-deep-space-blue text-deep-space-blue'
                : 'border-transparent text-gray-400 hover:text-onyx'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Homepage ────────────────────────────────────────── */}
        <section hidden={activeTab !== 'homepage'} className="bg-white rounded border p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-deep-space-blue">Homepage</h2>
            <p className="text-xs text-gray-400 mt-0.5">Home page hero banner, above the fold.</p>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-onyx">Headline</span>
            <input
              type="text"
              value={form.headline}
              onChange={e => setField('headline', e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-onyx flex items-center gap-2">
              Intro
              <MarkdownBadge />
            </span>
            <textarea
              value={form.intro}
              onChange={e => setField('intro', e.target.value)}
              rows={3}
              className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white resize-y"
            />
            <p className="text-xs text-gray-400 mt-1">{MARKDOWN_HINT}</p>
          </label>

          <div>
            <span className="text-sm font-medium text-onyx">Homepage Hero Covers</span>
            <p className="text-xs text-gray-400 mt-0.5 mb-2">
              Up to 3 book covers scattered behind the hero headline, in this order. Separate from the
              "Featured" flag used by the Featured Titles section further down the page.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {form.homepageHeroes.map((bookId, i) => (
                <div key={i} className="block">
                  <span className="text-xs font-medium text-onyx">Position {i + 1}</span>
                  <div className="mt-1">
                    <BookPicker
                      books={books}
                      value={bookId}
                      onChange={id => setHeroSlot(i, id)}
                      excludeIds={form.homepageHeroes.filter((_, idx) => idx !== i)}
                      placeholder="Search books…"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Podcast ─────────────────────────────────────────── */}
        <section hidden={activeTab !== 'podcast'} className="bg-white rounded border p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-deep-space-blue">Podcast</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Shown on the homepage, above "About Andrea." Toggle a platform off to hide its embed — the whole section hides itself if none are on.
            </p>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-onyx">Eyebrow Label</span>
            <input
              type="text"
              value={form.podcast.eyebrow}
              onChange={e => setPodcastField('eyebrow', e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-onyx">Heading</span>
            <input
              type="text"
              value={form.podcast.heading}
              onChange={e => setPodcastField('heading', e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-onyx flex items-center gap-2">
              Description
              <MarkdownBadge />
            </span>
            <textarea
              value={form.podcast.body}
              onChange={e => setPodcastField('body', e.target.value)}
              rows={3}
              className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white resize-y"
            />
            <p className="text-xs text-gray-400 mt-1">{MARKDOWN_HINT}</p>
          </label>

          <div className="space-y-3 pt-2">
            {PODCAST_PLATFORMS.map(({ key, label, placeholder, parse }) => {
              const platform = form.podcast[key]
              const resolved = parse(platform.url)
              return (
                <div key={key} className="border rounded p-4 space-y-3 bg-gray-50">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={platform.enabled}
                      onChange={e => setPodcastPlatform(key, 'enabled', e.target.checked)}
                      className="w-4 h-4 accent-deep-space-blue"
                    />
                    <span className="text-sm font-medium text-onyx">{label}</span>
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-onyx">Show / Channel URL</span>
                    <input
                      type="url"
                      value={platform.url}
                      onChange={e => setPodcastPlatform(key, 'url', e.target.value)}
                      placeholder={placeholder}
                      className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
                    />
                    <p className={`text-xs mt-1 ${platform.url && !resolved ? 'text-blood-red' : 'text-gray-400'}`}>
                      {platform.url
                        ? (resolved ? 'Embed link recognized.' : "Couldn't recognize this as an embeddable link — paste the public show/channel URL.")
                        : "Paste the public URL you'd share for this show."}
                    </p>
                  </label>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Author Bio ──────────────────────────────────────── */}
        <section hidden={activeTab !== 'bio'} className="bg-white rounded border p-6 space-y-4">
          <h2 className="font-semibold text-deep-space-blue">Author Bio</h2>
          <label className="block">
            <span className="text-sm font-medium text-onyx flex items-center gap-2">
              Short Bio
              <MarkdownBadge />
            </span>
            <textarea
              value={form.bioShort}
              onChange={e => setField('bioShort', e.target.value)}
              rows={3}
              className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white resize-y"
            />
            <p className="text-xs text-gray-400 mt-1">
              Home page bio blurb. If left blank, the Home page falls back to the start of Full Bio below
              (plain text only — Markdown isn't parsed in that fallback preview).
            </p>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-onyx flex items-center gap-2">
              Full Bio
              <MarkdownBadge />
            </span>
            <textarea
              value={form.bioLong}
              onChange={e => setField('bioLong', e.target.value)}
              rows={10}
              className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white resize-y"
            />
            <p className="text-xs text-gray-400 mt-1">About page biography. {MARKDOWN_HINT}</p>
          </label>
          <div>
            <span className="text-sm font-medium text-onyx">Headshot</span>
            <p className="text-xs text-gray-400 mt-0.5 mb-2">Photo shown on both the Home page and About page.</p>
            <div className="flex items-start gap-4">
              {form.headshotUrl && (
                <img
                  src={form.headshotUrl}
                  alt="Current headshot"
                  className="w-20 h-28 object-cover object-top rounded border shrink-0"
                />
              )}
              <div className="flex flex-col gap-2">
                <input
                  ref={headshotInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleHeadshotUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => headshotInputRef.current?.click()}
                  disabled={uploading}
                  className="text-sm bg-deep-space-blue text-mint-cream px-4 py-2 rounded hover:bg-regal-navy transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading…' : form.headshotUrl ? 'Replace Photo' : 'Upload Photo'}
                </button>
                {form.headshotUrl && (
                  <p className="text-xs text-gray-400 break-all">{form.headshotUrl}</p>
                )}
              </div>
            </div>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-onyx flex items-center gap-2">
              Pull Quote
              <MarkdownBadge />
            </span>
            <textarea
              value={form.pullQuote}
              onChange={e => setField('pullQuote', e.target.value)}
              rows={3}
              className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white resize-y"
              placeholder="A short quote from Andrea, shown on the About page. Leave blank to hide."
            />
            <p className="text-xs text-gray-400 mt-1">
              About page pull quote. Leave blank to hide that section. {MARKDOWN_HINT}
            </p>
          </label>
        </section>

        {/* ── Newsletters ─────────────────────────────────────── */}
        <section hidden={activeTab !== 'newsletters'} className="bg-white rounded border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-deep-space-blue">Newsletters</h2>
              <p className="text-xs text-gray-400 mt-0.5">Each entry becomes a card on the Newsletter page.</p>
            </div>
            <button
              type="button"
              onClick={addNewsletter}
              className="text-sm text-deep-space-blue hover:underline"
            >
              + Add
            </button>
          </div>

          {form.newsletters.length === 0 && (
            <p className="text-sm text-gray-400">No newsletters yet.</p>
          )}

          {form.newsletters.map((item, i) => (
            <div key={i} className="border rounded p-4 space-y-3 bg-gray-50">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Newsletter {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => moveNewsletter(i, -1)} disabled={i === 0}
                    className="text-gray-400 hover:text-deep-space-blue disabled:opacity-30 text-sm px-1">↑</button>
                  <button type="button" onClick={() => moveNewsletter(i, 1)} disabled={i === form.newsletters.length - 1}
                    className="text-gray-400 hover:text-deep-space-blue disabled:opacity-30 text-sm px-1">↓</button>
                  <button type="button" onClick={() => removeNewsletter(i)}
                    className="text-gray-400 hover:text-blood-red text-xl leading-none px-1">×</button>
                </div>
              </div>

              <label className="block">
                <span className="text-xs font-medium text-onyx">Label</span>
                <input
                  type="text"
                  value={item.label}
                  onChange={e => updateNewsletter(i, 'label', e.target.value)}
                  placeholder="e.g. Fantasy"
                  className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-onyx flex items-center gap-2">
                  Description
                  <MarkdownBadge />
                </span>
                <textarea
                  value={item.description}
                  onChange={e => updateNewsletter(i, 'description', e.target.value)}
                  rows={2}
                  placeholder="Short blurb shown on the card."
                  className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white resize-y"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-onyx">Subscribe URL</span>
                <input
                  type="url"
                  value={item.url}
                  onChange={e => updateNewsletter(i, 'url', e.target.value)}
                  placeholder="https://…"
                  className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
                />
              </label>

              <div>
                <span className="text-xs font-medium text-onyx">Card Color</span>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {BG_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      title={opt.label}
                      onClick={() => updateNewsletter(i, 'bg', opt.value)}
                      className={`w-8 h-8 rounded transition-all ${
                        item.bg === opt.value
                          ? 'ring-2 ring-blood-red ring-offset-2'
                          : 'ring-2 ring-transparent ring-offset-2 hover:ring-gray-300'
                      }`}
                      style={{ background: theme?.[opt.themeKey] ?? DEFAULT_THEME[opt.themeKey] }}
                    />
                  ))}

                  {/* Custom color */}
                  <div className={`flex items-center gap-1.5 rounded px-2 py-1 transition-all ${
                    !BG_OPTIONS.some(o => o.value === item.bg)
                      ? 'ring-2 ring-blood-red ring-offset-2'
                      : 'ring-2 ring-transparent ring-offset-2 hover:ring-gray-300'
                  }`}>
                    <input
                      type="color"
                      value={BG_OPTIONS.some(o => o.value === item.bg) ? '#002B4C' : (item.bg || '#002B4C')}
                      onChange={e => updateNewsletter(i, 'bg', e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                      title="Custom color"
                    />
                    <span className="text-xs text-gray-500">Custom</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Brand colors — to update them site-wide, go to{' '}
                  <a href="/admin/theme" className="underline hover:text-deep-space-blue">Theme Settings</a>.
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* ── Work With Me ────────────────────────────────────── */}
        <section hidden={activeTab !== 'workWithMe'} className="bg-white rounded border p-6 space-y-8">

          <div>
            <h2 className="font-semibold text-deep-space-blue">Work With Me</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Powers the /work-with-me page. The contact email used for its CTAs is managed on the{' '}
              <span className="font-medium">Contact Email</span> tab.
            </p>
          </div>

          {/* Consultants */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-deep-space-blue text-sm">Consultants</h3>
                <p className="text-xs text-gray-400 mt-0.5">One-on-One Consultations section — one card per consultant.</p>
              </div>
              <button type="button" onClick={addConsultant} className="text-sm text-deep-space-blue hover:underline">
                + Add
              </button>
            </div>

            {form.workWithMe.consultants.length === 0 && (
              <p className="text-sm text-gray-400">No consultants yet.</p>
            )}

            {form.workWithMe.consultants.map((c, i) => (
              <div key={i} className="border rounded p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Consultant {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => moveConsultant(i, -1)} disabled={i === 0}
                      className="text-gray-400 hover:text-deep-space-blue disabled:opacity-30 text-sm px-1">↑</button>
                    <button type="button" onClick={() => moveConsultant(i, 1)} disabled={i === form.workWithMe.consultants.length - 1}
                      className="text-gray-400 hover:text-deep-space-blue disabled:opacity-30 text-sm px-1">↓</button>
                    <button type="button" onClick={() => removeConsultant(i)}
                      className="text-gray-400 hover:text-blood-red text-xl leading-none px-1">×</button>
                  </div>
                </div>

                <label className="block">
                  <span className="text-xs font-medium text-onyx">Name</span>
                  <input
                    type="text"
                    value={c.name}
                    onChange={e => updateConsultant(i, 'name', e.target.value)}
                    className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-onyx">Tagline</span>
                  <input
                    type="text"
                    value={c.tagline}
                    onChange={e => updateConsultant(i, 'tagline', e.target.value)}
                    placeholder="e.g. Strategy · Marketing · Clarity"
                    className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-onyx flex items-center gap-2">
                    Bio
                    <MarkdownBadge />
                  </span>
                  <textarea
                    value={c.bio}
                    onChange={e => updateConsultant(i, 'bio', e.target.value)}
                    rows={6}
                    className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white resize-y"
                  />
                  <p className="text-xs text-gray-400 mt-1">{MARKDOWN_HINT}</p>
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-onyx">Button Label</span>
                  <input
                    type="text"
                    value={c.ctaLabel}
                    onChange={e => updateConsultant(i, 'ctaLabel', e.target.value)}
                    className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
                  />
                </label>
              </div>
            ))}
          </div>

          {/* Done-for-You Services */}
          <div className="space-y-3 border-t pt-6">
            <div>
              <h3 className="font-semibold text-deep-space-blue text-sm">Done-for-You Services</h3>
              <p className="text-xs text-gray-400 mt-0.5">Second section on the page, below One-on-One Consultations.</p>
            </div>
            <label className="block">
              <span className="text-xs font-medium text-onyx">Heading</span>
              <input
                type="text"
                value={form.workWithMe.doneForYou.heading}
                onChange={e => setDoneForYouField('heading', e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-onyx">Tag</span>
              <input
                type="text"
                value={form.workWithMe.doneForYou.tag}
                onChange={e => setDoneForYouField('tag', e.target.value)}
                placeholder="e.g. Project-based · Defined scope"
                className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-onyx flex items-center gap-2">
                Body
                <MarkdownBadge />
              </span>
              <textarea
                value={form.workWithMe.doneForYou.body}
                onChange={e => setDoneForYouField('body', e.target.value)}
                rows={6}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white resize-y"
              />
              <p className="text-xs text-gray-400 mt-1">{MARKDOWN_HINT}</p>
            </label>
          </div>

          {/* Speaking & Workshops */}
          <div className="space-y-3 border-t pt-6">
            <div>
              <h3 className="font-semibold text-deep-space-blue text-sm">Speaking &amp; Workshops</h3>
              <p className="text-xs text-gray-400 mt-0.5">Third and final section on the page.</p>
            </div>
            <label className="block">
              <span className="text-xs font-medium text-onyx flex items-center gap-2">
                Body
                <MarkdownBadge />
              </span>
              <textarea
                value={form.workWithMe.speaking.body}
                onChange={e => setSpeakingField('body', e.target.value)}
                rows={6}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white resize-y"
              />
              <p className="text-xs text-gray-400 mt-1">{MARKDOWN_HINT}</p>
            </label>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-onyx">"Andrea speaks to" bullets</span>
                <button type="button" onClick={() => addBullet('speaksTo')} className="text-sm text-deep-space-blue hover:underline">
                  + Add
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {form.workWithMe.speaking.speaksTo.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={item}
                      onChange={e => updateBullet('speaksTo', i, e.target.value)}
                      className="border rounded px-3 py-2 text-sm bg-white flex-1"
                    />
                    <button type="button" onClick={() => removeBullet('speaksTo', i)}
                      className="text-gray-400 hover:text-blood-red text-xl leading-none px-1">×</button>
                  </div>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-xs font-medium text-onyx">"Speaks to" note</span>
              <input
                type="text"
                value={form.workWithMe.speaking.speaksToNote}
                onChange={e => setSpeakingField('speaksToNote', e.target.value)}
                placeholder="e.g. Available for in-person and virtual engagements."
                className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
              />
            </label>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-onyx">Speaking Topics bullets</span>
                <button type="button" onClick={() => addBullet('topics')} className="text-sm text-deep-space-blue hover:underline">
                  + Add
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {form.workWithMe.speaking.topics.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={item}
                      onChange={e => updateBullet('topics', i, e.target.value)}
                      className="border rounded px-3 py-2 text-sm bg-white flex-1"
                    />
                    <button type="button" onClick={() => removeBullet('topics', i)}
                      className="text-gray-400 hover:text-blood-red text-xl leading-none px-1">×</button>
                  </div>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-xs font-medium text-onyx">Button Label</span>
              <input
                type="text"
                value={form.workWithMe.speaking.ctaLabel}
                onChange={e => setSpeakingField('ctaLabel', e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
              />
            </label>
          </div>

        </section>

        {/* ── Social Links ────────────────────────────────────── */}
        <section hidden={activeTab !== 'social'} className="bg-white rounded border p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-deep-space-blue">Social Links</h2>
            <p className="text-xs text-gray-400 mt-1">Leave blank to hide. Filled links appear in the footer and on the Work With Me page.</p>
          </div>
          {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
            <label key={key} className="block">
              <span className="text-sm font-medium text-onyx">{label}</span>
              <input
                type="url"
                value={form.socialLinks[key]}
                onChange={e => setSocialLink(key, e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
                placeholder={placeholder}
              />
            </label>
          ))}
        </section>

        {/* ── Contact Email ───────────────────────────────────── */}
        <section hidden={activeTab !== 'contact'} className="bg-white rounded border p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-deep-space-blue">Contact Email</h2>
            <p className="text-xs text-gray-400 mt-1">
              The one contact address for the site. Used on the Work With Me page — every "Book a Session" and
              "Inquire About Speaking" button, plus the visible contact address at the bottom of that page.
            </p>
          </div>
          <label className="block max-w-sm">
            <span className="text-sm font-medium text-onyx">Email</span>
            <input
              type="email"
              value={form.contactEmail}
              onChange={e => setField('contactEmail', e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 text-sm bg-white"
              placeholder={DEFAULT_CONTACT_EMAIL}
            />
          </label>
        </section>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-deep-space-blue text-mint-cream px-5 py-2 rounded text-sm font-medium hover:bg-regal-navy transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Content'}
          </button>
          {saved && <p className="text-sm text-green-600">Saved.</p>}
        </div>

      </form>
    </div>
  )
}
