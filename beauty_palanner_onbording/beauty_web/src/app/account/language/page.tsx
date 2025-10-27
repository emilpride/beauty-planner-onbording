"use client"

import { Protected } from '@/components/auth/Protected'
import { PageContainer } from '@/components/common/PageContainer'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useMemo, useState } from 'react'
import { fetchUserLocale, saveUserLocale } from '@/lib/userSettings'
import Link from 'next/link'

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'uk', label: 'Українська' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'pl', label: 'Polski' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'kk', label: 'Қазақша' },
  { code: 'ar', label: 'العربية' },
]
// Generate wide region list from ISO alpha-2 codes, excluding Russia (RU)
const REGION_CODES = [
  'AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ','BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ','CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CX','CY','CZ','DE','DJ','DK','DM','DO','DZ','EC','EE','EG','EH','ER','ES','ET','FI','FJ','FK','FM','FO','FR','GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY','HK','HM','HN','HR','HT','HU','ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT','JE','JM','JO','JP','KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ','LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY','MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ','NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY','QA','RE','RO','RS','RW','SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ','TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ','UA','UG','UM','US','UY','UZ','VA','VC','VE','VG','VI','VN','VU','WF','WS','XK','YE','YT','ZA','ZM','ZW'
]

export default function LanguageRegionPage() {
  const { user } = useAuth()
  const [language, setLanguage] = useState('en')
  const [region, setRegion] = useState('us')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'ok' | 'err' | null>(null)
  const languageLabel = useMemo(() => LANGS.find(l => l.code===language)?.label ?? language, [language])
  const regionNames = useMemo(() => new Intl.DisplayNames([language || 'en'], { type: 'region' }), [language])
  const regionOptions = useMemo(() => REGION_CODES.map(code => ({ code: code.toLowerCase(), label: regionNames.of(code) ?? code })), [regionNames])
  const regionLabel = useMemo(() => regionNames.of((region || 'US').toUpperCase()) ?? region, [region, regionNames])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!user?.uid) return
      try {
        const l = await fetchUserLocale(user.uid)
        if (!cancelled) { setLanguage(l.language); setRegion(l.region) }
      } catch {
        // noop
      }
    }
    load()
    return () => { cancelled = true }
  }, [user?.uid])

  const save = async () => {
    if (!user?.uid) return
    setSaving(true)
    setStatus(null)
    try {
      await saveUserLocale(user.uid, { language, region })
      setStatus('ok')
    } catch {
      setStatus('err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Protected>
      <PageContainer>
        <div className="max-w-[720px] mx-auto py-8 space-y-6">
          <div className="mb-2 flex items-center gap-4">
            <Link href="/preferences" className="text-text-secondary hover:text-text-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Language & Region</h1>
          </div>

          <section className="bg-surface border border-border-subtle rounded-xl p-4 md:p-6 shadow-sm space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-text-secondary font-semibold mb-1">Language</div>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="appearance-none w-full h-10 rounded-lg border border-border-subtle bg-surface px-3 pr-10 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                  >
                    {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">▾</span>
                </div>
                <div className="text-xs text-text-secondary mt-1">{languageLabel}</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary font-semibold mb-1">Region</div>
                <div className="relative">
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="appearance-none w-full h-10 rounded-lg border border-border-subtle bg-surface px-3 pr-10 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                  >
                    {regionOptions.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">▾</span>
                </div>
                <div className="text-xs text-text-secondary mt-1">{regionLabel}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {status==='ok' && <span className="text-sm text-green-600">Saved</span>}
              {status==='err' && <span className="text-sm text-red-600">Failed</span>}
              <button onClick={save} disabled={saving} className={`px-4 h-10 rounded-lg text-sm font-medium border transition ${!saving ? 'bg-[rgb(var(--accent))] text-white border-transparent' : 'bg-surface border-border-subtle text-text-secondary cursor-default'}`}>{saving? 'Saving…':'Save'}</button>
            </div>
          </section>
        </div>
      </PageContainer>
    </Protected>
  )
}
