/**
 * 폼 필드 컴포넌트 (React Hook Form 연동)
 * - text, email, password, textarea, select 타입 지원
 * - 오류 메시지 자동 표시
 * - 필수 필드 표시 (*)
 */

"use client"

import * as React from "react"
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

/** Select 옵션 타입 */
interface Option {
  label: string   // 표시 텍스트
  value: string   // 실제 값
}

/** FormField 컴포넌트 Props */
interface FormFieldProps<T extends FieldValues> {
  control: Control<T>         // React Hook Form control 객체
  name: Path<T>               // 필드명
  label: string               // 레이블 텍스트
  placeholder?: string        // placeholder
  type?: "text" | "email" | "password" | "textarea" | "select"  // 필드 타입
  options?: Option[]          // select 옵션 목록
  required?: boolean          // 필수 여부
  disabled?: boolean          // 비활성화 여부
  className?: string          // 추가 CSS 클래스
}

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
