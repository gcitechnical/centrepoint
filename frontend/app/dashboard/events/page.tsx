'use client';

import { useEffect, useState } from 'react';
import { eventsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { format } from 'date-fns';

export default function EventsPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const response = await eventsApi.getAll();
            setEvents(response.data.data);
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            await eventsApi.delete(id);
            setEvents(events.filter((e: any) => e.id !== id));
        } catch (error) {
            alert('Failed to delete event');
        }
    };

    const filteredEvents = events.filter((event: any) => {
        if (filter === 'upcoming') {
            return new Date(event.start_datetime) > new Date();
        }
        if (filter === 'past') {
            return new Date(event.start_datetime) < new Date();
        }
        return true;
    });

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Events</h1>
                    <p className="text-gray-600 mt-1">Manage your church events and schedules</p>
                </div>
                <Link
                    href="/dashboard/events/new"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                >
                    + Create Event
                </Link>
            </div>

            {/* Filters */}
            <div className="flex space-x-2 mb-6">
                {['all', 'upcoming', 'past'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filter === f
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Events List */}
            <div className="space-y-4">
                {filteredEvents.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="text-6xl mb-4">📅</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                        <p className="text-gray-600 mb-6">Get started by creating your first event</p>
                        <Link
                            href="/dashboard/events/new"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Create Event
                        </Link>
                    </div>
                ) : (
                    filteredEvents.map((event: any) => (
                        <div
                            key={event.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                                        {event.generated_design_id && (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                ✓ Flyer Generated
                                            </span>
                                        )}
                                        {event.auto_generate_flyer && !event.generated_design_id && (
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                                ⏳ Generating...
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-600 mb-4">{event.description}</p>

                                    {event.required_ministries?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {event.required_ministries.map((m: any) => (
                                                <span key={m.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    🏢 {m.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="flex items-center space-x-2 text-gray-700">
                                            <span>📅</span>
                                            <span>{format(new Date(event.start_datetime), 'MMM dd, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-700">
                                            <span>⏰</span>
                                            <span>{format(new Date(event.start_datetime), 'h:mm a')}</span>
                                        </div>
                                        {event.venue_name && (
                                            <div className="flex items-center space-x-2 text-gray-700">
                                                <span>📍</span>
                                                <span>{event.venue_name}</span>
                                            </div>
                                        )}
                                        {event.is_online && (
                                            <div className="flex items-center space-x-2 text-gray-700">
                                                <span>🌐</span>
                                                <span>Online Event</span>
                                            </div>
                                        )}
                                    </div>

                                    {event.branch && (
                                        <div className="mt-3 text-sm text-gray-500">
                                            Branch: {event.branch.name}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                    {event.generated_design_id && (
                                        <Link
                                            href={`/dashboard/studio/${event.generated_design_id}`}
                                            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-medium"
                                        >
                                            View Flyer
                                        </Link>
                                    )}
                                    <Link
                                        href={`/dashboard/events/${event.id}/edit`}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
