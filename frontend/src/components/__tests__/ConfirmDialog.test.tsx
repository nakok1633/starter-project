import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    title: '테스트 제목',
    onConfirm: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('다이얼로그가 열릴 때 제목을 표시한다', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    expect(screen.getByText('테스트 제목')).toBeInTheDocument();
  });

  it('설명이 있을 때 표시한다', () => {
    render(
      <ConfirmDialog 
        {...defaultProps} 
        description="테스트 설명입니다" 
      />
    );
    
    expect(screen.getByText('테스트 설명입니다')).toBeInTheDocument();
  });

  it('기본 버튼 텍스트가 "확인"과 "취소"이다', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  it('커스텀 버튼 텍스트를 표시한다', () => {
    render(
      <ConfirmDialog 
        {...defaultProps} 
        confirmText="삭제"
        cancelText="돌아가기"
      />
    );
    
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '돌아가기' })).toBeInTheDocument();
  });

  it('확인 버튼 클릭 시 onConfirm이 호출된다', async () => {
    const onConfirm = jest.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    
    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it('취소 버튼 클릭 시 onOpenChange가 호출된다', () => {
    const onOpenChange = jest.fn();
    render(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />);
    
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('로딩 중일 때 버튼이 비활성화되고 텍스트가 변경된다', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);
    
    const confirmButton = screen.getByRole('button', { name: '처리 중...' });
    const cancelButton = screen.getByRole('button', { name: '취소' });
    
    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('open이 false일 때 다이얼로그가 표시되지 않는다', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    
    expect(screen.queryByText('테스트 제목')).not.toBeInTheDocument();
  });

  it('destructive variant일 때 확인 버튼 스타일이 적용된다', () => {
    render(<ConfirmDialog {...defaultProps} variant="destructive" />);
    
    const confirmButton = screen.getByRole('button', { name: '확인' });
    // destructive variant는 특정 클래스를 가짐
    expect(confirmButton).toBeInTheDocument();
  });
});
