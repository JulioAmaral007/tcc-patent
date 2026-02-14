'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react'
import type { ListPatentsResponse } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface PatentsTableProps {
  initialData: ListPatentsResponse
  searchParams: {
    page?: string
    page_size?: string
    sort_by?: string
    sort_order?: string
  }
}

function buildQueryString(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') q.set(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

export function PatentsTable({ initialData, searchParams }: PatentsTableProps) {
  const router = useRouter()
  const page = Number(searchParams?.page) || 1
  const pageSize = Number(searchParams?.page_size) || 10
  const sortBy = searchParams?.sort_by || 'publication_date'
  const sortOrder = (searchParams?.sort_order as 'asc' | 'desc') || 'desc'

  const [expandedPatents, setExpandedPatents] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedPatents((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const baseParams = {
    page_size: pageSize,
    sort_by: sortBy,
    sort_order: sortOrder,
  }
  const prevPage = Math.max(1, page - 1)
  const nextPage = Math.min(initialData.total_pages, page + 1)

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return <span className="w-4 h-4 inline-block" />
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1 inline-block" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1 inline-block" />
    )
  }

  const sortLink = (column: string) => {
    const nextOrder = sortBy === column && sortOrder === 'desc' ? 'asc' : 'desc'
    return `/patents${buildQueryString({ ...baseParams, page: 1, sort_by: column, sort_order: nextOrder })}`
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Registered Patents
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
            View and manage the patents indexed in the system
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="p-3 sm:p-4 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium">
              Items per page:
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                router.push(
                  `/patents${buildQueryString({ ...baseParams, page_size: val, page: 1 })}`,
                )
              }}
            >
              <SelectTrigger className="w-[70px] sm:w-[80px] h-8 sm:h-10 bg-background text-xs sm:text-sm">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative overflow-x-auto scrollbar-custom">
          {!initialData.patents.length ? (
            <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">No patents found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] sm:w-[50px]"></TableHead>
                  <TableHead className="cursor-pointer hover:text-foreground transition-colors text-xs sm:text-sm">
                    <Link href={sortLink('title')}>
                      Title {renderSortIcon('title')}
                    </Link>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-foreground transition-colors text-xs sm:text-sm">
                    <Link href={sortLink('publication_number')}>
                      Pub. Number {renderSortIcon('publication_number')}
                    </Link>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-foreground transition-colors text-xs sm:text-sm hidden md:table-cell">
                    <Link href={sortLink('publication_date')}>
                      Date {renderSortIcon('publication_date')}
                    </Link>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-foreground transition-colors text-xs sm:text-sm hidden lg:table-cell">
                    <Link href={sortLink('orgname')}>
                      Organization {renderSortIcon('orgname')}
                    </Link>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialData.patents.map((patent) => (
                  <React.Fragment key={patent.publication_number}>
                    <TableRow
                      className={cn(
                        'cursor-pointer transition-colors',
                        expandedPatents.has(patent.publication_number)
                          ? 'bg-muted/50'
                          : 'hover:bg-muted/30',
                      )}
                      onClick={() => toggleExpand(patent.publication_number)}
                    >
                      <TableCell className="py-3">
                        {expandedPatents.has(patent.publication_number) ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium py-3">
                        <div
                          className="line-clamp-2 text-xs sm:text-sm"
                          title={patent.title}
                        >
                          {patent.title || 'No title'}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-[10px] sm:text-xs py-3">
                        {patent.publication_number}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground text-[10px] sm:text-xs py-3 hidden md:table-cell">
                        {patent.publication_date || 'N/A'}
                      </TableCell>
                      <TableCell
                        className="whitespace-nowrap text-muted-foreground text-[10px] sm:text-xs py-3 hidden lg:table-cell max-w-[200px] truncate"
                        title={patent.orgname}
                      >
                        {patent.orgname || 'N/A'}
                      </TableCell>
                    </TableRow>
                    {expandedPatents.has(patent.publication_number) && (
                      <TableRow className="hover:bg-transparent bg-muted/20 border-t-0">
                        <TableCell colSpan={5} className="p-0 border-t-0">
                          <div className="p-4 sm:p-6 pl-8 sm:pl-14 grid gap-4 animate-in slide-in-from-top-2 duration-200">
                            <div>
                              <h4 className="font-semibold text-xs sm:text-sm mb-1 text-foreground">
                                Abstract
                              </h4>
                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                {patent.abstract || 'No abstract available.'}
                              </p>
                            </div>
                            {patent.ipc_codes?.length ? (
                              <div>
                                <h4 className="font-semibold text-xs sm:text-sm mb-1 text-foreground">
                                  IPC Codes
                                </h4>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                  {patent.ipc_codes.map((code) => (
                                    <span
                                      key={code}
                                      className="px-1.5 sm:px-2 py-0.5 rounded-full bg-background border border-border text-[10px] sm:text-xs font-medium font-mono text-muted-foreground"
                                    >
                                      {code}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                            <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 text-[10px] sm:text-xs text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <span className="font-semibold">
                                  App Number:
                                </span>{' '}
                                {patent.application_number || 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="font-semibold">
                                  Main Group:
                                </span>{' '}
                                {patent.maingroup || 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="font-semibold">SubGroup:</span>{' '}
                                {patent.subgroup || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-border flex flex-col lg:flex-row items-center justify-between gap-4 bg-muted/30">
          <div className="text-[10px] sm:text-sm text-muted-foreground text-center lg:text-left">
            Showing{' '}
            <span className="font-medium text-foreground">
              {(page - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium text-foreground">
              {Math.min(page * pageSize, initialData.total_count)}
            </span>{' '}
            of{' '}
            <span className="font-medium text-foreground">
              {initialData.total_count}
            </span>{' '}
            results
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {initialData.has_previous ? (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                asChild
              >
                <Link
                  href={`/patents${buildQueryString({ ...baseParams, page: 1 })}`}
                  title="First page"
                >
                  <ChevronsLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                disabled
              >
                <ChevronsLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            )}
            {initialData.has_previous ? (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                asChild
              >
                <Link
                  href={`/patents${buildQueryString({ ...baseParams, page: prevPage })}`}
                  title="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                disabled
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            )}
            <div className="flex items-center justify-center min-w-[100px] sm:min-w-[140px] text-[11px] sm:text-sm font-medium bg-background border border-border rounded-lg h-8 sm:h-10 px-2 sm:px-4">
              Page <span className="text-primary mx-1">{initialData.page}</span>{' '}
              of {initialData.total_pages}
            </div>
            {initialData.has_next ? (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                asChild
              >
                <Link
                  href={`/patents${buildQueryString({ ...baseParams, page: nextPage })}`}
                  title="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                disabled
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            )}
            {initialData.has_next ? (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                asChild
              >
                <Link
                  href={`/patents${buildQueryString({ ...baseParams, page: initialData.total_pages })}`}
                  title="Last page"
                >
                  <ChevronsRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                disabled
              >
                <ChevronsRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
