import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    MoreVertical, Copy, Plus, Search, ChevronDown, Trash2, Eye, Edit, UserCheck, Shield, 
    ChevronUp, ChevronLeft, ChevronRight, Upload, X,
    Users, TrendingUp, SlidersHorizontal, Loader2, Calendar
} from 'lucide-react';
import { UserForManagement, ApiRole as ApiRoleType, ApiPermission } from '../types';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';
import { tanzaniaRegions, mockRegions } from '../services/mockData';
import { useAuth } from '../contexts/AuthContext';

type UserData = UserForManagement;
type SortableKeys = keyof UserData | 'userName' | 'pinSet';

const RoleCardSkeleton: React.FC = () => (
    <div className="bg-surface p-6 rounded-lg border border-gray-200 shadow-sm animate-pulse">
        <div className="flex justify-between items-center mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
            </div>
        </div>
        <div className="h-7 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
);

const formatApiString = (str: string | null | undefined): string => {
  if (!str || str.toLowerCase() === 'undefined' || str.toLowerCase() === 'null') {
    return 'General';
  }
  return str
    .replace('ROLE_', '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('255')) {
        cleaned = '0' + cleaned.substring(3);
    }
    if (cleaned.length === 10) {
        return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 10)}`;
    }
    return phone;
};

// Helper to get gender-specific shadow placeholder matching requested silhouettes
const getShadowPlaceholder = (gender?: string) => {
    const isFemale = gender?.toUpperCase() === 'FEMALE';
    if (isFemale) return 'https://ui-avatars.com/api/?name=F&background=E2E8F0&color=94A3B8&size=150&bold=true';
    return 'https://ui-avatars.com/api/?name=M&background=E2E8F0&color=94A3B8&size=150&bold=true';
};

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
    const styles: { [key: string]: string } = {
        Active: 'bg-green-100 text-green-700',
        Inactive: 'bg-gray-100 text-gray-700',
        Pending: 'bg-yellow-100 text-yellow-700',
        Dormant: 'bg-gray-100 text-gray-700',
        Suspended: 'bg-yellow-100 text-yellow-700',
        Locked: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

const PinStatusPill: React.FC<{ isSet?: boolean }> = ({ isSet }) => {
    const text = isSet ? 'Set' : 'Not Set';
    const styles = isSet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles}`}>{text}</span>;
};

const RoleCell: React.FC<{ role: string }> = ({ role }) => {
    const icons: { [key: string]: React.ReactNode } = {
        Manager: <Edit size={16} className="text-orange-500" />,
        User: <UserCheck size={16} className="text-green-500" />,
        Admin: <Users size={16} className="text-indigo-500" />,
        Investor: <TrendingUp size={16} className="text-blue-500" />,
    };
    return <div className="flex items-center space-x-2">
        {icons[role] || <Users size={16} className="text-gray-500" />}
        <span>{role}</span>
    </div>
};

const UserCell: React.FC<{ user: UserData['user'] }> = ({ user }) => (
    <div className="flex items-center">
        <img 
            src={user.avatar || getShadowPlaceholder(user.gender)} 
            alt={user.name} 
            className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-100 shadow-sm" 
            onError={(e) => {
                (e.target as HTMLImageElement).src = getShadowPlaceholder(user.gender);
            }}
        />
        <div>
            <p className="font-semibold text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
        </div>
    </div>
);

const SortableTableHeader: React.FC<{
    label: string;
    columnKey: SortableKeys;
    sortConfig: { key: SortableKeys; direction: string };
    requestSort: (key: SortableKeys) => void;
    className?: string;
}> = ({ label, columnKey, sortConfig, requestSort, className = '' }) => {
    const isSorted = sortConfig.key === columnKey;
    const isAscending = isSorted && sortConfig.direction === 'ascending';
    
    return (
        <th 
            className={`p-4 font-semibold text-xs uppercase cursor-pointer ${className}`}
            onClick={() => requestSort(columnKey)}
            aria-label={`Sort by ${label}`}
        >
            <div className="flex items-center space-x-1 text-gray-500 hover:text-gray-800">
                 <span>{label}</span>
                 {isSorted && (isAscending ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
            </div>
        </th>
    );
};

const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 8 }) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                    <td className="p-4"><div className="h-5 w-5 bg-gray-200 rounded"></div></td>
                    <td className="p-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-32"></div>
                            </div>
                        </div>
                    </td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="p-4"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                </tr>
            ))}
        </>
    );
};

const DateFilterModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onApply: (dates: { start: string; end: string }) => void;
}> = ({ isOpen, onClose, onApply }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    if (!isOpen) return null;

    const handleApply = () => {
        onApply({ start: startDate, end: endDate });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Filter by Date Range</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary outline-none"/>
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary outline-none"/>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                    <button onClick={handleApply} className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors">Apply</button>
                </div>
            </div>
        </div>
    );
};

const EditRoleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    role: ApiRoleType | null;
    allPermissions: ApiPermission[];
    groupedPermissions: Record<string, ApiPermission[]>;
    onRoleUpdated: () => void;
}> = ({ isOpen, onClose, role, allPermissions, groupedPermissions, onRoleUpdated }) => {
    const [roleName, setRoleName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (role && isOpen) {
            const fetchRolePermissions = async () => {
                setIsLoadingPermissions(true);
                setError(null);
                try {
                    const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/roles/${role.id}/permissions`);
                    const data: any = await response.json();
                    if (!response.ok || !data.success || !data.data || !Array.isArray(data.data)) {
                        throw new Error(data.message || 'Failed to fetch role permissions.');
                    }
                    const permissionIds = (data.data as ApiPermission[]).map((p: ApiPermission) => p.id);
                    setSelectedPermissionIds(permissionIds);
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setIsLoadingPermissions(false);
                }
            };

            setRoleName(role.name);
            setDescription(role.description || '');
            fetchRolePermissions();
        } else {
            setRoleName('');
            setDescription('');
            setSelectedPermissionIds([]);
            setError(null);
            setIsLoadingPermissions(false);
            setIsSubmitting(false);
        }
    }, [role, isOpen]);

    const handlePermissionChange = (permissionId: number) => {
        setSelectedPermissionIds(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const allSelected = useMemo(() => {
        return allPermissions.length > 0 && selectedPermissionIds.length === allPermissions.length;
    }, [selectedPermissionIds, allPermissions]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedPermissionIds((allPermissions as ApiPermission[]).map(p => p.id));
        } else {
            setSelectedPermissionIds([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role || !roleName.trim()) {
            setError('Role name cannot be empty.');
            return;
        }
        setIsSubmitting(true);
        setError(null);
    
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/roles/${role.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: roleName.toUpperCase(),
                    description: description,
                    permissionIds: selectedPermissionIds,
                }),
            });
    
            const data: any = await response.json();
    
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update role.');
            }
            
            alert('Role updated successfully!');
            onRoleUpdated();
            onClose();
    
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col relative">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-colors z-20">
                    <X size={24} />
                </button>
                <div className="text-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Role</h2>
                    <p className="text-sm text-gray-500 mt-1">Set Role Permissions</p>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                        <input type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400">(Optional)</span></label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter a brief description for the role" rows={2} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Role Permissions</h3>
                    {isLoadingPermissions ? (
                        <div className="text-center py-10">Loading permissions...</div>
                    ) : (
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full min-w-[500px]">
                                <tbody>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-3 px-4 text-sm font-medium text-gray-700">Administrator Access</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center">
                                                <input id="select-all-edit" type="checkbox" checked={allSelected} onChange={handleSelectAll} className="h-4 w-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" />
                                                <label htmlFor="select-all-edit" className="ml-2 text-sm font-medium text-primary">Select All</label>
                                            </div>
                                        </td>
                                    </tr>
                                    {Object.entries(groupedPermissions).map(([groupName, permissionsInGroup]) => (
                                        <tr key={groupName} className="border-b border-gray-200 last:border-b-0">
                                            <td className="py-3 px-4 text-sm text-gray-600 font-semibold">{formatApiString(groupName)}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                                    {(permissionsInGroup as ApiPermission[]).map(permission => (
                                                        <div key={permission.id} className="flex items-center">
                                                            <input
                                                                id={`edit-${permission.id}`}
                                                                type="checkbox"
                                                                checked={selectedPermissionIds.includes(permission.id)}
                                                                onChange={() => handlePermissionChange(permission.id)}
                                                                className="h-4 w-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                                                            />
                                                            <label htmlFor={`edit-${permission.id}`} className="ml-2 text-sm text-gray-700">
                                                                {formatApiString(permission.name)}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-center space-x-4">
                    <button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-md transition-colors disabled:bg-primary-light flex items-center justify-center min-w-[100px]">
                        {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Update'}
                    </button>
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-md transition-colors">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

interface AddRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    allPermissions: ApiPermission[];
    groupedPermissions: Record<string, ApiPermission[]>;
    onRoleAdded: () => void;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({ isOpen, onClose, allPermissions, groupedPermissions, onRoleAdded }) => {
    const [roleName, setRoleName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setRoleName('');
            setDescription('');
            setSelectedPermissionIds([]);
            setError(null);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handlePermissionChange = (permissionId: number) => {
        setSelectedPermissionIds(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const allSelected = useMemo(() => {
        return allPermissions.length > 0 && selectedPermissionIds.length === allPermissions.length;
    }, [selectedPermissionIds, allPermissions]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedPermissionIds((allPermissions as ApiPermission[]).map(p => p.id));
        } else {
            setSelectedPermissionIds([]);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName.trim()) {
            setError('Role name cannot be empty.');
            return;
        }
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/roles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: roleName.toUpperCase(),
                    description: description,
                    permissionIds: selectedPermissionIds,
                }),
            });

            const data: any = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to create role.');
            }
            
            alert(data.message || 'Role created successfully!');
            onRoleAdded();
            onClose();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col relative">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-colors z-20">
                    <X size={24} />
                </button>
                <div className="text-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Add New Role</h2>
                    <p className="text-sm text-gray-500 mt-1">Set Role Permissions</p>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                        <input type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="Enter Role Name" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400">(Optional)</span></label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter a brief description for the role" rows={2} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Role Permissions</h3>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                         <table className="w-full min-w-[500px]">
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 text-sm font-medium text-gray-700">Administrator Access</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center">
                                            <input id="select-all-add" type="checkbox" checked={allSelected} onChange={handleSelectAll} className="h-4 w-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" />
                                            <label htmlFor="select-all-add" className="ml-2 text-sm font-medium text-primary">Select All</label>
                                        </div>
                                    </td>
                                </tr>
                                {Object.entries(groupedPermissions).map(([groupName, permissionsInGroup]) => (
                                     <tr key={groupName} className="border-b border-gray-200 last:border-b-0">
                                        <td className="py-3 px-4 text-sm text-gray-600 font-semibold">{formatApiString(groupName)}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                                {(permissionsInGroup as ApiPermission[]).map(permission => (
                                                    <div key={permission.id} className="flex items-center">
                                                        <input
                                                            id={`add-${permission.id}`}
                                                            type="checkbox"
                                                            checked={selectedPermissionIds.includes(permission.id)}
                                                            onChange={() => handlePermissionChange(permission.id)}
                                                            className="h-4 w-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                                                        />
                                                        <label htmlFor={`add-${permission.id}`} className="ml-2 text-sm text-gray-700">
                                                            {formatApiString(permission.name)}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-center space-x-4">
                    <button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-md transition-colors disabled:bg-primary-light flex items-center justify-center min-w-[100px]">
                        {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Submit'}
                    </button>
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-md transition-colors">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

const DeleteConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    roleName: string;
    isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, roleName, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mt-5">Delete Role</h3>
                    <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-gray-500">
                            Are you sure you want to delete the <strong>{roleName}</strong> role? This action cannot be undone.
                        </p>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 border-t flex justify-center space-x-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="bg-white text-gray-700 px-5 py-2.5 rounded-lg font-semibold border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-red-700 disabled:bg-red-400 flex items-center justify-center min-w-[100px] transition-colors"
                    >
                        {isDeleting ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            'Delete'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RoleCard: React.FC<{ role: ApiRoleType; onEdit: (role: ApiRoleType) => void; onDelete: (role: ApiRoleType) => void; canDelete: boolean; canEdit: boolean; canViewDetails: boolean; }> = ({ role, onEdit, onDelete, canDelete, canEdit, canViewDetails }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const maxAvatars = 3;
    const realUrls = (role.profilePictureUrls || []).map(url => `${API_BASE_URL}${url}`);
    const placeholdersNeeded = Math.max(0, Math.min(role.userCount || 0, maxAvatars) - realUrls.length);
    const placeholders = Array.from({ length: placeholdersNeeded }, () => getShadowPlaceholder());
    const avatars = [...realUrls, ...placeholders].slice(0, maxAvatars);
    
    const moreCount = (role.userCount || 0) > maxAvatars ? (role.userCount || 0) - maxAvatars : 0;

    const handleDelete = () => {
        onDelete(role);
        setIsMenuOpen(false);
    };

    const handleViewDetails = () => {
        navigate(`/users/roles/${role.id}`, { state: { role } });
        setIsMenuOpen(false);
    };

    return (
        <div className="bg-surface p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <p className="text-gray-500">Total {role.userCount || 0} users</p>
                <div className="flex -space-x-3">
                    {avatars.map((avatar, index) => (
                        <img 
                            key={index} 
                            src={avatar} 
                            alt="user" 
                            className="w-8 h-8 rounded-full border-2 border-white object-cover" 
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = getShadowPlaceholder();
                            }}
                        />
                    ))}
                    {moreCount > 0 && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-white border-2 border-white">
                            +{moreCount}
                        </div>
                    )}
                </div>
            </div>
            <h3 className="text-xl font-semibold mb-1 text-gray-800">{formatApiString(role.name)}</h3>
            {canEdit && (
                <button onClick={() => onEdit(role)} className="text-primary text-sm font-medium hover:underline">Edit Role</button>
            )}
            
            <div className="relative float-right" ref={menuRef}>
                <button
                    onClick={() => setIsMenuOpen(prev => !prev)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen}
                >
                    <MoreVertical size={20} />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-20 p-2 border border-gray-100" role="menu">
                        <ul className="text-sm text-gray-800 font-medium">
                            {canViewDetails && (
                                <li>
                                    <button
                                        onClick={handleViewDetails}
                                        className="w-full text-left flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                                        role="menuitem"
                                    >
                                        <Eye size={18} className="text-yellow-500 mr-3" />
                                        <span>View Role Details</span>
                                    </button>
                                </li>
                            )}
                            {canDelete && (
                                <li>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full text-left flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                                        role="menuitem"
                                    >
                                        <Trash2 size={18} className="text-red-500 mr-3" />
                                        <span>Delete Role</span>
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};


const AddRoleCard: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
    <div className="bg-surface rounded-lg border border-gray-200 flex items-center justify-between p-6 shadow-sm">
        <div className="flex-shrink-0">
            <img 
                src="https://demos.pixinvent.com/vuexy-react-admin-template/demo-1/assets/woman-with-laptop-light-47f97de7.png" 
                alt="Add new role" 
                className="w-28 h-auto" 
            />
        </div>
        <div className="text-right ml-4">
            <button onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                Add New Role
            </button>
            <p className="text-gray-500 text-sm mt-2">Add new role, if it doesn't exist.</p>
        </div>
    </div>
);

const AddUserModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onUserAdded: () => void;
    roles: ApiRoleType[];
}> = ({ isOpen, onClose, onUserAdded, roles }) => {
    const [formData, setFormData] = useState({
        username: '',
        firstname: '',
        lastname: '',
        email: '',
        phonenumber: '',
        roleId: '',
        region: '',
        district: '',
        street: '',
        postalCode: '',
        country: 'Tanzania',
    });
    const [districts, setDistricts] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                username: '',
                firstname: '',
                lastname: '',
                email: '',
                phonenumber: '',
                roleId: '',
                region: '',
                district: '',
                street: '',
                postalCode: '',
                country: 'Tanzania',
            });
            setDistricts([]);
            setError('');
            setIsSaving(false);
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const region = e.target.value;
        setFormData(prev => ({ ...prev, region: region, district: '' }));
        setDistricts(tanzaniaRegions[region] || []);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        try {
            const payload = {
                username: formData.username,
                firstname: formData.firstname,
                lastname: formData.lastname,
                email: formData.email,
                phonenumber: formData.phonenumber,
                roleId: Number(formData.roleId),
                address: {
                    region: formData.region,
                    district: formData.district,
                    street: formData.street,
                    postalCode: formData.postalCode,
                    country: formData.country,
                }
            };

            if (!payload.roleId) {
                throw new Error("Please select a role for the user.");
            }

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data: any = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to create user.');
            }
            
            alert(data.message || 'User created successfully!');
            onUserAdded();
            onClose();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Add a New User</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="tel" name="phonenumber" value={formData.phonenumber} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary outline-none" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select name="roleId" value={formData.roleId} onChange={handleChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-primary outline-none">
                                <option value="">Select a role</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{formatApiString(role.name)}</option>
                                ))}
                            </select>
                        </div>
                        <h3 className="md:col-span-2 text-lg font-semibold pt-4 border-t mt-2">Address</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Region</label>
                            <select name="region" value={formData.region} onChange={handleRegionChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                                <option value="">Select Region</option>
                                {mockRegions.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">District</label>
                            <select name="district" value={formData.district} onChange={handleChange} required disabled={!formData.region} className="mt-1 w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100">
                                <option value="">{formData.region ? 'Select District' : 'Select a region first'}</option>
                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Street</label>
                            <input type="text" name="street" value={formData.street} onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                            <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Country</label>
                            <input type="text" name="country" value={formData.country} onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                    <button type="submit" disabled={isSaving} className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark disabled:bg-primary/50 flex items-center justify-center min-w-[120px] transition-colors">
                        {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Add User'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Missing constant for category filters
const categoryOptions = [
    { label: 'Borrower', value: 'BORROWER' },
    { label: 'Saver', value: 'SAVER' },
    { label: 'Investor', value: 'INVESTOR' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Group Admin', value: 'GROUP_ADMIN' },
];

const RolesPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<ApiRoleType | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingRole, setDeletingRole] = useState<ApiRoleType | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [cardRoles, setCardRoles] = useState<ApiRoleType[]>([]);
    const [loadingCardRoles, setLoadingCardRoles] = useState(true);
    const [cardRolesError, setCardRolesError] = useState<string | null>(null);

    const [allPermissions, setAllPermissions] = useState<ApiPermission[]>([]);
    const [loadingPermissions, setLoadingPermissions] = useState(true);
    const [permissionsError, setPermissionsError] = useState<string | null>(null);

    const [users, setUsers] = useState<UserData[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [usersError, setUsersError] = useState<string | null>(null);
    const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);
    const [rolesDropdownLoading, setRolesDropdownLoading] = useState(true);
    
    const [filters, setFilters] = useState({ role: '', category: '', status: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys, direction: 'ascending' | 'descending' }>({ key: 'userName', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [usersRefreshKey, setUsersRefreshKey] = useState(0);

    // Missing definitions for selectedRows state and headerCheckboxRef
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState<{ start: string; end: string } | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const navigate = useNavigate();

    const canDelete = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('DELETE_USER');
    }, [currentUser]);

    const canCreateUser = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('CREATE_USER');
    }, [currentUser]);

    const canViewUsers = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('VIEW_USERS');
    }, [currentUser]);

    const canEditRole = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('EDIT_ROLE');
    }, [currentUser]);

    const canCreateRole = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('CREATE_ROLE');
    }, [currentUser]);

    const canViewRoles = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('VIEW_ROLES') || currentUser.permissions.includes('MANAGE_ROLES');
    }, [currentUser]);

    const fetchAllData = async () => {
        setLoadingCardRoles(true);
        setRolesDropdownLoading(true);
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/roles`);
            if (!response.ok) throw new Error('Failed to fetch roles.');
            const data: any = await response.json();
            if (data.success && data.data && Array.isArray(data.data.content)) {
                setCardRoles(data.data.content);
                const options = data.data.content.map((apiRole: ApiRoleType) => ({
                    label: formatApiString(apiRole.name),
                    value: apiRole.name,
                }));
                setRoleOptions(options);
            } else {
                throw new Error(data.message || 'Invalid data structure for roles.');
            }
        } catch (err: any) {
            setCardRolesError(err.message);
        } finally {
            setLoadingCardRoles(false);
            setRolesDropdownLoading(false);
        }
    };

    useEffect(() => {
        const fetchPermissions = async () => {
            setLoadingPermissions(true);
            setPermissionsError(null);
            try {
                // UPDATE: Adding size=50 to fetch more permissions for role configuration
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/permissions?size=50`);
                if (!response.ok) throw new Error('Failed to fetch permissions');
                const data: any = await response.json();
                if (data.success && data.data && Array.isArray(data.data.content)) {
                    setAllPermissions(data.data.content);
                } else {
                    throw new Error(data.message || 'Failed to process permissions data');
                }
            } catch (err: any) {
                setPermissionsError(err.message);
            } finally {
                setLoadingPermissions(false);
            }
        };
        fetchPermissions();
        fetchAllData();
    }, []);

    const groupedPermissions = useMemo(() => {
        if (!allPermissions || allPermissions.length === 0) return {};
        return allPermissions.reduce((acc, permission) => {
            const group = permission.permissionGroup || 'GENERAL';
            if (!acc[group]) acc[group] = [];
            acc[group].push(permission);
            return acc;
        }, {} as Record<string, ApiPermission[]>);
    }, [allPermissions]);
    
    useEffect(() => {
        const timer = setTimeout(() => { setDebouncedSearchQuery(searchQuery); setCurrentPage(1); }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoadingUsers(true);
            setUsersError(null);
            try {
                const sortDirection = sortConfig.direction === 'ascending' ? 'asc' : 'desc';
                const sortKeyMap: { [key in SortableKeys]?: string } = { userName: 'username', role: 'roleName', category: 'userCategory', phone: 'phoneNumber', status: 'activity' };
                const sortBy = sortKeyMap[sortConfig.key] || 'createdAt';
                const params = new URLSearchParams({ page: String(currentPage - 1), size: String(itemsPerPage), sortBy: sortBy, sortDirection: sortDirection });
                if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
                if (filters.role) params.append('roleName', filters.role);
                
                params.append('userCategory', 'ADMIN');

                if (filters.status) params.append('activity', filters.status.toUpperCase());
                
                if (dateFilter) {
                    params.append('createdFrom', `${dateFilter.start}T00:00:00`);
                    params.append('createdTo', `${dateFilter.end}T23:59:59`);
                }

                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/users?${params.toString()}`);
                if (!response.ok) throw new Error("Failed to fetch users.");
                const data: any = await response.json();
                if (!data.success || !data.data || !Array.isArray(data.data.content)) throw new Error(data.message || "Failed to fetch users.");
                
                const mappedUsers: UserData[] = data.data.content.map((apiUser: any) => ({
                    id: String(apiUser.id),
                    user: { 
                        name: `${apiUser.firstName} ${apiUser.lastName}`, 
                        email: apiUser.email, 
                        avatar: apiUser.profilePictureUrl ? `${API_BASE_URL}${apiUser.profilePictureUrl}` : getShadowPlaceholder(apiUser.gender),
                        gender: apiUser.gender
                    },
                    role: formatApiString(apiUser.roleName) as any, 
                    category: formatApiString(apiUser.userCategory) as any,
                    phone: formatPhoneNumber(apiUser.phoneNumber),
                    pinSet: apiUser.pinSet,
                    status: formatApiString(apiUser.activity) as any || 'Inactive',
                }));
                setUsers(mappedUsers);
                setTotalPages(data.data.totalPages);
                setTotalElements(data.data.totalElements);
            } catch (err: any) {
                 setUsersError(err.message);
            } finally {
                setLoadingUsers(false);
            }
        };
        if (canViewUsers) {
            fetchUsers();
        }
    }, [currentPage, itemsPerPage, debouncedSearchQuery, sortConfig, filters, usersRefreshKey, dateFilter, canViewUsers]);

    const handleEditClick = (role: ApiRoleType) => { setEditingRole(role); setIsEditModalOpen(true); };
    const handleCloseModal = () => { setIsEditModalOpen(false); setEditingRole(null); };
    const handleAddClick = () => { setIsAddModalOpen(true); };
    const handleCloseAddModal = () => { setIsAddModalOpen(false); };
    const requestSort = (key: SortableKeys) => { setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending' })); setCurrentPage(1); };
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setFilters(prev => ({ ...prev, [e.target.name]: e.target.value })); setCurrentPage(1); };

    const handleApplyDateFilter = (dates: { start: string; end: string }) => {
        setDateFilter(dates.start && dates.end ? dates : null);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({ role: '', category: '', status: '' });
        setSearchQuery('');
        setDateFilter(null);
        setCurrentPage(1);
    };

    const handleDeleteRoleClick = (roleToDelete: ApiRoleType) => {
        setDeletingRole(roleToDelete);
        setIsDeleteModalOpen(true);
    };
    
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelectedIds = new Set([...selectedRows, ...users.map(u => u.id)]);
            setSelectedRows(Array.from(newSelectedIds));
        } else {
            setSelectedRows(selectedRows.filter(id => !users.find(u => u.id === id)));
        }
    };

    const handleRowSelect = (id: string) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
    };
    
    const areAllOnPageSelected = users.length > 0 && users.every(user => selectedRows.includes(user.id));
    const areSomeOnPageSelected = users.some(user => selectedRows.includes(user.id));
    
     useEffect(() => {
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate = areSomeOnPageSelected && !areAllOnPageSelected;
        }
    }, [areSomeOnPageSelected, areAllOnPageSelected]);

    const confirmDeleteRole = async () => {
        if (!deletingRole) return;

        setIsDeleting(true);
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/roles/${deletingRole.id}`, {
                method: 'DELETE',
            });

            const data: any = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to delete the role.');
            }

            alert(data.message || 'Role deleted successfully!');
            fetchAllData(); 

        } catch (err: any) {
            console.error('Error deleting role:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setDeletingRole(null);
        }
    };
    
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const params = new URLSearchParams();
            
            if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
            params.append('userCategory', 'ADMIN'); 
            if (filters.role) params.append('roleName', filters.role);
            if (filters.status) params.append('activity', filters.status.toUpperCase());
            
            if (dateFilter) {
                params.append('createdFrom', `${dateFilter.start}T00:00:00`);
                params.append('createdTo', `${dateFilter.end}T23:59:59`);
            }

            params.append('size', '20');
            params.append('page', '0');
            
            const sortKeyMap: { [key in SortableKeys]?: string } = {
                userName: 'username',
                role: 'roleName',
                category: 'userCategory',
                phone: 'phoneNumber',
                pinSet: 'pinSet',
                status: 'activity'
            };
            
            params.append('sortBy', sortKeyMap[sortConfig.key] || 'username');
            params.append('sortDirection', sortConfig.direction === 'ascending' ? 'asc' : 'desc');

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/users/download?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error('Failed to download report');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Admin_Users_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            console.error("Export error:", err);
            alert("Export failed: " + err.message);
        } finally {
            setIsExporting(false);
        }
    };
    
    return (
        <div className="space-y-8">
            <DateFilterModal isOpen={isDateFilterOpen} onClose={() => setIsDateFilterOpen(false)} onApply={handleApplyDateFilter} />
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Roles List</h1>
                <p className="text-gray-500 mt-1">A role provided access to predefined menus and features so that depending on assigned role an administrator can have access to what he need</p>
            </div>

            {loadingCardRoles ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {Array.from({ length: 5 }).map((_, index) => <RoleCardSkeleton key={index} />)}
                    <div className="bg-surface rounded-lg border border-gray-200 flex items-center justify-between p-6 shadow-sm animate-pulse">
                        <div className="w-28 h-28 bg-gray-200 rounded"></div>
                        <div className="text-right ml-4 w-1/2">
                            <div className="h-10 bg-gray-200 rounded-md"></div>
                            <div className="h-4 bg-gray-200 rounded mt-3"></div>
                        </div>
                    </div>
                </div>
            ) : cardRolesError ? (
                <div className="text-center py-10 text-red-500">Error: {cardRolesError}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {cardRoles.map(role => <RoleCard key={role.id} role={role} onEdit={handleEditClick} onDelete={handleDeleteRoleClick} canDelete={!!canDelete} canEdit={canEditRole} canViewDetails={canViewRoles} />)}
                    {canCreateRole && <AddRoleCard onAdd={handleAddClick} />}
                </div>
            )}

            {canViewUsers && (
                <>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Total users with their roles</h2>
                        <p className="text-gray-500 mt-1">Find all of your company’s administrator accounts and their associate roles.</p>
                    </div>

                    <div className="bg-surface rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
                        <div className="mb-4">
                            <p className="text-sm text-gray-500">
                                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalElements)} to {Math.min(currentPage * itemsPerPage, totalElements)} of {totalElements} entries
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <div className="relative flex-grow max-w-xs">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search User" 
                                    value={searchQuery} 
                                    onChange={(e) => setSearchQuery(e.target.value)} 
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none" 
                                />
                            </div>
                            
                            <select 
                                name="role" 
                                value={filters.role}
                                onChange={handleFilterChange} 
                                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                                disabled={rolesDropdownLoading}
                            >
                                <option value="">Select Role</option>
                                {roleOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>

                            <select 
                                name="category" 
                                value={filters.category}
                                onChange={handleFilterChange} 
                                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Select Category</option>
                                {categoryOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>

                            <select 
                                name="status" 
                                value={filters.status}
                                onChange={handleFilterChange} 
                                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Select Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>

                            <button 
                                onClick={() => setIsDateFilterOpen(true)} 
                                className="bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center space-x-2"
                            >
                                <SlidersHorizontal size={18} />
                                <span>Filter</span>
                            </button>

                            <button 
                                onClick={clearFilters} 
                                className="bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                                Clear
                            </button>

                            <button 
                                onClick={handleExport} 
                                disabled={isExporting}
                                className="bg-gray-100 border border-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                <span>Export</span>
                            </button>

                            {canCreateUser && (
                                <button 
                                    onClick={() => setIsAddUserModalOpen(true)} 
                                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold hover:bg-primary-dark transition-colors shadow-sm ml-auto"
                                >
                                    <Plus size={16} />
                                    <span>Add New User</span>
                                </button>
                            )}
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="p-4 w-12"><input type="checkbox" ref={headerCheckboxRef} checked={areAllOnPageSelected} onChange={handleSelectAll} className="rounded" /></th>
                                        <SortableTableHeader label="User" columnKey="userName" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableTableHeader label="Role" columnKey="role" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableTableHeader label="Category" columnKey="category" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableTableHeader label="Phone" columnKey="phone" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableTableHeader label="PIN Status" columnKey="pinSet" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableTableHeader label="Status" columnKey="status" sortConfig={sortConfig} requestSort={requestSort} />
                                        <th className="p-4 font-semibold text-xs uppercase text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingUsers ? (
                                        <TableSkeleton rows={itemsPerPage} />
                                    ) : usersError ? (
                                        <tr><td colSpan={8} className="text-center p-8 text-red-500">Error: {usersError}</td></tr>
                                    ) : users.length > 0 ? (
                                        users.map(user => (
                                            <tr key={user.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 text-sm">
                                                <td className="p-4"><input type="checkbox" checked={selectedRows.includes(user.id)} onChange={() => handleRowSelect(user.id)} className="rounded"/></td>
                                                <td className="p-4"><UserCell user={user.user} /></td>
                                                <td className="p-4 text-gray-700"><RoleCell role={user.role} /></td>
                                                <td className="p-4 text-gray-700">{user.category}</td>
                                                <td className="p-4 text-gray-700">{user.phone}</td>
                                                <td className="p-4"><PinStatusPill isSet={user.pinSet} /></td>
                                                <td className="p-4"><StatusPill status={user.status} /></td>
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-2 text-gray-500">
                                                        {canDelete && (
                                                            <button className="hover:text-red-600"><Trash2 size={18}/></button>
                                                        )}
                                                        <button onClick={() => navigate(`/users/${user.id}`)} className="hover:text-blue-600"><Eye size={18}/></button>
                                                        <button className="hover:text-gray-800"><MoreVertical size={18}/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={8} className="text-center py-10 text-gray-500">No users found matching your criteria.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                            <p>Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalElements)} to {Math.min(currentPage * itemsPerPage, totalElements)} of {totalElements} entries</p>
                            <div className="flex items-center space-x-1">
                                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"><ChevronLeft size={16} /></button>
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"><ChevronLeft size={16} /></button>
                                <span className="px-2 font-semibold text-gray-800">Page {currentPage} of {totalPages > 0 ? totalPages : 1}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages || totalPages === 0} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
                                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages || totalPages === 0} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    </div>
                </>
            )}
            
            <EditRoleModal 
                isOpen={isEditModalOpen} 
                onClose={handleCloseModal} 
                role={editingRole}
                allPermissions={allPermissions}
                groupedPermissions={groupedPermissions}
                onRoleUpdated={fetchAllData}
            />
            <AddRoleModal 
                isOpen={isAddModalOpen} 
                onClose={handleCloseAddModal}
                allPermissions={allPermissions}
                groupedPermissions={groupedPermissions}
                onRoleAdded={fetchAllData}
            />
            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onUserAdded={() => setUsersRefreshKey(k => k + 1)}
                roles={cardRoles}
            />
             <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteRole}
                roleName={deletingRole ? formatApiString(deletingRole.name) : ''}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default RolesPage;