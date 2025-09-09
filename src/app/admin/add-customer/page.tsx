'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

// Form validation schema
const customerSchema = z.object({
  firstname: z.string().min(1, { message: 'First name is required' }),
  lastname: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
  phoneNumber: z.string().min(1, { message: 'Phone number is required' }),
  address: z.string().min(1, { message: 'Address is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  state: z.string().min(1, { message: 'State is required' }),
  country: z.string().min(1, { message: 'Country is required' }),
  postalCode: z.string().min(1, { message: 'Postal code is required' }),
  balance: z.string().min(1, { message: 'Balance is required' }),
  currency: z.string().min(1, { message: 'Currency is required' }),
  transactionPin: z.string().min(4, { message: 'Transaction PIN must be at least 4 digits' }).max(6, { message: 'Transaction PIN must be at most 6 digits' }).regex(/^\d+$/, { message: 'Transaction PIN must contain only digits' }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function AddCustomerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      balance: '0',
      currency: 'USD',
      transactionPin: '',
    },
  });

  const onSubmit: SubmitHandler<CustomerFormData> = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          password: data.password,
          phoneNumber: data.phoneNumber,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
          balance: parseFloat(data.balance) || 0,
          currency: data.currency,
          transactionPin: data.transactionPin,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create customer');
      }

      // Store the created customer data
      setCreatedCustomer(result.customer);
      
      // Clear the form
      reset();
      setSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
        setCreatedCustomer(null);
      }, 5000);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-6">Add New Customer</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg p-4 mb-6">
            <div className="font-semibold mb-2">Customer created successfully!</div>
            {createdCustomer && (
              <div className="text-sm">
                <div><strong>Account Number:</strong> {createdCustomer.accountNumber}</div>
                <div><strong>Name:</strong> {createdCustomer.firstname} {createdCustomer.lastname}</div>
                <div><strong>Email:</strong> {createdCustomer.email}</div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstname" className="block text-sm font-medium text-gray-300 mb-1">
                First Name
              </label>
              <input
                id="firstname"
                type="text"
                {...register('firstname')}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.firstname && (
                <p className="mt-1 text-sm text-red-500">{errors.firstname.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastname" className="block text-sm font-medium text-gray-300 mb-1">
                Last Name
              </label>
              <input
                id="lastname"
                type="text"
                {...register('lastname')}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.lastname && (
                <p className="mt-1 text-sm text-red-500">{errors.lastname.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Transaction PIN */}
            <div>
              <label htmlFor="transactionPin" className="block text-sm font-medium text-gray-300 mb-1">
                Transaction PIN
              </label>
              <input
                id="transactionPin"
                type="password"
                {...register('transactionPin')}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="4-6 digit PIN"
                maxLength={6}
              />
              {errors.transactionPin && (
                <p className="mt-1 text-sm text-red-500">{errors.transactionPin.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">Enter a 4-6 digit PIN for transaction security</p>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                {...register('phoneNumber')}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="+1 (555) 123-4567"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
                Address
              </label>
              <input
                id="address"
                type="text"
                {...register('address')}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="123 Main Street"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">
                City
              </label>
              <input
                id="city"
                type="text"
                {...register('city')}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="New York"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-300 mb-1">
                State/Province
              </label>
              <input
                id="state"
                type="text"
                {...register('state')}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="NY"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
                Country
              </label>
              <select
                id="country"
                {...register('country')}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 [&>option]:bg-gray-800 [&>option]:text-white"
              >
                <option value="" className="bg-gray-800 text-white">Select Country</option>
                <option value="US" className="bg-gray-800 text-white">United States</option>
                <option value="CA" className="bg-gray-800 text-white">Canada</option>
                <option value="GB" className="bg-gray-800 text-white">United Kingdom</option>
                <option value="AU" className="bg-gray-800 text-white">Australia</option>
                <option value="DE" className="bg-gray-800 text-white">Germany</option>
                <option value="FR" className="bg-gray-800 text-white">France</option>
                <option value="JP" className="bg-gray-800 text-white">Japan</option>
                <option value="IN" className="bg-gray-800 text-white">India</option>
                <option value="BR" className="bg-gray-800 text-white">Brazil</option>
                <option value="MX" className="bg-gray-800 text-white">Mexico</option>
                <option value="VN" className="bg-gray-800 text-white">Vietnam</option>
              </select>
              {errors.country && (
                <p className="mt-1 text-sm text-red-500">{errors.country.message}</p>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-300 mb-1">
                Postal Code
              </label>
              <input
                id="postalCode"
                type="text"
                {...register('postalCode')}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="10001"
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-red-500">{errors.postalCode.message}</p>
              )}
            </div>

            {/* Balance */}
            <div>
              <label htmlFor="balance" className="block text-sm font-medium text-gray-300 mb-1">
                Initial Balance
              </label>
              <input
                id="balance"
                type="number"
                step="0.01"
                {...register('balance')}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.balance && (
                <p className="mt-1 text-sm text-red-500">{errors.balance.message}</p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-300 mb-1">
                Currency
              </label>
              <select
                id="currency"
                {...register('currency')}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 [&>option]:bg-gray-800 [&>option]:text-white"
              >
                <option value="USD" className="bg-gray-800 text-white">USD - US Dollar</option>
                <option value="EUR" className="bg-gray-800 text-white">EUR - Euro</option>
                <option value="GBP" className="bg-gray-800 text-white">GBP - British Pound</option>
                <option value="CAD" className="bg-gray-800 text-white">CAD - Canadian Dollar</option>
                <option value="JPY" className="bg-gray-800 text-white">JPY - Japanese Yen</option>
                <option value="AUD" className="bg-gray-800 text-white">AUD - Australian Dollar</option>
                <option value="CHF" className="bg-gray-800 text-white">CHF - Swiss Franc</option>
                <option value="CNY" className="bg-gray-800 text-white">CNY - Chinese Yuan</option>
                <option value="INR" className="bg-gray-800 text-white">INR - Indian Rupee</option>
                <option value="SGD" className="bg-gray-800 text-white">SGD - Singapore Dollar</option>
                <option value="MXN" className="bg-gray-800 text-white">MXN - Mexican Peso</option>
                <option value="BRL" className="bg-gray-800 text-white">BRL - Brazilian Real</option>
                <option value="ZAR" className="bg-gray-800 text-white">ZAR - South African Rand</option>
                <option value="HKD" className="bg-gray-800 text-white">HKD - Hong Kong Dollar</option>
                <option value="AED" className="bg-gray-800 text-white">AED - UAE Dirham</option>
                <option value="VND" className="bg-gray-800 text-white">VND - Vietnamese Dong</option>
              </select>
              {errors.currency && (
                <p className="mt-1 text-sm text-red-500">{errors.currency.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
