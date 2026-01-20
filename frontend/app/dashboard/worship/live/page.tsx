'use client';

import { useState, useEffect } from 'react';
import { Play, Book, FileText, Heart, Send, Users, Share2, Tv } from 'lucide-react';

export default function SundayLiveHub() {
    const [note, setNote] = useState('');
    const [isLive, setIsLive] = useState(true);
    const [activeTab, setActiveTab] = useState('notes'); // 'notes', 'hymns', 'chat'
    const [streamUrl, setStreamUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ'); // Placeholder for dynamic video ID

    // Function to extract YouTube ID and format embed URL
    const getEmbedUrl = (url: string) => {
        if (url.includes('youtube.com/embed/')) return url;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
    };

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-slate-50 overflow-hidden">
            {/* Main Content: Livestream & Notes Area */}
            <div className="flex-1 flex flex-col p-4 md:p-6 space-y-6 overflow-y-auto">
                {/* Livestream Player */}
                <div className="relative aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                    {isLive ? (
                        <iframe
                            className="w-full h-full"
                            src={getEmbedUrl(streamUrl)}
                            title="Church Livestream"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
                            <Tv className="h-16 w-16 opacity-20" />
                            <h3 className="text-xl font-bold uppercase tracking-widest">Service Starts at 10:00 AM</h3>
                        </div>
                    )}

                    {/* Live Badge */}
                    <div className="absolute top-6 left-6 flex items-center space-x-2 bg-red-600 px-4 py-2 rounded-full text-white font-black text-xs uppercase tracking-widest animate-pulse shadow-lg">
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                        <span>Live Session</span>
                    </div>
                </div>

                {/* Sermon Info & Engagement */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center space-x-2 text-indigo-600 font-black text-xs uppercase tracking-widest mb-2">
                            <Users className="h-4 w-4" /> <span>428 Worshiping Online</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">The Power of Strategic Giving</h1>
                        <p className="text-slate-500 font-bold italic">Series: Foundations of the Digital Church • Preacher: Rev. David Wandera</p>
                    </div>
                    <div className="flex space-x-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-black text-sm uppercase transition hover:bg-indigo-100">
                            <Heart className="h-4 w-4" /> Amen
                        </button>
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-sm uppercase transition hover:bg-black">
                            <Share2 className="h-4 w-4" /> Invite
                        </button>
                    </div>
                </div>
            </div>

            {/* Side Panel: Interactive Tools */}
            <div className="w-full lg:w-[400px] bg-white border-l border-slate-200 flex flex-col">
                <div className="flex border-b border-slate-100 p-2">
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition ${activeTab === 'notes' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <FileText className="h-4 w-4" /> Sermon Notes
                    </button>
                    <button
                        onClick={() => setActiveTab('hymns')}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition ${activeTab === 'hymns' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <Book className="h-4 w-4" /> Hymnbook
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'notes' ? (
                        <div className="h-full flex flex-col space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-sm font-black uppercase text-slate-400">My Revelation Journal</h2>
                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter italic">Cloud Sync Active</span>
                            </div>
                            <textarea
                                className="flex-1 w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-bold text-slate-800 outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
                                placeholder="Type your notes here as you listen..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                            <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-2 hover:bg-black transition">
                                <Send className="h-4 w-4" /> Save to My Profile
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search Hymns (Number or Title)..."
                                    className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-100 font-bold outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl border-2 border-indigo-50 bg-indigo-50/30">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-indigo-600 font-black text-xs">HYMN 42</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Swahili / Eng</span>
                                    </div>
                                    <h4 className="font-extrabold text-slate-900 uppercase">Amazing Grace (Neema ya Ajabu)</h4>
                                    <p className="text-xs text-slate-500 font-bold italic mt-2">Active Hymn in Service</p>
                                </div>
                                <div className="p-4 rounded-2xl border-2 border-slate-50 hover:border-slate-100 transition cursor-pointer">
                                    <span className="text-slate-400 font-black text-xs">HYMN 115</span>
                                    <h4 className="font-bold text-slate-700 uppercase">Great is Thy Faithfulness</h4>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
