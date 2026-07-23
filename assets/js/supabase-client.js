// assets/js/supabase-client.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// AUTH FUNCTIONS
// ============================================

// Sign In
export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    if (error) throw error;
    return data;
}

// Sign Out
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('selectedRole');
    localStorage.removeItem('rememberedEmail');
}

// Get Current User with Profile
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    if (error) {
        console.error('Error fetching profile:', error);
        return { ...user, profile: null };
    }
    
    return { ...user, profile };
}

// Get Current Session
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
}

// Check if user is authenticated
export async function isAuthenticated() {
    const session = await getSession();
    return !!session;
}

// Get user role
export async function getUserRole() {
    const user = await getCurrentUser();
    if (!user || !user.profile) return null;
    return user.profile.role;
}

// Redirect based on role (XAMPP path)
export function getRoleRedirect(role) {
    const roleMap = {
        'buyer': 'buyer/dashboard.html',
        'supplier': 'supplier/dashboard.html',
        'logistics': 'logistics/dashboard.html',
        'government': 'government/dashboard.html',
        'fintech': 'fintech/dashboard.html',
        'veterinary': 'veterinary/dashboard.html',
        'admin': 'admin/dashboard.html',
        'customs': 'customs/dashboard.html'
    };
    return roleMap[role] || '/mobileprocure/index.html';
}
