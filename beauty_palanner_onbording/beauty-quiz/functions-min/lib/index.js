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
exports.generateAvatar = exports.finalizeOnboarding = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
// Initialize Admin SDK once
try {
    if (admin.apps ? admin.apps.length === 0 : !admin.getApps?.()?.length) {
        admin.initializeApp();
    }
}
catch { }
function addSecurityHeaders(res) {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'SAMEORIGIN');
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
}
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
const db = admin.firestore();
exports.finalizeOnboarding = (0, https_1.onRequest)(async (req, res) => {
    addSecurityHeaders(res);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).send({ error: 'Method not allowed' });
        return;
    }
    try {
        const uid = await verifyIdTokenFromRequest(req);
        if (!uid) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const sessionId = req.body?.sessionId || '';
        if (!sessionId) {
            res.status(400).json({ error: 'sessionId required' });
            return;
        }
        // Pull minimal info from onboarding session if available
        const sessionSnap = await db.collection('users_web_onbording').doc(sessionId).get();
        const session = sessionSnap.exists ? (sessionSnap.data() || {}) : {};
        const overrides = typeof req.body?.overrides === 'object' && req.body.overrides ? req.body.overrides : {};
        const profile = (typeof req.body?.profile === 'object' && req.body.profile)
            ? req.body.profile
            : (typeof overrides?.profile === 'object' && overrides.profile)
                ? overrides.profile
                : overrides;
        // Very small set of fields to avoid heavy processing
        const name = profile?.name || '';
        const email = profile?.email || '';
        const language = profile?.language || profile?.languageCode || 'en';
        const assistant = profile?.assistant || session['assistant'] || 'Sofia';
        const theme = profile?.theme || session['theme'] || 'light';
        const primaryColor = profile?.primaryColor || session['primaryColor'] || '#A385E9';
        const doc = {
            Id: uid,
            Name: name,
            Email: email,
            LanguageCode: language,
            Assistant: /ellie/i.test(String(assistant)) ? 2 : 1,
            Theme: /dark/i.test(String(theme)) ? 2 : (/system|auto/i.test(String(theme)) ? 0 : 1),
            PrimaryColor: primaryColor.startsWith('#') ? primaryColor : `#${primaryColor}`,
            Onboarding2Completed: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await db.collection('users_v2').doc(uid).set(doc, { merge: true });
        await db.collection('users_web_onbording').doc(sessionId).set({ finalizedAt: admin.firestore.FieldValue.serverTimestamp(), finalizedByUid: uid }, { merge: true });
        const token = await admin.auth().createCustomToken(uid);
        res.status(200).json({ ok: true, token });
    }
    catch (e) {
        console.error('finalizeOnboarding(minimal) error', e?.message || e);
        res.status(500).json({ error: 'internal' });
    }
});
exports.generateAvatar = (0, https_1.onRequest)({ maxInstances: 10, timeoutSeconds: 60, cors: true }, async (req, res) => {
    addSecurityHeaders(res);
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
        const overrideUrl = typeof req.body?.imageUrl === 'string' ? req.body.imageUrl : null;
        let sourceUrl = overrideUrl;
        if (!sourceUrl) {
            const snap = await db.collection('users_v2').doc(uid).get();
            const data = snap.exists ? (snap.data() || {}) : {};
            sourceUrl = data['FaceImageUrl'] || data['ProfilePicture'] || data['PhotoURL'] || data['PhotoUrl'] || null;
        }
        if (!sourceUrl) {
            res.status(400).json({ error: 'No source image available' });
            return;
        }
        const resp = await axios_1.default.get(sourceUrl, { responseType: 'arraybuffer', timeout: 10000 }).catch(() => { throw new Error('Image download failed'); });
        const inputBuffer = Buffer.from(resp.data);
        // Lazy import sharp
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const sharp = require('sharp');
        const size = 512;
        const svgMask = Buffer.from(`<?xml version=\"1.0\" encoding=\"UTF-8\"?><svg width=\"${size}\" height=\"${size}\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"${size / 2}\" cy=\"${size / 2}\" r=\"${size / 2}\" fill=\"#fff\"/></svg>`);
        let processed;
        try {
            processed = await sharp(inputBuffer, { failOnError: false })
                .rotate()
                .resize(size, size, { fit: 'cover', position: 'attention' })
                .modulate({ saturation: 1.05 })
                .composite([{ input: svgMask, blend: 'dest-in' }])
                .webp({ quality: 80 })
                .toBuffer();
        }
        catch {
            processed = await sharp(inputBuffer, { failOnError: false }).resize(size, size, { fit: 'cover' }).webp({ quality: 80 }).toBuffer();
        }
        const bucket = admin.storage().bucket();
        const filename = `avatar-${Date.now()}.webp`;
        const path = `avatars/${uid}/${filename}`;
        const file = bucket.file(path);
        await file.save(processed, { metadata: { contentType: 'image/webp', metadata: { createdBy: uid, purpose: 'avatar' } }, resumable: false });
        const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 7 * 24 * 60 * 60 * 1000 });
        await db.collection('users_v2').doc(uid).set({ AvatarUrl: signedUrl, AvatarStoragePath: path, AvatarUpdatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        try {
            await admin.auth().updateUser(uid, { photoURL: signedUrl });
        }
        catch { }
        res.status(200).json({ ok: true, url: signedUrl });
    }
    catch (e) {
        console.error('generateAvatar(minimal) error', e?.message || e);
        res.status(500).json({ error: 'internal' });
    }
});
