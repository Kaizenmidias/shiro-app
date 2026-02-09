'use client';

import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useHealth } from '../hooks/useHealth';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { X, Camera, User, Check, RefreshCw, Mail, Lock } from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose }) => {
    const { userName, setUserName, userPhoto, setUserPhoto } = useGame();
    const { user } = useAuth();
    const { userData, profileData, updateUserData } = useHealth();
    const [tempName, setTempName] = useState(userName);
    const [tempPhoto, setTempPhoto] = useState(userPhoto);
    const [photoFile, setPhotoFile] = useState(null);
    const [tempWeight, setTempWeight] = useState(userData.weight || '');
    const [tempHeight, setTempHeight] = useState(profileData.height || '');
    const [tempAge, setTempAge] = useState(profileData.age || '');
    const [tempEmail, setTempEmail] = useState(user?.email || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Reset fields when modal opens to ensure data is fresh
    React.useEffect(() => {
        if (isOpen) {
            setTempName(userName);
            setTempPhoto(userPhoto);
            setTempWeight(userData.weight || '');
            setTempHeight(profileData.height || '');
            setTempAge(profileData.age || '');
            setTempEmail(user?.email || '');
            setNewPassword('');
            setConfirmPassword('');
        }
    }, [isOpen, userName, userPhoto, userData, profileData, user]);

    if (!isOpen) return null;

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        const preview = URL.createObjectURL(file);
        setTempPhoto(preview);
    };

    const uploadPhotoIfNeeded = async () => {
        if (!photoFile || !user) return null;
        
        // Sanitize file name and extension
        const fileExt = photoFile.name.split('.').pop() || 'png';
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        console.log('Iniciando upload para:', filePath);

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, photoFile, { 
                upsert: true,
                cacheControl: '3600',
                contentType: photoFile.type
            });

        if (uploadError) {
            console.error('Erro no upload Supabase:', uploadError);
            
            // Tratamento específico para bucket não encontrado
            if (uploadError.message && (
                uploadError.message.includes('Bucket not found') || 
                uploadError.error === 'Bucket not found' ||
                (uploadError.statusCode === '404' && uploadError.message.includes('bucket'))
            )) {
                throw new Error('CONFIGURAÇÃO NECESSÁRIA: O bucket "avatars" não existe no Supabase. Por favor, execute o script SUPABASE_STORAGE_SETUP.sql no painel do seu projeto.');
            }
            
            throw new Error(`Erro no upload: ${uploadError.message}`);
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        
        if (!data || !data.publicUrl) {
            throw new Error('Não foi possível obter a URL pública da imagem.');
        }

        return data.publicUrl;
    };

    const handleSave = async () => {
        setIsSaving(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            let finalPhoto = userPhoto; // Default to current photo

            if (photoFile) {
                // User uploaded a new file
                try {
                    const uploadedUrl = await uploadPhotoIfNeeded();
                    finalPhoto = uploadedUrl;
                } catch (uploadErr) {
                    console.error('Falha detalhada no upload:', uploadErr);
                    throw new Error(`Falha ao enviar imagem: ${uploadErr.message}`);
                }
            } else if (tempPhoto !== userPhoto) {
                // User changed photo (e.g. generated avatar) but didn't upload file
                finalPhoto = tempPhoto;
            }

            // Safety check: never save blob URLs
            if (finalPhoto && typeof finalPhoto === 'string' && finalPhoto.startsWith('blob:')) {
                throw new Error('Erro ao processar imagem. Por favor, tente novamente.');
            }

            setUserName(tempName);
            setUserPhoto(finalPhoto);

            await updateUserData({ weight: tempWeight });
            await updateUserData({ height: tempHeight, age: tempAge });

            const metadataUpdates = {
                name: tempName,
                avatarUrl: finalPhoto,
                weight: tempWeight,
                height: tempHeight,
                age: tempAge
            };
            await supabase.auth.updateUser({ data: metadataUpdates });

            if (tempEmail && tempEmail !== user?.email) {
                await supabase.auth.updateUser({ email: tempEmail });
                setSuccessMsg('Email atualizado. Verifique sua caixa de entrada para confirmar.');
            }

            if (newPassword) {
                if (newPassword !== confirmPassword) {
                    throw new Error('As senhas não coincidem.');
                }
                await supabase.auth.updateUser({ password: newPassword });
            }

            if (!successMsg) setSuccessMsg('Perfil atualizado com sucesso.');
            setIsSaving(false);
            onClose();
        } catch (e) {
            setIsSaving(false);
            setErrorMsg(e.message || 'Erro ao salvar alterações.');
        }
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
                        <div className="w-full">
                            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest block mb-2">Adicionar foto de perfil</label>
                            <input type="file" accept="image/*" onChange={handleFileSelect} className="w-full text-xs" />
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

                        {/* URL Photo Removed as requested */}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-[var(--text-muted)] font-mono uppercase mb-2 block tracking-widest">Peso (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    value={tempWeight}
                                    onChange={e => setTempWeight(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-[var(--text-muted)] font-mono uppercase mb-2 block tracking-widest">Altura (cm)</label>
                                <input
                                    type="number"
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    value={tempHeight}
                                    onChange={e => setTempHeight(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-[var(--text-muted)] font-mono uppercase mb-2 block tracking-widest">Idade</label>
                                <input
                                    type="number"
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    value={tempAge}
                                    onChange={e => setTempAge(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-[var(--text-muted)] font-mono uppercase mb-2 block tracking-widest">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                <input
                                    type="email"
                                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    value={tempEmail}
                                    onChange={e => setTempEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-xs text-[var(--text-muted)] font-mono uppercase mb-2 block tracking-widest">Nova Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                    <input
                                        type="password"
                                        className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-[var(--text-muted)] font-mono uppercase mb-2 block tracking-widest">Confirmar Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                    <input
                                        type="password"
                                        className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm text-center">
                            {errorMsg}
                        </div>
                    )}
                    {successMsg && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-xl text-sm text-center">
                            {successMsg}
                        </div>
                    )}

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
