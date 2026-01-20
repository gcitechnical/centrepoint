'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { MapPin, Sprout, Droplets, GraduationCap, Cross, Info, Activity, Users, ArrowRight } from 'lucide-react';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false }) as any;
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false }) as any;
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false }) as any;
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false }) as any;

export default function MissionMapPage() {
    const [sites, setSites] = useState<any[]>([]);
    const [selectedSite, setSelectedSite] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Default center for Kenya
    const center: [number, number] = [-1.286389, 36.817223];

    useEffect(() => {
        // Mocking outreach sites data
        const mockSites = [
            {
                id: 's1',
                name: 'Kyulu Hills Mission',
                type: 'mission_church',
                lat: -2.3,
                lng: 37.8,
                description: 'Focusing on community outreach and spiritual growth in the rural hills.',
                lead: 'Pastor James',
                impact: { beneficiaries: 1200, status: 'Active', harvest: 'N/A' }
            },
            {
                id: 's2',
                name: 'Syokimau Agri-Project',
                type: 'agriculture_project',
                lat: -1.45,
                lng: 36.95,
                description: 'Sustainable farming initiative supporting local families with seeds and tech.',
                lead: 'Elder Kamau',
                impact: { beneficiaries: 450, status: 'Harvest Season', harvest: 'Maize & Beans' }
            },
            {
                id: 's3',
                name: 'Mavoko Water Point',
                type: 'water_project',
                lat: -1.4,
                lng: 37.0,
                description: 'Clean water borehole serving 5 surrounding villages.',
                lead: 'Engineer Sarah',
                impact: { beneficiaries: 3000, status: 'Operating', harvest: 'Clean Water' }
            }
        ];
        setSites(mockSites);
        setLoading(false);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'agriculture_project': return <Sprout className="h-5 w-5 text-emerald-500" />;
            case 'water_project': return <Droplets className="h-5 w-5 text-blue-500" />;
            case 'mission_church': return <Cross className="h-5 w-5 text-indigo-500" />;
            default: return <MapPin className="h-5 w-5 text-slate-500" />;
        }
    };

    if (loading) return <div className="p-10 text-center font-black uppercase text-indigo-600 animate-pulse">Mapping the Impact...</div>;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-4 p-4 md:p-8 overflow-hidden">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-emerald-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden shrink-0">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">Mission Intelligence</h1>
                    <p className="text-emerald-100 font-bold italic mt-4 text-lg">Visualizing our global and local outreach footprint.</p>
                </div>
                <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl transform rotate-12">🌍</div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
                {/* Map View */}
                <div className="flex-1 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-100 relative min-h-[400px]">
                    <MapContainer center={center} zoom={8} className="h-full w-full z-10">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {sites.map(site => (
                            <Marker
                                key={site.id}
                                position={[site.lat, site.lng]}
                                eventHandlers={{
                                    click: () => setSelectedSite(site),
                                }}
                            >
                                <Popup>
                                    <div className="p-2 font-bold text-slate-900">
                                        <p className="uppercase text-[10px] tracking-widest text-indigo-600 font-black mb-1">{site.type.replace('_', ' ')}</p>
                                        <p className="text-sm font-black">{site.name}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* Info Sidebar */}
                <div className="w-full lg:w-[400px] flex flex-col space-y-6 overflow-hidden">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 pl-4">Site Intelligence</h2>

                    {!selectedSite ? (
                        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 text-center p-12">
                            <Activity className="h-16 w-16 text-slate-200 mb-6" />
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest leading-tight">Select a mission point to view impact</h3>
                        </div>
                    ) : (
                        <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-y-auto p-8 space-y-8 animate-in fade-in slide-in-from-right-5">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50">
                                    {getIcon(selectedSite.type)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedSite.name}</h3>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{selectedSite.type.replace('_', ' ')}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic font-medium text-slate-600 leading-relaxed">
                                "{selectedSite.description}"
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Status</p>
                                    <p className="font-black text-indigo-900">{selectedSite.impact.status}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                    <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-1">Impact</p>
                                    <p className="font-black text-emerald-900">{selectedSite.impact.beneficiaries}+ Lives</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between text-sm font-bold">
                                    <span className="text-slate-400">Project Lead</span>
                                    <span className="text-slate-900">{selectedSite.lead}</span>
                                </div>
                                {selectedSite.type === 'agriculture_project' && (
                                    <div className="flex items-center justify-between text-sm font-bold">
                                        <span className="text-slate-400">Current Harvest</span>
                                        <span className="text-emerald-600">{selectedSite.impact.harvest}</span>
                                    </div>
                                )}
                            </div>

                            <button className="w-full bg-slate-900 text-white rounded-2xl p-5 font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-3 group">
                                Full Impact Report <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
