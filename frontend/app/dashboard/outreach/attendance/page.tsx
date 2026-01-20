'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Calendar, CheckCircle2, XCircle, Search, Save, MapPin } from 'lucide-react';

export default function GrowthCentreAttendancePage() {
    const [growthCentres, setGrowthCentres] = useState<any[]>([]);
    const [selectedGC, setSelectedGC] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<Record<string, boolean>>({});
    const [prayerRequests, setPrayerRequests] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking growth centres for now
        setGrowthCentres([
            { id: '1', name: 'Syokimau Fellowship', address: 'Mombasa Rd, House 45', leader: 'Elder John' },
            { id: '2', name: 'Karen Growth Centre', address: 'Ngong Rd, Gate 12', leader: 'Sister Mary' },
        ]);
        setLoading(false);
    }, []);

    const loadMembers = (gcId: string) => {
        // Mock members for the selected group
        setMembers([
            { id: 'u1', first_name: 'David', last_name: 'Wandera', phone: '0712345678' },
            { id: 'u2', first_name: 'Sarah', last_name: 'Njeri', phone: '0722000111' },
            { id: 'u3', first_name: 'Geoffrey', last_name: 'Otieno', phone: '0733999888' },
        ]);
        const initialAttendance: Record<string, boolean> = {};
        ['u1', 'u2', 'u3'].forEach(id => initialAttendance[id] = true);
        setAttendance(initialAttendance);
    };

    const toggleAttendance = (id: string) => {
        setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Growth Centre Portal</h1>
                    <p className="text-indigo-200 font-bold italic mt-2">Marking attendance for the Home Fellowship journey.</p>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">🏠</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Select Group */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest">Select Group</h2>
                    <div className="space-y-3">
                        {growthCentres.map(gc => (
                            <button
                                key={gc.id}
                                onClick={() => { setSelectedGC(gc); loadMembers(gc.id); }}
                                className={`w-full p-4 rounded-2xl text-left border-2 transition ${selectedGC?.id === gc.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
                            >
                                <h3 className="font-bold text-slate-900">{gc.name}</h3>
                                <div className="flex items-center text-xs text-slate-500 mt-1">
                                    <MapPin className="h-3 w-3 mr-1" /> {gc.address}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Attendance List */}
                <div className="lg:col-span-2 space-y-4">
                    {!selectedGC ? (
                        <div className="bg-slate-50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold italic">Please select a Fellowship Group to mark attendance.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div>
                                    <h2 className="font-black text-slate-900 uppercase tracking-tighter">{selectedGC.name}</h2>
                                    <p className="text-xs font-bold text-indigo-600 italic">Wednesday Session: {new Date().toLocaleDateString()}</p>
                                </div>
                                <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition flex items-center gap-2">
                                    <Save className="h-4 w-4" /> Submit Records
                                </button>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {members.map(member => (
                                    <div key={member.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900">{member.first_name} {member.last_name}</h4>
                                            <p className="text-xs text-slate-500 font-medium">{member.phone}</p>

                                            {/* Prayer Request Input */}
                                            <input
                                                type="text"
                                                placeholder="Add prayer request..."
                                                className="mt-3 w-full text-xs bg-transparent border-b border-transparent focus:border-indigo-300 outline-none italic text-indigo-600 py-1"
                                                onChange={(e) => setPrayerRequests(prev => ({ ...prev, [member.id]: e.target.value }))}
                                            />
                                        </div>

                                        <button
                                            onClick={() => toggleAttendance(member.id)}
                                            className={`p-3 rounded-2xl transition ${attendance[member.id] ? 'bg-green-100 text-green-700 shadow-inner' : 'bg-red-50 text-red-300'}`}
                                        >
                                            {attendance[member.id] ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    Submission automatically notifies Ministry Leaders
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
