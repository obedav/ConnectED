'use client'

import { useEffect, useRef } from 'react'

export function useIntersectionObserver(
  callback: () => void,
  rootMargin = '200px'
) {
  const ref = useRef<HTMLDivElement>(null)
  // Keep callback stable without causing re-subscription
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) cbRef.current()
      },
      { rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
    // rootMargin is stable at call-site; re-run only when it changes
  }, [rootMargin])

  return ref
}
