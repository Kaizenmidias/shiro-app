import React, { useState } from 'react';
import { User, Target, TrendingUp, Scale, Activity, History, ChevronRight, Save, Check } from 'lucide-react';

export const BodyTab = ({ userData, profileData, weightHistory, updateUserData, completeOnboarding, updateWeight, calculateTMB, getWeightRoadmap, mounted }) => {
    const [onboardingData, setOnboardingData] = useState({
        weight: profileData.weight || '',
        height: profileData.height || '',
        age: profileData.age || '',
        sex: profileData.sex || 'male'
    });

    const [dailyUpdate, setDailyUpdate] = useState({
        weight: userData.weight || '',
        bf: userData.bf || ''
    });

    if (!mounted) return null;

    const tmb = calculateTMB();
    const roadmap = getWeightRoadmap();

    const handleOnboardingSubmit = (e) => {
        e.preventDefault();
        if (!onboardingData.weight || !onboardingData.height || !onboardingData.age) return;
        completeOnboarding(onboardingData);
    };

    const handleDailyUpdate = (e) => {
        e.preventDefault();
        if (!dailyUpdate.weight) return;
        updateWeight(dailyUpdate.weight, dailyUpdate.bf);
    };

    // --- ONBOARDING VIEW ---
    if (!userData.onboardingSet) {
        return (
            <div className="max-w-md mx-auto py-10 animate-fade-in">
                <div className="glass-panel p-8 border-[var(--primary)] shadow-[0_0_30px_rgba(0,243,255,0.1)]">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[var(--primary-dim)]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--primary-dim)]/30">
                            <Activity size={32} className="text-[var(--primary)]" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Configuração de Saúde</h2>
                        <p className="text-[var(--text-muted)] text-sm">Precisamos de alguns dados básicos para calcular seu metabolismo e metas.</p>
                    </div>

                    <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1 block">Peso (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl p-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    value={onboardingData.weight}
                                    onChange={e => setOnboardingData({ ...onboardingData, weight: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1 block">Altura (cm)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl p-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    value={onboardingData.height}
                                    onChange={e => setOnboardingData({ ...onboardingData, height: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1 block">Idade</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl p-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    value={onboardingData.age}
                                    onChange={e => setOnboardingData({ ...onboardingData, age: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1 block">Sexo</label>
                                <select
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl p-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all appearance-none"
                                    value={onboardingData.sex}
                                    onChange={e => setOnboardingData({ ...onboardingData, sex: e.target.value })}
                                >
                                    <option value="male">Masculino</option>
                                    <option value="female">Feminino</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 mt-4 bg-[var(--primary)] text-black font-bold rounded-xl shadow-[0_0_20px_var(--primary-glow)] hover:shadow-[0_0_30px_var(--primary-glow)] transition-all flex items-center justify-center gap-2 group"
                        >
                            Finalizar Configuração
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // --- DASHBOARD VIEW ---
    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header Greeting & TMB Analysis */}
            <div className="glass-panel p-6 border-l-4 border-l-[var(--primary)] overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 blur-3xl rounded-full -mr-16 -mt-16" />
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
                    <Activity size={20} className="text-[var(--primary)]" />
                    Análise Corporal
                </h3>
                <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                    {userData.targetWeight && userData.weight && (
                        <div className="p-5 bg-[var(--primary)]/5 rounded-2xl border border-[var(--primary)]/20 shadow-[0_0_20px_rgba(0,243,255,0.05)]">
                            <p className="text-xs text-[var(--text-muted)] mb-2 uppercase font-mono tracking-wider flex justify-between">
                                Progresso da Meta
                                <span className="text-[var(--primary)] font-bold">Meta: {userData.targetWeight}kg</span>
                            </p>
                            <div className="flex items-end justify-between mb-3">
                                <span className="text-3xl font-black text-white tracking-tighter">{userData.weight}<span className="text-sm ml-1 text-[var(--text-muted)]">kg</span></span>
                                <span className="text-[10px] text-[var(--text-muted)] uppercase font-mono">Peso Atual</span>
                            </div>
                            <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-[var(--primary)] shadow-[0_0_15px_var(--primary-glow)] transition-all duration-1000"
                                    style={{ width: `${Math.min(100, Math.max(10, (1 - Math.abs(userData.weight - userData.targetWeight) / 20) * 100))}%` }}
                                />
                            </div>
                        </div>
                    )}
                    <div className="text-right md:pr-4 opacity-50 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-[var(--text-muted)] mb-1 uppercase tracking-widest font-mono text-blue-400">Consumo Basal (TMB)</p>
                        <div className="flex items-baseline gap-1 justify-end">
                            <span className="text-2xl font-black text-white">{Math.round(tmb)}</span>
                            <span className="text-[var(--primary)] text-xs font-bold">kcal/dia</span>
                        </div>
                        <p className="text-[9px] text-[var(--text-muted)] leading-tight mt-1">Estimativa de calorias para<br />manutenção em repouso</p>
                    </div>
                </div>
            </div>

            {/* Jornada RoadMap */}
            {roadmap.length > 0 && (
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-[var(--primary)]" />
                        Sua Jornada até a Meta
                    </h3>
                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute left-4 right-4 top-4 h-0.5 bg-white/5 z-0" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 relative z-10">
                            {roadmap.map((m) => {
                                const isReached = userData.rewardedMonths?.includes(m.month);
                                return (
                                    <div key={m.month} className="flex md:flex-col items-center gap-4 md:text-center group">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isReached ? 'bg-[var(--primary)] text-black shadow-[0_0_15px_var(--primary-glow)]' : 'bg-black/40 border border-white/10 text-[var(--text-muted)] group-hover:border-[var(--primary)]'}`}>
                                            {isReached ? <Check size={16} /> : m.month}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[var(--text-muted)] uppercase font-mono tracking-tighter">Mês {m.month}</p>
                                            <p className={`text-xl font-black ${isReached ? 'text-white' : 'text-white/40'}`}>
                                                {m.target}<span className="text-[10px] ml-1 uppercase">kg</span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Daily Update Section */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Scale size={18} className="text-[var(--primary)]" />
                        Atualização Diária
                    </h3>
                    <form onSubmit={handleDailyUpdate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-tighter mb-1 block">Peso Atual (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-center font-bold"
                                    value={dailyUpdate.weight}
                                    onChange={e => setDailyUpdate({ ...dailyUpdate, weight: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-tighter mb-1 block">BF % (Opcional)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-center font-bold"
                                    value={dailyUpdate.bf}
                                    onChange={e => setDailyUpdate({ ...dailyUpdate, bf: e.target.value })}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-[var(--surface-highlight)] hover:bg-[var(--primary)] hover:text-black text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5"
                        >
                            <Save size={16} />
                            Registrar Hoje
                        </button>
                    </form>
                </div>

                {/* Profile Stats (Read-Only) */}
                <div className="glass-panel p-6 opacity-80">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <User size={18} className="text-blue-400" />
                            Seus Dados
                        </h3>
                        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono text-blue-400/60">Sincronizado</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                            <label className="text-[10px] text-[var(--text-muted)] uppercase block mb-1">Altura</label>
                            <span className="text-white font-bold">{profileData.height} cm</span>
                        </div>
                        <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                            <label className="text-[10px] text-[var(--text-muted)] uppercase block mb-1">Idade</label>
                            <span className="text-white font-bold">{profileData.age} anos</span>
                        </div>
                        <div className="p-3 bg-black/20 rounded-xl border border-white/5 col-span-2">
                            <label className="text-[10px] text-[var(--text-muted)] uppercase block mb-1">Sexo</label>
                            <span className="text-white font-bold capitalize">{profileData.sex === 'male' ? 'Masculino' : 'Feminino'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Goal Settings */}
            <div className="glass-panel p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Target size={18} className="text-red-400" />
                    Configuração de Objetivo
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-[var(--text-muted)] mb-1 block">Meta Principal</label>
                        <select
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--primary)] appearance-none cursor-pointer"
                            value={userData.goal}
                            onChange={e => updateUserData({ goal: e.target.value })}
                        >
                            <option value="perder_peso">Emagrecimento</option>
                            <option value="ganhar_massa">Ganho de Massa</option>
                            <option value="manutencao">Manutenção</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-[var(--text-muted)] mb-1 block">Peso Desejado (kg)</label>
                            <input
                                type="number"
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--primary)]"
                                value={userData.targetWeight}
                                onChange={e => updateUserData({ targetWeight: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-[var(--text-muted)] mb-1 block">Prazo (meses)</label>
                            <select
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--primary)] appearance-none cursor-pointer"
                                value={userData.deadline}
                                onChange={e => updateUserData({ deadline: e.target.value })}
                            >
                                {[1, 3, 6, 9, 12].map(m => <option key={m} value={m}>{m} Meses</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Preview */}
            {weightHistory.length > 0 && (
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <History size={18} className="text-yellow-400" />
                        Histórico Recente
                    </h3>
                    <div className="space-y-2">
                        {weightHistory.slice(0, 5).map((record, i) => (
                            <div key={i} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-colors">
                                <span className="text-xs text-[var(--text-muted)] font-mono">
                                    {new Date(record.date).toLocaleDateString()}
                                </span>
                                <div className="flex gap-4">
                                    <span className="text-sm font-bold text-white">{record.weight} kg</span>
                                    {record.bf && <span className="text-xs text-[var(--primary)]">{record.bf}% BF</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
