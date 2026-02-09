'use client';

import React, { useState } from 'react';
import { useAgenda } from '../../hooks/useAgenda';
import { ChevronLeft, ChevronRight, Plus, Trash2, Clock, MapPin } from 'lucide-react';
import { TimeInput } from '../ui/TimeInput';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export const CalendarView = () => {
    const { getEventsForDay, addEvent, removeEvent, mounted } = useAgenda();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', time: '', location: '', description: '' });

    if (!mounted) return null;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleDayClick = (day) => {
        setSelectedDate(new Date(year, month, day));
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newEvent.title) return;

        addEvent({
            ...newEvent,
            date: selectedDate.toISOString()
        });

        setNewEvent({ title: '', time: '', location: '', description: '' });
        setIsModalOpen(false);
    };

    const selectedEvents = getEventsForDay(selectedDate.getDate(), selectedDate.getMonth(), selectedDate.getFullYear()).sort((a, b) => a.time.localeCompare(b.time));

    return (
        <div className="pb-24 animate-fade-in flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">

            {/* Calendar Grid */}
            <div className="flex-1 glass-panel p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                        {MONTHS[month]} <span className="text-[var(--primary)]">{year}</span>
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-[var(--surface-highlight)] rounded-lg transition-colors text-[var(--text-muted)] hover:text-white">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-[var(--surface-highlight)] rounded-lg transition-colors text-[var(--text-muted)] hover:text-white">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 mb-4">
                    {DAYS.map(day => (
                        <div key={day} className="text-center text-xs font-bold text-[var(--text-muted)] uppercase py-2">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-2 flex-1 auto-rows-fr">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
                        const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                        const hasEvents = getEventsForDay(day, month, year).length > 0;

                        return (
                            <button
                                key={day}
                                onClick={() => handleDayClick(day)}
                                className={`relative rounded-xl flex flex-col items-center justify-center transition-all ${isSelected
                                        ? 'bg-[var(--primary)] text-black shadow-[0_0_15px_var(--primary-glow)] font-bold'
                                        : 'hover:bg-[var(--surface-highlight)] text-white'
                                    } ${isToday && !isSelected ? 'border border-[var(--primary)] text-[var(--primary)]' : ''}`}
                            >
                                <span className="text-xs md:text-sm">{day}</span>
                                {hasEvents && (
                                    <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full mt-1 ${isSelected ? 'bg-black' : 'bg-[var(--primary)]'}`} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Day Details */}
            <div className="w-full md:w-80 glass-panel p-6 flex flex-col border-[var(--glass-border)]">
                <div className="mb-6 pb-6 border-b border-[var(--glass-border)]">
                    <h3 className="text-3xl font-bold text-white mb-1">{selectedDate.getDate()}</h3>
                    <p className="text-[var(--text-muted)] uppercase tracking-widest text-xs font-bold">
                        {DAYS[selectedDate.getDay()]}, {MONTHS[selectedDate.getMonth()]}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-none">
                    {selectedEvents.length === 0 ? (
                        <p className="text-[var(--text-muted)] text-sm text-center py-10 opacity-60">
                            Nada agendado
                        </p>
                    ) : (
                        selectedEvents.map(event => (
                            <div key={event.id} className="bg-[var(--surface-color)] p-3 rounded-lg border border-[var(--glass-border)] group hover:border-[var(--primary)] transition-all">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-white text-sm">{event.title}</h4>
                                    <button onClick={() => removeEvent(event.id)} className="text-[var(--text-muted)] hover:text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                {event.time && (
                                    <div className="flex items-center gap-2 text-xs text-[var(--primary)] font-mono mb-1">
                                        <Clock size={10} />
                                        {event.time}
                                    </div>
                                )}
                                {event.location && (
                                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                        <MapPin size={10} />
                                        {event.location}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-3 rounded-lg bg-[var(--surface-highlight)] hover:bg-[var(--primary)] hover:text-black text-white font-bold text-sm transition-all flex items-center justify-center gap-2 border border-[var(--glass-border)] hover:border-transparent"
                >
                    <Plus size={16} />
                    Adicionar Evento
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-md p-6 border-[var(--primary)] animate-fade-in">
                        <h3 className="text-xl font-bold mb-6 text-white">Novo Evento</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Título"
                                className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-3 text-white focus:outline-none focus:border-[var(--primary)]"
                                value={newEvent.title}
                                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                autoFocus
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <TimeInput
                                    className="bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-3 text-white focus:outline-none focus:border-[var(--primary)]"
                                    value={newEvent.time}
                                    onChange={val => setNewEvent({ ...newEvent, time: val })}
                                />
                                <input
                                    type="text"
                                    placeholder="Local (Opcional)"
                                    className="bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-3 text-white focus:outline-none focus:border-[var(--primary)]"
                                    value={newEvent.location}
                                    onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                />
                            </div>
                            <textarea
                                placeholder="Descrição / Notas"
                                className="w-full bg-[var(--surface-color)] border border-[var(--glass-border)] rounded-lg p-3 text-white focus:outline-none focus:border-[var(--primary)] resize-none h-24"
                                value={newEvent.description}
                                onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                            />

                            <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--glass-border)]">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-highlight)] transition-colors text-sm font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-lg bg-[var(--primary)] text-black font-bold text-sm shadow-[0_0_15px_var(--primary-glow)] hover:shadow-[0_0_25px_var(--primary-glow)] transition-all"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
