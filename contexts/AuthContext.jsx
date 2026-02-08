'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedAuth = localStorage.getItem('lifeos_auth');
        if (savedAuth) {
            setUser(JSON.parse(savedAuth));
            setIsAuthenticated(true);
        }
        setMounted(true);
    }, []);

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('shiro_auth', JSON.stringify(userData));
    };

    const signup = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('shiro_auth', JSON.stringify(userData));

        // Data Syncing with other modules is handled in the AuthScreen component
        // to leverage hook logic directly.
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('lifeos_auth');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, mounted }}>
            {children}
        </AuthContext.Provider>
    );
};
