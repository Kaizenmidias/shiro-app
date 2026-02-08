'use client';

import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { X, Camera, User, Check, RefreshCw } from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose }) => {
    const { userName, setUserName, userPhoto, setUserPhoto } = useGame();
    const [tempName, setTempName] = useState(userName);
    const [tempPhoto, setTempPhoto] = useState(userPhoto);
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setUserName(tempName);
            setUserPhoto(tempPhoto);
            setIsSaving(false);
            onClose();
        }, 800);
    };

    const generateNewAvatar = () => {
        const seed = Math.floor(Math.random() * 10000);
        setTempPhoto(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-panel w-full max-w-md p-6 md:p-8 relative border-[var(--primary)] shadow-[0_0_50px_rgba(0,243,255,0.1)]">
                {/* Header */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-transparent" />
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl md:text-2xl font-bold mb-8 flex items-center gap-2 text-white italic">
                    <span className="text-[var(--primary)]">///</span> PERFIL DO USUÁRIO
                </h2>

                <div className="space-y-8">
                    {/* Avatar Selection */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-[var(--primary)] shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                                <img
                                    src={tempPhoto}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button
                                onClick={generateNewAvatar}
                                className="absolute bottom-0 right-0 bg-[var(--surface-color)] p-2 rounded-full border border-[var(--glass-border)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-black transition-all shadow-xl"
                                title="Gerar Novo Avatar"
                            >
                                <RefreshCw size={20} className={isSaving ? 'animate-spin' : ''} />
                            </button>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono">Avatar Autogerado</p>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-[var(--primary)] font-mono uppercase mb-2 block tracking-widest">Identificação (Nome)</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                <input
                                    type="text"
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    value={tempName}
                                    onChange={e => setTempName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-[var(--text-muted)] font-mono uppercase mb-2 block tracking-widest">URL da Foto (Opcional)</label>
                            <div className="relative">
                                <Camera className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                <input
                                    type="text"
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    placeholder="https://sua-foto.com/image.jpg"
                                    value={tempPhoto}
                                    onChange={e => setTempPhoto(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-[var(--glass-border)] text-[var(--text-muted)] hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 py-3 rounded-xl bg-[var(--primary)] text-black font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,243,255,0.2)] hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] transition-all flex items-center justify-center gap-2"
                        >
                            {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
