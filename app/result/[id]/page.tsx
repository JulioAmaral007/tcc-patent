import type { Metadata } from 'next'
import { ResultPageClient } from './ResultPageClient'

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  await params
  return {
    title: 'Patent Analysis',
    description: 'View patent analysis result and similar patents.',
  }
}

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params
  return <ResultPageClient id={id} />
}
