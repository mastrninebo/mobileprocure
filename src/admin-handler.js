import { createClient } from '@supabase/supabase-js';

const ADMIN_COOKIE_NAME = 'admin_session';
const SESSION_DURATION = 30 * 60;

export async function handleAdminRequest(request, env, ctx, adminPath = '/') {
    const url = new URL(request.url);
    const path = adminPath;
    const method = request.method;

    if (path === '/login' && method === 'GET') {
        return serveAdminLogin();
    }

    if (path === '/api/admin-login' && method === 'POST') {
        return handleAdminLogin(request, env);
    }

    const authResult = await verifyAdminAuth(request, env);
    if (!authResult.authorized) {
        return new Response('Unauthorized', {
            status: 302,
            headers: { 'Location': '/admin/login' }
        });
    }

    if (path.startsWith('/api/')) {
        return handleAdminAPI(request, env, authResult.user);
    }

    return serveAdminPage(path, authResult.user, env);
}

function serveAdminLogin() {
    return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Admin Login</title>
            <style>
                body { background: #0F0F1A; color: #E5E7EB; font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
                .login-container { background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 24px; padding: 40px; max-width: 400px; width: 100%; border: 1px solid rgba(79,70,229,0.2); }
                .login-header { text-align: center; margin-bottom: 32px; }
                .login-header .shield { width: 60px; height: 60px; background: linear-gradient(135deg, #4F46E5, #7C3AED); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: white; margin: 0 auto 16px; }
                .login-header h1 { font-size: 24px; color: white; }
                .login-header p { color: #94A3B8; }
                .form-group { margin-bottom: 18px; }
                .form-group label { display: block; font-size: 13px; color: #94A3B8; margin-bottom: 6px; }
                .form-group input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: white; font-size: 14px; outline: none; }
                .form-group input:focus { border-color: #4F46E5; }
                .login-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; }
                .login-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(79,70,229,0.4); }
                .error-message { background: rgba(239,68,68,0.15); color: #F87171; padding: 10px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 18px; display: none; }
                .error-message.show { display: block; }
                .security-badge { text-align: center; margin-top: 16px; font-size: 12px; color: #64748B; }
            </style>
        </head>
        <body>
            <div class="login-container">
                <div class="login-header">
                    <div class="shield">🔐</div>
                    <h1>Admin Access</h1>
                    <p>Secure portal for system administrators</p>
                </div>
                <div class="error-message" id="errorMessage"><span id="errorText">Invalid credentials</span></div>
                <form id="loginForm">
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="email" placeholder="admin@mobileprocure.com" required />
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="password" placeholder="Enter your password" required />
                    </div>
                    <button type="submit" class="login-btn">Login to Admin</button>
                </form>
                <div class="security-badge">🔒 Encrypted & Secure Connection</div>
            </div>
            <script>
                document.getElementById('loginForm').addEventListener('submit', async function(e) {
                    e.preventDefault();
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    const errorMessage = document.getElementById('errorMessage');
                    const errorText = document.getElementById('errorText');
                    errorMessage.classList.remove('show');
                    try {
                        const response = await fetch('/admin/api/admin-login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, password })
                        });
                        const data = await response.json();
                        if (data.success) {
                            window.location.href = '/admin/';
                        } else {
                            errorText.textContent = data.message || 'Login failed';
                            errorMessage.classList.add('show');
                        }
                    } catch (error) {
                        errorText.textContent = 'Connection error. Please try again.';
                        errorMessage.classList.add('show');
                    }
                });
            </script>
        </body>
        </html>
    `, {
        headers: { 'Content-Type': 'text/html' }
    });
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
            .single();

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
        return jsonResponse({ success: false, message: 'Server error' }, 500);
    }
}

async function verifyAdminAuth(request, env) {
    try {
        const cookie = request.headers.get('Cookie') || '';
        const token = parseCookie(cookie, ADMIN_COOKIE_NAME);
        if (!token) return { authorized: false };

        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

        const { data: session, error: sessionError } = await supabase
            .from('admin_sessions')
            .select('user_id, expires_at, is_active')
            .eq('session_token', token)
            .eq('is_active', true)
            .single();

        if (sessionError || !session || new Date(session.expires_at) < new Date()) {
            return { authorized: false };
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, email, is_admin, admin_verified, is_active')
            .eq('id', session.user_id)
            .single();

        if (!profile || !profile.is_admin || !profile.admin_verified || !profile.is_active) {
            return { authorized: false };
        }

        return { authorized: true, user: profile };

    } catch (error) {
        return { authorized: false };
    }
}

function serveAdminPage(path, user, env) {
    const pageMap = {
        '/': 'dashboard',
        '/dashboard': 'dashboard',
        '/users': 'users',
        '/disputes': 'disputes',
        '/transactions': 'transactions',
        '/audits': 'audits',
        '/settings': 'settings',
        '/profile': 'profile'
    };

    const page = pageMap[path] || 'dashboard';
    
    return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>Admin - ${page}</title></head>
        <body style="background:#0F0F1A;color:#E5E7EB;font-family:Arial,sans-serif;padding:20px;">
            <h1>Admin: ${page}</h1>
            <p>Welcome, ${user.full_name || 'Admin'}</p>
            <ul>
                <li><a href="/admin/dashboard">Dashboard</a></li>
                <li><a href="/admin/users">Users</a></li>
                <li><a href="/admin/disputes">Disputes</a></li>
                <li><a href="/admin/transactions">Transactions</a></li>
                <li><a href="/admin/audits">Audits</a></li>
                <li><a href="/admin/settings">Settings</a></li>
                <li><a href="/admin/profile">Profile</a></li>
            </ul>
            <a href="/admin/api/admin-logout">Logout</a>
        </body>
        </html>
    `, {
        headers: { 'Content-Type': 'text/html' }
    });
}

async function handleAdminAPI(request, env, user) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api/admin-logout') {
        return handleLogout(request, env, user);
    }

    return jsonResponse({ error: 'API endpoint not found' }, 404);
}

async function handleLogout(request, env, user) {
    const cookie = request.headers.get('Cookie') || '';
    const token = parseCookie(cookie, ADMIN_COOKIE_NAME);

    if (token) {
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
        await supabase.from('admin_sessions').update({ is_active: false }).eq('session_token', token);
    }

    return jsonResponse({ success: true }, 200, {
        'Set-Cookie': `${ADMIN_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
    });
}

function parseCookie(cookieHeader, name) {
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return value;
    }
    return null;
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