// assets/js/supabase-client.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// AUTH FUNCTIONS (Existing)
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
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminName');
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

// ============================================
// ADMIN FUNCTIONS (NEW)
// ============================================

/**
 * Check if current user is an admin
 */
export async function isAdmin() {
    const user = await getCurrentUser();
    if (!user || !user.profile) return false;
    return user.profile.is_admin === true && user.profile.admin_verified === true;
}

/**
 * Require admin access - redirects if not admin
 */
export async function requireAdmin() {
    const isAdminUser = await isAdmin();
    if (!isAdminUser) {
        window.location.href = '/mobileprocure/admin/login.html?error=unauthorized';
        return false;
    }
    return true;
}

/**
 * Get admin statistics for dashboard
 */
export async function getAdminStats() {
    try {
        // Get user count
        const { count: userCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
        
        // Get order count
        const { count: orderCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });
        
        // Get active disputes
        const { count: disputeCount } = await supabase
            .from('disputes')
            .select('*', { count: 'exact', head: true })
            .in('status', ['open', 'under_review']);
        
        // Get total revenue from completed orders
        const { data: revenueData } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('status', 'completed');
        
        const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
        
        // Get today's orders
        const today = new Date().toISOString().split('T')[0];
        const { count: todayOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today);
        
        return {
            totalUsers: userCount || 0,
            totalOrders: orderCount || 0,
            activeDisputes: disputeCount || 0,
            totalRevenue: totalRevenue,
            todayOrders: todayOrders || 0
        };
        
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        throw error;
    }
}

/**
 * Get users with pagination and filtering
 */
export async function getAdminUsers(page = 1, limit = 20, role = null, search = null) {
    try {
        let query = supabase
            .from('profiles')
            .select('*', { count: 'exact' });
        
        if (role && role !== 'all') {
            query = query.eq('role', role);
        }
        
        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
        }
        
        const start = (page - 1) * limit;
        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(start, start + limit - 1);
        
        if (error) throw error;
        
        return {
            users: data || [],
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit)
        };
        
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

/**
 * Get disputes with optional status filter
 */
export async function getAdminDisputes(status = null, limit = 50) {
    try {
        let query = supabase
            .from('disputes')
            .select(`
                *,
                order:orders (id, order_number, total_amount, status),
                raised_by_user:raised_by (id, full_name, email, company_name),
                resolved_by_user:resolved_by (id, full_name, email)
            `)
            .order('created_at', { ascending: false });
        
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }
        
        const { data, error } = await query.limit(limit);
        
        if (error) throw error;
        
        return data || [];
        
    } catch (error) {
        console.error('Error fetching disputes:', error);
        throw error;
    }
}

/**
 * Resolve or reject a dispute
 */
export async function resolveAdminDispute(disputeId, status, resolutionNotes) {
    try {
        const user = await getCurrentUser();
        
        const { error } = await supabase
            .from('disputes')
            .update({
                status: status,
                resolution_notes: resolutionNotes,
                resolved_by: user?.id,
                resolved_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', disputeId);
        
        if (error) throw error;
        
        return true;
        
    } catch (error) {
        console.error('Error resolving dispute:', error);
        throw error;
    }
}

/**
 * Get transactions with optional filters
 */
export async function getAdminTransactions(limit = 50, status = null, type = null) {
    try {
        let query = supabase
            .from('escrow_transactions')
            .select(`
                *,
                from_user:from_user_id (id, full_name, email),
                to_user:to_user_id (id, full_name, email)
            `)
            .order('created_at', { ascending: false });
        
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }
        
        if (type && type !== 'all') {
            query = query.eq('type', type);
        }
        
        const { data, error } = await query.limit(limit);
        
        if (error) throw error;
        
        return data || [];
        
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
}

/**
 * Get audit logs with optional category filter
 */
export async function getAdminAuditLogs(category = null, limit = 50) {
    try {
        let query = supabase
            .from('audit_entries')
            .select(`
                *,
                user:user_id (id, full_name, email)
            `)
            .order('timestamp', { ascending: false });
        
        if (category && category !== 'all') {
            query = query.eq('category', category);
        }
        
        const { data, error } = await query.limit(limit);
        
        if (error) throw error;
        
        return data || [];
        
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
    }
}

/**
 * Get system settings
 */
export async function getAdminSettings() {
    try {
        const { data, error } = await supabase
            .from('admin_settings')
            .select('*')
            .order('category', { ascending: true });
        
        if (error) throw error;
        
        // Transform to key-value object
        const settings = {};
        data?.forEach(item => {
            try {
                settings[item.key] = JSON.parse(item.value);
            } catch {
                settings[item.key] = item.value;
            }
        });
        
        return {
            settings,
            raw: data || []
        };
        
    } catch (error) {
        console.error('Error fetching settings:', error);
        throw error;
    }
}

/**
 * Update system settings
 */
export async function updateAdminSettings(settingsData) {
    try {
        const user = await getCurrentUser();
        const results = [];
        
        for (const [key, value] of Object.entries(settingsData)) {
            const { data, error } = await supabase
                .from('admin_settings')
                .update({
                    value: typeof value === 'string' ? `"${value}"` : JSON.stringify(value),
                    updated_by: user?.id,
                    updated_at: new Date().toISOString()
                })
                .eq('key', key)
                .select();
            
            results.push({ 
                key, 
                success: !error,
                error: error?.message || null 
            });
        }
        
        return results;
        
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
}

/**
 * Create a new user (admin only)
 */
export async function createAdminUser(email, password, fullName, role) {
    try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, role: role }
            }
        });
        
        if (authError) throw authError;
        
        // Create profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
                id: authData.user.id,
                full_name: fullName,
                email: email,
                role: role,
                is_active: true,
                is_verified: false
            }]);
        
        if (profileError) throw profileError;
        
        return {
            success: true,
            user: {
                id: authData.user.id,
                email: email,
                full_name: fullName,
                role: role
            }
        };
        
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

/**
 * Update user status (activate/suspend)
 */
export async function updateUserStatus(userId, isActive) {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ 
                is_active: isActive,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        
        if (error) throw error;
        return true;
        
    } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get time ago string
 */
export function getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

/**
 * Format currency
 */
export function formatCurrency(amount, currency = 'ZMW') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 2
    }).format(amount || 0);
}

/**
 * Get status badge class
 */
export function getStatusClass(status) {
    const statusMap = {
        'pending': 'warning',
        'confirmed': 'info',
        'escrow_funded': 'primary',
        'shipped': 'info',
        'delivered': 'success',
        'completed': 'success',
        'disputed': 'danger',
        'cancelled': 'danger',
        'active': 'success',
        'inactive': 'danger',
        'suspended': 'danger',
        'under_review': 'warning',
        'resolved': 'success',
        'rejected': 'danger'
    };
    return statusMap[status] || 'neutral';
}

/**
 * Get role badge class
 */
export function getRoleClass(role) {
    const roleMap = {
        'admin': 'admin',
        'buyer': 'buyer',
        'supplier': 'supplier',
        'logistics': 'logistics',
        'government': 'government',
        'fintech': 'fintech',
        'veterinary': 'veterinary',
        'customs': 'customs'
    };
    return roleMap[role] || 'buyer';
}