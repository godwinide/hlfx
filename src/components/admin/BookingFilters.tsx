'use client';

import { RiSearchLine, RiFilter3Line } from 'react-icons/ri';

interface Filters {
    search: string;
    status: string;
    service: string;
    startDate: string;
    endDate: string;
}

interface Props {
    filters: Filters;
    onFilterChange: (filters: Filters) => void;
    onSearch: (e: React.FormEvent) => void;
}

const serviceTypes = [
    { value: '', label: 'All Services' },
    { value: 'meet-and-greet', label: 'Meet & Greet' },
    { value: 'vip-fan-cards', label: 'VIP Fan Cards' },
    { value: 'donation', label: 'Donation' }
];

const statusTypes = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' }
];

export default function BookingFilters({ filters, onFilterChange, onSearch }: Props) {
    const handleFilterChange = (key: keyof Filters, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <div className="space-y-4">
            {/* Search */}
            <form onSubmit={onSearch} className="flex gap-4">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search bookings..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <RiSearchLine 
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
                        size={20} 
                    />
                </div>
                <button
                    type="button"
                    onClick={() => document.getElementById('filters')?.classList.toggle('hidden')}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                >
                    <RiFilter3Line size={20} />
                    <span>Filters</span>
                </button>
            </form>

            {/* Filters */}
            <div id="filters" className="hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Service Type</label>
                        <select
                            value={filters.service}
                            onChange={(e) => handleFilterChange('service', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        >
                            {serviceTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        >
                            {statusTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">End Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
