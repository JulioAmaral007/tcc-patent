'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import { cn } from '@/lib/utils'
import { AlertCircle, FileImage, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface UploadAreaProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onClearFile: () => void
  isProcessing: boolean
}

export function UploadArea({
  onFileSelect,
  selectedFile,
  onClearFile,
  isProcessing,
}: UploadAreaProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null)

      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]

      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError('Unsupported file type. Use PNG, JPG or WebP.')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('File too large. Maximum allowed: 10MB.')
        return
      }

      onFileSelect(file)
    },
    [onFileSelect],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">File Upload</label>

      {!selectedFile ? (
        <Card
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed cursor-pointer transition-all duration-300 rounded-lg',
            'hover:border-primary/60 hover:bg-primary/5',
            isDragActive &&
              'border-primary bg-primary/10 shadow-glow scale-[1.01]',
            isProcessing && 'opacity-50 cursor-not-allowed',
            error && 'border-destructive',
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div
              className={cn(
                'w-16 h-16 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 shadow-sm',
                isDragActive
                  ? 'bg-primary/20 scale-110 shadow-glow'
                  : 'bg-secondary/40',
              )}
            >
              <Upload
                className={cn(
                  'w-6 h-6 transition-colors',
                  isDragActive ? 'text-primary' : 'text-muted-foreground',
                )}
              />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              {isDragActive
                ? 'Drop the file to analyze'
                : 'Drag and drop the patent file'}
            </p>
            <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">
              Supports technical documents (Image/PDF) up to 10MB
            </p>
            <div className="flex gap-3">
              <span className="px-4 py-2 text-xs rounded-full bg-secondary/60 text-secondary-foreground font-semibold border border-border/30">
                PNG
              </span>
              <span className="px-4 py-2 text-xs rounded-full bg-secondary/60 text-secondary-foreground font-semibold border border-border/30">
                JPG
              </span>
              <span className="px-4 py-2 text-xs rounded-full bg-secondary/60 text-secondary-foreground font-semibold border border-border/30">
                WEBP
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 bg-card/80 rounded-lg border-border/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileImage className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Image • {formatFileSize(selectedFile.size)}
              </p>
            </div>
            {!isProcessing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onClearFile()
                }}
                className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
