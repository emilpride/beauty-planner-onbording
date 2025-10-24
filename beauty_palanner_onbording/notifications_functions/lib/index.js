"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recomputeAchievements = exports.onUpdateWriteRecomputeAchievements = exports.sendMobilePushReminders = exports.sendEmailReminders = void 0;
const admin = __importStar(require("firebase-admin"));
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const nodemailer_1 = __importDefault(require("nodemailer"));
// Initialize Admin SDK once
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// SMTP transport (set env vars or functions:config)
const SMTP_HOST = process.env.SMTP_HOST || process.env.FUNCTIONS_EMULATOR && 'localhost';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'info@beauty-mirror.com';
const transporter = nodemailer_1.default.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});
function parseTzOffsetFromParts(tz, date) {
    try {
        const fmt = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            timeZoneName: 'short',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        });
        const parts = fmt.formatToParts(date);
        const tzName = parts.find((p) => p.type === 'timeZoneName')?.value || '';
        const m = tzName.match(/GMT([+\-]\d{1,2})(?::(\d{2}))?/);
        if (!m)
            return null;
        const hours = parseInt(m[1], 10);
        const minutes = m[2] ? parseInt(m[2], 10) : 0;
        return hours * 60 + (hours >= 0 ? minutes : -minutes);
    }
    catch {
        return null;
    }
}
function getTzOffsetMinutes(tz, atUtc) {
    return parseTzOffsetFromParts(tz, atUtc);
}
function zonedLocalToUtc(ymd, hour, minute, tz) {
    // Initial guess: interpret ymd h:m as UTC
    const guess = new Date(Date.UTC(Number(ymd.slice(0, 4)), Number(ymd.slice(5, 7)) - 1, Number(ymd.slice(8, 10)), hour, minute, 0, 0));
    const off1 = getTzOffsetMinutes(tz, guess);
    if (off1 == null)
        return null;
    const instant = new Date(Date.UTC(Number(ymd.slice(0, 4)), Number(ymd.slice(5, 7)) - 1, Number(ymd.slice(8, 10)), hour, minute, 0, 0) - off1 * 60000);
    // One refinement for DST boundaries
    const off2 = getTzOffsetMinutes(tz, instant);
    if (off2 == null || off2 === off1)
        return instant;
    return new Date(Date.UTC(Number(ymd.slice(0, 4)), Number(ymd.slice(5, 7)) - 1, Number(ymd.slice(8, 10)), hour, minute, 0, 0) - off2 * 60000);
}
function parseNotifyBefore(s) {
    if (!s)
        return 0;
    const v = s.trim().toLowerCase();
    if (!v)
        return 0;
    // Accept forms like '15m', '30 m', '1h', '2 h', '45min', 'minutes'
    const match = v.match(/^(\d+)\s*(m|min|minutes)?$/);
    if (match)
        return Number(match[1]);
    const hmatch = v.match(/^(\d+)\s*(h|hr|hour|hours)$/);
    if (hmatch)
        return Number(hmatch[1]) * 60;
    // Known presets
    if (v === '5m')
        return 5;
    if (v === '10m')
        return 10;
    if (v === '15m')
        return 15;
    if (v === '30m')
        return 30;
    if (v === '1h')
        return 60;
    if (v === '2h')
        return 120;
    return 0;
}
function toDateFromYmdAndTime(ymd, hour, minute) {
    const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m)
        return null;
    const y = Number(m[1]), mo = Number(m[2]) - 1, d = Number(m[3]);
    const date = new Date(Date.UTC(y, mo, d, hour ?? 9, minute ?? 0, 0, 0));
    return date;
}
async function getUserEmail(uid) {
    try {
        const user = await admin.auth().getUser(uid);
        return user.email || null;
    }
    catch {
        return null;
    }
}
async function alreadySent(userId, updateId, channel) {
    const ref = db.collection('Users').doc(userId).collection('NotificationsSent').doc(`${updateId}-${channel}`);
    const snap = await ref.get();
    return snap.exists;
}
async function markSent(userId, updateId, channel) {
    const ref = db.collection('Users').doc(userId).collection('NotificationsSent').doc(`${updateId}-${channel}`);
    await ref.set({ channel, updateId, sentAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
}
async function sendEmail(to, subject, html) {
    await transporter.sendMail({ from: SMTP_FROM, to, subject, html });
}
exports.sendEmailReminders = (0, scheduler_1.onSchedule)({ schedule: 'every 5 minutes', timeZone: 'Etc/UTC' }, async () => {
    const now = new Date();
    const windowMinutes = 6; // include small overlap window for reliability
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
    const usersSnap = await db
        .collection('Users')
        .where('NotificationPrefs.emailReminders', '==', true)
        .get();
    for (const userDoc of usersSnap.docs) {
        const userId = userDoc.id;
        const prefs = (userDoc.get('NotificationPrefs') || {});
        if (!prefs.emailReminders)
            continue;
        const email = await getUserEmail(userId);
        if (!email)
            continue;
        // Load Activities array once
        const activities = (userDoc.get('Activities') || []).map((a) => ({
            id: String(a?.Id || ''),
            name: String(a?.Name || ''),
            time: a?.Time || null,
            notifyBefore: typeof a?.NotifyBefore === 'string' ? a.NotifyBefore : null,
        }));
        const activityById = new Map(activities.map((a) => [a.id, a]));
        // Query Updates for today (pending)
        const today = new Date();
        const y = today.getUTCFullYear(), m = String(today.getUTCMonth() + 1).padStart(2, '0'), d = String(today.getUTCDate()).padStart(2, '0');
        const todayStr = `${y}-${m}-${d}`;
        const updatesSnap = await db
            .collection('Users').doc(userId)
            .collection('Updates')
            .where('date', '==', todayStr)
            .where('status', '==', 'pending')
            .get();
        for (const upd of updatesSnap.docs) {
            const u = upd.data();
            const act = activityById.get(u.activityId);
            const hour = u.time?.hour ?? act?.time?.Hour ?? null;
            const minute = u.time?.minute ?? act?.time?.Minute ?? null;
            if (hour === null || minute === null)
                continue; // no exact time => skip
            const tzName = String(userDoc.get('Timezone') || '');
            const base = tzName
                ? zonedLocalToUtc(u.date, hour ?? 0, minute ?? 0, tzName)
                : toDateFromYmdAndTime(u.date, hour ?? undefined, minute ?? undefined);
            if (!base)
                continue;
            const minutesBefore = parseNotifyBefore(act?.notifyBefore || undefined);
            const scheduled = new Date(base.getTime() - minutesBefore * 60000);
            // send if scheduled within [windowStart, now]
            if (scheduled.getTime() <= now.getTime() && scheduled.getTime() > windowStart.getTime()) {
                const sent = await alreadySent(userId, u.id, 'email');
                if (sent)
                    continue;
                const subject = minutesBefore > 0
                    ? `Reminder: ${act?.name || 'Activity'} in ${minutesBefore} min`
                    : `Reminder: ${act?.name || 'Activity'} at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                const html = `<p>Hi!</p>
          <p>This is your reminder for <strong>${act?.name || 'activity'}</strong>
          ${minutesBefore > 0 ? ` starting in ${minutesBefore} minutes` : ` scheduled at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} (today)`}.</p>
          <p><a href="https://web.beautymirror.app/dashboard">Open Beauty Mirror</a></p>`;
                try {
                    await sendEmail(email, subject, html);
                    await markSent(userId, u.id, 'email');
                }
                catch (e) {
                    console.error('Email send failed', userId, u.id, e);
                }
            }
        }
    }
    return null;
});
exports.sendMobilePushReminders = (0, scheduler_1.onSchedule)({ schedule: 'every 5 minutes', timeZone: 'Etc/UTC' }, async () => {
    const now = new Date();
    const windowMinutes = 6;
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
    const usersSnap = await db
        .collection('Users')
        .where('NotificationPrefs.mobilePush', '==', true)
        .get();
    for (const userDoc of usersSnap.docs) {
        const userId = userDoc.id;
        const prefs = (userDoc.get('NotificationPrefs') || {});
        if (!prefs.mobilePush)
            continue;
        // Optional timezone offset in minutes; if present, convert local scheduled -> UTC
        const tzName = String(userDoc.get('Timezone') || '');
        const tzOffsetMin = tzName ? null : Number(userDoc.get('TimezoneOffsetMinutes') || 0);
        const activities = (userDoc.get('Activities') || []).map((a) => ({
            id: String(a?.Id || ''),
            name: String(a?.Name || ''),
            time: a?.Time || null,
            notifyBefore: typeof a?.NotifyBefore === 'string' ? a.NotifyBefore : null,
        }));
        const activityById = new Map(activities.map((a) => [a.id, a]));
        const today = new Date();
        const y = today.getUTCFullYear(), m = String(today.getUTCMonth() + 1).padStart(2, '0'), d = String(today.getUTCDate()).padStart(2, '0');
        const todayStr = `${y}-${m}-${d}`;
        const updatesSnap = await db
            .collection('Users').doc(userId)
            .collection('Updates')
            .where('date', '==', todayStr)
            .where('status', '==', 'pending')
            .get();
        // Collect due updates within window
        const due = [];
        for (const upd of updatesSnap.docs) {
            const u = upd.data();
            const act = activityById.get(u.activityId);
            if (!act)
                continue;
            const hour = u.time?.hour ?? act?.time?.Hour ?? null;
            const minute = u.time?.minute ?? act?.time?.Minute ?? null;
            if (hour === null || minute === null)
                continue;
            let baseLocal;
            if (tzName) {
                baseLocal = zonedLocalToUtc(u.date, hour ?? 0, minute ?? 0, tzName);
            }
            else {
                baseLocal = toDateFromYmdAndTime(u.date, hour ?? undefined, minute ?? undefined);
            }
            if (!baseLocal)
                continue;
            const minutesBefore = parseNotifyBefore(act?.notifyBefore || undefined);
            let scheduled = new Date(baseLocal.getTime() - minutesBefore * 60000);
            if (!tzName && tzOffsetMin)
                scheduled = new Date(scheduled.getTime() - tzOffsetMin * 60000);
            if (scheduled.getTime() <= now.getTime() && scheduled.getTime() > windowStart.getTime()) {
                due.push({ u, act, scheduled });
            }
        }
        if (due.length === 0)
            continue;
        // Fetch mobile tokens (best-effort filter by platform field)
        const tokensSnap = await db.collection('Users').doc(userId).collection('FcmTokens').get();
        const tokens = [];
        for (const t of tokensSnap.docs) {
            const data = t.data();
            const plat = (data.platform || '').toLowerCase();
            if (plat.includes('android') || plat.includes('ios')) {
                if (data.token)
                    tokens.push(data.token);
            }
        }
        if (tokens.length === 0)
            continue;
        for (const item of due) {
            const { u, act } = item;
            const sentRef = db.collection('Users').doc(userId).collection('NotificationsSent').doc(`${u.id}-push`);
            const sentSnap = await sentRef.get();
            if (sentSnap.exists)
                continue;
            const minutesBefore = parseNotifyBefore(act?.notifyBefore || undefined);
            const title = 'Beauty Mirror reminder';
            const body = minutesBefore > 0
                ? `${act?.name || 'Activity'} in ${minutesBefore} min`
                : `${act?.name || 'Activity'} now`;
            const message = {
                tokens,
                notification: { title, body },
                data: {
                    updateId: u.id,
                    activityId: u.activityId,
                    date: u.date,
                },
                android: { priority: 'high' },
                apns: { headers: { 'apns-priority': '10' }, payload: { aps: { sound: 'default' } } },
            };
            try {
                const res = await admin.messaging().sendEachForMulticast(message);
                if (res.successCount > 0) {
                    await sentRef.set({ channel: 'push', updateId: u.id, sentAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
                }
            }
            catch (e) {
                console.error('Push send failed', userId, u.id, e);
            }
        }
    }
    return null;
});
// Keep thresholds modest and monotonic
const ACHIEVEMENT_LEVELS_SERVER = [
    { level: 1, requiredActivities: 0 },
    { level: 2, requiredActivities: 5 },
    { level: 3, requiredActivities: 15 },
    { level: 4, requiredActivities: 30 },
    { level: 5, requiredActivities: 60 },
    { level: 6, requiredActivities: 100 },
    { level: 7, requiredActivities: 150 },
    { level: 8, requiredActivities: 220 },
    { level: 9, requiredActivities: 300 },
];
function calcLevelServer(completed) {
    let lvl = 1;
    for (let i = ACHIEVEMENT_LEVELS_SERVER.length - 1; i >= 0; i--) {
        const step = ACHIEVEMENT_LEVELS_SERVER[i];
        if (completed >= step.requiredActivities) {
            lvl = step.level;
            break;
        }
    }
    return lvl;
}
async function recomputeAchievementsForUser(userId) {
    const col = db.collection('Users').doc(userId).collection('Updates');
    const snap = await col.where('status', '==', 'completed').get();
    const completed = snap.size;
    const level = calcLevelServer(completed);
    const ref = db.collection('Users').doc(userId).collection('Achievements').doc('Progress');
    const before = await ref.get();
    const prev = before.exists ? (before.data() || {}) : {};
    const levelUnlockDates = (prev['LevelUnlockDates'] || prev['levelUnlockDates'] || {});
    if (!levelUnlockDates[level])
        levelUnlockDates[String(level)] = admin.firestore.FieldValue.serverTimestamp();
    const payload = {
        totalCompletedActivities: completed,
        currentLevel: level,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        levelUnlockDates,
    };
    await ref.set({
        TotalCompletedActivities: payload.totalCompletedActivities,
        CurrentLevel: payload.currentLevel,
        LastUpdated: payload.lastUpdated,
        LevelUnlockDates: payload.levelUnlockDates,
    }, { merge: true });
    return payload;
}
// Firestore trigger: recompute on any update write
exports.onUpdateWriteRecomputeAchievements = (0, firestore_1.onDocumentWritten)('Users/{userId}/Updates/{updateId}', async (event) => {
    try {
        const userId = event.params.userId;
        if (!userId)
            return;
        await recomputeAchievementsForUser(userId);
    }
    catch (e) {
        console.error('Recompute achievements trigger failed:', e?.message || e);
    }
});
// Simple auth helper: verify Firebase ID token from Authorization header or body.idToken
async function verifyIdTokenFromRequest(req) {
    try {
        const bodyToken = typeof req?.body?.idToken === 'string' ? req.body.idToken : '';
        let token = bodyToken;
        if (!token) {
            const rawHeader = String((req?.headers?.['authorization'] || req?.headers?.['Authorization'] || ''));
            if (rawHeader) {
                const parts = rawHeader.split(' ');
                const bearerVal = parts.length >= 2 ? (parts[1] || '') : '';
                const scheme = parts.length >= 1 ? (parts[0] || '') : '';
                token = /^Bearer$/i.test(scheme) ? bearerVal : rawHeader;
            }
        }
        if (!token)
            return null;
        const decoded = await admin.auth().verifyIdToken(token);
        return decoded?.uid || null;
    }
    catch {
        return null;
    }
}
// CORS/security headers
function addSecurityHeaders(res) {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'SAMEORIGIN');
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
}
// HTTPS endpoint to recompute on demand (for the signed-in user)
exports.recomputeAchievements = (0, https_1.onRequest)(async (req, res) => {
    addSecurityHeaders(res);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const uid = await verifyIdTokenFromRequest(req);
        if (!uid) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const result = await recomputeAchievementsForUser(uid);
        res.status(200).json({ ok: true, progress: result });
    }
    catch (e) {
        console.error('recomputeAchievements error', e);
        res.status(500).json({ error: 'internal' });
    }
});
//# sourceMappingURL=index.js.map