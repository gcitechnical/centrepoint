'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AlertTriangle, Users, Phone, Search, ShieldCheck, MapPin, Send, Loader2, CheckCircle, ChevronRight, UserPlus, X } from 'lucide-react';

export default function CrisisCommandCentre() {
    const [crises, setCrises] = useState<any[]>([]);
    const [selectedCrisis, setSelectedCrisis] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [assignedMembers, setAssignedMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        loadCrises();
    }, []);

    const loadCrises = async () => {
        try {
            // Mocking active crises for the community dashboard
            setCrises([
                { id: '1', category: 'medical', risk_level: 'critical', description: 'Member Jane Doe (Syokimau) - Urgent surgery needed, looking for medical guidance.', reporter: { first_name: 'David' }, created_at: new Date() },
                { id: '2', category: 'bereavement', risk_level: 'high', description: 'The Kamau Family - Loss of patriarch. Need welfare and counseling support.', reporter: { first_name: 'Sarah' }, created_at: new Date() },
            ]);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load crises:', error);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;
        setSearching(true);
        // Mocking member database search by skill/profession
        setTimeout(() => {
            setSearchResults([
                { id: 'm1', first_name: 'Dr. Alice', last_name: 'Musa', profession: 'Medical Doctor', skills: ['Surgery', 'Emergency'], phone: '0711222333' },
                { id: 'm2', first_name: 'Grace', last_name: 'Annan', profession: 'Nurse', skills: ['Triage', 'Care'], phone: '0722333444' },
                { id: 'm3', first_name: 'John', last_name: 'Mulei', profession: 'Counselor', skills: ['Grief', 'Family'], phone: '0733444555' },
            ].filter(m =>
                m.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
            ));
            setSearching(false);
        }, 600);
    };

    const assignMember = (member: any) => {
        if (!assignedMembers.find(m => m.id === member.id)) {
            setAssignedMembers([...assignedMembers, member]);
        }
    };

    const removeMember = (memberId: string) => {
        setAssignedMembers(assignedMembers.filter(m => m.id !== memberId));
    };

    if (loading) return <div className="p-10 font-bold uppercase text-red-600 animate-pulse">Scanning Community Pulse...</div>;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-8 p-4 md:p-8 overflow-hidden">
            {/* Command Centre Header */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">Crisis Triage Station</h1>
                    <p className="text-red-100 font-bold italic mt-4 text-lg">Manual Resource Mobilization & Member Matching.</p>
                </div>
                <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl transform rotate-12">🆘</div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
                {/* Active Alerts List */}
                <div className="space-y-6 overflow-y-auto pr-2 pb-10">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 pl-4">Incoming Community Alerts</h2>

                    {crises.map(crisis => (
                        <div
                            key={crisis.id}
                            onClick={() => {
                                setSelectedCrisis(crisis);
                                setAssignedMembers([]);
                                setSearchResults([]);
                            }}
                            className={`group cursor-pointer bg-white rounded-[2rem] p-6 border-2 transition-all duration-300 ${selectedCrisis?.id === crisis.id ? 'border-red-600 shadow-2xl scale-[1.02]' : 'border-slate-100 shadow-md hover:border-red-200'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest ${crisis.risk_level === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
                                    {crisis.risk_level} Priority
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(crisis.created_at).toLocaleTimeString()}</span>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-red-600 transition capitalize mb-2">{crisis.category} Intervention</h3>
                            <p className="text-slate-600 font-bold italic leading-relaxed text-sm mb-6 line-clamp-2">"{crisis.description}"</p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
                                    <MapPin className="h-4 w-4" /> <span>Reported by {crisis.reporter?.first_name}</span>
                                </div>
                                <ChevronRight className={`h-5 w-5 transition ${selectedCrisis?.id === crisis.id ? 'text-red-600 translate-x-2' : 'text-slate-300'}`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Manual Mobilizer */}
                <div className="flex flex-col space-y-6 overflow-hidden">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 pl-4">Assigned Task Force</h2>

                    {!selectedCrisis ? (
                        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 text-center p-12">
                            <ShieldCheck className="h-16 w-16 text-slate-200 mb-6" />
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Select an alert to begin mobilization</h3>
                        </div>
                    ) : (
                        <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
                            {/* Mission Tracker */}
                            <div className="p-8 border-b border-slate-50">
                                <h4 className="text-xs font-black uppercase text-indigo-600 tracking-widest mb-4">Assigned Potential Help ({assignedMembers.length})</h4>
                                <div className="flex flex-wrap gap-3">
                                    {assignedMembers.length === 0 && <p className="text-xs font-bold text-slate-400 italic">No members assigned to this mission yet.</p>}
                                    {assignedMembers.map(m => (
                                        <div key={m.id} className="bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-black uppercase flex items-center gap-2 animate-in zoom-in">
                                            {m.first_name} <X className="h-3 w-3 cursor-pointer hover:text-red-200" onClick={() => removeMember(m.id)} />
                                        </div>
                                    ))}
                                </div>
                                {assignedMembers.length > 0 && (
                                    <button className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-black transition">
                                        <Send className="h-4 w-4" /> Notify Task Force via SMS/Mail
                                    </button>
                                )}
                            </div>

                            {/* Manual Search Engine */}
                            <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                                <form onSubmit={handleSearch} className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by Skill (e.g. Doctor, Law, Grief)..."
                                        className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold text-slate-900 outline-none focus:border-indigo-500 transition"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg">
                                        <Search className="h-4 w-4" />
                                    </button>
                                </form>

                                <div className="space-y-4">
                                    {searching ? (
                                        <div className="flex items-center justify-center py-10">
                                            <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
                                        </div>
                                    ) : (
                                        searchResults.map(member => (
                                            <div key={member.id} className="p-4 rounded-2xl border-2 border-slate-50 flex items-center justify-between group hover:border-indigo-100 transition">
                                                <div>
                                                    <h5 className="font-black text-slate-900">{member.first_name} {member.last_name}</h5>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.profession}</p>
                                                    <div className="flex gap-1 mt-1">
                                                        {member.skills.map((s: string) => <span key={s} className="text-[8px] bg-slate-100 px-2 py-0.5 rounded-full font-black text-slate-500">{s}</span>)}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => assignMember(member)}
                                                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition shadow-lg"
                                                >
                                                    <UserPlus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
