import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title
    
    // Cleanup: restore previous title when component unmounts
    return () => {
      document.title = previousTitle
    }
  }, [title])
}
