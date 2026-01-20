'use client';

import { Layout, Plus } from 'lucide-react';

export default function TemplatesPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Design Templates</h1>
                    <p className="text-slate-500">Manage master templates for your events</p>
                </div>
                <button className="inline-flex items-center justify-center rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 transition-colors gap-2">
                    <Plus className="h-4 w-4" />
                    Upload Template
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                <div className="mx-auto h-16 w-16 text-slate-300 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Layout className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium text-slate-900 mb-2">Templates Coming Soon</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    This module is under construction. You will be able to upload Fabric.js templates, define locked zones, and manage branding here.
                </p>
            </div>
        </div>
    );
}
