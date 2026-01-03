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

        if (!token) {
            // Check if user data is stored locally (for session persistence)
            const storedUser = localStorage.getItem('authUser');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    setUser(null);
                }
            }
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
            } else {
                setUser(null);
                localStorage.removeItem('authUser');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // If token is invalid, clear it
            if (error.response?.status === 401 || error.response?.status === 403) {
                setToken(null);
                localStorage.removeItem('authUser');
            }
            setUser(null);
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
