import { useEffect, useState, useRef } from 'react'
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

const DEFAULT_TYPES = [
  { id: 'novel',        name: 'Novel' },
  { id: 'novella',      name: 'Novella' },
  { id: 'short-story',  name: 'Short Story' },
  { id: 'picture-book', name: 'Picture Book' },
  { id: 'collection',   name: 'Collection' },
]

export function useTypes() {
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const seeded = useRef(false)

  useEffect(() => {
    return onSnapshot(collection(db, 'types'), snap => {
      if (snap.empty && !seeded.current) {
        seeded.current = true
        DEFAULT_TYPES.forEach(t => setDoc(doc(db, 'types', t.id), { name: t.name }))
      }
      setTypes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  return { types, loading }
}
