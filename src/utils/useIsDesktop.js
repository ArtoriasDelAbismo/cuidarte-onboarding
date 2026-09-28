import { useEffect, useState } from 'react'

export const DESKTOP_QUERY = '(min-width: 1024px)'

function matches() {
  return typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches
}

export default function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(matches)

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY)
    const onChange = () => setIsDesktop(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return isDesktop
}
