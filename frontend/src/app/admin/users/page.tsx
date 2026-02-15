'use client';

/**
 * ============================================================
 * 관리자 - 사용자 관리 페이지
 * ============================================================
 * 
 * 【페이지 역할】
 * - 전체 사용자 목록 조회 (페이징, 검색)
 * - 사용자 역할/상태 변경
 * - 사용자 삭제
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { getAdminUsers, deleteAdminUser } from '@/lib/api';
import { AdminUser, PageResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ConfirmDialog';

// 상태별 뱃지 스타일
const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  SUSPENDED: 'bg-red-100 text-red-800',
};

// 역할별 뱃지 스타일
const roleStyles: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  USER: 'bg-blue-100 text-blue-800',
};

// 상태 한글 변환
const statusLabels: Record<string, string> = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
  SUSPENDED: '정지',
};

export default function AdminUsersPage() {
  // ========== 상태 관리 ==========
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  // 사용자 목록 상태
  const [users, setUsers] = useState<PageResponse<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 검색 및 페이징
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // 삭제 다이얼로그
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ========== 데이터 로드 ==========
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers({
        page,
        size: pageSize,
        search: search || undefined,
        sortBy: 'createdAt',
        sortDir: 'desc',
      });
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('사용자 목록을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  // ========== 권한 체크 및 데이터 로드 ==========
  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (user?.role !== 'ADMIN') {
      router.push('/tasks');
      return;
    }

    fetchUsers();
  }, [isAuthenticated, isLoading, user?.role, router, fetchUsers]);

  // ========== 이벤트 핸들러 ==========
  
  // 검색 실행
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  // 엔터키로 검색
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 사용자 삭제
  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      setIsDeleting(true);
      await deleteAdminUser(deleteTarget.id);
      setDeleteTarget(null);
      fetchUsers(); // 목록 새로고침
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('사용자 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

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

  // ========== 렌더링 ==========
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="card-container">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="page-title">사용자 관리</h2>
                <p className="page-description">
                  전체 {users?.totalElements ?? 0}명
                </p>
              </div>
              <Link href="/admin">
                <Button variant="outline">대시보드</Button>
              </Link>
            </div>
          </div>
          <div className="card-body">
            {/* 검색 */}
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="이메일 또는 이름 검색..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="max-w-xs"
              />
              <Button onClick={handleSearch}>검색</Button>
              {search && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchInput('');
                    setSearch('');
                    setPage(0);
                  }}
                >
                  초기화
                </Button>
              )}
            </div>

            {/* 사용자 테이블 */}
            <div className="overflow-hidden rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users?.content.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${roleStyles[u.role]}`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${statusStyles[u.status]}`}>{statusLabels[u.status]}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="table-actions">
                          <Link href={`/admin/users/${u.id}`}>
                            <Button size="sm" variant="outline">수정</Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => setDeleteTarget(u)}
                            disabled={u.id === user?.id}
                          >
                            삭제
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users?.content.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                        {search ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {users && users.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  이전
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-700">
                  {page + 1} / {users.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(users.totalPages - 1, p + 1))}
                  disabled={users.last}
                >
                  다음
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 삭제 확인 다이얼로그 */}
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="사용자 삭제"
          description={`'${deleteTarget?.name}' (${deleteTarget?.email}) 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
          confirmText="삭제"
          cancelText="취소"
          onConfirm={handleDelete}
          isLoading={isDeleting}
          variant="destructive"
        />
      </div>
    </div>
  );
}
