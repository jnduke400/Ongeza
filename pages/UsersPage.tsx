import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronDown, ChevronUp, Download, MoreVertical, Search, ChevronLeft, ChevronRight, Plus,
    Trash2, Eye, Upload, Users, UserCheck, UserX, TrendingUp, Edit, Loader2, Calendar,
    X, SlidersHorizontal,
} from 'lucide-react';
import { UserForManagement, ApiRole } from '../types';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';

type UserData = UserForManagement;
type SortableKeys = keyof UserData | 'userName' | 'pinSet';

interface UserStats {
    sessionCount: number;
    sessionGrowth: number;
    transactingUsersCount: number;
    transactingUsersGrowth: number;
    activeUsersCount: number;
    activeUsersGrowth: number;
    pendingUsersCount: number;
    pendingUsersGrowth: number;
}

const formatApiString = (str: string | null | undefined): string => {
  if (!str) return '';
  return str
    .replace('ROLE_', '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const categoryOptions = [
    { label: 'Borrower', value: 'BORROWER' },
    { label: 'Saver', value: 'SAVER' },
    { label: 'Investor', value: 'INVESTOR' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Group Admin', value: 'GROUP_ADMIN' },
];

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

const StatCard: React.FC<{
    title: string;
    value: string | number;
    change: number;
    icon: React.ReactNode;
    color: string;
    loading?: boolean;
}> = ({ title, value, change, icon, color, loading }) => (
    <div className="bg-surface p-5 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                {loading ? (
                    <div className="h-8 w-24 bg-gray-100 animate-pulse rounded mt-1"></div>
                ) : (
                    <p className="text-2xl font-bold text-gray-800 mt-1">{value.toLocaleString()}</p>
                )}
            </div>
            <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${color}`}>
                {icon}
            </div>
        </div>
        <div className="flex items-center text-sm mt-3">
            {loading ? (
                <div className="h-4 w-16 bg-gray-100 animate-pulse rounded"></div>
            ) : (
                <>
                    <span className={`font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change >= 0 ? `+${change.toFixed(1)}` : change.toFixed(1)}%
                    </span>
                    <span className="text-gray-500 ml-1">vs last week</span>
                </>
            )}
        </div>
    </div>
);

const StatusPill: React.FC<{ status: UserData['status'] }> = ({ status }) => {
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

const RoleCell: React.FC<{ role: UserData['role'] }> = ({ role }) => {
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
    sortConfig: { key: string; direction: string };
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

const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 10 }) => {
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
                    <td className="p-4"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Filter by Date Range</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
                    <button onClick={handleApply} className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark">Apply</button>
                </div>
            </div>
        </div>
    );
};

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [filters, setFilters] = useState({ role: '', category: '', status: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys, direction: 'ascending' | 'descending' }>({ key: 'userName', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState<{ start: string; end: string } | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const navigate = useNavigate();

    const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);
    const [rolesLoading, setRolesLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setCurrentPage(1); 
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [searchQuery]);

    useEffect(() => {
        const fetchStats = async () => {
            setStatsLoading(true);
            try {
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/users/stats`);
                const data = await response.json();
                if (data.success && data.data) {
                    setStats(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch user stats", err);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const sortDirection = sortConfig.direction === 'ascending' ? 'asc' : 'desc';
                
                const sortKeyMap: { [key in SortableKeys]?: string } = {
                    userName: 'username',
                    role: 'roleName',
                    category: 'userCategory',
                    phone: 'phoneNumber',
                    pinSet: 'pinSet',
                    status: 'activity'
                };
                const sortBy = sortKeyMap[sortConfig.key] || 'createdAt';

                const params = new URLSearchParams({
                    page: String(currentPage - 1),
                    size: String(itemsPerPage),
                    sortBy: sortBy,
                    sortDirection: sortDirection,
                });
                
                if (debouncedSearchQuery) {
                    params.append('search', debouncedSearchQuery);
                }

                if (filters.role) {
                    params.append('roleName', filters.role);
                }
                if (filters.category) {
                     params.append('userCategory', filters.category);
                }
                if (filters.status) {
                    params.append('activity', filters.status.toUpperCase());
                }

                if (dateFilter) {
                    params.append('createdFrom', `${dateFilter.start}T00:00:00`);
                    params.append('createdTo', `${dateFilter.end}T23:59:59`);
                }
                
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/users?${params.toString()}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch users.");
                }

                const data = await response.json();
                
                if (!data.success || !data.data || !Array.isArray(data.data.content)) {
                    throw new Error(data.message || "Invalid data structure received.");
                }

                // FIX: Implemented logic to filter and only display users whose onboarding status is 'ONBOARDED'
                const filteredContent = data.data.content.filter((apiUser: any) => apiUser.status === 'ONBOARDED');

                const mappedUsers: UserData[] = filteredContent.map((apiUser: any) => ({
                    id: String(apiUser.id),
                    user: {
                        name: `${apiUser.firstName} ${apiUser.lastName}`,
                        email: apiUser.email,
                        avatar: apiUser.profilePictureUrl ? `${API_BASE_URL}${apiUser.profilePictureUrl}` : getShadowPlaceholder(apiUser.gender),
                        gender: apiUser.gender,
                    },
                    role: formatApiString(apiUser.roleName) as UserData['role'],
                    category: formatApiString(apiUser.userCategory) as UserData['category'] || 'Saver',
                    phone: formatPhoneNumber(apiUser.phoneNumber),
                    pinSet: apiUser.pinSet,
                    status: formatApiString(apiUser.activity) as UserData['status'] || 'Inactive',
                }));
                
                setUsers(mappedUsers);
                setTotalPages(data.data.totalPages);
                setTotalElements(data.data.totalElements);

            } catch (err: any) {
                 setError(err.message);
                 setUsers([]); 
                 setTotalPages(0);
                 setTotalElements(0);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentPage, itemsPerPage, debouncedSearchQuery, sortConfig, filters, dateFilter]);

    useEffect(() => {
        const fetchRoles = async () => {
            setRolesLoading(true);
            try {
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/roles`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch roles.");
                }
                const data = await response.json();
                if (data.success && data.data && Array.isArray(data.data.content)) {
                    const options = data.data.content.map((apiRole: ApiRole) => ({
                        label: formatApiString(apiRole.name),
                        value: apiRole.name, 
                    }));
                    setRoleOptions(options);
                } else {
                    throw new Error(data.message || "Invalid role data structure.");
                }
            } catch (err: any) {
                console.error("Error fetching roles:", err.message);
            } finally {
                setRolesLoading(false);
            }
        };
        fetchRoles();
    }, []);

    const requestSort = (key: SortableKeys) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
        }));
        setCurrentPage(1);
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const handleApplyDateFilter = (dates: { start: string; end: string }) => {
        setDateFilter(dates.start && dates.end ? dates : null);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({ role: '', category: '', status: '' });
        setSearchQuery('');
        setDebouncedSearchQuery('');
        setDateFilter(null);
        setCurrentPage(1);
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        const paginatedIds = users.map(u => u.id);
        if (event.target.checked) {
            const newSelectedIds = new Set([...selectedRows, ...paginatedIds]);
            setSelectedRows(Array.from(newSelectedIds));
        } else {
            setSelectedRows(selectedRows.filter(id => !paginatedIds.includes(id)));
        }
    };

    const handleRowSelect = (id: string) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
    };
    
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const params = new URLSearchParams();
            
            if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
            if (filters.status) params.append('status', filters.status.toUpperCase());
            if (filters.category) params.append('userCategory', filters.category);
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
            a.download = `Users_Report_${new Date().toISOString().split('T')[0]}.pdf`;
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

    const areAllOnPageSelected = users.length > 0 && users.every(id => selectedRows.includes(id.id));
    const areSomeOnPageSelected = users.some(id => selectedRows.includes(id.id));
    
    useEffect(() => {
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate = areSomeOnPageSelected && !areAllOnPageSelected;
        }
    }, [areSomeOnPageSelected, areAllOnPageSelected]);

    return (
        <div className="space-y-6">
            <DateFilterModal isOpen={isDateFilterOpen} onClose={() => setIsDateFilterOpen(false)} onApply={handleApplyDateFilter} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard 
                    title="Session" 
                    value={stats?.sessionCount || 0} 
                    change={stats?.sessionGrowth || 0} 
                    icon={<Users size={20} className="text-indigo-500"/>} 
                    color="bg-indigo-100" 
                    loading={statsLoading}
                 />
                 <StatCard 
                    title="Transacting Users" 
                    value={stats?.transactingUsersCount || 0} 
                    change={stats?.transactingUsersGrowth || 0} 
                    icon={<UserCheck size={20} className="text-red-500"/>} 
                    color="bg-red-100" 
                    loading={statsLoading}
                 />
                 <StatCard 
                    title="Active Users" 
                    value={stats?.activeUsersCount || 0} 
                    change={stats?.activeUsersGrowth || 0} 
                    icon={<TrendingUp size={20} className="text-green-500"/>} 
                    color="bg-green-100" 
                    loading={statsLoading}
                 />
                 <StatCard 
                    title="Inactive Users" 
                    value={stats?.pendingUsersCount || 0} 
                    change={stats?.pendingUsersGrowth || 0} 
                    icon={<UserX size={20} className="text-yellow-500"/>} 
                    color="bg-yellow-100" 
                    loading={statsLoading}
                 />
            </div>

            <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <select name="role" value={filters.role} onChange={handleFilterChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" disabled={rolesLoading}>
                        <option value="">Select Role</option>
                        {rolesLoading ? (
                            <option disabled>Loading roles...</option>
                        ) : (
                            roleOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))
                        )}
                    </select>
                     <select name="category" value={filters.category} onChange={handleFilterChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">Select Category</option>
                        {categoryOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                     <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">Select Status</option>
                        <option>Pending</option>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                    <button 
                        onClick={() => setIsDateFilterOpen(true)} 
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
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
                </div>
                
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>Show</span>
                        <select onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} value={itemsPerPage} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select>
                        <span>entries</span>
                    </div>
                    <div className="flex items-center space-x-2">
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
                        <button 
                            onClick={handleExport} 
                            disabled={isExporting}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                            <span>Export</span>
                        </button>
                        <button className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold hover:bg-primary-dark shadow-sm"><Plus size={16} /><span>Add New User</span></button>
                    </div>
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
                            {loading ? (
                                <TableSkeleton rows={itemsPerPage} />
                            ) : error ? (
                                <tr><td colSpan={8} className="text-center py-10 text-red-500">Error: {error}</td></tr>
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
                                                <button className="hover:text-red-600"><Trash2 size={18}/></button>
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
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersPage;