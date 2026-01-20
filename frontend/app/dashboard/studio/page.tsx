'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Palette, Plus, Loader2, Edit } from 'lucide-react';
import Link from 'next/link';

// Helper for relative time
function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
}

export default function StudioPage() {
    const [designs, setDesigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDesigns();
    }, []);

    const fetchDesigns = async () => {
        try {
            setLoading(true);
            const res = await api.designs.list();
            setDesigns(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createBlankDesign = async () => {
        // In a real app, this would open a template picker modal
        // For now, we stub it to create a blank one or redirect
        alert('To start a design, please Create an Event. The system will auto-generate a design for you to edit!');
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Design Studio</h1>
                    <p className="text-slate-500">Your collection of event flyers and graphics</p>
                </div>
                <button
                    onClick={createBlankDesign}
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors gap-2"
                >
                    <Plus className="h-4 w-4" />
                    New Design
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            ) : designs && designs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="mx-auto h-12 w-12 text-slate-400 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Palette className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No designs yet</h3>
                    <p className="mt-1 text-slate-500">
                        Create an <strong>Event</strong> and check the "Auto-generate Flyer" box to see magic happen!
                    </p>
                    <div className="mt-6">
                        <Link href="/dashboard/events/create" className="text-indigo-600 font-medium hover:underline">
                            Go to Events
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {designs.map((design) => (
                        <div key={design.id} className="group bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                            {/* Thumbnail Preview */}
                            <div className="aspect-[4/5] bg-slate-100 relative">
                                {design.thumbnail_url ? (
                                    <img src={design.thumbnail_url} alt={design.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Palette className="h-12 w-12" />
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Link
                                        href={`/dashboard/studio/${design.id}`}
                                        className="bg-white text-slate-900 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-slate-50"
                                    >
                                        <Edit className="h-3 w-3" /> Edit
                                    </Link>
                                </div>
                            </div>

                            <div className="p-3">
                                <h4 className="font-medium text-slate-900 truncate" title={design.title}>{design.title}</h4>
                                <p className="text-xs text-slate-500 mt-1">Edited {timeAgo(design.updated_at)}</p>
                                {design.status === 'published' && (
                                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase">
                                        Published
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
