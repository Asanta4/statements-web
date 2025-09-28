interface User {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export class AuthService {
  private static readonly STORAGE_KEY = 'checkmate_auth_user';
  private static readonly ALLOWED_EMAILS_KEY = 'VITE_ALLOWED_EMAILS';

  /**
   * Get allowed email addresses from environment variables
   */
  static getAllowedEmails(): string[] {
    const allowedEmails = import.meta.env[this.ALLOWED_EMAILS_KEY];
    if (!allowedEmails) {
      console.warn('VITE_ALLOWED_EMAILS not configured in environment variables');
      return [];
    }

    return allowedEmails
      .split(',')
      .map((email: string) => email.trim().toLowerCase())
      .filter((email: string) => email.length > 0);
  }

  /**
   * Validate if an email is in the allowed list
   */
  static isEmailAllowed(email: string): boolean {
    const allowedEmails = this.getAllowedEmails();

    if (allowedEmails.length === 0) {
      console.warn('No allowed emails configured - allowing all emails');
      return true;
    }

    const normalizedEmail = email.trim().toLowerCase();
    return allowedEmails.includes(normalizedEmail);
  }

  /**
   * Validate and store user if email is allowed
   */
  static validateAndStoreUser(userInfo: {
    email: string;
    name: string;
    picture: string;
    sub: string;
    email_verified: boolean;
  }): { success: boolean; error?: string } {
    // Check if email is verified
    if (!userInfo.email_verified) {
      return {
        success: false,
        error: 'Email address is not verified with Google'
      };
    }

    // Check if email is allowed
    if (!this.isEmailAllowed(userInfo.email)) {
      return {
        success: false,
        error: 'Your email address is not authorized to access this application'
      };
    }

    // Store user information
    const user: User = {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      sub: userInfo.sub
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      return { success: true };
    } catch (error) {
      console.error('Failed to store user information:', error);
      return {
        success: false,
        error: 'Failed to store user session'
      };
    }
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): User | null {
    try {
      const userJson = localStorage.getItem(this.STORAGE_KEY);
      if (!userJson) return null;

      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error('Failed to retrieve user information:', error);
      return null;
    }
  }

  /**
   * Check if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Sign out current user
   */
  static signOut(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove user session:', error);
    }
  }

  /**
   * Get user display information for UI
   */
  static getUserDisplayInfo(): { name: string; email: string; picture: string } | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    return {
      name: user.name,
      email: user.email,
      picture: user.picture
    };
  }
}