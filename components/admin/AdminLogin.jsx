'use client';

import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const AdminLogin = () => {
    const { loginAdmin } = useAdmin();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            const success = loginAdmin(username, password);
            if (!success) {
                setError('Credenciais inválidas');
                setPassword('');
            }
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--primary)]/10 border-2 border-[var(--primary)] mb-6 shadow-[0_0_30px_rgba(0,243,255,0.2)]">
                        <ShieldCheck size={40} className="text-[var(--primary)]" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
                        SHIRO <span className="text-[var(--primary)]">CMS</span>
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm font-mono uppercase tracking-widest">
                        Painel Administrativo /// Acesso Restrito
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="glass-panel p-8 border-[var(--primary)]">
                    <div className="space-y-6">
                        {/* Username */}
                        <div>
                            <label className="text-xs text-[var(--primary)] font-mono uppercase mb-2 block tracking-widest">
                                Usuário
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    placeholder="Digite seu usuário"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-xs text-[var(--primary)] font-mono uppercase mb-2 block tracking-widest">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-12 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    placeholder="Digite sua senha"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-rose-400 text-sm font-mono animate-fade-in">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[var(--primary)] hover:bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,243,255,0.2)] hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Autenticando...' : 'Acessar CMS'}
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <p className="text-center text-[10px] text-[var(--text-muted)] mt-6 font-mono uppercase tracking-widest">
                    Secure Environment /// End-to-End Encryption Enabled
                </p>
            </div>
        </div>
    );
};
