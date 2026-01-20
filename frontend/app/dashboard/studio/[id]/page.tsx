'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Import CanvasApp dynamically to avoid SSR issues with fabric.js
const CanvasApp = dynamic(
    () => import('@/components/studio/CanvasApp'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-[600px] bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }
);

export default function EditDesignPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const [design, setDesign] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) fetchDesign(id);
    }, [id]);

    const fetchDesign = async (designId: string) => {
        try {
            setLoading(true);
            const res = await api.designs.get(designId);
            setDesign(res.data.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load design');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !design) {
        return (
            <div className="p-8 text-center">
                <h3 className="text-red-600 text-lg font-medium">{error || 'Design not found'}</h3>
                <Link href="/dashboard/studio" className="text-indigo-600 mt-4 inline-block hover:underline">
                    Back to Studio
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Top Bar */}
            <div className="bg-white border-b border-slate-200 h-16 px-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/studio" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="font-semibold text-slate-900">{design.title}</h1>
                        <p className="text-xs text-slate-500">
                            {design.template ? `Based on ${design.template.name}` : 'Custom Design'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                        Last saved: {new Date(design.updated_at).toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-hidden">
                <CanvasApp
                    designId={design.id}
                    initialData={design.canvas_json}
                />
            </div>
        </div>
    );
}
