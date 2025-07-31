'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    RiDashboardLine, 
    RiUserStarLine, 
    RiCalendarEventLine,
    RiSettings4Line,
    RiLogoutBoxRLine,
    RiMenuLine,
    RiCloseLine,
    RiMoneyDollarCircleLine,
    RiArrowUpCircleLine,
    RiExchangeLine
} from 'react-icons/ri';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const menuItems = [
        {
            name: 'Dashboard',
            icon: RiDashboardLine,
            href: '/admin/dashboard'
        },
        {
            name: 'Add Customer',
            icon: RiUserStarLine,
            href: '/admin/add-customer'
        },
        {
            name: 'Customers',
            icon: RiUserStarLine,
            href: '/admin/customers'
        },
        {
            name: 'Deposit',
            icon: RiMoneyDollarCircleLine,
            href: '/admin/deposit'
        },
        {
            name: 'Withdraw',
            icon: RiArrowUpCircleLine,
            href: '/admin/withdraw'
        },
        {
            name: 'Transactions',
            icon: RiExchangeLine,
            href: '/admin/transactions'
        },
        {
            name: 'Settings',
            icon: RiSettings4Line,
            href: '/admin/settings'
        }
    ];

    const isActive = (href: string) => {
        return pathname === href;
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 border-r border-gray-800
                transform transition-transform duration-200 ease-in-out
                lg:translate-x-0 lg:static lg:h-screen
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
                    <Link href="/admin/dashboard" className="text-xl font-bold text-white">
                        Halifax Bank
                    </Link>
                    <button 
                        onClick={onClose}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <RiCloseLine size={24} />
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="mt-6 px-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-lg
                                            transition-colors duration-200
                                            ${active 
                                                ? 'bg-purple-600 text-white' 
                                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                            }
                                        `}
                                        onClick={onClose}
                                    >
                                        <Icon size={20} />
                                        <span>{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
                    <div className="mb-4 px-4">
                        <p className="text-sm text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate">
                            {session?.user?.email}
                        </p>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/admin/login' })}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                    >
                        <RiLogoutBoxRLine size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
