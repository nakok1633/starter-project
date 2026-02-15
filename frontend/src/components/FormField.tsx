/**
 * ============================================================
 * 폼 필드 컴포넌트 (React Hook Form 연동)
 * ============================================================
 * 
 * 【이 컴포넌트의 역할】
 * 폼에서 반복되는 입력 필드 패턴을 재사용 가능하게 만든 컴포넌트입니다.
 * 레이블, 입력, 에러 메시지를 하나로 묶어 관리합니다.
 * 
 * 【지원하는 입력 타입】
 * - text: 일반 텍스트
 * - email: 이메일
 * - password: 비밀번호 (마스킹)
 * - textarea: 여러 줄 텍스트
 * - select: 드롭다운 선택
 * 
 * 【사용 예시】
 * ```
 * <FormField
 *   control={form.control}    // React Hook Form의 control
 *   name="email"              // 필드 이름 (폼 데이터의 키)
 *   label="이메일"
 *   type="email"
 *   placeholder="example@email.com"
 *   required
 * />
 * ```
 * 
 * 【React Hook Form Controller란?】
 * 외부 라이브러리 컴포넌트(예: Select)를 React Hook Form과 연동하는 방식입니다.
 * register는 기본 input 요소에, Controller는 커스텀 컴포넌트에 사용합니다.
 */

"use client"

import * as React from "react"
// React Hook Form 타입들
import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

/** Select 옵션 타입 정의 */
interface Option {
  label: string   // 화면에 표시되는 텍스트 (예: "진행 중")
  value: string   // 실제 저장되는 값 (예: "IN_PROGRESS")
}

/**
 * FormField Props 인터페이스
 * 
 * 【제네릭 <T extends FieldValues>】
 * T는 폼 데이터 타입입니다.
 * extends FieldValues: 객체 형태여야 함을 명시
 * 
 * 예: T가 { email: string, password: string }이면
 * name에는 "email" | "password"만 입력 가능
 */
interface FormFieldProps<T extends FieldValues> {
  control: Control<T>         // React Hook Form의 control 객체 (useForm에서 반환)
  name: Path<T>               // 필드명 (타입 안전: 폼 데이터의 키만 허용)
  label: string               // 레이블 텍스트
  placeholder?: string        // 입력 힌트
  type?: "text" | "email" | "password" | "textarea" | "select"  // 필드 타입
  options?: Option[]          // select 타입일 때 옵션 목록
  required?: boolean          // 필수 필드 여부 (* 표시)
  disabled?: boolean          // 비활성화 여부
  className?: string          // 추가 CSS 클래스
}

/**
 * FormField 컴포넌트
 * 
 * 【왜 Controller를 사용?】
 * - shadcn/ui의 Select는 기본 <select> 태그가 아님
 * - register로 직접 연결 불가
 * - Controller로 값 변경을 수동으로 처리해야 함
 */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  options = [],
  required = false,
  disabled = false,
  className,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className={cn("space-y-2", className)}>
          <Label htmlFor={name}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          
          {type === "textarea" ? (
            <Textarea
              id={name}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              className={cn(error && "border-destructive")}
            />
          ) : type === "select" ? (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <SelectTrigger className={cn(error && "border-destructive")}>
                <SelectValue placeholder={placeholder || `${label} 선택`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={name}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              className={cn(error && "border-destructive")}
            />
          )}
          
          {error && (
            <p className="text-sm text-destructive">{error.message}</p>
          )}
        </div>
      )}
    />
  )
}
