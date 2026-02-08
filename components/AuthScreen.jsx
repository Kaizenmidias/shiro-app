'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { useHealth } from '../hooks/useHealth';
import { useFinance } from '../hooks/useFinance';
import { User, Lock, Mail, ChevronRight, Weight, ArrowRight, DollarSign } from 'lucide-react';
import { CurrencyInput } from './finance/CurrencyInput';

export const AuthScreen = () => {
    const { login, signup } = useAuth();
    const { setUserName } = useGame();
    const { completeOnboarding } = useHealth();
    const { setIncome } = useFinance();

    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        age: '',
        height: '',
        weight: '',
        sex: 'male',
        income: 0
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await login({ email: formData.email, password: formData.password });
            } else {
                await signup({ 
                    email: formData.email, 
                    password: formData.password,
                    options: {
                        data: {
                            name: formData.name,
                            age: formData.age,
                            height: formData.height,
                            weight: formData.weight,
                            sex: formData.sex,
                            income: formData.income
                        }
                    }
                });

                // Sync Onboarding Data
                setUserName(formData.name);
                completeOnboarding({
                    age: formData.age,
                    height: formData.height,
                    weight: formData.weight,
                    sex: formData.sex
                });

                if (formData.income > 0) {
                    setIncome(formData.income);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0a0a0c] z-[100] flex items-center justify-center p-4 overflow-y-auto">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary)]/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--accent)]/10 blur-[120px] rounded-full" />
            </div>

            <div className="glass-panel w-full max-w-xl p-8 md:p-12 relative animate-fade-in border-[var(--primary)] shadow-[0_0_50px_rgba(0,243,255,0.1)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-transparent" />

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic flex items-center justify-center gap-2">
                        SHI<span className="text-[var(--primary)]">RO</span>
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm uppercase tracking-widest font-mono">
                        {isLogin ? 'Protocolo de Operação Pessoal' : 'Iniciando Novo Sistema'}
                    </p>
                </div>

                <div className="flex gap-2 p-1 bg-[var(--surface-color)] rounded-xl mb-8 border border-[var(--glass-border)]">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${isLogin ? 'bg-[var(--primary)] text-black shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'text-[var(--text-muted)] hover:text-white'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${!isLogin ? 'bg-[var(--primary)] text-black shadow-[0_0_15px_rgba(0,243,255,0.3)]' : 'text-[var(--text-muted)] hover:text-white'}`}
                    >
                        Cadastro
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    )}
                    {!isLogin && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-[10px] text-[var(--primary)] font-black uppercase tracking-widest mb-2 block">Seu Nome</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)]" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                        placeholder="Ex: Lucas Silva"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-2 block">Idade</label>
                                <input
                                    type="number"
                                    required={!isLogin}
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-4 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    placeholder="25"
                                    value={formData.age}
                                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-2 block">Sexo</label>
                                <select
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-4 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    value={formData.sex}
                                    onChange={e => setFormData({ ...formData, sex: e.target.value })}
                                >
                                    <option value="male">Masculino</option>
                                    <option value="female">Feminino</option>
                                    <option value="other">Outro</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-2 block">Altura (cm)</label>
                                <input
                                    type="number"
                                    required={!isLogin}
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-4 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    placeholder="180"
                                    value={formData.height}
                                    onChange={e => setFormData({ ...formData, height: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-2 block">Peso Atual (kg)</label>
                                <input
                                    type="number"
                                    required={!isLogin}
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-4 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    placeholder="80"
                                    value={formData.weight}
                                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="text-[10px] text-[var(--accent)] font-black uppercase tracking-widest mb-2 block italic text-center">Renda Mensal Estimada</label>
                                <CurrencyInput
                                    value={formData.income}
                                    onChange={val => setFormData({ ...formData, income: val })}
                                    className="text-center text-xl font-black"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-2 block">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    placeholder="seu@email.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-2 block">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--primary)] hover:bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(0,243,255,0.2)] hover:shadow-[0_0_40px_rgba(0,243,255,0.4)] hover:scale-[1.02] active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="animate-pulse">Processando...</span>
                        ) : (
                            <>
                                {isLogin ? 'Entrar no Sistema' : 'Inicializar Protocolo'}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>

                    <p className="text-[10px] text-center text-[var(--text-muted)] font-mono uppercase tracking-tighter opacity-50">
                        Secure Environment /// End-to-End Encryption Enabled
                    </p>
                </form>
            </div>
        </div>
    );
};
