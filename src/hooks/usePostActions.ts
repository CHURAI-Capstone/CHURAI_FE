import { useState } from 'react'

export function usePostActions(postId: number) {
  const [churaid, setChuraid] = useState(() => localStorage.getItem(`churai_${postId}`) === 'true')
  const [interested, setInterested] = useState(() => localStorage.getItem(`interested_${postId}`) === 'true')

  const toggleChurai = () => {
    const next = !churaid
    localStorage.setItem(`churai_${postId}`, String(next))
    setChuraid(next)
  }

  const toggleInterested = () => {
    const next = !interested
    localStorage.setItem(`interested_${postId}`, String(next))
    setInterested(next)
  }

  return { churaid, toggleChurai, interested, toggleInterested }
}
