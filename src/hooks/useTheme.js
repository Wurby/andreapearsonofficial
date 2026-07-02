import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useTheme() {
  const [theme, setTheme] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onSnapshot(doc(db, 'settings', 'theme'), snap => {
      setTheme(snap.exists() ? snap.data() : null)
      setLoading(false)
    })
  }, [])

  return { theme, loading }
}
