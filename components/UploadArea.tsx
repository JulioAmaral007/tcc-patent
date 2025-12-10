'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getFileTypeLabel, isValidFileType } from '@/lib/ocr'
import { cn } from '@/lib/utils'
import { AlertCircle, FileImage, FileText, Upload, X } from 'lucide-react'
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

      if (!isValidFileType(file)) {
        setError('Tipo de arquivo não suportado. Use PNG, JPG ou PDF.')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('Arquivo muito grande. Máximo permitido: 10MB.')
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
      'application/pdf': ['.pdf'],
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
      <label className="text-sm font-medium text-foreground">
        Upload de Arquivo
      </label>

      {!selectedFile ? (
        <Card
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed cursor-pointer transition-all duration-200',
            'hover:border-primary hover:bg-primary/5',
            isDragActive && 'border-primary bg-primary/10 shadow-glow',
            isProcessing && 'opacity-50 cursor-not-allowed',
            error && 'border-destructive',
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div
              className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors',
                isDragActive ? 'bg-primary/20' : 'bg-secondary',
              )}
            >
              <Upload
                className={cn(
                  'w-6 h-6 transition-colors',
                  isDragActive ? 'text-primary' : 'text-muted-foreground',
                )}
              />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {isDragActive
                ? 'Solte o arquivo aqui'
                : 'Arraste e solte um arquivo'}
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              ou clique para selecionar
            </p>
            <div className="flex gap-2">
              <span className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground">
                PNG
              </span>
              <span className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground">
                JPG
              </span>
              <span className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground">
                PDF
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {selectedFile.type === 'application/pdf' ? (
                <FileText className="w-5 h-5 text-primary" />
              ) : (
                <FileImage className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {getFileTypeLabel(selectedFile)} •{' '}
                {formatFileSize(selectedFile.size)}
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
