/**
 * 로그인/회원가입 페이지
 * - 탭으로 로그인/회원가입 전환
 * - React Hook Form + Zod 유효성 검증
 * - 로그인 성공 시 /tasks로 리다이렉트
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AxiosError } from "axios"
import { ErrorResponse } from "@/types"

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
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
})

type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, signup, isAuthenticated, isLoading: authLoading, initialize } = useAuthStore()
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
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

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/tasks")
    }
  }, [isAuthenticated, authLoading, router])

  const handleLogin = async (data: LoginFormData) => {
    setError(null)
    setIsSubmitting(true)
    try {
      await login(data)
      router.push("/tasks")
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      setError(axiosError.response?.data?.message || "로그인에 실패했습니다")
    } finally {
      setIsSubmitting(false)
    }
  }

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
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
