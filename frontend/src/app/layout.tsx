/**
 * ============================================================
 * 루트 레이아웃 (Root Layout)
 * ============================================================
 * 
 * 【Next.js App Router란?】
 * Next.js 13+의 새로운 라우팅 시스템입니다.
 * app 폴더 구조가 URL 경로와 직접 매핑됩니다:
 * - app/page.tsx → /
 * - app/tasks/page.tsx → /tasks
 * - app/tasks/[id]/edit/page.tsx → /tasks/123/edit
 * 
 * 【layout.tsx의 역할】
 * 여러 페이지에서 공유하는 UI를 정의합니다.
 * 이 파일은 app 폴더의 루트에 있으므로 모든 페이지에 적용됩니다.
 * 
 * 중첩 레이아웃도 가능합니다:
 * - app/layout.tsx: 전체 공통 (헤더, 푸터)
 * - app/dashboard/layout.tsx: /dashboard/* 페이지 공통
 * 
 * 【서버 컴포넌트 (기본)】
 * layout.tsx는 기본적으로 서버에서 렌더링됩니다.
 * "use client"가 없으면 서버 컴포넌트입니다.
 * 서버 컴포넌트에서는 useState, useEffect 사용 불가.
 * Header는 "use client"가 있어서 클라이언트 컴포넌트입니다.
 */

import type { Metadata } from "next"
// Google Fonts에서 Inter 폰트 로드 (Next.js 자동 최적화)
import { Inter } from "next/font/google"
// 전역 CSS 스타일 (Tailwind CSS 포함)
import "./globals.css"
// 모든 페이지에 표시되는 헤더 컴포넌트
import { Header } from "@/components/Header"

/**
 * 【폰트 설정】
 * Next.js의 next/font를 사용하면:
 * - 빌드 시 폰트 파일 자동 다운로드
 * - FOUT/FOIT 방지 (폰트 깜빡임 없음)
 * - Google Fonts API 호출 없음 (프라이버시, 성능)
 */
const inter = Inter({ subsets: ["latin"] })

/**
 * 【Metadata】
 * 페이지의 <head> 태그에 들어갈 메타데이터입니다.
 * SEO, 소셜 공유 등에 사용됩니다.
 * 
 * 각 페이지에서 export const metadata로 재정의 가능합니다.
 */
export const metadata: Metadata = {
  title: "Starter Project",           // 브라우저 탭 제목
  description: "Task Management Application",  // 검색 엔진용 설명
}

/**
 * 【RootLayout 컴포넌트】
 * 
 * children: 현재 경로의 page.tsx 내용이 들어옵니다.
 * 
 * 예: /tasks 접근 시
 * children = <TasksPage /> (app/tasks/page.tsx)
 * 
 * 구조:
 * <html>
 *   <body>
 *     <Header />      ← 모든 페이지 공통
 *     <main>
 *       {children}    ← 현재 페이지 내용
 *     </main>
 *   </body>
 * </html>
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode    // React가 렌더링할 수 있는 모든 것 (JSX, 문자열 등)
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {/* 모든 페이지에 표시되는 헤더 */}
        <Header />
        {/* 각 페이지의 고유 내용 */}
        <main>{children}</main>
      </body>
    </html>
  )
}
