'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RiUserAddLine, RiSearchLine, RiEyeLine, RiEditLine, RiFilterLine, RiUserLine, RiAddLine } from 'react-icons/ri';
import Link from 'next/link';

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
  createdAt: string;
  updatedAt: string;
}

interface CustomerResponse {
  customers: Customer[];
}

export default function CustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchParams.get('deleted') === 'true') {
      setShowDeleteSuccess(true);
      // Remove the parameter from URL
      router.replace('/admin/customers');
      // Hide success message after 5 seconds
      setTimeout(() => setShowDeleteSuccess(false), 5000);
    }
  }, [searchParams, router]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/customers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const data: CustomerResponse = await response.json();
      setCustomers(data.customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to load customers');
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
    };
    return flags[countryCode] || '🌍';
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber.includes(searchTerm) ||
      customer.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = filterCountry === '' || customer.country === filterCountry;
    
    return matchesSearch && matchesCountry;
  });

  const uniqueCountries = [...new Set(customers.map(customer => customer.country))];

  const handleViewDetails = (customer: Customer) => {
    router.push(`/admin/customers/${customer._id}`);
  };

  const handleEditCustomer = (customer: Customer) => {
    router.push(`/admin/customers/${customer._id}`);
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading customers...</div>
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
            onClick={fetchCustomers}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <RiUserLine className="mr-3 text-teal-400" size={32} />
            Customers
          </h1>
          <p className="text-gray-400 mt-1">Manage and view customer information</p>
        </div>
        <Link
          href="/admin/add-customer"
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center w-fit"
        >
          <RiAddLine className="mr-2" size={16} />
          Add New Customer
        </Link>
      </div>

      {/* Delete Success Message */}
      {showDeleteSuccess && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg p-4">
          <div className="font-semibold">Customer deleted successfully!</div>
          <div className="text-sm mt-1">The customer has been permanently removed from the system.</div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search customers by name, email, phone, or account number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
          
          {/* Country Filter */}
          <div className="lg:w-48">
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 [&>option]:bg-gray-800 [&>option]:text-white"
            >
              <option value="" className="bg-gray-800 text-white">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country} className="bg-gray-800 text-white">
                  {getCountryFlag(country)} {country}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            Showing {filteredCustomers.length} of {customers.length} customers
          </p>
          <div className="flex items-center gap-2">
            <RiFilterLine className="text-gray-400" size={16} />
            <span className="text-gray-400 text-sm">Filters active: {searchTerm || filterCountry ? '✓' : 'None'}</span>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-gray-700">
                <th className="text-left text-gray-400 text-sm font-semibold p-4">Customer</th>
                <th className="text-left text-gray-400 text-sm font-semibold p-4">Account</th>
                <th className="text-left text-gray-400 text-sm font-semibold p-4">Contact</th>
                <th className="text-left text-gray-400 text-sm font-semibold p-4">Balance</th>
                <th className="text-left text-gray-400 text-sm font-semibold p-4">Joined</th>
                <th className="text-left text-gray-400 text-sm font-semibold p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-semibold text-sm">
                            {customer.firstname[0]}{customer.lastname[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {customer.firstname} {customer.lastname}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {customer._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-white text-sm">
                        {customer.accountNumber}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-white text-sm">{customer.email}</div>
                        <div className="text-gray-400 text-xs">{customer.phoneNumber}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-green-400">
                        {formatCurrency(customer.balance, customer.currency)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-300 text-sm">
                        {formatDate(customer.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(customer)}
                          className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <RiEyeLine size={16} />
                        </button>
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                          title="Edit Customer"
                        >
                          <RiEditLine size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    {searchTerm || filterCountry ? 'No customers match your search criteria' : 'No customers found'}
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