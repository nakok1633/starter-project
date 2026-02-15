/**
 * ============================================================
 * 글로벌 헤더 컴포넌트
 * ============================================================
 * 
 * 【컴포넌트란?】
 * React에서 UI를 구성하는 독립적인 단위입니다.
 * 레고 블록처럼 조합해서 복잡한 UI를 만들 수 있습니다.
 * 
 * 【이 컴포넌트의 역할】
 * 모든 페이지 상단에 표시되는 네비게이션 바입니다.
 * - 로고 및 메뉴 링크
 * - 로그인 상태에 따른 버튼 표시
 * 
 * 【컴포넌트 사용법】
 * 다른 파일에서 이렇게 사용합니다:
 * ```
 * import { Header } from '@/components/Header';
 * 
 * function Page() {
 *   return (
 *     <div>
 *       <Header />
 *       <main>페이지 내용</main>
 *     </div>
 *   );
 * }
 * ```
 */

"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"    // Next.js 라우팅 Hook
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"

/**
 * Header 컴포넌트 함수
 * 
 * 【함수형 컴포넌트】
 * React 16.8 이후 주로 사용하는 컴포넌트 작성 방식입니다.
 * 함수가 JSX를 반환하면 React가 이를 DOM으로 렌더링합니다.
 */
export function Header() {
  /**
   * 【useRouter】
   * 프로그래밍 방식으로 페이지 이동할 때 사용합니다.
   * 예: router.push("/login") - 로그인 페이지로 이동
   */
  const router = useRouter()
  
  /**
   * 【usePathname】
   * 현재 URL 경로를 가져옵니다.
   * 예: /tasks 페이지에서는 "/tasks" 반환
   * 메뉴의 활성 상태 표시에 사용합니다.
   */
  const pathname = usePathname()
  
  // Zustand 스토어에서 인증 상태 가져오기
  const { user, isAuthenticated, isLoading, logout, initialize } = useAuthStore()

  // 컴포넌트가 화면에 나타날 때 인증 상태 초기화
  useEffect(() => {
    initialize()
  }, [initialize])

  /**
   * 로그아웃 버튼 클릭 시 실행되는 함수
   * 
   * 【이벤트 핸들러】
   * React에서 버튼 클릭 등의 이벤트를 처리하는 함수입니다.
   * onClick={handleLogout} 형태로 연결합니다.
   */
  const handleLogout = async () => {
    await logout()              // 로그아웃 API 호출
    router.push("/login")       // 로그인 페이지로 이동
  }

  // 현재 로그인 페이지인지 확인 (로그인 페이지에서는 로그인 버튼 숨김)
  const isLoginPage = pathname === "/login"

  /**
   * ============================================================
   * JSX 반환 (화면에 표시될 내용)
   * ============================================================
   * 
   * 【JSX란?】
   * JavaScript 안에서 HTML처럼 작성할 수 있는 문법입니다.
   * 실제로는 JavaScript 객체로 변환됩니다.
   * 
   * 【주의사항】
   * - class 대신 className 사용
   * - 모든 태그는 닫아야 함 (<img /> 형태)
   * - 최상위 요소는 하나만 가능 (또는 <></> Fragment 사용)
   */
  return (
    // nav: HTML5 네비게이션 시맨틱 태그
    // className: Tailwind CSS 클래스들
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* 왼쪽: 로고 및 메뉴 */}
        <div className="flex items-center gap-6">
          <a href="/" className="text-lg font-bold text-gray-900">
            Starter
          </a>
          <div className="flex gap-4">
            {/* 
              템플릿 리터럴 (백틱 `)을 사용한 동적 클래스
              현재 페이지면 파란색, 아니면 회색
            */}
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

        {/* 오른쪽: 로그인 상태 표시 */}
        <div className="flex items-center gap-4">
          {/**
           * 【조건부 렌더링】
           * 조건에 따라 다른 JSX를 표시하는 패턴입니다.
           * 
           * 삼항 연산자: 조건 ? 참일때 : 거짓일때
           * && 연산자: 조건 && 참일때만표시
           */}
          {isLoading ? (
            // 로딩 중일 때
            <span className="text-sm text-gray-400">로딩 중...</span>
          ) : isAuthenticated && user ? (
            // 로그인 된 경우: 사용자 정보 + 로그아웃 버튼
            <>
              {/* 유저명 클릭 시 프로필 페이지로 이동 */}
              <a 
                href="/profile" 
                className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer"
              >
                {user.name} ({user.role})
              </a>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : (
            // 로그인 안 된 경우: 로그인 버튼 (단, 로그인 페이지에서는 숨김)
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
