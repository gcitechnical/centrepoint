'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Users, Plus, Search, Loader2 } from 'lucide-react';

export default function MinistriesPage() {
    const [ministries, setMinistries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMinistries();
    }, []);

    const fetchMinistries = async () => {
        try {
            setLoading(true);
            const res = await api.ministries.list();
            const all = res.data.data;
            const hierarchy = buildHierarchy(all);
            setMinistries(hierarchy);
        } catch (err) {
            setError('Failed to load ministries');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const buildHierarchy = (items: any[]) => {
        const map = new Map();
        const roots: any[] = [];

        items.forEach(item => {
            map.set(item.id, { ...item, children: [] });
        });

        items.forEach(item => {
            const node = map.get(item.id);
            if (item.parent_id && map.has(item.parent_id)) {
                map.get(item.parent_id).children.push(node);
            } else {
                roots.push(node);
            }
        });

        return roots;
    };

    const MinistryCard = ({ ministry, depth = 0 }: { ministry: any, depth?: number }) => (
        <div className={`space-y-4 ${depth > 0 ? 'ml-8 border-l-2 border-indigo-100 pl-6 mt-4' : ''}`}>
            <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6">
                <div className="flex items-start justify-between">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-indigo-600 mb-4 ${depth > 0 ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50'}`}>
                        <Users className="h-5 w-5" />
                    </div>
                    {depth > 0 && <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded">Sub-Department</span>}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {ministry.name}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2">
                    {ministry.description || 'Active church ministry team'}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-indigo-600 font-bold">
                    <span>{ministry.children?.length || 0} Sub-units</span>
                    <span className="cursor-pointer hover:underline uppercase tracking-tighter">Manage Team →</span>
                </div>
            </div>

            {ministry.children && ministry.children.length > 0 && (
                <div className="space-y-4">
                    {ministry.children.map((child: any) => (
                        <MinistryCard key={child.id} ministry={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8 p-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Ministries & Departments</h1>
                    <p className="text-slate-500 font-medium italic">Organizing the church hierarchy for service matching.</p>
                </div>
                <button className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 gap-2">
                    <Plus className="h-4 w-4" />
                    Create Department
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-bold border border-red-100">{error}</div>
            ) : ministries.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
                    <div className="mx-auto h-16 w-16 text-slate-400 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                        <Users className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Establish Your Hierarchy</h3>
                    <p className="mt-2 text-slate-500 max-w-sm mx-auto">Start by creating your main departments (e.g. Media, Worship) then add sub-teams.</p>
                </div>
            ) : (
                <div className="space-y-8 pb-20">
                    {ministries.map((ministry) => (
                        <MinistryCard key={ministry.id} ministry={ministry} />
                    ))}
                </div>
            )}
        </div>
    );
}
