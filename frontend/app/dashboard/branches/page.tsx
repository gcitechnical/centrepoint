'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { MapPin, Plus, Search, Loader2, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function BranchesPage() {
    const { user } = useAuth();
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const res = await api.branches.list();
            setBranches(res.data.data);
        } catch (err) {
            setError('Failed to load branches');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Branches</h1>
                    <p className="text-slate-500">Manage your church locations and campuses</p>
                </div>
                <button className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors gap-2">
                    <Plus className="h-4 w-4" />
                    Add Branch
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
            ) : branches && branches.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="mx-auto h-12 w-12 text-slate-400 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No branches found</h3>
                    <p className="mt-1 text-slate-500">Get started by creating your first branch location.</p>
                    <div className="mt-6">
                        <button className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors gap-2">
                            <Plus className="h-4 w-4" />
                            Add Branch
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {branches.map((branch) => (
                        <div
                            key={branch.id}
                            className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                                        {branch.timezone || 'UTC'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                    {branch.name}
                                </h3>
                                <div className="space-y-2 mt-4">
                                    {branch.city && (
                                        <div className="flex items-center text-sm text-slate-500">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            {branch.city}, {branch.country}
                                        </div>
                                    )}
                                    {branch.address && (
                                        <p className="text-sm text-slate-500 pl-6">{branch.address}</p>
                                    )}
                                </div>
                            </div>
                            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-sm">
                                <span className="text-slate-500">
                                    {branch.slug}.gci.org
                                </span>
                                <button className="text-blue-600 font-medium hover:text-blue-700">
                                    Manage
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
