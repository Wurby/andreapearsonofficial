import { createContext, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { doc, onSnapshot, collection } from 'firebase/firestore'
import { db } from '../lib/firebase'

const ThemeContext = createContext(null)

const DEFAULTS = {
  deepSpaceBlue: '#002B4C',
  regalNavy: '#003A67',
  mintCream: '#F1F9F7',
  onyx: '#0A0C08',
  bloodRed: '#900101',
}

export function ThemeProvider({ children }) {
  const [siteTheme, setSiteTheme] = useState(DEFAULTS)
  const [genres, setGenres] = useState([])
  const location = useLocation()

  useEffect(() => {
    const unsubTheme = onSnapshot(doc(db, 'settings', 'theme'), snap => {
      setSiteTheme(snap.exists() ? snap.data() : DEFAULTS)
    })
    const unsubGenres = onSnapshot(collection(db, 'genres'), snap => {
      setGenres(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => {
      unsubTheme()
      unsubGenres()
    }
  }, [])

  const genreSlug = location.pathname.match(/^\/books\/([^/]+)/)?.[1] ?? null
  const genreOverride = genreSlug
    ? (genres.find(g => g.slug === genreSlug)?.colors ?? null)
    : null

  const activeTheme = genreOverride
    ? { ...siteTheme, ...genreOverride }
    : siteTheme

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--color-deep-space-blue', activeTheme.deepSpaceBlue)
    root.style.setProperty('--color-regal-navy',      activeTheme.regalNavy)
    root.style.setProperty('--color-mint-cream',      activeTheme.mintCream)
    root.style.setProperty('--color-onyx',            activeTheme.onyx)
    root.style.setProperty('--color-blood-red',       activeTheme.bloodRed)
  }, [activeTheme])

  return (
    <ThemeContext.Provider value={activeTheme}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useActiveTheme = () => useContext(ThemeContext)
