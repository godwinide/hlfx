'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RiSettings4Line, RiLockLine, RiSaveLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

// Site settings validation schema
const siteSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Please enter a valid email'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required')
});

// Password change validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type SiteFormData = z.infer<typeof siteSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface SiteSettings {
  _id: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [siteError, setSiteError] = useState<string>('');
  const [siteSuccess, setSiteSuccess] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [passwordSuccess, setPasswordSuccess] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Site settings form
  const {
    register: registerSite,
    handleSubmit: handleSiteSubmit,
    reset: resetSite,
    formState: { errors: siteErrors, isSubmitting: siteSubmitting }
  } = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema)
  });

  // Password change form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting }
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings/site');
      
      if (!response.ok) {
        throw new Error('Failed to fetch site settings');
      }
      
      const data = await response.json();
      setSiteSettings(data.site);
      resetSite(data.site);
    } catch (error) {
      console.error('Error fetching site settings:', error);
      setSiteError('Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  const onSiteSubmit = async (data: SiteFormData) => {
    setSiteError('');
    setSiteSuccess('');

    try {
      const response = await fetch('/api/admin/settings/site', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update site settings');
      }

      setSiteSettings(result.site);
      setSiteSuccess('Site settings updated successfully!');
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSiteSuccess('');
      }, 5000);

    } catch (err) {
      setSiteError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password');
      }

      resetPassword();
      setPasswordSuccess('Password changed successfully!');
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setPasswordSuccess('');
      }, 5000);

    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-r from-teal-500 to-teal-700 rounded-xl">
          <RiSettings4Line className="text-2xl text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Manage site settings and account security</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Settings */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <RiSettings4Line className="text-teal-400 text-xl" />
            <h2 className="text-xl font-bold text-white">Site Settings</h2>
          </div>

          {siteError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4 mb-6">
              {siteError}
            </div>
          )}

          {siteSuccess && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg p-4 mb-6">
              {siteSuccess}
            </div>
          )}

          <form onSubmit={handleSiteSubmit(onSiteSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...registerSite('phone')}
                  className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="+1-800-HALIFAX"
                />
                {siteErrors.phone && (
                  <p className="mt-1 text-sm text-red-500">{siteErrors.phone.message}</p>
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
                  {...registerSite('email')}
                  className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="info@halifax.bank"
                />
                {siteErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{siteErrors.email.message}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
                Address
              </label>
              <input
                id="address"
                type="text"
                {...registerSite('address')}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="123 Halifax Banking Center"
              />
              {siteErrors.address && (
                <p className="mt-1 text-sm text-red-500">{siteErrors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  {...registerSite('city')}
                  className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Halifax"
                />
                {siteErrors.city && (
                  <p className="mt-1 text-sm text-red-500">{siteErrors.city.message}</p>
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
                  {...registerSite('state')}
                  className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Nova Scotia"
                />
                {siteErrors.state && (
                  <p className="mt-1 text-sm text-red-500">{siteErrors.state.message}</p>
                )}
              </div>

              {/* ZIP */}
              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-gray-300 mb-1">
                  ZIP/Postal Code
                </label>
                <input
                  id="zip"
                  type="text"
                  {...registerSite('zip')}
                  className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="B3H 0A1"
                />
                {siteErrors.zip && (
                  <p className="mt-1 text-sm text-red-500">{siteErrors.zip.message}</p>
                )}
              </div>
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
                Country
              </label>
              <select
                id="country"
                {...registerSite('country')}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 [&>option]:bg-gray-800 [&>option]:text-white"
              >
                <option value="Canada" className="bg-gray-800 text-white">Canada</option>
                <option value="US" className="bg-gray-800 text-white">United States</option>
                <option value="GB" className="bg-gray-800 text-white">United Kingdom</option>
                <option value="AU" className="bg-gray-800 text-white">Australia</option>
                <option value="DE" className="bg-gray-800 text-white">Germany</option>
                <option value="FR" className="bg-gray-800 text-white">France</option>
                <option value="JP" className="bg-gray-800 text-white">Japan</option>
              </select>
              {siteErrors.country && (
                <p className="mt-1 text-sm text-red-500">{siteErrors.country.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={siteSubmitting}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RiSaveLine />
                {siteSubmitting ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Password Settings */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <RiLockLine className="text-teal-400 text-xl" />
            <h2 className="text-xl font-bold text-white">Change Password</h2>
          </div>

          {passwordError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4 mb-6">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg p-4 mb-6">
              {passwordSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  {...registerPassword('currentPassword')}
                  className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showCurrentPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  {...registerPassword('newPassword')}
                  className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showNewPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...registerPassword('confirmPassword')}
                  className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passwordSubmitting}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RiLockLine />
                {passwordSubmitting ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
