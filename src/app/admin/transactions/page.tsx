'use client';

import { useEffect, useState } from 'react';
import { RiSearchLine, RiFilterLine, RiExchangeLine, RiArrowRightLine, RiArrowDownLine, RiArrowUpLine } from 'react-icons/ri';

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  fromUser: {
    _id: string;
    name: string;
    email: string;
  } | null;
  toUser: {
    _id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface TransactionResponse {
  transactions: Transaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTransactions: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<TransactionResponse['pagination'] | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/transactions?page=${currentPage}&limit=20`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data: TransactionResponse = await response.json();
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionType = (transaction: Transaction) => {
    if (!transaction.fromUser || !transaction.toUser) return 'Unknown';
    
    const isHalifaxFrom = transaction.fromUser.email === 'halifax@bank.system';
    const isHalifaxTo = transaction.toUser.email === 'halifax@bank.system';
    
    if (isHalifaxFrom && !isHalifaxTo) return 'Deposit';
    if (!isHalifaxFrom && isHalifaxTo) return 'Withdrawal';
    return 'Transfer';
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Deposit':
        return <RiArrowDownLine className="text-green-400" />;
      case 'Withdrawal':
        return <RiArrowUpLine className="text-red-400" />;
      case 'Transfer':
        return <RiArrowRightLine className="text-blue-400" />;
      default:
        return <RiExchangeLine className="text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'Deposit':
        return 'text-green-400';
      case 'Withdrawal':
        return 'text-red-400';
      case 'Transfer':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const type = getTransactionType(transaction);
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.fromUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.toUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.fromUser?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.toUser?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === '' || type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading transactions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">Error loading transactions</div>
          <button 
            onClick={fetchTransactions}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-gray-400 mt-1">
            {pagination ? `${pagination.totalTransactions} total transactions` : 'Manage all transactions'}
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions, users, or transaction IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Filter by Type */}
          <div className="relative">
            <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none min-w-[150px]"
            >
              <option value="">All Types</option>
              <option value="Deposit">Deposits</option>
              <option value="Withdrawal">Withdrawals</option>
              <option value="Transfer">Transfers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="text-left text-gray-400 text-sm font-semibold p-4">Transaction</th>
                <th className="text-left text-gray-400 text-sm font-semibold p-4">Type</th>
                <th className="text-left text-gray-400 text-sm font-semibold p-4">From</th>
                <th className="text-left text-gray-400 text-sm font-semibold p-4">To</th>
                <th className="text-left text-gray-400 text-sm font-semibold p-4">Amount</th>
                <th className="text-left text-gray-400 text-sm font-semibold p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => {
                  const type = getTransactionType(transaction);
                  return (
                    <tr key={transaction._id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center mr-3">
                            {getTransactionIcon(type)}
                          </div>
                          <div>
                            <div className="font-medium text-white text-sm">
                              {transaction.description}
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                              ID: {transaction._id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          type === 'Deposit' ? 'bg-green-900/50 text-green-300' :
                          type === 'Withdrawal' ? 'bg-red-900/50 text-red-300' :
                          type === 'Transfer' ? 'bg-blue-900/50 text-blue-300' :
                          'bg-gray-900/50 text-gray-300'
                        }`}>
                          {type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="text-white text-sm">
                            {transaction.fromUser?.name || 'Unknown'}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {transaction.fromUser?.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="text-white text-sm">
                            {transaction.toUser?.name || 'Unknown'}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {transaction.toUser?.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`font-semibold ${getTransactionColor(type)}`}>
                          {formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-300 text-sm">
                          {formatDate(transaction.createdAt)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    {searchTerm || filterType ? 'No transactions match your search criteria' : 'No transactions found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="text-gray-400 text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPrevPage}
                className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg transition-colors text-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!pagination.hasNextPage}
                className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg transition-colors text-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
