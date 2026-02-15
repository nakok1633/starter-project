"use client"

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

const statusLabels: Record<TaskStatus, string> = {
  PENDING: "대기",
  IN_PROGRESS: "진행 중",
  COMPLETED: "완료",
  CANCELLED: "취소",
}

const priorityLabels: Record<TaskPriority, string> = {
  LOW: "낮음",
  MEDIUM: "보통",
  HIGH: "높음",
  URGENT: "긴급",
}

const statusColors: Record<TaskStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
}

const priorityColors: Record<TaskPriority, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
}

export default function TasksPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, logout, initialize } = useAuthStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [search, setSearch] = useState("")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; taskId: number | null }>({
    open: false,
    taskId: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, authLoading, router])

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return
    
    setIsLoading(true)
    try {
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks()
    }
  }, [fetchTasks, isAuthenticated])

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

  const handleLogout = async () => {
    await logout()
    router.replace("/login")
  }

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
