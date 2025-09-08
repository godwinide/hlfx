'use client';

import Image from 'next/image';
import { RiCheckLine, RiCloseLine, RiTimeLine } from 'react-icons/ri';

interface Celebrity {
    _id: string;
    name: string;
    imageUrl: string;
    profession: string;
}

interface Booking {
    _id: string;
    celebrityId: Celebrity;
    service: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    status: 'pending' | 'approved' | 'completed' | 'rejected';
    date: string;
    amount: number;
    createdAt: string;
}

interface Props {
    bookings: Booking[];
    loading: boolean;
    onStatusChange: (id: string, status: string) => void;
}

export default function BookingTable({ bookings, loading, onStatusChange }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-400 bg-yellow-400/10';
            case 'approved':
                return 'text-blue-400 bg-blue-400/10';
            case 'completed':
                return 'text-green-400 bg-green-400/10';
            case 'rejected':
                return 'text-red-400 bg-red-400/10';
            default:
                return 'text-gray-400 bg-gray-400/10';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatService = (service: string) => {
        return service.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    if (loading) {
        return (
            <div className="bg-gray-800/50 rounded-lg p-8">
                <div className="text-center text-gray-400">Loading...</div>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="bg-gray-800/50 rounded-lg p-8">
                <div className="text-center text-gray-400">No bookings found</div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full text-left">
                <thead className="bg-gray-800">
                    <tr>
                        <th className="p-4">Celebrity</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Service</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {bookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-800/50">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                                        {booking.celebrityId.imageUrl && (
                                            <Image
                                                src={booking.celebrityId.imageUrl}
                                                alt={booking.celebrityId.name}
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{booking.celebrityId.name}</p>
                                        <p className="text-sm text-gray-400">{booking.celebrityId.profession}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <p className="font-medium">{booking.customerName}</p>
                                <p className="text-sm text-gray-400">{booking.customerEmail}</p>
                                {booking.customerPhone && (
                                    <p className="text-sm text-gray-400">{booking.customerPhone}</p>
                                )}
                            </td>
                            <td className="p-4">{formatService(booking.service)}</td>
                            <td className="p-4">
                                {new Date(booking.date).toLocaleDateString()}
                            </td>
                            <td className="p-4 font-medium">
                                {formatCurrency(booking.amount)}
                            </td>
                            <td className="p-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    {booking.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => onStatusChange(booking._id, 'approved')}
                                                className="p-1.5 text-green-400 hover:bg-green-400/10 rounded"
                                                title="Approve"
                                            >
                                                <RiCheckLine size={20} />
                                            </button>
                                            <button
                                                onClick={() => onStatusChange(booking._id, 'rejected')}
                                                className="p-1.5 text-red-400 hover:bg-red-400/10 rounded"
                                                title="Reject"
                                            >
                                                <RiCloseLine size={20} />
                                            </button>
                                        </>
                                    )}
                                    {booking.status === 'approved' && (
                                        <button
                                            onClick={() => onStatusChange(booking._id, 'completed')}
                                            className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded"
                                            title="Mark as Completed"
                                        >
                                            <RiTimeLine size={20} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
