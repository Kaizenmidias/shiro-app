'use client';

import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2, Eye, Calendar, Mail } from 'lucide-react';

export const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load users from localStorage
        // In a real app, this would be an API call
        const mockUsers = [
            {
                id: 1,
                name: 'Lucas',
                email: 'lucas@example.com',
                createdAt: '2026-01-15',
                lastAccess: '2026-02-08',
                status: 'active',
                plan: 'Premium'
            },
            {
                id: 2,
                name: 'Maria Silva',
                email: 'maria@example.com',
                createdAt: '2026-01-20',
                lastAccess: '2026-02-07',
                status: 'active',
                plan: 'Free'
            },
            {
                id: 3,
                name: 'João Santos',
                email: 'joao@example.com',
                createdAt: '2025-12-10',
                lastAccess: '2026-01-30',
                status: 'inactive',
                plan: 'Premium'
            }
        ];
        setUsers(mockUsers);
        setMounted(true);
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white mb-1">Gestão de Usuários</h1>
                    <p className="text-sm text-[var(--text-muted)]">{users.length} usuários cadastrados</p>
                </div>
                <button className="glass-panel px-4 py-3 border-[var(--primary)] hover:bg-[var(--primary)] hover:text-black transition-all flex items-center gap-2 font-bold text-sm">
                    <UserPlus size={18} />
                    Adicionar Usuário
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input
                    type="text"
                    placeholder="BUSCAR USUÁRIO POR NOME OU EMAIL..."
                    className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--primary)] font-mono text-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Users Table */}
            <div className="glass-panel overflow-hidden">
                <div className="bg-[var(--surface-highlight)] p-4 grid grid-cols-12 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    <span className="col-span-3">Usuário</span>
                    <span className="col-span-2">Plano</span>
                    <span className="col-span-2">Cadastro</span>
                    <span className="col-span-2">Último Acesso</span>
                    <span className="col-span-2">Status</span>
                    <span className="col-span-1 text-right">Ações</span>
                </div>
                <div className="divide-y divide-[var(--glass-border)]">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="p-4 grid grid-cols-12 items-center text-sm group hover:bg-white/5 transition-colors">
                            <div className="col-span-3">
                                <p className="font-bold text-white">{user.name}</p>
                                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1">
                                    <Mail size={12} />
                                    {user.email}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <span className={`text-xs font-mono px-2 py-1 rounded border ${user.plan === 'Premium'
                                        ? 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/20'
                                        : 'text-[var(--text-muted)] bg-white/5 border-white/10'
                                    }`}>
                                    {user.plan}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-[var(--text-muted)]">
                                    {new Date(user.lastAccess).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <span className={`text-xs font-mono px-2 py-1 rounded border ${user.status === 'active'
                                        ? 'text-[#00ffaa] bg-[#00ffaa]/10 border-[#00ffaa]/20'
                                        : 'text-rose-400 bg-rose-400/10 border-rose-400/20'
                                    }`}>
                                    {user.status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            <div className="col-span-1 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-[var(--primary)] hover:bg-[var(--primary)]/10 p-2 rounded-lg transition-colors" title="Visualizar">
                                    <Eye size={16} />
                                </button>
                                <button className="text-[#ffcc00] hover:bg-[#ffcc00]/10 p-2 rounded-lg transition-colors" title="Editar">
                                    <Edit size={16} />
                                </button>
                                <button className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-colors" title="Excluir">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
