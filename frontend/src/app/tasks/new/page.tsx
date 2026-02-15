/**
 * 새 태스크 생성 페이지
 * - React Hook Form + Zod 유효성 검증
 * - 생성 성공 시 목록으로 리다이렉트
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { api } from "@/lib/api"
import { TaskRequest, TaskStatus, TaskPriority } from "@/types"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/FormField"
import { AxiosError } from "axios"
import { ErrorResponse } from "@/types"

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

export default function NewTaskPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, initialize } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
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

      await api.post("/api/tasks", request)
      router.push("/tasks")
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      setError(axiosError.response?.data?.message || "태스크 생성에 실패했습니다")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="card-container">
          {/* 헤더 영역 */}
          <div className="card-header">
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
                <h1 className="page-title">새 태스크</h1>
                <p className="page-description">새로운 태스크를 생성합니다</p>
              </div>
            </div>
          </div>
          {/* 본문 영역 */}
          <div className="card-body">
            {error && (
              <div className="error-box mb-4">
                <p className="error-text">{error}</p>
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="form-container">
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

              <div className="grid-2-cols">
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

              <div className="button-group">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/tasks")}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "생성 중..." : "태스크 생성"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
