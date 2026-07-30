import { createClient } from '@supabase/supabase-js';

const ADMIN_COOKIE_NAME = 'admin_session';
const SESSION_DURATION = 30 * 60;

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        if (path === '/admin/api/admin-login') {
            return handleAdminLogin(request, env);
        }

        const filePath = path === '/' ? 'index.html' : path.slice(1);
        return serveStaticFile(filePath, env);
    }
};

async function serveStaticFile(filePath, env) {
    try {
        const response = await env.ASSETS.fetch(new Request(`https://${filePath}`));
        if (response.ok) {
            return response;
        }
    } catch (error) {
        // File not found
    }

    return new Response('File not found', { status: 404 });
}

async function handleAdminLogin(request, env) {
    try {
        const { email, password } = await request.json();
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            return jsonResponse({ success: false, message: 'Invalid credentials' }, 401);
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, email, is_admin, admin_verified, is_active')
            .eq('id', data.user.id)
            .maybeSingle();

        if (profileError || !profile || !profile.is_admin || !profile.admin_verified || !profile.is_active) {
            await supabase.auth.signOut();
            return jsonResponse({ success: false, message: 'Access denied' }, 403);
        }

        const sessionToken = generateSessionToken();
        const cookie = `${ADMIN_COOKIE_NAME}=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_DURATION}`;

        return jsonResponse({
            success: true,
            user: { id: profile.id, full_name: profile.full_name, email: profile.email }
        }, 200, { 'Set-Cookie': cookie });

    } catch (error) {
        console.error('Login error:', error);
        return jsonResponse({ success: false, message: 'Server error' }, 500);
    }
}

function generateSessionToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...extraHeaders }
    });
}