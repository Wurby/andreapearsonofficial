import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useContent() {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onSnapshot(doc(db, 'settings', 'content'), snap => {
      setContent(snap.exists() ? snap.data() : null)
      setLoading(false)
    })
  }, [])

  return { content, loading }
}
