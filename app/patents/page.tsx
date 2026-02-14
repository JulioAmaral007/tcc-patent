import type { Metadata } from 'next'
import { listPatentsAction } from '@/app/_actions/patent-actions'
import { AppLayout } from '@/components/layout'
import { PatentsTable } from '@/components/PatentsTable'

export const metadata: Metadata = {
  title: 'Registered Patents | Patent Analyzer',
  description: 'View and manage the patents indexed in the system.',
}

interface PatentsPageProps {
  searchParams: Promise<{
    page?: string
    page_size?: string
    sort_by?: string
    sort_order?: string
  }>
}

export default async function PatentsPage({ searchParams }: PatentsPageProps) {
  const params = await searchParams
  const page = Number(params?.page) || 1
  const pageSize = Number(params?.page_size) || 10
  const sortBy = params?.sort_by || 'publication_date'
  const sortOrder = (params?.sort_order as 'asc' | 'desc') || 'desc'

  const data = await listPatentsAction({
    page,
    page_size: pageSize,
    sort_by: sortBy,
    sort_order: sortOrder,
  })

  return (
    <AppLayout activePage="patents">
      <PatentsTable initialData={data} searchParams={params ?? {}} />
    </AppLayout>
  )
}
