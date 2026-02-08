'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
    const [adminUser, setAdminUser] = useState(null);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Default credentials (can be changed)
    const ADMIN_CREDENTIALS = {
        username: 'admin',
        password: 'shiro2026'
    };

    useEffect(() => {
        const savedAuth = localStorage.getItem('shiro_admin_auth');
        if (savedAuth) {
            const parsed = JSON.parse(savedAuth);
            setAdminUser(parsed);
            setIsAdminAuthenticated(true);
        }
        setMounted(true);
    }, []);

    const loginAdmin = (username, password) => {
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            const adminData = { username, loginTime: new Date().toISOString() };
            setAdminUser(adminData);
            setIsAdminAuthenticated(true);
            localStorage.setItem('shiro_admin_auth', JSON.stringify(adminData));
            return true;
        }
        return false;
    };

    const logoutAdmin = () => {
        setAdminUser(null);
        setIsAdminAuthenticated(false);
        localStorage.removeItem('shiro_admin_auth');
    };

    return (
        <AdminContext.Provider value={{
            adminUser,
            isAdminAuthenticated,
            loginAdmin,
            logoutAdmin,
            mounted
        }}>
            {children}
        </AdminContext.Provider>
    );
};
