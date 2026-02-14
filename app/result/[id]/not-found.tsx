import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function ResultNotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-6 p-6">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <FileQuestion className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">
        Analysis not found
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        This analysis result does not exist or has been removed.
      </p>
      <Button asChild variant="outline" className="rounded-xl">
        <Link href="/">Start new analysis</Link>
      </Button>
    </div>
  )
}
