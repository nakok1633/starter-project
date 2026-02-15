/**
 * ============================================================
 * 로그인/회원가입 페이지
 * ============================================================
 * 
 * 【이 페이지의 기능】
 * - 로그인과 회원가입을 탭으로 전환
 * - 폼 입력값 유효성 검증 (이메일 형식, 비밀번호 길이 등)
 * - 로그인 성공 시 태스크 목록 페이지로 이동
 * 
 * 【사용된 주요 라이브러리】
 * - React Hook Form: 폼 상태 관리 및 제출 처리
 * - Zod: 유효성 검증 스키마 정의
 * - shadcn/ui: UI 컴포넌트 (Button, Input, Card 등)
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"           // 폼 상태 관리 라이브러리
import { zodResolver } from "@hookform/resolvers/zod"  // Zod와 React Hook Form 연동
import * as z from "zod"                              // 유효성 검증 라이브러리
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AxiosError } from "axios"
import { ErrorResponse } from "@/types"

/**
 * ============================================================
 * Zod 유효성 검증 스키마
 * ============================================================
 * 
 * 【Zod란?】
 * TypeScript 우선 스키마 선언 및 유효성 검증 라이브러리입니다.
 * 
 * 【왜 사용?】
 * - 런타임에서 데이터 유효성 검증
 * - TypeScript 타입 자동 생성 (z.infer)
 * - 명확한 에러 메시지 제공
 * 
 * 【사용법】
 * z.string()        - 문자열 타입
 * .email()          - 이메일 형식 검증
 * .min(6)           - 최소 길이 검증
 * .refine()         - 커스텀 검증 로직
 */

/** 로그인 폼 유효성 스키마 */
const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
})

/** 회원가입 폼 유효성 스키마 */
const signupSchema = z.object({
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
  email: z.string().email("올바른 이메일을 입력하세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  // refine: 여러 필드를 조합한 커스텀 검증
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],    // 에러를 표시할 필드
})

/**
 * 【z.infer】
 * Zod 스키마에서 TypeScript 타입을 자동 추출합니다.
 * 스키마 정의만 하면 타입을 별도로 작성할 필요가 없습니다.
 */
type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, signup, isAuthenticated, isLoading: authLoading, initialize } = useAuthStore()
  
  // 현재 모드: false=로그인, true=회원가입
  const [isSignup, setIsSignup] = useState(false)
  
  // API 에러 메시지
  const [error, setError] = useState<string | null>(null)
  
  // 폼 제출 중 여부 (중복 제출 방지 및 버튼 비활성화용)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * ============================================================
   * React Hook Form - useForm
   * ============================================================
   * 
   * 【React Hook Form이란?】
   * 폼 상태를 효율적으로 관리하는 라이브러리입니다.
   * - 불필요한 리렌더링 최소화
   * - 유효성 검증 통합
   * - 폼 제출 처리
   * 
   * 【반환값 설명】
   * - register: input에 연결하여 값 추적 (name, onChange, onBlur 등)
   * - handleSubmit: 폼 제출 시 유효성 검증 후 콜백 실행
   * - formState: { errors, isValid, isDirty 등 }
   * - reset: 폼 초기화
   * 
   * 【사용 예시】
   * <input {...register("email")} />
   * <form onSubmit={handleSubmit(onSubmit)}>
   */
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),    // Zod 스키마로 유효성 검증
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  // 페이지 로드 시 인증 상태 초기화
  useEffect(() => {
    initialize()
  }, [initialize])

  // 이미 로그인된 경우 태스크 페이지로 이동
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/tasks")
    }
  }, [isAuthenticated, authLoading, router])

  /**
   * 로그인 처리 함수
   * 
   * 【async/await】
   * 비동기 작업(API 호출 등)을 동기 코드처럼 작성할 수 있게 해줍니다.
   * await 키워드는 Promise가 완료될 때까지 기다립니다.
   * 
   * 【try/catch/finally】
   * - try: 정상 실행 코드
   * - catch: 에러 발생 시 실행
   * - finally: 성공/실패 관계없이 항상 실행
   */
  const handleLogin = async (data: LoginFormData) => {
    setError(null)          // 이전 에러 초기화
    setIsSubmitting(true)   // 제출 중 상태로 변경
    try {
      await login(data)              // API 호출
      router.push("/tasks")          // 성공 시 페이지 이동
    } catch (err) {
      // 에러 메시지 추출 및 표시
      const axiosError = err as AxiosError<ErrorResponse>
      setError(axiosError.response?.data?.message || "로그인에 실패했습니다")
    } finally {
      setIsSubmitting(false)    // 제출 상태 해제
    }
  }

  /** 회원가입 처리 함수 */
  const handleSignup = async (data: SignupFormData) => {
    setError(null)
    setIsSubmitting(true)
    try {
      await signup({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      router.push("/tasks")
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      setError(axiosError.response?.data?.message || "회원가입에 실패했습니다")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleMode = () => {
    setIsSignup(!isSignup)
    setError(null)
    loginForm.reset()
    signupForm.reset()
  }

  if (authLoading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="page-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSignup ? "회원가입" : "로그인"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignup
              ? "새 계정을 만들어 시작하세요"
              : "계정에 로그인하세요"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="error-box mb-4">
              <p className="error-text">{error}</p>
            </div>
          )}

          {isSignup ? (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  placeholder="홍길동"
                  {...signupForm.register("name")}
                />
                {signupForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  {...signupForm.register("email")}
                />
                {signupForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...signupForm.register("password")}
                />
                {signupForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...signupForm.register("confirmPassword")}
                />
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {signupForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "처리 중..." : "회원가입"}
              </Button>
            </form>
          ) : (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full text-muted-foreground">
            {isSignup ? "이미 계정이 있으신가요?" : "계정이 없으신가요?"}{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-primary hover:underline font-medium"
            >
              {isSignup ? "로그인" : "회원가입"}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
