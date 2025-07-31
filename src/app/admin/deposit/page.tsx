'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RiMoneyDollarCircleLine, RiUserLine } from 'react-icons/ri';

// Validation schema
const depositSchema = z.object({
  accountNumber: z.string().min(1, 'Account number is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().optional()
});

type DepositFormData = z.infer<typeof depositSchema>;

interface DepositResponse {
  message: string;
  transaction: {
    _id: string;
    amount: number;
    description: string;
    fromUser: {
      name: string;
      accountNumber: string;
    };
    toUser: {
      name: string;
      accountNumber: string;
    };
    createdAt: string;
  };
  customerBalance: number;
}

export default function DepositPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<DepositResponse | null>(null);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema)
  });

  const onSubmit = async (data: DepositFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process deposit');
      }

      setSuccess(result);
      reset();
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-6">Customer Deposit</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg p-4 mb-6">
            <p className="font-semibold mb-2">Deposit Successful!</p>
            <div className="text-sm space-y-1">
              <p><strong>Amount:</strong> ${success.transaction.amount.toFixed(2)}</p>
              <p><strong>To:</strong> {success.transaction.toUser.name} ({success.transaction.toUser.accountNumber})</p>
              <p><strong>New Balance:</strong> ${success.customerBalance.toFixed(2)}</p>
              <p><strong>Transaction ID:</strong> {success.transaction._id}</p>
              {success.transaction.description && (
                <p><strong>Description:</strong> {success.transaction.description}</p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Account Number */}
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-300 mb-1">
                Account Number
              </label>
              <input
                id="accountNumber"
                type="text"
                {...register('accountNumber')}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter account number"
              />
              {errors.accountNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.accountNumber.message}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                Deposit Amount
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                {...register('amount', { valueAsNumber: true })}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description')}
              className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              placeholder="Enter transaction description..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Process Deposit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
