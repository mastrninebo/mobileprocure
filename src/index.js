import { handleAdminRequest } from './admin-handler.js';
import { handleMainRequest } from './main-handler.js';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        
        if (path.startsWith('/admin/') || path === '/admin') {
            const adminPath = path.replace('/admin', '') || '/';
            return handleAdminRequest(request, env, ctx, adminPath);
        }
        
        return handleMainRequest(request, env, ctx);
    }
};