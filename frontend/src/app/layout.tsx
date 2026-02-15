import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/Header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Starter Project",
  description: "Task Management Application",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
