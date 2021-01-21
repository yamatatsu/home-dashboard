import React, { FC, useLayoutEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/router"

export const useGoToHome = () => {
  const router = useRouter()
  return () => router.push("/")
}
export const useGoToLogin = () => {
  const router = useRouter()
  return () => router.push("/login")
}
export const useGoToRegisterDevice = () => {
  const router = useRouter()
  return () => router.push("/registerDevice")
}
export const LinkToRegisterDevice: FC = ({ children }) => {
  return <Link href="/registerDevice">{children ?? "Register Device"}</Link>
}
