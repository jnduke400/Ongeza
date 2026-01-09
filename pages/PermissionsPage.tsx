import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Plus, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, X, AlertTriangle, MoreVertical, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { ApiPermission } from '../types';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Converts API strings (e.g., "USER_MANAGEMENT") to "User Management".
const formatApiString = (str: string | null | undefined): string => {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Role Badge Component with colors
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
    const colorMap: { [key: string]: string } = {
        'Administrator': 'bg-indigo-100 text-indigo-700',
        'Manager': 'bg-amber-100 text-amber-700',
        'Users': 'bg-green-100 text-green-700',
        'Support': 'bg-cyan-100 text-cyan-700',
        'Restricted User': 'bg-red-100 text-red-700',
    };
    // A default color for roles not in the map
    const defaultColor = 'bg-gray-100 text-gray-700';
    const formattedRole = formatApiString(role);
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${colorMap[formattedRole] || defaultColor}`}>
            {formattedRole}
        </span>
    );
};

// Add Permission Modal
const AddPermissionModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: () => void }> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isSaving) return;

        setIsSaving(true);
        setError('');
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/permissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() })
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to add permission.');
            }
            onAdd();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-surface text-on-surface rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="relative p-8 text-center">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                        <X size={24} />
                    </button>
                    <h2 className="text-2xl font-bold">Add Permission</h2>
                    <p className="text-gray-500 mt-2">Add permission as per your requirements.</p>
                </div>

                <div className="p-8 pt-0">
                    <div className="bg-amber-100 border border-amber-200 rounded-lg p-4 flex items-start space-x-4 mb-6">
                        <AlertTriangle className="text-amber-500 h-6 w-6 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-bold text-amber-800">Warning!</p>
                            <p className="text-amber-700 text-sm mt-1">By adding the permission name, you might break the system permissions functionality.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <div className="flex items-center space-x-4 mb-6">
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter Permission Name"
                                className="flex-grow bg-white border border-gray-300 rounded-lg px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                            />
                            <button 
                                type="submit" 
                                disabled={isSaving} 
                                className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center min-w-[120px] disabled:bg-primary/70 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        <span>Adding...</span>
                                    </>
                                ) : (
                                    'Add'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Edit Permission Modal
const EditPermissionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    permission: ApiPermission | null;
}> = ({ isOpen, onClose, onUpdate, permission }) => {
    const [name, setName] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (permission) {
            setName(formatApiString(permission.name));
            setError(null);
        }
    }, [permission]);

    if (!isOpen || !permission) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isUpdating) return;
        setIsUpdating(true);
        setError(null);
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/permissions/${permission.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() })
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update permission.');
            }
            onUpdate();
            onClose();
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-surface text-on-surface rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="relative p-8 text-center">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                        <X size={24} />
                    </button>
                    <h2 className="text-2xl font-bold">Edit Permission</h2>
                    <p className="text-gray-500 mt-2">Edit permission as per your requirements.</p>
                </div>

                <div className="p-8 pt-0">
                    <div className="bg-amber-100 border border-amber-200 rounded-lg p-4 flex items-start space-x-4 mb-6">
                        <AlertTriangle className="text-amber-500 h-6 w-6 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-bold text-amber-800">Warning!</p>
                            <p className="text-amber-700 text-sm mt-1">By editing the permission name, you might break the system permissions functionality.</p>
                        </div>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className="flex items-center space-x-4 mb-6">
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter Permission Name"
                                className="flex-grow bg-white border border-gray-300 rounded-lg px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                            />
                            <button 
                                type="submit" 
                                disabled={isUpdating} 
                                className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center min-w-[120px] disabled:bg-primary/70 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    'Update'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 10 }) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, index) => (
                <tr key={index} className="border-b border-gray-200 animate-pulse">
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                            <div className="h-6 w-24 bg-gray-200 rounded-md"></div>
                            <div className="h-6 w-20 bg-gray-200 rounded-md"></div>
                        </div>
                    </td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                </tr>
            ))}
        </>
    );
};

// Main Permissions Page Component
const PermissionsPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [permissions, setPermissions] = useState<ApiPermission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<ApiPermission | null>(null);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const canCreatePermission = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('CREATE_PERMISSION');
    }, [currentUser]);

    const canEditPermission = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('EDIT_PERMISSION');
    }, [currentUser]);

    // Debounce search query
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setCurrentPage(1); // Reset to first page on new search
        }, 500);

        return () => {
            clearTimeout(timerId);
        };
    }, [searchQuery]);

    const fetchPermissions = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: String(currentPage - 1),
                size: String(itemsPerPage),
            });
            if (debouncedSearchQuery) {
                params.append('search', debouncedSearchQuery);
            }

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/permissions?${params.toString()}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch permissions.');
            }
            const data = await response.json();
            if (data.success && Array.isArray(data.data.content)) {
                setPermissions(data.data.content);
                setTotalPages(data.data.totalPages);
                setTotalElements(data.data.totalElements);
            } else {
                throw new Error(data.message || 'Failed to process permissions data');
            }
        } catch (err: any) {
            setError(err.message);
            setPermissions([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, [currentPage, itemsPerPage, debouncedSearchQuery]);
    
    const handleEditClick = (permission: ApiPermission) => {
        setEditingPermission(permission);
        setIsEditModalOpen(true);
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        const datePart = date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).replace(',', '');
        const timePart = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
        return `${datePart}, ${timePart}`;
    };

    return (
        <div className="space-y-6">
            <AddPermissionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={fetchPermissions} />
            <EditPermissionModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                onUpdate={fetchPermissions}
                permission={editingPermission}
            />
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Permissions List</h1>
            <p className="text-gray-500 mb-6">Each category (Basic, Professional, and Business) includes the four predefined roles shown below.</p>

            <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-100">
                {/* Table Controls */}
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>Show</span>
                        <select 
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="bg-white border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                        </select>
                        <span>entries</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Permission"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        {canCreatePermission && (
                            <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md flex items-center space-x-2 transition-colors"
                            >
                                <Plus size={20} />
                                <span>Add Permission</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                                <th className="p-4 text-left font-semibold">Name</th>
                                <th className="p-4 text-left font-semibold">Assigned To</th>
                                <th className="p-4 text-left font-semibold">Created Date</th>
                                <th className="p-4 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton rows={itemsPerPage} />
                            ) : error ? (
                                <tr><td colSpan={4} className="text-center p-8 text-red-500">Error: {error}</td></tr>
                            ) : permissions.length > 0 ? (
                                permissions.map(permission => (
                                    <tr key={permission.id} className="border-b border-gray-200 hover:bg-gray-50 text-sm">
                                        <td className="p-4 font-semibold text-gray-800">{formatApiString(permission.name)}</td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {permission.roleNames.map(role => <RoleBadge key={role} role={role} />)}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">{formatDate(permission.createdAt)}</td>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-3 text-gray-400">
                                                {canEditPermission && (
                                                    <button onClick={() => handleEditClick(permission)} className="hover:text-primary"><Edit2 size={18} /></button>
                                                )}
                                                <button className="hover:text-red-500"><Trash2 size={18}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="text-center p-8 text-gray-500">No permissions found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
                    <p>
                        Showing {permissions.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalElements)} of {totalElements} entries
                    </p>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronsLeft size={16} /></button>
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16} /></button>
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 font-semibold rounded">{currentPage}</span>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages || totalPages === 0} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16} /></button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages || totalPages === 0} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronsRight size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PermissionsPage;