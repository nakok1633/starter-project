'use client';

/**
 * ============================================================
 * 관리자 대시보드 페이지
 * ============================================================
 * 
 * 【페이지 역할】
 * - 관리자만 접근 가능 (ADMIN 역할 필요)
 * - 전체 시스템 통계 표시 (사용자 수, Task 수 등)
 * - 관리자 기능 메뉴 제공
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { getAdminDashboard } from '@/lib/api';
import { AdminDashboard } from '@/types';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  // ========== 상태 관리 ==========
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  // 대시보드 데이터 상태
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========== 권한 체크 및 데이터 로딩 ==========
  useEffect(() => {
    // 인증 상태 로딩 중이면 대기
    if (isLoading) return;
    
    // 미인증 시 로그인 페이지로 이동
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // ADMIN이 아니면 메인 페이지로 이동
    if (user?.role !== 'ADMIN') {
      router.push('/tasks');
      return;
    }

    // 대시보드 데이터 로드
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await getAdminDashboard();
        setDashboard(data);
        setError(null);
      } catch (err) {
        setError('대시보드 데이터를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [isAuthenticated, isLoading, user?.role, router]);

  // ========== 로딩/에러 처리 ==========
  if (isLoading || loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <div className="error-box">
            <p className="error-text">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  // ========== 렌더링 ==========
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="card-container">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="page-title">관리자 대시보드</h2>
                <p className="page-description">시스템 전체 통계 및 관리 기능</p>
              </div>
              <Link href="/admin/users">
                <Button>사용자 관리</Button>
              </Link>
            </div>
          </div>
          <div className="card-body">
            {/* 사용자 통계 */}
            <div className="mb-8">
              <h3 className="text-md font-semibold mb-4">사용자 현황</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <p className="stat-label">전체 사용자</p>
                  <p className="stat-value text-blue-600">{dashboard.totalUsers}</p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">활성 사용자</p>
                  <p className="stat-value text-green-600">{dashboard.activeUsers}</p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">비활성 사용자</p>
                  <p className="stat-value text-gray-600">{dashboard.inactiveUsers}</p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">정지된 사용자</p>
                  <p className="stat-value text-red-600">{dashboard.suspendedUsers}</p>
                </div>
              </div>
            </div>

            {/* Task 통계 */}
            <div className="mb-8">
              <h3 className="text-md font-semibold mb-4">Task 현황</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <p className="stat-label">전체 Task</p>
                  <p className="stat-value text-blue-600">{dashboard.totalTasks}</p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">대기</p>
                  <p className="stat-value text-yellow-600">{dashboard.todoTasks}</p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">진행중</p>
                  <p className="stat-value text-blue-600">{dashboard.inProgressTasks}</p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">완료</p>
                  <p className="stat-value text-green-600">{dashboard.doneTasks}</p>
                </div>
              </div>
            </div>

            {/* 오늘의 통계 */}
            <div>
              <h3 className="text-md font-semibold mb-4">오늘의 통계</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="stat-card">
                  <p className="stat-label">오늘 신규 가입</p>
                  <p className="stat-value text-purple-600">{dashboard.todayNewUsers}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
