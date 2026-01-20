'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { eventsApi, branchesApi, templatesApi, ministriesApi } from '@/lib/api';

export default function NewEventPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [ministries, setMinistries] = useState([]);

    const [formData, setFormData] = useState({
        tenant_id: user?.tenant_id || '',
        branch_id: '',
        title: '',
        description: '',
        start_datetime: '',
        end_datetime: '',
        is_all_day: false,
        venue_name: '',
        venue_address: '',
        is_online: false,
        online_url: '',
        auto_generate_flyer: true,
        flyer_template_id: '',
        required_ministry_ids: [] as string[],
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [branchesRes, templatesRes, ministriesRes] = await Promise.all([
                branchesApi.getAll(),
                templatesApi.getAll('event'),
                ministriesApi.getAll(),
            ]);
            setBranches(branchesRes.data.data);
            setTemplates(templatesRes.data.data);
            setMinistries(ministriesRes.data.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const toggleMinistry = (id: string) => {
        setFormData(prev => {
            const current = [...prev.required_ministry_ids];
            const index = current.indexOf(id);
            if (index > -1) {
                current.splice(index, 1);
            } else {
                current.push(id);
            }
            return { ...prev, required_ministry_ids: current };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await eventsApi.create(formData);
            router.push('/dashboard/events');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
                <p className="text-gray-600 mt-1">Schedule a new church event with auto-flyer generation</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Event Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Sunday Service, Youth Conference, etc."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Event description..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Branch
                            </label>
                            <select
                                name="branch_id"
                                value={formData.branch_id}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select branch</option>
                                {branches.map((branch: any) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Required Ministries / Departments
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ministries.map((ministry: any) => (
                                <button
                                    key={ministry.id}
                                    type="button"
                                    onClick={() => toggleMinistry(ministry.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${formData.required_ministry_ids.includes(ministry.id)
                                            ? 'bg-blue-600 text-white shadow-md scale-105'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {formData.required_ministry_ids.includes(ministry.id) && <span className="mr-2">✓</span>}
                                    {ministry.name}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 italic">Select which departments are required for this activity (e.g., Music, Ushering, Media)</p>
                    </div>
                </div>

                {/* Date & Time */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Date & Time</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date & Time *
                            </label>
                            <input
                                type="datetime-local"
                                name="start_datetime"
                                value={formData.start_datetime}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                name="end_datetime"
                                value={formData.end_datetime}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="is_all_day"
                            checked={formData.is_all_day}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">All-day event</span>
                    </label>
                </div>

                {/* Location */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Location</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Venue Name
                            </label>
                            <input
                                type="text"
                                name="venue_name"
                                value={formData.venue_name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Main Sanctuary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Venue Address
                            </label>
                            <input
                                type="text"
                                name="venue_address"
                                value={formData.venue_address}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="123 Church Street"
                            />
                        </div>
                    </div>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="is_online"
                            checked={formData.is_online}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Online event</span>
                    </label>

                    {formData.is_online && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Online Meeting URL
                            </label>
                            <input
                                type="url"
                                name="online_url"
                                value={formData.online_url}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://zoom.us/..."
                            />
                        </div>
                    )}
                </div>

                {/* Flyer Generation */}
                <div className="space-y-4 bg-blue-50 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <span className="mr-2">🎨</span>
                        Auto-Flyer Generation
                    </h2>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="auto_generate_flyer"
                            checked={formData.auto_generate_flyer}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 font-medium">
                            Automatically generate event flyer
                        </span>
                    </label>

                    {formData.auto_generate_flyer && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Flyer Template (Optional)
                            </label>
                            <select
                                name="flyer_template_id"
                                value={formData.flyer_template_id}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="">Auto-select best template</option>
                                {templates.map((template: any) => (
                                    <option key={template.id} value={template.id}>
                                        {template.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                                Leave blank to automatically select the best template
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
}
