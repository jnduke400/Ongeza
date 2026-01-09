import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Bell, MoreVertical, Search, ChevronLeft, ChevronRight, Target, Loader2, CheckCircle, AlertTriangle, DollarSign, Smartphone, Monitor, Tablet, X, Users, Edit, UserPlus, Eye, UserCheck, TrendingUp } from 'lucide-react';
import { UserDetail, UserForManagement, ApiRole as ApiRoleType, ApiPermission } from '../types';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface DeviceData {
    id: number;
    client: string;
    operatingSystem: string;
    deviceType: string;
    location: string;
    ipAddress: string;
    lastActive: string;
    currentDevice: boolean;
}

const formatApiString = (str: string | null | undefined): string => {
    if (!str || str.toLowerCase() === 'undefined' || str.toLowerCase() === 'null') {
      return 'General';
    }
    return str
        .replace(/_/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const getGoalIcon = (iconStr: string | null) => {
    switch (iconStr?.toUpperCase()) {
        case 'PLANE': return '✈️';
        case 'HOME': return '🏠';
        case 'BRIEFCASE': return '💼';
        case 'BOOK': return '📚';
        case 'HEART': return '❤️';
        case 'GIFT': return '🎁';
        case 'VACATION': return '🏖️';
        default: return '💰';
    }
};

// Helper to get gender-specific shadow placeholder matching requested silhouettes
const getShadowPlaceholder = (gender?: string) => {
    const isFemale = gender?.toUpperCase() === 'FEMALE';
    if (isFemale) return 'https://ui-avatars.com/api/?name=F&background=E2E8F0&color=94A3B8&size=150&bold=true';
    return 'https://ui-avatars.com/api/?name=M&background=E2E8F0&color=94A3B8&size=150&bold=true';
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

const UserCell: React.FC<{ user: UserForManagement['user'] }> = ({ user }) => (
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

const RoleDetailPageSkeleton: React.FC = () => (
    <div className="space-y-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div> {/* Back link */}

        <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div> {/* Title */}
            <div className="flex items-center space-x-3">
                <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-36"></div>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-200 p-6 rounded-lg h-24"></div>
            <div className="bg-gray-200 p-6 rounded-lg h-24"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="bg-surface p-6 rounded-lg border border-gray-100 h-[600px]">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i}>
                            <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-gray-100 h-[600px]">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                         <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                                </div>
                            </div>
                            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

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

// Define types outside the component to avoid scope issues
type ModalUser = UserForManagement & { originalRoleId: number; };
type SelectedUserInfo = { originalRoleId: number; };

const AssignUserModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    roleName: string;
    roleId: string;
    onAssignmentSuccess: () => void;
}> = ({ isOpen, onClose, roleName, roleId, onAssignmentSuccess }) => {
    const [users, setUsers] = useState<ModalUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [paginationData, setPaginationData] = useState({ totalPages: 0, totalElements: 0 });
    const [selectedUsersMap, setSelectedUsersMap] = useState<Map<string, SelectedUserInfo>>(new Map());
    const [isAssigning, setIsAssigning] = useState(false);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (isOpen) {
            const fetchUsers = async () => {
                setLoading(true);
                setError(null);
                try {
                    const params = new URLSearchParams({
                        page: String(currentPage - 1),
                        size: String(itemsPerPage),
                        userCategory: 'USER'
                    });
                    
                    if (debouncedSearchQuery) {
                        params.append('search', debouncedSearchQuery);
                    }
                    
                    const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/users?${params.toString()}`);
                    if (!response.ok) throw new Error('Failed to fetch users.');
                    const data: any = await response.json();
                    if (!data.success || !data.data || !Array.isArray(data.data.content)) {
                        throw new Error(data.message || 'Failed to fetch users.');
                    }
                    
                    const mappedUsers: ModalUser[] = (data.data.content as any[]).map((apiUser: any) => ({
                        id: String(apiUser.id),
                        originalRoleId: apiUser.roleId,
                        user: { 
                            name: `${apiUser.firstName} ${apiUser.lastName}`, 
                            email: apiUser.email, 
                            avatar: apiUser.profilePictureUrl ? `${API_BASE_URL}${apiUser.profilePictureUrl}` : getShadowPlaceholder(apiUser.gender),
                            gender: apiUser.gender
                        },
                        role: formatApiString(apiUser.roleName) as any,
                        category: formatApiString(apiUser.userCategory) as any,
                        phone: formatPhoneNumber(apiUser.phoneNumber),
                        status: formatApiString(apiUser.activity) as any || 'Inactive',
                    }));
                    setUsers(mappedUsers);
                    setPaginationData({ totalPages: data.data.totalPages, totalElements: data.data.totalElements });

                    setSelectedUsersMap(prev => {
                        const newMap = new Map(prev);
                        mappedUsers.forEach(user => {
                            if (String(user.originalRoleId) === roleId) {
                                newMap.set(user.id, { originalRoleId: user.originalRoleId });
                            }
                        });
                        return newMap;
                    });
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchUsers();
        } else {
            setSearchQuery('');
            setSelectedUsersMap(new Map());
            setCurrentPage(1);
        }
    }, [isOpen, currentPage, itemsPerPage, debouncedSearchQuery, roleId]);

    const handleAssign = async () => {
        setIsAssigning(true);
        setError(null);
        let success = false;
    
        try {
            const usersToAssign = Array.from(selectedUsersMap.keys()).filter(id => {
                const user: SelectedUserInfo | undefined = selectedUsersMap.get(id);
                return user && String(user.originalRoleId) !== roleId;
            });
    
            if (usersToAssign.length === 0) {
                return;
            }
    
            const userIdsPayload = usersToAssign.map(id => Number(id));
    
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/roles/${roleId}/users/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: userIdsPayload }),
            });
    
            const data: any = await response.json();
    
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to assign users to the role.');
            }
            
            alert(data.message || 'Users assigned successfully!');
            success = true;
            onAssignmentSuccess();
    
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsAssigning(false);
            if (success) {
                onClose();
            }
        }
    };

    const isAssignButtonDisabled = useMemo(() => {
        if (isAssigning) return true;
        const hasNewSelection = Array.from(selectedUsersMap.values()).some(
            (user: SelectedUserInfo) => String(user.originalRoleId) !== roleId
        );
        return !hasNewSelection;
    }, [selectedUsersMap, roleId, isAssigning]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Assign User to {roleName}</h2>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>Show</span>
                            <select onChange={(e) => setItemsPerPage(Number(e.target.value))} value={itemsPerPage} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                                <option>5</option>
                                <option>10</option>
                                <option>25</option>
                            </select>
                            <span>entries</span>
                        </div>
                        <div className="relative">
                           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search User"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                                    <th className="p-4 w-12"><input type="checkbox" ref={headerCheckboxRef} className="rounded" /></th>
                                    <th className="p-4 text-left font-semibold">User</th>
                                    <th className="p-4 text-left font-semibold">Role</th>
                                    <th className="p-4 text-left font-semibold">Category</th>
                                    <th className="p-4 text-left font-semibold">Phone</th>
                                    <th className="p-4 text-left font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-10">Loading users...</td></tr>
                                ) : users.length === 0 ? (
                                     <tr><td colSpan={6} className="text-center py-10">No users found.</td></tr>
                                ) : users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedUsersMap.has(user.id)}
                                                onChange={() => {
                                                    setSelectedUsersMap(prev => {
                                                        const newMap = new Map(prev);
                                                        if (newMap.has(user.id)) {
                                                            newMap.delete(user.id);
                                                        } else {
                                                            newMap.set(user.id, { originalRoleId: user.originalRoleId });
                                                        }
                                                        return newMap;
                                                    });
                                                }}
                                                disabled={String(user.originalRoleId) === roleId}
                                                className="rounded disabled:bg-gray-200 disabled:border-gray-300 disabled:cursor-not-allowed"
                                            />
                                        </td>
                                        <td className="p-4"><UserCell user={user.user} /></td>
                                        <td className="p-4 text-gray-700"><RoleCell role={user.role} /></td>
                                        <td className="p-4 text-gray-700">{user.category}</td>
                                        <td className="p-4 text-gray-700">{user.phone}</td>
                                        <td className="p-4"><StatusPill status={user.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                        <p>Showing {Math.min((currentPage - 1) * itemsPerPage + 1, paginationData.totalElements)} to {Math.min(currentPage * itemsPerPage, paginationData.totalElements)} of {paginationData.totalElements} entries</p>
                        <div className="flex items-center space-x-1">
                            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"><ChevronLeft size={16} /></button>
                            <span className="px-2 font-semibold">Page {currentPage} of {paginationData.totalPages > 0 ? paginationData.totalPages : 1}</span>
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === paginationData.totalPages || paginationData.totalPages === 0} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                    <button onClick={handleAssign} disabled={isAssignButtonDisabled} className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark disabled:bg-primary/50 flex items-center justify-center min-w-[120px] transition-colors">
                        {isAssigning ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Assign Users'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RoleDetailPage: React.FC = () => {
    const { roleId } = useParams<{ roleId: string }>();
    const { user: currentUser } = useAuth();
    const location = useLocation();
    const roleFromState = location.state?.role as ApiRoleType;

    const [role, setRole] = useState<ApiRoleType | null>(roleFromState);
    const [permissions, setPermissions] = useState<ApiPermission[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [users, setUsers] = useState<UserForManagement[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [usersError, setUsersError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [paginationData, setPaginationData] = useState({ totalPages: 1, totalElements: 0 });
    const [usersRefreshKey, setUsersRefreshKey] = useState(0);

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [allPermissions, setAllPermissions] = useState<ApiPermission[]>([]);
    
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    const canEditRole = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('EDIT_ROLE');
    }, [currentUser]);

    const canManageRoles = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('VIEW_ROLES') || currentUser.permissions.includes('MANAGE_ROLES');
    }, [currentUser]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setCurrentPage(1); 
        }, 500);

        return () => {
            clearTimeout(timerId);
        };
    }, [searchQuery]);
    
    const fetchRoleDetails = async () => {
        if (!roleId) {
            setError("Role ID is missing.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const roleResponse = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/roles/${roleId}`);
            const roleData: any = await roleResponse.json();
            if (!roleResponse.ok || !roleData.success) throw new Error(roleData.message || 'Failed to fetch role details.');
            setRole(roleData.data);
            
            const permissionsResponse = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/roles/${roleId}/permissions`);
            const permissionsData: any = await permissionsResponse.json();
            if (!permissionsResponse.ok || !permissionsData.success) throw new Error(permissionsData.message || 'Failed to fetch permissions.');
            const content = permissionsData.data?.content || permissionsData.data;
            setPermissions(Array.isArray(content) ? content : []);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchAllPermissions = async () => {
            try {
                // UPDATE: Adding size=50 to fetch more permissions for consistency
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/permissions?size=50`);
                if (!response.ok) throw new Error('Failed to fetch all permissions');
                const data: any = await response.json();
                if (data.success && data.data && Array.isArray(data.data.content)) {
                    setAllPermissions(data.data.content);
                } else {
                    throw new Error(data.message || 'Failed to process permissions data');
                }
            } catch (err: any) {
                console.error("Error fetching all permissions:", err);
            }
        };
        
        fetchAllPermissions();
        fetchRoleDetails();
    }, [roleId]);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!roleId) return;

            setLoadingUsers(true);
            setUsersError(null);
            try {
                const params = new URLSearchParams({
                    page: String(currentPage - 1),
                    size: String(itemsPerPage),
                });
                if (debouncedSearchQuery) {
                    params.append('search', debouncedSearchQuery);
                }

                const usersResponse = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/roles/${roleId}/users?${params.toString()}`);
                const usersData: any = await usersResponse.json();
                 if (!usersResponse.ok || !usersData.success || !usersData.data || !Array.isArray(usersData.data.content)) {
                    throw new Error(usersData.message || 'Failed to fetch users.');
                }
                 const mappedUsers: UserForManagement[] = (usersData.data.content as any[]).map((apiUser: any) => ({
                    id: String(apiUser.id),
                    user: {
                        name: `${apiUser.firstName} ${apiUser.lastName}`,
                        email: apiUser.email,
                        avatar: apiUser.profilePictureUrl ? `${API_BASE_URL}${apiUser.profilePictureUrl}` : getShadowPlaceholder(apiUser.gender),
                        gender: apiUser.gender
                    },
                    role: formatApiString(apiUser.roleName) as any,
                    category: formatApiString(apiUser.userCategory) as any,
                    phone: '',
                    status: formatApiString(apiUser.activity) as any || 'Inactive',
                }));
                setUsers(mappedUsers);
                setPaginationData({
                    totalPages: usersData.data.totalPages,
                    totalElements: usersData.data.totalElements,
                });
            } catch (err: any) {
                setUsersError(err.message);
                setUsers([]);
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [roleId, currentPage, itemsPerPage, usersRefreshKey, debouncedSearchQuery]);

    const handleRoleUpdated = () => {
        setIsEditModalOpen(false);
        fetchRoleDetails();
        setUsersRefreshKey(key => key + 1);
    };

    const groupedPermissions = useMemo(() => {
        return permissions.reduce((acc, permission) => {
            const group = permission.permissionGroup || 'GENERAL';
            if (!acc[group]) acc[group] = [];
            acc[group].push(permission);
            return acc;
        }, {} as Record<string, ApiPermission[]>);
    }, [permissions]);

    const allGroupedPermissions = useMemo(() => {
        return allPermissions.reduce((acc, permission) => {
            const group = permission.permissionGroup || 'GENERAL';
            if (!acc[group]) acc[group] = [];
            acc[group].push(permission);
            return acc;
        }, {} as Record<string, ApiPermission[]>);
    }, [allPermissions]);


    if (loading) {
        return <RoleDetailPageSkeleton />;
    }
    
    if (error && !loading) {
        return <div className="text-center py-10 text-red-500">Error: {error}</div>;
    }
    
    if (!role) {
        return <div className="text-center py-10">Role not found.</div>;
    }

    const handleAssignmentSuccess = () => {
        setIsAssignModalOpen(false);
        setUsersRefreshKey(key => key + 1);
        fetchRoleDetails();
    };

    const handleSearchToggle = () => {
        setIsSearchVisible(prev => !prev);
        if (isSearchVisible) {
            setSearchQuery(''); 
        }
    };

    return (
        <div className="space-y-6">
            <Link to="/users/roles" className="inline-flex items-center text-primary font-semibold hover:underline mb-2">
                <ChevronLeft size={20} className="mr-1"/>
                Back to Roles List
            </Link>
            
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Role Details: {formatApiString(role.name)}</h1>
                <div className="flex items-center space-x-3">
                    {canEditRole && (
                        <button onClick={() => setIsEditModalOpen(true)} className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                            <Edit size={16} />
                            <span>Edit Role</span>
                        </button>
                    )}
                    {canManageRoles && (
                        <button onClick={() => setIsAssignModalOpen(true)} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                            <UserPlus size={16} />
                            <span>Assign User</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="bg-surface p-6 rounded-lg border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full"><Users size={24} className="text-blue-600"/></div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{paginationData.totalElements}</p>
                        <p className="text-sm text-gray-500">Total Users</p>
                    </div>
                </div>
                 <div className="bg-surface p-6 rounded-lg border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-full"><Shield size={24} className="text-green-600"/></div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{permissions.length}</p>
                        <p className="text-sm text-gray-500">Permissions Granted</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="bg-surface p-6 rounded-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Permissions Assigned to this Role</h3>
                    <div className="space-y-4">
                        {Object.entries(groupedPermissions).map(([groupName, permissionsInGroup]) => (
                            <div key={groupName}>
                                <h4 className="font-semibold text-gray-600 mb-2">{formatApiString(groupName)}</h4>
                                <ul className="space-y-1 list-disc list-inside text-gray-700">
                                    {(permissionsInGroup as ApiPermission[]).map(p => <li key={p.id}>{formatApiString(p.name)}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        {!isSearchVisible ? (
                            <h3 className="text-lg font-semibold text-gray-800">Users with this Role</h3>
                        ) : (
                            <div className="relative w-full">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users in this role..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                                    autoFocus
                                />
                            </div>
                        )}
                        <button onClick={handleSearchToggle} className="text-gray-400 hover:text-gray-600 p-1 rounded-full ml-2 flex-shrink-0 transition-all">
                            {isSearchVisible ? <X size={20} /> : <Search size={20} />}
                        </button>
                    </div>


                    {loadingUsers ? (
                        <p className="text-sm text-gray-500 text-center py-8">Loading users...</p>
                    ) : usersError ? (
                        <p className="text-sm text-red-500 text-center py-8">{usersError}</p>
                    ) : users.length > 0 ? (
                        <>
                            <div className="flow-root">
                                <table className="min-w-full">
                                    <thead className="border-b border-gray-200">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-500 sm:pl-0 uppercase tracking-wider">Name</th>
                                            <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <img 
                                                                className="h-10 w-10 rounded-full object-cover shadow-sm ring-1 ring-gray-100" 
                                                                src={user.user.avatar || getShadowPlaceholder(user.user.gender)} 
                                                                alt={user.user.name} 
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = getShadowPlaceholder(user.user.gender);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="font-medium text-gray-900">{user.user.name}</div>
                                                            <div className="text-gray-500">{user.category}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <StatusPill status={user.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex flex-wrap justify-between items-center mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 gap-4">
                                <p>
                                    Showing {paginationData.totalElements > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, paginationData.totalElements)} of {paginationData.totalElements} entries
                                </p>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        disabled={currentPage === 1}
                                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="px-2 font-semibold text-gray-700">Page {currentPage} of {paginationData.totalPages > 0 ? paginationData.totalPages : 1}</span>
                                    <button
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        disabled={currentPage === paginationData.totalPages || paginationData.totalPages === 0}
                                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-8">{debouncedSearchQuery ? 'No users found for your search.' : 'No users are currently assigned to this role.'}</p>
                    )}
                </div>
            </div>
            {roleId && (
                <AssignUserModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    roleName={formatApiString(role.name)}
                    roleId={roleId}
                    onAssignmentSuccess={handleAssignmentSuccess}
                />
            )}
            <EditRoleModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                role={role}
                allPermissions={allPermissions}
                groupedPermissions={allGroupedPermissions}
                onRoleUpdated={handleRoleUpdated}
            />
        </div>
    );
};

export default RoleDetailPage;