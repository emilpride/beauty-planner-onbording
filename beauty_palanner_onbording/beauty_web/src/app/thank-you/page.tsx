"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { getFirebaseApp } from '@/lib/firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

export const dynamic = 'force-dynamic'

function getFunctionsBase() {
  if (process.env.NEXT_PUBLIC_FUNCTIONS_BASE) return process.env.NEXT_PUBLIC_FUNCTIONS_BASE
  return 'https://us-central1-beauty-planner-26cc0.cloudfunctions.net'
}

function detectDevice() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : ''
  if (/Android/i.test(ua)) return 'android' as const
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios' as const
  return 'desktop' as const
}

function getStoreLinks() {
  const iosId = process.env.NEXT_PUBLIC_IOS_APP_ID || ''
  const iosUrl = iosId ? `https://apps.apple.com/app/id${iosId}` : '#'
  const andPkg = process.env.NEXT_PUBLIC_ANDROID_PACKAGE || 'com.beautymirror.app'
  const andUrl = `https://play.google.com/store/apps/details?id=${andPkg}`
  return { iosUrl, andUrl }
}

export default function ThankYouPage() {
  const [link, setLink] = useState<string | null>(null)
  const [uidPresent, setUidPresent] = useState(false)
  const device = useMemo(() => detectDevice(), [])
  const { iosUrl, andUrl } = getStoreLinks()

  useEffect(() => {
    const app = getFirebaseApp()
    const auth = getAuth(app)
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUidPresent(!!u)
      if (!u) return
      try {
        const idToken = await u.getIdToken(true)
        const resp = await fetch(`${getFunctionsBase()}/createDeferredToken`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
          body: '{}',
        })
        if (resp.ok) {
          const json = await resp.json()
          setLink(json.dynamicLink as string)
        }
      } catch {}
    })
    return () => unsub()
  }, [])

  const primaryCta = device === 'ios' ? 'ios' : device === 'android' ? 'android' : 'web'

  return (
    <div className="min-h-[80vh] grid place-items-center p-4">
      <div className="w-full max-w-[580px] rounded-2xl border border-border-subtle bg-surface shadow-xl overflow-hidden">
        <div className="relative h-40 bg-gradient-to-br from-[#7E5BEF] to-[#5F44C1]">
          <div className="absolute inset-0 opacity-15" style={{backgroundImage:'radial-gradient(white 1px, transparent 1px)', backgroundSize:'10px 10px'}} />
          <div className="absolute inset-0 grid place-items-center text-white">
            <div className="text-center">
              <h1 className="text-2xl font-extrabold mb-1">Thank you for your purchase!</h1>
              <p className="text-sm opacity-90">Your access is activated. Choose how you want to continue:</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {(primaryCta === 'ios' || primaryCta === 'android') && (
            <div className="rounded-lg bg-surface-hover p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="font-semibold text-text-primary">Continue in the mobile app</div>
                <div className="text-xs text-text-secondary">We’ll transfer your access automatically via a secure link</div>
              </div>
              <div>
                {link && uidPresent ? (
                  <a className="btn btn-primary" href={link}>Open</a>
                ) : (
                  <a className="btn btn-primary" href={primaryCta==='ios'?iosUrl:andUrl}>Download</a>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a className="rounded-lg border border-border-subtle p-4 hover:bg-surface-hover transition" href={iosUrl}>
              <div className="font-semibold mb-1">iOS</div>
              <div className="text-xs text-text-secondary">App Store</div>
            </a>
            <a className="rounded-lg border border-border-subtle p-4 hover:bg-surface-hover transition" href={andUrl}>
              <div className="font-semibold mb-1">Android</div>
              <div className="text-xs text-text-secondary">Google Play</div>
            </a>
          </div>

          <div className="pt-2">
            <Link className="w-full inline-flex items-center justify-center h-10 rounded-lg bg-[rgb(var(--accent))] text-white font-semibold text-sm" href="/dashboard">Continue in the web app</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
