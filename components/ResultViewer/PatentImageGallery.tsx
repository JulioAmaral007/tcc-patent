'use client'

import { useEffect, useState } from 'react'
import {
  getPatentImagesAction,
  getPatentImageBinaryAction,
} from '@/app/_actions/patent-actions'
import { PatentImage } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { ImageIcon, AlertCircle, Maximize2 } from 'lucide-react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface PatentImageGalleryProps {
  publicationNumber: string
}

export function PatentImageGallery({
  publicationNumber,
}: PatentImageGalleryProps) {
  const [images, setImages] = useState<PatentImage[]>([])
  const [imageBinaries, setImageBinaries] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchImages() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getPatentImagesAction(publicationNumber)
        // Limitamos a no máximo 4 imagens conforme solicitado
        const limitedImages = response.images.slice(0, 4)
        setImages(limitedImages)

        // Fetch the actual binary for each image URL (or path)
        const binaries: Record<string, string> = {}
        await Promise.all(
          limitedImages.map(async (img) => {
            try {
              // Note: image_path is what the binary endpoint expects
              const base64Data = await getPatentImageBinaryAction(
                img.image_path,
              )
              binaries[img.id] = base64Data
            } catch (err) {
              console.error(`Error fetching binary for image ${img.id}:`, err)
            }
          }),
        )
        setImageBinaries(binaries)
      } catch (err: unknown) {
        console.error('Error fetching patent images:', err)
        setError('Could not load images for this patent.')
      } finally {
        setIsLoading(false)
      }
    }

    if (publicationNumber) {
      fetchImages()
    }
  }, [publicationNumber])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-square rounded-xl bg-muted/50" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive text-sm mt-4 p-3 bg-destructive/10 rounded-lg">
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="text-sm text-muted-foreground mt-4 italic">
        No images available for this patent.
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon className="w-4 h-4 text-primary" />
        <h5 className="text-sm font-semibold">
          Patent Images ({images.length})
        </h5>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <Dialog key={img.id}>
            <DialogTrigger asChild>
              <Card className="group relative aspect-square overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all border-border bg-muted/30">
                {imageBinaries[img.id] ? (
                  <Image
                    src={imageBinaries[img.id]}
                    alt={img.description || 'Patent Image'}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Skeleton className="w-full h-full" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="w-6 h-6 text-white" />
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg">
                  {img.image_filename}
                </DialogTitle>
              </DialogHeader>
              <div className="relative aspect-video w-full mt-4 bg-white rounded-lg border border-border">
                {imageBinaries[img.id] && (
                  <Image
                    src={imageBinaries[img.id]}
                    alt={img.description || 'Patent Image'}
                    fill
                    className="object-contain p-4"
                    unoptimized
                  />
                )}
              </div>
              {img.description && (
                <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border">
                  <p className="text-sm text-foreground leading-relaxed">
                    <span className="font-bold text-primary mr-2">
                      Descrição:
                    </span>
                    {img.description}
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}
