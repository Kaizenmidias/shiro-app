'use client';

import React, { useState } from 'react';
import { useHealth } from '../../hooks/useHealth';
import { Search, Plus, Trash2, Edit, Save, X, Video, ExternalLink } from 'lucide-react';

export const WorkoutManagement = () => {
    const { allExercises = [], addExercise, removeExercise } = useHealth();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newExercise, setNewExercise] = useState({
        name: '',
        category: 'Peito',
        difficulty: 'Intermediário',
        description: '',
        videoUrl: ''
    });

    const categories = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Cardio'];
    const difficulties = ['Iniciante', 'Intermediário', 'Avançado'];

    const filteredExercises = allExercises.filter(ex =>
        ex.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddExercise = (e) => {
        e.preventDefault();
        if (addExercise) {
            addExercise(newExercise);
        }
        setNewExercise({ name: '', category: 'Peito', difficulty: 'Intermediário', description: '', videoUrl: '' });
        setIsAdding(false);
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white mb-1">Gestão de Treino</h1>
                    <p className="text-sm text-[var(--text-muted)]">{allExercises.length} exercícios cadastrados</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="glass-panel px-4 py-3 border-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all flex items-center gap-2 font-bold text-sm"
                >
                    {isAdding ? <X size={18} /> : <Plus size={18} />}
                    {isAdding ? 'Cancelar' : 'Novo Exercício'}
                </button>
            </div>

            {/* Add Exercise Form */}
            {isAdding && (
                <form onSubmit={handleAddExercise} className="glass-panel p-6 border-[var(--accent)] animate-fade-in">
                    <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Plus className="text-[var(--accent)]" size={18} /> Cadastrar Novo Exercício
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-[var(--text-muted)] uppercase mb-2 block">Nome do Exercício</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-[var(--bg-color)] border border-[var(--glass-border)] rounded-lg p-3 text-sm text-white focus:border-[var(--accent)] outline-none"
                                placeholder="Ex: Supino Reto"
                                value={newExercise.name}
                                onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-[var(--text-muted)] uppercase mb-2 block">Categoria</label>
                            <select
                                className="w-full bg-[var(--bg-color)] border border-[var(--glass-border)] rounded-lg p-3 text-sm text-white focus:border-[var(--accent)] outline-none"
                                value={newExercise.category}
                                onChange={e => setNewExercise({ ...newExercise, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-[var(--text-muted)] uppercase mb-2 block">Dificuldade</label>
                            <select
                                className="w-full bg-[var(--bg-color)] border border-[var(--glass-border)] rounded-lg p-3 text-sm text-white focus:border-[var(--accent)] outline-none"
                                value={newExercise.difficulty}
                                onChange={e => setNewExercise({ ...newExercise, difficulty: e.target.value })}
                            >
                                {difficulties.map(diff => (
                                    <option key={diff} value={diff}>{diff}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-[var(--text-muted)] uppercase mb-2 block flex items-center gap-2">
                                <Video size={12} /> URL do Vídeo (YouTube)
                            </label>
                            <input
                                type="url"
                                className="w-full bg-[var(--bg-color)] border border-[var(--glass-border)] rounded-lg p-3 text-sm text-white focus:border-[var(--accent)] outline-none"
                                placeholder="https://youtube.com/watch?v=..."
                                value={newExercise.videoUrl}
                                onChange={e => setNewExercise({ ...newExercise, videoUrl: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] text-[var(--text-muted)] uppercase mb-2 block">Descrição / Instruções</label>
                            <textarea
                                rows={3}
                                className="w-full bg-[var(--bg-color)] border border-[var(--glass-border)] rounded-lg p-3 text-sm text-white focus:border-[var(--accent)] outline-none resize-none"
                                placeholder="Descreva como executar o exercício..."
                                value={newExercise.description}
                                onChange={e => setNewExercise({ ...newExercise, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[var(--accent)] hover:bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest transition-all mt-4"
                    >
                        <Save size={18} className="inline mr-2" />
                        Salvar Exercício
                    </button>
                </form>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input
                    type="text"
                    placeholder="BUSCAR EXERCÍCIO..."
                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--accent)] font-mono text-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Exercises Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExercises.length > 0 ? (
                    filteredExercises.map((exercise, idx) => {
                        const embedUrl = getYouTubeEmbedUrl(exercise.videoUrl);
                        return (
                            <div key={idx} className="glass-panel p-4 group hover:border-[var(--accent)]/40 transition-all">
                                {/* Video Preview */}
                                {embedUrl ? (
                                    <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-black">
                                        <iframe
                                            src={embedUrl}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-[var(--surface-color)] flex items-center justify-center border border-[var(--glass-border)]">
                                        <Video size={32} className="text-[var(--text-muted)]" />
                                    </div>
                                )}

                                {/* Exercise Info */}
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-bold text-white text-sm">{exercise.name}</h3>
                                        <button
                                            onClick={() => removeExercise && removeExercise(exercise.id)}
                                            className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-[10px] font-mono px-2 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                                            {exercise.category}
                                        </span>
                                        <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 text-[var(--text-muted)] border border-white/10">
                                            {exercise.difficulty}
                                        </span>
                                    </div>
                                    {exercise.description && (
                                        <p className="text-xs text-[var(--text-muted)] line-clamp-2">{exercise.description}</p>
                                    )}
                                    {exercise.videoUrl && (
                                        <a
                                            href={exercise.videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1 mt-2"
                                        >
                                            <ExternalLink size={12} />
                                            Ver no YouTube
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full glass-panel p-12 text-center border-dashed border-2">
                        <Video className="mx-auto mb-4 text-[var(--text-muted)]" size={48} />
                        <p className="text-sm text-[var(--text-muted)]">Nenhum exercício cadastrado ainda</p>
                    </div>
                )}
            </div>
        </div>
    );
};
