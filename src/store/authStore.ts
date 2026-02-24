import { create } from 'zustand';
import { supabase } from '@/supabase-client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  username: string | null;
  role: 'user' | 'admin' | 'superadmin' | null;
  initialized: boolean;
  
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  updateUsername: (username: string) => void;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  error: null,
  username: null,
  role: null,
  initialized: false,

  signUp: async (email: string, password: string, username: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/auth/callback?tenant=${window.location.pathname.split('/')[1] || 'mizuki'}`,
        },
      });

      if (authError) {
        const errorMessage = authError.message.includes('already registered') || 
                           authError.message.includes('already exists') ||
                           authError.message.includes('User already registered')
          ? 'Account already exists. Please login.'
          : authError.message;
        set({ isLoading: false, error: errorMessage });
        throw new Error(errorMessage);
      }

      set({ isLoading: false, error: null });
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to sign up' });
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        set({ isLoading: false, error: error.message });
        throw error;
      }

      set({ isLoading: false, error: null });
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to sign in' });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null, username: null, role: null, isLoading: false, error: null, initialized: true });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  checkSession: async () => {
    // onAuthStateChange listener will handle initialization
  },

  updateUsername: (username: string) => {
    set({ username });
  },

  isAdmin: () => {
    const { role } = get();
    return role === 'admin' || role === 'superadmin';
  },

  isSuperAdmin: () => {
    const { role } = get();
    return role === 'superadmin';
  },
}));

// ============================================================================
// BACKGROUND PROFILE FETCHING (Non-blocking)
// ============================================================================
async function fetchProfileInBackground(userId: string) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[authStore] Profile lookup error:', error.message);
      return;
    }

    if (profile) {
      const newRole = profile.role || 'user';
      console.log('[authStore] Profile fetched - updating role to:', newRole);
      useAuthStore.setState({
        username: profile.username || useAuthStore.getState().username,
        role: newRole,
      });
      // Cache role in localStorage so it persists across reloads
      if (userId) {
        localStorage.setItem(`userRole_${userId}`, newRole);
      }
    }
  } catch (error) {
    console.warn('[authStore] Profile fetch failed:', error);
  }
}

// ============================================================================
// AUTH STATE LISTENER - ONLY SOURCE OF TRUTH FOR AUTH
// ============================================================================
let authSubscription: { data: { subscription: { unsubscribe: () => void } } } | null = null;

if (authSubscription) {
  authSubscription.data.subscription.unsubscribe();
  authSubscription = null;
}

authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('[authStore] Auth event:', event, 'has session:', !!session?.user);

  if (event === 'SIGNED_IN' && session?.user) {
    // Try to get cached role first (from localStorage)
    const cachedRole = localStorage.getItem(`userRole_${session.user.id}`) as any;
    
    // ✅ SET INITIALIZED IMMEDIATELY - DO NOT WAIT FOR PROFILE
    useAuthStore.setState({
      user: session.user,
      session: session,
      isLoading: false,
      error: null,
      initialized: true,
      username: session.user.user_metadata?.username || null,
      role: cachedRole || 'user', // Use cached role if available, otherwise default to 'user'
    });

    // 🔄 FETCH PROFILE IN BACKGROUND (non-blocking)
    // Fire and forget - don't await
    fetchProfileInBackground(session.user.id);

  } else if (event === 'SIGNED_OUT') {
    // ✅ MARK INITIALIZED IMMEDIATELY WHEN SIGNED OUT
    useAuthStore.setState({
      user: null,
      session: null,
      username: null,
      role: null,
      isLoading: false,
      error: null,
      initialized: true,
    });

  } else if (event === 'TOKEN_REFRESHED' && session) {
    // Try to get cached role on token refresh too
    const cachedRole = session.user ? localStorage.getItem(`userRole_${session.user.id}`) as any : null;
    
    useAuthStore.setState({
      session: session,
      isLoading: false,
      initialized: true,
      role: cachedRole || useAuthStore.getState().role, // Keep current role or use cached
    });

  } else if (event === 'INITIAL_SESSION') {
    // ✅ ALWAYS MARK INITIALIZED ON INITIAL_SESSION
    // This guarantees app initializes regardless of session state
    let roleFromCache = null;
    
    if (session?.user) {
      roleFromCache = localStorage.getItem(`userRole_${session.user.id}`) as any;
      console.log('[authStore] INITIAL_SESSION - cached role:', roleFromCache);
    }
    
    useAuthStore.setState({
      isLoading: false,
      initialized: true,
      role: roleFromCache || useAuthStore.getState().role,
      user: session?.user || null,
      session: session || null,
      username: session?.user?.user_metadata?.username || useAuthStore.getState().username,
    });

    // If there's a session, fetch profile in background to update role
    if (session?.user) {
      fetchProfileInBackground(session.user.id);
    }
  }
});

export const cleanupAuthListener = () => {
  if (authSubscription) {
    authSubscription.data.subscription.unsubscribe();
    authSubscription = null;
  }
};
