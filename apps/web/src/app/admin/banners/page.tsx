"use client";
import { getOptimizedImageUrl } from "@/utils/image";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utils/api";
import {
    Plus,
    Edit,
    Trash2,
    Image as ImageIcon,
    ExternalLink,
    AlertCircle
} from "lucide-react";

interface Banner {
    _id: string;
    title: string;
    image: string;
    link?: string;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    position: number;
}

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        link: "",
        isActive: true,
        startDate: "",
        endDate: "",
        position: 0,
        image: null as File | null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchBanners = async () => {
        setIsLoading(true);
        try {
            const res: any = await apiGet("/api/v1/banners?active=all"); // Assuming backend supports returning all
            if (res.status === "success") {
                setBanners(res.data.banners);
            }
        } catch (error) {
            console.error("Failed to fetch banners", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleOpenModal = (banner?: Banner) => {
        if (banner) {
            setCurrentBanner(banner);
            setFormData({
                title: banner.title,
                link: banner.link || "",
                isActive: banner.isActive,
                startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : "",
                endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : "",
                position: banner.position,
                image: null
            });
        } else {
            setCurrentBanner(null);
            setFormData({
                title: "",
                link: "",
                isActive: true,
                startDate: "",
                endDate: "",
                position: 0,
                image: null
            });
        }
        setIsModalOpen(true);
    };

    const handleDeleteClick = (banner: Banner) => {
        setCurrentBanner(banner);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("link", formData.link);
            data.append("isActive", String(formData.isActive));
            if (formData.startDate) data.append("startDate", formData.startDate);
            if (formData.endDate) data.append("endDate", formData.endDate);
            data.append("position", String(formData.position));
            if (formData.image) data.append("image", formData.image);

            if (currentBanner) {
                await apiPut(`/api/v1/banners/${currentBanner._id}`, data);
            } else {
                await apiPost("/api/v1/banners", data);
            }
            setIsModalOpen(false);
            fetchBanners();
        } catch (error) {
            console.error("Failed to save banner", error);
            alert("Failed to save banner");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!currentBanner) return;
        try {
            await apiDelete(`/api/v1/banners/${currentBanner._id}`);
            setIsDeleteModalOpen(false);
            fetchBanners();
        } catch (error) {
            console.error("Failed to delete banner", error);
            alert("Failed to delete banner");
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Banners Management</h1>
                        <p className="mt-2 text-sm text-gray-600">Manage homepage promotional banners</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
                    >
                        <Plus size={20} />
                        Add Banner
                    </button>
                </div>

                {/* Hint Alert */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-blue-900">Banner Specifications & Link Guide</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            <strong>Image:</strong> Recommended size: <strong>1200x400px</strong>. Max file size: <strong>5MB</strong>. Supported formats: JPG, PNG, WEBP.
                        </p>
                        <p className="text-sm text-blue-700 mt-2">
                            <strong>Links:</strong> You can use internal links (e.g., <code className="bg-blue-100 px-1 rounded">/marketplace</code>) or external links (e.g., <code className="bg-blue-100 px-1 rounded">https://example.com</code>).
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                            <strong>WhatsApp:</strong> For business contact, use international format without leading zero: <code className="bg-blue-100 px-1 rounded">https://wa.me/2348107060160</code> (Nigeria example)
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading banners...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {banners.map((banner) => (
                                        <tr key={banner._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="w-24 h-12 bg-gray-100 rounded overflow-hidden">
                                                    <img src={getOptimizedImageUrl(banner.image, { width: 200, quality: 70 })} alt={banner.title} className="w-full h-full object-cover" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {banner.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {banner.position}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {banner.link ? (
                                                    <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                        Link <ExternalLink size={12} />
                                                    </a>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleOpenModal(banner)} className="text-blue-600 hover:text-blue-900">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(banner)} className="text-red-600 hover:text-red-900">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {banners.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                No banners found. Create one to get started.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                            <h2 className="text-xl font-bold mb-4">{currentBanner ? 'Edit Banner' : 'Add Banner'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.link}
                                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., /marketplace or https://wa.me/2348107060160"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Internal link: <code className="bg-gray-100 px-1 rounded">/marketplace</code> |
                                        WhatsApp: <code className="bg-gray-100 px-1 rounded">https://wa.me/2348107060160</code> |
                                        External: <code className="bg-gray-100 px-1 rounded">https://example.com</code>
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                        <input
                                            type="number"
                                            value={formData.position}
                                            onChange={e => setFormData({ ...formData, position: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Active</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setFormData({ ...formData, image: e.target.files ? e.target.files[0] : null })}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        required={!currentBanner}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Recommended: 1200x400px, Max 5MB</p>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Banner'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Banner</h3>
                            <p className="text-gray-600 mb-6">Are you sure you want to delete this banner? This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
