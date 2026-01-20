'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    tenant_id?: string;
    branch_id?: string;
    tenant?: any;
    branch?: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                const response = await authApi.getMe();
                setUser(response.data.data);
            }
        } catch (error) {
            localStorage.removeItem('access_token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await authApi.login(email, password);
        const { user, access_token } = response.data.data;
        localStorage.setItem('access_token', access_token);
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
