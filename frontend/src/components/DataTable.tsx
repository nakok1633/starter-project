/**
 * 범용 데이터 테이블 컴포넌트
 * - TanStack Table 기반
 * - 서버사이드/클라이언트사이드 페이지네이션 지원
 * - 검색, 정렬 기능 포함
 * - 로딩 상태 표시
 */

"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** DataTable 컴포넌트 Props */
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]   // 테이블 컬럼 정의
  data: TData[]                          // 표시할 데이터 배열
  searchPlaceholder?: string             // 검색창 placeholder
  searchKey?: string                     // 클라이언트 검색 시 필터링할 키
  // 서버사이드 페이지네이션 옵션
  pageCount?: number                     // 전체 페이지 수
  pageIndex?: number                     // 현재 페이지 (0부터 시작)
  pageSize?: number                      // 페이지당 항목 수
  onPaginationChange?: (pageIndex: number, pageSize: number) => void  // 페이지 변경 콜백
  onSearchChange?: (search: string) => void  // 검색어 변경 콜백
  isLoading?: boolean                    // 로딩 상태
  totalElements?: number                 // 전체 항목 수
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "검색...",
  searchKey,
  pageCount: serverPageCount,
  pageIndex: serverPageIndex,
  pageSize: serverPageSize,
  onPaginationChange,
  onSearchChange,
  isLoading = false,
  totalElements,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [searchValue, setSearchValue] = React.useState("")

  const isServerSide = serverPageCount !== undefined

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: isServerSide,
    pageCount: serverPageCount,
    state: {
      sorting,
      columnFilters,
      ...(isServerSide && {
        pagination: {
          pageIndex: serverPageIndex || 0,
          pageSize: serverPageSize || 10,
        },
      }),
    },
  })

  const handleSearch = (value: string) => {
    setSearchValue(value)
    if (onSearchChange) {
      onSearchChange(value)
    } else if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(value)
    }
  }

  const currentPageIndex = isServerSide ? (serverPageIndex || 0) : table.getState().pagination.pageIndex
  const currentPageSize = isServerSide ? (serverPageSize || 10) : table.getState().pagination.pageSize
  const totalPages = isServerSide ? (serverPageCount || 0) : table.getPageCount()

  return (
    <div className="space-y-4">
      {(searchKey || onSearchChange) && (
        <div className="flex items-center">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => handleSearch(event.target.value)}
            className="max-w-sm"
          />
        </div>
      )}
      <div className="rounded-md border">
        <table className="w-full">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  로딩 중...
                </td>
              </tr>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-t transition-colors hover:bg-muted/50",
                    row.getIsSelected() && "bg-muted"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {totalElements !== undefined
            ? `총 ${totalElements}개 중 ${currentPageIndex * currentPageSize + 1}-${Math.min((currentPageIndex + 1) * currentPageSize, totalElements)}개`
            : `페이지 ${currentPageIndex + 1} / ${totalPages || 1}`}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isServerSide && onPaginationChange) {
                onPaginationChange(0, currentPageSize)
              } else {
                table.setPageIndex(0)
              }
            }}
            disabled={currentPageIndex === 0}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isServerSide && onPaginationChange) {
                onPaginationChange(currentPageIndex - 1, currentPageSize)
              } else {
                table.previousPage()
              }
            }}
            disabled={currentPageIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isServerSide && onPaginationChange) {
                onPaginationChange(currentPageIndex + 1, currentPageSize)
              } else {
                table.nextPage()
              }
            }}
            disabled={currentPageIndex >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isServerSide && onPaginationChange) {
                onPaginationChange(totalPages - 1, currentPageSize)
              } else {
                table.setPageIndex(totalPages - 1)
              }
            }}
            disabled={currentPageIndex >= totalPages - 1}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
