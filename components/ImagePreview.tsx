'use client'

import { Card } from '@/components/ui/card'
import { FileImage } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import Image from 'next/image'

interface ImagePreviewProps {
  file: File | null
}

export function ImagePreview({ file }: ImagePreviewProps) {
  const preview = useMemo(() => {
    if (!file || !file.type.startsWith('image/')) return null
    return URL.createObjectURL(file)
  }, [file])

  // Cleanup: revoke blob URL when preview changes or on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  if (!file) return null

  if (preview) {
    return (
      <Card className="overflow-hidden bg-muted/50">
        <div className="relative aspect-video">
          <Image
            src={preview}
            alt={`Preview do arquivo ${file.name}`}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <FileImage className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {file.name}
            </span>
          </div>
        </div>
      </Card>
    )
  }

  return null
}
