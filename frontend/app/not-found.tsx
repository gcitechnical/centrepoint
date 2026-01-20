'use client';

import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans overflow-hidden relative">
            {/* Spiritual Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500 rounded-full blur-[100px] animate-pulse duration-700"></div>
            </div>

            <div className="max-w-md w-full text-center relative z-10">
                <div className="mb-8 inline-flex p-6 bg-slate-900/50 rounded-[2rem] border border-slate-800 shadow-2xl relative">
                    <Compass className="h-20 w-20 text-amber-500 animate-[spin_10s_linear_infinite]" />
                    <div className="absolute -top-2 -right-2 bg-indigo-600 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg">404</div>
                </div>

                <h1 className="text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
                    Path <span className="text-amber-500">Not</span> Found
                </h1>

                <p className="text-slate-400 font-medium text-lg mb-10 leading-relaxed italic">
                    "Thy word is a lamp unto my feet, but this specific path seems to be missing from the scrolls."
                </p>

                <div className="flex flex-col gap-4">
                    <Link
                        href="/dashboard"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-5 px-8 rounded-2xl font-black uppercase tracking-widest text-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/40 border border-indigo-500/30"
                    >
                        <Home className="h-4 w-4" />
                        Return to Sanctuary
                    </Link>

                    <Link
                        href="/"
                        className="text-slate-500 hover:text-white font-black uppercase tracking-widest text-[10px] transition"
                    >
                        Go to Main Gates
                    </Link>
                </div>

                <div className="mt-16 text-slate-800 font-black uppercase tracking-[0.3em] text-[10px]">
                    Centrepoint Digital Eco-system
                </div>
            </div>
        </div>
    );
}
