// Role-based session management utility

export interface RoleSession {
  user: {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  role: string;
  expiresAt: number;
  lastActivity: number;
  token?: string;
}

export class SessionManager {
  private static SESSION_KEYS = {
    admin: 'esygrab_admin_session',
    delivery_partner: 'esygrab_delivery_session',
    customer: 'esygrab_user_session',
    user: 'esygrab_user_session'
  } as const;

  // Clear ALL role sessions before creating new one
  static clearAllSessions(): void {
    Object.values(this.SESSION_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear legacy sessions
    localStorage.removeItem('esygrab_session');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('guest_cart');
    localStorage.removeItem('auth_redirect_url');
  }

  // Store role-specific session with role isolation
  static storeSession(user: any, role: string): void {
    console.log('SessionManager: Storing session for role:', role);
    
    // Always clear all sessions first to prevent conflicts
    this.clearAllSessions();
    
    const sessionData: RoleSession = {
      user: {
        id: user.id,
        email: user.email,
        role: role,
        isVerified: true
      },
      role: role,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 1 day
      lastActivity: Date.now()
    };
    
    const sessionKey = this.SESSION_KEYS[role as keyof typeof this.SESSION_KEYS] || this.SESSION_KEYS.user;
    localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    
    console.log('SessionManager: Session stored with key:', sessionKey);
  }

  // Get session for specific role
  static getSession(role: string): RoleSession | null {
    const sessionKey = this.SESSION_KEYS[role as keyof typeof this.SESSION_KEYS];
    if (!sessionKey) return null;

    const sessionData = localStorage.getItem(sessionKey);
    if (!sessionData) return null;

    try {
      const session: RoleSession = JSON.parse(sessionData);
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(sessionKey);
        return null;
      }

      // Update last activity if session is still valid
      session.lastActivity = Date.now();
      localStorage.setItem(sessionKey, JSON.stringify(session));
      
      return session;
    } catch (error) {
      console.error('SessionManager: Error parsing session:', error);
      localStorage.removeItem(sessionKey);
      return null;
    }
  }

  // Check if user has valid session for specific role
  static hasValidSession(role: string): boolean {
    return this.getSession(role) !== null;
  }

  // Get current active session (any role)
  static getCurrentSession(): RoleSession | null {
    for (const role of Object.keys(this.SESSION_KEYS)) {
      const session = this.getSession(role);
      if (session) return session;
    }
    return null;
  }

  // Validate session matches expected role
  static validateRoleSession(expectedRole: string): RoleSession | null {
    const session = this.getSession(expectedRole);
    if (!session || session.role !== expectedRole) {
      console.warn('SessionManager: Role mismatch or no session for role:', expectedRole);
      return null;
    }
    return session;
  }

  // Redirect to appropriate dashboard based on role
  static redirectToRoleDashboard(role: string): void {
    console.log('SessionManager: Redirecting to dashboard for role:', role);
    
    switch (role) {
      case 'admin':
      case 'super_admin':
        window.location.href = '/admin/dashboard';
        break;
      case 'delivery_partner':
        window.location.href = '/delivery-partner/dashboard';
        break;
      case 'customer':
      case 'user':
      default:
        window.location.href = '/';
        break;
    }
  }

  // Check and redirect if wrong page for role
  static enforceRoleRouting(): void {
    const currentPath = window.location.pathname;
    const currentSession = this.getCurrentSession();
    
    if (!currentSession) return;
    
    const role = currentSession.role;
    
    // Define role-specific routes
    const adminRoutes = ['/admin'];
    const deliveryRoutes = ['/delivery-partner', '/delivery'];
    
    const isOnAdminRoute = adminRoutes.some(route => currentPath.startsWith(route));
    const isOnDeliveryRoute = deliveryRoutes.some(route => currentPath.startsWith(route));
    
    // Redirect if user is on wrong route for their role
    if (role === 'admin' || role === 'super_admin') {
      if (!isOnAdminRoute && !currentPath.includes('/admin')) {
        this.redirectToRoleDashboard(role);
      }
    } else if (role === 'delivery_partner') {
      if (!isOnDeliveryRoute && !currentPath.includes('/delivery')) {
        this.redirectToRoleDashboard(role);
      }
    } else if ((role === 'customer' || role === 'user') && (isOnAdminRoute || isOnDeliveryRoute)) {
      this.redirectToRoleDashboard(role);
    }
  }
}