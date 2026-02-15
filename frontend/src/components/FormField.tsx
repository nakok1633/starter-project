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

interface Option {
  label: string
  value: string
}

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  placeholder?: string
  type?: "text" | "email" | "password" | "textarea" | "select"
  options?: Option[]
  required?: boolean
  disabled?: boolean
  className?: string
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
