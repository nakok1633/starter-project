/**
 * ============================================================
 * 범용 데이터 테이블 컴포넌트
 * ============================================================
 * 
 * 【TanStack Table이란?】
 * React용 테이블 라이브러리입니다. (구 React Table)
 * - 정렬, 필터링, 페이지네이션 등 테이블 기능 제공
 * - Headless UI (스타일은 직접 작성)
 * - 서버사이드/클라이언트사이드 모드 지원
 * 
 * 【이 컴포넌트의 역할】
 * TanStack Table을 래핑하여 프로젝트 전체에서 재사용합니다.
 * - 서버에서 데이터를 가져오는 경우 (서버사이드 페이지네이션)
 * - 클라이언트에서 데이터를 필터링하는 경우 (클라이언트사이드)
 * 
 * 【사용 예시】
 * ```
 * <DataTable
 *   columns={columns}           // 컬럼 정의 배열
 *   data={tasks}                // 표시할 데이터
 *   pageCount={totalPages}      // 서버사이드: 전체 페이지 수
 *   pageIndex={currentPage}     // 서버사이드: 현재 페이지
 *   onPaginationChange={(page, size) => fetchData(page, size)}
 * />
 * ```
 * 
 * 【제네릭 컴포넌트】
 * <TData, TValue>: TypeScript 제네릭
 * 어떤 타입의 데이터든 받을 수 있도록 유연하게 정의합니다.
 * Task[], User[] 등 다양한 데이터 타입에 재사용 가능합니다.
 */

"use client"

import * as React from "react"
import {
  ColumnDef,              // 컬럼 정의 타입
  ColumnFiltersState,     // 필터 상태 타입
  SortingState,           // 정렬 상태 타입
  flexRender,             // 셀 렌더링 헬퍼
  getCoreRowModel,        // 기본 행 모델
  getFilteredRowModel,    // 필터링 행 모델
  getPaginationRowModel,  // 페이지네이션 행 모델
  getSortedRowModel,      // 정렬 행 모델
  useReactTable,          // 테이블 Hook
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * DataTable Props 인터페이스
 * 
 * 【제네릭 인터페이스】
 * <TData, TValue>를 사용하여 데이터 타입을 동적으로 지정합니다.
 * 컴포넌트 사용 시 TypeScript가 자동으로 타입을 추론합니다.
 */
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]   // 테이블 컬럼 정의 배열
  data: TData[]                          // 표시할 데이터 배열
  searchPlaceholder?: string             // 검색창 placeholder 텍스트
  searchKey?: string                     // 클라이언트 검색 시 필터링할 필드명
  
  // 【서버사이드 페이지네이션 옵션】
  // 서버에서 페이지별로 데이터를 가져오는 경우 사용
  pageCount?: number                     // 전체 페이지 수 (서버에서 제공)
  pageIndex?: number                     // 현재 페이지 (0부터 시작)
  pageSize?: number                      // 페이지당 항목 수
  onPaginationChange?: (pageIndex: number, pageSize: number) => void  // 페이지 변경 시 콜백
  onSearchChange?: (search: string) => void  // 검색어 변경 시 콜백
  isLoading?: boolean                    // 로딩 상태 (로딩 스피너 표시)
  totalElements?: number                 // 전체 항목 수 (정보 표시용)
}

/**
 * DataTable 컴포넌트
 * 
 * 【함수 제네릭】
 * function DataTable<TData, TValue>: 제네릭 함수 컴포넌트
 * 호출 시 타입이 결정됩니다: DataTable<Task, unknown>
 */
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
  // 정렬 상태: 어떤 컬럼이 어떤 방향으로 정렬되었는지
  const [sorting, setSorting] = React.useState<SortingState>([])
  
  // 필터 상태: 각 컬럼의 필터 값
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  
  // 검색어 상태 (검색창에 입력된 값)
  const [searchValue, setSearchValue] = React.useState("")

  // 서버사이드 모드인지 확인 (pageCount가 제공되면 서버사이드)
  const isServerSide = serverPageCount !== undefined

  /**
   * 【useReactTable】
   * TanStack Table의 핵심 Hook입니다.
   * 테이블의 모든 상태와 동작을 관리합니다.
   * 
   * 반환값(table)으로 다음을 할 수 있습니다:
   * - table.getRowModel(): 현재 표시할 행들
   * - table.getHeaderGroups(): 헤더 그룹
   * - table.nextPage(): 다음 페이지로 이동
   * - table.getCanNextPage(): 다음 페이지가 있는지 확인
   */
  const table = useReactTable({
    data,                                    // 테이블 데이터
    columns,                                 // 컬럼 정의
    getCoreRowModel: getCoreRowModel(),      // 필수: 기본 행 처리
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),  // 클라이언트 페이지네이션
    onSortingChange: setSorting,             // 정렬 변경 시 상태 업데이트
    getSortedRowModel: getSortedRowModel(),  // 정렬된 행 모델
    onColumnFiltersChange: setColumnFilters, // 필터 변경 시 상태 업데이트
    getFilteredRowModel: getFilteredRowModel(),  // 필터링된 행 모델
    manualPagination: isServerSide,          // 서버사이드: true (직접 처리)
    pageCount: serverPageCount,              // 서버사이드: 전체 페이지 수
    state: {
      sorting,           // 현재 정렬 상태
      columnFilters,     // 현재 필터 상태
      // 서버사이드일 때만 페이지네이션 상태 제공
      ...(isServerSide && {
        pagination: {
          pageIndex: serverPageIndex || 0,
          pageSize: serverPageSize || 10,
        },
      }),
    },
  })

  /**
   * 검색어 변경 처리
   * 서버사이드: 콜백 호출 (부모 컴포넌트가 API 재호출)
   * 클라이언트: 테이블 내부 필터링
   */
  const handleSearch = (value: string) => {
    setSearchValue(value)
    if (onSearchChange) {
      // 서버사이드: 부모에게 검색어 전달
      onSearchChange(value)
    } else if (searchKey) {
      // 클라이언트: 특정 컬럼 필터링
      table.getColumn(searchKey)?.setFilterValue(value)
    }
  }

  // 현재 페이지네이션 정보 (서버사이드/클라이언트 통합)
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
