'use client';

import { 
    RiMoneyDollarCircleLine,
    RiBarChartBoxLine,
    RiTimeLine,
    RiCheckLine,
    RiCheckDoubleLine,
    RiCloseLine
} from 'react-icons/ri';

interface BookingStats {
    totalAmount: number;
    avgAmount: number;
    pendingCount: number;
    approvedCount: number;
    completedCount: number;
    rejectedCount: number;
}

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    trend?: number;
    color: string;
    bgColor: string;
}

function StatCard({ title, value, icon: Icon, trend, color, bgColor }: StatCardProps) {
    return (
        <div className={`${bgColor} rounded-xl overflow-hidden`}>
            <div className="p-6 flex flex-col h-full">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-400 mb-1">{title}</p>
                        <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${bgColor} ${color}`}>
                        <Icon size={24} />
                    </div>
                </div>
                {trend !== undefined && (
                    <div className="mt-4 flex items-center text-sm">
                        <span className={trend >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </span>
                        <span className="text-gray-400 ml-2">vs last month</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BookingStats({ stats }: { stats: BookingStats }) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const statCards = [
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.totalAmount),
            icon: RiMoneyDollarCircleLine,
            trend: 12.5,
            color: 'text-purple-400',
            bgColor: 'bg-purple-900/20 backdrop-blur-sm'
        },
        {
            title: 'Average Booking',
            value: formatCurrency(stats.avgAmount),
            icon: RiBarChartBoxLine,
            trend: -2.4,
            color: 'text-blue-400',
            bgColor: 'bg-blue-900/20 backdrop-blur-sm'
        },
        {
            title: 'Pending',
            value: stats.pendingCount.toString(),
            icon: RiTimeLine,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-900/20 backdrop-blur-sm'
        },
        {
            title: 'Approved',
            value: stats.approvedCount.toString(),
            icon: RiCheckLine,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-900/20 backdrop-blur-sm'
        },
        {
            title: 'Completed',
            value: stats.completedCount.toString(),
            icon: RiCheckDoubleLine,
            color: 'text-green-400',
            bgColor: 'bg-green-900/20 backdrop-blur-sm'
        },
        {
            title: 'Rejected',
            value: stats.rejectedCount.toString(),
            icon: RiCloseLine,
            color: 'text-red-400',
            bgColor: 'bg-red-900/20 backdrop-blur-sm'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {statCards.map((card, index) => (
                <StatCard key={index} {...card} />
            ))}
        </div>
    );
}
