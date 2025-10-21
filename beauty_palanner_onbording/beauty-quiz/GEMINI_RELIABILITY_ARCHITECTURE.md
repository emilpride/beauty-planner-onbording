# 🏗️ Gemini Reliability - System Architecture

---

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/Next.js)                │
│                                                              │
│  POST /analyzeUserData → { userId, answers, photoUrls }    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              CLOUD FUNCTION: analyzeUserData                 │
│                      (Timeout: 60s)                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ PHASE 1: PRE-CHECK (5s)                                 ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ ✓ Circuit breaker check                                 ││
│  │ ✓ Rate limiting (10 req/min per IP)                    ││
│  │ ✓ Input validation (age, height, weight)               ││
│  │ ✓ Cache key generation                                  ││
│  │ ✓ Check Firestore cache                                ││
│  └─────────────────────────────────────────────────────────┘│
│                             ▼                                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ PHASE 2: AI ANALYSIS (45s max)                          ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ ┌──────────────────────────────────────────────────────┐││
│  │ │ TRY 1: Gemini API                                    │││
│  │ │ ├─ Attempt 1: Retry (500ms delay)                   │││
│  │ │ ├─ Attempt 2: Retry (1s delay)                      │││
│  │ │ ├─ Attempt 3: Retry (2s delay)                      │││
│  │ │ └─ Attempt 4: Retry (4s delay)                      │││
│  │ │ ✗ All failed                                         │││
│  │ └──────────────────────────────────────────────────────┘││
│  │                      ▼                                   ││
│  │ ┌──────────────────────────────────────────────────────┐││
│  │ │ TRY 2: Claude API Fallback (if enabled)              │││
│  │ │ ✓ Claude 3.5 Sonnet                                 │││
│  │ │ ✓ Same format as Gemini output                       │││
│  │ │ ✗ Failed or not enabled                              │││
│  │ └──────────────────────────────────────────────────────┘││
│  │                      ▼                                   ││
│  │ ┌──────────────────────────────────────────────────────┐││
│  │ │ FALLBACK: Error Response (graceful failure)          │││
│  │ │ Status 502: "Service temporarily unavailable"        │││
│  │ └──────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
│                             ▼                                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ PHASE 3: POST-PROCESSING (10s)                          ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ ✓ Build complete analysis                              ││
│  │ ✓ Save to Firestore (users/{userId}/analysis)         ││
│  │ ✓ Save to cache (ai_analysis_cache)                    ││
│  │ ✓ Log session events                                    ││
│  │ ✓ Record metrics                                        ││
│  └─────────────────────────────────────────────────────────┘│
│                             ▼                                │
│  Response: 200 OK { analysis, fromCache?, usedFallback? }   │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│            MONITORING & ANALYTICS (Background)              │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ logAPIEvent()                                          │ │
│ │ → Firestore: api_events/{date}/events                │ │
│ │ → Events: success, failure, retry, cache_hit, etc    │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ updateRealtimeMetrics()                                │ │
│ │ → Firestore: system/api_metrics                        │ │
│ │ → Fields: events, window, avgLatency, etc              │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ sendSentryAlert()                                      │ │
│ │ → Sentry: Issue/Alerts dashboard                      │ │
│ │ → Alerts: retry_exhausted, circuit_open, etc          │ │
│ └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Diagram

```
START
  ↓
[Circuit Breaker?] ──YES→ Return 503 ──→ END (Error)
  ↓
 NO
  ↓
[Rate Limited?] ──YES→ Return 429 ──→ END (Error)
  ↓
 NO
  ↓
[Input Valid?] ──NO→ Return 400 ──→ END (Error)
  ↓
YES
  ↓
[Cache Key Gen] → Calculate similarity hash
  ↓
[Check Cache] ──HIT→ Return Cached Result ──→ END (200 OK)
  ↓
 MISS
  ↓
[Start Heartbeat] → Log progress every 15s
  ↓
[Try Gemini] ───┐
      │         │
      ├─→ Attempt 1 (500ms)
      ├─→ Attempt 2 (1s)
      ├─→ Attempt 3 (2s)
      ├─→ Attempt 4 (4s)
      │
      ├──SUCCESS→ Parse JSON ─→ Validate Format ──YES→ [Save & Return]
      │                                           │
      │                                           NO↓
      │                                        [Try Claude]
      └──FAIL→ [Try Claude Fallback] ──SUCCESS→ [Save & Return]
               │                       FAIL↓
               └─────────→ Return 502 ──→ END (Error)

[Save & Return]
  ↓
[Save to Firestore]
[Save to Cache]
[Log Session]
[Stop Heartbeat]
[Record Metrics]
[Send Success Event]
  ↓
Return 200 OK + Analysis
  ↓
END
```

---

## 🏛️ Data Flow Architecture

```
┌──────────────────┐
│   FRONTEND       │
│  (React/Next)    │
└────────┬─────────┘
         │
         │ POST /analyzeUserData
         │ { userId, answers, photos }
         ▼
┌──────────────────────────────────────────┐
│    CLOUD FUNCTION: analyzeUserData       │
│  (Timeout: 60s, Max instances: 10)      │
├──────────────────────────────────────────┤
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ Circuit Breaker Check            │   │
│  │ (in-memory + Firestore)          │   │
│  │ State: { failures, isOpen, ... } │   │
│  └──────────────────────────────────┘   │
│                 ▼                        │
│  ┌──────────────────────────────────┐   │
│  │ Input Validation                 │   │
│  │ (age, height, weight, etc)       │   │
│  │ ✓ Trim strings                   │   │
│  │ ✓ Validate ranges               │   │
│  │ ✓ Limit array sizes             │   │
│  └──────────────────────────────────┘   │
│                 ▼                        │
│  ┌──────────────────────────────────┐   │
│  │ Cache Key Generation             │   │
│  │ Key = Age:Gender:SkinType:...    │   │
│  │ (Base64 encoded)                 │   │
│  └──────────────────────────────────┘   │
│                 ▼                        │
│  ┌──────────────────────────────────┐   │
│  │ Firestore: ai_analysis_cache     │   │
│  │ Check for existing analysis      │   │
│  │ Cache HIT? → Return cached       │   │
│  └──────────────────────────────────┘   │
│                 ▼                        │
│  ┌──────────────────────────────────┐   │
│  │ Retry with Exponential Backoff   │   │
│  │ retryWithBackoff(4 attempts)     │   │
│  │ ├─ 500ms                         │   │
│  │ ├─ 1s                            │   │
│  │ ├─ 2s                            │   │
│  │ └─ 4s                            │   │
│  └──────────────────────────────────┘   │
│                 ▼                        │
│  ┌──────────────────────────────────┐   │
│  │ Gemini API Call (45s timeout)    │   │
│  │ https://generativelanguage...    │   │
│  │ ├─ User profile + photos         │   │
│  │ ├─ Strict JSON schema            │   │
│  │ └─ Procedure ID validation       │   │
│  └──────────────────────────────────┘   │
│                 │                        │
│    ┌────────────┴──────────┐             │
│    ▼ FAIL (after 4 tries)  ▼ SUCCESS     │
│  ┌─────────────────────┐  [Parse JSON]   │
│  │ Claude Fallback     │  [Validate]     │
│  │ (if enabled)        │  [Build Analysis]│
│  │                     │  └──────┬────────┘
│  │ API: Claude 3.5     │         ▼
│  │ Key: $CLAUDE_KEY    │  ┌──────────────┐
│  │ (45s timeout)       │  │ Save Results │
│  │                     │  ├──────────────┤
│  │ SUCCESS? ──YES──┬───┤  │ Firestore:   │
│  │        └─NO─┐  │   │  │ users/{uid}/ │
│  │            ▼  ▼   │  │ analysis/    │
│  │       Return 502   │  │ ├─ model     │
│  │       Error        │  │ ├─ timestamp │
│  │                    │  │ └─ usedflag  │
│  └────────────────────┘  └──────────────┘
│                                 ▼
│                          ┌──────────────┐
│                          │ Save to Cache│
│                          │ Firestore:   │
│                          │ analysis_    │
│                          │ cache/{key}  │
│                          │ ├─ analysis  │
│                          │ ├─ createdAt │
│                          │ └─ TTL: 7d   │
│                          └──────────────┘
│                                 ▼
│                          ┌──────────────┐
│                          │ Log Events   │
│                          │ Firestore:   │
│                          │ api_events/  │
│                          │ {date}/events│
│                          └──────────────┘
│                                 ▼
│                          ┌──────────────┐
│                          │ Send Metrics │
│                          │ system/      │
│                          │ api_metrics  │
│                          │ ├─ events    │
│                          │ ├─ latency   │
│                          │ └─ status    │
│                          └──────────────┘
└──────────────────────────────────────────┘
         │
         │ 200 OK + Analysis
         │
         ▼
    FRONTEND
    (Display Results)
```

---

## 🔐 Circuit Breaker State Machine

```
┌─────────────────────────────────────┐
│         CIRCUIT CLOSED              │
│ (Normal Operation)                  │
│                                     │
│ - Requests flow normally            │
│ - Track success/failure rate        │
│ - Count: failures/total ratio       │
└────────────────┬────────────────────┘
                 │
    Failure Rate > 30% in 5 min?
                 │
              YES│
                 ▼
┌─────────────────────────────────────┐
│         CIRCUIT OPEN                │
│ (Failure Detected)                  │
│                                     │
│ - Return 503 to all requests        │
│ - Stop calling Gemini API           │
│ - Wait for recovery timeout         │
│ - Record time: lastFailureTime      │
│                                     │
│ Triggers:                           │
│ ├─ sendSentryAlert('error')        │
│ ├─ Log: CIRCUIT BREAKER OPENED     │
│ └─ Database: circuitBreakerOpen=T  │
└────────────────┬────────────────────┘
                 │
    Wait 2 minutes for recovery
                 │
              YES│
                 ▼
┌─────────────────────────────────────┐
│      CIRCUIT RECOVERING             │
│ (Attempting to Resume)              │
│                                     │
│ - Start allowing requests again     │
│ - Try 1-2 requests to test API      │
│ - If success: go CLOSED             │
│ - If failure: stay OPEN (restart)   │
└────────────────┬────────────────────┘
                 │
      Recovery succeeds?
                 │
              YES│
                 ▼
┌─────────────────────────────────────┐
│         CIRCUIT CLOSED              │
│ (Back to Normal)                    │
│ - Continue normal operation         │
│ - Reset failure counters            │
│ - Log: CIRCUIT BREAKER CLOSED       │
└─────────────────────────────────────┘
```

---

## 📊 Metrics Collection Architecture

```
┌──────────────────────────────────────┐
│   Cloud Function: analyzeUserData    │
│   (Every request)                    │
└────────────────┬─────────────────────┘
                 │
                 │ Calls: logAPIEvent()
                 ▼
┌──────────────────────────────────────┐
│   Firestore Collection: api_events   │
│   Partitioned by date: /{date}/      │
├──────────────────────────────────────┤
│                                      │
│ Document structure:                  │
│ {                                    │
│   type: 'success' | 'failure' |...  │
│   userId: 'user123'                 │
│   latencyMs: 12345                  │
│   attemptNumber: 2                  │
│   recordedAt: timestamp             │
│ }                                    │
│                                      │
│ Examples:                            │
│ - { type: 'success', latencyMs: 8234│
│ - { type: 'retry', attemptNumber: 2 │
│ - { type: 'cache_hit', latencyMs:245│
│ - { type: 'claude_fallback' }        │
└──────────────────────────────────────┘
         │
         │ Aggregated to:
         ▼
┌──────────────────────────────────────┐
│  Firestore Document: system/metrics  │
├──────────────────────────────────────┤
│                                      │
│ {                                    │
│   events: {                          │
│     total: 1250                      │
│     success: 1220                    │
│     failure: 30                      │
│     retry: 85                        │
│     circuit_open: 0                  │
│     cache_hit: 320                   │
│     cache_miss: 512                  │
│     claude_fallback: 8               │
│   },                                 │
│   window: {                          │
│     success: 45                      │
│     failures: 5                      │
│     timestamp: 1728555600000         │
│   },                                 │
│   avgLatency: 12450                  │
│   circuitBreakerOpen: false          │
│   lastUpdated: timestamp             │
│ }                                    │
└──────────────────────────────────────┘
         │
         │ Read by:
         ├────────────────┬──────────────┐
         ▼                ▼              ▼
    ┌────────┐      ┌──────────┐  ┌──────────┐
    │ Sentry │      │Dashboard │  │Analytics │
    │Alerts  │      │getMetrics│  │ Frontend │
    └────────┘      └──────────┘  └──────────┘
```

---

## 🔌 Module Dependencies

```
index.ts
├─ reliability.ts
│  ├─ monitoring.ts
│  └─ admin (Firestore)
│
├─ heartbeat.ts
│
├─ claude.ts
│  ├─ axios (HTTP)
│  └─ admin (config)
│
└─ monitoring.ts
   ├─ admin (Firestore)
   ├─ Sentry
   └─ axios (optional)

Frontend
├─ analyzeUserData endpoint
├─ healthCheck endpoint
└─ getHealthMetrics endpoint
```

---

## 🚀 Deployment Architecture

```
┌────────────────────────────────────────────┐
│      Google Cloud Platform (GCP)           │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Cloud Functions                      │ │
│  │  ├─ analyzeUserData (60s timeout)    │ │
│  │  ├─ healthCheck (monitoring)         │ │
│  │  ├─ getHealthMetrics (API)           │ │
│  │  └─ Max instances: 10                │ │
│  └──────────────────────────────────────┘ │
│                 │                          │
│                 ▼                          │
│  ┌──────────────────────────────────────┐ │
│  │  Firestore Database                   │ │
│  │  ├─ users/{uid}/analysis/            │ │
│  │  ├─ ai_analysis_cache/               │ │
│  │  ├─ api_events/{date}/events/        │ │
│  │  ├─ system/api_metrics               │ │
│  │  ├─ users_web_onbording/             │ │
│  │  └─ payments/                        │ │
│  └──────────────────────────────────────┘ │
│                 │                          │
│    ┌────────────┼────────────┐             │
│    ▼            ▼            ▼             │
│  Cloud      Sentry       Cloud            │
│  Storage    (Alerts)     Scheduler        │
│                          (every 10min)    │
└────────────────────────────────────────────┘
         │
         │ Calls:
         ├─────────────────────────────────┐
         ▼                                 ▼
    ┌─────────────┐               ┌──────────────┐
    │ Gemini API  │               │ Claude API   │
    │ 45s timeout │               │ 45s timeout  │
    │ 4 retries   │               │ Fallback     │
    └─────────────┘               └──────────────┘
```

---

## 💾 Cache Key Generation Algorithm

```
Input: User Answers
{
  Age: 28,
  Gender: 2 (female),
  SkinType: "oily",
  SkinProblems: [{id: "acne", isActive: true}, ...],
  HairProblems: [{id: "dryness", isActive: true}],
  Stress: "high",
  Mood: "neutral"
}
  │
  ▼
┌─────────────────────────────────┐
│ Process Each Field              │
├─────────────────────────────────┤
│ 1. Age:                         │
│    28 → "20-30"                 │
│    (age range)                  │
│                                 │
│ 2. Gender:                      │
│    2 → "female"                 │
│    (normalized)                 │
│                                 │
│ 3. SkinType:                    │
│    "oily" → "oily"              │
│    (as-is)                      │
│                                 │
│ 4. Top Skin Problems (max 3):   │
│    [acne, oily, ...] → sorted   │
│    "acne,oily,pore"             │
│                                 │
│ 5. Top Hair Problems (max 2):   │
│    [dryness, ...] → sorted      │
│    "dryness"                    │
│                                 │
│ 6. Stress:                      │
│    "high" → "high"              │
│                                 │
│ 7. Mood:                        │
│    "neutral" → "neutral"        │
└─────────────────────────────────┘
  │
  ▼
Concatenate: "20-30:female:oily:acne,oily:dryness:high:neutral"
  │
  ▼
Base64 Encode: "MjAtMzA6ZmVtYWxlOm9pbHk6YWNuZSxvaWx5OmRyeW5lc3M6aGlnaDpuZXV0cmFs"
  │
  ▼
Use as Firestore Document ID:
/ai_analysis_cache/MjAtMzA6ZmVtYWxlOm9pbHk6YWNuZSxvaWx5OmRyeW5lc3M6aGlnaDpuZXV0cmFs
  │
  ▼
Cache HIT Rate: ~35-40%
```

---

## 📈 Performance Targets

```
┌────────────────────────────────────┐
│   Latency Breakdown (Target: 15s)  │
├────────────────────────────────────┤
│                                    │
│ Pre-check & validation:   500ms    │
│ Cache lookup:             200ms    │
│ Gemini API call:        10,000ms   │ ← Main time
│ JSON parsing:             500ms    │
│ Validation:               300ms    │
│ Firestore save:           500ms    │
│ Cache save:               300ms    │
│ Event logging:            200ms    │
│ Total:                  12,500ms   │
│                                    │
│ With cache hit:           300ms    │
│ With 2nd attempt:       8,000ms    │
│ With Claude fallback:   18,000ms   │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│   Success Rate Improvements         │
├────────────────────────────────────┤
│                                    │
│ No retries:              92%       │
│ + Retries (4x):          96%       │
│ + Cache:                 97%       │
│ + Circuit breaker:       97.5%     │
│ + Claude fallback:       98-99%    │
│                                    │
└────────────────────────────────────┘
```

---

This architecture ensures:
- ✅ **High reliability**: 4 retries + circuit breaker + fallback
- ✅ **Fast responses**: Caching + optimized pre-checks
- ✅ **Self-healing**: Auto-recovery + graceful degradation
- ✅ **Observable**: Comprehensive metrics + Sentry alerts
- ✅ **Scalable**: Stateless functions + partitioned Firestore collections
