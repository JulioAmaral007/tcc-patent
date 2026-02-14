'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function ResultIdError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-6 p-6">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">
        Error loading analysis
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        Could not load this analysis result. It may not exist or you may not
        have access.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline" className="rounded-xl">
          Try again
        </Button>
        <Button
          onClick={() => router.push('/')}
          variant="default"
          className="rounded-xl"
        >
          New analysis
        </Button>
      </div>
    </div>
  )
}
