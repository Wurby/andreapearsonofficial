import { useState } from 'react'

// Same API as useState, but persisted to sessionStorage under `key` — survives
// component remounts (route navigation) without needing a shared context.
export function useSessionState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = sessionStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  function set(next) {
    setValue(prev => {
      const resolved = typeof next === 'function' ? next(prev) : next
      try {
        sessionStorage.setItem(key, JSON.stringify(resolved))
      } catch {
        // ignore storage errors (e.g. private browsing)
      }
      return resolved
    })
  }

  return [value, set]
}
