'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RiUserLine, RiPhoneLine, RiMapPinLine, RiMailLine, RiWalletLine, RiEditLine, RiSaveLine, RiArrowLeftLine, RiCalendarLine, RiShieldCheckLine, RiDeleteBinLine } from 'react-icons/ri';
import Link from 'next/link';

// Form validation schema for editing customer
const editCustomerSchema = z.object({
  firstname: z.string().min(1, { message: 'First name is required' }),
  lastname: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Please enter a valid email' }),
  phoneNumber: z.string().min(1, { message: 'Phone number is required' }),
  address: z.string().min(1, { message: 'Address is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  state: z.string().min(1, { message: 'State is required' }),
  country: z.string().min(1, { message: 'Country is required' }),
  postalCode: z.string().min(1, { message: 'Postal code is required' }),
  balance: z.string().min(1, { message: 'Balance is required' }),
  currency: z.string().min(1, { message: 'Currency is required' }),
  transactionPin: z.string().optional().refine((val) => !val || /^\d{4,6}$/.test(val), {
    message: 'Transaction PIN must be 4-6 digits if provided'
  }),
});

type EditCustomerFormData = z.infer<typeof editCustomerSchema>;

interface Customer {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  accountNumber: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  balance: number;
  currency: string;
  transactionPin: string;
  createdAt: string;
  updatedAt: string;
}

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditCustomerFormData>({
    resolver: zodResolver(editCustomerSchema),
  });

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/customers/${customerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }
      
      const data = await response.json();
      setCustomer(data.customer);
      
      // Reset form with customer data
      reset({
        firstname: data.customer.firstname || '',
        lastname: data.customer.lastname || '',
        email: data.customer.email || '',
        phoneNumber: data.customer.phoneNumber || '',
        address: data.customer.address || '',
        city: data.customer.city || '',
        state: data.customer.state || '',
        country: data.customer.country || 'US',
        postalCode: data.customer.postalCode || '',
        balance: (data.customer.balance || 0).toString(),
        currency: data.customer.currency || 'USD',
        transactionPin: '', // Always empty for security
      });
    } catch (error) {
      console.error('Error fetching customer:', error);
      setError('Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<EditCustomerFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          balance: parseFloat(data.balance) || 0,
          transactionPin: data.transactionPin || undefined, // Only send if provided
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update customer');
      }

      const result = await response.json();
      setCustomer(result.customer);
      setSuccess(true);
      setIsEditing(false);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete customer');
      }

      // Redirect to customers list after successful deletion
      router.push('/admin/customers?deleted=true');
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the customer');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸',
      'CA': '🇨🇦',
      'GB': '🇬🇧',
      'AU': '🇦🇺',
      'DE': '🇩🇪',
      'FR': '🇫🇷',
      'JP': '🇯🇵',
      'IN': '🇮🇳',
      'BR': '🇧🇷',
      'MX': '🇲🇽',
      'VN': '🇻🇳',
    };
    return flags[countryCode] || '🌍';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading customer details...</div>
        </div>
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button 
            onClick={fetchCustomer}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors mr-4"
          >
            Retry
          </button>
          <Link 
            href="/admin/customers"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-4">Customer not found</div>
          <Link 
            href="/admin/customers"
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center">
          <Link 
            href="/admin/customers"
            className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <RiArrowLeftLine size={24} />
          </Link>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center mr-4">
              <span className="text-white font-bold text-lg">
                {customer.firstname[0]}{customer.lastname[0]}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {customer.firstname} {customer.lastname}
              </h1>
              <div className="space-y-1">
                <p className="text-teal-400 font-mono font-semibold">Account: {customer.accountNumber}</p>
                <p className="text-gray-400">Customer ID: {customer._id.slice(-8)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <RiEditLine className="mr-2" size={16} />
                Edit Customer
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <RiDeleteBinLine className="mr-2" size={16} />
                Delete Customer
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                  if (customer) {
                    reset({
                      firstname: customer.firstname || '',
                      lastname: customer.lastname || '',
                      email: customer.email || '',
                      phoneNumber: customer.phoneNumber || '',
                      address: customer.address || '',
                      city: customer.city || '',
                      state: customer.state || '',
                      country: customer.country || 'US',
                      postalCode: customer.postalCode || '',
                      balance: (customer.balance || 0).toString(),
                      currency: customer.currency || 'USD',
                    });
                  }
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit(onSubmit as any)}
                disabled={isSubmitting}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
              >
                <RiSaveLine className="mr-2" size={16} />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg">
          Customer updated successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <RiUserLine className="mr-2 text-teal-400" />
              Personal Information
            </h2>
            
            {isEditing ? (
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
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

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    {...register('phoneNumber')}
                    className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="transactionPin" className="block text-sm font-medium text-gray-300 mb-1">
                    New Transaction PIN
                  </label>
                  <input
                    id="transactionPin"
                    type="password"
                    {...register('transactionPin')}
                    className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Leave empty to keep current PIN"
                    maxLength={6}
                  />
                  {errors.transactionPin && (
                    <p className="mt-1 text-sm text-red-500">{errors.transactionPin.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">Enter 4-6 digits to change PIN, or leave empty to keep current PIN</p>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <RiUserLine className="text-gray-400 mr-3" size={20} />
                  <div>
                    <p className="text-gray-400 text-sm">Full Name</p>
                    <p className="text-white font-medium">{customer.firstname} {customer.lastname}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <RiMailLine className="text-gray-400 mr-3" size={20} />
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white">{customer.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <RiPhoneLine className="text-gray-400 mr-3" size={20} />
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <p className="text-white">{customer.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Address Information */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <RiMapPinLine className="mr-2 text-teal-400" />
              Address Information
            </h2>
            
            {isEditing ? (
              <form className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
                    Street Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    {...register('address')}
                    className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      {...register('city')}
                      className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-300 mb-1">
                      State/Province
                    </label>
                    <input
                      id="state"
                      type="text"
                      {...register('state')}
                      className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-300 mb-1">
                      Postal Code
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      {...register('postalCode')}
                      className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-500">{errors.postalCode.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
                    Country
                  </label>
                  <select
                    id="country"
                    {...register('country')}
                    className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 [&>option]:bg-gray-800 [&>option]:text-white"
                  >
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
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Street Address</p>
                  <p className="text-white">{customer.address || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">City</p>
                    <p className="text-white">{customer.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">State/Province</p>
                    <p className="text-white">{customer.state || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Postal Code</p>
                    <p className="text-white">{customer.postalCode || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getCountryFlag(customer.country || 'US')}</span>
                  <div>
                    <p className="text-gray-400 text-sm">Country</p>
                    <p className="text-white">{customer.country || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Information */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <RiWalletLine className="mr-2 text-teal-400" />
              Account Information
            </h2>
            
            {isEditing ? (
              <form className="space-y-4">
                <div>
                  <label htmlFor="balance" className="block text-sm font-medium text-gray-300 mb-1">
                    Balance
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
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Current Balance</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(customer.balance, customer.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Currency</p>
                  <p className="text-white">{customer.currency}</p>
                </div>
              </div>
            )}
          </div>

          {/* Account Details */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <RiShieldCheckLine className="mr-2 text-teal-400" />
              Account Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Account Number</p>
                <p className="text-white font-mono text-lg font-bold">{customer.accountNumber}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Customer ID</p>
                <p className="text-white font-mono">{customer._id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Transaction PIN</p>
                <p className="text-white font-mono">••••••</p>
                <p className="text-xs text-gray-500 mt-1">PIN is securely hashed and cannot be displayed</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Account Created</p>
                <p className="text-white">{formatDate(customer.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Last Updated</p>
                <p className="text-white">{formatDate(customer.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mr-4">
                <RiDeleteBinLine className="text-red-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete Customer</h3>
                <p className="text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-2">
                Are you sure you want to delete this customer?
              </p>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-white font-semibold">{customer.firstname} {customer.lastname}</p>
                <p className="text-gray-400 text-sm">Account: {customer.accountNumber}</p>
                <p className="text-gray-400 text-sm">{customer.email}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <RiDeleteBinLine className="mr-2" size={16} />
                {isDeleting ? 'Deleting...' : 'Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
