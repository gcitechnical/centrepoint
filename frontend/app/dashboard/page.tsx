'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { eventsApi, designsApi } from '@/lib/api';
import Link from 'next/link';
import {
    Users,
    Coins,
    AlertTriangle,
    TrendingUp,
    Calendar,
    ArrowRight,
    Zap,
    Heart,
    MapPin,
    Flame,
    Music,
    Globe
} from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        members: 0,
        projects: 0,
        activeCrisis: 0,
    });
    const [recentEvents, setRecentEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [eventsRes] = await Promise.all([
                eventsApi.getAll(),
            ]);

            setStats({
                members: 124,
                projects: 3,
                activeCrisis: 2,
            });

            setRecentEvents(eventsRes.data.data.slice(0, 5));
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-10 flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-indigo-900 border-t-amber-400 rounded-full animate-spin" />
                    <p className="font-black uppercase tracking-[0.3em] text-indigo-900 animate-pulse">Entering Sanctuary...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* 1. Header & Quick Alert */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                        Welcome, <span className="text-indigo-900">{user?.first_name}</span>!
                    </h1>
                    <p className="text-slate-500 font-bold italic mt-2 text-lg">"Your light is a lamp to the community."</p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition active:scale-95 flex items-center gap-3">
                        <Flame className="h-4 w-4 text-amber-400" />
                        Mobilize Team
                    </button>
                    <Link href="/dashboard/outreach/crisis" className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-rose-700 transition flex items-center gap-3">
                        <AlertTriangle className="h-4 w-4" />
                        Emergency Alert
                    </Link>
                </div>
            </div>

            {/* 2. The 5 Pillars Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Membership Pillar */}
                <div className="church-card p-8 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                        <Users className="h-24 w-24" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Community Growth</p>
                        <h3 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">{stats.members}</h3>
                        <div className="mt-auto">
                            <p className="text-sm font-bold text-indigo-600 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" /> 12 New Households this month
                            </p>
                        </div>
                    </div>
                </div>

                {/* Finance Pillar */}
                <div className="church-card p-8 group bg-indigo-900 text-white">
                    <div className="flex flex-col h-full">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 mb-2">Divine Stewardship</p>
                        <h3 className="text-5xl font-black text-white mb-4 tracking-tighter">{stats.projects}</h3>
                        <p className="text-sm font-bold text-amber-400 mb-6 uppercase tracking-widest">Active Harambees</p>
                        <Link href="/dashboard/finance" className="mt-auto flex items-center justify-between font-black uppercase text-[10px] tracking-widest hover:gap-4 transition-all">
                            View Giving Progress <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                {/* Outreach Pillar */}
                <div className="church-card p-8 bg-amber-50 group border-amber-200">
                    <div className="flex flex-col h-full">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-2">Community Alerts</p>
                        <h3 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">{stats.activeCrisis}</h3>
                        <div className="flex items-center gap-2 mt-auto">
                            <div className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                            <p className="text-xs font-black uppercase text-rose-600 tracking-widest">Needs Triage Required</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Community Pulse (Integration of Pillars) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Spiritual & Worship (Pillar 3 & 4) */}
                <div className="space-y-8">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                        <Zap className="h-4 w-4 text-amber-500" /> Spiritual Pulse
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Link href="/dashboard/worship" className="church-card p-6 flex items-center gap-5 hover:border-indigo-500">
                            <div className="p-4 bg-indigo-50 rounded-2xl">
                                <Music className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Hybrid Worship</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 italic">Hymnbook & Live</p>
                            </div>
                        </Link>

                        <Link href="/dashboard/spiritual" className="church-card p-6 flex items-center gap-5 hover:border-amber-500">
                            <div className="p-4 bg-amber-50 rounded-2xl">
                                <Heart className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Prayer Wall</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 italic">Shared Intercession</p>
                            </div>
                        </Link>
                    </div>

                    <div className="church-card p-8 bg-slate-900 text-white flex items-center justify-between">
                        <div className="space-y-2">
                            <h4 className="text-xl font-black uppercase tracking-tighter">Mission Intelligence Map</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Chart our community impact</p>
                        </div>
                        <Link href="/dashboard/outreach" className="p-5 bg-white text-slate-900 rounded-2xl shadow-xl hover:scale-110 transition">
                            <Globe className="h-6 w-6" />
                        </Link>
                    </div>
                </div>

                {/* Events & Calendar (Operational) */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-indigo-500" /> Upcoming Gatherings
                        </h2>
                        <Link href="/dashboard/events" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">View Calendar</Link>
                    </div>

                    <div className="space-y-4">
                        {recentEvents.length === 0 ? (
                            <div className="p-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">No events scheduled for the sanctuary.</p>
                            </div>
                        ) : (
                            recentEvents.map((event: any) => (
                                <div key={event.id} className="church-card p-6 flex items-center justify-between group">
                                    <div className="flex items-center gap-6">
                                        <div className="text-center min-w-[60px] p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                                            <p className="text-[10px] font-black uppercase tracking-tighter">{new Date(event.start_datetime).toLocaleDateString('en-US', { month: 'short' })}</p>
                                            <p className="text-2xl font-black">{new Date(event.start_datetime).getDate()}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{event.title}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" /> {event.venue_name || 'Main Hall'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-slate-200 group-hover:text-amber-400 group-hover:translate-x-2 transition-all" />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
