export async function handleMainRequest(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const pageMap = {
        '/': 'Home',
        '/login': 'Login',
        '/signup': 'Sign Up',
        '/marketplace': 'Marketplace',
        '/orders': 'Orders',
        '/profile': 'Profile'
    };

    const page = pageMap[path] || 'Page not found';
    const is404 = page === 'Page not found';

    return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Mobile Procure</title>
            <style>
                body { 
                    background: #0F0F1A; 
                    color: #E5E7EB; 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                    padding: 40px; 
                    text-align: center; 
                    min-height: 100vh;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .container { max-width: 600px; }
                h1 { 
                    font-size: 48px; 
                    color: #0D7377; 
                    margin-bottom: 10px;
                    letter-spacing: -1px;
                }
                .subtitle { color: #94A3B8; font-size: 18px; margin-bottom: 30px; }
                .links { 
                    display: flex; 
                    gap: 12px; 
                    justify-content: center; 
                    flex-wrap: wrap; 
                    margin-top: 20px;
                }
                .links a { 
                    color: #818CF8; 
                    text-decoration: none; 
                    padding: 8px 20px;
                    border-radius: 8px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08);
                    transition: all 0.3s ease;
                }
                .links a:hover { 
                    background: rgba(255,255,255,0.1);
                    transform: translateY(-2px);
                }
                .admin-link { 
                    display: inline-block; 
                    background: linear-gradient(135deg, #4F46E5, #7C3AED); 
                    padding: 14px 40px; 
                    border-radius: 12px; 
                    color: white !important; 
                    font-weight: 600; 
                    margin-top: 20px;
                    border: none;
                }
                .admin-link:hover { 
                    transform: translateY(-2px); 
                    box-shadow: 0 8px 25px rgba(79,70,229,0.3);
                }
                .footer { 
                    margin-top: 40px; 
                    color: #64748B; 
                    font-size: 13px; 
                    border-top: 1px solid rgba(255,255,255,0.06);
                    padding-top: 30px;
                }
                ${is404 ? '.admin-link { display: none; } .error-code { color: #EF4444; font-size: 72px; font-weight: 800; margin: 20px 0; }' : ''}
            </style>
        </head>
        <body>
            <div class="container">
                ${is404 ? `<div class="error-code">404</div>` : ''}
                <h1>🚀 Mobile Procure</h1>
                <p class="subtitle">${is404 ? 'Page not found' : page}</p>
                <p style="color:#94A3B8;font-size:14px;max-width:400px;margin:0 auto 20px;">
                    Zambia's livestock procurement platform with digital trust and escrow.
                </p>
                ${!is404 ? `
                <div class="links">
                    <a href="/">Home</a>
                    <a href="/login">Login</a>
                    <a href="/signup">Sign Up</a>
                    <a href="/marketplace">Marketplace</a>
                </div>
                ` : `
                <div class="links">
                    <a href="/">← Back to Home</a>
                </div>
                `}
                <br>
                <a href="/admin" class="admin-link">🔐 Admin Portal</a>
                <div class="footer">
                    © ${new Date().getFullYear()} Mobile Procure • Powered by Cloudflare Workers
                </div>
            </div>
        </body>
        </html>
    `, {
        headers: { 'Content-Type': 'text/html' }
    });
}