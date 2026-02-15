/**
 * ============================================================
 * 태스크 목록 페이지
 * ============================================================
 * 
 * 【React 컴포넌트란?】
 * 화면의 일부분을 담당하는 재사용 가능한 UI 단위입니다.
 * 함수 형태로 작성하며, JSX(HTML과 유사)를 반환합니다.
 * 
 * 【이 페이지의 기능】
 * - 태스크 목록을 테이블 형태로 표시
 * - 페이지네이션 (페이지 이동)
 * - 검색 기능
 * - 태스크 생성/수정/삭제
 * 
 * 【"use client" 지시어】
 * Next.js 13+에서 클라이언트 컴포넌트임을 선언합니다.
 * useState, useEffect 등 React Hook을 사용하려면 필수입니다.
 * 서버 컴포넌트(기본값)에서는 Hook 사용이 불가능합니다.
 */

"use client"

/**
 * 【import 설명】
 * - useEffect: 컴포넌트 생명주기 관리 (마운트, 업데이트, 언마운트 시 실행)
 * - useState: 컴포넌트 내 상태(데이터) 관리
 * - useCallback: 함수 메모이제이션 (불필요한 재생성 방지)
 */
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Plus, Edit, Trash2, LogOut } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { api } from "@/lib/api"
import { Task, PageResponse, TaskStatus, TaskPriority } from "@/types"
import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ConfirmDialog"

/**
 * 상수 정의
 * 
 * 【Record 타입】
 * TypeScript에서 객체의 키-값 쌍 타입을 정의합니다.
 * Record<TaskStatus, string>은 "TaskStatus를 키로, string을 값으로 가지는 객체"입니다.
 */

/** 태스크 상태를 한글로 변환하는 매핑 객체 */
const statusLabels: Record<TaskStatus, string> = {
  PENDING: "대기",
  IN_PROGRESS: "진행 중",
  COMPLETED: "완료",
  CANCELLED: "취소",
}

/** 태스크 우선순위를 한글로 변환하는 매핑 객체 */
const priorityLabels: Record<TaskPriority, string> = {
  LOW: "낮음",
  MEDIUM: "보통",
  HIGH: "높음",
  URGENT: "긴급",
}

/** 상태별 배지 CSS 클래스 (Tailwind CSS) */
const statusColors: Record<TaskStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",       // 노란색 배경
  IN_PROGRESS: "bg-blue-100 text-blue-800",       // 파란색 배경
  COMPLETED: "bg-green-100 text-green-800",       // 초록색 배경
  CANCELLED: "bg-gray-100 text-gray-800",         // 회색 배경
}

/** 우선순위별 배지 CSS 클래스 */
const priorityColors: Record<TaskPriority, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
}

/**
 * ============================================================
 * 메인 컴포넌트
 * ============================================================
 * 
 * 【export default function】
 * 이 파일의 기본 내보내기로, Next.js가 이 함수를 페이지로 렌더링합니다.
 * /tasks 경로로 접근하면 이 컴포넌트가 화면에 표시됩니다.
 */
export default function TasksPage() {
  /**
   * 【useRouter】
   * Next.js에서 제공하는 라우팅 Hook입니다.
   * 페이지 이동, URL 파라미터 접근 등에 사용합니다.
   * 
   * 예: router.push('/tasks/new') - 새 태스크 페이지로 이동
   */
  const router = useRouter()
  
  /**
   * 【useAuthStore】
   * Zustand 스토어에서 인증 상태를 가져옵니다.
   * 구조 분해 할당으로 필요한 값만 추출합니다.
   */
  const { user, isAuthenticated, isLoading: authLoading, logout, initialize } = useAuthStore()
  
  /**
   * ============================================================
   * useState - 상태 관리
   * ============================================================
   * 
   * 【useState란?】
   * 컴포넌트 내에서 변경 가능한 데이터를 관리하는 Hook입니다.
   * 
   * 사용법: const [값, 값변경함수] = useState(초기값)
   * 
   * 값이 변경되면 React가 자동으로 화면을 다시 그립니다 (리렌더링).
   * 일반 변수와 달리 useState를 사용해야 화면이 업데이트됩니다.
   * 
   * 예시:
   * - setTasks([...]) 호출 → tasks 값 변경 → 화면 업데이트
   */
  
  // 태스크 목록 데이터
  const [tasks, setTasks] = useState<Task[]>([])       // 초기값: 빈 배열
  const [isLoading, setIsLoading] = useState(true)     // 초기값: 로딩 중
  
  // 페이지네이션 관련 상태
  const [pageIndex, setPageIndex] = useState(0)        // 현재 페이지 (0부터 시작)
  const [pageSize, setPageSize] = useState(10)         // 페이지당 항목 수
  const [totalPages, setTotalPages] = useState(0)      // 전체 페이지 수
  const [totalElements, setTotalElements] = useState(0) // 전체 항목 수
  
  // 검색 상태
  const [search, setSearch] = useState("")             // 검색어
  
  // 삭제 확인 다이얼로그 상태
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; taskId: number | null }>({
    open: false,      // 다이얼로그 열림 여부
    taskId: null,     // 삭제할 태스크 ID
  })
  const [isDeleting, setIsDeleting] = useState(false)  // 삭제 진행 중 여부

  /**
   * ============================================================
   * useEffect - 사이드 이펙트 처리
   * ============================================================
   * 
   * 【useEffect란?】
   * 컴포넌트가 렌더링된 후 실행되는 코드를 작성하는 Hook입니다.
   * API 호출, 이벤트 리스너 등록, 타이머 설정 등에 사용합니다.
   * 
   * 사용법: useEffect(() => { 실행할코드 }, [의존성배열])
   * 
   * 【의존성 배열】
   * - 빈 배열 []: 컴포넌트 마운트 시 1번만 실행
   * - [a, b]: a 또는 b가 변경될 때마다 실행
   * - 배열 생략: 매 렌더링마다 실행 (권장하지 않음)
   */
  
  // 컴포넌트가 처음 화면에 나타날 때 인증 상태 초기화
  useEffect(() => {
    initialize()    // localStorage에서 로그인 정보 복원
  }, [initialize])  // initialize 함수가 변경될 때만 실행 (실제로는 1번만 실행됨)

  // 인증 확인 후 비로그인 시 로그인 페이지로 이동
  useEffect(() => {
    // 인증 로딩이 끝났고 && 로그인 안 된 경우
    if (!authLoading && !isAuthenticated) {
      router.replace("/login")    // replace: 뒤로가기 시 이 페이지로 돌아오지 않음
    }
  }, [isAuthenticated, authLoading, router])

  /**
   * 【useCallback】
   * 함수를 메모이제이션(캐싱)하는 Hook입니다.
   * 의존성 배열의 값이 변경되지 않으면 동일한 함수 참조를 유지합니다.
   * 
   * 【왜 필요?】
   * - 불필요한 함수 재생성 방지
   * - 자식 컴포넌트의 불필요한 리렌더링 방지
   * - useEffect의 의존성으로 사용할 때 무한 루프 방지
   */
  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return    // 로그인 안 됐으면 실행 안 함
    
    setIsLoading(true)    // 로딩 시작
    try {
      // URL 쿼리 파라미터 구성
      const params = new URLSearchParams({
        page: pageIndex.toString(),
        size: pageSize.toString(),
      })
      if (search) {
        params.append("search", search)
      }
      
      const response = await api.get<PageResponse<Task>>(`/api/tasks?${params}`)
      setTasks(response.data.content)
      setTotalPages(response.data.totalPages)
      setTotalElements(response.data.totalElements)
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }, [pageIndex, pageSize, search, isAuthenticated])

  // 페이지, 검색어, 인증 상태 변경 시 태스크 재조회
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks()
    }
  }, [fetchTasks, isAuthenticated])

  /**
   * 태스크 삭제 처리
   * 삭제 후 목록 재조회
   */
  const handleDelete = async () => {
    if (!deleteDialog.taskId) return

    setIsDeleting(true)
    try {
      await api.delete(`/api/tasks/${deleteDialog.taskId}`)
      setDeleteDialog({ open: false, taskId: null })
      fetchTasks()
    } catch (error) {
      console.error("Failed to delete task:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  /**
   * 로그아웃 처리
   * 로그아웃 후 로그인 페이지로 이동
   */
  const handleLogout = async () => {
    await logout()
    router.replace("/login")
  }

  /** 테이블 컬럼 정의 */
  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>,
    },
    {
      accessorKey: "title",
      header: "제목",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "상태",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[row.original.status]}`}>
          {statusLabels[row.original.status]}
        </span>
      ),
    },
    {
      accessorKey: "priority",
      header: "우선순위",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[row.original.priority]}`}>
          {priorityLabels[row.original.priority]}
        </span>
      ),
    },
    {
      accessorKey: "userName",
      header: "담당자",
    },
    {
      accessorKey: "createdAt",
      header: "생성일",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("ko-KR")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "작업",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/tasks/${row.original.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteDialog({ open: true, taskId: row.original.id })}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  // 인증 로딩 중 스피너 표시
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">태스크 목록</h2>
                <p className="text-sm text-muted-foreground">
                  총 {totalElements}개의 태스크
                </p>
              </div>
              <Button onClick={() => router.push("/tasks/new")}>
                <Plus className="h-4 w-4 mr-2" />
                새 태스크
              </Button>
            </div>
          </div>
          <div className="p-6">
            <DataTable
              columns={columns}
              data={tasks}
              searchPlaceholder="제목 또는 설명으로 검색..."
              pageCount={totalPages}
              pageIndex={pageIndex}
              pageSize={pageSize}
              onPaginationChange={(newPageIndex, newPageSize) => {
                setPageIndex(newPageIndex)
                setPageSize(newPageSize)
              }}
              onSearchChange={(newSearch) => {
                setSearch(newSearch)
                setPageIndex(0)
              }}
              isLoading={isLoading}
              totalElements={totalElements}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="태스크 삭제"
        description="이 태스크를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
