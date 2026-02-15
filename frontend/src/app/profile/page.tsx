/**
 * ============================================================
 * 프로필 (내 정보) 페이지
 * ============================================================
 * 
 * 【이 페이지의 기능】
 * - 현재 로그인한 사용자 정보 표시
 * - 이름 변경
 * - 비밀번호 변경
 * 
 * 【접근 경로】
 * /profile - 상단 헤더의 유저명 클릭 시 이동
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuthStore } from "@/lib/auth-store"
import { getUser, updateUser } from "@/lib/api"
import { UserResponse, ErrorResponse } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AxiosError } from "axios"

/**
 * 프로필 수정 폼 유효성 스키마
 */
const profileSchema = z.object({
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  newPassword: z.string().min(6, "새 비밀번호는 최소 6자 이상이어야 합니다"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "새 비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, initialize, setUser } = useAuthStore()
  
  // 사용자 상세 정보 (가입일, 수정일 포함)
  const [userDetail, setUserDetail] = useState<UserResponse | null>(null)
  
  // 데이터 로딩 상태
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  
  // API 에러/성공 메시지
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  
  // 폼 제출 중 상태
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false)
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)

  /**
   * 프로필 수정 폼 설정
   */
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
    },
  })

  /**
   * 비밀번호 변경 폼 설정
   */
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  /**
   * 컴포넌트 마운트 시 인증 상태 초기화
   */
  useEffect(() => {
    initialize()
  }, [initialize])

  /**
   * user 정보가 있으면 폼에 미리 설정 (로그인 시 저장된 정보)
   */
  useEffect(() => {
    if (user) {
      profileForm.setValue("name", user.name)
    }
  }, [user, profileForm])

  /**
   * 인증 상태 확인 후 사용자 정보 로드 또는 로그인 페이지로 이동
   */
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else {
        loadUserDetail()
      }
    }
  }, [authLoading, isAuthenticated, router])

  /**
   * 사용자 상세 정보 로드
   */
  const loadUserDetail = async () => {
    try {
      setIsLoadingUser(true)
      const data = await getUser()
      setUserDetail(data)
      // 이름 필드에 현재 이름 설정
      profileForm.setValue("name", data.name)
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error)
    } finally {
      setIsLoadingUser(false)
    }
  }

  /**
   * 프로필 수정 (이름 변경)
   */
  const handleProfileSubmit = async (data: ProfileFormData) => {
    setProfileError(null)
    setProfileSuccess(null)
    setIsSubmittingProfile(true)

    try {
      const updatedUser = await updateUser({ name: data.name })
      setUserDetail(updatedUser)
      
      // Zustand 스토어의 사용자 정보도 업데이트
      if (user) {
        setUser({
          ...user,
          name: updatedUser.name,
        })
      }
      
      setProfileSuccess("이름이 변경되었습니다")
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      setProfileError(axiosError.response?.data?.message || "이름 변경에 실패했습니다")
    } finally {
      setIsSubmittingProfile(false)
    }
  }

  /**
   * 비밀번호 변경
   */
  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setPasswordError(null)
    setPasswordSuccess(null)
    setIsSubmittingPassword(true)

    try {
      await updateUser({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      
      // 폼 초기화
      passwordForm.reset()
      setPasswordSuccess("비밀번호가 변경되었습니다")
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      setPasswordError(axiosError.response?.data?.message || "비밀번호 변경에 실패했습니다")
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  // 로딩 중 표시 (user 정보가 없을 때만)
  if (authLoading || (!user && isLoadingUser)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div>
              <h1 className="text-lg font-semibold">내 정보</h1>
              <p className="text-sm text-muted-foreground">
                계정 정보 및 설정을 관리합니다
              </p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* 기본 정보 카드 */}
            <Card>
              <CardHeader>
                <CardTitle>계정 정보</CardTitle>
                <CardDescription>현재 로그인한 계정의 정보입니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-500">이름</Label>
                    <p className="font-medium">{userDetail?.name || user?.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">이메일</Label>
                    <p className="font-medium">{userDetail?.email || user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">역할</Label>
                    <p className="font-medium">{(userDetail?.role || user?.role) === "ADMIN" ? "관리자" : "일반 사용자"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">가입일</Label>
                    <p className="font-medium">{userDetail?.createdAt ? formatDate(userDetail.createdAt) : "-"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">마지막 수정</Label>
                    <p className="font-medium">{userDetail?.updatedAt ? formatDate(userDetail.updatedAt) : "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 이름 변경 카드 */}
            <Card>
              <CardHeader>
                <CardTitle>이름 변경</CardTitle>
                <CardDescription>표시될 이름을 변경합니다</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      {...profileForm.register("name")}
                      placeholder="이름을 입력하세요"
                      className="max-w-md"
                    />
                    {profileForm.formState.errors.name && (
                      <p className="text-sm text-red-500">{profileForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  {/* 에러 메시지 */}
                  {profileError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm max-w-md">
                      {profileError}
                    </div>
                  )}

                  {/* 성공 메시지 */}
                  {profileSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm max-w-md">
                      {profileSuccess}
                    </div>
                  )}

                  <Button type="submit" disabled={isSubmittingProfile}>
                    {isSubmittingProfile ? "저장 중..." : "이름 변경"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* 비밀번호 변경 카드 */}
            <Card>
              <CardHeader>
                <CardTitle>비밀번호 변경</CardTitle>
                <CardDescription>계정 비밀번호를 변경합니다</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">현재 비밀번호</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...passwordForm.register("currentPassword")}
                      placeholder="현재 비밀번호를 입력하세요"
                      className="max-w-md"
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">새 비밀번호</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...passwordForm.register("newPassword")}
                      placeholder="새 비밀번호를 입력하세요"
                      className="max-w-md"
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordForm.register("confirmPassword")}
                      placeholder="새 비밀번호를 다시 입력하세요"
                      className="max-w-md"
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  {/* 에러 메시지 */}
                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm max-w-md">
                      {passwordError}
                    </div>
                  )}

                  {/* 성공 메시지 */}
                  {passwordSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm max-w-md">
                      {passwordSuccess}
                    </div>
                  )}

                  <Button type="submit" disabled={isSubmittingPassword}>
                    {isSubmittingPassword ? "변경 중..." : "비밀번호 변경"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
