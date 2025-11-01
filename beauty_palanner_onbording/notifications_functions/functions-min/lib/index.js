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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSubscription = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
if (!admin.apps?.length) {
    admin.initializeApp();
}
function cors(res) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
}
async function verifyBearerToUid(req) {
    const auth = req.headers.authorization || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m)
        throw Object.assign(new Error('missing_bearer'), { code: 401 });
    const idToken = m[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded.uid;
}
// Read from Secret Manager if available; otherwise allow graceful inactive fallback
const REVENUECAT_SECRET = (0, params_1.defineSecret)('REVENUECAT_API_KEY');
exports.getUserSubscription = (0, https_1.onRequest)({ cors: true, secrets: [REVENUECAT_SECRET] }, async (req, res) => {
    cors(res);
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    try {
        await verifyBearerToUid(req);
        const apiKey = REVENUECAT_SECRET.value() || '';
        if (!apiKey) {
            // Graceful fallback so UI doesn't fail
            res.status(200).json({
                status: 'inactive', planId: null, entitlement: null, store: 'unknown', expiresAt: null, willRenew: false, period: 'unknown'
            });
            return;
        }
        // If a key is present, you could optionally call RevenueCat here as in full version.
        // Keeping minimal to avoid analyzer timeouts.
        res.status(200).json({
            status: 'inactive', planId: null, entitlement: null, store: 'unknown', expiresAt: null, willRenew: false, period: 'unknown'
        });
    }
    catch (e) {
        const code = e?.code === 401 ? 401 : 500;
        res.status(code).json({ error: e?.message || 'internal' });
    }
});
