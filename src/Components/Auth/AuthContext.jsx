import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        const storedUser = localStorage.getItem('vendorUser');

        // Try to restore user from localStorage first for quick display
        let restoredUser = null;
        if (storedUser) {
            try {
                restoredUser = JSON.parse(storedUser);
            } catch { /* ignore */ }
        }

        try {
            // Cookies are sent automatically with withCredentials: true
            const response = await api.get('/me');

            if (response.data.authenticated && response.data.user) {
                setUser(response.data.user);
                localStorage.setItem('vendorUser', JSON.stringify(response.data.user));
            } else if (restoredUser) {
                // API didn't return user but we have stored data
                setUser(restoredUser);
            } else {
                setUser(null);
                localStorage.removeItem('vendorUser');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // On 401/403, clear user state
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('vendorUser');
                setUser(null);
            } else {
                // For other errors (network, CORS), use stored user as fallback
                if (restoredUser) {
                    console.log('Using stored user data as fallback');
                    setUser(restoredUser);
                } else {
                    setUser(null);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = (userData) => {
        // Token is now handled by HTTP-only cookies set by the server
        // We just store user data for quick UI display
        setUser(userData);
        if (userData) {
            localStorage.setItem('vendorUser', JSON.stringify(userData));
        }
    };

    const logout = async () => {
        try {
            // Call logout endpoint - server will clear the HTTP-only cookie
            await api.post('/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('vendorUser');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
