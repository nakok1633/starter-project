/**
 * 태스크 수정 페이지
 * - URL 파라미터에서 taskId 추출
 * - 기존 태스크 데이터 로드 후 폼에 표시
 * - React Hook Form + Zod 유효성 검증
 * - 수정 성공 시 목록으로 리다이렉트
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { api } from "@/lib/api"
import { Task, TaskRequest, TaskStatus, TaskPriority, ErrorResponse } from "@/types"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/FormField"
import { AxiosError } from "axios"

/** 태스크 폼 유효성 스키마 */
const taskSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요").max(200, "제목은 200자 이내로 입력하세요"),
  description: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
})

type TaskFormData = z.infer<typeof taskSchema>

/** 상태 선택 옵션 */
const statusOptions = [
  { label: "대기", value: "PENDING" },
  { label: "진행 중", value: "IN_PROGRESS" },
  { label: "완료", value: "COMPLETED" },
  { label: "취소", value: "CANCELLED" },
]

/** 우선순위 선택 옵션 */
const priorityOptions = [
  { label: "낮음", value: "LOW" },
  { label: "보통", value: "MEDIUM" },
  { label: "높음", value: "HIGH" },
  { label: "긴급", value: "URGENT" },
]

export default function EditTaskPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string
  const { isAuthenticated, isLoading: authLoading, initialize } = useAuthStore()
  const [task, setTask] = useState<Task | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "PENDING",
      priority: "MEDIUM",
    },
  })

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    const fetchTask = async () => {
      if (!isAuthenticated || !taskId) return

      try {
        const response = await api.get<Task>(`/api/tasks/${taskId}`)
        const taskData = response.data
        setTask(taskData)
        form.reset({
          title: taskData.title,
          description: taskData.description || "",
          status: taskData.status,
          priority: taskData.priority,
        })
      } catch (err) {
        const axiosError = err as AxiosError<ErrorResponse>
        setError(axiosError.response?.data?.message || "태스크를 불러오는데 실패했습니다")
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchTask()
    }
  }, [taskId, isAuthenticated, form])

  const onSubmit = async (data: TaskFormData) => {
    setError(null)
    setIsSubmitting(true)

    try {
      const request: TaskRequest = {
        title: data.title,
        description: data.description || undefined,
        status: data.status as TaskStatus,
        priority: data.priority as TaskPriority,
      }

      await api.put(`/api/tasks/${taskId}`, request)
      router.push("/tasks")
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      setError(axiosError.response?.data?.message || "태스크 수정에 실패했습니다")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!task && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/tasks")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  돌아가기
                </Button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-center text-muted-foreground py-8">
                {error || "태스크를 찾을 수 없습니다"}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* 헤더 영역 */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/tasks")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                돌아가기
              </Button>
              <div>
                <h1 className="text-lg font-semibold">태스크 수정</h1>
                <p className="text-sm text-muted-foreground">태스크 정보를 수정합니다</p>
              </div>
            </div>
          </div>
          {/* 본문 영역 */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
              <FormField
                control={form.control}
                name="title"
                label="제목"
                placeholder="태스크 제목을 입력하세요"
                required
              />

              <FormField
                control={form.control}
                name="description"
                label="설명"
                type="textarea"
                placeholder="태스크에 대한 상세 설명을 입력하세요"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  label="상태"
                  type="select"
                  options={statusOptions}
                  required
                />

                <FormField
                  control={form.control}
                  name="priority"
                  label="우선순위"
                  type="select"
                  options={priorityOptions}
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/tasks")}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "저장 중..." : "변경사항 저장"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
