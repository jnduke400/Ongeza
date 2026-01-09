import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';

// Helper to decode JWT payload safely
const decodeJWT = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("JWT Decode error:", e);
        return null;
    }
};

// Helper to get gender-specific shadow placeholder
const getShadowAvatar = (gender?: string) => {
    const g = gender?.toUpperCase();
    if (g === 'FEMALE') {
        return 'https://ui-avatars.com/api/?name=F&background=E2E8F0&color=94A3B8&size=150&bold=true';
    }
    return 'https://ui-avatars.com/api/?name=M&background=E2E8F0&color=94A3B8&size=150&bold=true';
};

const mapApiUserToUser = (apiUser: any): User | null => {
    if (!apiUser) return null;
    
    let role: UserRole = UserRole.Saver; // Default
    
    // Normalize role name for check
    const roleNameUpper = apiUser.roleName ? apiUser.roleName.toUpperCase() : '';

    // Map role based on API response structure
    if (roleNameUpper === 'ADMIN' || 
        roleNameUpper === 'ROLE_ADMIN' || 
        roleNameUpper === 'SUPER_ADMIN' ||
        roleNameUpper === 'ROLE_SUPER_ADMIN' ||
        roleNameUpper === 'SUPER ADMIN' ||
        roleNameUpper === 'SUPER ADMINISTRATOR' || 
        roleNameUpper === 'ROLE_SUPER_ADMINISTRATOR' ||
        roleNameUpper === 'ADMINISTRATOR') {
        role = UserRole.PlatformAdmin;
    } else if (apiUser.userCategory === 'SAVER') {
        role = UserRole.Saver;
    } else if (apiUser.userCategory === 'BORROWER') {
        role = UserRole.Borrower;
    } else if (apiUser.userCategory === 'INVESTOR') {
        role = UserRole.Investor;
    } else if (apiUser.userCategory === 'GROUP_ADMIN') {
        role = UserRole.GroupAdmin;
    }

    const isOnboarded = apiUser.status === 'ONBOARDED';

    // FIX: Using standardized shadow image based on gender for missing profile pictures
    const avatar = apiUser.profilePictureUrl 
        ? `${API_BASE_URL}${apiUser.profilePictureUrl}` 
        : getShadowAvatar(apiUser.gender);

    return {
        id: String(apiUser.id),
        firstName: apiUser.firstName || '',
        lastName: apiUser.lastName || '',
        email: apiUser.email,
        role: role,
        avatar: avatar, 
        isOnboarded: isOnboarded,
        onboardingStatus: apiUser.status,
        goalsCount: apiUser.goalsCount,
        goalAchievementRate: apiUser.goalAchievementRate,
        loginCount: apiUser.totalLoginCount !== undefined ? apiUser.totalLoginCount : apiUser.loginCount,
        currency: apiUser.currency,
        gender: apiUser.gender,
        permissions: apiUser.permissions || [],
    };
};

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string; code?: string; twoFaRedirect?: boolean; mustChangePasswordRedirect?: boolean }>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
  updatePinStatus: (isSet: boolean) => void;
  verifyLoginOtp: (challengeId: string, otp: string) => Promise<{ success: boolean; message: string; }>;
  update2FASetupStatus: (isSetup: boolean) => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserProfile = async () => {
      try {
          const token = localStorage.getItem('accessToken');
          const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/users/me`);
          
          if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                  const mappedUser = mapApiUserToUser(data.data);
                  if (mappedUser) {
                      // Extract permissions from JWT if the API response is empty
                      let permissions = mappedUser.permissions || [];
                      if (permissions.length === 0 && token) {
                          const decoded = decodeJWT(token);
                          if (decoded && decoded.permissions) {
                              permissions = decoded.permissions;
                          }
                      }

                      const pinSet = localStorage.getItem('pinSet') === 'true';
                      const twoFaSetupRequired = localStorage.getItem('2faSetupRequired') === 'true';
                      setUser({ ...mappedUser, permissions, pinSet, twoFaSetupRequired });
                  }
              }
          }
      } catch (error) {
          console.error("Failed to fetch user profile", error);
      }
  };

  useEffect(() => {
    const initAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            await fetchUserProfile();
        }
        setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string; code?: string; twoFaRedirect?: boolean; mustChangePasswordRedirect?: boolean; }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
            return { success: false, message: data.message || 'Login failed due to an unknown error.', code: data.code };
        }

        const {
            accessToken,
            refreshToken,
            sessionId,
            pinSet,
            '2faRequired': twoFaRequired,
            '2faChallengeId': twoFaChallengeId,
            '2faSetupRequired': twoFaSetupRequired,
            mustChangePassword,
        } = data.data;

        // If password change is required, store tokens but don't finish login flow
        if (mustChangePassword) {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('sessionId', sessionId);
            return { success: true, message: 'Password change required', mustChangePasswordRedirect: true };
        }

        if (twoFaRequired && twoFaChallengeId) {
            navigate('/verify-2fa', { state: { challengeId: twoFaChallengeId } });
            return { success: false, message: '2FA required', twoFaRedirect: true };
        }

        if (!accessToken || !refreshToken || !sessionId) {
            return { success: false, message: 'Incomplete login data received from server.' };
        }

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('pinSet', String(pinSet));
        localStorage.setItem('2faSetupRequired', String(twoFaSetupRequired));

        await fetchUserProfile();
        
        return { success: true, message: 'Login successful' };

    } catch (error: any) {
        console.error('Login error:', error);
        localStorage.clear();
        sessionStorage.clear();
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            return { success: false, message: 'Network error: Could not connect to the server. Please check your internet connection or try again later.' };
        }
        return { success: false, message: error.message || 'An unknown network error occurred' };
    }
  };

  const verifyLoginOtp = async (challengeId: string, otp: string): Promise<{ success: boolean; message: string; }> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-login-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challengeId, otp }),
            });
            const data = await response.json();

            if (!response.ok || data.success === false) {
                return { success: false, message: data.message || 'OTP verification failed.' };
            }

            const {
                accessToken,
                refreshToken,
                sessionId,
                pinSet,
                '2faSetupRequired': twoFaSetupRequired,
            } = data.data;

            if (!accessToken) {
                return { success: false, message: 'Incomplete login data after OTP verification.' };
            }

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('sessionId', sessionId);
            localStorage.setItem('pinSet', String(pinSet));
            localStorage.setItem('2faSetupRequired', String(twoFaSetupRequired));

            await fetchUserProfile();
            
            navigate('/dashboard', { replace: true });
            return { success: true, message: 'Login successful' };

        } catch (error: any) {
            return { success: false, message: error.message || 'An unknown network error occurred' };
        }
    };

  const logout = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const sessionId = localStorage.getItem('sessionId');

    try {
        if (accessToken && refreshToken && sessionId) {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Id': sessionId,
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Logout API call failed:', errorData.message || 'Unknown server error');
            } else {
                console.log('Server logout successful.');
            }
        }
    } catch (error) {
        console.error('Error during logout API call:', error);
    } finally {
        setUser(null);
        localStorage.clear();
        sessionStorage.clear();
        navigate('/');
    }
  };

  const completeOnboarding = () => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return { ...prevUser, isOnboarded: true, onboardingStatus: 'ONBOARDED' };
    });
    fetchUserProfile();
  };

  const updatePinStatus = (isSet: boolean) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, pinSet: isSet };
        localStorage.setItem('pinSet', String(isSet));
        return updatedUser;
    });
  };
  
  const update2FASetupStatus = (isSetup: boolean) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, twoFaSetupRequired: !isSetup };
        localStorage.setItem('2faSetupRequired', String(!isSetup));
        return updatedUser;
    });
  };

  if (loading) {
      return null; 
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, completeOnboarding, updatePinStatus, verifyLoginOtp, update2FASetupStatus, refreshUserProfile: fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};