'use client';
import { redirect } from 'next/navigation';

export default function HealthIndex() {
    redirect('/health/body');
}
