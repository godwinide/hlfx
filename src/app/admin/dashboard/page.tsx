'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiUserLine, RiExchangeLine, RiMoneyDollarCircleLine, RiLineChartLine, RiCalendarLine, RiArrowRightLine, RiWalletLine } from 'react-icons/ri';

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  fromUser: {
    name: string;
    email: string;
  } | null;
  toUser: {
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  accountNumber: string;
  balance: number;
  currency: string;
}

interface DashboardStats {
  totalCustomers: number;
  totalTransactions: number;
  recentTransactions: Transaction[];
  recentCustomers: Customer[];
  transactionStats: {
    totalVolume: number;
    averageAmount: number;
    count: number;
  };
  customerStats: {
    totalBalance: number;
    averageBalance: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button 
            onClick={fetchDashboardStats}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">Total Customers</h3>
              <p className="text-3xl font-bold text-white mt-2">{stats?.totalCustomers || 0}</p>
            </div>
            <div className="bg-teal-500/20 p-3 rounded-lg">
              <RiUserLine className="text-teal-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">Total Transactions</h3>
              <p className="text-3xl font-bold text-white mt-2">{stats?.totalTransactions || 0}</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <RiExchangeLine className="text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">Transaction Volume</h3>
              <p className="text-3xl font-bold text-white mt-2">
                {formatCurrency(stats?.transactionStats?.totalVolume || 0)}
              </p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <RiLineChartLine className="text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">Total Balance</h3>
              <p className="text-3xl font-bold text-white mt-2">
                {formatCurrency(stats?.customerStats?.totalBalance || 0)}
              </p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <RiWalletLine className="text-purple-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <RiExchangeLine className="mr-2 text-teal-400" size={24} />
            Recent Transactions
          </h2>
          <span className="text-sm text-gray-400">Last 5 transactions</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                <th className="pb-4 font-semibold">From</th>
                <th className="pb-4 font-semibold">To</th>
                <th className="pb-4 font-semibold">Amount</th>
                <th className="pb-4 font-semibold">Description</th>
                <th className="pb-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {stats?.recentTransactions?.length ? (
                stats.recentTransactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center mr-3">
                          <RiUserLine className="text-teal-400" size={16} />
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {transaction.fromUser?.name || 'System'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {transaction.fromUser?.email || 'system@halifax.com'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                          <RiUserLine className="text-blue-400" size={16} />
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {transaction.toUser?.name || 'System'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {transaction.toUser?.email || 'system@halifax.com'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="font-semibold text-green-400">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-300">
                        {transaction.description || 'Transfer'}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center text-gray-400">
                        <RiCalendarLine className="mr-1" size={14} />
                        {formatDate(transaction.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Customers Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <RiUserLine className="mr-2 text-teal-400" size={24} />
            Recent Customers
          </h2>
          <span className="text-sm text-gray-400">Latest 5 customers</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                <th className="pb-4 font-semibold">Customer</th>
                <th className="pb-4 font-semibold">Account</th>
                <th className="pb-4 font-semibold">Email</th>
                <th className="pb-4 font-semibold">Balance</th>
                <th className="pb-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {stats?.recentCustomers?.length ? (
                stats.recentCustomers.map((customer) => (
                  <tr key={customer._id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-semibold text-sm">
                            {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{customer.name}</div>
                          <div className="text-xs text-gray-400">Customer ID: {customer._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="font-mono text-white text-sm">
                        {customer.accountNumber}
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-300">{customer.email}</span>
                    </td>
                    <td className="py-4">
                      <span className="font-semibold text-green-400">
                        {formatCurrency(customer.balance, customer.currency)}
                      </span>
                    </td>
                    <td className="py-4">
                      <button 
                        onClick={() => router.push(`/admin/customers/${customer._id}`)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-lg text-sm transition-colors flex items-center"
                      >
                        View Details
                        <RiArrowRightLine className="ml-1" size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
