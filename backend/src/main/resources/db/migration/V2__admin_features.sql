-- 관리자 기능을 위한 DB 마이그레이션
-- 사용자 상태 컬럼 추가

-- 사용자 테이블에 status 컬럼 추가 (기본값: ACTIVE)
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL;

-- status 컬럼에 인덱스 추가 (상태별 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- role 컬럼에 인덱스 추가 (역할별 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 기존 사용자들을 ACTIVE 상태로 설정 (이미 DEFAULT로 설정되지만 명시적으로)
UPDATE users SET status = 'ACTIVE' WHERE status IS NULL;
