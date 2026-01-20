'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CreditCard, History, Target, ArrowUpRight, CheckCircle2, Loader2, Smartphone } from 'lucide-react';

export default function FinancePage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [givingAmount, setGivingAmount] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedType, setSelectedType] = useState('tithe');
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [projRes, histRes] = await Promise.all([
                api.finance.projects(),
                api.finance.history(),
            ]);
            setProjects(projRes.data.data || []);
            setHistory(histRes.data.data || []);
        } catch (error) {
            console.error('Failed to load financial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGive = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!givingAmount || !phoneNumber) return;

        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            await api.finance.give({
                amount: parseFloat(givingAmount),
                phone: phoneNumber,
                type: selectedType,
                project_id: selectedProject || undefined,
            });
            setMessage({ type: 'success', text: 'STK Push sent! Please check your phone to complete the payment.' });
            setGivingAmount('');
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to initiate payment. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">Financial Ecosystem</h1>
                    <p className="text-indigo-200 font-bold italic mt-4 text-lg">Transparent stewardship for the digital-first church.</p>
                </div>
                <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl transform rotate-12">💰</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Giving Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 md:p-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Express Giving</h2>
                        </div>

                        <form onSubmit={handleGive} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Contribution Type</label>
                                <select
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-indigo-500 transition"
                                    value={selectedType}
                                    onChange={(e) => {
                                        setSelectedType(e.target.value);
                                        if (e.target.value !== 'project') setSelectedProject(null);
                                    }}
                                >
                                    <option value="tithe">Tithe</option>
                                    <option value="offering">General Offering</option>
                                    <option value="thanksgiving">Thanksgiving</option>
                                    <option value="project">Project / Harambee</option>
                                </select>
                            </div>

                            {selectedType === 'project' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Select Project</label>
                                    <select
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-indigo-500 transition"
                                        value={selectedProject || ''}
                                        onChange={(e) => setSelectedProject(e.target.value)}
                                        required
                                    >
                                        <option value="">Choose Project...</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Amount (Ksh)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 1000"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black text-2xl text-slate-900 outline-none focus:border-indigo-500 transition"
                                    value={givingAmount}
                                    onChange={(e) => setGivingAmount(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">M-Pesa Number</label>
                                <input
                                    type="tel"
                                    placeholder="2547XXXXXXXX"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 outline-none focus:border-indigo-500 transition"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                />
                            </div>

                            {message.text && (
                                <div className={`p-4 rounded-2xl text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                    {message.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-indigo-600 text-white rounded-2xl p-5 font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Give Now via M-Pesa'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Harambee Progress */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 md:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl">🏗️</div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Harambees</h2>
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{projects.length} Ongoing</span>
                        </div>

                        <div className="space-y-6">
                            {projects.map(project => (
                                <div key={project.id} className="group p-6 rounded-2xl border-2 border-slate-50 hover:border-indigo-100 transition">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition">{project.name}</h3>
                                            <p className="text-xs text-slate-500 font-bold mt-1 line-clamp-1">{project.description}</p>
                                        </div>
                                        {project.is_emergency && <span className="text-[10px] font-black uppercase px-2 py-1 bg-red-100 text-red-600 rounded-full">Urgent</span>}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-black uppercase tracking-tight">
                                            <span className="text-slate-400">Progress</span>
                                            <span className="text-indigo-600">{Math.round((project.current_amount / project.target_amount) * 100)}%</span>
                                        </div>
                                        <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all duration-1000"
                                                style={{ width: `${(project.current_amount / project.target_amount) * 100}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2 text-[10px] font-black uppercase tracking-tighter text-slate-400">
                                            <span>Raised: Ksh {Number(project.current_amount).toLocaleString()}</span>
                                            <span>Target: Ksh {Number(project.target_amount).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 md:p-8">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 font-bold text-xl leading-none">📜</div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Contributions</h2>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {history.length === 0 ? (
                                <p className="py-8 text-center text-slate-400 font-bold italic">No contribution history yet.</p>
                            ) : (
                                history.map(item => (
                                    <div key={item.id} className="py-5 flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                                                <ArrowUpRight className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 capitalize">{item.type}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {item.provider}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-900">Ksh {Number(item.amount).toLocaleString()}</p>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                <span className="text-[10px] font-black uppercase text-green-600 tracking-widest">Confirmed</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
