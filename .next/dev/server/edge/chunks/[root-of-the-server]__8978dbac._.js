(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__8978dbac._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
// Routes that are intentionally public (no auth required)
const PUBLIC_API_ROUTES = [
    '/api/public/',
    '/api/auth/',
    '/api/login',
    '/api/register',
    '/api/otp/',
    '/api/menu',
    '/api/menu-items',
    '/api/orders',
    '/api/reservations',
    '/api/reviews',
    '/api/voice-order',
    '/api/webhook/',
    '/api/stripe/',
    '/api/notifications/',
    '/api/realtime'
];
// Routes that require SUPER_ADMIN role (most sensitive)
const SUPER_ADMIN_ROUTES = [
    '/api/admin/reset-password',
    '/api/clear-data',
    '/api/debug',
    '/api/setup'
];
function middleware(request) {
    const { pathname } = request.nextUrl;
    // ── CORS handling for API routes ──
    if (pathname.startsWith('/api')) {
        const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
        // Handle CORS preflight (OPTIONS) requests
        if (request.method === 'OPTIONS') {
            const response = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"](null, {
                status: 200
            });
            response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With');
            response.headers.set('Access-Control-Allow-Credentials', 'true');
            response.headers.set('Access-Control-Max-Age', '86400');
            return response;
        }
        // Add CORS headers to all API responses
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
        response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Max-Age', '86400');
        // ── Admin API auth enforcement ──
        // In production, block requests to /api/admin/* without Authorization header
        if (pathname.startsWith('/api/admin') && ("TURBOPACK compile-time value", "development") === 'production') //TURBOPACK unreachable
        ;
        // ── Critical endpoint protection (all environments) ──
        // Always require auth for the most dangerous endpoints
        const isCriticalRoute = SUPER_ADMIN_ROUTES.some((route)=>pathname.startsWith(route));
        if (isCriticalRoute) {
            const authHeader = request.headers.get('authorization');
            if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: 'Authentification requise pour cette opération',
                    code: 'AUTH_REQUIRED'
                }, {
                    status: 401,
                    headers: response.headers
                });
            }
        }
        return response;
    }
    // Skip middleware for static files and internal Next.js routes
    if (pathname.startsWith('/_next') || pathname.startsWith('/_vercel') || pathname.includes('.') // Static files
    ) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Skip for app routes
    const appRoutes = [
        '/login',
        '/dashboard',
        '/pos',
        '/orders',
        '/menu',
        '/reservations',
        '/customers',
        '/deliveries',
        '/drivers',
        '/analytics',
        '/settings',
        '/kitchen',
        '/driver',
        '/staff',
        '/admin',
        '/profile',
        '/customer',
        '/r'
    ];
    if (appRoutes.some((route)=>pathname.startsWith(route))) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Root landing page
    if (pathname === '/') {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__8978dbac._.js.map