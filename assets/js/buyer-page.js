import { getCurrentUser } from './supabase-client.js';

/**
 * Ensures a buyer-only page is never rendered for an anonymous or
 * incorrectly authorised visitor.  Pages can reuse the returned user when
 * they need profile data for their own UI.
 */
export async function requireBuyer() {
    try {
        const user = await getCurrentUser();

        if (!user || !user.profile) {
            window.location.replace('/mobileprocure/login.html');
            return null;
        }

        if (user.profile.role !== 'buyer') {
            window.location.replace('/mobileprocure/unauthorized.html');
            return null;
        }

        window.currentUser = user;
        return user;
    } catch (error) {
        console.error('Buyer page authentication failed:', error);
        window.location.replace('/mobileprocure/login.html');
        return null;
    }
}
