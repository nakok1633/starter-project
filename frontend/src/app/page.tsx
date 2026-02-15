"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/tasks")
      } else {
        router.replace("/login")
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
