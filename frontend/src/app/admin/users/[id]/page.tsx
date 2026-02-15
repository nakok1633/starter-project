'use client';

/**
 * ============================================================
 * 관리자 - 사용자 수정 페이지
 * ============================================================
 * 
 * 【페이지 역할】
 * - 특정 사용자의 역할/상태 수정
 * - 사용자 상세 정보 표시
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { getAdminUser, updateAdminUser } from '@/lib/api';
import { AdminUser, AdminUserUpdateRequest, UserStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminUserEditPage() {
  // ========== 상태 관리 ==========
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);
  const { user: currentUser, isAuthenticated, isLoading } = useAuthStore();
  
  // 사용자 데이터
  const [targetUser, setTargetUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 폼 상태
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // ========== 데이터 로드 ==========
  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (currentUser?.role !== 'ADMIN') {
      router.push('/tasks');
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await getAdminUser(userId);
        setTargetUser(data);
        setRole(data.role);
        setStatus(data.status);
        setError(null);
      } catch (err) {
        setError('사용자 정보를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isAuthenticated, isLoading, currentUser?.role, router, userId]);

  // ========== 저장 핸들러 ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const request: AdminUserUpdateRequest = { role, status };
      const updated = await updateAdminUser(userId, request);
      setTargetUser(updated);
      setSuccess('사용자 정보가 수정되었습니다.');
    } catch (err) {
      setError('수정에 실패했습니다.');
      console.error(err);
    } finally {
      setSaving(false);
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

  if (!targetUser) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <div className="error-box">
            <p className="error-text">{error || '사용자를 찾을 수 없습니다.'}</p>
          </div>
          <div className="mt-4">
            <Link href="/admin/users">
              <Button variant="outline">목록으로</Button>
            </Link>
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
                <h2 className="page-title">사용자 수정</h2>
                <p className="page-description">사용자 역할 및 상태를 변경합니다.</p>
              </div>
              <Link href="/admin/users">
                <Button variant="outline">목록으로</Button>
              </Link>
            </div>
          </div>
          <div className="card-body">
            {/* 사용자 기본 정보 (읽기 전용) */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-4">기본 정보</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">ID</dt>
                  <dd className="text-sm font-medium">{targetUser.id}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">이메일</dt>
                  <dd className="text-sm font-medium">{targetUser.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">이름</dt>
                  <dd className="text-sm font-medium">{targetUser.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">가입일</dt>
                  <dd className="text-sm font-medium">
                    {new Date(targetUser.createdAt).toLocaleDateString('ko-KR')}
                  </dd>
                </div>
              </dl>
            </div>

            {/* 수정 폼 */}
            <form onSubmit={handleSubmit} className="form-container">
              {/* 에러 메시지 */}
              {error && (
                <div className="error-box">
                  <p className="error-text">{error}</p>
                </div>
              )}
              
              {/* 성공 메시지 */}
              {success && (
                <div className="success-box">
                  <p>{success}</p>
                </div>
              )}

              {/* 역할 선택 */}
              <div>
                <Label htmlFor="role">역할</Label>
                <Select value={role} onValueChange={(v) => setRole(v as 'USER' | 'ADMIN')}>
                  <SelectTrigger className="input-md mt-1">
                    <SelectValue placeholder="역할 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER (일반 사용자)</SelectItem>
                    <SelectItem value="ADMIN">ADMIN (관리자)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  관리자는 모든 사용자 정보를 관리할 수 있습니다.
                </p>
              </div>

              {/* 상태 선택 */}
              <div>
                <Label htmlFor="status">상태</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as UserStatus)}>
                  <SelectTrigger className="input-md mt-1">
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE (활성)</SelectItem>
                    <SelectItem value="INACTIVE">INACTIVE (비활성)</SelectItem>
                    <SelectItem value="SUSPENDED">SUSPENDED (정지)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  정지된 사용자는 로그인할 수 없습니다.
                </p>
              </div>

              {/* 버튼 그룹 */}
              <div className="button-group pt-4">
                <Link href="/admin/users">
                  <Button type="button" variant="outline">취소</Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving ? '저장 중...' : '저장'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
