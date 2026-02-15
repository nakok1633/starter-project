/**
 * 글로벌 헤더 컴포넌트
 * - 네비게이션 메뉴 (Tasks, UI 컴포넌트)
 * - 로그인 상태 표시 (사용자명, 역할)
 * - 로그인/로그아웃 버튼
 */

"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  
  // 인증 상태 및 사용자 정보
  const { user, isAuthenticated, isLoading, logout, initialize } = useAuthStore()

  // 컴포넌트 마운트 시 인증 상태 존기화
  useEffect(() => {
    initialize()
  }, [initialize])

  /**
   * 로그아웃 처리
   * 로그아웃 후 로그인 페이지로 이동
   */
  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  // 로그인 페이지에서는 로그인 버튼 숨김
  const isLoginPage = pathname === "/login"

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/" className="text-lg font-bold text-gray-900">
            Starter
          </a>
          <div className="flex gap-4">
            <a
              href="/tasks"
              className={`text-sm font-medium hover:text-blue-600 ${
                pathname === "/tasks" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              Tasks
            </a>
            <a
              href="/ui-components"
              className={`text-sm font-medium hover:text-blue-600 ${
                pathname === "/ui-components" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              UI 컴포넌트
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <span className="text-sm text-gray-400">로딩 중...</span>
          ) : isAuthenticated && user ? (
            <>
              <span className="text-sm text-gray-600">
                {user.name} ({user.role})
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : (
            !isLoginPage && (
              <Button size="sm" onClick={() => router.push("/login")}>
                로그인
              </Button>
            )
          )}
        </div>
      </div>
    </nav>
  )
}
