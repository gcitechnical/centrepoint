'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, Filter, PieChart, Users, MapPin } from 'lucide-react';

// Fix for default Leaflet icons in Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function OutreachMapPage() {
    const [center] = useState<[number, number]>([-1.286389, 36.817223]); // Nairobi Default
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalMembers: 124, activeFamilies: 42, growthCentres: 8 });

    // Mock data for GIS mapping
    const [members] = useState([
        { id: 1, name: 'Wandera Family', position: [-1.30, 36.85], type: 'family', members: 5 },
        { id: 2, name: 'Njeri Family', position: [-1.28, 36.80], type: 'family', members: 3 },
        { id: 3, name: 'Otieno Family', position: [-1.35, 36.90], type: 'family', members: 4 },
        { id: 4, name: 'Syokimau Growth Centre', position: [-1.32, 36.95], type: 'gc', leader: 'Elder John' },
        { id: 5, name: 'Karen Growth Centre', position: [-1.33, 36.70], type: 'gc', leader: 'Sister Mary' },
    ]);

    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) return <div>Loading GIS Data...</div>;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-4 p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Congregation GIS Mapping</h1>
                    <p className="text-slate-500 font-bold italic">Visualizing member distribution for mission planning.</p>
                </div>
                <div className="flex space-x-2">
                    <button className="bg-white border-2 border-slate-100 p-3 rounded-2xl shadow-sm hover:border-indigo-600 transition">
                        <Filter className="h-5 w-5 text-slate-400" />
                    </button>
                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 flex items-center gap-2">
                        <PieChart className="h-4 w-4" /> Demographic Analytics
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Statistics Sidebar */}
                <div className="space-y-6 overflow-y-auto pr-2">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">👨‍👩‍👧‍👦</div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Total Members</p>
                                <p className="text-2xl font-black text-slate-900">{stats.totalMembers}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl">📍</div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Growth Centres</p>
                                <p className="text-2xl font-black text-slate-900">{stats.growthCentres}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-900 rounded-3xl p-6 text-white shadow-xl">
                        <h3 className="font-black uppercase tracking-tighter mb-4">Coverage Analysis</h3>
                        <p className="text-xs text-indigo-200 font-bold mb-6">Syokimau area shows high member density but only 1 Growth Centre. Outreach recommended.</p>
                        <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-widest transition">
                            Propose New Location
                        </button>
                    </div>
                </div>

                {/* Map View */}
                <div className="lg:col-span-3 rounded-[2.5rem] border-4 border-white shadow-2xl relative overflow-hidden z-0 bg-slate-100">
                    <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {members.map(loc => (
                            loc.type === 'family' ? (
                                <Marker key={loc.id} position={loc.position as [number, number]}>
                                    <Popup>
                                        <div className="font-bold">{loc.name}</div>
                                        <div className="text-xs">{loc.members} Household Members</div>
                                    </Popup>
                                </Marker>
                            ) : (
                                <div key={loc.id}>
                                    <Circle
                                        center={loc.position as [number, number]}
                                        radius={2000}
                                        pathOptions={{ fillColor: 'blue', opacity: 0.1, fillOpacity: 0.1 }}
                                    />
                                    <Marker position={loc.position as [number, number]} icon={L.divIcon({
                                        className: 'custom-div-icon',
                                        html: `<div style="background-color: #4f46e5; width: 24px; height: 24px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>`,
                                        iconSize: [24, 24],
                                        iconAnchor: [12, 12]
                                    })}>
                                        <Popup>
                                            <div className="font-black text-indigo-600 uppercase tracking-tighter">{loc.name}</div>
                                            <div className="text-xs font-bold italic">Leader: {loc.leader}</div>
                                        </Popup>
                                    </Marker>
                                </div>
                            )
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}
