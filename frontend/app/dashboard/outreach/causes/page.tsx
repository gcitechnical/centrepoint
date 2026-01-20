'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Target, TrendingUp, Plus, Eye, History, AlertCircle, CheckCircle2, Loader2, ArrowRight, Share2, Wallet } from 'lucide-react';

export default function SupportACauseManager() {
    const [causes, setCauses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalRaised: 0, activeCauses: 0 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Mocking active fundraising causes
            setCauses([
                { id: '1', name: 'Sanctuary Expansion', description: 'Expanding our main sanctuary to accommodate the growing congregation (Target: 5M).', target_amount: 5000000, current_amount: 2850000, end_date: '2025-12-31', is_emergency: false },
                { id: '2', name: 'Education Fund: Orphan Support', description: 'Annual school fees for 20 students in our community program.', target_amount: 250000, current_amount: 195000, end_date: '2025-02-10', is_emergency: true },
                { id: '3', name: 'Village Borehole Project', description: 'Clean water initiative for the outlying mission fields.', target_amount: 1200000, current_amount: 450000, end_date: '2025-06-15', is_emergency: false },
            ]);
            setStats({ totalRaised: 3495000, activeCauses: 3 });
            setLoading(false);
        } catch (error) {
            console.error('Failed to load causes:', error);
        }
    };

    if (loading) return <div className="p-10 font-bold uppercase text-indigo-600 animate-pulse">Calculating Community Impact...</div>;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header with Stats */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 mb-6">
                            <Wallet className="h-4 w-4 text-emerald-400" />
                            <span className="text-xs font-black uppercase tracking-widest">Support a Cause</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4">Harambee Orchestrator</h1>
                        <p className="text-indigo-200 font-bold italic text-lg max-w-md">"Generosity is the engine of the Extended Family."</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">Total Raised</p>
                            <p className="text-2xl font-black">Ksh {stats.totalRaised.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">Active Causes</p>
                            <p className="text-2xl font-black">{stats.activeCauses}</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-16 opacity-10 text-9xl transform rotate-12">🤲</div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4">
                <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:scale-105 transition flex items-center gap-3">
                    <Plus className="h-4 w-4" /> Start New Cause
                </button>
                <button className="bg-white text-slate-900 border-2 border-slate-100 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:border-indigo-100 transition flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-amber-500" /> From Community Alert
                </button>
            </div>

            {/* Causes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {causes.map(cause => (
                    <div key={cause.id} className="group bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 hover:border-indigo-200 transition-all duration-300 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl font-black text-xl flex items-center justify-center ${cause.is_emergency ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                {cause.is_emergency ? '🚨' : '🏗️'}
                            </div>
                            <button className="text-slate-300 hover:text-indigo-600 transition">
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2 group-hover:text-indigo-600 transition">{cause.name}</h3>
                        <p className="text-slate-500 text-sm font-bold italic mb-8 flex-1">"{cause.description}"</p>

                        <div className="space-y-4">
                            <div className="flex justify-between text-xs font-black uppercase text-slate-400">
                                <span>Progress</span>
                                <span className="text-indigo-600">{Math.round((cause.current_amount / cause.target_amount) * 100)}%</span>
                            </div>
                            <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-1000 shadow-sm"
                                    style={{ width: `${(cause.current_amount / cause.target_amount) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-slate-400">
                                <span>Ksh {cause.current_amount.toLocaleString()} Raised</span>
                                <span>Ksh {cause.target_amount.toLocaleString()} Goal</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <History className="h-4 w-4 text-slate-300" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Ends {new Date(cause.end_date).toLocaleDateString()}</span>
                            </div>
                            <button className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-600 hover:translate-x-1 transition">
                                Manage Cause <ChevronRight className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Impact Quote */}
            <div className="bg-slate-900 text-white rounded-[3rem] p-12 text-center relative overflow-hidden">
                <div className="relative z-10 max-w-2xl mx-auto">
                    <TrendingUp className="h-12 w-12 text-emerald-400 mx-auto mb-6" />
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Measuring the Blessing</h2>
                    <p className="text-slate-400 font-bold italic">"For where your treasure is, there your heart will be also."
                        Your fundraisers have impacted 2,400 lives this quarter across 5 mission fields.</p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-blue-500" />
            </div>
        </div>
    );
}
