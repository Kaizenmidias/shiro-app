'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'lifeos_agenda';

export const useAgenda = () => {
    const [events, setEvents] = useState([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setEvents(JSON.parse(saved));
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        }
    }, [events, mounted]);

    const addEvent = (event) => {
        setEvents([...events, { ...event, id: Date.now().toString() }]);
    };

    const removeEvent = (id) => {
        setEvents(events.filter(e => e.id !== id));
    };

    const getEventsForDay = (day, month, year) => {
        return events.filter(e => {
            const date = new Date(e.date);
            return date.getDate() === day && date.getMonth() === month && date.getFullYear() === year;
        });
    };

    return {
        events,
        addEvent,
        removeEvent,
        getEventsForDay,
        mounted
    };
};
