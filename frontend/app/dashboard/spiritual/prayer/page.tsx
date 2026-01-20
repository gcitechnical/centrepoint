'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Heart, MessageCircle, Shield, User, Send, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function PrayerWallPage() {
    const [prayers, setPrayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newRequest, setNewRequest] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Mocking prayers for the spiritual journey
        setPrayers([
            { id: '1', request: 'Praying for my family as we start the new year. Seeking God\'s guidance in our business.', user: { first_name: 'David' }, is_anonymous: false, prayer_count: 12, created_at: new Date(), is_answered: false },
            { id: '2', request: 'Healing for a loved one currently in the hospital. We believe in the Great Physician.', user: { first_name: 'Anonymous' }, is_anonymous: true, prayer_count: 45, created_at: new Date(), is_answered: false },
            { id: '3', request: 'Thanking God for a successful job interview! Moving to the next stage.', user: { first_name: 'Sarah' }, is_anonymous: false, prayer_count: 8, created_at: new Date(), is_answered: true, testimony: 'I got the job! God is faithful!' },
        ]);
        setLoading(false);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRequest) return;
        setSubmitting(true);
        // Logic for backend post would go here
        setTimeout(() => {
            setSubmitting(false);
            setNewRequest('');
            alert('Your prayer request has been shared with the community. 🕊️');
        }, 1000);
    };

    if (loading) return <div className="p-8 font-black uppercase text-indigo-600 animate-pulse">Entering Holy Ground...</div>;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-10">
            {/* Spiritual Header */}
            <div className="relative rounded-[3rem] bg-indigo-900 p-10 text-white overflow-hidden shadow-2xl">
                <div className="relative z-10 max-w-xl">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">Prayer Request Network</h1>
                    <p className="text-indigo-200 font-bold italic mt-4 text-lg">"Carry each other’s burdens, and in this way you will fulfill the law of Christ."</p>
                </div>
                <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl transform -rotate-12 select-none">🕊️</div>
            </div>

            {/* Post Request Box */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-indigo-50">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <textarea
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 md:p-8 font-bold text-slate-800 outline-none focus:border-indigo-500 transition text-lg resize-none min-h-[150px]"
                            placeholder="Share your prayer request with the community..."
                            value={newRequest}
                            onChange={(e) => setNewRequest(e.target.value)}
                        />
                        <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => setIsAnonymous(!isAnonymous)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest transition ${isAnonymous ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
                            >
                                <Shield className="h-4 w-4" />
                                <span>{isAnonymous ? 'Anonymous' : 'Public'}</span>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-3xl p-6 font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-3"
                    >
                        {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : <><Send className="h-5 w-5" /> Post to Prayer Wall</>}
                    </button>
                </form>
            </div>

            {/* Prayer Wall Feed */}
            <div className="space-y-6">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 pl-4">Community Prayer Feed</h2>

                {prayers.map(prayer => (
                    <div key={prayer.id} className="group bg-white rounded-[2rem] p-8 shadow-md border border-slate-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                        {prayer.is_answered && (
                            <div className="absolute top-0 right-0 bg-green-500 text-white px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest">
                                Testimony of Faith 👑
                            </div>
                        )}

                        <div className="flex items-start space-x-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition tracking-tight">
                                    {prayer.is_anonymous ? 'Anonymous Member' : prayer.user.first_name}
                                </h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                    {new Date(prayer.created_at).toLocaleDateString()} • Church Family
                                </p>
                            </div>
                        </div>

                        <p className={`text-lg font-bold text-slate-700 leading-relaxed mb-8 ${prayer.is_answered ? 'line-through opacity-50' : ''}`}>
                            "{prayer.request}"
                        </p>

                        {prayer.is_answered && prayer.testimony && (
                            <div className="bg-green-50 rounded-2xl p-6 mb-8 border border-green-100 animate-in fade-in zoom-in">
                                <div className="flex items-center space-x-2 text-green-700 font-black text-xs uppercase mb-2">
                                    <Sparkles className="h-4 w-4" /> <span>Answered Prayer</span>
                                </div>
                                <p className="text-green-800 font-bold italic">"{prayer.testimony}"</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <button className="flex items-center space-x-3 text-slate-400 hover:text-red-500 transition group/btn">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover/btn:bg-red-50 transition">
                                    <Heart className="h-5 w-5" />
                                </div>
                                <span className="font-black text-xs uppercase tracking-widest">{prayer.prayer_count} Prayed For This</span>
                            </button>

                            <button className="text-[10px] font-black uppercase text-indigo-600 tracking-widest bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 transition">
                                Connect in Spirit
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center py-10 opacity-50">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Centrepoint Spiritual Journey tracking</p>
            </div>
        </div>
    );
}
