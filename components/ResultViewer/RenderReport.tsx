'use client'

import { Search, Image as ImageIcon, FileText, ChevronUp } from 'lucide-react'
import { DetailItem } from './DetailItem'
import { PatentImageGallery } from './PatentImageGallery'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type {
  AnalysisResultData,
  PatentsSimilarityResponse,
  ChunksSimilarityResponse,
  ImagesSearchResponse,
  SimilarPatent,
  SimilarPatentByChunks,
  SimilarImage,
} from '@/lib/types'

interface RenderReportProps {
  /** Dados estruturados (preferido): renderização sem parse por regex */
  data?: AnalysisResultData | null
  /** Texto formatado: usado para fallback (itens antigos) e para export PDF/clipboard */
  text?: string | null
}

function isImagesResponse(d: AnalysisResultData): d is ImagesSearchResponse {
  return (
    'similar_images' in d &&
    Array.isArray((d as ImagesSearchResponse).similar_images)
  )
}

function isChunksResponse(
  d: AnalysisResultData,
): d is ChunksSimilarityResponse {
  if (!('similar_patents' in d)) return false
  const first = (d as ChunksSimilarityResponse).similar_patents?.[0]
  return (
    first != null &&
    'chunks' in first &&
    Array.isArray((first as SimilarPatentByChunks).chunks)
  )
}

function SummarySection({
  data,
}: {
  data:
    | PatentsSimilarityResponse
    | ChunksSimilarityResponse
    | ImagesSearchResponse
}) {
  const summaryLines: { label: string; value: string }[] = []
  if ('total_found' in data) {
    summaryLines.push({ label: 'Total found', value: String(data.total_found) })
  }
  if ('similarity_threshold' in data) {
    summaryLines.push({
      label: 'Similarity Threshold',
      value: `${(data.similarity_threshold * 100).toFixed(0)}%`,
    })
  }
  if ('max_results' in data) {
    summaryLines.push({ label: 'Max results', value: String(data.max_results) })
  }
  if ('query_embedding_dimension' in data) {
    summaryLines.push({
      label: 'Embedding dimension',
      value: String(data.query_embedding_dimension),
    })
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Search className="w-4 h-4 text-primary" />
        </div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Search Summary
        </span>
      </div>
      <div className="h-px bg-border/50 mb-4" />
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 px-2">
        {summaryLines.map((line, idx) => (
          <li key={idx} className="flex items-baseline gap-2 group">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors mt-1.5 flex-shrink-0" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {line.label}:
            </span>
            <span className="text-sm text-foreground font-semibold">
              {line.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PatentCard({
  patent,
  index,
  expandedImages,
  onToggleImages,
  showChunks,
}: {
  patent: SimilarPatent | SimilarPatentByChunks
  index: number
  expandedImages: Record<number, boolean>
  onToggleImages: (idx: number) => void
  showChunks?: boolean
}) {
  const pubNumber = patent.publication_number || null
  const details: { label: string; value: string; isHighValue?: boolean }[] = [
    {
      label: 'Publication No.',
      value: patent.publication_number || 'N/A',
      isHighValue: true,
    },
    { label: 'Application No.', value: patent.application_number || 'N/A' },
    { label: 'Date', value: patent.publication_date || 'N/A' },
    {
      label: 'Similarity',
      value: `${(patent.similarity_score * 100).toFixed(1)}%`,
      isHighValue: true,
    },
    { label: 'Organization', value: patent.orgname || 'N/A' },
    { label: 'IPC Codes', value: patent.ipc_codes?.join(', ') || 'N/A' },
    { label: 'Abstract', value: patent.abstract || 'N/A' },
  ]

  return (
    <div className="group relative">
      <div className="absolute -inset-2 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-muted/30 border border-border/50 rounded-2xl p-5 hover:border-primary/30 transition-all shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h4 className="text-base font-bold text-foreground flex items-center gap-3 flex-1">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-primary text-primary-foreground text-xs font-mono shadow-sm flex-shrink-0">
              {index + 1}
            </span>
            {patent.title || 'No title'}
          </h4>
          {pubNumber && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleImages(index)}
              className="h-8 rounded-lg gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {expandedImages[index] ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> Hide Images
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5" /> Show Images
                </>
              )}
            </Button>
          )}
        </div>
        <div className="space-y-1.5 font-mono text-[13px] text-muted-foreground ml-2">
          {details.map((d, dIdx) => (
            <DetailItem
              key={dIdx}
              label={d.label}
              value={d.value}
              isHighValue={!!d.isHighValue}
              isLast={dIdx === details.length - 1 && !showChunks}
            />
          ))}
          {showChunks && 'chunks' in patent && patent.chunks?.length ? (
            <div className="pt-2">
              <span className="text-muted-foreground/80">Related Chunks:</span>
              {patent.chunks.map((chunk, cIdx) => (
                <div key={cIdx} className="pl-2 mt-1 text-sm">
                  {cIdx + 1}. &quot;
                  {chunk.length > 150 ? chunk.substring(0, 150) + '...' : chunk}
                  &quot;
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {pubNumber && expandedImages[index] && (
          <div className="mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <PatentImageGallery publicationNumber={pubNumber} />
          </div>
        )}
      </div>
    </div>
  )
}

function ImageCard({
  image,
  index,
  expandedImages,
  onToggleImages,
}: {
  image: SimilarImage
  index: number
  expandedImages: Record<number, boolean>
  onToggleImages: (idx: number) => void
}) {
  const pubNumber = image.publication_number || null
  const details: { label: string; value: string; isHighValue?: boolean }[] = [
    { label: 'Image ID', value: String(image.image_id) },
    {
      label: 'Publication No.',
      value: image.publication_number || 'N/A',
      isHighValue: true,
    },
    { label: 'File', value: image.image_filename || 'N/A' },
    {
      label: 'Similarity',
      value: `${(image.similarity_score * 100).toFixed(1)}%`,
      isHighValue: true,
    },
    { label: 'Date', value: image.publication_date || 'N/A' },
    { label: 'Organization', value: image.orgname || 'N/A' },
    { label: 'Abstract', value: image.abstract || 'N/A' },
  ]
  return (
    <div className="group relative">
      <div className="absolute -inset-2 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-muted/30 border border-border/50 rounded-2xl p-5 hover:border-primary/30 transition-all shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h4 className="text-base font-bold text-foreground flex items-center gap-3 flex-1">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-primary text-primary-foreground text-xs font-mono shadow-sm flex-shrink-0">
              {index + 1}
            </span>
            {image.title || 'No title'}
          </h4>
          {pubNumber && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleImages(index)}
              className="h-8 rounded-lg gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {expandedImages[index] ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> Hide Images
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5" /> Show Images
                </>
              )}
            </Button>
          )}
        </div>
        <div className="space-y-1.5 font-mono text-[13px] text-muted-foreground ml-2">
          {details.map((d, dIdx) => (
            <DetailItem
              key={dIdx}
              label={d.label}
              value={d.value}
              isHighValue={!!d.isHighValue}
              isLast={dIdx === details.length - 1}
            />
          ))}
        </div>
        {pubNumber && expandedImages[index] && (
          <div className="mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <PatentImageGallery publicationNumber={pubNumber} />
          </div>
        )}
      </div>
    </div>
  )
}

/** Renderização a partir de dados estruturados (sem regex) */
function RenderFromData({ data }: { data: AnalysisResultData }) {
  const [expandedImages, setExpandedImages] = useState<Record<number, boolean>>(
    {},
  )
  const toggleImages = (idx: number) =>
    setExpandedImages((prev) => ({ ...prev, [idx]: !prev[idx] }))

  const isImage = isImagesResponse(data)
  const isChunks = isChunksResponse(data)

  return (
    <div className="space-y-8 font-sans">
      <SummarySection data={data} />
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
            {isImage ? (
              <ImageIcon className="w-4 h-4 text-accent" />
            ) : (
              <FileText className="w-4 h-4 text-accent" />
            )}
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Results Found
          </span>
        </div>
        <div className="h-px bg-border/50 mb-6" />
        <div className="space-y-6">
          {isImage
            ? (data as ImagesSearchResponse).similar_images.map((img, idx) => (
                <ImageCard
                  key={idx}
                  image={img}
                  index={idx}
                  expandedImages={expandedImages}
                  onToggleImages={toggleImages}
                />
              ))
            : (
                data as PatentsSimilarityResponse | ChunksSimilarityResponse
              ).similar_patents.map((patent, idx) => (
                <PatentCard
                  key={idx}
                  patent={patent}
                  index={idx}
                  expandedImages={expandedImages}
                  onToggleImages={toggleImages}
                  showChunks={isChunks}
                />
              ))}
        </div>
      </div>
    </div>
  )
}

/** Fallback: parse do texto formatado (itens antigos do histórico) */
function RenderFromText({ text }: { text: string }) {
  const [expandedImages, setExpandedImages] = useState<Record<number, boolean>>(
    {},
  )
  const toggleImages = (idx: number) =>
    setExpandedImages((prev) => ({ ...prev, [idx]: !prev[idx] }))

  const isFormattedReport =
    text.includes('════════════') &&
    (text.includes('📊 RESUMO DA BUSCA') || text.includes('📊 SEARCH SUMMARY'))

  if (!isFormattedReport) {
    return (
      <div className="font-mono text-sm leading-relaxed text-foreground/90 selection:bg-primary/20 bg-muted/20 p-4 rounded-xl border border-border/50">
        <pre className="whitespace-pre-wrap">{text}</pre>
      </div>
    )
  }

  const titleMatch = text.match(/═════+\n\s+(.*?)\n\s+═════+/s)
  const reportTitle = titleMatch ? titleMatch[1].trim() : 'ANALYSIS RESULT'
  const sections = text.split(
    /📊 RESUMO DA BUSCA|📊 SEARCH SUMMARY|📋 PATENTES SIMILARES|📋 SIMILAR PATENTS|📋 TRECHOS SIMILARES|📋 SIMILAR EXCERPTS|🖼️ IMAGENS SIMILARES|🖼️ SIMILAR IMAGES/,
  )
  const summaryPart = sections[1] || ''
  const resultsPart = sections[2] || ''
  const summaryLines = summaryPart
    .split('\n')
    .filter((l) => l.includes('•'))
    .map((l) => l.replace('•', '').replace('───', '').trim())
  const items = resultsPart
    .split(/\n\s*(?=\d+\.\s)/)
    .filter((i) => i.trim().length > 0 && /^\d+\./.test(i.trim()))

  return (
    <div className="space-y-8 font-sans">
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Search className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Search Summary
          </span>
        </div>
        <div className="h-px bg-border/50 mb-4" />
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 px-2">
          {summaryLines.map((line, idx) => {
            const parts = line.split(':')
            const label = parts[0]
            const value = parts.slice(1).join(':')
            return (
              <li key={idx} className="flex items-baseline gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors mt-1.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {label}:
                </span>
                <span className="text-sm text-foreground font-semibold">
                  {value}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
            {reportTitle.includes('IMAGE') || reportTitle.includes('IMAGEM') ? (
              <ImageIcon className="w-4 h-4 text-accent" />
            ) : (
              <FileText className="w-4 h-4 text-accent" />
            )}
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Results Found
          </span>
        </div>
        <div className="h-px bg-border/50 mb-6" />
        <div className="space-y-6">
          {items.map((item, idx) => {
            const itemLines = item.trim().split('\n')
            const title = itemLines[0]
            const details = itemLines.slice(1)
            const pubLine = details.find(
              (d) =>
                d.toLowerCase().includes('publicação') ||
                d.toLowerCase().includes('publication'),
            )
            const publicationNumber = pubLine
              ? pubLine.split(':')[1]?.trim()
              : null
            return (
              <div key={idx} className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-muted/30 border border-border/50 rounded-2xl p-5 hover:border-primary/30 transition-all shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h4 className="text-base font-bold text-foreground flex items-center gap-3 flex-1">
                      <span className="flex items-center justify-center w-6 h-6 rounded-md bg-primary text-primary-foreground text-xs font-mono shadow-sm flex-shrink-0">
                        {idx + 1}
                      </span>
                      {title.replace(/^\d+\.\s*/, '')}
                    </h4>
                    {publicationNumber && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleImages(idx)}
                        className="h-8 rounded-lg gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        {expandedImages[idx] ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" /> Hide Images
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-3.5 h-3.5" /> Show Images
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1.5 font-mono text-[13px] text-muted-foreground ml-2">
                    {details.map((detail, dIdx) => {
                      const parts = detail.split(':')
                      const label = parts[0]
                      const value = parts.slice(1).join(':')
                      const isHighValue =
                        detail.includes('Similaridade') ||
                        detail.includes('Similarity') ||
                        detail.includes('Publicação') ||
                        detail.includes('Publication')
                      return (
                        <DetailItem
                          key={dIdx}
                          label={label}
                          value={value}
                          isHighValue={isHighValue}
                          isLast={dIdx === details.length - 1}
                        />
                      )
                    })}
                  </div>
                  {publicationNumber && expandedImages[idx] && (
                    <div className="mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                      <PatentImageGallery
                        publicationNumber={publicationNumber}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function RenderReport({ data, text }: RenderReportProps) {
  if (data != null) {
    return <RenderFromData data={data} />
  }
  if (text != null && text.trim() !== '') {
    return <RenderFromText text={text} />
  }
  return (
    <div className="font-mono text-sm leading-relaxed text-muted-foreground p-4">
      No result to display.
    </div>
  )
}
