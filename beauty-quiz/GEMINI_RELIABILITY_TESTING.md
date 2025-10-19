# 💡 Gemini Reliability - Usage Examples & Testing

---

## 🧪 Testing the Retry Mechanism

### Test Scenario: Simulate Gemini API Failure

```bash
# 1. Temporarily disable Gemini API key to simulate failures
firebase functions:config:set gemini.key="invalid-key"

# 2. Send analysis request
curl -X POST https://us-central1-beauty-planner-26cc0.cloudfunctions.net/analyzeUserData \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "sessionId": "session-456",
    "answers": {
      "Age": 28,
      "Gender": 2,
      "Height": 170,
      "HeightUnit": "cm",
      "Weight": 65,
      "WeightUnit": "kg",
      "SkinType": "oily",
      "HairType": "curly"
    }
  }'

# Expected behavior:
# - Attempt 1: FAIL (invalid key)
# - Attempt 2: FAIL (500ms wait)
# - Attempt 3: FAIL (1s wait)
# - Attempt 4: FAIL (2s wait)
# - Claude fallback: SUCCESS (if enabled)
# - Logs: Show all attempts in Cloud Functions log
```

### Check Retry Logs
```bash
firebase functions:log --only analyzeUserData
# Output should show:
# [Retry] Attempt 1/4
# [Retry] Attempt 1 failed, retrying in 500ms
# [Retry] Attempt 2/4
# ...
```

---

## 🔄 Testing Circuit Breaker

### Trigger Circuit Breaker (>30% failure rate)

```bash
# Simulate rapid failures
for i in {1..100}; do
  curl -X POST https://.../analyzeUserData \
    -H "Content-Type: application/json" \
    -d '{"userId": "test-'$i'", "answers": {...}}' &
done

# After ~30 failures out of 100:
# - Next requests get 503 response
# - Message: "The analysis service is temporarily unavailable"
# - Circuit stays OPEN for 2 minutes
# - Logs show [CircuitBreaker] OPENING CIRCUIT

# Verify via metrics endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://.../getHealthMetrics

# Response should show:
# "circuitBreakerOpen": true
```

### Wait for Recovery
```bash
# After 2 minutes, circuit auto-recovers
# Check metrics again
curl https://.../getHealthMetrics
# Should show: "circuitBreakerOpen": false
```

---

## 💾 Testing Cache

### First Request (Cache Miss)
```bash
# Request 1: Cache MISS
curl -X POST https://.../analyzeUserData \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user1",
    "answers": {
      "Age": 25,
      "Gender": 2,
      "Height": 165,
      "HeightUnit": "cm",
      "Weight": 60,
      "WeightUnit": "kg",
      "SkinType": "oily",
      "SkinProblems": [{"id": "acne", "isActive": true}],
      "Stress": "high"
    }
  }'

# Response time: ~15-20 seconds (Gemini API call)
# Response: { "analysis": {...}, "fromCache": false }
```

### Second Request (Cache Hit)
```bash
# Request 2: Similar profile (CACHE HIT)
curl -X POST https://.../analyzeUserData \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user2",
    "answers": {
      "Age": 25,  # Same age range (20-30)
      "Gender": 2,  # Same
      "Height": 166,  # Similar height
      "HeightUnit": "cm",
      "Weight": 61,  # Similar weight
      "WeightUnit": "kg",
      "SkinType": "oily",  # Same
      "SkinProblems": [{"id": "acne", "isActive": true}],  # Same top problem
      "Stress": "high"  # Same stress level
    }
  }'

# Response time: <500ms (cached)
# Response: { "analysis": {...}, "fromCache": true }
# Logs show: [Cache] Cache HIT for key: ...
```

### Query Cache in Firestore
```javascript
// In Firebase Console
db.collection('ai_analysis_cache').get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log(doc.id); // Cache key
      console.log(doc.data()); // { analysis, createdAt, hitCount }
    });
  });
```

---

## 🛡️ Testing Claude Fallback

### Enable Claude Fallback
```bash
firebase functions:config:set \
  fallback.enabled="true" \
  fallback.claude_key="sk-ant-..."
```

### Simulate Gemini Failure + Claude Fallback
```bash
# 1. Break Gemini API key
firebase functions:config:set gemini.key="invalid"

# 2. Make analysis request
curl -X POST https://.../analyzeUserData \
  -H "Content-Type: application/json" \
  -d '{...your profile...}'

# Expected behavior:
# 1. Attempt Gemini 4 times (all fail)
# 2. Try Claude fallback
# 3. Claude succeeds (or fails gracefully)
# 4. Logs show:
#    - [Retry] Attempt 1/4 failed...
#    - [Retry] Attempt 2/4 failed...
#    - [Retry] Attempt 3/4 failed...
#    - [Retry] Attempt 4/4 failed...
#    - [Fallback] Attempting Claude API fallback...
#    - [Fallback] Claude analysis successful

# Response: { "analysis": {...}, "usedFallback": true }
```

### Verify Claude Output Format
```bash
# Claude response should have same format as Gemini
# Response structure:
{
  "analysis": {
    "skinCondition": {
      "score": 7,
      "explanation": "...",
      "recommendations": ["cleanse-hydrate", "deep-hydration"]
    },
    "hairCondition": {...},
    "physicalCondition": {...},
    "mentalCondition": {...}
  },
  "usedFallback": true
}
```

---

## 📊 Testing Monitoring & Metrics

### Get Current Health Status
```bash
# With authentication token
curl -H "Authorization: Bearer your-token" \
  https://us-central1-beauty-planner-26cc0.cloudfunctions.net/getHealthMetrics

# Response:
{
  "status": "healthy",
  "healthScore": 95,
  "metrics": {
    "totalRequests": 1250,
    "successfulRequests": 1220,
    "failedRequests": 30,
    "successRate": 97.6,
    "averageLatencyMs": 12450,
    "cacheHitRate": 38.2,
    "cacheHits": 320,
    "cacheMisses": 512,
    "circuitBreakerOpen": false,
    "claudeFallbackUsed": 8
  },
  "timestamp": "2025-10-10T15:30:45.123Z"
}

# Health Score Calculation:
# - Base: successRate (97.6%)
# - Penalty for high latency (>35s): -10
# - Penalty for high fallback (>5%): -5
# - Penalty for circuit open: -50
# = Final: 95
```

### Run Health Check
```bash
# Trigger manual health check
curl -X POST \
  https://us-central1-beauty-planner-26cc0.cloudfunctions.net/healthCheck

# Response:
{
  "status": "ok",
  "message": "Health check completed",
  "metrics": {...},
  "timestamp": "2025-10-10T15:30:45.123Z"
}

# Logs should show:
# [HealthCheck] Starting periodic health check...
# [Analytics] Checking fallback usage...
# [Analytics] Running periodic health check...
# [HealthCheck] Health check completed successfully
```

---

## 📈 Monitoring via Firestore

### Query API Events
```javascript
// Last 100 failures
db.collection('api_events')
  .doc(new Date().toISOString().split('T')[0])
  .collection('events')
  .where('type', '==', 'failure')
  .limit(100)
  .get();

// Last 100 retries
db.collection('api_events')
  .doc(new Date().toISOString().split('T')[0])
  .collection('events')
  .where('type', '==', 'retry')
  .orderBy('timestamp', 'desc')
  .limit(100)
  .get();

// Cache hit rate
db.collection('api_events')
  .doc(new Date().toISOString().split('T')[0])
  .collection('events')
  .where('type', 'in', ['cache_hit', 'cache_miss'])
  .get()
  .then(snapshot => {
    let hits = 0, misses = 0;
    snapshot.forEach(doc => {
      if (doc.data().type === 'cache_hit') hits++;
      else misses++;
    });
    console.log(`Cache Hit Rate: ${(hits / (hits + misses) * 100).toFixed(1)}%`);
  });
```

### Check System Metrics
```javascript
// Get latest metrics snapshot
db.collection('system')
  .doc('api_metrics')
  .get()
  .then(doc => {
    const data = doc.data();
    console.log(`Success Rate: ${(data.events.success / data.events.total * 100).toFixed(1)}%`);
    console.log(`Avg Latency: ${data.avgLatency}ms`);
    console.log(`Circuit Breaker: ${data.circuitBreakerOpen ? 'OPEN' : 'CLOSED'}`);
  });
```

---

## 🔔 Sentry Alerts

### View Sentry Alerts
```
1. Go to sentry.io
2. Select "Beauty Planner" project
3. Check "Issues" tab

Expected alerts you should see:
- Gemini API Retry Exhaustion
- Circuit Breaker Opened
- High Latency Detected (>45s)
- High Fallback Usage (>10%)
- Poor API Health (<80%)
```

### Configure Sentry Alerts
```
Sentry → Settings → Alerts & Integrations
Create alert rules:
- When: Issue is assigned
  Then: Send to Slack #alerts

- When: Error rate > 20%
  Then: Send to email + PagerDuty

- When: Circuit breaker opens
  Then: Create incident
```

---

## 🧩 Integration Testing

### Full End-to-End Test
```bash
#!/bin/bash

echo "1. Testing retry mechanism..."
# Kill API → should retry 4 times → should fail gracefully

echo "2. Testing cache..."
# Submit profile A → Submit similar profile B → should be instant

echo "3. Testing circuit breaker..."
# Trigger 100 requests → verify 503 responses → wait 2 min → verify recovery

echo "4. Testing Claude fallback..."
# Disable Gemini → verify Claude fallback → verify success

echo "5. Testing health metrics..."
# Call getHealthMetrics → verify status → verify scores

echo "6. Testing monitoring..."
# Query Firestore events → verify logging → verify Sentry alerts

echo "✅ All tests complete"
```

---

## 📋 Checklist for QA

- [ ] Retry mechanism works (4 attempts with backoff)
- [ ] Circuit breaker opens at >30% failure rate
- [ ] Circuit breaker auto-recovers after 2 minutes
- [ ] Cache saves 40% of API calls
- [ ] Claude fallback works when Gemini fails
- [ ] Heartbeat logs progress every 15 seconds
- [ ] Health metrics endpoint returns current status
- [ ] Sentry alerts fire on failures
- [ ] Firestore events collection logs all activity
- [ ] Cloud Function completes in <60 seconds
- [ ] Response format same as before (backwards compatible)
- [ ] New response fields (fromCache, usedFallback) present when applicable

---

## 🐛 Debugging Tips

### Check Cloud Function Logs
```bash
firebase functions:log --only analyzeUserData --follow
```

### View Function Errors
```bash
firebase functions:log --only analyzeUserData --follow | grep -i error
```

### Test Locally
```bash
# Install Firebase emulator
firebase emulators:start --only functions

# Deploy to emulator
firebase deploy --only functions

# Run local tests
npm run test
```

### Check Gemini API Status
```bash
# Is Gemini API responding?
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent \
  -H "x-goog-api-key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"contents": [{"parts": [{"text": "Hello"}]}]}'
```

---

## 📞 Support

For issues:
1. Check Cloud Function logs
2. Check Sentry dashboard
3. Check `/getHealthMetrics` endpoint
4. Query Firestore for detailed events
5. Review `GEMINI_RELIABILITY_IMPLEMENTATION.md` documentation
