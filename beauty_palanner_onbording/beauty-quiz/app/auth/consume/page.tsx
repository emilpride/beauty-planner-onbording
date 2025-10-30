"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { auth } from "@/lib/firebase"
import { signInWithCustomToken } from "firebase/auth"

function ConsumeTokenInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const token = params.get("token")
    if (!token) {
      setStatus("error")
      setMessage("Missing token")
      // Redirect to home shortly
      const id = setTimeout(() => router.replace("/"), 1500)
      return () => clearTimeout(id)
    }
    let cancelled = false
    async function run(t: string) {
      try {
        setStatus("working")
        await signInWithCustomToken(auth, t)
        if (!cancelled) {
          setStatus("done")
          router.replace("/")
        }
      } catch (e: any) {
        console.error("signInWithCustomToken failed:", e?.message || e)
        if (!cancelled) {
          setStatus("error")
          setMessage(e?.message || "Sign-in failed")
          setTimeout(() => router.replace("/"), 1800)
        }
      }
    }
    run(token)
    return () => { cancelled = true }
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-surface p-6 text-center">
        <h1 className="text-xl font-bold text-text-primary mb-2">Preparing your account…</h1>
        {status === "working" && (
          <p className="text-sm text-text-secondary">Linking your purchase and signing you in.</p>
        )}
        {status === "done" && (
          <p className="text-sm text-text-secondary">All set! Redirecting…</p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600">{message || "Something went wrong. Redirecting…"}</p>
        )}
      </div>
    </div>
  )
}

export default function ConsumeTokenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-surface p-6 text-center">
            <h1 className="text-xl font-bold text-text-primary mb-2">Preparing your account…</h1>
            <p className="text-sm text-text-secondary">One moment…</p>
          </div>
        </div>
      }
    >
      <ConsumeTokenInner />
    </Suspense>
  )
}
