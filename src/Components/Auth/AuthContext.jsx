import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get token from localStorage
    const getToken = () => localStorage.getItem('authToken');

    // Set token in localStorage
    const setToken = (token) => {
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    };

    const fetchUser = async () => {
        const token = getToken();
        const storedUser = localStorage.getItem('authUser');

        // Try to restore user from localStorage first
        let restoredUser = null;
        if (storedUser) {
            try {
                restoredUser = JSON.parse(storedUser);
            } catch { /* ignore */ }
        }

        if (!token) {
            // No token, use stored user if available
            setUser(restoredUser);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.message === 'Success' && response.data.user) {
                setUser(response.data.user);
                localStorage.setItem('authUser', JSON.stringify(response.data.user));
            } else if (restoredUser) {
                // API didn't return user but we have stored data
                setUser(restoredUser);
            } else {
                setUser(null);
                localStorage.removeItem('authUser');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // On 401/403, clear everything
            if (error.response?.status === 401 || error.response?.status === 403) {
                setToken(null);
                localStorage.removeItem('authUser');
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

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('authUser', JSON.stringify(userData));
        if (token) {
            setToken(token);
        }
    };

    const logout = async () => {
        try {
            const token = getToken();
            if (token) {
                await axios.post(`${API_BASE_URL}/logout`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('authUser');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchUser, getToken, setToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
