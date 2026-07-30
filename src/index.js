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