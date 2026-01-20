'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    Palette,
    FileText,
    Building2,
    Church,
    Heart,
    Zap,
    Globe,
    Music,
    Coins,
    LogOut,
    ChevronRight
} from 'lucide-react';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Hybrid Worship', href: '/dashboard/worship', icon: Music },
        { name: 'Spiritual Growth', href: '/dashboard/spiritual', icon: Zap },
        { name: 'Finance & Giving', href: '/dashboard/finance', icon: Coins },
        { name: 'Outreach & Map', href: '/dashboard/outreach', icon: Globe },
        { name: 'Studio', href: '/dashboard/studio', icon: Palette },
        { name: 'Events', href: '/dashboard/events', icon: Calendar },
        { name: 'Ministries', href: '/dashboard/ministries', icon: Church },
        { name: 'Branches', href: '/dashboard/branches', icon: Building2, adminOnly: true },
    ];

    const isAdmin = user?.role === 'super_admin' || user?.role === 'tenant_admin';

    return (
        <div className="w-72 bg-slate-900 text-white min-h-screen flex flex-col border-r border-slate-800 shadow-2xl relative z-20">
            {/* Logo Section */}
            <div className="p-8 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
                        <span className="text-xl font-black text-amber-400">C</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tighter leading-none">Centrepoint</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">{user?.tenant?.name || 'Sanctuary System'}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Main Sanctuary</p>
                {navigation.map((item) => {
                    if (item.adminOnly && !isAdmin) return null;

                    const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${isActive
                                    ? 'bg-indigo-600/10 text-white shadow-sm border border-indigo-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'bg-slate-800 group-hover:bg-slate-700'
                                    }`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className="font-bold text-sm tracking-tight">{item.name}</span>
                            </div>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User Info & Sign Out */}
            <div className="p-6 bg-slate-900/50 border-t border-slate-800">
                <div className="bg-slate-800/50 rounded-3xl p-4 mb-4 border border-slate-700/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-900 to-indigo-600 rounded-2xl flex items-center justify-center font-black border border-indigo-400/20 shadow-xl">
                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-white truncate">
                                {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest truncate">{user?.role?.replace('_', ' ')}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-800 hover:bg-rose-900/20 hover:text-rose-400 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-slate-700 hover:border-rose-900/30"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out Sanctuary
                </button>
            </div>
        </div>
    );
}
