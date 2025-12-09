'use client'

import { FileImage, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'

interface ImagePreviewProps {
  file: File | null
}

export function ImagePreview({ file }: ImagePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreview(null)
    }
  }, [file])

  if (!file) return null

  if (file.type === 'application/pdf') {
    return (
      <Card className="p-6 bg-muted/50 flex flex-col items-center justify-center">
        <FileText className="w-12 h-12 text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Documento PDF</p>
        <p className="text-xs text-muted-foreground">{file.name}</p>
      </Card>
    )
  }

  if (preview) {
    return (
      <Card className="overflow-hidden bg-muted/50">
        <div className="relative aspect-video">
          <img
            src={preview}
            alt="Preview do arquivo"
            className="absolute inset-0 w-full h-full object-contain"
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
