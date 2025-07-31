'use client';

import { useState } from 'react';
import { 
    RiSaveLine,
    RiInstagramLine,
    RiTwitterLine,
    RiYoutubeLine,
    RiTiktokLine,
    RiImageLine
} from 'react-icons/ri';

interface CelebrityFormData {
    name: string;
    profession: string;
    bio: string;
    imageUrl: string;
    coverImageUrl?: string;
    socialMedia: {
        instagram?: string;
        twitter?: string;
        tiktok?: string;
        youtube?: string;
    };
    featured: boolean;
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    event: number;
    // Subscription options
    monthly?: number;
    quarterly?: number;
    annual?: number;
}

interface Props {
    initialData?: CelebrityFormData;
    onSubmit: (data: CelebrityFormData) => Promise<void>;
    onCancel?: () => void;
}

const defaultFormData: CelebrityFormData = {
    name: '',
    profession: '',
    bio: '',
    imageUrl: '',
    coverImageUrl: '',
    socialMedia: {
        instagram: '',
        twitter: '',
        tiktok: '',
        youtube: ''
    },
    featured: false,
    bronze: 99,
    silver: 199,
    gold: 499,
    platinum: 999,
    event: 299,
    // Subscription options
    monthly: 9.99,
    quarterly: 24.99,
    annual: 89.99
};

export default function CelebrityForm({ initialData, onSubmit, onCancel }: Props) {
    const [formData, setFormData] = useState<CelebrityFormData>(initialData || defaultFormData);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await onSubmit(formData);
        } catch (error) {
            console.error('Error submitting celebrity:', error);
            // TODO: Show error toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-white">
            {/* Image URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Profile Image URL
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <RiImageLine className="text-gray-400" size={20} />
                        </div>
                        <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                            required
                            placeholder="https://example.com/image.jpg"
                            className="text-white w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                    </div>
                </div>
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Cover Image URL (Optional)
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <RiImageLine className="text-gray-400" size={20} />
                        </div>
                        <input
                            type="url"
                            value={formData.coverImageUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, coverImageUrl: e.target.value }))}
                            placeholder="https://example.com/cover.jpg"
                            className="text-white w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                    </div>
                </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="text-white w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Profession
                    </label>
                    <input
                        type="text"
                        value={formData.profession}
                        onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                        required
                        className="text-white w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                </div>
            </div>

            {/* Bio */}
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                    Bio
                </label>
                <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    required
                    rows={4}
                    className="text-white w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
            </div>



            {/* Featured Toggle */}
            <div>
                <label className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                        className="w-4 h-4 text-purple-600 bg-gray-800 rounded focus:ring-purple-600"
                    />
                    <span className="text-sm font-medium text-gray-400">Featured Celebrity</span>
                </label>
            </div>

            {/* Social Media Links */}
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-400">
                    Social Media Links
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <RiInstagramLine className="text-gray-400" size={20} />
                        </div>
                        <input
                            type="url"
                            placeholder="Instagram URL"
                            value={formData.socialMedia.instagram || ''}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                            }))}
                            className="text-white w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <RiTwitterLine className="text-gray-400" size={20} />
                        </div>
                        <input
                            type="url"
                            placeholder="Twitter URL"
                            value={formData.socialMedia.twitter || ''}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                            }))}
                            className="text-white w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <RiTiktokLine className="text-gray-400" size={20} />
                        </div>
                        <input
                            type="url"
                            placeholder="TikTok URL"
                            value={formData.socialMedia.tiktok || ''}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                socialMedia: { ...prev.socialMedia, tiktok: e.target.value }
                            }))}
                            className="text-white w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <RiYoutubeLine className="text-gray-400" size={20} />
                        </div>
                        <input
                            type="url"
                            placeholder="YouTube URL"
                            value={formData.socialMedia.youtube || ''}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                socialMedia: { ...prev.socialMedia, youtube: e.target.value }
                            }))}
                            className="text-white w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                    </div>
                </div>
            </div>

            {/* Fan Card Prices */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Bronze Card Price ($)
                    </label>
                    <input
                        type="number"
                        value={formData.bronze}
                        onChange={(e) => setFormData(prev => ({ ...prev, bronze: parseInt(e.target.value) || 0 }))}
                        min="0"
                        className="text-white w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Silver Card Price ($)
                    </label>
                    <input
                        type="number"
                        value={formData.silver}
                        onChange={(e) => setFormData(prev => ({ ...prev, silver: parseInt(e.target.value) || 0 }))}
                        min="0"
                        className="text-white w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Gold Card Price ($)
                    </label>
                    <input
                        type="number"
                        value={formData.gold}
                        onChange={(e) => setFormData(prev => ({ ...prev, gold: parseInt(e.target.value) || 0 }))}
                        min="0"
                        className="text-white w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Platinum Card Price ($)
                    </label>
                    <input
                        type="number"
                        value={formData.platinum}
                        onChange={(e) => setFormData(prev => ({ ...prev, platinum: parseInt(e.target.value) || 0 }))}
                        min="0"
                        className="text-white w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Event Price ($)
                    </label>
                    <input
                        type="number"
                        value={formData.event}
                        onChange={(e) => setFormData(prev => ({ ...prev, event: parseInt(e.target.value) || 0 }))}
                        min="0"
                        className="text-white w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                </div>
            </div>

            {/* Subscription Prices */}
            <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-3">Subscription Prices</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Monthly Subscription ($)
                        </label>
                        <input
                            type="number"
                            value={formData.monthly}
                            onChange={(e) => setFormData(prev => ({ ...prev, monthly: parseFloat(e.target.value) || 0 }))}
                            min="0"
                            step="0.01"
                            className="text-white w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Quarterly Subscription ($)
                        </label>
                        <input
                            type="number"
                            value={formData.quarterly}
                            onChange={(e) => setFormData(prev => ({ ...prev, quarterly: parseFloat(e.target.value) || 0 }))}
                            min="0"
                            step="0.01"
                            className="text-white w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Annual Subscription ($)
                        </label>
                        <input
                            type="number"
                            value={formData.annual}
                            onChange={(e) => setFormData(prev => ({ ...prev, annual: parseFloat(e.target.value) || 0 }))}
                            min="0"
                            step="0.01"
                            className="text-white w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-400 hover:text-white"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RiSaveLine size={20} />
                    <span>{loading ? 'Saving...' : 'Save Celebrity'}</span>
                </button>
            </div>
        </form>
    );
}
