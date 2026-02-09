'use client';

import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImgBlob } from '../lib/cropImage';
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
    const [tempBirthDate, setTempBirthDate] = useState(user?.user_metadata?.birthDate || '');
    const [tempEmail, setTempEmail] = useState(user?.email || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Crop State
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropping, setIsCropping] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState(null);

    // Reset fields when modal opens to ensure data is fresh
    React.useEffect(() => {
        if (isOpen) {
            setTempName(userName);
            setTempPhoto(userPhoto);
            setTempWeight(userData.weight || '');
            setTempHeight(profileData.height || '');
            // Initial age set, will be recalculated if birthDate is present
            setTempAge(profileData.age || '');
            setTempBirthDate(user?.user_metadata?.birthDate || '');
            setTempEmail(user?.email || '');
            setNewPassword('');
            setConfirmPassword('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Calculate age from birthdate
    React.useEffect(() => {
        if (tempBirthDate) {
            const birth = new Date(tempBirthDate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            setTempAge(age);
        }
    }, [tempBirthDate]);

    if (!isOpen) return null;

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation: File size (limit to 5MB before crop)
        if (file.size > 5 * 1024 * 1024) {
             setErrorMsg('O arquivo é muito grande. O limite máximo é 5MB.');
             return;
        }

        // Validation: File type
        if (!file.type.startsWith('image/')) {
            setErrorMsg('Por favor, selecione apenas arquivos de imagem.');
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setCropImageSrc(reader.result?.toString() || '');
            setIsCropping(true);
            setZoom(1);
            setCrop({ x: 0, y: 0 });
        });
        reader.readAsDataURL(file);
        
        // Clear input value so same file can be selected again if needed
        e.target.value = '';
    };

    const handleCropConfirm = async () => {
        try {
            const blob = await getCroppedImgBlob(cropImageSrc, croppedAreaPixels);
            if (!blob) {
                console.error('Falha ao criar blob da imagem cortada');
                return;
            }
            
            // Create a File object from the blob (optional, but keeps consistency with photoFile state)
            const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
            
            setPhotoFile(file);
            setTempPhoto(URL.createObjectURL(blob));
            setIsCropping(false);
            setCropImageSrc(null);
        } catch (e) {
            console.error('Erro ao cortar imagem:', e);
            setErrorMsg('Erro ao processar o corte da imagem.');
        }
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setCropImageSrc(null);
    };

    const uploadPhotoIfNeeded = async () => {
        if (!photoFile || !user) return null;

        // 1. Validation: File size (limit to 2MB)
        if (photoFile.size > 2 * 1024 * 1024) {
            throw new Error('O arquivo é muito grande. O limite máximo é 2MB.');
        }

        // 2. Validation: File type
        if (!photoFile.type.startsWith('image/')) {
            throw new Error('Por favor, selecione apenas arquivos de imagem.');
        }
        
        // Sanitize file name and extension
        const fileExt = photoFile.name.split('.').pop() || 'png';
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        // Remove 'avatars/' prefix since we are already in the 'avatars' bucket
        const filePath = fileName;

        console.log('Iniciando upload para:', filePath);

        // 3. Pre-check: List files to verify bucket access (Optional but helpful for debug)
        const { error: listError } = await supabase.storage.from('avatars').list();
        if (listError) {
             console.error('Erro de acesso ao bucket:', listError);
             throw new Error('Não foi possível acessar o armazenamento. Verifique se as políticas de segurança foram aplicadas.');
        }

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

        // 4. Verification: Check if the URL is actually reachable
        try {
            const checkResponse = await fetch(data.publicUrl, { method: 'HEAD' });
            if (!checkResponse.ok) {
                 console.warn('URL gerada não está acessível:', data.publicUrl, checkResponse.status);
                 // We won't throw here immediately as it might take a moment to propagate, 
                 // but we'll log it. 
            }
        } catch (fetchErr) {
            console.warn('Erro ao verificar URL:', fetchErr);
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
                age: tempAge,
                birthDate: tempBirthDate
            };
            const { data: updateData, error: updateError } = await supabase.auth.updateUser({ data: metadataUpdates });
            
            if (updateError) {
                console.error('Erro ao atualizar metadata do usuário:', updateError);
                // We won't block the UI if the photo upload worked but metadata sync failed
                // But we should warn the user.
                throw new Error(`Aviso: Foto salva, mas houve erro ao atualizar dados da conta: ${updateError.message}`);
            }

            // Force refresh session to ensure metadata is up to date
            await supabase.auth.refreshSession();

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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] overflow-y-auto animate-fade-in">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="glass-panel w-full max-w-md p-6 md:p-8 relative border-[var(--primary)] shadow-[0_0_50px_rgba(0,243,255,0.1)] my-4">
                    {/* Header */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors z-10"
                    >
                        <X size={24} />
                    </button>

                {isCropping ? (
                    <div className="flex flex-col h-full w-full animate-fade-in">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Camera size={20} className="text-[var(--primary)]" />
                            Ajustar Foto
                        </h3>
                        
                        <div className="relative w-full h-[300px] bg-black/50 rounded-xl overflow-hidden mb-6 border border-[var(--glass-border)]">
                            <Cropper
                                image={cropImageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape="round"
                                showGrid={false}
                            />
                        </div>

                        <div className="mb-8">
                            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest block mb-2 flex justify-between">
                                <span>Zoom</span>
                                <span>{zoom}x</span>
                            </label>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(e.target.value)}
                                className="w-full accent-[var(--primary)] h-1 bg-[var(--glass-border)] rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="flex gap-4 mt-auto">
                            <button
                                onClick={handleCropCancel}
                                className="flex-1 py-3 rounded-xl border border-[var(--glass-border)] text-[var(--text-muted)] hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCropConfirm}
                                className="flex-1 py-3 rounded-xl bg-[var(--primary)] text-black font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,243,255,0.2)] hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] transition-all"
                            >
                                Confirmar Corte
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
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
                                <div className="w-full">
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

                                {/* Flex container for Weight and Height - Side by Side (50% each) */}
                                <div className="flex gap-4 w-full">
                                    <div className="flex-1">
                                        <label className="text-xs text-[var(--text-muted)] font-mono uppercase mb-2 block tracking-widest">Peso (kg)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                            value={tempWeight}
                                            onChange={e => setTempWeight(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-[var(--text-muted)] font-mono uppercase mb-2 block tracking-widest">Altura (cm)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                            value={tempHeight}
                                            onChange={e => setTempHeight(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Date of Birth - Full Width */}
                                <div className="w-full">
                                    <label className="text-xs text-[var(--text-muted)] font-mono uppercase mb-2 block tracking-widest">Data de Nascimento</label>
                                    <input
                                        type="date"
                                        className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all [color-scheme:dark]"
                                        value={tempBirthDate}
                                        onChange={e => setTempBirthDate(e.target.value)}
                                    />
                                    {tempAge && (
                                        <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wider text-right">
                                            Idade Calculada: <span className="text-[var(--primary)]">{tempAge} anos</span>
                                        </p>
                                    )}
                                </div>

                                <div className="w-full">
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

                                {/* Passwords - Stacked (Full Width) */}
                                <div className="space-y-4">
                                    <div className="w-full">
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
                                    <div className="w-full">
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
                                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-xs">
                                    {errorMsg}
                                </div>
                            )}

                            {successMsg && (
                                <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-200 text-xs">
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
                    </>
                )}
                </div>
            </div>
        </div>
    );
};
