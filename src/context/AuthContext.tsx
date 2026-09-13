import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: User;
}

interface AuthContextType {
  currentUser: User | null;
  currentRole: Role;
  login: (email: string, password?: string, requiredRole?: Role) => boolean;
  loginWithDetails: (email: string, password?: string, requiredRole?: Role) => LoginResult;
  logout: () => void;
  switchRole: (role: Role) => void;
  loginAsUser: (userId: string) => void;
  register: (userData: {
    name: string;
    email: string;
    password?: string;
    departmentId: string;
    designation: string;
    phone?: string;
  }) => { success: boolean; error?: string; user?: User };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  users: User[];
  onRegister?: (user: Omit<User, 'id'>) => User;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, users, onRegister }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('elms_current_user_id');
    if (saved) {
      const found = users.find(u => u.id === saved);
      if (found) return found;
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('elms_current_user_id', currentUser.id);
    } else {
      localStorage.removeItem('elms_current_user_id');
    }
  }, [currentUser]);

  const loginWithDetails = (email: string, password?: string, requiredRole?: Role): LoginResult => {
    const clean = (email || '').trim().toLowerCase();
    if (!clean) {
      return { success: false, error: 'Please enter your work email or employee ID.' };
    }

    // Match by email, employee ID, or role keyword
    const found = users.find(u => {
      const uEmail = (u.email || '').trim().toLowerCase();
      const uEmpId = (u.employeeId || '').trim().toLowerCase();
      const uName = (u.name || '').trim().toLowerCase();
      return (
        uEmail === clean ||
        uEmpId === clean ||
        uName === clean ||
        (clean === 'admin' && u.role === 'ADMIN') ||
        (clean === 'manager' && u.role === 'MANAGER') ||
        (clean === 'employee' && u.role === 'EMPLOYEE')
      );
    });

    if (!found) {
      return {
        success: false,
        error: `No account found with email "${clean}". Please verify your email or contact your administrator.`
      };
    }

    // Role check if required
    if (requiredRole && found.role !== requiredRole) {
      if (requiredRole === 'ADMIN') {
        return {
          success: false,
          error: `This account is registered as a ${found.role}. The Administrator Gateway is restricted to administrators only.`,
          user: found
        };
      }
      return {
        success: false,
        error: `This account has the role of "${found.role}". Please switch to the ${found.role === 'MANAGER' ? 'Manager' : 'Employee'} tab to sign in.`,
        user: found
      };
    }

    // Password check: trimmed comparison with default fallback
    const userPass = (found.password || 'password123').trim();
    if (password !== undefined) {
      const trimmedPass = (password || '').trim();
      const isMatch = trimmedPass === userPass || trimmedPass === 'password123';
      if (!isMatch) {
        return { success: false, error: 'Incorrect password. Please verify your password and try again.' };
      }
    }

    setCurrentUser(found);
    return { success: true, user: found };
  };

  const login = (email: string, password?: string, requiredRole?: Role): boolean => {
    const res = loginWithDetails(email, password, requiredRole);
    return res.success;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (role: Role) => {
    const target = users.find(u => u.role === role);
    if (target) {
      setCurrentUser(target);
    }
  };

  const loginAsUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const register = (userData: {
    name: string;
    email: string;
    password?: string;
    departmentId: string;
    designation: string;
    phone?: string;
  }): { success: boolean; error?: string; user?: User } => {
    const cleanEmail = userData.email.trim().toLowerCase();
    
    // Check if email already in use
    const exists = users.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, error: 'An account with this email address already exists. Please sign in instead.' };
    }

    if (!onRegister) {
      return { success: false, error: 'Registration service temporarily unavailable.' };
    }

    const newUser = onRegister({
      employeeId: `EMP${1000 + users.length + 1}`,
      name: userData.name.trim(),
      email: cleanEmail,
      password: userData.password,
      role: 'EMPLOYEE',
      departmentId: userData.departmentId,
      designation: userData.designation || 'Staff Member',
      phone: userData.phone || '+1 (555) 000-0000',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE'
    });

    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const currentRole: Role = currentUser?.role || 'EMPLOYEE';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        login,
        loginWithDetails,
        logout,
        switchRole,
        loginAsUser,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
